# Enhanced Template Selection Rules - Guaranteed Template Choice

## 🎯 Overview

This document describes the **enhanced template selection rules** that have been implemented to **guarantee** that problematic templates are correctly chosen during slide generation. These rules take **absolute priority** over all other template selection logic.

## 🚀 Key Improvements

### 1. **ABSOLUTE TEMPLATE SELECTION RULES**
Added at the **beginning** of the AI prompt to ensure these rules are checked **first** before any other template selection logic.

### 2. **CRITICAL - MANDATORY SELECTION**
Each problematic template now has explicit **MANDATORY SELECTION** rules with expanded trigger words.

### 3. **ABSOLUTE REQUIREMENT Statements**
Clear statements that specify **exactly** when each template must be used.

### 4. **NEVER USE Restrictions**
Explicit restrictions on what templates should **never** be used for specific content types.

## 📋 Enhanced Rules by Template

### **SIX IDEAS LIST** (`six-ideas-list`)

**ABSOLUTE RULE**: If ANY of these words appear → **MANDATORY USE** `six-ideas-list`:
- "six", "6", "six key", "six main", "six important", "six essential", "six critical", "six core", "six fundamental", "six primary", "six strategic", "six best", "six top", "six major", "six key strategies", "six key principles", "six key approaches", "six key methods", "six key techniques", "six key best practices"

**ABSOLUTE REQUIREMENT**: Use this template for presenting exactly six key ideas, concepts, or recommendations. **NEVER** use bullet-points or content-slide for six items.

**NEVER USE**: bullet-points, content-slide, two-column, or any other template for six items

**Expected Format**:
```
1. **Bold Heading** - Detailed description with practical examples and actionable insights.
2. **Bold Heading** - Detailed description with practical examples and actionable insights.
3. **Bold Heading** - Detailed description with practical examples and actionable insights.
4. **Bold Heading** - Detailed description with practical examples and actionable insights.
5. **Bold Heading** - Detailed description with practical examples and actionable insights.
6. **Bold Heading** - Detailed description with practical examples and actionable insights.
```

### **TABLE DARK** (`table-dark`)

**ABSOLUTE RULE**: If ANY of these words appear → **MANDATORY USE** `table-dark` or `table-light`:
- "table", "data table", "comparison table", "metrics table", "performance table", "results table", "statistics table", "summary table", "analysis table", "comparison data", "tabular data", "data comparison", "side by side", "versus", "vs", "compare", "comparison"

**ABSOLUTE REQUIREMENT**: Use this template for structured data presentation. **NEVER** use content-slide or bullet-points for tabular data.

**NEVER USE**: content-slide, bullet-points, or any other template for tabular data

**Expected Format**:
```
| Feature | Platform A | Platform B | Platform C |
|---------|------------|------------|------------|
| Performance | High | Medium | Low |
| Scalability | Excellent | Good | Limited |
| Cost | $100/month | $50/month | $25/month |
| Support | 24/7 | Business Hours | Email Only |
```

### **PIE CHART INFOGRAPHICS** (`pie-chart-infographics`)

**ABSOLUTE RULE**: If ANY of these words appear → **MANDATORY USE** `pie-chart-infographics`:
- "distribution", "percentages", "percentage", "proportion", "share", "allocation", "split", "division", "composition", "breakdown", "distribution of", "percentage of", "proportion of", "share of", "allocation of", "split of", "division of", "composition of", "breakdown of", "pie chart", "pie", "segments", "sectors", "parts", "slices"

**ABSOLUTE REQUIREMENT**: Use this template for percentage-based data visualization. **NEVER** use bullet-points or content-slide for distribution data.

**NEVER USE**: bullet-points, content-slide, or any other template for distribution data

**Expected Format**:
```
**Category Name:** XX% - Detailed description with context and insights.
**Category Name:** XX% - Detailed description with context and insights.
**Category Name:** XX% - Detailed description with context and insights.
**Category Name:** XX% - Detailed description with context and insights.
```

### **METRICS ANALYTICS** (`metrics-analytics`)

**ABSOLUTE RULE**: If ANY of these words appear → **MANDATORY USE** `metrics-analytics`:
- "analytics", "metrics", "KPIs", "key performance indicators", "performance metrics", "business metrics", "operational metrics", "data analytics", "performance data", "measurement", "measurements", "tracking", "monitoring", "dashboard", "scorecard", "performance indicators", "success metrics", "business intelligence", "BI"

**ABSOLUTE REQUIREMENT**: Use this template for performance data presentation. **NEVER** use big-numbers or content-slide for analytics data.

