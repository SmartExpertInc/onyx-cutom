# Onepager Example Contamination Fix

**Date**: October 29, 2025  
**Issue**: Onepagers copying content from examples instead of using source files  
**Status**: ✅ Fixed

## Problem: AI Copying Examples Verbatim

### User Feedback on AI in Sales Onepager
The generated onepager contained:
- ❌ **PESTLE Analysis** and **Five Forces Analysis** (not in AI in Sales lecture)
- ❌ **GlobalSensors Inc.** fictional company (from example, not source)
- ❌ **Strategic Market Analysis** topic mixed with AI in Sales content
- ❌ **White background highlighting** on Expert Analysis section (copy-paste artifact)

### Example of the Problem
```
Source: "AI in Sales" lecture
Expected: Content about AI tools, lead scoring, automation in sales
Actual: Content about PESTLE Analysis, GlobalSensors market entry, Five Forces

WHY? The example showed these frameworks, and the AI copied them.
```

## Root Cause Analysis

### The Conflict Between Requirements and Fidelity
Onepager generation has strict pedagogical requirements:
- **"Mental Models (2-3 REQUIRED)"** → Example shows PESTLE and Five Forces
- **"Worked Examples (2-3 COMPLETE SCENARIOS REQUIRED)"** → Example shows GlobalSensors Inc.
- **"Skill Practice Section (REQUIRED)"** → Example shows market analysis scenario

The AI interpreted these as:
```
❌ "Use the mental models shown in the example (PESTLE, Five Forces)"
✅ SHOULD BE: "Use mental models that appear in the source files"
```

### Why This Happened
1. **Educational quality requirements are strict**: "REQUIRED", "MUST INCLUDE", "NON-NEGOTIABLE"
2. **Examples are comprehensive**: They show exactly what quality looks like
3. **AI takes the path of least resistance**: Copy example rather than extract from source
4. **No explicit warning**: Nothing in the prompt said "don't copy the example content"

## Solution Implemented

### Added ABSOLUTE FINAL INSTRUCTIONS for Onepagers
**Location**: `custom_extensions/backend/main.py` (Lines 31802-31864)  
**Trigger**: Only when `payload.fromFiles = true`  
**Placement**: After all other instructions, immediately before streaming starts

### Key Components of the Fix

#### 1. Example-Independence Rules
```
❌ If the example shows "PESTLE Analysis", and source is about "AI in Sales", do NOT use PESTLE
❌ If the example shows "GlobalSensors market entry", and source is about "AI in Sales", do NOT create market entry scenarios
❌ The example is a STRUCTURE reference only - NOT content to copy
```

#### 2. How to Meet Requirements with Source Fidelity
```
✅ "Mental Models" requirement:
   - If source mentions "Sales Funnel" → Explain how to apply Sales Funnel
   - If source mentions "Customer Journey" → Explain how to apply Customer Journey
   - If source has NO frameworks → Use source concepts as "mental models"

✅ "Worked Examples" requirement:
   - Extract actual examples, case studies, or situations from source
   - If source mentions "lead scoring improved 15-25% to 40-60%" → Build worked example

✅ "Skill Practice" requirement:
   - If source is about "AI in Sales" → Create AI sales scenario
   - If source is about "AWS" → Create AWS implementation scenario
```

#### 3. Specific Prohibitions
```
❌ NEVER use "PESTLE Analysis" unless it's explicitly in the source
❌ NEVER use "Five Forces Analysis" unless it's explicitly in the source
❌ NEVER create "GlobalSensors Inc." or similar fictional companies unless in source
❌ NEVER use "SalesTech", "TechGiant Corp", or other example company names
❌ NEVER create "market analysis" scenarios unless source is about market analysis
❌ NEVER copy skill practice scenarios from examples - create from source content only
```

#### 4. Formatting Issue Fix
```
❌ DO NOT copy-paste text from examples that creates white background highlighting
❌ DO NOT use example text verbatim - it causes formatting issues
✅ Generate fresh content based on source, not example recycling
```

