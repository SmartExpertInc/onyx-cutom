# Presentation Fake Statistics & Diversity Fix

## Problems Identified

User tested the improved presentation system and found two critical remaining issues:

### Issue 1: Invented Statistics (CRITICAL)
The AI was generating **fake percentages** in big-numbers and metrics slides:
```
❌ "User Role Management Metrics: 100%, 75%, 50%"
❌ "User Feedback Metrics: 100%, 50%, 30%"
```

This violates the core educational quality standard: **NO HALLUCINATED DATA**

### Issue 2: Lack of Content Diversity
The AI was copying slide topics from the JSON example too literally:
- Generating slides about "budget management" or "conflict resolution" even when teaching unrelated topics like NextCloud customization
- Not adapting the example structure to the actual lesson topic
- Reusing the example's specific scenarios instead of creating topic-relevant content

## Root Cause Analysis

### Why Statistics Were Being Invented:

1. **Insufficient emphasis**: While the system prompt mentioned avoiding fake data, it wasn't flagged as the "MOST VIOLATED RULE"
2. **No explicit big-numbers guidance**: The instructions didn't specifically call out that big-numbers slides need qualitative descriptors
3. **Missing anti-examples**: No clear examples of what NOT to do (showing "85%" as wrong)
4. **Template ambiguity**: The big-numbers template wasn't explicitly restricted to qualitative values only

### Why Content Wasn't Diverse:

1. **Example misinterpretation**: The AI was treating the JSON example as a template to copy, not as a demonstration of depth and structure
2. **Insufficient "do not copy" warnings**: No explicit instruction that example topics are irrelevant to actual lesson content
3. **Missing adaptation guidance**: No instruction to think "What does someone need to learn to DO this specific topic?"

## Solution Implemented

### Part 1: System Prompt Strengthening (`content_builder_ai.txt`)

**Enhanced Point 4: FACTUAL ACCURACY**

Changed from:
```
4. FACTUAL ACCURACY - NO HALLUCINATED DATA (CRITICAL):
   - NEVER invent statistics, percentages, dates, or numerical data
   - USE qualitative language: "many organizations", "most professionals"
   - For metrics/big-numbers: use descriptive terms like "High", "Strong", "Growing"
```

To:
```
4. FACTUAL ACCURACY - NO HALLUCINATED DATA (CRITICAL - MOST VIOLATED RULE):
   - ❌ ABSOLUTELY FORBIDDEN: NEVER invent ANY statistics, percentages, dates, or numerical data
   - ❌ FORBIDDEN EXAMPLES: "95% success rate", "100%", "75%", "50%", "2.5x faster"
   - ❌ FORBIDDEN IN PRESENTATIONS: "User Role Management: 100%, 75%, 50%"
   - ❌ FORBIDDEN: Any specific number in big-numbers, metrics-analytics, or pie-chart slides
   - ✅ REQUIRED: Use qualitative language ONLY
   - ✅ FOR BIG-NUMBERS SLIDES: Use "High", "Strong", "Growing", "Regular", "Consistent", "Active", "Steady", "Frequent", "Common", "Widespread", "Emerging"
   - ✅ CORRECT big-numbers example: {"value": "Strong", "label": "User Engagement"}
   - ❌ WRONG big-numbers example: {"value": "85%", "label": "User Engagement"}
   - This rule applies to ALL slide types - NEVER invent data
```

**Key Improvements:**
1. ✅ Labeled as "MOST VIOLATED RULE" to increase attention
2. ✅ Added specific forbidden examples including the exact violations seen
3. ✅ Added explicit big-numbers guidance with correct/wrong examples
4. ✅ Used ❌/✅ visual markers for instant recognition
5. ✅ Covered all slide types where this violation might occur

### Part 2: JSON Preview Instructions Enhancement (`main.py`)

**Added Two New Critical Points:**

**Point 7: NEVER INVENT STATISTICS**
```python
**7. NEVER INVENT STATISTICS OR PERCENTAGES (CRITICAL - MOST COMMON VIOLATION):**
- ❌ ABSOLUTELY FORBIDDEN: "100%", "75%", "50%", "95% success rate", "3x improvement"
- ❌ FORBIDDEN: Any specific numbers, percentages, or metrics not in source materials
- ❌ FORBIDDEN: "User Role Management: 100%, 75%, 50%" or similar fake data visualizations
- ✅ REQUIRED for big-numbers slides: Use qualitative descriptors ONLY
  - Examples: "High", "Strong", "Regular", "Growing", "Consistent", "Active", "Steady"
  - Examples: "Frequent", "Occasional", "Rare", "Common", "Widespread", "Limited"
- ✅ REQUIRED: Use descriptive language instead of invented numbers
  - Instead of "95% of teams" → "Most teams" or "The majority of teams"
  - Instead of "3x productivity increase" → "Substantial productivity improvement"
  - Instead of "50% reduction" → "Considerable reduction" or "Significant decrease"
- ✅ For big-numbers template: The "value" field MUST contain qualitative words (High, Strong, etc), NEVER percentages
- This is a MANDATORY requirement - violating this makes content factually inaccurate
```

