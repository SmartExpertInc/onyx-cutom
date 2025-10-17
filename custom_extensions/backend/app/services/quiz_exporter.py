# custom_extensions/backend/app/services/quiz_exporter.py
import json
import uuid
import re
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
                out_q["options"] = []
                # Map original option ids/index/text to new letter ids
                option_orig_to_new: Dict[str, str] = {}
                for i, opt in enumerate(opts):
                    if isinstance(opt, dict):
                        text = opt.get('text') or str(opt.get('value') or '')
                        orig_id = str(opt.get('id')) if opt.get('id') is not None else None
                    else:
                        text = str(opt)
                        orig_id = None
                    new_id = chr(65 + i)
                    out_q["options"].append({"id": new_id, "text": text, "uid": str(uuid.uuid4())})
                    # Build robust mappings
                    if orig_id:
                        option_orig_to_new[orig_id] = new_id
                    option_orig_to_new[new_id] = new_id
                    option_orig_to_new[str(i)] = new_id
                    option_orig_to_new[str(i + 1)] = new_id
                correct_raw = q.get('correct_option_id') or q.get('correct_answer') or 'A'
                correct_str = str(correct_raw)
                mapped = option_orig_to_new.get(correct_str)
                if not mapped and len(correct_str) == 1 and correct_str.upper() in option_orig_to_new.values():
                    mapped = correct_str.upper()
                out_q["correct_option_id"] = mapped or 'A'
            elif qtype == 'multi-select':
                opts = q.get('options') or []
                out_q["options"] = []
                option_orig_to_new: Dict[str, str] = {}
                for i, opt in enumerate(opts):
                    if isinstance(opt, dict):
                        text = opt.get('text') or str(opt.get('value') or '')
                        orig_id = str(opt.get('id')) if opt.get('id') is not None else None
                    else:
                        text = str(opt)
                        orig_id = None
                    new_id = chr(65 + i)
                    out_q["options"].append({"id": new_id, "text": text, "uid": str(uuid.uuid4())})
                    if orig_id:
                        option_orig_to_new[orig_id] = new_id
                    option_orig_to_new[new_id] = new_id
                    option_orig_to_new[str(i)] = new_id
                    option_orig_to_new[str(i + 1)] = new_id
                correct_ids = q.get('correct_option_ids') or q.get('correct_answers') or []
                mapped_ids: List[str] = []
                for cid in correct_ids:
                    c = str(cid)
                    m = option_orig_to_new.get(c)
                    if not m and len(c) == 1 and c.upper() in option_orig_to_new.values():
                        m = c.upper()
                    if m and m not in mapped_ids:
                        mapped_ids.append(m)
                out_q["correct_option_ids"] = mapped_ids
            elif qtype == 'matching':
                opts = q.get('options') or []
                prompts = q.get('prompts') or []
                out_q["options"], out_q["prompts"] = [], []
                option_orig_to_new: Dict[str, str] = {}
                prompt_orig_to_new: Dict[str, str] = {}
                # Build options with letter IDs
                for i, opt in enumerate(opts):
                    if isinstance(opt, dict):
                        text = opt.get('text') or str(opt.get('value') or '')
                        orig_id = str(opt.get('id')) if opt.get('id') is not None else None
                    else:
                        text = str(opt)
                        orig_id = None
                    new_id = chr(65 + i)
                    out_q["options"].append({"id": new_id, "text": text, "uid": str(uuid.uuid4())})
                    if orig_id:
                        option_orig_to_new[orig_id] = new_id
                    option_orig_to_new[new_id] = new_id
                    option_orig_to_new[str(i)] = new_id
                    option_orig_to_new[str(i + 1)] = new_id
                # Build prompts with numeric-string IDs
                for i, prm in enumerate(prompts):
                    if isinstance(prm, dict):
                        text = prm.get('text') or str(prm.get('value') or '')
                        orig_id = str(prm.get('id')) if prm.get('id') is not None else None
                    else:
                        text = str(prm)
                        orig_id = None
                    new_id = str(i + 1)
                    out_q["prompts"].append({"id": new_id, "text": text, "uid": str(uuid.uuid4())})
                    if orig_id:
                        prompt_orig_to_new[orig_id] = new_id
                    prompt_orig_to_new[new_id] = new_id
                    prompt_orig_to_new[str(i)] = new_id
                    prompt_orig_to_new[str(i + 1)] = new_id
                # Normalize correct_matches to map prompt.id -> option.id with NEW ids
                provided = q.get('correct_matches') or q.get('matches') or {}
                normalized: Dict[str, str] = {}
                if isinstance(provided, dict):
                    for k, v in provided.items():
                        ks, vs = str(k), str(v)
                        if ks in prompt_orig_to_new and vs in option_orig_to_new:
                            normalized[prompt_orig_to_new[ks]] = option_orig_to_new[vs]
                        elif ks in option_orig_to_new and vs in prompt_orig_to_new:
                            # reversed mapping provided
                            normalized[prompt_orig_to_new[vs]] = option_orig_to_new[ks]
                        else:
                            # Try to accept already-normalized ids
                            if ks in prompt_orig_to_new.values() and vs in option_orig_to_new.values():
                                normalized[ks] = vs
                            else:
                                # Last resort: try to map via numeric suffixes or letters
                                # prompt key may be like "prompt2" and value like "B"
                                mk = re.search(r"(\d+)$", ks)
                                if mk:
                                    pi = int(mk.group(1)) - 1
                                    if 0 <= pi < len(out_q["prompts"]):
                                        new_pk = str(pi + 1)
                                    else:
                                        new_pk = None
                                else:
                                    new_pk = None
                                mv = re.search(r"([A-Za-z])$", vs)
                                if mv:
                                    new_ov = mv.group(1).upper()
                                else:
                                    # maybe it's numeric index for option
                                    mi = re.search(r"(\d+)$", vs)
                                    if mi:
                                        oi = int(mi.group(1)) - 1
                                        new_ov = chr(65 + oi) if 0 <= oi < len(out_q["options"]) else None
                                    else:
                                        new_ov = None
                                if new_pk and new_ov:
                                    normalized[new_pk] = new_ov
                out_q["correct_matches"] = normalized
            elif qtype == 'sorting':
                items = q.get('items_to_sort') or q.get('items') or []
                out_q["items_to_sort"] = []
                item_orig_to_new: Dict[str, str] = {}
                for i, item in enumerate(items):
                    if isinstance(item, dict):
                        text = item.get('text') or str(item.get('value') or '')
                        orig_id = str(item.get('id')) if item.get('id') is not None else None
                    else:
                        text = str(item)
                        orig_id = None
                    new_id = chr(65 + i)
                    out_q["items_to_sort"].append({"id": new_id, "text": text, "uid": str(uuid.uuid4())})
                    if orig_id:
                        item_orig_to_new[orig_id] = new_id
                    item_orig_to_new[new_id] = new_id
                    item_orig_to_new[str(i)] = new_id
                    item_orig_to_new[str(i + 1)] = new_id
                desired_order = q.get('correct_order') or []
                mapped_order: List[str] = []
                for token in desired_order:
                    s = str(token)
                    if s in item_orig_to_new:
                        mapped_order.append(item_orig_to_new[s])
                        continue
                    if len(s) == 1 and s.upper() in item_orig_to_new.values():
                        mapped_order.append(s.upper())
                        continue
                    # try suffix number mapping e.g. "step3" -> C
                    m = re.search(r"(\d+)$", s)
                    if m:
                        idx = int(m.group(1)) - 1
                        if 0 <= idx < len(items):
                            mapped_order.append(chr(65 + idx))
                # If mapping failed or incomplete, default to sequential A..Z by items order
                if len(mapped_order) != len(out_q["items_to_sort"]):
                    mapped_order = [itm["id"] for itm in out_q["items_to_sort"]]
                out_q["correct_order"] = mapped_order
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