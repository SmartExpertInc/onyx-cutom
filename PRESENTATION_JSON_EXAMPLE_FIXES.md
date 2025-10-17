# Critical Issue: JSON Example is Outdated and Causing Poor Generation

## Problem Identified

The AI is generating poor presentations because the `DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM` in `custom_extensions/backend/main.py` contains:

1. **Short bullets** (8-12 words instead of required 60-100 words)
2. **Agenda slide** ("What We'll Cover Today" - which we banned)
3. **Limited template diversity** (only 8-9 templates shown)
4. **Missing previewKeyPoints** on most slides
5. **Illustration-style image prompts** instead of realistic scenes

## Root Cause

The AI follows the JSON example more closely than the text instructions. Despite our detailed requirements for:
- 60-100 word bullets
- No agenda slides  
- Diverse templates
- Realistic image prompts
- previewKeyPoints on every slide

The AI copies the pattern from the short, simple example instead.

## Solution Required

**Replace the entire `DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM` starting at line 1022** with the comprehensive example I created in `NEW_SLIDE_DECK_JSON_EXAMPLE.json` that demonstrates:

✅ **Rich 60-100 word bullets** with detailed explanations, examples, and tools
✅ **No agenda slides** - starts directly with educational content  
✅ **Diverse templates**: hero-title-slide, two-column, process-steps, bullet-points-right, big-image-top, big-numbers, four-box-grid, challenges-solutions, timeline, big-image-left
✅ **previewKeyPoints on every slide** (4-6 detailed bullets each)
✅ **Realistic image prompts** starting with "Realistic cinematic scene of..."
✅ **30-50 word process steps** with implementation details
✅ **Rich big-numbers descriptions** explaining significance

## Impact

This single change will fix all the generation issues:
- Template repetition (AI will see diverse examples)
- Short content (AI will copy the rich content style)  
- Agenda slides (removed from example)
- Poor images (realistic prompts in example)
- Missing preview bullets (every slide has them)

## Implementation

The JSON example is around lines 1022-1400+ in `custom_extensions/backend/main.py`. It needs to be completely replaced with the new comprehensive example that matches our quality requirements. 