**Point 8: CREATE UNIQUE CONTENT (DO NOT COPY THE EXAMPLE)**
```python
**8. CREATE UNIQUE CONTENT FOR EACH TOPIC (DO NOT COPY THE EXAMPLE):**
- The JSON example shows "Project Management Fundamentals" - this is ONLY example of structure and depth
- ❌ DO NOT copy slide topics from example (budget management, conflict resolution, change requests)
- ❌ DO NOT reuse example's specific scenarios or frameworks verbatim
- ✅ CREATE completely new content relevant to the actual lesson topic
- ✅ ADAPT the depth and structure approach to your specific topic
- ✅ GENERATE unique scenarios, examples, and frameworks appropriate for your subject
- Example: If teaching "NextCloud Customization", do NOT include slides about project budgets
- Example: If teaching "Digital Marketing", create marketing-specific scenarios, not generic PM
- Think: "What does someone need to learn to DO this specific topic?" then create slides teaching those skills
```

**Key Improvements:**
1. ✅ Explicit prohibition on copying example slide topics
2. ✅ Clear distinction between structure/depth (copy this) vs. content (don't copy)
3. ✅ Concrete anti-examples showing what NOT to do
4. ✅ Thinking framework: "What does someone need to learn to DO this specific topic?"

## Technical Implementation

### Files Modified:

1. **`custom_extensions/backend/custom_assistants/content_builder_ai.txt`**
   - Lines 354-364: Enhanced "FACTUAL ACCURACY" section
   - Added explicit big-numbers correct/wrong examples
   - Labeled as "MOST VIOLATED RULE"
   - Comprehensive list of forbidden patterns

2. **`custom_extensions/backend/main.py`**
   - Lines 23240-23263: Added two new critical instruction points
   - Point 7: Statistics prohibition with examples
   - Point 8: Content diversity and adaptation guidance

### What Changed:

**Before:**
- Generic warning about not inventing statistics
- No specific guidance for big-numbers slides
- No examples of what NOT to do
- No instruction about adapting example to topic

**After:**
- **"MOST VIOLATED RULE"** flagging for immediate attention
- Explicit big-numbers template restrictions (qualitative only)
- Clear correct ✅ vs wrong ❌ examples
- Specific forbidden patterns matching observed violations
- Explicit "DO NOT COPY" instructions with topic adaptation guidance

## Expected Impact

### For Statistics/Data Invention:

**Before Fix (Score: 5/15 on Factual Accuracy):**
```json
{
  "templateId": "big-numbers",
  "props": {
    "title": "User Role Management Metrics",
    "steps": [
      {"value": "100%", "label": "Admin Access"},
      {"value": "75%", "label": "Editor Access"},
      {"value": "50%", "label": "Viewer Access"}
    ]
  }
}
```

**After Fix (Expected Score: 15/15):**
```json
{
  "templateId": "big-numbers",
  "props": {
    "title": "User Role Management Patterns",
    "steps": [
      {"value": "Strong", "label": "Admin Engagement", "description": "Administrators actively manage permissions..."},
      {"value": "Regular", "label": "Editor Activity", "description": "Editors consistently create and modify content..."},
      {"value": "Growing", "label": "Viewer Adoption", "description": "Viewer accounts show increasing usage..."}
    ]
  }
}
```

### For Content Diversity:

**Before Fix:**
- Teaching "NextCloud Customization" but includes slides about "Project Budget Management" and "Team Conflict Resolution"
- Generic project management examples regardless of actual topic
- Reuses example's decision frameworks verbatim

**After Fix:**
- Teaching "NextCloud Customization" includes slides like:
  - "How to Customize User Interface Elements"
  - "Setting Up Custom Workflows for Your Business"
  - "Troubleshooting Common Customization Issues"
- Topic-specific examples: "When customizing file preview settings..." instead of "When managing a database migration..."
- Unique decision frameworks: "Choosing Between Custom App vs Plugin" instead of generic project frameworks

## Verification Checklist

When testing the next presentation, verify:

### Statistics/Data:
- [ ] No percentages appear in big-numbers slides (check for %, 100%, 75%, etc.)
- [ ] No "X improvement", "Y reduction", "Z success rate" language
- [ ] All big-numbers "value" fields use qualitative words only
- [ ] No invented metrics in any slide type
- [ ] Qualitative descriptors are diverse: High, Strong, Regular, Growing, Active, etc.

### Content Diversity:
- [ ] Slide topics are 100% relevant to the actual lesson subject
- [ ] No generic project management slides appear in technical topics
- [ ] Scenarios and examples match the lesson domain
- [ ] Frameworks and tools discussed are topic-appropriate
- [ ] Structure and depth are maintained, but content is unique

### Example Comparison:

| Lesson Topic | Should NOT Include | Should Include |
|--------------|-------------------|----------------|
| NextCloud Customization | Budget management, Team conflicts, Project planning | UI customization, Workflow setup, App configuration |
| Digital Marketing | Project timelines, Risk registers, Resource allocation | Campaign planning, A/B testing, Analytics setup |
| Python Programming | Stakeholder communication, Change requests | Syntax fundamentals, Error handling, Debugging techniques |

## Qualitative Descriptor Library

**For big-numbers and metrics slides, use these types of qualitative values:**

### Frequency/Regularity:
- High, Low, Regular, Occasional, Frequent, Rare, Consistent, Sporadic, Steady

### Intensity/Strength:
- Strong, Weak, Robust, Moderate, Intense, Mild, Powerful, Subtle

### Trend/Direction:
- Growing, Declining, Stable, Emerging, Rising, Falling, Improving, Deteriorating

### Scope/Scale:
- Widespread, Limited, Extensive, Minimal, Broad, Narrow, Comprehensive, Restricted

### Engagement/Activity:
- Active, Passive, Engaged, Disengaged, Involved, Detached, Participating, Observing

### Quality/Status:
- Excellent, Good, Fair, Poor, Optimal, Adequate, Insufficient, Exceptional

## Success Metrics

The fix will be considered successful when presentations consistently achieve:

1. **Factual Accuracy: 15/15** (was 5/15)
   - Zero invented statistics or percentages
   - All metrics use qualitative language
   - Big-numbers slides use descriptive terms exclusively

2. **Content Relevance: 90%+**
   - All slide topics directly relate to lesson subject
   - Examples and scenarios match the domain
   - No inappropriate cross-domain content

3. **Educational Quality: 85+/100** (was 72/100)
   - Maintains depth and structure from example
   - Creates unique, topic-appropriate content
   - Preserves how-to focus and comprehensive explanations

## Important Notes

### When Numbers ARE Acceptable:

Numbers can be used when they are:
1. **Teaching examples**: "Example: Total $100k budget split as: $60k labor, $20k contractors..." (teaching budgeting)
2. **Well-known facts**: "24 hours in a day", "7 days in a week"
3. **From source materials**: If user provides data, you can reference it
4. **Hypothetical scenarios**: "Imagine you have 5 team members and 3 months..." (setting up a practice scenario)

### When Numbers are FORBIDDEN:

Numbers are forbidden when they are:
1. **Invented metrics**: "85% user satisfaction" (where did 85% come from?)
2. **Fake statistics**: "3x productivity increase" (not measured)
3. **Made-up data visualizations**: Charts/graphs with invented numbers
4. **Unsourced percentages**: Any % not from provided materials

### The Key Question:

Before using any number, ask: **"Where did this number come from?"**
- If the answer is "I made it up" → ❌ FORBIDDEN
- If the answer is "It's an example to teach a concept" → ✅ OK
- If the answer is "The user provided it" → ✅ OK
- If the answer is "It's a well-known fact" → ✅ OK

## Next Steps

1. Test with diverse topics: NextCloud, Marketing, Python, Project Management, etc.
2. Verify no statistics are invented across all tests
3. Confirm content is uniquely adapted to each topic
4. Check that structure and depth quality is maintained
5. Monitor for any new patterns of violation

## Related Documentation

- `PRESENTATION_EDUCATIONAL_QUALITY_UPGRADE.md`: Initial quality improvements
- `EDUCATIONAL_QUALITY_STANDARDS_IMPLEMENTATION.md`: System prompt consolidation
- System prompt: `custom_assistants/content_builder_ai.txt` - Core principles

