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


def _render_slide_deck_html(product_row: Dict[str, Any], content: Any) -> str:
    title = product_row.get('project_name') or product_row.get('microproduct_name') or 'Presentation'
    slides = []
    try:
        if isinstance(content, dict):
            # common keys: slides or details.slides
            slides = content.get('slides') or (content.get('details') or {}).get('slides') or []
    except Exception:
        slides = []
    if not isinstance(slides, list):
        slides = []
    # Simplified slide rendering
    slide_items = []
    for idx, s in enumerate(slides):
        if isinstance(s, dict):
            stitle = s.get('slideTitle') or s.get('title') or f"Slide {idx+1}"
            sprops = s.get('props') or {}
            left = sprops.get('leftContent') or sprops.get('content') or ''
            right = sprops.get('rightContent') or ''
            img = sprops.get('imagePath') or sprops.get('imageUrl') or ''
            inner = f"<h2>{_xml_escape(stitle)}</h2>"
            if img:
                inner += f"<div class=\"img\"><img src=\"{_xml_escape(img)}\" alt=\"\"/></div>"
            inner += f"<div class=\"cols\"><div class=\"col\">{left or ''}</div><div class=\"col\">{right or ''}</div></div>"
            slide_items.append(f"<section class=\"slide\" data-index=\"{idx}\" style=\"display:{'block' if idx==0 else 'none'}\">{inner}</section>")
    body = "".join(slide_items) or "<p>No slides.</p>"
    # Inline SCORM navigation controller
    controller = """
<script>
(function(){
  var current = 0;
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function show(i){
    var slides = qsa('.slide');
    if (i < 0 || i >= slides.length) return;
    slides.forEach(function(s, idx){ s.style.display = (idx===i)?'block':'none'; });
    current = i;
    try {
      if (window.API_1484_11) {
        var p = slides.length ? ( (i+1)/slides.length ) : 0;
        API_1484_11.SetValue('cmi.location', String(i));
        API_1484_11.SetValue('cmi.progress_measure', String(p));
        if (p >= 1) { API_1484_11.SetValue('cmi.completion_status', 'completed'); }
        API_1484_11.Commit('');
      }
    } catch(e){}
  }
  window.nextSlide = function(){ show(current+1); };
  window.prevSlide = function(){ show(current-1); };
  window.addEventListener('load', function(){
    try {
      if (window.API_1484_11) {
        var last = API_1484_11.GetValue('cmi.location');
        if (last && !isNaN(parseInt(last))) show(parseInt(last));
      }
    } catch(e){}
  });
})();
</script>
"""
    nav = "<div class=\"nav\"><button onclick=\"prevSlide()\">Prev</button><button onclick=\"nextSlide()\">Next</button></div>"
    styles = """
<style>
  .slide{padding:16px;}
  .img img{max-width:100%;height:auto;display:block;margin:12px 0;}
  .cols{display:flex;gap:16px;}
  .col{flex:1;}
  .nav{display:flex;gap:8px;margin:12px 0;}
  button{padding:6px 12px;border:1px solid #ccc;background:#f7f7f7;cursor:pointer}
</style>
"""
    html = f"{styles}{nav}{body}{nav}{controller}"
    return _wrap_html_as_sco(title, html)


