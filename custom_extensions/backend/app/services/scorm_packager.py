# custom_extensions/backend/app/services/scorm_packager.py
import io
import os
import re
import uuid
import json
import zipfile
import logging
import base64
import mimetypes
from typing import Any, Dict, List, Optional, Tuple
import pathlib

from fastapi import HTTPException

from app.core.database import get_connection
import httpx

# Reuse Jinja templates configured for PDF generation to produce HTML content
from app.services.pdf_generator import jinja_env
# Add helper from pdf_generator where needed
try:
    from app.services.pdf_generator import get_embedded_fonts_css
except Exception:
    def get_embedded_fonts_css() -> str:
        return ""

from app.services.pdf_generator import generate_slide_deck_pdf_with_dynamic_height

logger = logging.getLogger(__name__)


SCORM_2004_NS = {
    'imscp': 'http://www.imsglobal.org/xsd/imscp_v1p1',
    'adlcp': 'http://www.adlnet.org/xsd/adlcp_v1p3',
    'imsss': 'http://www.imsglobal.org/xsd/imsss',
    'adlseq': 'http://www.adlnet.org/xsd/adlseq_v1p3',
}


async def _load_training_plan_row(course_outline_id: int, user_id: str) -> Dict[str, Any]:
    async with get_connection() as connection:
        row = await connection.fetchrow(
            """
            SELECT p.*, p.project_name AS title, p.microproduct_name, dt.microproduct_type, dt.component_name
            FROM projects p
            LEFT JOIN design_templates dt ON p.design_template_id = dt.id
            WHERE p.id = $1 AND p.onyx_user_id = $2 AND dt.microproduct_type = 'Training Plan'
            """,
            course_outline_id, user_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Course outline not found")
        return dict(row)


async def _load_all_user_projects(user_id: str) -> List[Dict[str, Any]]:
    async with get_connection() as connection:
        rows = await connection.fetch(
            """
            SELECT p.*, dt.microproduct_type, dt.component_name
            FROM projects p
            LEFT JOIN design_templates dt ON p.design_template_id = dt.id
            WHERE p.onyx_user_id = $1
            ORDER BY p.created_at
            """,
            user_id,
        )
        return [dict(r) for r in rows]


def _map_item_type_to_microproduct(item_type: str) -> Optional[List[str]]:
    t = (item_type or '').strip().lower()
    if t in ('presentation',):
        return ['Slide Deck']
    if t in ('one-pager', 'onepager'):
        return ['One Pager', 'Text Presentation', 'PDF Lesson']
    if t in ('quiz',):
        return ['Quiz']
    return None


def _type_aliases_for_group(group_type: str) -> List[str]:
    g = (group_type or '').strip().lower()
    if g == 'slide deck':
        return ['slide deck', 'presentation', 'presentationdisplay', 'slidedeck']
    if g == 'one pager':
        return ['one pager', 'one-pager', 'onepager', 'text presentation', 'textpresentation', 'textpresentationdisplay', 'pdf lesson', 'pdflesson']
    if g == 'text presentation':
        return ['text presentation', 'textpresentation', 'textpresentationdisplay', 'one pager', 'one-pager', 'onepager']
    if g == 'pdf lesson':
        return ['pdf lesson', 'pdflesson', 'one pager', 'one-pager', 'onepager']
    if g == 'quiz':
        return ['quiz', 'quizdisplay']
    return [g]


def _project_type_matches(proj: Dict[str, Any], target_mtypes: List[str]) -> bool:
    proj_types = [
        (proj.get('microproduct_type') or '').strip().lower(),
        (proj.get('component_name') or '').strip().lower(),
    ]
    aliases: List[str] = []
    for t in target_mtypes or []:
        aliases.extend(_type_aliases_for_group(t))
    aliases_set = set(aliases)
    return any(pt in aliases_set for pt in proj_types if pt)


def _match_connected_product(projects: List[Dict[str, Any]], outline_name: str, lesson_title: str, desired_type: str, used_ids: set) -> Optional[Dict[str, Any]]:
    target_mtypes = _map_item_type_to_microproduct(desired_type)
    if not target_mtypes or not lesson_title:
        return None

    def is_unused(proj_id: Any) -> bool:
        return proj_id not in used_ids

    def pname(proj: Dict[str, Any]) -> str:
        return (proj.get('project_name') or '').strip()

    def mname(proj: Dict[str, Any]) -> str:
        return (proj.get('microproduct_name') or '').strip()

    # Pattern A (quizzes)
    if 'Quiz' in (target_mtypes or []):
        target_name = f"Quiz - {outline_name}: {lesson_title}"
        for proj in projects:
            if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
                if pname(proj) == target_name:
                    return dict(proj)

    # Pattern A2 (prefixed)
    type_prefix_map = {
        'Slide Deck': 'Presentation',
        'One Pager': 'One Pager',
        'Text Presentation': 'Text Presentation',
        'PDF Lesson': 'PDF Lesson'
    }
    prefixes = [type_prefix_map[t] for t in (target_mtypes or []) if t in type_prefix_map]
    for pref in prefixes:
        target_name_prefixed = f"{pref} - {outline_name}: {lesson_title}"
        for proj in projects:
            if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
                if pname(proj) == target_name_prefixed:
                    return dict(proj)

    # Pattern B: "{outline}: {lesson}"
    target_name = f"{outline_name}: {lesson_title}"
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if pname(proj) == target_name:
                return dict(proj)

    # Pattern C: microproduct_name equals lesson title
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if mname(proj) == lesson_title:
                return dict(proj)

    # Pattern E: project_name == outline AND microproduct_name == lesson
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if pname(proj) == outline_name and mname(proj) == lesson_title:
                return dict(proj)

    # Pattern D: project_name equals lesson title
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if pname(proj) == lesson_title:
                return dict(proj)

    return None


async def _load_product_content(product_id: int, user_id: str) -> Optional[Dict[str, Any]]:
    async with get_connection() as connection:
        row = await connection.fetchrow(
            "SELECT microproduct_content FROM projects WHERE id = $1 AND onyx_user_id = $2",
            product_id, user_id
        )
        if not row:
            return None
        content = row.get('microproduct_content')
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except Exception:
                pass
        return content


def _scorm_runtime_inline_js() -> str:
    # Minimal SCORM 2004 runtime discovery and lifecycle
    return (
        "<script>\n"
        "(function(){\n"
        "  function findAPI(win){\n"
        "    var tries=0; while(!win.API_1484_11 && win.parent && win.parent!=win){win=win.parent;if(++tries>10)break;}\n"
        "    return win.API_1484_11 || null;\n"
        "  }\n"
        "  var API=null;\n"
        "  function init(){ if(API) return; API=findAPI(window); try{ if(API){ API.Initialize(\"\"); }}catch(e){} }\n"
        "  function term(){ try{ if(API){ API.Commit(\"\"); API.Terminate(\"\"); }}catch(e){} }\n"
        "  window.addEventListener('load', function(){ init(); });\n"
        "  window.addEventListener('beforeunload', function(){ term(); });\n"
        "})();\n"
        "</script>"
    )


def _wrap_html_as_sco(title: str, body_html: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\"/>
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>
  <title>{title}</title>
  <style>body{{font-family:Arial,Helvetica,sans-serif;margin:0;padding:20px;background:#fff;color:#111;}} .container{{max-width:980px;margin:0 auto;}}</style>
  {_scorm_runtime_inline_js()}
</head>
<body>
  <div class=\"container\">
    {body_html}
  </div>
</body>
</html>
"""


def _render_onepager_html(product_row: Dict[str, Any], context: Any) -> str:
    # Try templates used for one-pager/text presentation
    candidates = [
        'text_presentation_pdf_template.html',
        'pdf_lesson_pdf_template.html'
    ]
    for tpl in candidates:
        try:
            template = jinja_env.get_template(tpl)
            # Determine wrapper context depending on template
            if tpl == 'pdf_lesson_pdf_template.html':
                wrapper_context = {
                    'details': {
                        'details': context if isinstance(context, dict) else {},
                        'parentProjectName': product_row.get('parent_project_name') or product_row.get('parentProjectName'),
                        'lessonNumber': product_row.get('lesson_number') or product_row.get('lessonNumber'),
                        'locale': {}
                    }
                }
            else:
                wrapper_context = {
                    'details': context if isinstance(context, dict) else {},
                    'locale': {}
                }
            html = template.render(**wrapper_context)
            title = product_row.get('project_name') or product_row.get('microproduct_name') or 'Lesson'
            return _wrap_html_as_sco(title, html)
        except Exception as e:
            logger.info(f"[SCORM] Template '{tpl}' failed for product {product_row.get('id')}: {e}")
            continue
    # Fallback minimal body
    body = f"<h1>{product_row.get('project_name') or 'Lesson'}</h1><p>Content unavailable for HTML export.</p>"
    return _wrap_html_as_sco('Lesson', body)


def _render_placeholder_html(title: str, text: str) -> str:
    return _wrap_html_as_sco(title, f"<h1>{title}</h1><p>{text}</p>")


async def _localize_images_to_assets(html: str, zip_file: zipfile.ZipFile, sco_dir: str) -> str:
    """Rewrite image references to local assets and add them into the ZIP under sco_dir/assets/.
    - Handles <img src> and CSS url()
    - Supports http/https, protocol-less //, /static_design_images, static_design_images and repo-absolute paths
    - Leaves data: URIs as-is
    Returns updated HTML.
    """
    try:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        static_images_abs_path = os.path.join(repo_root, 'static_design_images')
        assets_prefix_in_zip = f"{sco_dir}/assets"
        assets_href_prefix = "assets"  # relative from index.html

        img_src_pattern = re.compile(r'(<img[^>]+src=["\'])([^"\']+)(["\'])', re.IGNORECASE)
        css_url_pattern = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", re.IGNORECASE)

        urls: List[str] = []
        for m in img_src_pattern.finditer(html):
            urls.append(m.group(2))
        for m in css_url_pattern.finditer(html):
            urls.append(m.group(1))

        if not urls:
            return html

        # Unique preserve order
        seen = set()
        unique_urls: List[str] = []
        for u in urls:
            if u not in seen:
                seen.add(u)
                unique_urls.append(u)

        url_to_local: Dict[str, str] = {}
        asset_index = 1

        async def fetch_http(url: str) -> Optional[bytes]:
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200 and resp.content:
                        return resp.content
            except Exception as e:
                logger.info(f"[SCORM] HTTP image download failed for {url}: {e}")
            return None

        def guess_ext_from_url_or_type(u: str, content: Optional[bytes]) -> str:
            ext = ''
            # Try by URL
            parsed = pathlib.PurePosixPath(u)
            if parsed.suffix:
                ext = parsed.suffix
            if not ext:
                # Try by mimetype of URL
                mt = mimetypes.guess_type(u)[0]
                if mt:
                    gx = mimetypes.guess_extension(mt)
                    if gx:
                        ext = gx
            if not ext and content is not None:
                # Fallback generic
                ext = '.bin'
            if not ext:
                ext = '.bin'
            return ext

        async def convert_one(u: str):
            nonlocal asset_index
            if not u or u.startswith('data:'):
                return
            data: Optional[bytes] = None
            # Normalize protocol-less
            if u.startswith('//'):
                u_fetch = 'https:' + u
                data = await fetch_http(u_fetch)
            elif u.startswith('http://') or u.startswith('https://'):
                data = await fetch_http(u)
            elif u.startswith('/static_design_images/'):
                filename = u.replace('/static_design_images/', '')
                full_path = os.path.join(static_images_abs_path, filename)
                if os.path.exists(full_path):
                    try:
                        with open(full_path, 'rb') as f:
                            data = f.read()
                    except Exception as e:
                        logger.info(f"[SCORM] Read static image failed for {full_path}: {e}")
            elif u.startswith('static_design_images/'):
                filename = u.replace('static_design_images/', '')
                full_path = os.path.join(static_images_abs_path, filename)
                if os.path.exists(full_path):
                    try:
                        with open(full_path, 'rb') as f:
                            data = f.read()
                    except Exception as e:
                        logger.info(f"[SCORM] Read static image failed for {full_path}: {e}")
            elif u.startswith('/'):
                full_path = os.path.join(repo_root, u.lstrip('/'))
                if os.path.exists(full_path):
                    try:
                        with open(full_path, 'rb') as f:
                            data = f.read()
                    except Exception as e:
                        logger.info(f"[SCORM] Read repo image failed for {full_path}: {e}")
            # else: skip unknown relative paths (likely already local or not resolvable)

            if data is None:
                return

            ext = guess_ext_from_url_or_type(u, data)
            local_name = f"img_{asset_index}{ext}"
            asset_index += 1
            asset_zip_path = f"{assets_prefix_in_zip}/{local_name}"
            asset_href = f"{assets_href_prefix}/{local_name}"

            try:
                zip_file.writestr(asset_zip_path, data)
                url_to_local[u] = asset_href
            except Exception as e:
                logger.info(f"[SCORM] Write asset failed for {u}: {e}")

        # Download/copy in parallel
        await asyncio.gather(*(convert_one(u) for u in unique_urls))

        # Replace references
        def replace_img_src(match: re.Match) -> str:
            prefix, src, suffix = match.group(1), match.group(2), match.group(3)
            new_src = url_to_local.get(src, src)
            return f"{prefix}{new_src}{suffix}"

        def replace_css_url(match: re.Match) -> str:
            url = match.group(1)
            new_src = url_to_local.get(url, url)
            # Preserve as unquoted url()
            return f"url('{new_src}')"

        html = img_src_pattern.sub(replace_img_src, html)
        html = css_url_pattern.sub(replace_css_url, html)
        return html
    except Exception as e:
        logger.error(f"[SCORM] Error localizing images to assets: {e}")
        return html


async def _process_image_paths_in_html(html: str) -> str:
    """Inline images into HTML as data URIs.
    - Handles <img src> and CSS url() references
    - Supports:
      * data: URIs (left as is)
      * http/https URLs (downloaded and inlined)
      * protocol-less // URLs (assumed https)
      * /static_design_images/... (resolved to repo static_design_images)
      * static_design_images/... (relative path)
      * fallback: try resolving repo-root absolute path
    """
    try:
        import asyncio

        # Resolve static images directory
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        static_images_abs_path = os.path.join(repo_root, 'static_design_images')

        # Collect URLs from <img src> and CSS url()
        img_src_pattern = re.compile(r'(<img[^>]+src=["\'])([^"\']+)(["\'])', re.IGNORECASE)
        css_url_pattern = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", re.IGNORECASE)

        urls: List[str] = []
        for m in img_src_pattern.finditer(html):
            urls.append(m.group(2))
        for m in css_url_pattern.finditer(html):
            urls.append(m.group(1))

        if not urls:
            return html

        # Unique preserve order
        seen = set()
        unique_urls: List[str] = []
        for u in urls:
            if u not in seen:
                seen.add(u)
                unique_urls.append(u)

        url_to_data: Dict[str, str] = {}

        async def fetch_http(url: str) -> Optional[str]:
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200 and resp.content:
                        ctype = resp.headers.get('Content-Type') or mimetypes.guess_type(url)[0] or 'application/octet-stream'
                        b64 = base64.b64encode(resp.content).decode('ascii')
                        return f"data:{ctype};base64,{b64}"
            except Exception as e:
                logger.info(f"[SCORM] HTTP image inline failed for {url}: {e}")
            return None

        def read_file_to_data_uri(path: str) -> Optional[str]:
            try:
                if os.path.exists(path):
                    with open(path, 'rb') as f:
                        data = f.read()
                    ctype = mimetypes.guess_type(path)[0] or 'application/octet-stream'
                    b64 = base64.b64encode(data).decode('ascii')
                    return f"data:{ctype};base64,{b64}"
            except Exception as e:
                logger.info(f"[SCORM] File image inline failed for {path}: {e}")
            return None

        async def convert_one(u: str):
            if not u or u.startswith('data:'):
                return
            # Normalize protocol-less URLs
            if u.startswith('//'):
                normalized = 'https:' + u
                data_uri = await fetch_http(normalized)
                if data_uri:
                    url_to_data[u] = data_uri
                return
            # http(s)
            if u.startswith('http://') or u.startswith('https://'):
                data_uri = await fetch_http(u)
                if data_uri:
                    url_to_data[u] = data_uri
                return
            # Static images (absolute or relative)
            if u.startswith('/static_design_images/'):
                filename = u.replace('/static_design_images/', '')
                full_path = os.path.join(static_images_abs_path, filename)
                data_uri = read_file_to_data_uri(full_path)
                if data_uri:
                    url_to_data[u] = data_uri
                return
            if u.startswith('static_design_images/'):
                filename = u.replace('static_design_images/', '')
                full_path = os.path.join(static_images_abs_path, filename)
                data_uri = read_file_to_data_uri(full_path)
                if data_uri:
                    url_to_data[u] = data_uri
                return
            # Fallback: try repo-root absolute path
            if u.startswith('/'):
                full_path = os.path.join(repo_root, u.lstrip('/'))
                data_uri = read_file_to_data_uri(full_path)
                if data_uri:
                    url_to_data[u] = data_uri
                return
            # Otherwise: skip

        await asyncio.gather(*(convert_one(u) for u in unique_urls))

        # Replace in HTML
        def replace_img_src(match: re.Match) -> str:
            prefix, src, suffix = match.group(1), match.group(2), match.group(3)
            return f"{prefix}{url_to_data.get(src, src)}{suffix}"

        def replace_css_url(match: re.Match) -> str:
            url = match.group(1)
            inlined = url_to_data.get(url, url)
            # Preserve original quoting
            return f"url('{inlined}')"

        html = img_src_pattern.sub(replace_img_src, html)
        html = css_url_pattern.sub(replace_css_url, html)
        return html
    except Exception as e:
        logger.error(f"[SCORM] Error inlining images: {e}")
        return html


def _render_slide_deck_html(product_row: Dict[str, Any], content: Any) -> str:
    """Render slide deck HTML using the exact same approach as PDF generation"""
    try:
        template = jinja_env.get_template('single_slide_pdf_template.html')
        slides = content.get('slides', []) if isinstance(content, dict) else []
        
        if not slides:
            return _wrap_html_as_sco('Presentation', '<h1>No slides available</h1>')
        
        # Get theme from content or default to 'light'
        theme = content.get('theme', 'light')
        
        rendered_slides = []
        for slide in slides:
            # Use the exact same context structure as PDF generation
            context_data = {
                'slide': slide,
                'theme': theme,
                'slide_height': 800,  # Default height for SCORM
                'embedded_fonts_css': get_embedded_fonts_css()
            }
            
            # Render each slide with proper context
            slide_html = template.render(**context_data)
            rendered_slides.append(slide_html)
        
        # CSS for scrollable slide deck
        styles = """
<style>
  body { margin: 0; padding: 20px; background: #f5f5f5; font-family: 'Inter', Arial, sans-serif; }
  .slide-wrapper { max-width: 900px; margin: 0 auto; }
  .slide-page { 
    background: white; 
    margin-bottom: 30px; 
    padding: 40px; 
    border-radius: 8px; 
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    page-break-after: always;
    min-height: 600px;
  }
  .slide-page:last-child { margin-bottom: 0; }
  
  /* Ensure slide content displays properly */
  .slide-content { width: 100%; height: 100%; }
</style>
"""
        
        title = product_row.get('project_name') or product_row.get('microproduct_name') or 'Presentation'
        body = "<div class=\"slide-wrapper\">" + "".join([f"<div class=\"slide-page\">{s}</div>" for s in rendered_slides]) + "</div>"
        
        return _wrap_html_as_sco(title, styles + body)
        
    except Exception as e:
        logger.error(f"[SCORM] Error rendering slide deck: {e}")
        title = product_row.get('project_name') or 'Presentation'
        return _wrap_html_as_sco(title, f"<h1>{title}</h1><p>Error rendering presentation content.</p>")


def _render_quiz_html(product_row: Dict[str, Any], content: Any) -> str:
    """Render interactive quiz HTML matching the exact PDF template design"""
    quiz_data = content if isinstance(content, dict) else {}
    questions = quiz_data.get('questions', [])
    quiz_title = quiz_data.get('quizTitle', 'Quiz')
    
    if not questions:
        return _wrap_html_as_sco('Quiz', '<h1>No questions available</h1>')
    
    # Extract parent project info
    parent_project_name = product_row.get('parent_project_name') or product_row.get('parentProjectName')
    lesson_number = product_row.get('lesson_number') or product_row.get('lessonNumber')
    
    # Build the HTML structure exactly matching the PDF template
    html_parts = []
    
    # Add the exact CSS from the PDF template
    html_parts.append("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
        box-sizing: border-box;
    }

    body { 
        font-family: 'Inter', Arial, sans-serif; 
        font-size: 10pt; 
        line-height: 1.6;
        color: #4B4B4B;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }
    .quiz-container { 
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .quiz-title-section {
        border-bottom: 3px solid #2563eb;
        padding-bottom: 15px;
        margin-bottom: 30px;
    }
    .course-title {
        text-transform: uppercase;
        font-size: 1.125rem;
        font-weight: 500;
        color: black;
        margin: 0;
    }
    .course-label {
        color: #2563eb;
        font-weight: 700;
    }
    .quiz-title { 
        font-size: 1.875rem; 
        line-height: 2.25rem;
        font-weight: 700; 
        margin-top: 5px;
        margin-bottom: 0;
        text-transform: none;
        color: #1a1a1a;
    }
    .lesson-label {
        color: #2563eb;
        font-weight: 700;
    }
    
    .question-block { 
        margin-bottom: 25px; 
        page-break-inside: avoid;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #ffffff;
        transition: box-shadow 0.3s;
    }
    .question-block:hover {
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .question-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;
    }
    .question-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #2563eb;
        color: #fff;
        font-weight: 700;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-size: 12pt;
        margin-right: 15px;
        flex-shrink: 0;
    }
    .question-text { 
        font-weight: 600; 
        color: #2c3e50;
        font-size: 12pt;
        flex-grow: 1;
    }

    .options-list { 
        padding-left: 45px; 
        margin: 0;
        list-style-type: none;
    }
    .options-list li {
        margin-bottom: 10px;
        padding-left: 25px;
        position: relative;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background-color 0.2s;
    }
    .options-list li:hover {
        background-color: #f8f9fa;
    }
    .options-list li:before {
        content: attr(data-id) ".";
        position: absolute;
        left: 0;
        font-weight: 600;
        color: #34495e;
    }
    .options-list li.selected {
        background-color: #e3f2fd;
        border: 1px solid #2563eb;
    }

    .matching-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
    }
    .matching-table td {
        padding: 10px;
        vertical-align: top;
        border: 1px solid #eee;
    }
    .prompts-col {
        width: 50%;
        padding-right: 10px;
    }
    .options-col {
        width: 50%;
        padding-left: 10px;
    }
    .matching-table ul {
        list-style-type: none;
        padding-left: 0;
    }
    .matching-table li {
        margin-bottom: 5px;
    }

    .sorting-list {
        list-style-type: none;
        padding-left: 45px;
    }
    .sorting-list li {
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        cursor: move;
        position: relative;
        user-select: none;
    }
    .sorting-list li:hover {
        background: #e9ecef;
        border-color: #2563eb;
    }
    .sorting-list li.dragging {
        opacity: 0.5;
        transform: rotate(2deg);
    }
    .drag-handle {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
        font-weight: bold;
        cursor: grab;
    }
    .drag-handle:active {
        cursor: grabbing;
    }

    .open-answer-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        font-size: 12pt;
        margin-top: 10px;
    }

    .submit-button {
        margin-top: 30px;
        padding: 12px 24px;
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 12pt;
    }
    .submit-button:hover {
        background-color: #1d4ed8;
    }

    .result-section {
        margin-top: 20px;
        padding: 15px;
        border-radius: 8px;
        font-weight: 600;
        display: none;
    }
    .result-section.show {
        display: block;
    }
    .result-section.pass {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .result-section.fail {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .match-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 4px;
    }
    .match-prompt {
        flex: 1;
        font-weight: 600;
        margin-right: 15px;
    }
    .match-select {
        padding: 6px 10px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        background: white;
    }

    .explanation {
        margin-top: 12px;
        padding: 12px;
        background-color: #fffbe6;
        border-left: 4px solid #f1c40f;
        border-radius: 4px;
        font-style: italic;
        display: none;
    }
    .explanation.show {
        display: block;
    }
    .explanation strong {
        color: #c29d0b;
    }
</style>
""")

    # Quiz container start
    html_parts.append('<div class="quiz-container">')
    
    # Title section - exact match from PDF template
    html_parts.append('<div class="quiz-title-section">')
    if parent_project_name:
        html_parts.append(f'<h2 class="course-title"><span class="course-label">Course:</span> {parent_project_name}</h2>')
        title_html = '<h1 class="quiz-title">'
        if lesson_number:
            title_html += f'<span class="lesson-label">Lesson №{lesson_number}:</span> '
        title_html += f'{quiz_title}</h1>'
        html_parts.append(title_html)
    else:
        html_parts.append(f'<h1 class="quiz-title">{quiz_title}</h1>')
    html_parts.append('</div>')
    
    # Questions
    for i, question in enumerate(questions):
        question_num = i + 1
        question_type = question.get('question_type', '')
        question_text = question.get('question_text', '')
        
        html_parts.append('<div class="question-block">')
        html_parts.append('<div class="question-header">')
        html_parts.append(f'<span class="question-number">{question_num}</span>')
        html_parts.append(f'<div class="question-text">{question_text}</div>')
        html_parts.append('</div>')
        
        # Render question content based on type
        if question_type in ['multiple-choice', 'multi-select']:
            html_parts.append('<ul class="options-list">')
            options = question.get('options', [])
            for option in options:
                option_id = option.get('id', '')
                option_text = option.get('text', '')
                input_type = 'radio' if question_type == 'multiple-choice' else 'checkbox'
                html_parts.append(f'<li data-id="{option_id}" onclick="selectOption({question_num}, \'{option_id}\', \'{question_type}\')">{option_text}</li>')
            html_parts.append('</ul>')
            
        elif question_type == 'matching':
            prompts = question.get('prompts', [])
            options = question.get('options', [])
            
            html_parts.append('<div class="matching-section">')
            html_parts.append('<h4 style="font-weight: 600; margin-bottom: 10px;">Match the items:</h4>')
            for prompt in prompts:
                prompt_id = prompt.get('id', '')
                prompt_text = prompt.get('text', '')
                html_parts.append('<div class="match-row">')
                html_parts.append(f'<div class="match-prompt">{prompt_id}. {prompt_text}</div>')
                html_parts.append(f'<select class="match-select" id="match_{question_num}_{prompt_id}" onchange="updateMatch({question_num}, \'{prompt_id}\', this.value)">')
                html_parts.append('<option value="">Select...</option>')
                for option in options:
                    option_id = option.get('id', '')
                    option_text = option.get('text', '')
                    html_parts.append(f'<option value="{option_id}">{option_id}. {option_text}</option>')
                html_parts.append('</select>')
                html_parts.append('</div>')
            html_parts.append('</div>')
            
        elif question_type == 'sorting':
            items = question.get('items_to_sort', [])
            # Shuffle items for display
            import random
            shuffled_items = items.copy()
            random.shuffle(shuffled_items)
            
            html_parts.append('<div class="sorting-section">')
            html_parts.append('<h4 style="font-weight: 600; margin-bottom: 10px;">Drag to sort in correct order:</h4>')
            html_parts.append(f'<ul class="sorting-list sortable-container" id="sortable_{question_num}">')
            for item in shuffled_items:
                item_id = item.get('id', '')
                item_text = item.get('text', '')
                html_parts.append(f'<li class="sortable-item" data-id="{item_id}" draggable="true">{item_text}<span class="drag-handle">⋮⋮</span></li>')
            html_parts.append('</ul>')
            html_parts.append('</div>')
            
        elif question_type == 'open-answer':
            html_parts.append(f'<textarea class="open-answer-input" id="open_{question_num}" placeholder="Enter your answer here..."></textarea>')
        
        # Add explanation div (hidden initially)
        explanation = question.get('explanation', '')
        if explanation:
            html_parts.append(f'<div class="explanation" id="explanation_{question_num}"><strong>Explanation:</strong> {explanation}</div>')
        
        html_parts.append('</div>')  # Close question-block
    
    # Submit button and result section
    html_parts.append('<button class="submit-button" onclick="submitQuiz()">Submit Quiz</button>')
    html_parts.append('<div class="result-section" id="result-section"></div>')
    html_parts.append('</div>')  # Close quiz-container
    
    # Add JavaScript for interactivity
    js_code = """
<script>
    let userAnswers = {};
    let questions = __QUESTIONS_PLACEHOLDER__;
    let isSubmitted = false;
    
    function selectOption(questionNum, optionId, questionType) {{
        if (isSubmitted) return;
        
        const questionIndex = questionNum - 1;
        const listItems = document.querySelectorAll('.question-block:nth-child(' + (questionNum + 1) + ') .options-list li');
        
        if (questionType === 'multiple-choice') {{
            // Clear previous selections
            listItems.forEach(li => li.classList.remove('selected'));
            // Select current
            event.target.classList.add('selected');
            userAnswers[questionIndex] = optionId;
        }} else if (questionType === 'multi-select') {{
            if (!userAnswers[questionIndex]) userAnswers[questionIndex] = [];
            const currentAnswers = userAnswers[questionIndex];
            
            if (currentAnswers.includes(optionId)) {{
                // Deselect
                currentAnswers.splice(currentAnswers.indexOf(optionId), 1);
                event.target.classList.remove('selected');
            }} else {{
                // Select
                currentAnswers.push(optionId);
                event.target.classList.add('selected');
            }}
        }}
        
        // Update SCORM data
        if (typeof LMSSetValue !== 'undefined') {{
            LMSSetValue('cmi.interactions.' + questionIndex + '.student_response', JSON.stringify(userAnswers[questionIndex]));
        }}
    }}
    
    function updateMatch(questionNum, promptId, optionId) {{
        if (isSubmitted) return;
        
        const questionIndex = questionNum - 1;
        if (!userAnswers[questionIndex]) userAnswers[questionIndex] = {};
        userAnswers[questionIndex][promptId] = optionId;
        
        // Update SCORM data
        if (typeof LMSSetValue !== 'undefined') {{
            LMSSetValue('cmi.interactions.' + questionIndex + '.student_response', JSON.stringify(userAnswers[questionIndex]));
        }}
    }}
    
    function submitQuiz() {{
        if (isSubmitted) return;
        isSubmitted = true;
        
        // Calculate score
        let correct = 0;
        let total = questions.length;
        
        questions.forEach((question, index) => {{
            const userAnswer = userAnswers[index];
            let isCorrect = false;
            
            if (question.question_type === 'multiple-choice') {{
                isCorrect = userAnswer === question.correct_option_id;
            }} else if (question.question_type === 'multi-select') {{
                const correctIds = Array.isArray(question.correct_option_ids) 
                    ? question.correct_option_ids 
                    : question.correct_option_ids.split(',').filter(id => id.trim());
                const userIds = userAnswer || [];
                isCorrect = correctIds.every(id => userIds.includes(id)) && 
                           userIds.every(id => correctIds.includes(id));
            }} else if (question.question_type === 'matching') {{
                const correctMatches = question.correct_matches;
                isCorrect = Object.keys(correctMatches).every(promptId => 
                    userAnswer && userAnswer[promptId] === correctMatches[promptId]
                );
            }} else if (question.question_type === 'sorting') {{
                const correctOrder = question.correct_order;
                const userOrder = userAnswer || [];
                isCorrect = correctOrder.every((itemId, i) => userOrder[i] === itemId);
            }} else if (question.question_type === 'open-answer') {{
                const acceptableAnswers = question.acceptable_answers || [];
                isCorrect = acceptableAnswers.some(answer => 
                    answer.toLowerCase() === (userAnswer || '').toLowerCase()
                );
            }}
            
            if (isCorrect) correct++;
            
            // Show explanation if available
            const explanationDiv = document.getElementById('explanation_' + (index + 1));
            if (explanationDiv) {{
                explanationDiv.classList.add('show');
            }}
        }});
        
        const score = Math.round((correct / total) * 100);
        const passed = score >= 70;
        
        // Show results
        const resultSection = document.getElementById('result-section');
        resultSection.innerHTML = '<h3>Quiz Results</h3><p>Score: ' + score + '% (' + correct + '/' + total + ' correct)</p><p>Status: ' + (passed ? 'PASSED' : 'FAILED') + '</p>';
        resultSection.className = 'result-section show ' + (passed ? 'pass' : 'fail');
        
        // Update SCORM data
        if (typeof LMSSetValue !== 'undefined') {{
            LMSSetValue('cmi.score.scaled', (score / 100).toString());
            LMSSetValue('cmi.score.raw', score.toString());
            LMSSetValue('cmi.score.max', '100');
            LMSSetValue('cmi.success_status', passed ? 'passed' : 'failed');
            LMSSetValue('cmi.completion_status', 'completed');
            LMSCommit();
        }}
    }}
    
    // Initialize SCORM
    if (typeof LMSInitialize !== 'undefined') {{
        LMSInitialize();
    }}

    // Drag and drop functionality for sorting questions
    function initializeSorting() {
        const sortableContainers = document.querySelectorAll('.sortable-container');
        
        sortableContainers.forEach(container => {
            const items = container.querySelectorAll('.sortable-item');
            
            items.forEach(item => {
                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('dragover', handleDragOver);
                item.addEventListener('drop', handleDrop);
                item.addEventListener('dragend', handleDragEnd);
            });
        });
    }
    
    let draggedElement = null;
    
    function handleDragStart(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);
    }
    
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (draggedElement !== this) {
            const container = this.parentNode;
            const draggedIndex = Array.from(container.children).indexOf(draggedElement);
            const targetIndex = Array.from(container.children).indexOf(this);
            
            if (draggedIndex < targetIndex) {
                container.insertBefore(draggedElement, this.nextSibling);
            } else {
                container.insertBefore(draggedElement, this);
            }
            
            // Update user answer for this sorting question
            const questionNum = parseInt(container.id.replace('sortable_', ''));
            const questionIndex = questionNum - 1;
            const newOrder = Array.from(container.children).map(item => item.getAttribute('data-id'));
            userAnswers[questionIndex] = newOrder;
        }
        
        return false;
    }
    
    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedElement = null;
    }
    
    // Initialize sorting when page loads
    document.addEventListener('DOMContentLoaded', function() {
        initializeSorting();
    });
    
    // Also initialize when quiz loads (fallback)
    setTimeout(initializeSorting, 100);
</script>
"""
    js_code = js_code.replace("__QUESTIONS_PLACEHOLDER__", json.dumps(questions))

    final_html = ''.join(html_parts) + js_code
    title = product_row.get('project_name') or product_row.get('microproduct_name') or 'Quiz'
    return _wrap_html_as_sco(title, final_html)


def _manifest_header(course_identifier: str, course_title: str) -> str:
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"\
        f"<manifest identifier=\"{course_identifier}\" xmlns=\"{SCORM_2004_NS['imscp']}\" "
        f"xmlns:adlcp=\"{SCORM_2004_NS['adlcp']}\" xmlns:imsss=\"{SCORM_2004_NS['imsss']}\" xmlns:adlseq=\"{SCORM_2004_NS['adlseq']}\">"
        "<metadata><schema>ADL SCORM</schema><schemaversion>2004 4th Edition</schemaversion></metadata>"
        f"<organizations default=\"org-1\"><organization identifier=\"org-1\"><title>{_xml_escape(course_title)}</title>"
    )


def _xml_escape(s: Any) -> str:
    try:
        t = str(s)
        return (
            t.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;")
             .replace("'", "&apos;")
        )
    except Exception:
        return ""


def _manifest_footer(resources_xml: str) -> str:
    return f"</organization></organizations><resources>{resources_xml}</resources></manifest>"


def _manifest_items_xml(items: List[Dict[str, Any]]) -> str:
    # items: list of nodes with {'identifier','title', 'children': [...], optional 'res_id'}
    xml_parts: List[str] = []
    for it in items:
        identifier = it['identifier']
        title = _xml_escape(it.get('title') or '')
        res_id = it.get('res_id')
        if res_id:
            xml_parts.append(f"<item identifier=\"{identifier}\" identifierref=\"{res_id}\"><title>{title}</title>")
        else:
            xml_parts.append(f"<item identifier=\"{identifier}\"><title>{title}</title>")
        children = it.get('children') or []
        if children:
            xml_parts.append(_manifest_items_xml(children))
        xml_parts.append("</item>")
    return "".join(xml_parts)


def _build_manifest_hierarchy(course_title: str, org_items: List[Dict[str, Any]], resources_xml: str) -> str:
    course_identifier = f"course-{uuid.uuid4()}"
    header = _manifest_header(course_identifier, course_title)
    items_xml = _manifest_items_xml(org_items)
    footer = _manifest_footer(resources_xml)
    return header + items_xml + footer


def _parse_primary_list(raw_primary) -> List[Dict[str, Any]]:
    if raw_primary is None:
        return []
    if isinstance(raw_primary, list):
        out: List[Dict[str, Any]] = []
        for it in raw_primary:
            if isinstance(it, dict):
                out.append(it)
            elif isinstance(it, str):
                t = it.strip().strip('"').strip("'")
                out.append({"type": t})
        return out
    if isinstance(raw_primary, str):
        s = raw_primary.strip()
        try:
            if (s.startswith('[') and s.endswith(']')) or (s.startswith('{') and s.endswith('}')):
                parsed = json.loads(s)
                return _parse_primary_list(parsed)
        except Exception:
            pass
        s = s.strip('[]')
        parts = [p.strip().strip('"').strip("'") for p in s.split(',') if p.strip()]
        return [{"type": p} for p in parts if p]
    return []


def _parse_recommended_products_field(value) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v).strip().lower() for v in value if isinstance(v, (str,))]
    if isinstance(value, str):
        sv = value.strip()
        try:
            if sv.startswith('[') and sv.endswith(']'):
                arr = json.loads(sv)
                return [str(v).strip().lower() for v in arr if isinstance(v, (str,))]
        except Exception:
            pass
        sv = sv.strip('[]')
        return [p.strip().strip('"').strip("'").lower() for p in sv.split(',') if p.strip()]
    return []


def _infer_products_for_lesson(projects: List[Dict[str, Any]], outline_name: str, lesson_title: str, used_ids: set) -> List[Dict[str, Any]]:
    matches: List[Dict[str, Any]] = []
    if not lesson_title:
        return matches
    base_name = f"{outline_name}: {lesson_title}"
    prefixed_names = [
        f"Presentation - {outline_name}: {lesson_title}",
        f"Text Presentation - {outline_name}: {lesson_title}",
        f"One Pager - {outline_name}: {lesson_title}",
        f"PDF Lesson - {outline_name}: {lesson_title}",
        f"Quiz - {outline_name}: {lesson_title}",
    ]
    for proj in projects:
        pid = proj.get('id')
        if pid in used_ids:
            continue
        pname = (proj.get('project_name') or '').strip()
        mtype = (proj.get('microproduct_type') or '').strip().lower()
        if not pname or mtype in ('training plan',):
            continue
        if pname == base_name or pname in prefixed_names:
            matches.append(dict(proj))
    logger.info(f"[SCORM-MATCH] Inferred products for lesson='{lesson_title}': {[m.get('id') for m in matches]}")
    return matches


async def build_scorm_package_zip(course_outline_id: int, user_id: str) -> Tuple[str, bytes]:
    """
    Build a SCORM 2004 (4th Ed) package ZIP for the given course outline.
    Returns (filename, zip_bytes).
    """
    # Load course outline
    course = await _load_training_plan_row(course_outline_id, user_id)
    outline_name = course.get('project_name') or course.get('title') or 'Course'

    # Parse outline structure JSON to iterate lessons and recommended items
    stored = course.get('microproduct_content')
    if isinstance(stored, str):
        try:
            stored = json.loads(stored)
        except Exception as e:
            logger.error(f"[SCORM] Failed to parse outline JSON: {e}")
            stored = None
    if not isinstance(stored, dict):
        raise HTTPException(status_code=500, detail="Invalid training plan content")

    structure = json.loads(json.dumps(stored))  # deep copy
    main_title = structure.get('mainTitle') or course.get('microproduct_name') or outline_name or 'Course'

    # Fetch all user projects for matching
    all_projects = await _load_all_user_projects(user_id)
    try:
        types_count: Dict[str, int] = {}
        for p in all_projects:
            t1 = (p.get('microproduct_type') or '').strip().lower()
            t2 = (p.get('component_name') or '').strip().lower()
            key = t1 or t2 or 'unknown'
            types_count[key] = types_count.get(key, 0) + 1
        logger.info(f"[SCORM-MATCH] Projects for user={user_id} | total={len(all_projects)} | by_type={types_count}")
        if all_projects:
            sample = [
                {
                    'id': ap.get('id'),
                    'project_name': ap.get('project_name'),
                    'microproduct_name': ap.get('microproduct_name'),
                    'microproduct_type': ap.get('microproduct_type'),
                    'component_name': ap.get('component_name')
                }
                for ap in list(map(dict, all_projects))[:10]
            ]
            logger.info(f"[SCORM-MATCH] Sample projects (up to 10): {sample}")
    except Exception as _e:
        logger.info(f"[SCORM-MATCH] Failed to log project breakdown: {_e}")

    # Build in-memory ZIP
    zip_buffer = io.BytesIO()
    z = zipfile.ZipFile(zip_buffer, mode='w', compression=zipfile.ZIP_DEFLATED)

    # Collect SCO entries and hierarchical items
    sco_entries: List[Tuple[str, str]] = []
    used_ids: set = set()
    org_items: List[Dict[str, Any]] = []

    sections = structure.get('sections') or []

    for s_idx, section in enumerate(sections, start=1):
        if not isinstance(section, dict):
            continue
        lessons = section.get('lessons') or []
        section_title = (section.get('title') or f"Module {s_idx}").strip()
        sec_item = {
            'identifier': f"sec-{s_idx}-{uuid.uuid4().hex[:6]}",
            'title': section_title,
            'children': []
        }
        for l_idx, lesson in enumerate(lessons, start=1):
            if not isinstance(lesson, dict):
                continue
            lesson_title = (lesson.get('title') or f"Lesson {l_idx}").strip()
            recs = lesson.get('recommended_content_types') or {}
            raw_primary = recs.get('primary')
            logger.info(f"[SCORM] Lesson '{lesson_title}' primary(raw)={raw_primary}")
            primary = _parse_primary_list(raw_primary)
            logger.info(f"[SCORM] Lesson '{lesson_title}' primary(normalized)={primary}")
            if not primary:
                rp = lesson.get('recommendedProducts') or lesson.get('recommended_products')
                rp_list = _parse_recommended_products_field(rp)
                logger.info(f"[SCORM] Lesson '{lesson_title}' fallback recommendedProducts={rp_list}")
                if rp_list:
                    primary = [{"type": t} for t in rp_list if t in ("presentation","one-pager","onepager","quiz","video-lesson")]
            if not primary:
                inferred = _infer_products_for_lesson([dict(p) for p in all_projects], outline_name, lesson_title, used_ids)
                if inferred:
                    inferred_items: List[Dict[str, Any]] = []
                    for inf in inferred:
                        mt = (inf.get('microproduct_type') or '').strip().lower()
                        if mt in ('slide deck',):
                            inferred_items.append({'type': 'presentation'})
                        elif mt in ('text presentation', 'pdf lesson', 'one pager'):
                            inferred_items.append({'type': 'onepager'})
                        elif mt in ('quiz',):
                            inferred_items.append({'type': 'quiz'})
                    primary = inferred_items
                    logger.info(f"[SCORM] Inferred primary for lesson '{lesson_title}': {primary}")

            lesson_item = {
                'identifier': f"les-{s_idx}-{l_idx}-{uuid.uuid4().hex[:6]}",
                'title': lesson_title,
                'children': []
            }

            normalized: List[Dict[str, Any]] = []
            for it in primary or []:
                if isinstance(it, dict):
                    normalized.append(it)
                elif isinstance(it, str):
                    normalized.append({'type': it})

            for item in normalized:
                item_type_raw = (item.get('type') or '').strip().lower()
                logger.info(f"[SCORM] Processing item type='{item_type_raw}' for lesson='{lesson_title}'")
                if not item_type_raw:
                    continue
                matched = _match_connected_product(all_projects, outline_name, lesson_title, item_type_raw, used_ids)
                logger.info(f"[SCORM] Match result for lesson='{lesson_title}' type='{item_type_raw}' => matched_id={(matched or {}).get('id') if isinstance(matched, dict) else None}")
                if not matched:
                    continue
                product_id = matched['id']
                used_ids.add(product_id)

                # Render product to HTML
                mtype = (matched.get('microproduct_type') or '').strip().lower()
                comp = (matched.get('component_name') or '').strip().lower()
                try:
                    content = await _load_product_content(product_id, user_id)
                except Exception as e:
                    logger.warning(f"[SCORM] Failed to load product content id={product_id}: {e}")
                    content = None

                title_for_sco = matched.get('project_name') or matched.get('microproduct_name') or lesson_title or 'Lesson'

                if any(t in (mtype, comp) for t in ['pdf lesson', 'pdflesson', 'text presentation', 'textpresentation', 'one pager', 'one-pager', 'onepager']):
                    body_html = _render_onepager_html(matched, content if isinstance(content, dict) else {})
                elif any(t in (mtype, comp) for t in ['slide deck', 'presentation', 'slidedeck', 'presentationdisplay']):
                    # Render as HTML using the same template as PDFs and inline images
                    content_dict = content if isinstance(content, dict) else {}
                    body_html = _render_slide_deck_html(matched, content_dict)
                    body_html = await _localize_images_to_assets(body_html, z, f"sco_{product_id}")
                elif any(t in (mtype, comp) for t in ['quiz', 'quizdisplay']):
                    body_html = _render_quiz_html(matched, content if isinstance(content, dict) else {})
                else:
                    continue

                # Write SCO HTML into package
                sco_dir = f"sco_{product_id}"
                href = f"{sco_dir}/index.html"
                res_id = f"res-{product_id}"
                # Write as HTML for all types now
                z.writestr(href, body_html)
                sco_entries.append((res_id, href))

                # Add leaf item under lesson
                lesson_item['children'].append({
                    'identifier': f"itm-{product_id}",
                    'title': title_for_sco,
                    'res_id': res_id,
                })

            # Only add lesson if it has children
            if lesson_item['children']:
                sec_item['children'].append(lesson_item)

        # Only add section if it has lessons
        if sec_item['children']:
            org_items.append(sec_item)

    # Build resources XML
    resources_xml_parts: List[str] = []
    for res_id, href in sco_entries:
        resources_xml_parts.append(
            f"<resource identifier=\"{res_id}\" type=\"webcontent\" adlcp:scormType=\"sco\" href=\"{_xml_escape(href)}\"><file href=\"{_xml_escape(href)}\"/></resource>"
        )
    resources_xml = "".join(resources_xml_parts)

    # Build manifest with hierarchy
    manifest_xml = _build_manifest_hierarchy(main_title, org_items, resources_xml)
    z.writestr("imsmanifest.xml", manifest_xml)

    z.close()
    zip_bytes = zip_buffer.getvalue()
    filename = f"{re.sub(r'[^A-Za-z0-9_-]+', '_', main_title) or 'course'}_scorm2004.zip"
    return filename, zip_bytes 