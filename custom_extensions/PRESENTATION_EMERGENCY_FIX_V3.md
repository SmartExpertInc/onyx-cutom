# Presentation Emergency Fix V3 - Critical Rule Enforcement

## Emergency Situation

Despite two previous fixes, user reports presentations are **STILL** generating:
1. ❌ Fake percentages: "100%, 50%, 30%"
2. ❌ Generic comparisons: "Company A, Company B"
3. ❌ Same templates reused repeatedly

**Status**: CRITICAL - Rules are being ignored despite being present in the system.

## Root Cause Analysis

### Why Previous Fixes Failed:

1. **Rule Burial**: Critical prohibitions were positioned as items #7 and #8 in a list, making them easy to miss
2. **No Verification Step**: AI had no checkpoint to verify compliance before completion
3. **Insufficient Emphasis**: Rules weren't marked as "BEFORE YOU GENERATE ANYTHING"
4. **No Explicit Examples**: Didn't show the exact violations being reported ("100%, 50%, 30%")
5. **Missing Forbidden Patterns**: Didn't explicitly ban "Company A vs Company B" pattern

### Psychological Issue:

The AI was likely:
- Reading instructions sequentially and running out of context before reaching critical rules
- Not understanding that rules #7-#8 were MORE important than rules #1-#6
- Having no forcing function to check compliance before submission

## Solution: Emergency Restructuring

### Strategy: Front-Load Critical Rules + Verification Checkpoints

**Principle**: Most violated rules go FIRST with unavoidable verification steps.

## Implementation

### Part 1: System Prompt (`content_builder_ai.txt`)

**Added "CRITICAL RULES - VERIFY BEFORE SUBMITTING" Section at TOP:**

```
CORE EDUCATIONAL CONTENT PRINCIPLES (ALL LESSON PRODUCTS):

⚠️ **CRITICAL RULES - VERIFY BEFORE SUBMITTING ANY CONTENT:**

**THE MOST VIOLATED RULES - CHECK THESE FIRST:**

RULE #1 - NEVER INVENT ANY STATISTICS, PERCENTAGES, OR NUMERICAL DATA:
   - ❌ ABSOLUTELY FORBIDDEN: "100%", "75%", "50%", "30%", "95%", "85%", "2x", "3x"
   - ❌ FORBIDDEN: "User Metrics: 100%, 75%, 50%", "Success Rate: 95%"
   - ✅ REQUIRED: Qualitative descriptors ONLY: "High", "Strong", "Regular", "Growing"
   - VERIFICATION CHECKPOINT: Scan ALL content for percentages. If found, DELETE.

RULE #2 - NO GENERIC COMPARISONS (Company A vs Company B):
   - ❌ FORBIDDEN: "Company A vs Company B", "Vendor X vs Vendor Y"
   - ✅ REQUIRED: Topic-specific decision frameworks

RULE #3 - CREATE TOPIC-RELEVANT CONTENT ONLY:
   - ❌ FORBIDDEN: Generic business content not related to lesson topic
   - ✅ REQUIRED: 100% relevant to specific topic being taught
   - VERIFICATION: Ask "Would this exist in [ACTUAL TOPIC]?" If no, delete.
```

**Changes:**
- Moved critical rules from position #4-#7 to RULE #1-#3 at the top
- Added "⚠️ CRITICAL RULES" header impossible to miss
- Added "VERIFICATION CHECKPOINT" language
- Included exact violations reported: "100%", "75%", "50%", "30%"
- Explicitly banned "Company A vs Company B" pattern

### Part 2: JSON Preview Instructions (`main.py`)

**Added "BEFORE YOU GENERATE ANYTHING" Section:**

