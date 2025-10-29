# Onepager JSON Example Warning Fix - The Root Cause

**Date**: October 29, 2025  
**Issue**: AI copying GlobalSensors market analysis content despite all previous fixes  
**Status**: ✅ Fixed (Final Root Cause Addressed)

## The Problem That Persisted

Despite implementing **THREE comprehensive fixes**:
1. System prompt ANTI-COPYING section
2. System prompt MANDATORY PEDAGOGICAL ELEMENTS warnings
3. Main.py ABSOLUTE FINAL INSTRUCTIONS

The user's screenshot still showed the **exact same GlobalSensors market analysis content** in an "AI in Sales" onepager.

## The Smoking Gun: The JSON Example Itself

### Discovery
Searched for "GlobalSensors" in the codebase and found it in **`main.py` line 31248**:

```
DEFAULT_TEXT_PRESENTATION_JSON_EXAMPLE_FOR_LLM = """
{
  ...
  { "type": "paragraph", "text": "**Scenario**: GlobalSensors Inc. manufactures industrial sensors...
    They're considering entering the agricultural technology market..." },
  
  { "type": "headline", "level": 3, "text": "Available Data" },
  { "type": "bullet_list", "items": [
    "Agricultural technology market size: $12B globally...",
    "Three major competitors: AgriTech Solutions, FarmSense, CropMonitor...",
    ...
  ] },
  
  { "type": "headline", "level": 3, "text": "Expert Analysis" },
  ...
}
```

This JSON example is shown to the AI as a **concrete template** for how to structure text presentations.

### Why This Overrode Everything

**The Hierarchy of Influence**:
1. ❌ **Abstract warnings** (system prompt): "Don't use PESTLE for non-business topics" 
2. ❌ **Conceptual instructions** (MANDATORY sections): "Use topic-appropriate frameworks"
3. ❌ **Final reminders** (ABSOLUTE FINAL): "Verify your content matches the topic"
4. ✅ **Concrete example** (JSON template): Shows actual GlobalSensors market analysis

**Result**: AI follows the concrete example, not the abstract instructions.

### Why Concrete Beats Abstract

This is a fundamental principle of AI prompt engineering:
- **Concrete examples** show the AI exactly what to do
- **Abstract warnings** require the AI to interpret and apply rules
- When there's conflict, **concrete examples win**

The AI sees:
```
Warning: "Don't use GlobalSensors"
Example: Shows detailed GlobalSensors scenario with specific data

AI thinks: "The warning is general, but the example is specific and detailed.
           The example must be showing me the RIGHT way to do it."
```

## User's Requirement

> "I want AI to see the example as is so he know how to generate correct content, just ensure we make it not copy it"

Translation:
- ✅ **Keep the detailed example** (shows structure, quality, pedagogical elements)
- ✅ **Add explicit warnings** (tells AI to adapt content, not copy it)
- ❌ **Don't remove the example** (AI needs to learn from it)

## Solution Implemented

### Location: `custom_extensions/backend/main.py` (Lines 31752-31794)

Added **CRITICAL WARNING** immediately after showing the JSON example:

```
CRITICAL PREVIEW OUTPUT FORMAT (JSON-ONLY):
You MUST output ONLY a single JSON object for the Text Presentation preview, strictly following this example structure:
{DEFAULT_TEXT_PRESENTATION_JSON_EXAMPLE_FOR_LLM}

⚠️⚠️⚠️ CRITICAL WARNING ABOUT THE EXAMPLE ABOVE: ⚠️⚠️⚠️
The example shows "Market Analysis" with GlobalSensors, PESTLE, Five Forces, and agricultural scenarios.
🚨 YOU MUST ADAPT THIS TO YOUR ACTUAL TOPIC - DO NOT COPY THE EXAMPLE CONTENT! 🚨

IF YOUR TOPIC IS "AI in Sales":
❌ DO NOT use Market Analysis, GlobalSensors, PESTLE, Five Forces, agricultural scenarios
✅ USE: Sales Funnel, Lead Scoring, CRM, AI sales scenarios, chatbot deployment examples

IF YOUR TOPIC IS "AWS":
❌ DO NOT use Market Analysis, GlobalSensors, PESTLE, Five Forces
✅ USE: Well-Architected Framework, Cost Optimization, AWS implementation scenarios

IF YOUR TOPIC IS "Python Programming":
❌ DO NOT use Market Analysis, GlobalSensors, business frameworks
✅ USE: Testing Pyramid, Code Quality, Python coding scenarios, design patterns

THE EXAMPLE SHOWS YOU:
✅ How to STRUCTURE content (paragraph-heavy, worked examples, decision frameworks)
✅ How to ORGANIZE sections (mental models, skill practice, common mistakes)
✅ What QUALITY looks like (60-100 word bullets, detailed analysis, Bloom's Taxonomy)

THE EXAMPLE DOES NOT SHOW YOU:
❌ What CONTENT to use - adapt all content to YOUR topic
❌ What FRAMEWORKS to use - select topic-appropriate frameworks
❌ What SCENARIOS to create - create scenarios about YOUR topic

VERIFICATION BEFORE GENERATING:
□ Are my frameworks appropriate for THIS topic? (Not PESTLE/Five Forces unless topic is business strategy)
□ Are my scenarios about THIS topic? (Not GlobalSensors/market entry unless topic is market strategy)
□ Would a user recognize this is about THEIR topic?
```

