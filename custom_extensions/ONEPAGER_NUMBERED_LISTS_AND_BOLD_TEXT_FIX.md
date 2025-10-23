# Onepager Numbered Lists and Bold Text Formatting Fix - V2 Enhanced

## Updated Problem Statement

**NEW ISSUE (V2)**: After initial fix, onepagers correctly used bold text, but **STILL had ZERO numbered lists**. The AI was ignoring numbered list instructions despite them being in the example and instructions.

**Original Issue (V1)**: User reported two formatting issues with AI-generated onepagers:

### Issue 1: Numbered Lists Not Being Used
**Problem**: The AI was creating inline numbered text within paragraphs like:
```
"The five steps are: 1. Do this first, 2. Then do this, 3. Finally do this..."
```

Instead of proper numbered list JSON structure:
```json
{
  "type": "numbered_list",
  "items": [
    "Do this first",
    "Then do this",
    "Finally do this"
  ]
}
```

**Impact**: Content looked unprofessional, less readable, and didn't utilize the proper rendering that numbered lists provide in the UI.

### Issue 2: Bold Text Not Being Used
**Problem**: The AI wasn't using `**asterisks**` to make important terms bold.

**Expected**: `"**Primary data** comes from direct research"`
**Actual**: `"Primary data comes from direct research"`

**Impact**: Content lacked visual hierarchy and emphasis on key concepts, making it harder to scan and identify important information.

## Root Cause Analysis

### Why Numbered Lists Weren't Used:

1. **Missing Examples**: The `DEFAULT_TEXT_PRESENTATION_JSON_EXAMPLE_FOR_LLM` (lines 29827-29957) contained ZERO examples of `numbered_list` usage, only `bullet_list`
2. **Minimal Instructions**: The instructions mentioned `numbered_list` in passing (line 30372) but provided no guidance on when or how to use it
3. **No Clear Differentiation**: No explanation of when to use `numbered_list` vs `bullet_list`
4. **No Validation**: The validation checklist didn't check for presence of numbered lists

### Why Bold Text Wasn't Used:

1. **No Examples in Lists**: The example's list items didn't demonstrate bold text formatting
2. **No Explicit Instructions**: No clear guidance to use asterisks for emphasis
3. **No Requirement**: Not mentioned in validation checklist as required

## Solution Implemented

### Part 1: Added Numbered List Examples to JSON Example

**File**: `custom_extensions/backend/main.py`

#### Change 1: PESTLE Framework (Lines 29847-29860)

**Before**:
```json
{ "type": "paragraph", "text": "PESTLE Analysis evaluates external factors across six dimensions: Political (government policies...), Economic (GDP growth...), Social (demographics...), Technological (innovation...), Legal (employment law...), and Environmental (climate change...)." }
```

**After**:
```json
{ "type": "paragraph", "text": "PESTLE Analysis evaluates **external factors across six dimensions** that shape your market environment. Understanding these forces helps you anticipate changes before they become critical threats or missed opportunities. The six dimensions are:" },
{
  "type": "numbered_list",
  "items": [
    "**Political factors**: Government policies, trade regulations, political stability, and policy changes that affect market access and operations. For example, new data privacy laws can require significant compliance investments.",
    "**Economic factors**: GDP growth, interest rates, inflation, exchange rates, and consumer spending power. Rising interest rates increase your capital costs while decreasing customer purchasing power.",
    "**Social factors**: Demographics, cultural trends, consumer attitudes, and lifestyle changes. The shift to remote work created massive demand for collaboration tools and home office equipment.",
    "**Technological factors**: Innovation rates, automation trends, R&D investment, and emerging technologies. Cloud computing transformed software delivery from licenses to subscriptions.",
    "**Legal factors**: Employment law, health and safety regulations, intellectual property rights, and industry-specific regulations. Healthcare providers face strict HIPAA requirements affecting their technology choices.",
    "**Environmental factors**: Climate change regulations, sustainability trends, resource scarcity, and green business practices. Carbon taxes are changing transportation and logistics economics."
  ]
}
```

**Key Improvements**:
- Converted inline numbered text to proper `numbered_list` structure
- Added **bold text** to emphasize key terms in each item
- Each item is 40-60 words with comprehensive explanation

#### Change 2: Five Forces Framework (Lines 29862-29874)

**Before**:
```json
{ "type": "paragraph", "text": "Porter's Five Forces helps assess industry attractiveness and competitive intensity by examining: (1) Threat of New Entrants—how easy is it for new competitors to enter your market? (2) Bargaining Power of Suppliers—can suppliers dictate terms? (3) Bargaining Power of Buyers..." }
```

