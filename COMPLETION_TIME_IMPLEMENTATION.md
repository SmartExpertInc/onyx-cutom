# Completion Time Column Implementation

## Overview
Added an "Est. completion time" column to the projects list view, following the same logic as the existing "Est. creation time" column.

## Changes Made

### Backend Changes (`custom_extensions/backend/main.py`)

1. **Updated API Endpoint**: Modified `/api/custom/projects/{project_id}/lesson-data` to include completion time data
   - Added parsing of `completionTime` field from lesson data
   - Handles time format like "5m", "6m", "7m", "8m" and converts to total minutes
   - Returns `completionTime` in the API response alongside `lessonCount` and `totalHours`

2. **Data Processing**: 
   - Parses completion time strings from lesson data
   - Sums up completion times across all lessons in a training plan
   - Handles error cases gracefully

### Frontend Changes (`custom_extensions/frontend/src/components/ProjectsTable.tsx`)

1. **Updated Data Models**:
   - Extended lesson data cache to include `completionTime`
   - Updated `getLessonData` function to fetch completion time from API
   - Added `formatCompletionTime` helper function to format minutes into readable format (e.g., "45m", "1h 30m")

2. **UI Updates**:
   - Added "Est. completion time" column header to table
   - Added completion time column to all project rows (folder projects, unassigned projects, trash projects)
   - Added completion time calculation for folder rows (sum of all projects in folder)
   - Updated colspan for loading rows to account for new column

3. **Formatting Logic**:
   - Minutes < 60: displays as "Xm" (e.g., "45m")
   - Minutes >= 60: displays as "Xh Ym" (e.g., "1h 30m")
   - Handles edge cases like 0, empty strings, and error states

## Features

### For Individual Projects
- Shows estimated completion time for each project
- Only applies to Training Plan projects (same logic as lesson count and hours)
- Displays formatted time (e.g., "45m", "1h 30m")

### For Folders
- Shows total completion time for all projects in the folder
- Calculates sum of completion times from all projects in the folder
- Updates dynamically when projects are added/removed from folders

### Data Source
- Completion time data comes from the `completionTime` field in lesson data
- Stored in the `microproduct_content` JSONB field in the database
- Format: string like "5m", "6m", "7m", "8m" for each lesson

## Testing

Created `test_completion_time.py` to verify the API endpoint returns completion time data correctly.

## Usage

The completion time column will automatically appear in the list view for all projects that have completion time data. The column follows the same logic as the existing "Est. creation time" column:

- Shows "-" for projects without completion time data
- Shows formatted time for projects with completion time data
- Updates in real-time when lesson data is loaded
- Works with folder organization and trash functionality 