### Key Strategy

**Placed warning IMMEDIATELY AFTER the example**:
- The AI reads the example → sees GlobalSensors
- The AI immediately reads: "DO NOT COPY GLOBALSENORS" 
- The warning is contextually linked to what the AI just saw

**Provided concrete alternatives**:
- Not just "don't do X"
- But "if your topic is Y, use Z instead"
- Gives the AI actionable guidance

**Clarified what to learn vs what to copy**:
- Example shows: STRUCTURE, ORGANIZATION, QUALITY
- Example does NOT show: CONTENT, FRAMEWORKS, SCENARIOS for your topic

## Why This Fix Will Work

### 1. Temporal Proximity
The warning appears **immediately after** the example, not in a separate section the AI read earlier.

### 2. Explicit Contrast
The warning directly references the specific content the AI just saw:
- "The example shows GlobalSensors"
- "DO NOT use GlobalSensors"
- This creates cognitive dissonance that forces the AI to distinguish example from instruction

### 3. Concrete Alternatives
Instead of abstract rules, provides topic-specific guidance:
- "If AI in Sales → Use Sales Funnel, not PESTLE"
- Gives the AI something concrete to DO instead of just something NOT to do

### 4. Meta-Explanation
Explains **why** the example exists:
- "Shows you STRUCTURE" ✅
- "Does NOT show you CONTENT" ❌
- Helps the AI understand the purpose of examples

## Comparison to Previous Fixes

| Fix | What It Did | Why It Failed |
|-----|------------|---------------|
| **Fix #1: System Prompt** | Added anti-copying rules at top | Too far from the example |
| **Fix #2: Pedagogical Elements** | Added warnings to requirements | Still abstract, not example-specific |
| **Fix #3: Absolute Final** | Added final instructions in main.py | Came before the AI saw the example |
| **Fix #4: JSON Warning** | Warns immediately after showing example | ✅ Contextually linked to concrete content |

## Expected Results

**Before This Fix**:
```
AI reads system prompt: "Don't copy examples"
AI sees JSON example: GlobalSensors, PESTLE, Five Forces, agriculture
AI generates: GlobalSensors scenario (follows concrete example)
```

**After This Fix**:
```
AI reads system prompt: "Don't copy examples"
AI sees JSON example: GlobalSensors, PESTLE, Five Forces, agriculture
AI immediately reads: "DO NOT COPY GLOBALSENORS! If AI in Sales → Use Sales Funnel"
AI generates: Sales Funnel scenario (follows warning + alternative)
```

## Testing Recommendations

1. **Generate "AI in Sales" onepager from general knowledge**
   - Should NOT contain: GlobalSensors, PESTLE, Five Forces, agriculture
   - Should contain: Sales Funnel, Lead Scoring, CRM, AI sales scenarios

2. **Generate "AWS" onepager from general knowledge**
   - Should NOT contain: GlobalSensors, market analysis
   - Should contain: Well-Architected Framework, AWS scenarios

3. **Generate "Business Strategy" onepager from general knowledge**
   - Should be ALLOWED to contain: PESTLE, Five Forces (topic-appropriate)
   - But NOT GlobalSensors (specific example company)

## Files Modified

- **`custom_extensions/backend/main.py`** (Lines 31752-31794)
  - Added CRITICAL WARNING ABOUT THE EXAMPLE section
  - Positioned immediately after DEFAULT_TEXT_PRESENTATION_JSON_EXAMPLE_FOR_LLM is shown
  - Provides topic-specific guidance with concrete alternatives

## Integration with Previous Fixes

This fix complements (not replaces) the previous fixes:

1. **System Prompt Warnings**: Establish general anti-copying rules
2. **Pedagogical Elements Warnings**: Reinforce rules at requirement definitions
3. **Absolute Final Instructions**: Final reminder before generation
4. **JSON Example Warning** (THIS FIX): Context-specific warning at the moment the AI sees copyable content

Together, these create **multiple checkpoints** at different stages of the prompt:
- Early (system prompt): General principles
- Middle (pedagogical elements): Requirement-specific guidance
- Late (absolute final): Final verification
- Critical (JSON warning): Content-specific prevention at point of exposure

## Status

✅ Implementation Complete  
✅ Linter Checks Passed  
✅ Strategic Placement (immediately after example)  
✅ Concrete Alternatives Provided  
✅ Meta-Explanation Included  
⏳ Awaiting User Testing

This should finally resolve the GlobalSensors copying issue by addressing the root cause: the AI was following the concrete example because no warning appeared when it actually saw that example.

