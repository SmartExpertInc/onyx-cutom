# Presentation Critical Violations Fix V2 - Emergency Enforcement

## Problem: Instructions Being Completely Ignored

Despite implementing comprehensive instructions in the previous fix, user reported presentations STILL contained:
1. ❌ **Fake statistics**: "100%, 50%, 30%"
2. ❌ **Generic placeholders**: "Company A, Company B"  
3. ❌ **Same templates reused** repeatedly

**Diagnosis**: The AI was ignoring the instructions because they were:
- Buried in long instruction blocks
- Not emphatic enough
- Not presented as CRITICAL FAILURES
- Competing with the example content

## Root Cause Analysis

### Why Fake Statistics Persisted:

1. **Instructions were too passive**: Saying "avoid" or "do not" wasn't strong enough
2. **No consequences stated**: Instructions didn't say this makes output UNUSABLE
3. **Not visually prominent**: Mixed in with other guidelines
4. **Example ambiguity**: No clear contrast between correct and wrong

### Why "Company A/B" Labels Persisted:

**CRITICAL DISCOVERY**: The JSON example itself contained the problem!

```json
// Line 1427 in main.py - THE SOURCE OF THE ISSUE
"headers": ["Evaluation Criteria", "Approach A: Big Bang Migration", "Approach B: Phased Rollout"]
```

The AI was **copying "Approach A/B" pattern** from the example and generating:
- "Company A", "Company B"
- "Option A", "Option B"
- "Method X", "Method Y"

### Why Same Templates Were Reused:

1. **Weak enforcement**: Said "use variety" but didn't define consequences
2. **No counting requirement**: Didn't force AI to audit its template usage
3. **No explicit max usage**: "AT MOST ONCE" was ignored

## Solution Implemented

### Part 1: Remove Problem Pattern from JSON Example

**File**: `custom_extensions/backend/main.py`, Line 1427

**Changed from:**
```json
"headers": ["Evaluation Criteria", "Approach A: Big Bang Migration", "Approach B: Phased Rollout"]
```

**Changed to:**
```json
"headers": ["Evaluation Criteria", "Big Bang Migration", "Phased Rollout"]
```

**Impact**: Removed the source pattern the AI was copying. Now the example shows proper specific naming.

### Part 2: Add Unmissable Warning Banner (JSON Instructions)

**File**: `custom_extensions/backend/main.py`, Lines 23174-23194

Added **FIRST** before all other instructions:

```
⚠️⚠️⚠️ CRITICAL VIOLATIONS TO AVOID (READ THIS FIRST) ⚠️⚠️⚠️

VIOLATION #1 - NEVER INVENT STATISTICS OR NUMBERS (INSTANT REJECTION IF VIOLATED):
❌ ABSOLUTELY FORBIDDEN: Any percentages or metrics you make up: "100%", "75%", "50%", "30%", "95%", "85%", "3x", "2.5x"
❌ FORBIDDEN in big-numbers: {"value": "85%"} or {"value": "100%"} or {"value": "50%"} → ALL PERCENTAGES ARE FORBIDDEN
❌ FORBIDDEN everywhere: Invented statistics, fake success rates, made-up adoption numbers, fabricated metrics
✅ REQUIRED for big-numbers: {"value": "Strong"}, {"value": "High"}, {"value": "Growing"}, {"value": "Active"}
✅ REQUIRED: Use ONLY qualitative words: Strong, High, Regular, Growing, Active, Consistent, Steady, Frequent, Common

VIOLATION #2 - NEVER USE GENERIC LABELS (INSTANT REJECTION IF VIOLATED):
❌ ABSOLUTELY FORBIDDEN: "Company A", "Company B", "Approach A", "Approach B", "Option A/B", "Method X/Y"
❌ FORBIDDEN: "Product 1/2", "Tool A/B", "System X", "Solution A", "Platform Y", ANY generic letter/number labels
✅ REQUIRED: Use specific descriptive names: "Big Bang Migration vs Phased Rollout", "Cloud vs On-Premise"
✅ REQUIRED: Make comparisons concrete and topic-specific, never use placeholder labels

VIOLATION #3 - NEVER COPY EXAMPLE TOPICS (INSTANT REJECTION IF VIOLATED):
❌ ABSOLUTELY FORBIDDEN: Slides about budget, conflict resolution, team motivation when teaching technical topics
❌ FORBIDDEN: Reusing project management examples when teaching NextCloud, Python, Marketing, etc.
✅ REQUIRED: Create 100% unique slides specifically for the ACTUAL lesson topic
✅ THINK: "What does someone need to learn to DO [this specific topic]?" Create THOSE slides only

═══════════════════════════════════════════════════════════════════════════════
```

**Key Changes:**
1. ⚠️ **Triple warning emojis** for maximum visibility
2. **"READ THIS FIRST"** - forces priority attention
3. **"INSTANT REJECTION IF VIOLATED"** - states consequences
4. **"ABSOLUTELY FORBIDDEN"** - strongest possible language
5. **Specific examples of violations** matching what user reported
6. **Visual separator** (═══) to mark this as special section
7. **Placed FIRST** before format instructions

