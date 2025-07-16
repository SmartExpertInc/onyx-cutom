# Module-Level Quality Tier Implementation

## Overview

This implementation extends the existing three-level quality tier hierarchy to include module-level settings, creating a comprehensive four-level inheritance system:

**Folders → Course Outlines → Modules → Individual Lessons**

This provides users with granular control over quality expectations and creation time estimates at every level of content organization.

## Enhanced Hierarchy

### **Level 1: Folder Level (Lowest Priority)**
- **Storage**: `project_folders` table with `quality_tier` and `custom_rate` columns
- **Inheritance**: Supports nested folders with parent folder inheritance
- **Default**: Interactive tier (200 custom rate) if no settings defined
- **Scope**: Applies to all projects, modules, and lessons within the folder and its subfolders

### **Level 2: Project Level (Low-Medium Priority)**
- **Storage**: `projects` table with `quality_tier` and `custom_rate` columns
- **Override**: Takes precedence over folder settings
- **Scope**: Applies to all modules and lessons within the Training Plan (course outline)
- **Access**: Via three-dots menu → "Settings" option

### **Level 3: Module Level (Medium-High Priority) - NEW**
- **Storage**: Within `microproduct_content` JSONB structure in `sections` array
- **Override**: Takes precedence over both project and folder settings
- **Scope**: Applies to all lessons within the specific module/section
- **Access**: Gear icon next to module title in edit mode

### **Level 4: Lesson Level (Highest Priority)**
- **Storage**: Within `microproduct_content` JSONB structure in lesson objects
- **Override**: Takes precedence over module, project, and folder settings
- **Scope**: Individual lesson within a course outline
- **Access**: Gear icon next to lesson title in edit mode

## Technical Implementation

### Backend Changes

#### 1. Updated Data Models

```python
class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}
```

#### 2. New Helper Functions

```python
def get_module_effective_custom_rate(section: dict, project_custom_rate: int) -> int:
    """Get the effective custom rate for a module, falling back to project rate if not set"""
    if section.get('custom_rate'):
        return section['custom_rate']
    return project_custom_rate

def get_module_effective_quality_tier(section: dict, project_quality_tier: str) -> str:
    """Get the effective quality tier for a module, falling back to project tier if not set"""
    if section.get('quality_tier'):
        return section['quality_tier']
    return project_quality_tier

def calculate_lesson_creation_hours_with_module_fallback(lesson: dict, section: dict, project_custom_rate: int) -> int:
    """Calculate creation hours for a lesson with module-level fallback"""
    completion_time_str = lesson.get('completionTime', '')
    if not completion_time_str:
        return 0
    
    try:
        completion_time_minutes = int(completion_time_str.replace('m', ''))
        
        # Check lesson-level tier first, then module-level, then project-level
        if lesson.get('custom_rate'):
            effective_custom_rate = lesson['custom_rate']
        elif section.get('custom_rate'):
            effective_custom_rate = section['custom_rate']
        else:
            effective_custom_rate = project_custom_rate
            
        return calculate_creation_hours(completion_time_minutes, effective_custom_rate)
    except (ValueError, AttributeError):
        return 0
```

#### 3. Updated Tier Inheritance Logic

Enhanced folder and project tier updates to clear module-level settings when higher-level changes are made, ensuring proper inheritance cascading.

### Frontend Changes

#### 1. Updated TypeScript Types

```typescript
export interface Section {
  id: string;
  title: string;
  totalHours: number;
  lessons: Lesson[];
  autoCalculateHours?: boolean;
  custom_rate?: number; // Module-level custom rate override
  quality_tier?: string; // Module-level quality tier override
}
```

#### 2. New ModuleSettingsModal Component

- **File**: `custom_extensions/frontend/src/app/projects/ModuleSettingsModal.tsx`
- **Features**:
  - Identical UI/UX to existing LessonSettingsModal and ProjectSettingsModal
  - Supports all quality tiers: Basic, Interactive, Advanced, Immersive
  - Custom rate slider with tier-specific ranges
  - Real-time creation hours calculation preview
  - Comprehensive tier descriptions and feature lists

#### 3. Enhanced TrainingPlanTable Component

**New Features**:
- Module settings button (gear icon) next to module title in edit mode
- Module settings modal state management
- Automatic recalculation of all lessons in module when module tier changes
- Clears lesson-level tier settings when module tier is set (to ensure inheritance)

