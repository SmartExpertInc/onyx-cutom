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
        quiz_row = await connection.fetchrow(
            "SELECT microproduct_content FROM projects WHERE id = $1 AND onyx_user_id = $2",
            product_data['id'], user_id
        )

    if not quiz_row or not quiz_row.get('microproduct_content'):
        logger.error(f"[QUIZ] Content not found | product_id={product_data['id']}")
        raise HTTPException(status_code=404, detail="Quiz content not found")

    raw = quiz_row['microproduct_content']
    content = raw
    if isinstance(content, str):
        try:
            content = json.loads(content)
        except Exception:
            logger.info("[QUIZ] quiz content is string and not JSON; proceeding")

    cbai = {
        "questions": [],
        "quizTitle": product_data.get('project_name') or product_data.get('microproduct_name') or 'Quiz',
        "detectedLanguage": (content.get('detectedLanguage') if isinstance(content, dict) else 'en') or 'en'
    }

    # Try to detect structured questions
    questions_src = []
    if isinstance(content, dict):
        # Common keys where questions may live
        for key in ["questions", "quiz", "items", "data"]:
            val = content.get(key)
            if isinstance(val, list) and val:
                questions_src = val
                break

    if questions_src:
        logger.info(f"[QUIZ] Found {len(questions_src)} structured questions")
        for q in questions_src:
            if not isinstance(q, dict):
                continue
            qtype = (q.get('question_type') or q.get('type') or 'multiple-choice')
            qtext = q.get('question_text') or q.get('text') or ''
            explanation = q.get('explanation') or ''
            out_q = {
                "uid": str(uuid.uuid4()),
                "question_text": qtext,
                "question_type": qtype,
                "explanation": explanation
            }
            if qtype == 'multiple-choice':
                opts = q.get('options') or []
                correct = q.get('correct_option_id') or q.get('correct_answer') or 'A'
                out_q["options"] = []
                out_q["correct_option_id"] = correct
                for i, opt in enumerate(opts):
                    text = opt.get('text') if isinstance(opt, dict) else str(opt)
                    out_q["options"].append({"id": chr(65+i), "text": text, "uid": str(uuid.uuid4())})
            elif qtype == 'multi-select':
                opts = q.get('options') or []
                correct_ids = q.get('correct_option_ids') or q.get('correct_answers') or []
                out_q["options"] = []
                out_q["correct_option_ids"] = correct_ids
                for i, opt in enumerate(opts):
                    text = opt.get('text') if isinstance(opt, dict) else str(opt)
                    out_q["options"].append({"id": chr(65+i), "text": text, "uid": str(uuid.uuid4())})
            elif qtype == 'matching':
                opts = q.get('options') or []
                prompts = q.get('prompts') or []
                out_q["options"], out_q["prompts"] = [], []
                out_q["correct_matches"] = q.get('correct_matches') or q.get('matches') or {}
                for i, opt in enumerate(opts):
                    text = opt.get('text') if isinstance(opt, dict) else str(opt)
                    out_q["options"].append({"id": chr(65+i), "text": text, "uid": str(uuid.uuid4())})
                for i, prm in enumerate(prompts):
                    text = prm.get('text') if isinstance(prm, dict) else str(prm)
                    out_q["prompts"].append({"id": str(i+1), "text": text, "uid": str(uuid.uuid4())})
            elif qtype == 'sorting':
                items = q.get('items_to_sort') or q.get('items') or []
                out_q["items_to_sort"] = []
                out_q["correct_order"] = q.get('correct_order') or []
                for i, item in enumerate(items):
                    text = item.get('text') if isinstance(item, dict) else str(item)
                    out_q["items_to_sort"].append({"id": chr(65+i), "text": text, "uid": str(uuid.uuid4())})
            elif qtype == 'open-answer':
                out_q["acceptable_answers"] = q.get('acceptable_answers') or []
            cbai["questions"].append(out_q)
    else:
        logger.info("[QUIZ] No structured questions detected; using placeholder")
        cbai["questions"].append({
            "uid": str(uuid.uuid4()),
            "question_text": "Sample question?",
            "question_type": "multiple-choice",
            "explanation": "",
            "options": [
                {"id": "A", "text": "Option A", "uid": str(uuid.uuid4())},
                {"id": "B", "text": "Option B", "uid": str(uuid.uuid4())},
                {"id": "C", "text": "Option C", "uid": str(uuid.uuid4())}
            ],
            "correct_option_id": "A"
        })

    payload = json.dumps(cbai, indent=2).encode('utf-8')
    logger.info(f"[QUIZ] Export complete | product_id={product_data['id']} size={len(payload)}B")
    return payload 