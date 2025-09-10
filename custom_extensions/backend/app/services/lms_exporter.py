# custom_extensions/backend/app/services/lms_exporter.py
import json
import uuid
import logging
from typing import Dict, List, Any, Optional
from fastapi import HTTPException
from app.core.database import get_connection
from app.services.pdf_generator import generate_presentation_pdf, generate_onepager_pdf
from app.services.smartdrive_uploader import upload_file_to_smartdrive
from app.services.nextcloud_share import create_public_download_link
from app.services.quiz_exporter import export_quiz_to_cbai
import os
import httpx

logger = logging.getLogger(__name__)

DEFAULT_SMARTEXPERT_TOKEN = "$2y$12$r5QySSqmYsCvg9DczLhx0ewIhoTsYwNDDD4P8XuHNswtNpEdjQOYm"


async def post_export_to_smartexpert(structure_json: bytes, user_email: str, token: Optional[str]) -> Optional[Dict[str, Any]]:
    try:
        api_url = os.environ.get('SMARTEXPERT_API_URL', 'https://dev.smartexpert.net/api/v1/generate-product')
        api_token = token or DEFAULT_SMARTEXPERT_TOKEN
        if not api_token:
            logger.info("[SmartExpert] Token not provided; skipping external POST")
            return None
        logger.info(f"[SmartExpert] Posting export for email={user_email} to {api_url}")
        data = {
            'token': api_token,
            'email': user_email
        }
        files = {
            'file': ('file.json', structure_json, 'application/json')
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(api_url, data=data, files=files)
            status = response.status_code
            logger.info(f"[SmartExpert] Response status={status}")
            try:
                resp_json = response.json()
                logger.info(f"[SmartExpert] Response body JSON: {str(resp_json)[:500]}")
            except Exception:
                resp_json = {'text': response.text[:500]}
                logger.info(f"[SmartExpert] Response body TEXT: {resp_json['text']}")
            return {'status': status, 'body': resp_json}
    except Exception as e:
        logger.error(f"[SmartExpert] POST failed: {e}")
        return None


async def export_course_outline_to_lms_format(
    course_outline_id: int,
    user_id: str,
    user_email: str,
    smartexpert_token: Optional[str] = None
) -> dict:
    logger.info(f"[LMS] Export start | user={user_id} course_id={course_outline_id}")

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

        # Fetch all user's projects once for product resolution
        all_projects = await connection.fetch(
            "SELECT p.*, dt.microproduct_type, dt.component_name FROM projects p LEFT JOIN design_templates dt ON p.design_template_id = dt.id WHERE p.onyx_user_id = $1 ORDER BY p.created_at",
            user_id
        )

    course_data = dict(row)
    outline_name = course_data.get('project_name')

    # Parse stored outline structure
    stored = course_data.get('microproduct_content')
    if isinstance(stored, str):
        try:
            stored = json.loads(stored)
        except Exception as e:
            logger.error(f"[LMS] Failed to parse stored outline JSON: {e}")
            stored = None

    if not isinstance(stored, dict):
        raise HTTPException(status_code=500, detail="Invalid training plan content")

    # Deep copy to avoid mutating DB content
    structure = json.loads(json.dumps(stored))

    # Ensure required root fields and add top-level uid
    main_title = structure.get('mainTitle') or course_data.get('microproduct_name') or outline_name or 'Course'
    structure['mainTitle'] = main_title
    structure['uid'] = str(uuid.uuid4())

    # Timestamp-based export folder
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_folder = f"/LMS_Exports/{timestamp}_{str(main_title).replace(' ', '_')}/"

    # Resolve and attach links for recommended products using name matching logic
    sections = structure.get('sections') or []
    logger.info(f"[LMS] Outline parsed | sections={len(sections)} title='{main_title}'")

    def parse_primary_list(raw_primary) -> List[Dict[str, Any]]:
        """Normalize primary into list of dicts with 'type'. Supports JSON strings."""
        if raw_primary is None:
            return []
        # If already a list, coerce entries
        if isinstance(raw_primary, list):
            out: List[Dict[str, Any]] = []
            for it in raw_primary:
                if isinstance(it, dict):
                    out.append(it)
                elif isinstance(it, str):
                    t = it.strip().strip('"').strip("'")
                    out.append({"type": t})
            return out
        # If string, attempt json loads
        if isinstance(raw_primary, str):
            s = raw_primary.strip()
            try:
                if (s.startswith('[') and s.endswith(']')) or (s.startswith('{') and s.endswith('}')):
                    parsed = json.loads(s)
                    return parse_primary_list(parsed)
            except Exception as e:
                logger.info(f"[LMS] Failed JSON parse of primary string, fallback split. err={e}")
            # Fallback: split by comma and strip brackets/quotes
            s = s.strip('[]')
            parts = [p.strip().strip('"').strip("'") for p in s.split(',') if p.strip()]
            return [{"type": p} for p in parts if p]
        # Unknown type -> empty
        return []

    def parse_recommended_products_field(value) -> List[str]:
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
            except Exception as e:
                logger.info(f"[LMS] Failed JSON parse of recommendedProducts, fallback split. err={e}")
            sv = sv.strip('[]')
            return [p.strip().strip('"').strip("'").lower() for p in sv.split(',') if p.strip()]
        return []

    def compute_candidate_score(proj: Dict[str, Any], outline_name: str, lesson_title: str, target_mtype: str) -> int:
        score = 0
        proj_name = (proj.get('project_name') or '').strip()
        micro_name = (proj.get('microproduct_name') or '').strip() if proj.get('microproduct_name') else ''
        mtype = (proj.get('microproduct_type') or '').strip()
        if mtype != target_mtype:
            return -1
        # Strong matches
        if lesson_title and proj_name == lesson_title:
            score += 100
        if lesson_title and proj_name.endswith(f": {lesson_title}"):
            score += 95
        if lesson_title and micro_name == lesson_title:
            score += 90
        if lesson_title and lesson_title in micro_name:
            score += 80
        # Outline-based matches (weaker)
        if proj_name == outline_name and micro_name:
            score += 40
        if ': ' in proj_name and proj_name.split(': ')[0].strip() == outline_name:
            score += 35
        if proj_name.startswith('Quiz - ') and ': ' in proj_name:
            quiz_part = proj_name.replace('Quiz - ', '', 1)
            outline_part = quiz_part.split(': ')[0].strip()
            if outline_part == outline_name:
                score += 30
        # Recency bonus
        try:
            if proj.get('created_at'):
                score += 1
        except Exception:
            pass
        logger.debug(f"[LMS-MATCH] score={score} for proj_id={proj.get('id')} name='{proj_name}' mtype='{mtype}' lesson='{lesson_title}'")
        return score

    # Remove scoring; implement deterministic matching and prevent duplicates
    used_product_ids: set = set()

    def project_type_matches(proj: Dict[str, Any], target_mtype: str) -> bool:
        return (proj.get('microproduct_type') or '').strip() == target_mtype

    def match_connected_product(projects: List[Dict[str, Any]], outline_name: str, lesson_title: str, desired_type: str) -> Optional[Dict[str, Any]]:
        target_mtype = map_item_type_to_microproduct(desired_type)
        logger.info(f"[LMS-MATCH] desired_type='{desired_type}' -> target_mtype='{target_mtype}' lesson_title='{lesson_title}' outline='{outline_name}'")
        if not target_mtype or not lesson_title:
            return None

        def is_unused(proj_id: Any) -> bool:
            return proj_id not in used_product_ids

        # Normalize helper
        def pname(proj: Dict[str, Any]) -> str:
            return (proj.get('project_name') or '').strip()
        def mname(proj: Dict[str, Any]) -> str:
            return (proj.get('microproduct_name') or '').strip()

        # Pattern A (strongest): "Quiz - {outline}: {lesson}" for quizzes only
        if target_mtype == 'Quiz':
            target_name = f"Quiz - {outline_name}: {lesson_title}"
            for proj in projects:
                if project_type_matches(proj, target_mtype) and is_unused(proj.get('id')):
                    if pname(proj) == target_name:
                        logger.info(f"[LMS-MATCH] A quiz match -> id={proj.get('id')} name='{pname(proj)}'")
                        return dict(proj)

        # Pattern A2: type-prefixed names for other types
        type_prefix_map = {
            'Slide Deck': 'Presentation',
            'One Pager': 'One Pager',
            'Text Presentation': 'Text Presentation'
        }
        prefix = type_prefix_map.get(target_mtype)
        if prefix:
            target_name_prefixed = f"{prefix} - {outline_name}: {lesson_title}"
            for proj in projects:
                if project_type_matches(proj, target_mtype) and is_unused(proj.get('id')):
                    if pname(proj) == target_name_prefixed:
                        logger.info(f"[LMS-MATCH] A2 prefixed match -> id={proj.get('id')} name='{pname(proj)}'")
                        return dict(proj)

        # Pattern B: "{outline}: {lesson}"
        target_name = f"{outline_name}: {lesson_title}"
        for proj in projects:
            if project_type_matches(proj, target_mtype) and is_unused(proj.get('id')):
                if pname(proj) == target_name:
                    logger.info(f"[LMS-MATCH] B exact outline:lesson match -> id={proj.get('id')}")
                    return dict(proj)

        # Pattern C: microproduct_name equals lesson title (legacy connected products)
        for proj in projects:
            if project_type_matches(proj, target_mtype) and is_unused(proj.get('id')):
                if mname(proj) == lesson_title:
                    logger.info(f"[LMS-MATCH] C microproduct_name match -> id={proj.get('id')}")
                    return dict(proj)

        # Pattern E (legacy): project_name == outline_name AND microproduct_name == lesson_title
        for proj in projects:
            if project_type_matches(proj, target_mtype) and is_unused(proj.get('id')):
                if pname(proj) == outline_name and mname(proj) == lesson_title:
                    logger.info(f"[LMS-MATCH] E outline+micro_name match -> id={proj.get('id')}")
                    return dict(proj)

        # Pattern D: project_name equals lesson title (rare)
        for proj in projects:
            if project_type_matches(proj, target_mtype) and is_unused(proj.get('id')):
                if pname(proj) == lesson_title:
                    logger.info(f"[LMS-MATCH] D project_name match -> id={proj.get('id')}")
                    return dict(proj)

        logger.info(f"[LMS-MATCH] No deterministic match for lesson='{lesson_title}' type='{desired_type}'")
        return None

    def map_item_type_to_microproduct(item_type: str) -> Optional[str]:
        t = (item_type or '').strip().lower()
        if t in ('presentation',):
            return 'Slide Deck'
        if t in ('one-pager', 'onepager'):
            return 'One Pager'
        if t in ('quiz',):
            return 'Quiz'
        return None

    def normalize_item_type_output(item_type: str) -> str:
        # Keep original if it is one of expected variants; map one-pager to onepager to match sample
        t = (item_type or '').strip()
        if t == 'one-pager':
            return 'onepager'
        return t

    def normalize_public_link(url: Optional[str]) -> Optional[str]:
        if not url:
            return url
        try:
            import os, re
            public_base = os.environ.get('NEXTCLOUD_PUBLIC_SHARE_DOMAIN')
            if public_base:
                # Ensure no trailing slash
                public_base = public_base.rstrip('/')
                # Replace '/index.php/s/' with '/s/' under the base if needed
                url = re.sub(r'^https?://[^/]+/index\\.php/s/', f"{public_base}/s/", url)
                url = re.sub(r'^https?://[^/]+/s/', f"{public_base}/s/", url)
                return url
            # Default replacement to requested domain/path
            url = re.sub(r'^https?://[^/]+/index\\.php/s/', 'http://ml-dev.contentbuilder.ai/smartdrive/s/', url)
            url = re.sub(r'^https?://[^/]+/s/', 'http://ml-dev.contentbuilder.ai/smartdrive/s/', url)
            return url
        except Exception:
            return url

    # Iterate sections/lessons and process recommended items
    for section in sections:
        if isinstance(section, dict):
            section['uid'] = section.get('uid') or str(uuid.uuid4())
            lessons = section.get('lessons') or []
            logger.info(f"[LMS] Section '{section.get('title')}' | lessons={len(lessons)}")
            for lesson in lessons:
                if not isinstance(lesson, dict):
                    continue
                lesson['uid'] = lesson.get('uid') or str(uuid.uuid4())
                lesson_title = (lesson.get('title') or '').strip()
                recs = lesson.get('recommended_content_types') or {}
                raw_primary = recs.get('primary')
                logger.info(f"[LMS] Lesson '{lesson_title}' has primary(raw)={raw_primary}")
                primary = parse_primary_list(raw_primary)
                logger.info(f"[LMS] Lesson '{lesson_title}' primary(normalized)={primary}")

                # If no primary, try recommendedProducts/recommended_products fields
                if not primary:
                    rp = lesson.get('recommendedProducts') or lesson.get('recommended_products')
                    rp_list = parse_recommended_products_field(rp)
                    if rp_list:
                        logger.info(f"[LMS] Using lesson.recommendedProducts for '{lesson_title}': {rp_list}")
                        primary = [{"type": t} for t in rp_list if t in ("presentation","one-pager","onepager","quiz","video-lesson")]
                        if recs is None:
                            recs = {}

                new_primary = []
                for item in primary:
                    if not isinstance(item, dict):
                        logger.info(f"[LMS] Skipping non-dict primary item: {item}")
                        continue
                    item_type_raw = (item.get('type') or '').strip()
                    logger.info(f"[LMS] Processing recommended item type='{item_type_raw}' for lesson='{lesson_title}'")
                    mapped_mtype = map_item_type_to_microproduct(item_type_raw)
                    if not mapped_mtype:
                        logger.info(f"[LMS] Unknown recommended type '{item_type_raw}', keeping as-is")
                        item['uid'] = item.get('uid') or str(uuid.uuid4())
                        new_primary.append(item)
                        continue
                    matched = match_connected_product([dict(p) for p in all_projects], outline_name, lesson_title, item_type_raw)
                    if not matched:
                        logger.info(f"[LMS] No product found for lesson='{lesson_title}' type='{item_type_raw}', removing from recommendations")
                        continue
                    product_id = matched['id']
                    logger.info(f"[LMS] Matched product id={product_id} type='{mapped_mtype}' for lesson='{lesson_title}'")
                    link: Optional[str] = None
                    try:
                        if mapped_mtype == 'Slide Deck':
                            pdf_bytes = await generate_presentation_pdf(matched, user_id)
                            file_name = f"slide-deck_{product_id}.pdf"
                            file_path = await upload_file_to_smartdrive(user_id, pdf_bytes, file_name, f"{export_folder}presentations/")
                            link = await create_public_download_link(user_id, file_path)
                        elif mapped_mtype == 'One Pager':
                            pdf_bytes = await generate_onepager_pdf(matched, user_id)
                            file_name = f"onepager_{product_id}.pdf"
                            file_path = await upload_file_to_smartdrive(user_id, pdf_bytes, file_name, f"{export_folder}onepagers/")
                            link = await create_public_download_link(user_id, file_path)
                        elif mapped_mtype == 'Quiz':
                            cbai_bytes = await export_quiz_to_cbai(matched, user_id)
                            file_name = f"quiz_{product_id}.cbai"
                            file_path = await upload_file_to_smartdrive(user_id, cbai_bytes, file_name, f"{export_folder}quizzes/")
                            link = await create_public_download_link(user_id, file_path)
                        logger.info(f"[LMS] Uploaded and linked | type='{item_type_raw}' id={product_id} link={link}")
                    except Exception as e:
                        logger.error(f"[LMS] Failed content generation/upload for product {product_id} ({item_type_raw}): {e}")
                        continue
                    item['uid'] = item.get('uid') or str(uuid.uuid4())
                    item['type'] = normalize_item_type_output(item_type_raw)
                    item['link'] = normalize_public_link(link)
                    new_primary.append(item)
                    # mark product as used
                    used_product_ids.add(product_id)
                if recs is not None:
                    recs['primary'] = new_primary
                    lesson['recommended_content_types'] = recs

    # Prune final structure to match reference schema
    def prune_structure(data: Dict[str, Any]) -> Dict[str, Any]:
        pruned: Dict[str, Any] = {
            'mainTitle': data.get('mainTitle'),
            'uid': data.get('uid'),
            'sections': []
        }
        for section in data.get('sections') or []:
            if not isinstance(section, dict):
                continue
            pruned_section = {
                'id': section.get('id'),
                'uid': section.get('uid') or str(uuid.uuid4()),
                'title': section.get('title'),
                'lessons': []
            }
            for lesson in section.get('lessons') or []:
                if not isinstance(lesson, dict):
                    continue
                pruned_lesson = {
                    'uid': lesson.get('uid') or str(uuid.uuid4()),
                    'title': lesson.get('title')
                }
                recs = lesson.get('recommended_content_types') or {}
                primary = recs.get('primary') or []
                cleaned_primary = []
                for item in primary:
                    if not isinstance(item, dict):
                        continue
                    cleaned_primary.append({
                        'uid': item.get('uid') or str(uuid.uuid4()),
                        'type': item.get('type'),
                        'link': item.get('link')
                    })
                if cleaned_primary:
                    pruned_lesson['recommended_content_types'] = { 'primary': cleaned_primary }
                pruned_section['lessons'].append(pruned_lesson)
            pruned['sections'].append(pruned_section)
        return pruned

    structure = prune_structure(structure)

    # Upload final structure JSON and post to SmartExpert
    structure_json = json.dumps(structure, indent=2).encode('utf-8')
    structure_path = await upload_file_to_smartdrive(user_id, structure_json, "course_structure.json", export_folder)
    structure_download_link = await create_public_download_link(user_id, structure_path)

    smartexpert_result = await post_export_to_smartexpert(structure_json, user_email, smartexpert_token)

    return {
        "courseTitle": main_title,
        "downloadLink": structure_download_link,
        "structure": structure,
        "smartexpert": smartexpert_result
    } 