```python
🎯 EDUCATIONAL PRESENTATION REQUIREMENTS (CRITICAL - NOT PRODUCT MARKETING):

⚠️ **BEFORE YOU GENERATE ANYTHING - READ THESE CRITICAL RULES FIRST:**

**RULE #1: NEVER INVENT STATISTICS, PERCENTAGES, OR NUMBERS (MOST VIOLATED - CHECK EVERY SLIDE):**
- ❌ ABSOLUTELY FORBIDDEN IN ALL SLIDES: "100%", "75%", "50%", "30%", "95%", "85%", "2x", "3x"
- ❌ FORBIDDEN PATTERNS: "User Metrics: 100%, 75%, 50%", "Company Performance: 85%, 70%"
- ❌ FORBIDDEN: Any big-numbers, metrics-analytics, or chart slide with invented numerical data
- ✅ ONLY ALLOWED: Qualitative descriptors: "High", "Strong", "Regular", "Growing", "Active"
- ✅ CORRECT: {"value": "Strong", "label": "User Engagement"} 
- ❌ WRONG: {"value": "85%", "label": "User Engagement"}
- **VERIFICATION**: Before finishing, check EVERY slide - if you see ANY percentage you invented, DELETE IT

**RULE #2: NO GENERIC COMPARISON SLIDES (FORBIDDEN PATTERNS):**
- ❌ ABSOLUTELY FORBIDDEN: "Company A vs Company B", "Vendor X vs Vendor Y"
- ❌ FORBIDDEN: Generic comparison tables without teaching decision-making
- ✅ ONLY ALLOWED: Decision frameworks teaching WHEN to use specific approaches
- ✅ CORRECT: "When to Use Configuration Method A vs Method B" (NextCloud decisions)
- ❌ WRONG: "Company A Features vs Company B Features" (generic)

**RULE #3: CREATE UNIQUE TOPIC-RELEVANT CONTENT (DO NOT COPY EXAMPLE SLIDES):**
- ❌ FORBIDDEN: Copying slide topics from JSON example (budgets, conflicts, etc.)
- ✅ REQUIRED: Every slide 100% relevant to ACTUAL lesson topic
- **VERIFICATION**: Ask: "Would this slide exist in [ACTUAL TOPIC]?" If no, delete and replace
```

**Added Mandatory Pre-Submission Checklist:**

```python
⚠️ **MANDATORY PRE-SUBMISSION CHECKLIST (RUN BEFORE COMPLETING GENERATION):**

Before you finish generating the presentation, you MUST verify:
- [ ] Scanned ALL slides for percentages (%, 100%, 75%, 50%, 85%, 95%) - DELETE if found
- [ ] Scanned for "Company A", "Company B", "Vendor X", generic comparisons - DELETE if found
- [ ] Verified EVERY slide relevant to actual lesson topic (not copied from example)
- [ ] Checked big-numbers slides use ONLY qualitative values (High, Strong), NO percentages
- [ ] Confirmed no invented statistics, multipliers (2x, 3x) anywhere
- [ ] Verified slide titles answer "How do I..." not just "Overview of..."

If ANY item above fails, you MUST fix it before submitting.
```

