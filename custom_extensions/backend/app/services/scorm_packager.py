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
import html
import asyncio
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
        logger.info(f"[SCORM-MATCH] No target types for desired_type='{desired_type}' or no lesson_title")
        return None

    def is_unused(proj_id: Any) -> bool:
        return proj_id not in used_ids

    def pname(proj: Dict[str, Any]) -> str:
        return (proj.get('project_name') or '').strip()

    def mname(proj: Dict[str, Any]) -> str:
        return (proj.get('microproduct_name') or '').strip()

    # Log available candidates for this type
    candidates = [p for p in projects if _project_type_matches(p, target_mtypes) and is_unused(p.get('id'))]
    logger.info(f"[SCORM-MATCH] Looking for type='{desired_type}' (mtypes={target_mtypes}) for lesson='{lesson_title}' | {len(candidates)} unused candidates")
    if candidates and len(candidates) <= 5:
        for c in candidates:
            logger.info(f"[SCORM-MATCH]   Candidate: id={c.get('id')}, pname='{pname(c)}', mname='{mname(c)}', type={c.get('microproduct_type')}")

    # Pattern A (quizzes)
    if 'Quiz' in (target_mtypes or []):
        target_name = f"Quiz - {outline_name}: {lesson_title}"
        for proj in projects:
            if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
                if pname(proj) == target_name:
                    logger.info(f"[SCORM-MATCH] ✓ Matched Pattern A (Quiz) id={proj.get('id')}")
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
                    logger.info(f"[SCORM-MATCH] ✓ Matched Pattern A2 (Prefixed) id={proj.get('id')}, pattern='{target_name_prefixed}'")
                    return dict(proj)

    # Pattern B: "{outline}: {lesson}"
    target_name = f"{outline_name}: {lesson_title}"
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if pname(proj) == target_name:
                logger.info(f"[SCORM-MATCH] ✓ Matched Pattern B (Outline:Lesson) id={proj.get('id')}")
                return dict(proj)

    # Pattern C: microproduct_name equals lesson title
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if mname(proj) == lesson_title:
                logger.info(f"[SCORM-MATCH] ✓ Matched Pattern C (mname==lesson) id={proj.get('id')}")
                return dict(proj)

    # Pattern E: project_name == outline AND microproduct_name == lesson
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if pname(proj) == outline_name and mname(proj) == lesson_title:
                logger.info(f"[SCORM-MATCH] ✓ Matched Pattern E (pname==outline AND mname==lesson) id={proj.get('id')}")
                return dict(proj)

    # Pattern D: project_name equals lesson title
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            if pname(proj) == lesson_title:
                logger.info(f"[SCORM-MATCH] ✓ Matched Pattern D (pname==lesson) id={proj.get('id')}")
                return dict(proj)

    # Pattern F (NEW): Fuzzy match - project_name contains lesson title
    for proj in projects:
        if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
            pn = pname(proj).lower()
            lt = lesson_title.lower()
            if lt in pn or pn in lt:
                logger.info(f"[SCORM-MATCH] ✓ Matched Pattern F (Fuzzy) id={proj.get('id')}, pname='{pname(proj)}'")
                return dict(proj)

    logger.warning(f"[SCORM-MATCH] ✗ No match found for type='{desired_type}' lesson='{lesson_title}' outline='{outline_name}'")
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


def _extract_head_body(rendered_html: str) -> Tuple[str, str]:
    """Extract <head> and <body> inner HTML from a full HTML document string.
    Returns (head_inner_html, body_inner_html). Falls back gracefully if tags not found."""
    try:
        lower = rendered_html.lower()
        h_start = lower.find('<head')
        if h_start != -1:
            h_start = lower.find('>', h_start) + 1
            h_end = lower.find('</head>', h_start)
        else:
            h_start = h_end = -1
        b_start = lower.find('<body')
        if b_start != -1:
            b_start = lower.find('>', b_start) + 1
            b_end = lower.find('</body>', b_start)
        else:
            b_start = b_end = -1
        head_inner = rendered_html[h_start:h_end] if h_start != -1 and h_end != -1 else ''
        body_inner = rendered_html[b_start:b_end] if b_start != -1 and b_end != -1 else rendered_html
        return head_inner, body_inner
    except Exception:
        return '', rendered_html


