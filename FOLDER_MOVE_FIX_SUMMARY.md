# Folder Move Error Fix Summary

## Problem Description

When trying to remove a product from a folder (by setting `folder_id` to `null`), the system was encountering a 500 Internal Server Error with the following validation errors:

```
pydantic_core._pydantic_core.ValidationError: 8 validation errors for ProjectDB
microproduct_content.TrainingPlanDetails.sections.0.totalHours
  Input should be a valid integer, got a number with a fractional part [type=int_from_float, input_value=15.5, input_type=float]
```

## Root Cause Analysis

The issue was in the `update_project_folder` function in `custom_extensions/backend/main.py`. When a project was moved to a folder, the system would:

1. Recalculate lesson hours based on the folder's tier
2. Update the content in the database
3. Try to return a `ProjectDB` model

However, there were two main problems:

### 1. **Float to Integer Conversion Error**
- The section `totalHours` were being calculated as floats (e.g., 15.5)
- The Pydantic model `SectionDetail` expects `totalHours` to be an integer
- The `round()` function was being used but the result wasn't being properly applied

### 2. **Pydantic Model Parsing Error**
- The function was trying to create a `ProjectDB` model directly from the database row
- The content structure might not match the expected Pydantic models exactly
- Missing proper content parsing based on component type

## Solution Implemented

### 1. **Fixed Section Total Calculation**
```python
# Update the hours in each lesson and recalculate section totals
for section in sections:
    if isinstance(section, dict) and 'lessons' in section:
        section_total_hours = 0
        for lesson in section['lessons']:
            if isinstance(lesson, dict) and lesson.get('completionTime'):
                # Calculate new hours for this lesson
                lesson_completion_time = int(lesson['completionTime'].replace('m', ''))
                lesson_creation_hours = calculate_creation_hours(lesson_completion_time, folder_tier)
                lesson['hours'] = lesson_creation_hours
                section_total_hours += lesson_creation_hours
        
        # Update the section's totalHours with tier-adjusted sum
        if 'totalHours' in section:
            section['totalHours'] = round(section_total_hours)
```

### 2. **Added Content Rounding**
```python
# Round all hours in the content to ensure they are integers
content = round_hours_in_content(content)
```

### 3. **Fixed Pydantic Model Creation**
```python
# Parse the content properly based on component type
db_content = updated_project["microproduct_content"]
final_content_for_model: Optional[MicroProductContentType] = None

if db_content and isinstance(db_content, dict):
    try:
        # Get the component name to determine the content type
        component_row = await conn.fetchrow(
            "SELECT dt.component_name FROM projects p JOIN design_templates dt ON p.design_template_id = dt.id WHERE p.id = $1",
            project_id
        )
        current_component_name = component_row["component_name"] if component_row else COMPONENT_NAME_TRAINING_PLAN
        
        if current_component_name == COMPONENT_NAME_PDF_LESSON:
            final_content_for_model = PdfLessonDetails(**db_content)
        elif current_component_name == COMPONENT_NAME_TEXT_PRESENTATION:
            final_content_for_model = TextPresentationDetails(**db_content)
        elif current_component_name == COMPONENT_NAME_TRAINING_PLAN:
            final_content_for_model = TrainingPlanDetails(**db_content)
        elif current_component_name == COMPONENT_NAME_VIDEO_LESSON:
            final_content_for_model = VideoLessonData(**db_content)
        elif current_component_name == COMPONENT_NAME_QUIZ:
            final_content_for_model = QuizData(**db_content)
        elif current_component_name == COMPONENT_NAME_SLIDE_DECK:
            final_content_for_model = SlideDeckDetails(**db_content)
        else:
            final_content_for_model = TrainingPlanDetails(**db_content)
    except Exception as e_parse:
        logger.error(f"Error parsing updated content from DB (proj ID {updated_project['id']}): {e_parse}", exc_info=not IS_PRODUCTION)

return ProjectDB(
    id=updated_project["id"], 
    onyx_user_id=updated_project["onyx_user_id"], 
    project_name=updated_project["project_name"],
    product_type=updated_project["product_type"], 
    microproduct_type=updated_project["microproduct_type"],
    microproduct_name=updated_project["microproduct_name"], 
    microproduct_content=final_content_for_model,
    design_template_id=updated_project["design_template_id"], 
    created_at=updated_project["created_at"]
)
```

## Key Changes Made

### Files Modified
- `custom_extensions/backend/main.py` - Updated `update_project_folder` function

### Functions Enhanced
1. **Section Total Calculation**: Now properly sums tier-adjusted lesson hours
2. **Content Rounding**: Ensures all hours are integers using `round_hours_in_content`
3. **Pydantic Parsing**: Properly parses content based on component type

## Testing Results

The fix was tested with various scenarios:

### ✅ **Tier Adjustments**
- **Starter Tier**: 1:120 ratio (completion:creation)
- **Medium Tier**: 1:200 ratio (default)
- **Advanced Tier**: 1:320 ratio  
- **Professional Tier**: 1:450 ratio

### ✅ **Data Integrity**
- All hours are properly rounded to integers
- Section totals are calculated by summing lesson hours
- Pydantic model compatibility is maintained

### ✅ **Error Handling**
- Graceful handling of content parsing errors
- Proper logging for debugging
- Fallback to default component type

## Impact

This fix resolves the 500 Internal Server Error when moving products between folders and ensures that:

1. **Module totals are correctly calculated** by summing tier-adjusted lesson hours
2. **Data types are consistent** with Pydantic model expectations
3. **Folder tier changes properly update** all projects in that folder
4. **The system maintains data integrity** during folder operations

The fix is backward compatible and doesn't affect existing functionality. 