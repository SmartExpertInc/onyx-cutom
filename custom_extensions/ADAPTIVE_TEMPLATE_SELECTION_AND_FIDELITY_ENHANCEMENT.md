# Adaptive Template Selection and Source Fidelity Enhancement

**Date**: 2025-10-29  
**Status**: COMPLETE ✅

## Problem Statement

User feedback indicated that presentations generated from files were adding fabricated content:

### Specific Issues Identified:
1. **Named Case Studies**: Adding "Netflix", "Airbnb", "NASA", "General Electric" not in source
2. **Specific Percentages**: Adding "50% of users", "three-quarters benefit", etc.
3. **Certification Details**: Adding "AWS Certified Solutions Architect" not in source
4. **Support Plan Details**: Adding "Basic Support", "Developer Support" not in source
5. **Compliance Details**: Adding "GDPR, HIPAA, PCI DSS" not in source
6. **Future Trends**: Adding "Serverless Computing", "AI Integration" not in source
7. **Well-Architected Framework**: Adding AWS-specific frameworks not in source

### Root Cause

While onepagers maintained strict source fidelity, presentations were adding external content to meet diversity and educational quality requirements. The AI was prioritizing template diversity and "completeness" over source fidelity.

## Solution Implemented

### 1. System Prompt Updates (`content_builder_ai.txt`)

#### Header Warning Enhancement (Lines 9-14)
```
🚨🚨🚨 MANDATORY SLIDE DIVERSITY + TEMPLATE CONSTRAINTS 🚨🚨🚨
⚠️⚠️⚠️ NO BULLET-POINT-ONLY PRESENTATIONS ALLOWED ⚠️⚠️⚠️
⚠️⚠️⚠️ MINIMUM 3 DIFFERENT SLIDE TYPES REQUIRED ⚠️⚠️⚠️
⚠️⚠️⚠️ MAXIMUM 2 BULLET-POINT SLIDES TOTAL ⚠️⚠️⚠️
⚠️⚠️⚠️ BANNED: content-slide, comparison-slide ⚠️⚠️⚠️
⚠️⚠️⚠️ POSITION RESTRICTED: title-slide, big-image-* (first/last only) ⚠️⚠️⚠️
```

#### Adaptive Template Selection Rules (Lines 618-788)

**Globally Banned Templates:**
- `content-slide` - COMPLETELY BANNED
- `comparison-slide` - COMPLETELY BANNED

**Position-Restricted Templates (First or Last Slide ONLY):**
- `title-slide` - ONLY position 1 or N
- `big-image-left` - ONLY position 1 or N  
- `big-image-top` - ONLY position 1 or N

**Template Categories:**

**Category A: Data-Visualization Templates**
- Use ONLY if source contains real statistics
- `big-numbers` - Use ONLY with actual source statistics
- `table-dark`/`table-light` - RESTRICTED to qualitative comparisons
- BANNED: `metrics-analytics`, `market-share`, `pie-chart-infographics`

**Category B: Narrative-Visual Templates**
- Primary diversity source for conceptual content
- `big-image-left`, `big-image-top`, `challenges-solutions`, `process-steps`
- `two-column`, `four-box-grid`, `timeline`, `pyramid`, `six-ideas-list`

**Category C: Text-Based Templates**
- Limited use - max 4 slides total
- `bullet-points`, `bullet-points-right` - Max 2 total combined

**Template Selection Decision Tree:**
- Opening Slide: Visual if available, otherwise hero-title
- Content Slides: Match template to content pattern
- Closing Slide: Visual, title, or conclusion

**Adaptive Diversity Requirements:**
- **With Statistics**: Min 3 types, max 2 bullet-points, can use `big-numbers`
- **Without Statistics**: Min 3 types, max 2 bullet-points, forbidden Category A (except tables)

