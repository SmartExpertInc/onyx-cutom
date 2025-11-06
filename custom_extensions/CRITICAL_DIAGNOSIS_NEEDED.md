# CRITICAL: Source Fidelity Still Failing - Diagnosis Needed

## Situation

Despite implementing **extreme multi-layer enforcement**, the AI is **still hallucinating** and generating content about completely different topics.

### Test Results

**Test #1** (Before any fixes):
- Source: "AI in Sales"
- Output: "Market Analysis" (GlobalSensors, Five Forces, PESTLE)
- Fidelity: 0%

**Test #2** (After extreme enforcement):
- Source: "AI in Sales"
- Output: "AI in Sales" ✅ **CORRECT TOPIC!**
- Content: 50-60% fidelity (created new examples, but topic was correct)

**Test #3** (Latest):
- Source: "AI in Sales"
- Output: **"Market Analysis" again** ❌ (GlobalSensors, Five Forces, PESTLE)
- Fidelity: 0%

## Critical Problem

Test #3 output is **IDENTICAL to Test #1** output, which suggests:

1. **Either**: The file content is NOT reaching the AI (extraction problem)
2. **Or**: There's some caching/template that's overriding the source content
3. **Or**: The AI is completely ignoring all fidelity instructions

## Enforcement Layers Implemented

We now have **6 layers** of enforcement:

### Layer 1: System Prompt
- PRIORITY 2: 100 lines of source fidelity rules in `content_builder_ai.txt`

### Layer 2: Opening Warning (Checkpoint #1)
- 🚨 "ABSOLUTE SOURCE FIDELITY MODE ACTIVATED"
- "YOUR GENERAL KNOWLEDGE IS COMPLETELY DISABLED"
- 3-item pre-commitment checklist

### Layer 3: Examples Clarification
- Concrete examples: "If source says '25% to 50%' → use that EXACT stat"
- Explicit prohibitions: "DO NOT create 'retail company' examples"

### Layer 4: Closing Questions (Checkpoint #2)  
- 5 questions forcing recall and confirmation
- Question 1: "What SPECIFIC topics, statistics were in source?"
- Question 3: "Can you create NEW examples?" → "NO"
- Question 5: "Can you add new numbers?" → "NO"

### Layer 5: Final Command
- 🛑 "BEFORE YOU START GENERATING, ANSWER THIS:"
- "What was the MAIN TOPIC of the source documents?"
- "YOUR PRODUCT TOPIC MUST MATCH THE SOURCE TOPIC EXACTLY"
- Explicit examples: "Don't generate about 'Market Analysis' if source was 'AI in Sales'"

### Layer 6: Debug Logging
- Added logging to see what content is actually being passed to AI

## Diagnostic Steps Needed

### Step 1: Check Logs
Look for `[FIDELITY_DEBUG]` in logs when generating the next onepager:
```
[FIDELITY_DEBUG] File context (string): XXXX chars
[FIDELITY_DEBUG] Content preview: [first 500 chars]
```

**Critical Question**: Does the content preview show "AI in Sales" content or something else?

### Step 2: Check Source
If logs show correct "AI in Sales" content → The AI is ignoring all instructions (model limitation)
If logs show different content → The extraction is returning wrong content (bug in extraction)

### Step 3: Possible Root Causes

#### Hypothesis A: Extraction Returns Cached Content
- File extraction might be returning cached/old analysis
- The "EXTRACTED_CONTENT" from legacy AI analysis might be generic
- Check if `extract_single_file_context_legacy` is being called instead of raw extraction

#### Hypothesis B: Template Override
- There might be a hardcoded template for "onepager" that always uses "Market Analysis"
- Check if there's a onepager-specific prompt override

#### Hypothesis C: Model Limitation
- The AI model might have a strong bias toward "Market Analysis" for onepagers
- Even with extreme instructions, model might override them

#### Hypothesis D: Prompt Truncation
- The enhanced prompt might be too long (>100k tokens)
- OpenAI might be truncating the actual source content
- Only the fidelity instructions survive, but actual content is cut off

## Immediate Action Items

### 1. Enable Debug Logging
Debug logging is now active in `build_enhanced_prompt_with_context()`. 
Next generation will show:
- `[FIDELITY_DEBUG] File context (string): XXXX chars` 
- `[FIDELITY_DEBUG] Content preview: ...`

**ACTION**: Generate onepager again and share the logs

### 2. Check USE_RAW_EXTRACTION Flag
**Location**: `custom_extensions/backend/main.py` (search for `USE_RAW_EXTRACTION`)
**Current Value**: Should be `True`
**ACTION**: Verify this flag is `True`

### 3. Verify Extraction Method
When `USE_RAW_EXTRACTION = True`, the system should:
- Call `extract_raw_file_content()` 
- Which falls back to `extract_single_file_context_legacy()`
- Which calls Onyx chat API with "CONTENT EXTRACTION SPECIALIST" prompt

**ACTION**: Check logs for `[RAW_EXTRACTION]` or `[FILE_CONTEXT]` entries

### 4. Test with Minimal Prompt
Try generating with just the source content, NO fidelity instructions:
```
Source: [AI in Sales content]

Generate a onepager about the topic above.
```

If this works → Fidelity instructions are somehow causing the problem
If this fails → Extraction is returning wrong content

## Files Modified (Latest Changes)

1. **`custom_extensions/backend/main.py`**
   - Lines 12046-12056: Added debug logging
   - Lines 12153-12171: Added 🛑 FINAL COMMAND section

## Next Steps

1. ✅ **Generate again** and capture full logs
2. ✅ **Look for `[FIDELITY_DEBUG]`** entries
3. ✅ **Check if content preview shows "AI in Sales" or "Market Analysis"**
4. ✅ **Share the logs** so we can diagnose the root cause

## Possible Solutions (Based on Diagnosis)

### If Extraction is Wrong:
- Fix the extraction method
- Ensure `extract_single_file_context_legacy` is using correct analysis prompt
- Verify file ID is correct

### If Content is Correct but AI Ignores It:
- Try different AI model (gpt-4 instead of gpt-4o-mini)
- Try shorter, more direct instructions
- Try putting source content AFTER instructions (not before)

### If Prompt is Too Long:
- Reduce fidelity instruction verbosity
- Truncate source content intelligently
- Use multiple-pass generation (analyze first, generate second)

## Status

🔴 **CRITICAL ISSUE**: Despite 6 layers of enforcement, source fidelity is 0% on latest test
🟡 **DEBUG LOGGING**: Now active for next generation
🟢 **ENFORCEMENT COMPLETE**: All possible instruction layers implemented

**Next**: Need logs to diagnose root cause.