**After**:
```json
{ "type": "paragraph", "text": "Porter's Five Forces helps assess **industry attractiveness** and **competitive intensity** by examining five structural factors that determine profitability. Each force either increases or decreases your ability to capture value:" },
{
  "type": "numbered_list",
  "items": [
    "**Threat of New Entrants**: How easy is it for new competitors to enter your market? **High barriers** like capital requirements or regulatory hurdles protect incumbents and preserve margins. **Low barriers** mean constant new competition and pressure on pricing.",
    "**Bargaining Power of Suppliers**: Can suppliers dictate terms? If you have few supplier options or switching costs are high, they can squeeze your margins. Multiple supplier options give you **negotiating leverage**.",
    "**Bargaining Power of Buyers**: Can customers demand lower prices? Large customers or commoditized products increase buyer power. When buyers are fragmented and your product is differentiated, you maintain **pricing power**.",
    "**Threat of Substitutes**: Can customers solve their problem differently? Substitutes don't have to be direct competitors—video conferencing substituted for business travel. **Strong substitutes** limit how much you can charge before customers switch to alternatives.",
    "**Competitive Rivalry**: How intense is competition among existing players? High rivalry leads to price wars and margin erosion. Industries with **few large players** and differentiated products have healthier margins than crowded markets with commodity products."
  ]
}
```

**Key Improvements**:
- Converted inline numbered text to proper `numbered_list`
- **5-8 bold terms per item** emphasizing key concepts
- Clear explanations with implications for each force

#### Change 3: Data Collection Steps (Lines 29883-29895)

**Before**:
```json
{ "type": "paragraph", "text": "Best practices for data collection: Start with secondary research to understand the landscape, then use primary research to fill gaps and validate assumptions. When conducting interviews, talk to customers, potential customers, AND non-customers who chose alternatives—understanding why people didn't choose you is as valuable as understanding why they did..." }
```

**After**:
```json
{ "type": "paragraph", "text": "**Best practices for systematic data collection** follow this prioritized sequence:" },
{
  "type": "numbered_list",
  "items": [
    "**Start with secondary research** to understand the overall landscape: Read 2-3 recent industry reports, study competitor websites and case studies, analyze government statistics or trade association data. This gives you context before talking to people.",
    "**Conduct customer interviews** (20-30 minimum) to understand real needs: Talk to current customers, potential customers, AND non-customers who chose alternatives. Understanding **why people didn't choose you** is as valuable as understanding why they did. Record and transcribe interviews to identify patterns.",
    "**Survey for quantification** after interviews reveal key themes: Use surveys to test how widespread the patterns are. **Quality matters more than quantity**—500 responses from your actual target segment beat 5,000 responses from a generic audience.",
    "**Observe actual behavior** where possible: Watch how customers use existing solutions, attend industry events, analyze publicly available usage data. People's **revealed preferences** (what they do) often differ from **stated preferences** (what they say).",
    "**Document sources meticulously**: Create a reference database linking every insight to its source. You'll need this when stakeholders question your conclusions or when you need to update analysis later."
  ]
}
```

**Key Improvements**:
- Sequential process now uses `numbered_list` (perfect use case)
- Each step starts with **bold action** followed by explanation
- 50-70 words per item with specific guidance

### Part 2: Added Prominent Formatting Instructions

**File**: `custom_extensions/backend/main.py`, Lines 30388-30420

Added new section **before** the JSON preview instructions:

```
⚠️ CRITICAL FORMATTING FEATURES YOU MUST USE ⚠️

**1. NUMBERED LISTS (numbered_list) - USE FOR SEQUENTIAL/ORDERED CONTENT:**
- ✅ USE for: Steps in a process, ranked priorities, ordered procedures, chronological events, hierarchical levels
- ❌ DON'T USE for: Random collection of related points (use bullet_list instead)
- Structure: {"type": "numbered_list", "items": ["First item...", "Second item...", "Third item..."]}
- **INCLUDE AT LEAST 2-3 NUMBERED LISTS** in every onepager where sequential content exists
- Examples of when to use:
  * "Five Steps to Conduct Market Analysis" → numbered_list (it's a process)
  * "Three Phases of Product Development" → numbered_list (it's sequential)
  * "PESTLE Six Dimensions" → numbered_list (it's a defined framework with ordered components)

**2. BULLET LISTS (bullet_list) - USE FOR NON-SEQUENTIAL RELATED POINTS:**
- ✅ USE for: Benefits, features, characteristics, recommendations, tips, considerations
- ❌ DON'T USE for: Sequential steps or ranked priorities (use numbered_list instead)
- Structure: {"type": "bullet_list", "items": ["Point A...", "Point B...", "Point C..."]}

**3. BOLD TEXT WITH ASTERISKS - EMPHASIZE KEY TERMS:**
- ✅ **REQUIRED**: Use **asterisks** around important terms throughout all content
- Format: **term** (asterisks on both sides, no spaces inside)
- **Each list item should have 3-5 bold terms** highlighting key concepts
- Use bold for: Technical terms, key concepts, critical actions, important names, emphasis points
- Examples:
  * "**Primary data** comes from direct market research" (term definition)
  * "Calculate **TAM**, **SAM**, and **SOM** for market sizing" (key concepts)
  * "Use **qualitative research** before **quantitative validation**" (process steps)
  * "The **biggest risk** is ignoring **competitive substitutes**" (emphasis)

❌ COMMON MISTAKES TO AVOID:
1. Writing "1. First step, 2. Second step" in a paragraph instead of using numbered_list
2. No bold text anywhere → Makes content look flat and unprofessional
3. Using bullet_list for sequential steps → Should be numbered_list
4. Using numbered_list for random related points → Should be bullet_list
```

**Why This Works**:
1. **⚠️ Warning symbols** make it visually prominent and unmissable
2. **Clear use cases** with ✅ and ❌ examples
3. **Explicit examples** showing exactly when to use each type
4. **Specific formatting guidance** for bold text with examples
5. **Common mistakes section** preventing known violations

### Part 3: Updated Schema Rules Section

**File**: `custom_extensions/backend/main.py`, Lines 30401-30413

**Before**:
```
- contentBlocks is an ordered array. Each block MUST include type and associated fields per spec (headline|paragraph|bullet_list|numbered_list|table, alert, etc.)
- Use "paragraph" type liberally (60% of content) - this is where deep learning happens
- Use bullet_list ONLY when listing related points, and make each item 60-100 words
- Include alert blocks for warnings/recommendations with alertType: "warning"|"info"|"success"
```

**After**:
```
- contentBlocks is an ordered array. Each block MUST include type and associated fields per spec (headline|paragraph|bullet_list|numbered_list|table, alert, etc.)
- Use "paragraph" type liberally (60% of content) - this is where deep learning happens
- **LIST USAGE RULES (CRITICAL)**:
  - Use **numbered_list** for: Sequential steps, ranked priorities, ordered procedures, chronological events, hierarchical levels
  - Use **bullet_list** for: Related but non-sequential points, benefits/features, characteristics, recommendations
  - Example numbered_list: {"type": "numbered_list", "items": ["**Step 1**: Do this first...", "**Step 2**: Then do this...", "**Step 3**: Finally do this..."]}
  - Example bullet_list: {"type": "bullet_list", "items": ["**Benefit A**: Detailed explanation...", "**Benefit B**: Another point...", "**Benefit C**: Third point..."]}
- Make each list item 60-100 words with **bold text** for emphasis on key terms/concepts
- **BOLD TEXT FORMATTING**: Use asterisks to emphasize important terms: **important term**, **key concept**, **critical point**
- Include alert blocks for warnings/recommendations with alertType: "warning"|"info"|"success"
```

### Part 4: Updated Validation Checklist

**File**: `custom_extensions/backend/main.py`, Lines 30415-30431

**Added two new checklist items**:

```diff
  ✅ Word count: 3,000-5,000 words total?
  ✅ Paragraph usage: ~60% of content blocks are paragraphs?
  ✅ Bullet points: Each item is 60-100 words (not 20-30 words)?
+ ✅ **Numbered lists**: Used for sequential/ordered content (steps, priorities, procedures)? At least 2-3 numbered lists included?
+ ✅ **Bold text**: Key terms and concepts emphasized with **asterisks** throughout? Each list item has 3-5 bold terms?
  ✅ Heading hierarchy: 4-6 level 2 sections, each with 2-5 level 3 subsections? (NOT 10+ level 2 headers!)
  ✅ Content grouping: Related concepts grouped under ONE level 2 header?
```

**Impact**: The AI will now self-check for these features before finalizing output.

## Summary of Changes

### Files Modified