#### Verification Checklist (Lines 885-914)
```
ADAPTIVE TEMPLATE SELECTION VERIFICATION (fromFiles=true):

POSITION CHECKS:
□ NO `content-slide` present in entire presentation
□ NO `comparison-slide` present in entire presentation
□ `title-slide` appears ONLY at position 1 or last (if used)
□ `big-image-left` appears ONLY at position 1 or last (if used)
□ `big-image-top` appears ONLY at position 1 or last (if used)

DATA TEMPLATE CHECKS:
□ If source lacks statistics: NO `big-numbers` present
□ If source lacks statistics: NO `metrics-analytics` present
□ If source lacks statistics: NO `market-share` present
□ If source lacks statistics: NO `pie-chart-infographics` present
□ If `big-numbers` used: values are exact from source (no fabrication)
□ If tables used: only qualitative text (no invented numbers)

DIVERSITY CHECKS:
□ Minimum 3 different slide types used
□ Maximum 2 bullet-point slides (bullet-points + bullet-points-right combined)
□ Maximum 4 text-heavy slides (Category C combined)
□ At least 2 Category B (narrative-visual) templates used
□ At least 1 visual template used (if not conceptual-only source)
□ At least 1 interactive template used

SOURCE FIDELITY CHECKS:
□ Every slide's content comes from source documents
□ No fictional companies, people, or scenarios
□ No fabricated statistics or data
□ No general knowledge additions beyond source
```

### 2. Backend Validation Updates (`main.py`)

#### Enhanced Validation Function (Lines 1756-1822)
Added checks for:
- Banned templates (`content-slide`, `comparison-slide`)
- Position restrictions for `title-slide`, `big-image-left`, `big-image-top`
- Existing checks for `big-image-left` missing `imagePrompt`
- Existing checks for `challenges-solutions` count

#### Enhanced Fix Function (Lines 1824-1909)
Added automatic fixes for:
- Replace banned templates with `bullet-points`
- Replace `title-slide` in middle with `hero-title-slide`
- Replace `big-image-left`/`big-image-top` in middle with `bullet-points-right`
- Existing fixes for missing `imagePrompt` and excess `challenges-solutions` pairs

#### Critical Prompt Enhancement (Lines 12450-12491)

**FIXED CRITICAL BUG**: Changed from `elif` to `if` to ensure fidelity rules apply to BOTH presentation types:

```python
# Add fidelity rules for ALL presentation types (Lesson Presentation AND Video Lesson Presentation)
# Handle both naming conventions: "Lesson Presentation"/"Video Lesson Presentation" and "Slides Deck"/"Video Lesson Slides Deck"
if product_type in ["Lesson Presentation", "Video Lesson Presentation", "Slides Deck", "Video Lesson Slides Deck"]:
    enhanced_prompt += """

🚨 CRITICAL PRESENTATION FIDELITY RULES 🚨

ABSOLUTE PROHIBITIONS FOR PRESENTATIONS:
❌ NEVER use `content-slide` template (completely banned)
❌ NEVER use `comparison-slide` template (completely banned)
❌ NEVER use `title-slide` in middle positions (only first or last slide)
❌ NEVER use `big-image-left` in middle positions (only first or last slide)
❌ NEVER use `big-image-top` in middle positions (only first or last slide)

DATA FABRICATION PREVENTION:
❌ NEVER add specific percentages like "50% of users" or "three-quarters benefit"
❌ NEVER add named case studies like "Netflix", "Airbnb", "NASA", "General Electric" unless explicitly mentioned in source
❌ NEVER add specific compliance details like "GDPR, HIPAA, PCI DSS" unless mentioned in source
❌ NEVER add future trends like "Serverless Computing", "AI Integration" unless mentioned in source
❌ NEVER add specific metrics, costs, or performance data not in source
❌ NEVER add certification details like "AWS Certified Solutions Architect" unless mentioned in source
❌ NEVER add support plan details like "Basic Support", "Developer Support" unless mentioned in source

TEMPLATE SELECTION RULES:
✅ Use `big-numbers` ONLY if source contains actual statistics (exact values)
✅ Use `table-dark`/`table-light` ONLY for qualitative comparisons (no numerical data)
✅ Use `challenges-solutions` ONLY if source describes 3+ problems and solutions
✅ Use `process-steps` ONLY if source describes sequential procedures
✅ Use `two-column` ONLY if source compares/contrasts 2 items
✅ Use `four-box-grid` ONLY if source presents 4 related concepts
✅ Use `timeline` ONLY if source shows 4+ chronological events
✅ Use `pyramid` ONLY if source shows hierarchical structure
✅ Use `six-ideas-list` ONLY if source presents 6 key points

VERIFICATION BEFORE EACH SLIDE:
□ Is this content directly from the source documents?
□ Am I using the correct template for this content type?
□ Am I following position restrictions for this template?
□ Am I avoiding banned templates?
□ Am I not adding fabricated data or examples?

IF YOU CANNOT ANSWER "YES" TO ALL QUESTIONS - DO NOT CREATE THE SLIDE
"""
```

**Key Fix**: The previous implementation used `elif product_type == "Lesson Presentation"` which meant Video Lesson Presentations were skipped. Changed to `if product_type in [...]` to cover all presentation types and naming conventions.

