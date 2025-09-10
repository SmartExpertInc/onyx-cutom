# custom_extensions/backend/app/services/lms_exporter.py
import json
import uuid
import logging
from typing import Dict, List, Any
from fastapi import HTTPException
from app.core.database import get_connection
from app.services.pdf_generator import generate_pdf_from_html_template, generate_slide_deck_pdf_with_dynamic_height
from app.services.pdf_generator import generate_presentation_pdf, generate_onepager_pdf
from app.services.smartdrive_uploader import upload_file_to_smartdrive
from app.services.nextcloud_share import create_public_download_link
from app.services.quiz_exporter import export_quiz_to_cbai

logger = logging.getLogger(__name__)


async def export_course_outline_to_lms_format(
    course_outline_id: int,
    user_id: str
) -> dict:
    """Convert course outline to LMS JSON format with file links"""

    async with get_connection() as connection:
        course_data = await connection.fetchrow(
            """
            SELECT p.*, p.project_name as title, p.microproduct_name
            FROM projects p
            LEFT JOIN design_templates dt ON p.design_template_id = dt.id
            WHERE p.id = $1 AND p.onyx_user_id = $2 AND dt.microproduct_type = 'Training Plan'
            """,
            course_outline_id, user_id
        )
        if not course_data:
            raise HTTPException(status_code=404, detail="Course outline not found")

        related_products = await connection.fetch(
            """
            SELECT p.*, p.project_name as title, dt.microproduct_type as product_type
            FROM projects p
            LEFT JOIN design_templates dt ON p.design_template_id = dt.id
            WHERE p.onyx_user_id = $1 AND dt.microproduct_type IN ('Slide Deck', 'Quiz', 'One Pager')
            ORDER BY p.created_at
            """,
            user_id
        )

    course_structure = await generate_course_structure(course_data, related_products, user_id)
    return course_structure


async def generate_course_structure(course_data, related_products, user_id: str) -> dict:
    """Generate the course structure matching file.json format"""

    main_title = course_data.get('title') or course_data.get('microproduct_name') or 'Course'
    course_uid = str(uuid.uuid4())

    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_folder = f"/LMS_Exports/{timestamp}_{str(main_title).replace(' ', '_')}/"

    content_links: Dict[int, Dict[str, str]] = {}

    for product in related_products:
        try:
            product_type = (product.get('product_type') or '').strip()
            if product_type == 'Slide Deck':
                pdf_content = await generate_presentation_pdf(product, user_id)
                file_name = f"slide-deck_{product['id']}.pdf"
                file_path = await upload_file_to_smartdrive(
                    user_id, pdf_content, file_name, f"{export_folder}presentations/"
                )
                download_link = await create_public_download_link(user_id, file_path)
                content_links[product['id']] = {"type": "presentation", "link": download_link}

            elif product_type == 'One Pager':
                pdf_content = await generate_onepager_pdf(product, user_id)
                file_name = f"onepager_{product['id']}.pdf"
                file_path = await upload_file_to_smartdrive(
                    user_id, pdf_content, file_name, f"{export_folder}onepagers/"
                )
                download_link = await create_public_download_link(user_id, file_path)
                content_links[product['id']] = {"type": "onepager", "link": download_link}

            elif product_type == 'Quiz':
                cbai_content = await export_quiz_to_cbai(product, user_id)
                file_name = f"quiz_{product['id']}.cbai"
                file_path = await upload_file_to_smartdrive(
                    user_id, cbai_content, file_name, f"{export_folder}quizzes/"
                )
                download_link = await create_public_download_link(user_id, file_path)
                content_links[product['id']] = {"type": "quiz", "link": download_link}
        except Exception as e:
            logger.error(f"Failed to process product {product['id']}: {e}")
            continue

    structure: Dict[str, Any] = {
        "mainTitle": main_title,
        "uid": course_uid,
        "sections": []
    }

    section_count = 1
    lessons_per_section = 3
    current_lesson_count = 0
    current_section = None

    for i, product in enumerate(related_products):
        if current_lesson_count == 0:
            current_section = {
                "id": f"№{section_count}",
                "uid": str(uuid.uuid4()),
                "title": f"Module {section_count}",
                "lessons": []
            }
            structure["sections"].append(current_section)
            section_count += 1

        lesson = {
            "uid": str(uuid.uuid4()),
            "title": product.get('title') or f"Lesson {i+1}",
            "recommended_content_types": {"primary": []}
        }

        if product['id'] in content_links:
            lesson["recommended_content_types"]["primary"].append({
                "uid": str(uuid.uuid4()),
                "type": content_links[product['id']]["type"],
                "link": content_links[product['id']]["link"]
            })

        current_section["lessons"].append(lesson)
        current_lesson_count += 1

        if current_lesson_count >= lessons_per_section:
            current_lesson_count = 0

    structure_json = json.dumps(structure, indent=2).encode('utf-8')
    structure_path = await upload_file_to_smartdrive(
        user_id, structure_json, "course_structure.json", export_folder
    )
    structure_download_link = await create_public_download_link(user_id, structure_path)

    return {
        "courseTitle": main_title,
        "downloadLink": structure_download_link,
        "structure": structure
    } 