def _extract_style_blocks(head_inner: str) -> str:
    """Return concatenated <style>...</style> blocks from head to inject into body."""
    try:
        styles: List[str] = []
        for m in re.finditer(r'<style[^>]*>.*?</style>', head_inner, flags=re.IGNORECASE | re.DOTALL):
            styles.append(m.group(0))
        return "".join(styles)
    except Exception:
        return ''


def _find_repo_root_with_static_images() -> str:
    """Walk up from this file to find a directory that contains `static_design_images`.
    Fallback to three-levels-up if not found."""
    try:
        current = pathlib.Path(__file__).resolve()
        for p in [current.parent] + list(current.parents):
            candidate = p / 'static_design_images'
            if candidate.exists() and candidate.is_dir():
                logger.info(f"[SCORM-ASSETS] Using repo root '{p}' (found static_design_images)")
                return str(p)
        fallback = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        logger.warning(f"[SCORM-ASSETS] static_design_images not found by walking parents; falling back to '{fallback}'")
        return fallback
    except Exception as e:
        fallback = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        logger.error(f"[SCORM-ASSETS] Error resolving repo root: {e}; fallback '{fallback}'")
        return fallback


async def _localize_images_to_assets(html: str, zip_file: zipfile.ZipFile, sco_dir: str) -> str:
    """Rewrite image references to local assets and add them into the ZIP under sco_dir/assets/.
    - Handles <img src>, CSS url(), and inline style background-image
    - Supports http/https, protocol-less //, /static_design_images, static_design_images, and repo-absolute paths
    - Skips non-image resources (e.g., Google Fonts CSS)
    Returns updated HTML.
    """
    try:
        repo_root = _find_repo_root_with_static_images()
        static_images_abs_path = os.path.join(repo_root, 'static_design_images')
        assets_prefix_in_zip = f"{sco_dir}/assets"
        assets_href_prefix = "assets"

        logger.info(f"[SCORM-ASSETS] Starting image localization for {sco_dir}")
        logger.info(f"[SCORM-ASSETS] Repo root: {repo_root}")
        logger.info(f"[SCORM-ASSETS] Static images path: {static_images_abs_path}")
        logger.info(f"[SCORM-ASSETS] HTML length: {len(html)} characters")

        img_src_pattern = re.compile(r'(<img[^>]+src=["\'])([^"\']+)(["\'][^>]*>)', re.IGNORECASE)
        css_url_pattern = re.compile(r"(url\(\s*['\"]?)([^'\")]+)(['\"]?\s*\))", re.IGNORECASE)
        style_bg_pattern = re.compile(r'(background-image\s*:\s*url\(\s*[\'\"]?)([^\'\")]+)([\'\"]?\s*\))', re.IGNORECASE)

        urls: List[str] = []
        img_matches = list(img_src_pattern.finditer(html))
        css_matches = list(css_url_pattern.finditer(html))
        style_matches = list(style_bg_pattern.finditer(html))
        logger.info(f"[SCORM-ASSETS] Found {len(img_matches)} <img> tags, {len(css_matches)} CSS url() references, {len(style_matches)} style background-image references")

        for m in img_matches:
            urls.append(m.group(2))
        for m in css_matches:
            urls.append(m.group(2))
        for m in style_matches:
            urls.append(m.group(2))

        if not urls:
            logger.info(f"[SCORM-ASSETS] No image URLs found in HTML for {sco_dir}")
            return html

        seen = set()
        unique_urls: List[str] = []
        for u in urls:
            if u not in seen:
                seen.add(u)
                unique_urls.append(u)

        logger.info(f"[SCORM-ASSETS] Found {len(unique_urls)} unique image URLs for {sco_dir}: {unique_urls}")

        url_to_local: Dict[str, str] = {}
        asset_index = 1
        embedded_count = 0
        failed_count = 0

        async def fetch_http(url: str) -> Optional[bytes]:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200 and resp.content:
                        return resp.content
            except Exception as e:
                logger.warning(f"[SCORM-ASSETS] HTTP fetch failed for {url}: {e}")
            return None

        def is_non_image_resource(u: str) -> bool:
            lu = u.lower()
            if 'fonts.googleapis.com' in lu or lu.endswith('.css'):
                return True
            return False

        def has_valid_header(data: bytes) -> bool:
            return (
                data.startswith(b'\xff\xd8\xff') or
                data.startswith(b'\x89PNG') or
                data.startswith(b'GIF87a') or
                data.startswith(b'GIF89a') or
                data.startswith(b'<svg') or
                data.startswith(b'RIFF')
            )

        def guess_ext(u: str, data: Optional[bytes]) -> str:
            parsed = pathlib.PurePosixPath(u)
            if parsed.suffix:
                return parsed.suffix.lower()
            if data:
                if data.startswith(b'\xff\xd8\xff'):
                    return '.jpg'
                if data.startswith(b'\x89PNG'):
                    return '.png'
                if data.startswith(b'GIF'):
                    return '.gif'
                if data.startswith(b'<svg'):
                    return '.svg'
                if data.startswith(b'RIFF'):
                    return '.webp'
            return '.jpg'

        async def process_one(u: str):
            nonlocal asset_index, embedded_count, failed_count
            if not u or u.startswith('data:'):
                return
            if is_non_image_resource(u):
                logger.info(f"[SCORM-ASSETS] Skipping non-image resource: {u}")
                return

            data: Optional[bytes] = None
            source = 'unknown'
            try:
                if u.startswith('//'):
                    data = await fetch_http('https:' + u)
                    source = 'protocol-relative'
                elif u.startswith('http://') or u.startswith('https://'):
                    data = await fetch_http(u)
                    source = 'absolute-http'
                elif u.startswith('/static_design_images/'):
                    path = os.path.join(static_images_abs_path, u.replace('/static_design_images/', ''))
                    if os.path.exists(path):
                        with open(path, 'rb') as f:
                            data = f.read()
                        source = 'static-design-images'
                    else:
                        logger.warning(f"[SCORM-ASSETS] Static image not found: {path}")
                elif u.startswith('static_design_images/'):
                    path = os.path.join(static_images_abs_path, u.replace('static_design_images/', ''))
                    if os.path.exists(path):
                        with open(path, 'rb') as f:
                            data = f.read()
                        source = 'static-design-images-relative'
                    else:
                        logger.warning(f"[SCORM-ASSETS] Static image not found (relative): {path}")
                elif u.startswith('/'):
                    path = os.path.join(repo_root, u.lstrip('/'))
                    if os.path.exists(path):
                        with open(path, 'rb') as f:
                            data = f.read()
                        source = 'repo-absolute'
                    else:
                        logger.warning(f"[SCORM-ASSETS] Repo image not found: {path}")
                else:
                    logger.warning(f"[SCORM-ASSETS] Unrecognized URL format: {u}")
            except Exception as e:
                logger.error(f"[SCORM-ASSETS] Error reading image {u}: {e}")

            if not data:
                failed_count += 1
                return
            if len(data) < 1024 or not has_valid_header(data):
                logger.warning(f"[SCORM-ASSETS] Invalid image data for {u}: size={len(data)}")
                failed_count += 1
                return

            ext = guess_ext(u, data)
            local_name = f"img_{asset_index:03d}{ext}"
            asset_index += 1
            asset_zip_path = f"{assets_prefix_in_zip}/{local_name}"
            asset_href = f"{assets_href_prefix}/{local_name}"

            try:
                zip_file.writestr(asset_zip_path, data)
                url_to_local[u] = asset_href
                embedded_count += 1
                logger.info(f"[SCORM-ASSETS] ✅ Embedded {u} ({source}) as {local_name} -> {asset_zip_path}")
            except Exception as e:
                logger.error(f"[SCORM-ASSETS] Failed to write asset for {u}: {e}")
                failed_count += 1

        await asyncio.gather(*(process_one(u) for u in unique_urls))
        logger.info(f"[SCORM-ASSETS] Image processing complete for {sco_dir}: {embedded_count} embedded, {failed_count} failed out of {len(unique_urls)} total")

        def repl_img(m: re.Match) -> str:
            prefix, src, suffix = m.group(1), m.group(2), m.group(3)
            return f"{prefix}{url_to_local.get(src, src)}{suffix}"

        def repl_css(m: re.Match) -> str:
            prefix, src, suffix = m.group(1), m.group(2), m.group(3)
            return f"{prefix}{url_to_local.get(src, src)}{suffix}"

        html = img_src_pattern.sub(repl_img, html)
        html = css_url_pattern.sub(repl_css, html)
        html = style_bg_pattern.sub(repl_css, html)
        return html

    except Exception as e:
        logger.error(f"[SCORM-ASSETS] Error localizing images: {e}")
        return html