**Updated Template Guidance (Point #6):**

```python
**6. USE APPROPRIATE TEMPLATES FOR EDUCATION:**
- comparison-slide/table: ONLY for educational decision frameworks, NOT for generic company comparisons
- ⚠️ AVOID: metrics-analytics, market-share, pie-chart, big-numbers with percentages - frequently misused with fake data
```

## Key Changes Summary

### 1. Positioning Strategy

**Before (FAILED):**
- Critical rules at position #7 and #8
- Buried after 6 other principles
- Easy to skip or forget

**After (FIXED):**
- Critical rules at RULE #1, #2, #3 position
- Labeled "BEFORE YOU GENERATE ANYTHING"
- Impossible to miss

### 2. Explicit Prohibition Listing

**Before:**
- Generic: "Don't invent statistics"
- No specific examples of violations

**After:**
- Explicit: "100%", "75%", "50%", "30%" (exact violations reported)
- Explicit: "Company A vs Company B" (exact pattern reported)
- Shows wrong ❌ and correct ✅ examples

### 3. Verification Enforcement

**Before:**
- No verification step
- Trust that rules would be followed

**After:**
- "VERIFICATION CHECKPOINT" embedded in rules
- Mandatory pre-submission checklist
- Forces manual review before completion

### 4. Template Warnings

**Before:**
- Generic guidance about appropriate templates
- No specific warnings about problem templates

**After:**
- Explicit: "⚠️ AVOID: metrics-analytics, market-share, pie-chart, big-numbers with percentages"
- Clear: "frequently misused with fake data"
- Specific: comparison slides ONLY for decision frameworks, NOT generic comparisons

## Expected Behavior Change

### What AI Should Do Now:

1. **Read "BEFORE YOU GENERATE ANYTHING" first**
2. **Internalize the 3 critical rules immediately**
3. **Generate content with awareness of forbidden patterns**
4. **Before completion, run the mandatory checklist:**
   - Scan for percentages → delete if found
   - Scan for "Company A/B" → delete if found
   - Verify topic relevance → fix if generic
5. **Only submit after passing all checklist items**

### Specific Fixes for Reported Issues:

**Issue: "100%, 50%, 30%"**
- RULE #1 explicitly forbids this exact pattern
- Pre-submission checklist item #1 catches it
- Verification checkpoint forces deletion

**Issue: "Company A, Company B"**
- RULE #2 explicitly forbids this exact pattern
- Pre-submission checklist item #2 catches it
- Template guidance restricts comparison slides

**Issue: "Same templates used"**
- Template guidance updated with warnings
- Problem templates (metrics-analytics, big-numbers with %) explicitly discouraged
- Focus shifted to educational templates (process-steps, challenges-solutions)

## Files Modified

1. **`custom_extensions/backend/custom_assistants/content_builder_ai.txt`**
   - Lines 331-356: Added "CRITICAL RULES" section at top
   - Lines 378-382: Simplified redundant point #4
   - Removed duplicate content, added verification language

2. **`custom_extensions/backend/main.py`**
   - Lines 23196-23223: Added "BEFORE YOU GENERATE ANYTHING" section
   - Lines 23268-23278: Added mandatory pre-submission checklist
   - Lines 23263-23264: Updated template guidance with warnings
   - Removed duplicate points #7 and #8 (now at top)

## Verification Instructions

When testing the next presentation, check:

### Critical Items (Must Be Perfect):

1. ✅ **Zero Percentages**: No %, 100%, 75%, 50%, 30%, 85%, 95% anywhere
2. ✅ **Zero Invented Numbers**: No "2x", "3x", "5x" multipliers
3. ✅ **Zero Generic Comparisons**: No "Company A vs Company B", "Vendor X vs Y"
4. ✅ **Big-Numbers Uses Qualitative**: All big-numbers slides show "High", "Strong", "Growing", etc.
5. ✅ **Topic Relevance**: Every slide about the actual lesson topic

### Quality Items (Should Improve):

6. ✅ Template diversity: No template repeated excessively
7. ✅ Unique content: No copying example's generic business slides
8. ✅ Educational focus: Teaching "how to" not describing "what exists"

## What to Do If It Still Fails

If the next presentation STILL shows these issues:

### Emergency Escalation Path:

1. **Check if correct files are being used:**
   - Verify backend restart picked up changes
   - Check system prompt file is being loaded
   - Confirm JSON instructions are reaching the AI

2. **Increase enforcement level:**
   - Add ALL CAPS emphasis: "DO NOT USE PERCENTAGES"
   - Repeat rules multiple times throughout instructions
   - Add negative examples in the JSON template itself

3. **Template restriction:**
   - Remove problematic templates from catalog entirely
   - Hard-code prohibition in template selection logic
   - Add post-processing to strip percentages

4. **Model consideration:**
   - Test if specific model version ignores instructions
   - Consider switching to model with better instruction following
   - Add explicit system message emphasizing rule adherence

## Success Metrics

Fix will be considered successful when:

1. **Zero Violations in 5 Consecutive Tests:**
   - No fake percentages in any presentation
   - No "Company A/B" generic comparisons
   - All content topic-relevant

2. **Quality Score Improvement:**
   - Factual Accuracy: 15/15 (currently 5/15)
   - Content Relevance: 15/15 (currently 10/15)
   - Overall Educational Quality: 90+/100 (currently 72/100)

3. **User Satisfaction:**
   - No reports of fake statistics
   - No reports of generic/copied content
   - Presentations feel professional and trustworthy

## Important Notes

### This is v3 of the Fix - Previous Attempts:

1. **V1**: Added rules to system prompt and JSON instructions
2. **V2**: Strengthened language and added examples
3. **V3** (THIS): Front-loaded rules + verification checkpoints + pre-submission checklist

### Why V3 Should Work:

1. **Impossible to miss**: Rules are first thing AI sees with "BEFORE YOU GENERATE ANYTHING"
2. **Verification enforcement**: Checklist forces manual review before submission
3. **Explicit patterns**: Shows exact violations to avoid ("100%", "Company A")
4. **Multiple layers**: System prompt + JSON instructions + checklist = 3 enforcement points

### Escalation Trigger:

If V3 fails, we need to consider:
- Model instruction-following capability issues
- Post-processing filters to catch violations
- Hard-coded template restrictions
- Alternative prompting strategies

## Related Documentation

- `PRESENTATION_FAKE_STATISTICS_FIX.md`: V2 attempt (insufficient)
- `PRESENTATION_EDUCATIONAL_QUALITY_UPGRADE.md`: Initial quality improvements
- `EDUCATIONAL_QUALITY_STANDARDS_IMPLEMENTATION.md`: System prompt consolidation