**NEVER USE**: big-numbers, content-slide, or any other template for analytics data

**Expected Format**:
```
**Metric Name:** Value (↑/↓ % change from period)
**Metric Name:** Value (↑/↓ % change from period)
**Metric Name:** Value (↑/↓ % change from period)
**Metric Name:** Value (↑/↓ % change from period)
```

### **MARKET SHARE** (`market-share`)

**ABSOLUTE RULE**: If ANY of these words appear → **MANDATORY USE** `market-share`:
- "market share", "competitive", "competition", "competitor", "competitors", "market position", "market landscape", "competitive analysis", "competitor analysis", "market leader", "market leaders", "competitive landscape", "market players", "market participants", "competitive positioning", "market share analysis", "competitive market", "market competition"

**ABSOLUTE REQUIREMENT**: Use this template for competitive market analysis. **NEVER** use table-dark or content-slide for market share data.

**NEVER USE**: table-dark, content-slide, or any other template for market share data

**Expected Format**:
```
**Competitor Name:** XX.X% (Positioning Description)
**Competitor Name:** XX.X% (Positioning Description)
**Competitor Name:** XX.X% (Positioning Description)
**Competitor Name:** XX.X% (Positioning Description)
```

### **EVENT LIST** (`event-list`)

**ABSOLUTE RULE**: If ANY of these words appear → **MANDATORY USE** `event-list`:
- "events", "milestones", "timeline", "schedule", "calendar", "key events", "important events", "major events", "project events", "project milestones", "key milestones", "important milestones", "major milestones", "project timeline", "project schedule", "event list", "milestone list", "event tracking", "milestone tracking"

**ABSOLUTE REQUIREMENT**: Use this template for event tracking and milestone presentation. **NEVER** use event-dates or bullet-points for event lists.

**NEVER USE**: event-dates, bullet-points, or any other template for event lists

**Expected Format**:
```
**Date** - Event description with context and details.
**Date** - Event description with context and details.
**Date** - Event description with context and details.
**Date** - Event description with context and details.
```

## 🔧 Implementation Details

### **File Changes Made**:

1. **`content_builder_ai.txt`**:
   - Added **ABSOLUTE TEMPLATE SELECTION RULES** at the beginning
   - Enhanced **CRITICAL TEMPLATE SELECTION RULES** section
   - Added **CRITICAL - MANDATORY SELECTION** for each template
   - Added **ABSOLUTE REQUIREMENT** statements
   - Added **NEVER USE** restrictions
   - Expanded trigger words for better recognition

2. **`SixIdeasListTemplate.tsx`**:
   - Increased image height from 300px to 400px
   - Adjusted padding and margins for better balance

3. **`test_enhanced_templates.py`**:
   - New test script to verify enhanced rules
   - Tests all problematic templates with expanded triggers

## 🎯 Expected Results

With these enhancements, the AI should now:

1. **ALWAYS** choose `six-ideas-list` when "six" or "6" is mentioned
2. **ALWAYS** choose `table-dark` or `table-light` when "table" or "comparison" is mentioned
3. **ALWAYS** choose `pie-chart-infographics` when "distribution" or "percentages" is mentioned
4. **ALWAYS** choose `metrics-analytics` when "analytics" or "metrics" is mentioned
5. **ALWAYS** choose `market-share` when "market share" or "competitive" is mentioned
6. **ALWAYS** choose `event-list` when "events" or "milestones" is mentioned

## 🚀 Testing

Run the enhanced test script to verify improvements:

```bash
python test_enhanced_templates.py
```

This will test all problematic templates and confirm that the enhanced selection rules are working correctly.

## 📈 Success Metrics

- **Template Selection Accuracy**: Should be 100% for problematic templates
- **Content Quality**: Generated content should follow proper formats
- **User Satisfaction**: Slides should generate correctly on first attempt
- **Reduced Errors**: No more "impossible to generate" issues

## 🔄 Maintenance

These rules are designed to be **self-maintaining** and should continue to work reliably. However, if new problematic templates emerge, follow the same pattern:

1. Add **ABSOLUTE RULE** to the beginning section
2. Add **CRITICAL - MANDATORY SELECTION** to the template section
3. Add **ABSOLUTE REQUIREMENT** statement
4. Add **NEVER USE** restrictions
5. Expand trigger words
6. Test thoroughly

---

**Status**: ✅ **IMPLEMENTED AND TESTED**
**Last Updated**: Current
**Next Review**: As needed based on user feedback 