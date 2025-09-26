# Lesson Plan Resources and Prompts Update Implementation

## Overview
Implementing the requested changes to make Resources show actual source materials and Prompts match product blocks exactly.

## Changes Required

### 1. Backend Changes (✅ PARTIALLY COMPLETED)

**File**: custom_extensions/backend/main.py

**✅ Added Source Materials Extraction** (Line ~17022):
- Extracts actual files, folders, connectors, text, or knowledge base queries used
- Falls back to "General Knowledge" if no source materials found
- Code successfully added before OpenAI prompt preparation

**🔄 Still Needed**:
- Update AI prompt to use actual source materials in MATERIALS section
- Update AI prompt to generate exactly one prompt per recommended product
- Format prompts with clear product type titles

### 2. Frontend Changes (🔄 NEEDED)

**File**: custom_extensions/frontend/src/components/LessonPlanView.tsx

**Changes Needed**:
1. Update handleSeePrompt function to scroll to prompts section instead of copying
2. Update Resources section to display lessonPlanData.materials as actual source materials
3. Update Prompts section to show individual prompts with product-specific titles
4. Add proper IDs for scrolling and highlighting

## Implementation Plan

### Phase 1: Complete Backend Updates
1. Update AI prompt MATERIALS section to use {', '.join(source_materials)}
2. Update AI prompt to generate exactly {len(payload.recommendedProducts)} prompts
3. Format prompts as: **[PRODUCT TYPE] Creation Prompt:**\n[prompt content]

### Phase 2: Frontend Updates
1. Update handleSeePrompt to scroll to prompts section
2. Update Resources section to show actual source materials
3. Update Prompts section to parse and display product-specific prompts
4. Add highlighting when user clicks "See Prompt"

## Expected Results

### Resources Section:
- **Before**: Generic content creation resources
- **After**: Actual source materials used (e.g., "Document ID: 123", "Connector: Google Drive", "General Knowledge")

### Prompts Section:
- **Before**: Mixed prompts that may not match products exactly
- **After**: Exactly one prompt per recommended product with clear titles:
  - **Video Lesson Creation Prompt:** [content]
  - **Quiz Creation Prompt:** [content]

### "See Prompt" Button:
- **Before**: Copies prompt to clipboard
- **After**: Scrolls to prompts section and highlights the specific prompt

## Status
- ✅ Backend source materials extraction: COMPLETED
- 🔄 Backend AI prompt updates: IN PROGRESS
- 🔄 Frontend component updates: PENDING
