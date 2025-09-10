# custom_extensions/backend/app/services/quiz_exporter.py
import json
import uuid
from typing import Dict, List, Any
from fastapi import HTTPException
from app.core.database import get_connection
import logging

logger = logging.getLogger(__name__)


async def export_quiz_to_cbai(product_data, user_id: str) -> bytes:
    """Convert quiz data to .cbai JSON format matching quiz.cbai structure"""

    logger.info(f"[QUIZ] Export start | user={user_id} product_id={product_data['id']}")

    async with get_connection() as connection:
        quiz_data = await connection.fetchrow(
            "SELECT microproduct_content FROM projects WHERE id = $1 AND onyx_user_id = $2",
            product_data['id'], user_id
        )

    if not quiz_data or not quiz_data.get('microproduct_content'):
        logger.error(f"[QUIZ] Content not found | product_id={product_data['id']}")
        raise HTTPException(status_code=404, detail="Quiz content not found")

    quiz_content = quiz_data['microproduct_content']

    cbai_structure = {
        "questions": [],
        "quizTitle": product_data.get('title') or product_data.get('project_name') or 'Quiz',
        "detectedLanguage": "en"
    }

    questions = parse_quiz_questions(quiz_content)
    logger.info(f"[QUIZ] Parsed questions | count={len(questions)}")

    for question_data in questions:
        question = {
            "uid": str(uuid.uuid4()),
            "question_text": question_data.get('text', ''),
            "question_type": question_data.get('type', 'multiple-choice'),
            "explanation": question_data.get('explanation', '')
        }

        if question['question_type'] == 'multiple-choice':
            question["options"] = []
            question["correct_option_id"] = question_data.get('correct_answer', 'A')
            for i, option in enumerate(question_data.get('options', [])):
                option_id = chr(65 + i)
                question["options"].append({
                    "id": option_id,
                    "text": option,
                    "uid": str(uuid.uuid4())
                })

        elif question['question_type'] == 'multi-select':
            question["options"] = []
            question["correct_option_ids"] = question_data.get('correct_answers', [])
            for i, option in enumerate(question_data.get('options', [])):
                option_id = chr(65 + i)
                question["options"].append({
                    "id": option_id,
                    "text": option,
                    "uid": str(uuid.uuid4())
                })

        elif question['question_type'] == 'matching':
            question["options"] = []
            question["prompts"] = []
            question["correct_matches"] = question_data.get('matches', {})
            for i, option in enumerate(question_data.get('options', [])):
                question["options"].append({
                    "id": chr(65 + i),
                    "text": option,
                    "uid": str(uuid.uuid4())
                })
            for i, prompt in enumerate(question_data.get('prompts', [])):
                question["prompts"].append({
                    "id": str(i + 1),
                    "text": prompt,
                    "uid": str(uuid.uuid4())
                })

        elif question['question_type'] == 'sorting':
            question["items_to_sort"] = []
            question["correct_order"] = question_data.get('correct_order', [])
            for i, item in enumerate(question_data.get('items', [])):
                question["items_to_sort"].append({
                    "id": chr(65 + i),
                    "text": item,
                    "uid": str(uuid.uuid4())
                })

        elif question['question_type'] == 'open-answer':
            question["acceptable_answers"] = question_data.get('acceptable_answers', [])

        cbai_structure["questions"].append(question)

    payload = json.dumps(cbai_structure, indent=2).encode('utf-8')
    logger.info(f"[QUIZ] Export complete | product_id={product_data['id']} size={len(payload)}B")
    return payload


def parse_quiz_questions(quiz_content) -> List[Dict]:
    """Parse quiz questions from stored content format"""
    # Placeholder parser; adapt to real storage format
    return [
        {
            "text": "Sample question?",
            "type": "multiple-choice",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "A",
            "explanation": "This is the correct answer because..."
        }
    ] 