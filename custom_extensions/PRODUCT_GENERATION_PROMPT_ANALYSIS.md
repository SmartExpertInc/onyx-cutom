# Product Generation Prompt Analysis

## Current State

There are **TWO different** `stream_hybrid_response` functions with **different system prompts**:

### Version 1: With Source Fidelity Prompt ✅ (Line 10645)
**System Prompt**: EDUCATIONAL CONTENT RESTRUCTURER with ABSOLUTE SOURCE FIDELITY
**Used By**:
- ✅ Course Outline generation (line 17178)

**Features**:
- Direct OpenAI call with custom system message
- Source fidelity rules embedded
- Prohibits adding general knowledge
- Emphasizes restructuring over creating

### Version 2: Uses ContentBuilder.ai assistant ⚠️ (Line 12420)
**System Prompt**: Reads from `custom_assistants/content_builder_ai.txt`
**Used By**:
- ⚠️ Lesson Presentations (line 24681)
- ⚠️ Quiz generation (line 29989)
- ⚠️ Text Presentations (line 31611)

**Features**:
- Calls `stream_openai_response` (line 5222)
- Uses generic assistant instructions from file
- Has some anti-hallucination protocol but less strict
- Does NOT have source fidelity emphasis

## The Problem

**Only Course Outlines** are using the new source fidelity prompt.

**Presentations, Quizzes, and Text Presentations** are still using the old generic prompt that:
- ❌ Doesn't emphasize source-only content
- ❌ Allows "illustrative examples" (can add content)
- ❌ Doesn't have strict restructuring-only rules
- ❌ Doesn't prohibit general knowledge additions

## Products Affected

### ✅ Using Source Fidelity Prompt
1. **Course Outlines** - GOOD

### ⚠️ NOT Using Source Fidelity Prompt  
2. **Lesson Presentations** - Needs update
3. **Quizzes** - Needs update
4. **Text Presentations** - Needs update

## Recommendation

We need to either:

**Option A**: Update `stream_openai_response` to detect file context and add source fidelity rules
**Option B**: Make all products use the first version of `stream_hybrid_response` (line 10645)
**Option C**: Update `content_builder_ai.txt` to include source fidelity rules

**Best Choice**: Option C - Update the assistant instructions file to include source fidelity rules when fromFiles=true