### 3. Frontend Styling Update

#### Six-Ideas Template Text Color (`SixIdeasListTemplate.tsx` Line 31)
Changed idea text color to always use white:
```typescript
const txtColor = '#FFFFFF'; // Always use white for six-ideas text as per user requirement
```

## Presentation Generation Flow

### From Files Flow:

1. **User uploads files** → SmartDrive
2. **User creates presentation** → `/api/custom/lesson-presentation/preview`
3. **Backend extracts file content** → `extract_file_text()`
4. **Backend builds wizard request** with `fromFiles=true`
5. **Backend calls `build_enhanced_prompt_with_context()`** with product_type
   - Product type: "Slides Deck" or "Video Lesson Slides Deck"
   - Adds ABSOLUTE SOURCE FIDELITY MODE header
   - Adds source documents
   - **NOW ADDS CRITICAL PRESENTATION FIDELITY RULES** (fixed in this update)
   - Adds VERIFICATION CHECKPOINT #2
6. **OpenAI generates JSON** following fidelity rules
7. **Backend validates slides** → `validate_presentation_slides()`
8. **Backend fixes issues** → `fix_presentation_issues()`
9. **Frontend displays preview**

### Critical Path for Fidelity:

```
File Upload
    ↓
build_enhanced_prompt_with_context()
    ↓
[VERIFICATION CHECKPOINT #1]
    ↓
SOURCE DOCUMENTS
    ↓
[CRITICAL PRESENTATION FIDELITY RULES] ← ADDED HERE
    ↓
[VERIFICATION CHECKPOINT #2]
    ↓
OpenAI Generation
    ↓
validate_presentation_slides()
    ↓
fix_presentation_issues()
    ↓
Final JSON
```

## Testing Recommendations

### Test Cases:

1. **AWS Lecture Test**:
   - Upload AWS lecture without specific certifications
   - Generate presentation
   - Verify NO "AWS Certified Solutions Architect" added
   - Verify NO "Basic Support", "Developer Support" added
   - Verify NO "GDPR, HIPAA, PCI DSS" added
   - Verify NO "Netflix", "Airbnb", "NASA", "GE" case studies added

2. **Position Restriction Test**:
   - Generate 10-slide presentation
   - Verify `title-slide` only at position 1 or 10
   - Verify `big-image-left` only at position 1 or 10
   - Verify `big-image-top` only at position 1 or 10

3. **Banned Template Test**:
   - Generate presentation
   - Verify NO `content-slide` present
   - Verify NO `comparison-slide` present

4. **Data Template Test**:
   - Upload file WITHOUT statistics
   - Generate presentation
   - Verify NO `big-numbers` with percentages
   - Verify NO `metrics-analytics` used
   - Verify NO `market-share` used
   - If `table-dark`/`table-light` used: verify only qualitative text

5. **Diversity Test**:
   - Generate 15-slide presentation
   - Verify minimum 3 different slide types
   - Verify maximum 2 bullet-point slides total
   - Verify at least 2 Category B templates used

## Files Modified

1. **`custom_extensions/backend/custom_assistants/content_builder_ai.txt`**
   - Lines 9-14: Header warning update
   - Lines 618-788: Adaptive template selection rules
   - Lines 885-914: Adaptive verification checklist

2. **`custom_extensions/backend/main.py`**
   - Lines 1756-1822: Enhanced validation function
   - Lines 1824-1909: Enhanced fix function
   - Lines 12450-12491: Critical presentation fidelity rules (FIXED BUG)

3. **`custom_extensions/frontend/src/components/templates/SixIdeasListTemplate.tsx`**
   - Line 31: Text color change to white

## Success Criteria

✅ Presentations from files maintain strict source fidelity  
✅ No fabricated case studies, certifications, or compliance details  
✅ No invented percentages or statistics  
✅ Proper template positioning (title-slide, big-image-* only at first/last)  
✅ Banned templates never used (content-slide, comparison-slide)  
✅ Data templates only used when source contains actual data  
✅ Diverse slide types while maintaining source fidelity  
✅ Educational quality maintained without adding external content  

## Critical Fix #2: Instruction Override Problem (2025-10-29)

### Problem Discovered
User feedback showed that despite fidelity rules being reached (confirmed via debug), the AI was still:
1. Adding fabricated case studies ("Netflix", "Airbnb", "NASA", "GE")
2. Adding compliance details ("ISO 27001", "PCI DSS", "HIPAA")
3. Adding certification details not in source
4. Using 10 out of 15 slides as bullet-points (violating max 2 rule)

