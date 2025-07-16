# Project-Level Completion:Creation Ratio Settings Implementation

## Overview

This implementation adds the ability to set individual completion:creation ratios for each course (Training Plan project), allowing users to override the folder-level settings for specific projects.

## Backend Changes

### Database Schema
- Added `custom_rate` (INTEGER) and `quality_tier` (TEXT) columns to the `projects` table
- Added corresponding columns to the `trashed_projects` table for schema consistency
- Created indexes for optimal query performance

### New API Endpoint
**PATCH** `/api/custom/projects/{project_id}/tier`

**Request Body:**
```json
{
  "quality_tier": "interactive", 
  "custom_rate": 200
}
```

**Response:** Returns updated `ProjectDB` object with new tier settings

### Helper Functions
- `get_project_custom_rate(project_id, pool)` - Gets effective custom rate with folder fallback
- `get_project_quality_tier(project_id, pool)` - Gets effective quality tier with folder fallback

### Updated Models
- `ProjectDB` - Added `custom_rate` and `quality_tier` fields
- `ProjectUpdateRequest` - Added support for project-level tier updates
- `ProjectTierRequest` - New model for tier update requests

## Frontend Changes

### New Component
**`ProjectSettingsModal.tsx`** - Modal component for configuring project-level settings
- Identical UI/UX to the existing folder settings modal
- Supports all quality tiers: Basic, Interactive, Advanced, Immersive
- Custom rate slider with tier-specific ranges
- Real-time creation hours calculation updates

### Updated Components

#### ProjectsTable.tsx
- Added "Settings" menu option to the three-dots menu for Training Plan projects only
- Integrated `ProjectSettingsModal` for both table and card views
- Added state management for settings modal visibility

## User Experience

### Access
1. Users can access project settings via the three-dots menu on any Training Plan (course outline)
2. The "Settings" option appears only for Training Plan projects, not individual lessons

### Functionality
1. **Override Folder Settings**: Project-level settings take precedence over folder settings
2. **Automatic Recalculation**: When tier/rate is changed, all lesson creation hours are automatically recalculated
3. **Real-time Updates**: Changes are immediately reflected in the project view after saving
4. **Fallback Logic**: If no project-level settings are defined, the system falls back to folder settings

### Quality Tiers
- **Basic** (100h default): 10-200h range
- **Interactive** (200h default): 100-250h range  
- **Advanced** (300h default): 200-400h range
- **Immersive** (700h default): 400-1000h range

## Technical Details

### Creation Hours Calculation
```python
def calculate_creation_hours(completion_time_minutes: int, custom_rate: int) -> int:
    completion_hours = completion_time_minutes / 60.0
    creation_hours = completion_hours * custom_rate
    return round(creation_hours)
```

### Inheritance Logic
1. Check if project has custom settings → Use project settings
2. If not, check if project is in a folder → Use folder settings  
3. If no folder, use default values (Interactive tier, 200 custom rate)

### Database Updates
When tier/rate is updated:
1. Project record is updated with new `custom_rate` and `quality_tier`
2. All lessons in the project's microproduct_content are recalculated
3. Section totals are updated to reflect new lesson hours
4. Updated content is saved back to the database

## Integration Points

### Existing Systems
- **Folder Settings**: Project settings override but don't conflict with folder settings
- **PDF Generation**: Uses effective rates for creation hours in exports
- **Analytics**: Project-level rates are used for reporting and calculations

### Future Enhancements
- Bulk tier updates for multiple projects
- Tier history tracking
- Project template tier defaults
- Custom tier creation

## API Examples

### Update Project Tier
```bash
curl -X PATCH /api/custom/projects/123/tier \
  -H "Content-Type: application/json" \
  -d '{"quality_tier": "advanced", "custom_rate": 350}'
```

### Response
```json
{
  "id": 123,
  "project_name": "Advanced Leadership Training",
  "quality_tier": "advanced", 
  "custom_rate": 350,
  "microproduct_content": {
    "sections": [
      {
        "lessons": [
          {
            "title": "Introduction",
            "completionTime": "10m",
            "hours": 58  // Recalculated: (10/60) * 350
          }
        ]
      }
    ]
  }
}
```

## Testing

The implementation can be tested by:
1. Creating a Training Plan project
2. Opening the three-dots menu
3. Selecting "Settings"
4. Changing the tier and custom rate
5. Verifying creation hours are recalculated correctly

## Benefits

1. **Flexibility**: Different courses can have different complexity levels
2. **Accuracy**: More precise creation hour estimates per project type
3. **Client Customization**: Tailor estimates for specific client requirements
4. **Granular Control**: Override folder defaults when needed while maintaining hierarchy 