def _render_quiz_html(product_row: Dict[str, Any], content: Any) -> str:
    title = product_row.get('project_name') or product_row.get('microproduct_name') or 'Quiz'
    # Extract questions from stored content
    raw_questions = []
    try:
        if isinstance(content, dict):
            if isinstance(content.get('questions'), list):
                raw_questions = content.get('questions')
            elif 'details' in content and isinstance(content['details'], dict) and isinstance(content['details'].get('questions'), list):
                raw_questions = content['details']['questions']
    except Exception:
        raw_questions = []

    # Normalize to supported types: multiple-choice, multi-select, matching, sorting, open-answer
    questions = []
    if isinstance(raw_questions, list):
        for q in raw_questions:
            if not isinstance(q, dict):
                continue
            qt = (q.get('question_type') or q.get('type') or '').strip().lower()
            if qt in ('multiple-choice', 'multiple_choice', 'single-choice', 'single_choice'):
                questions.append({
                    'type': 'multiple-choice',
                    'text': q.get('question_text') or q.get('text') or '',
                    'options': q.get('options') or [],
                    'correct_option_id': q.get('correct_option_id')
                })
            elif qt in ('multi-select', 'multi_select', 'multiple-select'):
                questions.append({
                    'type': 'multi-select',
                    'text': q.get('question_text') or q.get('text') or '',
                    'options': q.get('options') or [],
                    'correct_option_ids': q.get('correct_option_ids') or []
                })
            elif qt in ('matching',):
                questions.append({
                    'type': 'matching',
                    'text': q.get('question_text') or q.get('text') or '',
                    'prompts': q.get('prompts') or q.get('left') or [],
                    'options': q.get('options') or q.get('right') or [],
                    'correct_matches': q.get('correct_matches') or {}
                })
            elif qt in ('sorting', 'order', 'ranking'):
                questions.append({
                    'type': 'sorting',
                    'text': q.get('question_text') or q.get('text') or '',
                    'items_to_sort': q.get('items_to_sort') or q.get('items') or [],
                    'correct_order': q.get('correct_order') or []
                })
            elif qt in ('open-answer', 'open_answer', 'free-text', 'free_text', 'short-answer'):
                questions.append({
                    'type': 'open-answer',
                    'text': q.get('question_text') or q.get('text') or '',
                    'acceptable_answers': q.get('acceptable_answers') or []
                })
    # Fallback if nothing recognized
    if not questions:
        questions = [{
            'type': 'multiple-choice',
            'text': 'Sample question: 2 + 2 = ?',
            'options': [ {'id':'A','text':'3'}, {'id':'B','text':'4'} ],
            'correct_option_id': 'B'
        }]

    # Render HTML for all supported types
    def esc(s):
        try: return _xml_escape(s)
        except: return ''

    blocks: List[str] = []
    answer_keys: List[Dict[str, Any]] = []

    for qi, q in enumerate(questions):
        qtype = q.get('type')
        qtext = q.get('text') or f"Question {qi+1}"
        if qtype == 'multiple-choice':
            opts = q.get('options') or []
            ohtml = []
            for o in opts:
                oid = str(o.get('id') or '')
                olabel = o.get('text') or oid
                ohtml.append(f"<label><input type=\"radio\" name=\"q{qi}\" value=\"{esc(oid)}\"/> {esc(olabel)}</label>")
            blocks.append(f"<div class=\"question\" data-type=\"mc\"><div class=\"qtext\">{esc(qtext)}</div>{''.join(ohtml)}</div>")
            answer_keys.append({'type':'mc','correct': str(q.get('correct_option_id') or '')})
        elif qtype == 'multi-select':
            opts = q.get('options') or []
            ohtml = []
            for o in opts:
                oid = str(o.get('id') or '')
                olabel = o.get('text') or oid
                ohtml.append(f"<label><input type=\"checkbox\" name=\"q{qi}\" value=\"{esc(oid)}\"/> {esc(olabel)}</label>")
            blocks.append(f"<div class=\"question\" data-type=\"ms\"><div class=\"qtext\">{esc(qtext)}</div>{''.join(ohtml)}</div>")
            answer_keys.append({'type':'ms','correct': [str(x) for x in (q.get('correct_option_ids') or [])]})
        elif qtype == 'matching':
            prompts = q.get('prompts') or []
            options = q.get('options') or []
            # Renders as select per prompt
            prom_html = []
            for p in prompts:
                pid = str(p.get('id') or '')
                ptxt = p.get('text') or pid
                sel_opts = [f"<option value=\"\">--</option>"]
                for o in options:
                    oid = str(o.get('id') or '')
                    otxt = o.get('text') or oid
                    sel_opts.append(f"<option value=\"{esc(oid)}\">{esc(otxt)}</option>")
                prom_html.append(f"<div class=\"match-row\"><span class=\"prompt\">{esc(ptxt)}</span> <select name=\"q{qi}-{esc(pid)}\">{''.join(sel_opts)}</select></div>")
            blocks.append(f"<div class=\"question\" data-type=\"mt\"><div class=\"qtext\">{esc(qtext)}</div>{''.join(prom_html)}</div>")
            answer_keys.append({'type':'mt','correct': q.get('correct_matches') or {}})
        elif qtype == 'sorting':
            items = q.get('items_to_sort') or []
            li_html = []
            for i in items:
                iid = str(i.get('id') or '')
                itxt = i.get('text') or iid
                li_html.append(f"<li data-id=\"{esc(iid)}\">{esc(itxt)} <button type=\"button\" class=\"up\">↑</button> <button type=\"button\" class=\"down\">↓</button></li>")
            blocks.append(f"<div class=\"question\" data-type=\"so\"><div class=\"qtext\">{esc(qtext)}</div><ul class=\"sortable\">{''.join(li_html)}</ul></div>")
            answer_keys.append({'type':'so','correct': [str(x) for x in (q.get('correct_order') or [])]})
        elif qtype == 'open-answer':
            blocks.append(f"<div class=\"question\" data-type=\"oa\"><div class=\"qtext\">{esc(qtext)}</div><input type=\"text\" name=\"q{qi}\" class=\"oa-input\"/></div>")
            answer_keys.append({'type':'oa','correct': [str(x).strip().lower() for x in (q.get('acceptable_answers') or [])]})
        else:
            # Unknown type → treat as open-answer no scoring
            blocks.append(f"<div class=\"question\"><div class=\"qtext\">{esc(qtext)}</div></div>")
            answer_keys.append({'type':'na'})

    styles = """
<style>
  .question{margin:14px 0;padding:12px;border:1px solid #e5e7eb;border-radius:8px}
  .qtext{font-weight:600;margin-bottom:8px}
  .match-row{display:flex;gap:8px;align-items:center;margin:4px 0}
  .sortable{list-style:none;padding-left:0}
  .sortable li{margin:6px 0;padding:6px;border:1px dashed #cbd5e1;border-radius:6px}
  .submit{margin-top:16px}
  .result{margin-top:8px;font-weight:600}
</style>
"""
    keys_json = json.dumps(answer_keys)
    controller = """
<script>
(function(){
  function qsa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function byName(n){ return Array.prototype.slice.call(document.getElementsByName(n)); }
  function getScore(){
    var keys = JSON.parse(document.getElementById('scorm-quiz-keys').textContent || '[]');
    var correct = 0, total = keys.length;
    qsa('.question').forEach(function(qEl, idx){
      var k = keys[idx] || {}; var t = k.type;
      if (t === 'mc'){
        var radios = byName('q'+idx);
        var sel = radios.find(function(r){ return r.checked; });
        if (sel && String(sel.value)===String(k.correct)) correct++;
      } else if (t === 'ms'){
        var checks = byName('q'+idx).filter(function(c){ return c.checked; }).map(function(c){ return String(c.value); });
        var target = (k.correct||[]).map(String).sort().join('|');
        var got = checks.slice().sort().join('|');
        if (target && target===got) correct++;
      } else if (t === 'mt'){
        var allMatch = true;
        var corr = k.correct || {};
        Object.keys(corr).forEach(function(pid){
          var sel = document.querySelector('select[name="q'+idx+'-'+pid+'"]');
          if (!sel || String(sel.value)!==String(corr[pid])) allMatch=false;
        });
        if (allMatch) correct++;
      } else if (t === 'so'){
        var li = qEl.querySelectorAll('.sortable li');
        var order = Array.prototype.map.call(li, function(el){ return String(el.getAttribute('data-id')); });
        var target = (k.correct||[]).map(String);
        var ok = target.length===order.length && target.every(function(v,i){ return v===order[i]; });
        if (ok) correct++;
      } else if (t === 'oa'){
        var inp = qEl.querySelector('.oa-input');
        var val = (inp && inp.value || '').trim().toLowerCase();
        var acc = (k.correct||[]);
        if (val && acc.indexOf(val)>=0) correct++;
      }
    });
    return {correct: correct, total: total};
  }
  function commitToSCORM(score){
    try {
      if (window.API_1484_11){
        var scaled = score.total? (score.correct/score.total) : 0;
        API_1484_11.SetValue('cmi.score.scaled', String(scaled));
        API_1484_11.SetValue('cmi.score.raw', String(score.correct));
        API_1484_11.SetValue('cmi.score.max', String(score.total));
        API_1484_11.SetValue('cmi.success_status', scaled >= 0.7 ? 'passed' : 'failed');
        API_1484_11.SetValue('cmi.completion_status', 'completed');
        API_1484_11.Commit('');
      }
    } catch(e){}
  }
  window.submitQuiz = function(){
    var s = getScore();
    commitToSCORM(s);
    var rs = document.getElementById('quiz-result');
    if (rs) rs.textContent = 'Score: '+s.correct+' / '+s.total;
    alert('Score: '+s.correct+' / '+s.total);
  };
  // sorting controls
  document.addEventListener('click', function(e){
    if (e.target && e.target.classList.contains('up')){
      var li = e.target.closest('li'); var prev = li && li.previousElementSibling;
      if (li && prev) li.parentNode.insertBefore(li, prev);
    }
    if (e.target && e.target.classList.contains('down')){
      var li = e.target.closest('li'); var next = li && li.nextElementSibling && li.nextElementSibling.nextElementSibling;
      if (li && li.nextElementSibling) li.parentNode.insertBefore(li.nextElementSibling, li);
    }
  });
})();
</script>
"""
    body = f"{''.join(blocks)}<button class=\"submit\" onclick=\"submitQuiz()\">Submit</button><div id=\"quiz-result\" class=\"result\"></div>"
    hidden_keys = f"<script id=\"scorm-quiz-keys\" type=\"application/json\">{keys_json}</script>"
    return _wrap_html_as_sco(title, styles + body + hidden_keys + controller)


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
                    body_html = _render_slide_deck_html(matched, content if isinstance(content, dict) else {})
                elif any(t in (mtype, comp) for t in ['quiz', 'quizdisplay']):
                    body_html = _render_quiz_html(matched, content if isinstance(content, dict) else {})
                else:
                    continue

                # Write SCO HTML into package
                sco_dir = f"sco_{product_id}"
                href = f"{sco_dir}/index.html"
                res_id = f"res-{product_id}"
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