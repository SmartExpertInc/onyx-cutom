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

# Individual Lesson-Level Tier Settings Implementation

This document describes the implementation of individual lesson-level completion/creation ratio settings in course outline edit mode, extending the existing project-level settings to provide granular control over each lesson's tier settings.

## Overview

The lesson-level tier settings feature allows users to configure completion/creation ratios for individual lessons within a Training Plan, providing more precise control over creation hour calculations than folder or project-level settings alone.

## Frontend Implementation

### 1. Updated Types (`custom_extensions/frontend/src/types/trainingPlan.ts`)

```typescript
export interface Lesson {
  id?: string;
  title: string;
  check: StatusInfo;
  contentAvailable: StatusInfo;
  source: string;
  hours: number;
  completionTime: string;
  custom_rate?: number; // Individual lesson-level custom rate override
  quality_tier?: string; // Individual lesson-level quality tier override
}
```

### 2. Lesson Settings Modal (`custom_extensions/frontend/src/app/projects/LessonSettingsModal.tsx`)

New modal component (344 lines) that provides:

- **Quality Tier Selection**: Basic (100h), Interactive (200h), Advanced (300h), Immersive (700h)
- **Custom Rate Sliders**: Tier-specific ranges for fine-tuning
- **Real-time Preview**: Shows calculated creation hours based on completion time and rate
- **Validation**: Ensures proper tier constraints and rate limits

### 3. Integration in TrainingPlanTable (`custom_extensions/frontend/src/components/TrainingPlanTable.tsx`)

#### Added Features:
- **Settings Button**: Gear icon next to each lesson title in edit mode
- **Modal State Management**: Tracks which lesson is being edited
- **Handler Functions**: 
  - `handleLessonSettingsOpen()`: Opens modal with current lesson settings
  - `handleLessonSettingsSave()`: Updates lesson data and recalculates hours
- **UI Integration**: Settings button appears only in edit mode alongside lesson title input

#### User Experience:
- Settings button visible only when editing Training Plans
- Immediate recalculation of hours when settings are saved
- Visual feedback through hour updates in the interface
- Non-intrusive placement that doesn't disrupt existing workflow

## Backend Implementation

### 1. Updated Data Models (`custom_extensions/backend/main.py`)

```python
class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    model_config = {"from_attributes": True}
```

### 2. Calculation Helper Functions

#### `get_lesson_effective_custom_rate(lesson: dict, project_custom_rate: int) -> int`
- Returns lesson's custom rate if set, otherwise falls back to project rate

#### `get_lesson_effective_quality_tier(lesson: dict, project_quality_tier: str) -> str`
- Returns lesson's quality tier if set, otherwise falls back to project tier

#### `calculate_lesson_creation_hours(lesson: dict, project_custom_rate: int) -> int`
- Calculates creation hours using lesson-specific rate if available
- Falls back to project rate for lessons without individual settings
- Handles completion time parsing and error cases

### 3. Updated Calculation Logic

All tier update functions now use lesson-level calculations:

- **Project Tier Updates**: Use `calculate_lesson_creation_hours()` instead of uniform rate
- **Folder Tier Updates**: Respect lesson-level overrides when recalculating
- **Project Folder Moves**: Apply lesson-specific rates during folder transitions

## Tier Inheritance Hierarchy

The system follows a three-level inheritance hierarchy for tier settings:

1. **Lesson Level** (highest priority)
   - Individual lesson `custom_rate` and `quality_tier` fields
   - Only set when user explicitly configures lesson settings

2. **Project Level** (medium priority)
   - Project-wide `custom_rate` and `quality_tier` fields
   - Fallback for lessons without individual settings

3. **Folder Level** (lowest priority)
   - Folder-wide settings with parent folder inheritance
   - Default when neither lesson nor project settings exist

## Quality Tier Configuration

| Tier | Base Rate | Range | Description |
|------|-----------|-------|-------------|
| Basic | 100 | 10-200 | Simple content creation |
| Interactive | 200 | 100-250 | Engaging interactive content |
| Advanced | 300 | 200-400 | Complex detailed content |
| Immersive | 700 | 400-1000 | Highly immersive experience |

## Database Schema

No additional database changes required - the lesson-level settings are stored within the existing `microproduct_content` JSONB field structure in the `projects` table.

## Usage Flow

1. **Access**: User enters edit mode for a Training Plan project
2. **Configure**: Clicks gear icon next to any lesson title
3. **Set Tier**: Selects quality tier and adjusts custom rate in modal
4. **Preview**: Real-time calculation shows creation hours
5. **Save**: Settings applied immediately with hour recalculation
6. **Persist**: Changes saved to project content and visible immediately

## API Integration

The lesson-level settings work seamlessly with existing project/folder tier API endpoints:

- Settings stored in project content JSON structure
- No new API endpoints required
- Calculation updates automatic through existing save mechanisms
- Backward compatibility maintained for lessons without individual settings

## Benefits

### 1. **Granular Control**
- Individual lesson complexity can be reflected in creation time estimates
- Different types of content within the same course can have appropriate rates

### 2. **Flexible Inheritance** 
- Lessons inherit from project settings by default
- Projects inherit from folder settings when no project settings exist
- Override capability at each level as needed

### 3. **User Experience**
- In-context editing directly in the course outline
- Real-time feedback and calculation updates
- Non-disruptive interface integration

### 4. **Client Customization**
- Different clients can have different expectations for lesson complexity
- Fine-tuning possible without affecting other lessons in the same project

### 5. **Accurate Estimation**
- More precise creation hour estimates for mixed-complexity content
- Better project planning and resource allocation

## Testing Recommendations

1. **Basic Functionality**
   - Create lesson with custom tier settings
   - Verify hour calculations update correctly
   - Test inheritance from project/folder settings

2. **UI Integration**
   - Settings button appears/disappears correctly in edit mode
   - Modal opens with correct current values
   - Changes reflect immediately in the interface

3. **Calculation Accuracy**
   - Verify lesson-level rates override project rates
   - Test fallback to project/folder rates when lesson rate not set
   - Confirm section totals update correctly

4. **Data Persistence**
   - Settings survive page refresh
   - Project save/load preserves lesson-level settings
   - Export/import maintains tier configuration

5. **Edge Cases**
   - Lessons with no completion time
   - Invalid tier configurations
   - Missing project/folder fallback settings

## Implementation Notes

- **No Migrations Required**: Uses existing database schema
- **Backward Compatible**: Existing projects work unchanged
- **Performance**: Calculation functions optimized for minimal overhead
- **Maintainable**: Follows existing patterns for settings and modals
- **Extensible**: Structure allows for future enhancements to lesson-level configuration

The lesson-level tier settings feature provides the granular control needed for accurate project estimation while maintaining the simplicity and usability of the existing course outline interface. 