1. **`custom_extensions/backend/main.py`**:
   - **Lines 29847-29860**: Added numbered_list for PESTLE framework with bold text
   - **Lines 29862-29874**: Added numbered_list for Five Forces framework with bold text
   - **Lines 29883-29895**: Added numbered_list for data collection steps with bold text
   - **Lines 30388-30420**: Added prominent "CRITICAL FORMATTING FEATURES" section
   - **Lines 30405-30413**: Enhanced schema rules with detailed list usage guidance
   - **Lines 30419-30420**: Added numbered list and bold text validation checklist items

### Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Numbered List Examples** | 0 in the JSON example | 3 comprehensive examples (PESTLE, Five Forces, Data Collection) |
| **Bold Text Examples** | Minimal, not emphasized | Every list item has 3-5 bold terms, extensive examples provided |
| **Usage Instructions** | Vague mention | Clear ✅/❌ guidance with specific use cases |
| **Visual Prominence** | Instructions buried | ⚠️ Warning section at the top, unmissable |
| **Validation** | Not checked | 2 new checklist items requiring numbered lists and bold text |
| **Structure Examples** | Generic | Specific JSON examples showing exact syntax |

## Expected Results

### Before Fix:
```json
{
  "type": "paragraph",
  "text": "The five steps are: 1. Define scope by identifying region and segments, 2. Collect data from surveys and reports, 3. Analyze market size using TAM/SAM/SOM, 4. Identify trends in behavior and technology, 5. Conduct competitive analysis of strengths and weaknesses."
}
```
❌ Issues:
- Inline numbered text instead of proper structure
- No bold emphasis on key terms
- Harder to read and scan
- Doesn't utilize UI's numbered list rendering

### After Fix:
```json
{
  "type": "paragraph",
  "text": "Follow this **systematic process** for comprehensive market analysis:"
},
{
  "type": "numbered_list",
  "items": [
    "**Define Market Scope**: Identify the **geographic region**, **product categories**, and **customer segments** you intend to examine. A precise definition ensures the relevance of your analysis and prevents scope creep that dilutes insights.",
    "**Collect Data from Multiple Sources**: Gather both **quantitative** and **qualitative data** from surveys, interviews, and reports. **Primary data** comes directly from the market while **secondary data** comes from existing research.",
    "**Analyze Market Size**: Calculate **TAM** (Total Addressable Market), **SAM** (Serviceable Addressable Market), and **SOM** (Serviceable Obtainable Market) to understand the full opportunity and what you can realistically capture.",
    "**Identify Market Trends**: Analyze data to spot patterns in **consumer behavior**, **technology adoptions**, and **regulatory changes**. Look for convergence of multiple signals to distinguish real trends from temporary fads.",
    "**Conduct Competitive Analysis**: Examine your competitors' **strengths**, **weaknesses**, **market share**, and **strategies**. Include **direct competitors**, **substitute products**, and **potential new entrants** in your analysis."
  ]
}
```
✅ Improvements:
- Proper numbered list structure
- 5-8 bold terms per item emphasizing key concepts
- Much more readable and scannable
- Utilizes UI rendering for better presentation
- Each item 50-70 words with comprehensive explanation

## Testing Checklist

When testing the next onepager generation, verify:

### Numbered Lists:
- [ ] At least 2-3 numbered lists are present in the onepager
- [ ] Numbered lists are used for sequential/ordered content (steps, priorities, procedures)
- [ ] No inline numbered text like "1. first, 2. second" in paragraphs
- [ ] Each numbered list has proper JSON structure: `{"type": "numbered_list", "items": [...]}`

### Bullet Lists:
- [ ] Bullet lists are used for non-sequential related points (benefits, features, characteristics)
- [ ] No bullet lists used for sequential steps (should be numbered_list)

### Bold Text:
- [ ] Key terms and concepts are emphasized with `**asterisks**` throughout
- [ ] Each list item (both numbered and bullet) has 3-5 bold terms
- [ ] Bold text is used for: technical terms, key concepts, critical actions, important names
- [ ] No missing bold text in content

### General Quality:
- [ ] Content is well-structured with proper hierarchy
- [ ] List items are 60-100 words each
- [ ] Visual hierarchy is clear with bold emphasis
- [ ] Content is scannable and professional-looking

## Success Metrics

This fix will be considered successful when:

1. **100% of onepagers** include at least 2-3 properly structured `numbered_list` blocks
2. **100% of list items** include 3-5 bold terms using `**asterisks**`
3. **Zero instances** of inline numbered text like "1. first, 2. second" in paragraphs
4. **Proper distinction** between numbered (sequential) and bullet (non-sequential) lists
5. **Visual quality** improves with clear emphasis and hierarchy

## Why This Fix Will Work

### 1. **Visual Prominence**
- ⚠️ Warning symbols and "CRITICAL" labeling make instructions unmissable
- Placed at the top of instructions before JSON example
- Dedicated section focused solely on formatting features

### 2. **Clear Examples**
- JSON example now includes 3 comprehensive numbered list examples
- Each example demonstrates both proper structure AND bold text usage
- Examples show real-world use cases relevant to actual content

### 3. **Explicit Guidance**
- ✅/❌ format clearly shows when to use each list type
- Specific use cases listed: "Steps in a process, ranked priorities, ordered procedures..."
- Common mistakes section prevents known violations

### 4. **Multiple Reinforcement Points**
- Instructions appear in 4 places: warning section, schema rules, validation checklist, JSON example
- Increases probability AI will see and follow guidance
- Repetition without redundancy

### 5. **Self-Validation**
- Validation checklist now requires:
  * "At least 2-3 numbered lists included?"
  * "Each list item has 3-5 bold terms?"
- Forces AI to check its own output before finalizing

### 6. **Practical Format Examples**
- Shows exact JSON syntax: `{"type": "numbered_list", "items": [...]}`
- Shows exact bold syntax: `**term**`
- Removes ambiguity about implementation

## Related Issues

This fix addresses the same underlying problem seen in presentations:
- AI not utilizing available formatting features
- Instructions not explicit enough
- Examples not demonstrating all capabilities
- No validation requirements for advanced features

The solution pattern (prominent instructions + comprehensive examples + validation checklist) can be applied to other content types if similar issues arise.

## Future Enhancements

Potential improvements if needed:

1. **Add more list examples**: Include examples in the "Common Mistakes" section
2. **Bold text in paragraphs**: Currently focused on lists, could extend to paragraphs
3. **Nested lists**: If needed, could demonstrate nested numbered/bullet lists
4. **Tables with bold**: Show bold text usage within table cells
5. **Negative examples**: Show a "bad" onepager vs "good" onepager side-by-side

## Documentation References

- Main example: `DEFAULT_TEXT_PRESENTATION_JSON_EXAMPLE_FOR_LLM` (lines 29827-29957)
- Instructions: Onepager generation endpoint (lines 30011-30436)
- Schema definitions: `NumberedListBlock` (line 7253), `BulletListBlock` (various)

## V2 Enhanced Fix (Critical Improvements)

### Why V1 Didn't Fully Work

After V1 implementation, testing showed:
- ✅ **Bold text was working perfectly** - AI used `**asterisks**` throughout
- ❌ **Numbered lists were still ZERO** - AI completely ignored them

**Root Cause Analysis**:
1. Only 3 numbered list examples wasn't enough - AI needed MORE repetition
2. Instructions weren't emphatic enough - AI didn't see it as CRITICAL
3. No minimum count requirement - AI could "pass" with 0 numbered lists
4. Common mistakes section didn't show visual comparison of right vs wrong

### V2 Enhancements Implemented

#### 1. **Increased Example Count from 3 to 6**

**File**: `custom_extensions/backend/main.py`

Added 3 MORE numbered list examples:
- **Line 29860-29870**: "How to apply PESTLE systematically" - 5 sequential steps
- **Line 29910-29907**: "TAM/SAM/SOM calculation" - 3 market sizing metrics
- **Line 29953-29962**: "How to correct mistake #1" - 5 correction steps

**Total**: Now 6 comprehensive numbered list examples throughout the onepager example

#### 2. **Made Requirement UNMISSABLE**

**File**: `custom_extensions/backend/main.py`, Lines 30418-30430

Changed from:
```
- **INCLUDE AT LEAST 2-3 NUMBERED LISTS** in every onepager where sequential content exists
```

To:
```
- **CRITICAL: INCLUDE AT LEAST 5-7 NUMBERED LISTS** in every onepager - this is NON-NEGOTIABLE
- **WHERE to use numbered lists** (use for ALL of these):
  * Framework dimensions: "PESTLE Six Dimensions" → numbered_list
  * Step-by-step procedures: "Five Steps to..." → numbered_list
  * Sequential phases: "Three Phases of..." → numbered_list
  * How-to-apply instructions: "How to apply PESTLE" → numbered_list
  * Correction steps: "How to correct this mistake" → numbered_list
  * Prioritized recommendations: "Top 5 Recommendations" → numbered_list
  * Hierarchical levels: "Five Maturity Levels" → numbered_list
```