def _render_slide_deck_html(product_row: Dict[str, Any], content: Any) -> str:
    """Render slide deck HTML using the exact PDF slide template, stacked, and ready for SCORM asset localization."""
    try:
        # Extract version first to determine which template to use
        effective_version = None
        try:
            if isinstance(content, dict):
                effective_version = content.get('templateVersion') or (content.get('metadata') or {}).get('templateVersion')
        except Exception:
            effective_version = None
        
        logger.info(f"🔍 SCORM VERSION CHECK - product_id={product_row.get('id')}, templateVersion={effective_version}")
        
        # Select template based on version (matching PDF generation logic)
        # Use old template for legacy decks (no version or version < 'v2')
        if not effective_version or effective_version < 'v2':
            template_file = "single_slide_pdf_template_old.html"
            logger.info(f"📄 SCORM TEMPLATE SELECTION: Using LEGACY template for version: {effective_version}")
        else:
            template_file = "single_slide_pdf_template.html"
            logger.info(f"📄 SCORM TEMPLATE SELECTION: Using V2 template for version: {effective_version}")
        
        template = jinja_env.get_template(template_file)
        
        slides = content.get('slides', []) if isinstance(content, dict) else []
        if not slides:
            return _wrap_html_as_sco('Presentation', '<h1>No slides available</h1>')

        logger.info(f"✅ SCORM RENDERING - slides_count={len(slides)}")

        # Theme and dimensions consistent with PDF rendering
        theme = content.get('theme', 'dark-purple')
        slide_height = content.get('slide_height', 800)
        embedded_fonts_css = get_embedded_fonts_css()

        injected_styles = ''
        stacked_bodies: List[str] = []

        # NOTE: Template selection is version-aware (above)
        # Each template (single_slide_pdf_template.html vs _old.html) has the same theme class names
        # but with different CSS variable values (e.g., .theme-dark-purple has different colors in each template)
        # Therefore, template selection handles color differences - no theme name mapping needed
        
        logger.info(f"🎨 SCORM THEME - Using theme: {theme} with {'V1 OLD' if (not effective_version or effective_version < 'v2') else 'V2 NEW'} template")

        for idx, raw_slide in enumerate(slides):
            slide = raw_slide
            rendered = template.render(
                slide=slide,
                theme=theme,
                slide_height=slide_height,
                embedded_fonts_css=embedded_fonts_css,
            )
            head_inner, body_inner = _extract_head_body(rendered)
            if idx == 0:
                # Capture all <style> blocks from head of first render
                injected_styles = _extract_style_blocks(head_inner)
                if not injected_styles and embedded_fonts_css:
                    injected_styles = f"<style>\n{embedded_fonts_css}\n</style>"
            stacked_bodies.append(body_inner)

        title = product_row.get('project_name') or product_row.get('microproduct_name') or 'Presentation'
        # Inject styles at the top of body for SCORM wrapper
        # Min height of 660px ensures 16:9 aspect ratio (1174px width / 16 * 9 = 660px)
        # This matches PDF generation approach: minimum aspect ratio but no maximum
        scorm_overrides = """
<style>
  /* SCORM overrides to match PDF dynamic heights and spacing */
  .slide-page { 
    width: 1174px;
    height: auto !important; 
    min-height: 660px !important; /* 16:9 aspect ratio minimum (1174 / 16 * 9) */
    max-height: none !important; /* No maximum - can grow as needed */
    margin: 0 auto 32px auto !important; 
    display: block; 
    background: transparent; 
  }
  .slide-page:last-child { margin-bottom: 0 !important; }
  .slide-content { 
    height: auto !important; 
    min-height: 660px !important; /* Ensure content respects 16:9 minimum */
  }
</style>
"""
        body_html = scorm_overrides + (injected_styles or '') + "".join(stacked_bodies)
        return _wrap_html_as_sco(title, body_html)

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
            
            # Track which product types have been added to prevent duplicates
            added_types_for_lesson: set = set()

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

                type_label = None
                if any(t in (mtype, comp) for t in ['pdf lesson', 'pdflesson', 'text presentation', 'textpresentation', 'one pager', 'one-pager', 'onepager']):
                    type_label = 'Onepager'
                    added_types_for_lesson.add('onepager')
                    body_html = _render_onepager_html(matched, content if isinstance(content, dict) else {})
                    logger.info(f"[SCORM] Rendered one-pager HTML for product_id={product_id}, length={len(body_html)}")
                elif any(t in (mtype, comp) for t in ['slide deck', 'presentation', 'slidedeck', 'presentationdisplay']):
                    # Render as HTML using the same template as PDFs and inline images
                    content_dict = content if isinstance(content, dict) else {}
                    body_html = _render_slide_deck_html(matched, content_dict)
                    type_label = 'Presentation'
                    added_types_for_lesson.add('presentation')
                    logger.info(f"[SCORM] Rendered slide deck HTML for product_id={product_id}, length={len(body_html)}")
                elif any(t in (mtype, comp) for t in ['quiz', 'quizdisplay']):
                    body_html = _render_quiz_html(matched, content if isinstance(content, dict) else {})
                    type_label = 'Quiz'
                    added_types_for_lesson.add('quiz')
                    logger.info(f"[SCORM] Rendered quiz HTML for product_id={product_id}, length={len(body_html)}")
                else:
                    continue

                # Localize images for ALL product types
                sco_dir = f"sco_{product_id}"
                logger.info(f"[SCORM] Starting image localization for product_id={product_id}, sco_dir={sco_dir}")
                
                # Show a sample of the HTML to see what images are included
                html_sample = body_html[:1000] + "..." if len(body_html) > 1000 else body_html
                logger.debug(f"[SCORM] HTML sample for product_id={product_id}: {html_sample}")
                
                body_html = await _localize_images_to_assets(body_html, z, sco_dir)
                logger.info(f"[SCORM] Completed image localization for product_id={product_id}, final HTML length={len(body_html)}")

                # Write SCO HTML into package
                href = f"{sco_dir}/index.html"
                res_id = f"res-{(type_label or 'sco').lower()}-{product_id}"
                # Write as HTML for all types now
                z.writestr(href, body_html)
                logger.info(f"[SCORM] Written SCO HTML to {href}")
                sco_entries.append((res_id, href))

                # Add leaf item under lesson
                lesson_item['children'].append({
                    'identifier': f"itm-{product_id}",
                    'title': (type_label or title_for_sco),
                    'res_id': res_id,
                })

            # NEW: Also try to find and include any additional products for this lesson
            # that weren't explicitly listed in the primary content types
            logger.info(f"[SCORM] Looking for additional unlisted products for lesson='{lesson_title}'")
            additional_products = _infer_products_for_lesson([dict(p) for p in all_projects], outline_name, lesson_title, used_ids)
            
            # Group additional products by type and keep only the newest of each type
            products_by_type: Dict[str, List[Dict[str, Any]]] = {}
            for prod in additional_products:
                mtype = (prod.get('microproduct_type') or '').strip().lower()
                comp = (prod.get('component_name') or '').strip().lower()
                
                # Determine the type category
                if any(t in (mtype, comp) for t in ['pdf lesson', 'pdflesson', 'text presentation', 'textpresentation', 'one pager', 'one-pager', 'onepager']):
                    type_key = 'onepager'
                elif any(t in (mtype, comp) for t in ['slide deck', 'presentation', 'slidedeck', 'presentationdisplay']):
                    type_key = 'presentation'
                elif any(t in (mtype, comp) for t in ['quiz', 'quizdisplay']):
                    type_key = 'quiz'
                else:
                    continue
                
                # Skip if this type was already added from the primary list
                if type_key in added_types_for_lesson:
                    logger.info(f"[SCORM] Skipping additional product id={prod.get('id')} type={type_key} - already have one from primary list")
                    continue
                
                if type_key not in products_by_type:
                    products_by_type[type_key] = []
                products_by_type[type_key].append(prod)
            
            # For each type, keep only the newest product (highest ID = most recent)
            for type_key, prods in products_by_type.items():
                if not prods:
                    continue
                
                # Sort by ID descending (newest first)
                prods.sort(key=lambda p: p.get('id', 0), reverse=True)
                newest = prods[0]
                
                if len(prods) > 1:
                    logger.info(f"[SCORM] Found {len(prods)} products of type '{type_key}' for lesson='{lesson_title}', keeping newest id={newest.get('id')}")
                
                additional_match = newest
                product_id = additional_match['id']
                if product_id in used_ids:
                    continue  # Already processed
                
                logger.info(f"[SCORM] Found additional product id={product_id} for lesson='{lesson_title}' (not in primary list)")
                used_ids.add(product_id)

                # Render product to HTML
                mtype = (additional_match.get('microproduct_type') or '').strip().lower()
                comp = (additional_match.get('component_name') or '').strip().lower()
                try:
                    content = await _load_product_content(product_id, user_id)
                except Exception as e:
                    logger.warning(f"[SCORM] Failed to load product content id={product_id}: {e}")
                    content = None

                title_for_sco = additional_match.get('project_name') or additional_match.get('microproduct_name') or lesson_title or 'Lesson'

                type_label = None
                if any(t in (mtype, comp) for t in ['pdf lesson', 'pdflesson', 'text presentation', 'textpresentation', 'one pager', 'one-pager', 'onepager']):
                    type_label = 'Onepager'
                    added_types_for_lesson.add('onepager')
                    body_html = _render_onepager_html(additional_match, content if isinstance(content, dict) else {})
                    logger.info(f"[SCORM] Rendered one-pager HTML for product_id={product_id}, length={len(body_html)}")
                elif any(t in (mtype, comp) for t in ['slide deck', 'presentation', 'slidedeck', 'presentationdisplay']):
                    # Render as HTML using the same template as PDFs and inline images
                    content_dict = content if isinstance(content, dict) else {}
                    body_html = _render_slide_deck_html(additional_match, content_dict)
                    type_label = 'Presentation'
                    added_types_for_lesson.add('presentation')
                    logger.info(f"[SCORM] Rendered slide deck HTML for product_id={product_id}, length={len(body_html)}")
                elif any(t in (mtype, comp) for t in ['quiz', 'quizdisplay']):
                    body_html = _render_quiz_html(additional_match, content if isinstance(content, dict) else {})
                    type_label = 'Quiz'
                    added_types_for_lesson.add('quiz')
                    logger.info(f"[SCORM] Rendered quiz HTML for product_id={product_id}, length={len(body_html)}")
                else:
                    continue

                # Localize images for ALL product types
                sco_dir = f"sco_{product_id}"
                logger.info(f"[SCORM] Starting image localization for product_id={product_id}, sco_dir={sco_dir}")
                
                # Show a sample of the HTML to see what images are included
                html_sample = body_html[:1000] + "..." if len(body_html) > 1000 else body_html
                logger.debug(f"[SCORM] HTML sample for product_id={product_id}: {html_sample}")
                
                body_html = await _localize_images_to_assets(body_html, z, sco_dir)
                logger.info(f"[SCORM] Completed image localization for product_id={product_id}, final HTML length={len(body_html)}")

                # Write SCO HTML into package
                href = f"{sco_dir}/index.html"
                res_id = f"res-{(type_label or 'sco').lower()}-{product_id}"
                # Write as HTML for all types now
                z.writestr(href, body_html)
                logger.info(f"[SCORM] Written SCO HTML to {href}")
                sco_entries.append((res_id, href))

                # Add leaf item under lesson
                lesson_item['children'].append({
                    'identifier': f"itm-{product_id}",
                    'title': (type_label or title_for_sco),
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

    # Log final ZIP contents for debugging
    zip_contents = z.namelist()
    logger.info(f"[SCORM] Final ZIP contents ({len(zip_contents)} files):")
    for i, filename in enumerate(sorted(zip_contents)):
        file_info = z.getinfo(filename)
        logger.info(f"[SCORM]   {i+1:3d}. {filename} ({file_info.file_size} bytes)")

    z.close()
    zip_bytes = zip_buffer.getvalue()
    filename = f"{re.sub(r'[^A-Za-z0-9_-]+', '_', main_title) or 'course'}_scorm2004.zip"
    logger.info(f"[SCORM] Package complete: {filename} ({len(zip_bytes)} bytes total)")
    return filename, zip_bytes 