#### 5. Final Verification Checklist
```
Before generating, check:
□ Did I use "PESTLE" or "Five Forces" not in source? → DELETE THEM
□ Did I create "GlobalSensors" or fictional companies not in source? → DELETE THEM
□ Did I copy scenarios from examples instead of source? → REWRITE FROM SOURCE
□ Are my "Mental Models" actually from the source? → VERIFY
□ Are my "Worked Examples" based on source content? → VERIFY
□ Is my "Skill Practice" about the source topic? → VERIFY
```

## Code Changes

### File: `custom_extensions/backend/main.py`

**Lines 31802-31864**: Added ABSOLUTE FINAL INSTRUCTIONS block
```python
# Add ABSOLUTE FINAL fidelity rules if generating from files
# These override ANY previous instructions about using examples, mental models, etc.
if payload.fromFiles:
    wizard_message += """

═══════════════════════════════════════════════════════════════════════════
🚨🚨🚨 ABSOLUTE FINAL INSTRUCTIONS - OVERRIDE ALL PREVIOUS RULES 🚨🚨🚨
═══════════════════════════════════════════════════════════════════════════

YOU ARE GENERATING FROM FILES. THIS CHANGES EVERYTHING.

CRITICAL: The "Mental Models" and "Worked Examples" requirements mean:
- Use mental models ONLY if they appear in the source files
- Create worked examples ONLY using scenarios/data from the source files
...
"""
    logger.info(f"[ONEPAGER_FIDELITY] Added ABSOLUTE FINAL fidelity rules for fromFiles=true")
```

## Why This Fix Is Critical

This addresses a fundamental problem with **example-based learning vs example-based copying**:

1. **Examples are necessary** for showing AI what quality looks like
2. **But examples can be copied** instead of used as templates
3. **The solution**: Explicitly state "example is structure only, not content to copy"
4. **Provide guidance**: Show HOW to meet requirements using source content

This is especially critical for onepagers because:
- They have very strict pedagogical requirements
- The requirements include complex elements (Mental Models, Worked Examples, Skill Practice)
- The examples are detailed and comprehensive
- The AI might feel these requirements can ONLY be met by copying the example

## Expected Results

### Before Fix
```
Source: AI in Sales lecture
Generated: PESTLE Analysis, Five Forces, GlobalSensors market entry scenario
Result: Topic drift, wrong content, user confused
```

### After Fix
```
Source: AI in Sales lecture
Generated: Sales Funnel framework, Lead Scoring example, AI sales scenario
Result: On-topic, source-based, educationally sound
```

## Testing Recommendations

1. **Test with AI in Sales lecture** → Should NOT produce PESTLE/Five Forces
2. **Test with AWS lecture** → Should NOT produce GlobalSensors or market analysis
3. **Test with generic business lecture** → Should use frameworks from that lecture only
4. **Test with framework-light content** → Should create "mental models" from source concepts
5. **Check for white background formatting** → Should be clean, no highlighting

## Integration with Other Fixes

