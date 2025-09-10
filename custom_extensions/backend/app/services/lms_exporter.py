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

logger = logging.getLogger(__name__)


async def export_course_outline_to_lms_format(
    course_outline_id: int,
    user_id: str
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

    def match_connected_product(projects: List[Dict[str, Any]], outline_name: str, lesson_title: str, desired_type: str) -> Optional[Dict[str, Any]]:
        """Replicate connection logic used in duplication to find products for a lesson and desired type."""
        target_mtype = map_item_type_to_microproduct(desired_type)
        logger.info(f"[LMS-MATCH] desired_type='{desired_type}' -> target_mtype='{target_mtype}' lesson_title='{lesson_title}' outline='{outline_name}'")
        if not target_mtype:
            return None
        candidates: List[Dict[str, Any]] = []
        for proj in projects:
            proj_name = (proj.get('project_name') or '').strip()
            micro_name = proj.get('microproduct_name')
            mtype = (proj.get('microproduct_type') or '').strip()
            if mtype == 'Training Plan':
                continue
            is_connected = False
            if proj_name == outline_name and micro_name:
                is_connected = True
                logger.debug(f"[LMS-MATCH] legacy match: proj='{proj_name}' micro='{micro_name}'")
            elif ': ' in proj_name:
                outline_part = proj_name.split(': ')[0].strip()
                if outline_part == outline_name:
                    is_connected = True
                    logger.debug(f"[LMS-MATCH] prefix match: proj='{proj_name}' outline_part='{outline_part}'")
            elif proj_name.startswith('Quiz - ') and ': ' in proj_name:
                quiz_part = proj_name.replace('Quiz - ', '', 1)
                outline_part = quiz_part.split(': ')[0].strip()
                if outline_part == outline_name:
                    is_connected = True
                    logger.debug(f"[LMS-MATCH] legacy quiz match: proj='{proj_name}' outline_part='{outline_part}'")
            elif lesson_title and proj_name == lesson_title:
                is_connected = True
                logger.debug(f"[LMS-MATCH] lesson title match: proj='{proj_name}'")
            if not is_connected:
                continue
            if mtype == target_mtype:
                candidates.append(proj)
                logger.debug(f"[LMS-MATCH] type matched '{target_mtype}' for proj_id={proj.get('id')} name='{proj_name}'")
        chosen = dict(candidates[-1]) if candidates else None
        logger.info(f"[LMS-MATCH] candidates={len(candidates)} chosen_id={chosen.get('id') if chosen else None}")
        return chosen

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
                primary = recs.get('primary') or []
                logger.info(f"[LMS] Lesson '{lesson_title}' has primary(raw)={primary}")

                # Normalize primary to list[dict] with 'type'
                norm_primary = []
                for it in primary:
                    if isinstance(it, dict):
                        norm_primary.append(it)
                    elif isinstance(it, str):
                        norm_primary.append({"type": it})
                primary = norm_primary

                # If no primary, try recommendedProducts/recommended_products fields
                if not primary:
                    rp = lesson.get('recommendedProducts') or lesson.get('recommended_products')
                    if isinstance(rp, list) and rp:
                        logger.info(f"[LMS] Using lesson.recommendedProducts for '{lesson_title}': {rp}")
                        temp_primary = []
                        for name in rp:
                            if not isinstance(name, str):
                                continue
                            t = name.strip().lower()
                            if t in ("presentation", "one-pager", "onepager", "quiz", "video-lesson"):
                                temp_primary.append({"type": t})
                        primary = temp_primary
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
                    item['link'] = link
                    new_primary.append(item)
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

    # Upload final structure JSON
    structure_json = json.dumps(structure, indent=2).encode('utf-8')
    structure_path = await upload_file_to_smartdrive(user_id, structure_json, "course_structure.json", export_folder)
    structure_download_link = await create_public_download_link(user_id, structure_path)

    return {
        "courseTitle": main_title,
        "downloadLink": structure_download_link,
        "structure": structure
    } 