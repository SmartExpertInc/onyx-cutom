# custom_extensions/backend/app/services/scorm_packager.py
import io
import os
import re
import uuid
import json
import zipfile
import logging
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException

from app.core.database import get_connection

# Reuse Jinja templates configured for PDF generation to produce HTML content
from app.services.pdf_generator import jinja_env

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


def _build_manifest(course_title: str, sco_entries: List[Tuple[str, str]]) -> str:
    # sco_entries: List of (item_id, href)
    course_identifier = f"course-{uuid.uuid4()}"
    header = _manifest_header(course_identifier, course_title)

    # Items
    items_xml = []
    resources_xml = []
    for idx, (res_id, href) in enumerate(sco_entries, start=1):
        item_id = f"item-{res_id}"
        items_xml.append(f"<item identifier=\"{item_id}\" identifierref=\"{res_id}\"><title>SCO {idx}</title></item>")
        resources_xml.append(
            f"<resource identifier=\"{res_id}\" type=\"webcontent\" adlcp:scormType=\"sco\" href=\"{_xml_escape(href)}\"><file href=\"{_xml_escape(href)}\"/></resource>"
        )

    body = "".join(items_xml)
    footer = _manifest_footer("".join(resources_xml))
    return header + body + footer


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

    # Build in-memory ZIP
    zip_buffer = io.BytesIO()
    z = zipfile.ZipFile(zip_buffer, mode='w', compression=zipfile.ZIP_DEFLATED)

    # Collect SCO entries (resource id, href)
    sco_entries: List[Tuple[str, str]] = []
    used_ids: set = set()

    sections = structure.get('sections') or []

    for section in sections:
        if not isinstance(section, dict):
            continue
        lessons = section.get('lessons') or []
        for lesson in lessons:
            if not isinstance(lesson, dict):
                continue
            lesson_title = (lesson.get('title') or '').strip()
            recs = lesson.get('recommended_content_types') or {}
            primary = recs.get('primary') or []
            # Normalize primary to list of dicts with 'type'
            normalized: List[Dict[str, Any]] = []
            for it in primary:
                if isinstance(it, dict):
                    normalized.append(it)
                elif isinstance(it, str):
                    normalized.append({'type': it})
            for item in normalized:
                item_type_raw = (item.get('type') or '').strip().lower()
                if not item_type_raw:
                    continue
                matched = _match_connected_product(all_projects, outline_name, lesson_title, item_type_raw, used_ids)
                if not matched:
                    logger.info(f"[SCORM] No product for lesson='{lesson_title}' type='{item_type_raw}', skipping")
                    continue
                product_id = matched['id']
                used_ids.add(product_id)

                # Render product to HTML
                body_html = None
                mtype = (matched.get('microproduct_type') or '').strip().lower()
                comp = (matched.get('component_name') or '').strip().lower()
                try:
                    content = await _load_product_content(product_id, user_id)
                except Exception as e:
                    logger.warning(f"[SCORM] Failed to load product content id={product_id}: {e}")
                    content = None

                title_for_sco = matched.get('project_name') or matched.get('microproduct_name') or lesson_title or 'Lesson'

                if any(t in (mtype, comp) for t in ['pdf lesson', 'pdflesson', 'text presentation', 'textpresentation']):
                    body_html = _render_onepager_html(matched, content if isinstance(content, dict) else {})
                elif any(t in (mtype, comp) for t in ['one pager', 'one-pager', 'onepager']):
                    body_html = _render_onepager_html(matched, content if isinstance(content, dict) else {})
                elif any(t in (mtype, comp) for t in ['slide deck', 'presentation', 'slidedeck', 'presentationdisplay']):
                    # Placeholder for slide deck until full HTML render is supported
                    body_html = _render_placeholder_html(title_for_sco, "This presentation has been exported as a SCORM SCO placeholder.")
                elif any(t in (mtype, comp) for t in ['quiz', 'quizdisplay']):
                    # Placeholder SCO for quiz
                    body_html = _render_placeholder_html(title_for_sco, "Quiz content is not yet supported for SCORM export in this version.")
                else:
                    body_html = _render_placeholder_html(title_for_sco, "Unsupported content type for SCORM export.")

                # Write SCO HTML into package
                sco_dir = f"sco_{product_id}"
                href = f"{sco_dir}/index.html"
                res_id = f"res-{product_id}"
                z.writestr(href, body_html)
                sco_entries.append((res_id, href))

    # Build manifest
    manifest_xml = _build_manifest(main_title, sco_entries)
    z.writestr("imsmanifest.xml", manifest_xml)

    z.close()
    zip_bytes = zip_buffer.getvalue()
    filename = f"{re.sub(r'[^A-Za-z0-9_-]+', '_', main_title) or 'course'}_scorm2004.zip"
    return filename, zip_bytes 