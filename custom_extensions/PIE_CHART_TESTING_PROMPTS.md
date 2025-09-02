# Pie Chart Testing Prompts

## Problem
PieChart все еще генерируется с русскими названиями "Сегмент 1", "Сегмент 2" и т.д., хотя запрос был на английском языке.

## Solution Applied
Добавлены строгие правила в `content_builder_ai.txt`:
- **CRITICAL LANGUAGE RULE FOR PIE CHARTS** - всегда использовать английские названия
- **ABSOLUTELY FORBIDDEN LABELS** - список запрещенных русских и общих названий
- **MANDATORY BUSINESS CATEGORIES** - список обязательных бизнес-категорий для использования

## Ready-to-Test Prompts

### 1. Revenue Distribution (Revenue Distribution)
```
Create slides showing revenue distribution and market breakdown
```
**Expected Labels:**
- Cloud Services
- Mobile Applications  
- Data Analytics
- AI Solutions
- Security Tools
- Integration Services

### 2. Market Share Analysis (Market Share Analysis)
```
Create slides about market share analysis and competitive positioning
```
**Expected Labels:**
- North America
- Europe
- Asia Pacific
- Latin America
- Middle East
- Africa

### 3. Budget Allocation (Budget Allocation)
```
Create slides about budget allocation and percentage analysis
```
**Expected Labels:**
- Product Development
- Marketing
- Sales
- Customer Support
- Operations
- Administration

### 4. Geographic Distribution (Geographic Distribution)
```
Create slides showing geographic distribution and regional breakdown
```
**Expected Labels:**
- North America
- Europe
- Asia Pacific
- Latin America
- Middle East
- Africa

### 5. Product Portfolio (Product Portfolio)
```
Create slides about product portfolio distribution and market segments
```
**Expected Labels:**
- Enterprise Solutions
- SMB Market
- Consumer Products
- Professional Services
- Hardware Sales
- Software Licenses

### 6. Sales Channels (Sales Channels)
```
Create slides showing sales channel distribution and partner analysis
```
**Expected Labels:**
- Direct Sales
- Channel Partners
- Online Sales
- Consulting
- Training
- Maintenance

## Forbidden Labels (Should NEVER Appear)
❌ **Russian Labels:**
- Сегмент 1, Сегмент 2, Сегмент 3, Сегмент 4, Сегмент 5, Сегмент 6

❌ **Generic English Labels:**
- Segment 1, Segment 2, Segment 3, Segment 4, Segment 5, Segment 6
- Category A, Category B, Category C, Category D, Category E, Category F
- Part 1, Part 2, Part 3, Part 4, Part 5, Part 6

## Valid Business Categories (Should ALWAYS Be Used)
✅ **Technology Services:**
- Cloud Services, Mobile Applications, Data Analytics, AI Solutions, Security Tools, Integration Services

✅ **Market Segments:**
- Enterprise Solutions, SMB Market, Consumer Products, Professional Services, Hardware Sales, Software Licenses

✅ **Geographic Regions:**
- North America, Europe, Asia Pacific, Latin America, Middle East, Africa

✅ **Revenue Categories:**
- Q1 Revenue, Q2 Revenue, Q3 Revenue, Q4 Revenue, Annual Growth, Market Expansion

✅ **Business Functions:**
- Product Development, Marketing, Sales, Customer Support, Operations, Administration

✅ **Sales Channels:**
- Direct Sales, Channel Partners, Online Sales, Consulting, Training, Maintenance

## Testing Instructions

1. **Use any of the prompts above** to generate a presentation
2. **Check that PieChart is selected** (should be automatic with "distribution" keywords)
3. **Verify that labels are in English** and use business categories
4. **Confirm no Russian labels** like "Сегмент 1" appear
5. **Ensure exactly 6 segments** with percentages totaling ~100%

## Expected Behavior

After the fixes, when you use any of these prompts:

✅ **Template Selection:** `pie-chart-infographics` should be automatically selected
✅ **Language:** All labels should be in English only
✅ **Categories:** Should use professional business terms
✅ **Structure:** Exactly 6 segments with proper percentages
✅ **Quality:** Detailed descriptions for each segment

## If Problems Persist

If PieChart still generates Russian labels:

1. **Check the prompt** - make sure it contains "distribution" or "percentages"
2. **Verify template selection** - should be `pie-chart-infographics`
3. **Review the generated JSON** - look for the `chartData.segments` array
4. **Check the labels** - should be English business categories only

## Debug Commands

Run these tests to verify the configuration:

```bash
# Test PieChart specific rules
python test_pie_chart_english_labels.py

# Test all template props generation
python test_enhanced_props_generation.py
```

## Success Criteria

✅ **No Russian labels** in any generated PieChart
✅ **Professional English categories** used consistently  
✅ **Exactly 6 segments** with meaningful business terms
✅ **Proper percentage distribution** (total ~100%)
✅ **Detailed descriptions** for each segment 