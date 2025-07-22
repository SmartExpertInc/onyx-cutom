# Completion Time Auto-Recalculations Implementation

## Overview

This implementation adds automatic recalculation of creation time (both lesson and total module) when completion time is changed. The system now provides real-time updates that respect the quality tier hierarchy and maintain consistency across all time calculations.

## Problem Solved

Previously, when users changed the completion time of a lesson, the creation time (hours) was not automatically recalculated. Users had to manually update the creation time or change the quality tier to trigger a recalculation. This implementation fixes this by:

1. **Auto-recalculating lesson creation hours** when completion time changes
2. **Auto-recalculating module total hours** when lesson hours change
3. **Respecting tier inheritance hierarchy** (Lesson → Section → Project → Default)
4. **Maintaining consistency** with existing quality tier change behaviors

## Technical Implementation

### 1. Backend Changes

#### API Response Enhancement
**File**: `custom_extensions/backend/main.py`

- **Updated `MicroProductApiResponse` model** to include project-level settings:
  ```python
  class MicroProductApiResponse(BaseModel):
      # ... existing fields ...
      custom_rate: Optional[int] = None
      quality_tier: Optional[str] = None
  ```

- **Enhanced `/api/custom/projects/view/{project_id}` endpoint** to return project-level settings:
  ```python
  return MicroProductApiResponse(
      # ... existing fields ...
      custom_rate=row_dict.get("custom_rate"),
      quality_tier=row_dict.get("quality_tier")
  )
  ```

### 2. Frontend Changes

#### Type Definitions
**Files**: 
- `custom_extensions/frontend/src/types/trainingPlan.ts`
- `custom_extensions/frontend/src/types/projectSpecificTypes.ts`

- **Updated `ProjectInstanceDetail` interface**:
  ```typescript
  export interface ProjectInstanceDetail {
    // ... existing fields ...
    custom_rate?: number | null; // Project-level custom rate
    quality_tier?: string | null; // Project-level quality tier
  }
  ```

#### Component Updates
**File**: `custom_extensions/frontend/src/components/TrainingPlanTable.tsx`

- **Enhanced `TrainingPlanTableProps` interface**:
  ```typescript
  interface TrainingPlanTableProps {
    // ... existing props ...
    projectCustomRate?: number | null; // Project-level custom rate for fallback
    projectQualityTier?: string | null; // Project-level quality tier for fallback
  }
  ```

- **Updated completion time change handler** to auto-recalculate creation hours:
  ```typescript
  onChange={(e) => {
    // Update completion time
    handleGenericInputChange(['sections', sectionIdx, 'lessons', lessonIndex, 'completionTime'], e);
    
    // Auto-recalculate creation hours based on new completion time
    const newCompletionTime = e.target.value;
    if (newCompletionTime) {
      // Parse completion time (e.g., "5m" -> 5)
      const completionTimeMinutes = parseInt(newCompletionTime.replace(/[^0-9]/g, '')) || 5;
      
      // Get effective custom rate for this lesson
      let effectiveCustomRate = 200; // Default to Interactive tier
      
      // Check lesson-level custom rate first
      if (lesson.custom_rate) {
        effectiveCustomRate = lesson.custom_rate;
      } else {
        // Check section-level custom rate
        const section = sections?.[sectionIdx];
        if (section?.custom_rate) {
          effectiveCustomRate = section.custom_rate;
        } else {
          // Check project-level custom rate
          if (projectCustomRate) {
            effectiveCustomRate = projectCustomRate;
          }
        }
      }
      
      // Calculate new creation hours using the same formula as backend
      const newHours = Math.round((completionTimeMinutes / 60.0) * effectiveCustomRate);
      
      // Update lesson hours
      onTextChange(['sections', sectionIdx, 'lessons', lessonIndex, 'hours'], newHours);
      
      // Auto-recalculate module total hours
      const currentSection = sections?.[sectionIdx];
      if (currentSection) {
        const updatedLessons = [...(currentSection.lessons || [])];
        updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], hours: newHours };
        const newTotalHours = updatedLessons.reduce((total, l) => total + (l.hours || 0), 0);
        onTextChange(['sections', sectionIdx, 'totalHours'], newTotalHours);
        onTextChange(['sections', sectionIdx, 'autoCalculateHours'], true);
      }
    }
  }}
  ```

#### Project View Integration
**File**: `custom_extensions/frontend/src/app/projects/view/[projectId]/page.tsx`

- **Updated TrainingPlanTable component call** to pass project-level settings:
  ```typescript
  <TrainingPlanTableComponent
    // ... existing props ...
    projectCustomRate={projectInstanceData.custom_rate}
    projectQualityTier={projectInstanceData.quality_tier}
  />
  ```

## Tier Inheritance Hierarchy

The system follows a four-level inheritance hierarchy for custom rates:

1. **Lesson Level** (highest priority)
   - Individual lesson `custom_rate` field
   - Only set when user explicitly configures lesson settings

2. **Section Level** (medium-high priority)
   - Module-level `custom_rate` field
   - Applied to all lessons in the section unless overridden

3. **Project Level** (medium priority)
   - Project-wide `custom_rate` field
   - Fallback for lessons and sections without individual settings

4. **Default Level** (lowest priority)
   - Default Interactive tier (200 custom rate)
   - Used when no other settings are defined

## Calculation Formula

The creation hours calculation uses the same formula as the backend:

```typescript
const newHours = Math.round((completionTimeMinutes / 60.0) * effectiveCustomRate);
```

**Quality Tier Ratios**:
- **Basic**: 1:100 (completion:creation ratio)
- **Interactive**: 1:200 (completion:creation ratio) - Default
- **Advanced**: 1:320 (completion:creation ratio)
- **Immersive**: 1:700 (completion:creation ratio)

## Auto-Recalculations Now Working

### 1. Completion Time Changes
- **Trigger**: User edits completion time field
- **Action**: Creation hours automatically recalculated
- **Cascade**: Module totals updated

### 2. Lesson Hours Changes
- **Trigger**: User edits creation hours field
- **Action**: Module totals automatically recalculated
- **Cascade**: Project totals updated

### 3. Quality Tier Changes
- **Trigger**: User changes lesson/section/project quality tier
- **Action**: All lesson creation hours recalculated
- **Cascade**: Module and project totals updated

## Testing

A comprehensive test script (`test_completion_time_auto_recalculation.py`) verifies:

- ✅ All quality tier calculations work correctly
- ✅ Different completion times produce correct creation hours
- ✅ Rounding behavior matches backend implementation
- ✅ All test cases pass with expected results

**Test Results Example**:
```
5m + basic tier → 8h creation time
5m + interactive tier → 17h creation time  
5m + advanced tier → 27h creation time
5m + immersive tier → 58h creation time
```

## Benefits

1. **Improved User Experience**: No more manual recalculation needed
2. **Consistency**: All time calculations follow the same logic
3. **Real-time Updates**: Changes are immediately reflected
4. **Tier Respect**: Proper inheritance hierarchy maintained
5. **Data Integrity**: Module totals always match lesson sums

## Integration Points

- **Existing Systems**: Works seamlessly with current quality tier settings
- **Backend Consistency**: Uses same calculation logic as backend APIs
- **Auto-save**: Changes trigger existing auto-save mechanisms
- **PDF Generation**: Updated totals are reflected in exports
- **Analytics**: Accurate time calculations for reporting

## Future Enhancements

- **Bulk Operations**: Apply completion time changes to multiple lessons
- **Undo/Redo**: Track changes for better user control
- **Validation**: Prevent invalid completion time entries
- **Performance**: Optimize for large training plans with many lessons 