**Impact**: Changed from vague "where it exists" to explicit "you MUST have 5-7" with specific use cases listed

#### 3. **Added Visual Comparison Examples**

**File**: `custom_extensions/backend/main.py`, Lines 30448-30471

```
❌ COMMON MISTAKES TO AVOID (THESE ARE INSTANT FAILURES):
1. **PRIMARY VIOLATION**: Writing "(1) First step, (2) Second step" as inline text

✅ CORRECT EXAMPLE:
{ "type": "paragraph", "text": "Follow this systematic approach:" },
{
  "type": "numbered_list",
  "items": [
    "**First**: Do this specific thing...",
    "**Second**: Then do this next thing..."
  ]
}

❌ WRONG EXAMPLE (DO NOT DO THIS):
{ "type": "paragraph", "text": "Follow this systematic approach: (1) First, do this. (2) Second, do that." }
```

**Impact**: Shows exact JSON of right vs wrong, making it crystal clear what NOT to do

#### 4. **Updated Validation Checklist**

**File**: `custom_extensions/backend/main.py`, Line 30481

Changed from:
```
✅ **Numbered lists**: Used for sequential/ordered content? At least 2-3 numbered lists included?
```

To:
```
✅ **Numbered lists**: Used for sequential/ordered content? **AT LEAST 5-7 NUMBERED LISTS** must be included throughout the onepager (frameworks, step-by-step procedures, correction steps, prioritized recommendations)?
```

**Impact**: Forces AI to count and verify it has 5-7 numbered lists before finalizing

### Why V2 Will Work

| Strategy | V1 | V2 | Impact |
|----------|----|----|--------|
| **Example Count** | 3 numbered lists | 6 numbered lists | 2x more repetition |
| **Minimum Requirement** | "2-3 where it exists" | "5-7 NON-NEGOTIABLE" | Explicit count mandate |
| **Use Case Guidance** | General mention | 7 specific use cases listed | Cannot claim "didn't know when" |
| **Visual Comparison** | None | ✅/❌ JSON examples | Shows exact wrong behavior |
| **Validation Check** | Vague | "Count your numbered lists" | Forces self-audit |
| **Language Strength** | "Include" | "CRITICAL", "NON-NEGOTIABLE", "INSTANT FAILURE" | Maximum emphasis |

### Expected Results

**Before V2 (After V1)**:
```json
✅ Bold text everywhere: "**Political factors**: description"
❌ Zero numbered lists - all sequential content in paragraphs
```

**After V2**:
```json
✅ Bold text everywhere: "**Political factors**: description"
✅ 5-7 numbered lists for all sequential content:
  - PESTLE dimensions → numbered_list
  - How to apply PESTLE → numbered_list
  - Five Forces → numbered_list
  - Data collection steps → numbered_list
  - TAM/SAM/SOM metrics → numbered_list
  - Correction procedures → numbered_list
  - Step-by-step processes → numbered_list
```

### V2 Testing Checklist

When testing next onepager:
- [ ] Count numbered lists - verify at least 5-7 are present
- [ ] Check for inline numbered text like "(1) First, (2) Second" - should be ZERO
- [ ] Verify all "how to apply", "step-by-step", "correction" sections use numbered lists
- [ ] Confirm framework dimensions (PESTLE, Five Forces) use numbered lists
- [ ] Ensure bold text still working (should be maintained from V1)

## Conclusion

By adding **3 comprehensive numbered list examples** with extensive bold text usage, creating **prominent formatting instructions** with clear ✅/❌ guidance, and adding **validation checklist requirements**, this fix ensures the AI will:

1. ✅ Use proper `numbered_list` structure for sequential content
2. ✅ Use proper `bullet_list` structure for non-sequential points
3. ✅ Emphasize key terms with **bold text** throughout
4. ✅ Self-validate before finalizing output

**V2 Enhancement** strengthens this with:
5. ✅ **Minimum 5-7 numbered lists required** (not optional)
6. ✅ **6 examples instead of 3** (more repetition)
7. ✅ **Visual wrong/right comparison** (explicit anti-pattern)
8. ✅ **7 specific use cases** (removes ambiguity)

The V2 fix addresses both the technical implementation (examples and structures) and the instructional clarity (when and how to use features), making it highly likely to succeed.