**User Experience**:
- Settings button only visible in edit mode
- Immediate recalculation and visual feedback
- Proper tier inheritance display

## Tier Resolution Logic

### Effective Rate Calculation

```
For any lesson:
1. Check lesson.custom_rate → Use if set
2. Check section.custom_rate → Use if set
3. Check project.custom_rate → Use if set  
4. Check folder.custom_rate (with parent inheritance) → Use if set
5. Default to 200 (Interactive tier)
```

### Tier Precedence Rules

1. **Lesson-level settings** always take highest priority
2. **Module-level settings** override project and folder settings
3. **Project-level settings** override folder settings
4. **Folder-level settings** inherit from parent folders
5. **System defaults** apply when no settings exist

## Quality Tiers Configuration

| Tier | Base Rate | Range | Description | Features |
|------|-----------|-------|-------------|----------|
| **Basic** | 100 | 10-200 | Simple e-learning content | Slides, Text, Simple Tests, Non-interactive SCORM |
| **Interactive** | 200 | 100-250 | Engaging interactive content | Animations, Clickable Blocks, Voiceover, Interactive SCORM, Mobile Support |
| **Advanced** | 300 | 200-400 | Sophisticated learning experiences | Scenarios, Simulations, Gamification, Adaptation to Roles, Multilingualism |
| **Immersive** | 700 | 400-1000 | Premium learning experiences | Videos with Actors, VR/AR, LMS-Integration, Personalized Courses and Simulations |

## User Workflow

### Setting Module-Level Tiers

1. **Access**: User enters edit mode for a Training Plan project
2. **Navigate**: Locate the desired module/section in the course outline
3. **Configure**: Click the gear icon next to the module title
4. **Select Tier**: Choose quality tier and adjust custom rate in modal
5. **Preview**: View real-time calculation of how this affects all lessons in the module
6. **Save**: Apply settings immediately with automatic recalculation

### Inheritance Behavior

- **Setting module tier**: Clears all lesson-level tiers within that module
- **Setting project tier**: Clears all module and lesson-level tiers in the project
- **Setting folder tier**: Clears all project, module, and lesson-level tiers in the folder

### Visual Indicators

- **Tier Colors**: Each tier maintains distinct visual identity
- **Settings Icons**: Gear icons appear at appropriate levels in edit mode
- **Real-time Updates**: Creation hours update immediately when tiers change
- **Inheritance Display**: UI shows which level settings are being applied

## Benefits

### 1. **Maximum Flexibility**
- Different modules within the same course can have different complexity levels
- Mixed-complexity courses accurately reflected in time estimates
- Client-specific requirements easily accommodated

### 2. **Logical Organization**
- Mirrors how course content is actually structured
- Intuitive hierarchy that matches user mental models
- Consistent with existing folder and project organization

### 3. **Precise Estimation**
- More accurate creation time estimates for complex projects
- Better resource planning and client pricing
- Improved project scoping accuracy

### 4. **Simplified Management**
- Set tier once at module level, affects all lessons
- Override individual lessons only when needed
- Clear inheritance rules eliminate confusion

## Example Use Cases

### 1. **Mixed-Complexity Training Program**
- **Module 1: Basic Introduction** → Basic tier (100h rate)
- **Module 2: Interactive Exercises** → Interactive tier (200h rate)  
- **Module 3: Advanced Simulations** → Advanced tier (300h rate)
- **Module 4: VR Experience** → Immersive tier (700h rate)

### 2. **Client-Specific Customization**
- **Folder**: Standard Interactive tier (200h)
- **Project**: Override to Advanced tier (300h) for premium client
- **Module 3**: Override to Immersive tier (700h) for showcase module
- **Lesson 3.2**: Override to Basic tier (100h) for simple review lesson

### 3. **Iterative Development**
- Start with folder-level Interactive tier
- Identify complex modules and upgrade to Advanced
- Mark pilot modules as Immersive for maximum quality
- Leave simple introduction modules at Basic tier

## API Compatibility

All existing API endpoints remain fully compatible:
- Folder tier updates cascade to modules and lessons
- Project tier updates cascade to modules and lessons  
- Lesson-level settings work as before
- No breaking changes to existing functionality

The module-level tier settings are stored in the existing `microproduct_content` JSONB structure, requiring no database schema changes while providing the new functionality seamlessly. 