This fix complements the other fidelity fixes:
1. **Presentation fidelity** (Fix #1-3): Ensures presentations don't fabricate data
2. **Template restrictions** (earlier fix): Ensures proper template usage
3. **Diversity enforcement** (Fix #3): Ensures diverse templates while maintaining fidelity
4. **Onepager fidelity** (THIS FIX): Ensures onepagers don't copy example content

Together, these ensure ALL generated products maintain strict source fidelity while meeting quality standards.

## Related Files
- `custom_extensions/backend/main.py` (Lines 31802-31864)
- `custom_extensions/ADAPTIVE_TEMPLATE_SELECTION_AND_FIDELITY_ENHANCEMENT.md` (Full context)

## Critical Update: Issue Persisted in General Knowledge Generation

### New Discovery (2025-10-29)
User reported that the "Expert Analysis" section with market analysis content was appearing **even in general knowledge generation**, not just file-based generation.

**Root Cause**: 
1. The initial fix only applied to `fromFiles=true` cases
2. The system prompt mentioned "Expert Analysis" as a formatting example, which the AI interpreted as a required section name
3. The AI was copying example content structure even for general knowledge topics

### Extended Fix Applied

#### 1. System Prompt Updates (`content_builder_ai.txt`)

**Lines 1442-1467**: Strengthened ANTI-COPYING section to apply to ALL generations:
```
⚠️⚠️⚠️ SPECIFIC PROHIBITIONS (EVEN FOR GENERAL KNOWLEDGE GENERATION): ⚠️⚠️⚠️
- ❌ NEVER use "PESTLE Analysis" for non-business-strategy topics
- ❌ NEVER use "Five Forces" for non-business-strategy topics
- ❌ NEVER create "GlobalSensors", "TechCorp", or similar placeholder companies
- ❌ NEVER create "market entry" scenarios unless topic is market strategy
- ❌ NEVER create sections titled "Expert Analysis" with market analysis content
- ❌ NEVER use section names from examples - create topic-appropriate names
```

Added **TOPIC-APPROPRIATE FRAMEWORK SELECTION**:
```
- For business/market strategy topics → Use PESTLE, Five Forces, Porter's, etc.
- For technical/programming topics → Use CRISP-DM, ML lifecycle, testing pyramid
- For sales/marketing topics → Use Sales Funnel, Customer Journey, Lead Scoring
- For cloud/AWS topics → Use Well-Architected Framework, Cost Optimization
```

Added **FINAL VERIFICATION CHECKLIST**:
```
□ Are my frameworks appropriate for THIS topic? (Not copied from examples)
□ Are my section names topic-specific? (Not "Expert Analysis" or "Available Data")
□ Are my scenarios about THIS topic? (Not about market entry if topic is AI in Sales)
□ Did I avoid placeholder company names? (No GlobalSensors, TechCorp, etc.)
□ Is every piece of content relevant to the requested topic?
```

**Lines 1469-1475**: Clarified that "Expert Analysis" is a FORMAT example, not a required section name:
```
- ⚠️ CRITICAL: "Available Data", "Tasks/Questions", "Expert Analysis" are FORMAT examples, 
  NOT required section names. Your section names must be topic-specific.
```

#### 2. Main.py Updates

**Lines 31802-31878**: Removed `if payload.fromFiles` condition - rules now apply to ALL onepager generation:
```python
# Add ABSOLUTE FINAL anti-copying rules for ALL onepager generation
# These override ANY previous instructions about using examples, mental models, etc.
# Apply to BOTH file-based AND general knowledge generation
wizard_message += """
```

Updated message to distinguish between file-based and general knowledge generation approaches:
```
HOW TO MEET REQUIREMENTS (FILE-BASED GENERATION):
✅ "Mental Models": Extract frameworks mentioned in source files
✅ "Worked Examples": Create scenarios using source content
✅ "Skill Practice": Create exercises about source topic

HOW TO MEET REQUIREMENTS (GENERAL KNOWLEDGE GENERATION):
✅ "Mental Models": Select topic-appropriate frameworks
   - Sales topic → Sales Funnel, Customer Journey
   - AWS topic → Well-Architected Framework
   - NOT generic business frameworks for technical topics
```

### Why This Extended Fix Is Critical

1. **Universal Application**: The problem wasn't limited to file-based generation - it affected ALL onepager generation
2. **Example Misinterpretation**: The AI was treating format examples ("Expert Analysis") as required section names
3. **Framework Selection**: No guidance on which frameworks to use for which topics
4. **Section Naming**: AI needed explicit instruction that section names must be topic-specific

### Expected Results After Extended Fix

**Before**:
- AI in Sales (general knowledge) → PESTLE Analysis + Expert Analysis (market entry)
- AWS (general knowledge) → Five Forces + GlobalSensors scenario
- Python (general knowledge) → Market analysis frameworks

**After**:
- AI in Sales (general knowledge) → Sales Funnel + Lead Scoring + AI Sales Scenario
- AWS (general knowledge) → Well-Architected Framework + AWS Implementation Scenario
- Python (general knowledge) → Testing Pyramid + Code Quality + Python Exercise

## Critical Update #2: MANDATORY PEDAGOGICAL ELEMENTS Section Lacked Warnings

### New Discovery (2025-10-29 - After Initial Fix)
User provided screenshot showing that onepagers STILL contained market analysis content even after the first extended fix. The "AI in Sales" onepager still had PESTLE/Five Forces content.

**Root Cause Identified**: 
The **MANDATORY PEDAGOGICAL ELEMENTS FOR EVERY ONE-PAGER** section (lines 1536-1557) did NOT have any anti-copying warnings attached to it. This section appears AFTER the ANTI-COPYING section and contains requirements like:
- "1. MENTAL MODELS: Provide 2-3 frameworks/models..."
- "5. SKILL PRACTICE: Include 3-5 scenario-based practice items..."

The AI was reading these requirements as "fulfill these using ANY content available", which meant copying from examples.

### Final Fix Applied

**System Prompt (`content_builder_ai.txt`, Lines 1536-1577)**: Added explicit warnings to EVERY pedagogical requirement:

```
**MANDATORY PEDAGOGICAL ELEMENTS FOR EVERY ONE-PAGER:**

⚠️⚠️⚠️ CRITICAL: These are STRUCTURE requirements, NOT content to copy from examples! ⚠️⚠️⚠️
⚠️⚠️⚠️ You MUST create topic-appropriate content, NOT copy PESTLE/Five Forces/GlobalSensors! ⚠️⚠️⚠️

1. MENTAL MODELS:
   ⚠️ MUST BE TOPIC-APPROPRIATE:
   - AI in Sales → Use "Sales Funnel", "Lead Scoring Matrix", "Customer Journey Map"
   - AWS/Cloud → Use "Well-Architected Framework", "Cost Optimization Hierarchy"
   ❌ DO NOT USE: "PESTLE Analysis", "Five Forces" unless topic IS business strategy

2. WORKED EXAMPLES:
   ⚠️ MUST BE ABOUT THIS TOPIC:
   - AI in Sales → Show AI lead scoring implementation, chatbot deployment
   ❌ DO NOT CREATE: Market entry scenarios, GlobalSensors examples

5. SKILL PRACTICE:
   ⚠️ CRITICAL SECTION NAME REQUIREMENT:
   ❌ DO NOT title this "Expert Analysis" with market analysis content
   ✅ Use topic-specific names: "AI Sales Scenario Analysis", "AWS Implementation Exercise"
   ⚠️ Scenario MUST match the topic:
   - AI in Sales → Create AI sales scenario
   ❌ NEVER create market entry/analysis scenarios for technical topics
```

**Changed in 3 locations** (lines 1536-1577, 3499-3540, 5462-5503) using `replace_all`.

### Why This Final Fix Is Essential

1. **Instruction Placement**: The MANDATORY PEDAGOGICAL ELEMENTS section appears AFTER the ANTI-COPYING section in the prompt
2. **Recency Bias**: AI gives more weight to later instructions
3. **No Cross-Reference**: The MANDATORY section didn't reference the anti-copying rules, so AI treated them as separate requirements
4. **Missing Context**: Each requirement now has explicit "MUST BE TOPIC-APPROPRIATE" warnings and examples

This fix ensures that EVERY TIME the AI reads the pedagogical requirements, it also reads the anti-copying warnings directly attached to those requirements.

## Status
✅ Implementation Complete (Including All Fixes)  
✅ Linter Checks Passed  
✅ Documentation Updated  
✅ System Prompt ANTI-COPYING Section Updated (Lines 1442-1475)  
✅ System Prompt MANDATORY PEDAGOGICAL ELEMENTS Updated (Lines 1536-1577, 3499-3540, 5462-5503)  
✅ Main.py Updated (Lines 31802-31878)  
⏳ Awaiting User Testing (All Generation Modes)

