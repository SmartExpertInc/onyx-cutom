# Module Totals Implementation with Tier Adjustments

## Overview

This implementation enhances the course outline system to calculate **module-level (section) totals** by summing the tier-adjusted creation hours for each lesson within that module. This provides more accurate time estimates that reflect the quality tier of the folder containing the project.

## Key Changes

### 1. Backend API Enhancement (`/api/custom/projects/{project_id}/lesson-data`)

**File**: `custom_extensions/backend/main.py`

**Changes**:
- Modified the lesson-data endpoint to calculate and return section-level totals
- Added `sections` array to the response with tier-adjusted totals for each section
- Each section now includes:
  - `id`: Section identifier
  - `title`: Section title  
  - `totalHours`: Tier-adjusted creation hours (sum of lesson hours)
  - `totalCompletionTime`: Total completion time in minutes
  - `lessonCount`: Number of lessons in the section

**Response Structure**:
```json
{
  "lessonCount": 6,
  "totalHours": 350,
  "completionTime": 105,
  "sections": [
    {
      "id": "mod1",
      "title": "Module 1: Introduction", 
      "totalHours": 100,
      "totalCompletionTime": 30,
      "lessonCount": 3
    },
    {
      "id": "mod2",
      "title": "Module 2: Advanced Topics",
      "totalHours": 250, 
      "totalCompletionTime": 75,
      "lessonCount": 3
    }
  ]
}
```

### 2. Folder Tier Update Enhancement

**File**: `custom_extensions/backend/main.py`

**Changes**:
- Enhanced the folder tier update function to recalculate section totals when tier changes
- When a folder's tier is updated, all projects in that folder have their section totals recalculated
- Section `totalHours` are updated to reflect the new tier-adjusted sums

### 3. Tier-Based Calculation Logic

**Tier Ratios**:
- **Starter**: 1:120 (completion:creation ratio)
- **Medium**: 1:200 (completion:creation ratio) - Default
- **Advanced**: 1:320 (completion:creation ratio)
- **Professional**: 1:450 (completion:creation ratio)

**Calculation Formula**:
```python
def calculate_creation_hours(completion_time_minutes: int, tier: str) -> int:
    ratio = get_tier_ratio(tier)
    completion_hours = completion_time_minutes / 60.0
    creation_hours = completion_hours * ratio
    return round(creation_hours)
```

**Example Calculations**:
- 5-minute lesson in Starter tier: `(5/60) * 120 = 10 hours`
- 10-minute lesson in Medium tier: `(10/60) * 200 = 33 hours`
- 15-minute lesson in Advanced tier: `(15/60) * 320 = 80 hours`
- 30-minute lesson in Professional tier: `(30/60) * 450 = 225 hours`

## Frontend Compatibility

The frontend (`ProjectsTable.tsx`) already handles the new response structure correctly:

- Uses the aggregated `totalHours` from the API response
- Displays tier-adjusted creation hours in the projects table
- No frontend changes required - the existing `lessonDataCache` structure works with the new API response

## Testing

**Test File**: `test_module_totals.py`

**Test Coverage**:
- ✅ Tier ratio verification
- ✅ Individual creation hours calculation
- ✅ Module totals calculation by summing tier-adjusted lesson hours
- ✅ Project totals verification
- ✅ All tier levels (starter, medium, advanced, professional)

**Test Results Example**:
```
📊 Testing Tier: MEDIUM
Tier Ratio: 1:200 (completion:creation)

  📚 Module 1: Module 1: Introduction
    📝 Lesson 1: 5m → 17h
    📝 Lesson 2: 10m → 33h  
    📝 Lesson 3: 15m → 50h
    📊 Module Total: 100h (30m completion time)

  📚 Module 2: Module 2: Advanced Topics
    📝 Lesson 1: 20m → 67h
    📝 Lesson 2: 25m → 83h
    📝 Lesson 3: 30m → 100h
    📊 Module Total: 250h (75m completion time)

  🎯 Project Total: 350h (105m completion time)
  ✅ Verification passed: 350h = 350h
```

## Benefits

1. **Accurate Time Estimates**: Module totals now reflect the actual tier-adjusted creation time
2. **Tier-Aware Calculations**: Higher quality tiers result in higher creation time estimates
3. **Consistent Logic**: Both lesson-level and module-level calculations use the same tier ratios
4. **Real-time Updates**: When folder tiers change, all affected projects are automatically recalculated
5. **Backward Compatibility**: Existing frontend code continues to work without modifications

## Implementation Details

### Database Impact
- No database schema changes required
- Section totals are calculated on-demand from lesson completion times
- Tier information is stored in the `project_folders` table

### Performance Considerations
- Calculations are performed when lesson data is requested
- Tier inheritance is resolved recursively (folder → parent folder → default)
- Results are cached in the frontend `lessonDataCache`

### Error Handling
- Invalid completion times are skipped (logged as warnings)
- Missing tier information defaults to 'medium' tier
- API errors return appropriate HTTP status codes

## Usage Examples

### API Response
```bash
GET /api/custom/projects/123/lesson-data
```

**Response**:
```json
{
  "lessonCount": 6,
  "totalHours": 350,
  "completionTime": 105,
  "sections": [
    {
      "id": "mod1",
      "title": "Introduction to AI",
      "totalHours": 100,
      "totalCompletionTime": 30,
      "lessonCount": 3
    }
  ]
}
```

### Folder Tier Update
```bash
PATCH /api/custom/projects/folders/456/tier
Content-Type: application/json

{
  "quality_tier": "professional"
}
```

This will automatically recalculate all section totals for projects in folder 456 using the professional tier ratio (1:450).

## Future Enhancements

1. **Caching**: Consider caching tier-adjusted calculations to improve performance
2. **Bulk Operations**: Add endpoints for bulk tier updates across multiple folders
3. **Analytics**: Track tier usage and calculation accuracy over time
4. **Custom Ratios**: Allow users to define custom tier ratios for specific use cases 