### Root Cause
The presentation preview endpoint (`/api/custom/lesson-presentation/preview`) contains extensive instructions that are added to the `wizard_message` AFTER the fidelity rules from `build_enhanced_prompt_with_context()`. These instructions include:
- "INCLUDE REAL WORKPLACE SCENARIOS" (lines 24318-24322)
- "PROVIDE COMPREHENSIVE EXPLANATIONS (60-100 WORDS)" (lines 24312-24316)
- Template diversity requirements without fidelity context

The final prompt order was:
1. FIDELITY RULES (from `build_enhanced_prompt_with_context`)
2. SOURCE DOCUMENTS
3. VERIFICATION CHECKPOINT
4. **THEN wizard_message with "INCLUDE SCENARIOS" instructions** ← These override fidelity!

### Solution Implemented (Lines 24662-24711)
Added ABSOLUTE FINAL INSTRUCTIONS at the very end of `wizard_message` that explicitly override previous instructions:

```python
if payload.fromFiles:
    wizard_message += """
    
🚨🚨🚨 ABSOLUTE FINAL INSTRUCTIONS - OVERRIDE ALL PREVIOUS RULES 🚨🚨🚨

YOU ARE GENERATING FROM FILES. THIS CHANGES EVERYTHING.

CRITICAL: When fromFiles=true, the "INCLUDE REAL WORKPLACE SCENARIOS" instruction means:
- Use scenarios ONLY if they appear in the source files
- DO NOT invent scenarios to meet educational quality requirements
- DO NOT add case studies unless they are explicitly in the source

ABSOLUTE PROHIBITIONS (OVERRIDE ALL PREVIOUS "INCLUDE" INSTRUCTIONS):
❌ NEVER add "Netflix", "Airbnb", "NASA", "GE" case studies unless in source
❌ NEVER add "ISO 27001", "PCI DSS", "HIPAA" compliance unless in source
❌ NEVER add "AWS Certified" certifications unless in source
❌ NEVER add support plan details unless in source
❌ NEVER add specific percentages or durability metrics unless in source
❌ NEVER add IAM features or security best practices unless in source
❌ NEVER invent "real workplace scenarios" - use ONLY scenarios from source

TEMPLATE DIVERSITY WITH SOURCE FIDELITY:
✅ YES to diverse templates (process-steps, challenges-solutions, two-column, etc.)
✅ YES to maximum 2 bullet-point slides
✅ BUT: Every slide's CONTENT must come from source files only

COUNT YOUR BULLET-POINT SLIDES:
Before finalizing, count how many times you used bullet-points or bullet-points-right.
If it's more than 2, you FAILED the diversity requirement.

FINAL VERIFICATION:
□ Did I add any case studies not in source? → DELETE THEM
□ Did I add any compliance standards not in source? → DELETE THEM
□ Did I add any certifications not in source? → DELETE THEM
□ Did I add any specific metrics/percentages not in source? → DELETE THEM
□ Did I use more than 2 bullet-point slides? → CONVERT THEM
"""
```

This ensures the LAST thing the AI reads before generating is the fidelity requirements.

## Known Limitations

1. **Instruction Conflicts**: The system has multiple instruction layers that can conflict. The ABSOLUTE FINAL INSTRUCTIONS are designed to be the last word, but AI adherence may vary.
2. **Qualitative Descriptions**: For data-heavy topics without source data, presentations will use qualitative terms ("High", "Strong") instead of numbers.
3. **Template Restrictions**: Strict position restrictions may limit design flexibility in some cases.
4. **Diversity vs Fidelity**: When source content is sparse, the AI must choose between diversity and fidelity. The final instructions prioritize fidelity.

## Next Steps

1. Monitor user feedback on new presentations generated from files
2. Collect examples of any remaining fidelity violations
3. Refine template selection logic based on real-world usage
4. Consider adding user-facing indicators showing "source-only" content

## Related Documentation

- `EXTREME_SOURCE_FIDELITY_FIX.md` - Previous fidelity enforcement
- `PRESENTATION_STATISTICS_AND_CONTENT_QUALITY_FIX.md` - Statistics hallucination fixes
- `ENHANCED_SLIDE_DIVERSITY_ENFORCEMENT.md` - Diversity requirements
- `BALANCED_SOURCE_FIDELITY_APPROACH.md` - Balanced approach to fidelity and quality