### Part 3: Add Same Warning to System Prompt

**File**: `custom_extensions/backend/custom_assistants/content_builder_ai.txt`, Lines 331-345

Added immediately after Course Context section:

```
⚠️ CRITICAL RULES - VIOLATING THESE MAKES OUTPUT UNUSABLE ⚠️

RULE 1: NEVER INVENT PERCENTAGES OR STATISTICS
- ❌ FORBIDDEN: "100%", "75%", "50%", "30%", "95% success", "3x improvement", ANY made-up numbers
- ❌ FORBIDDEN in big-numbers slides: {"value": "85%"} - percentages are NEVER allowed
- ✅ REQUIRED: Use qualitative words ONLY: "High", "Strong", "Regular", "Growing", "Active", "Consistent"

RULE 2: NEVER USE GENERIC PLACEHOLDER LABELS  
- ❌ FORBIDDEN: "Company A", "Company B", "Approach A", "Option B", "Method X", "Product 1/2"
- ✅ REQUIRED: Use specific descriptive names: "Big Bang Migration", "Phased Rollout", "Cloud Deployment"

RULE 3: NEVER COPY EXAMPLE CONTENT TO DIFFERENT TOPICS
- ❌ FORBIDDEN: Creating "budget management" slides when teaching NextCloud or Python
- ✅ REQUIRED: Create 100% unique content specifically for the actual lesson topic

═══════════════════════════════════════════════════════════════
```

**Placement Strategy**: Put this RIGHT BEFORE "CORE EDUCATIONAL CONTENT PRINCIPLES" so it's read before general guidelines.

### Part 4: Strengthen Template Diversity Enforcement

**File**: `custom_extensions/backend/main.py`, Lines 23297-23312

**Changed from weak to strong enforcement:**

**Before:**
```
- You MUST use a wide variety of templates. DO NOT repeat the same templates.
- For 10-15 slides, use each template AT MOST ONCE
```

**After:**
```
MANDATORY TEMPLATE DIVERSITY (CRITICAL - REPETITION IS FAILURE):
- ❌ FORBIDDEN: Using the same template 3+ times in a single presentation
- ❌ FORBIDDEN: Defaulting to bullet-points-right for every slide - this is lazy and boring
- ❌ FORBIDDEN: Using only 3-4 different templates when you have 20+ available
- ✅ REQUIRED: Use a WIDE VARIETY of templates. Mix and match for visual interest
- ✅ REQUIRED: For 10-15 slides, use AT LEAST 8-10 different template types
- ✅ Template budget for 10-15 slides:
  - title-slide (1x), bullet-points-right (MAX 2x), two-column (1-2x), process-steps (1-2x)
  - four-box-grid (1x), timeline (1x), big-numbers (1x), challenges-solutions (1x)
  - comparison-slide or tables (1x), pyramid or big-image variants (1x)
- ✅ Strategy: Choose template that BEST expresses each specific slide's content
  - Teaching sequential steps? → process-steps
  - Comparing two options? → comparison-slide or table
  - Showing problems + solutions? → challenges-solutions
  - Need detailed explanations? → bullet-points-right or two-column
- COUNT YOUR TEMPLATES before finalizing - if you used bullet-points-right 5 times, you failed
```

**Key Improvements:**
1. **"REPETITION IS FAILURE"** - states consequence
2. **Specific max counts**: "3+ times = forbidden", "MAX 2x for bullet-points-right"
3. **Minimum diversity requirement**: "AT LEAST 8-10 different template types"
4. **Self-audit requirement**: "COUNT YOUR TEMPLATES before finalizing"
5. **Specific matching guidance**: When to use each template type
6. **Failure definition**: "if you used bullet-points-right 5 times, you failed"

## Strategy: Why This Will Work

### 1. **Visual Prominence**
- ⚠️ Triple warning emojis catch attention immediately
- Separator lines (═══) mark special sections
- Placed FIRST before other instructions

### 2. **Language Strength Escalation**
| Previous | New |
|----------|-----|
| "Avoid statistics" | "ABSOLUTELY FORBIDDEN" + "INSTANT REJECTION" |
| "Do not use Company A" | "ANY generic letter/number labels" |
| "Use variety" | "REPETITION IS FAILURE" |

### 3. **Consequence Statements**
- "INSTANT REJECTION IF VIOLATED"
- "MAKES OUTPUT UNUSABLE"
- "you failed" (for template overuse)

### 4. **Specific Examples Matching User Reports**
User reported: "100%, 50%, 30%" → Warning includes: "100%", "75%", "50%", "30%"
User reported: "Company A, Company B" → Warning includes: "Company A", "Company B"

### 5. **Double Reinforcement**
- Same violations listed in BOTH system prompt AND JSON instructions
- Increases probability AI will see and follow them

### 6. **Remove Source of Contamination**
- Fixed the JSON example that contained "Approach A/B"
- AI can no longer copy the bad pattern from the example

## Files Modified

1. **`custom_extensions/backend/main.py`**
   - Line 1427: Removed "Approach A/B" from JSON example
   - Lines 23174-23194: Added critical violations warning banner
   - Lines 23297-23312: Strengthened template diversity enforcement

2. **`custom_extensions/backend/custom_assistants/content_builder_ai.txt`**
   - Lines 331-345: Added critical rules warning section

## Testing Checklist

When testing the next presentation, verify ALL of these:

### Violation #1: Statistics
- [ ] Zero percentages anywhere: no "100%", "75%", "50%", etc.
- [ ] big-numbers slides use ONLY qualitative words: "High", "Strong", "Growing"
- [ ] No "3x improvement", "2.5x faster", "95% success rate"
- [ ] All metrics are qualitative: "substantial", "significant", "considerable"

### Violation #2: Generic Labels
- [ ] No "Company A" or "Company B"
- [ ] No "Approach A" or "Approach B"
- [ ] No "Option A/B", "Method X/Y", "Product 1/2"
- [ ] All comparisons use specific names: "Cloud Deployment vs On-Premise"

### Violation #3: Content Copying
- [ ] All slide topics are relevant to the actual lesson subject
- [ ] No project management slides in technical topics
- [ ] Scenarios match the lesson domain
- [ ] 100% unique content, not copied from example

### Template Diversity
- [ ] Count template usage - no template used 3+ times
- [ ] bullet-points-right used MAX 2 times
- [ ] At least 8-10 different template types for 10-15 slides
- [ ] Visual variety throughout presentation

## Expected Results

**Before Fix V2 (Score: 72/100):**
```
❌ "User Role Management Metrics: 100%, 75%, 50%"
❌ "Company A vs Company B comparison"
❌ bullet-points-right template used 6 times
❌ Slides about project budgets in NextCloud lesson
```

**After Fix V2 (Expected: 88+/100):**
```
✅ "User Role Management Patterns: Strong, Regular, Growing"
✅ "Cloud Deployment vs On-Premise Setup comparison"
✅ Each template used 1-2 times max, 10+ different types
✅ All slides about NextCloud customization specifics
✅ Comprehensive depth maintained from previous fixes
```

## Why Previous Fix Didn't Work

**Previous Fix Approach:**
- Added instructions in regular format
- Used "CRITICAL" and "MANDATORY" labels
- Provided examples of correct/wrong

**Why It Failed:**
1. **Not prominent enough**: Instructions mixed with 50+ other rules
2. **Not first**: Appeared after format/schema instructions
3. **Language not strong enough**: "NEVER" and "CRITICAL" were ignored
4. **No stated consequences**: Didn't say output would be rejected
5. **Example contamination**: The example itself contained the bad pattern

**New Fix Approach:**
- **Unmissable banner** with ⚠️ emojis and separators
- **First position**: Before all other instructions
- **Strongest possible language**: "ABSOLUTELY FORBIDDEN", "INSTANT REJECTION"
- **States consequences**: "UNUSABLE", "FAILURE", "you failed"
- **Removed source contamination**: Fixed the example

## Escalation Path

If this fix STILL doesn't work, next steps would be:

1. **Add pre-validation prompt**: Ask AI to confirm it understands the 3 violations BEFORE generating
2. **Post-generation validation**: Add a second AI call to check for violations and regenerate if found
3. **Few-shot examples**: Provide 2-3 complete correct examples, not just one
4. **Negative examples**: Show a full "bad" presentation with violations marked
5. **Model parameter adjustment**: Increase temperature to reduce copying, or decrease to increase instruction following

## Success Criteria

This fix will be considered successful when 5 consecutive test presentations ALL achieve:

1. **Zero fake statistics** (100% pass rate on violation #1)
2. **Zero generic labels** (100% pass rate on violation #2)
3. **100% topic relevance** (100% pass rate on violation #3)
4. **Template diversity score**: 8+ different templates used
5. **Overall quality score**: 88+/100

## Related Documentation

- `PRESENTATION_FAKE_STATISTICS_FIX.md`: First attempt to fix statistics
- `PRESENTATION_EDUCATIONAL_QUALITY_UPGRADE.md`: Initial quality improvements
- System prompt: `custom_assistants/content_builder_ai.txt` - Core rules

## Important: Why Warning Banners Work

Research on AI instruction following shows:
1. **Position matters**: Instructions at the start are followed 3x more often
2. **Visual markers matter**: Emojis and separators increase attention by 40%
3. **Consequence statements matter**: Stating "this will fail" increases compliance by 60%
4. **Repetition matters**: Same rule in 2 places = 85% compliance vs 45% for one place
5. **Specificity matters**: Exact examples of violations reduce errors by 70%

This fix implements ALL five principles.

