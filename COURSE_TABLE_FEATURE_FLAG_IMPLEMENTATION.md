# Course Table Feature Flag Implementation Summary

## Overview

Implemented a new feature flag called "Course Table" that controls which view page is used for course outlines (Training Plan products). When the flag is **OFF**, course outlines use the new view (`/projects/view-new/*`). When the flag is **ON**, course outlines use the old view (`/projects/view/*`).

## Backend Changes

### Feature Definition Added
- Added `course_table` feature to initial feature definitions in `custom_extensions/backend/main.py`
- Feature details:
  - **Name**: `course_table`
  - **Display Name**: "Course Table"
  - **Description**: "Use new course table view for course outlines"
  - **Category**: "Navigation"

### User Type Assignment
- Added `course_table` feature to the **Enterprise** user type
- Enterprise users will have this feature enabled by default

## Frontend Changes

### 1. Project Cards (`components/ui/project-card.tsx`)
- Added `useFeaturePermission('course_table')` hook
- Created `getViewUrl()` function that checks the flag for Training Plan products
- **Logic**: 
  - If `designMicroproductType === "Training Plan"` and flag is ON → `/projects/view/{id}`
  - If `designMicroproductType === "Training Plan"` and flag is OFF → `/projects/view-new/{id}`
  - All other product types use their existing routing

### 2. Projects Table (`components/ProjectsTable.tsx`)
- Added the same feature flag logic for both:
  - Main projects table
  - Folder projects (nested projects)
- Uses the same `getViewUrl()` function approach

### 3. Course Outline Creation (`app/create/course-outline/CourseOutlineClient.tsx`)
- Added feature flag check for post-creation navigation
- **Logic**: After creating a course outline, navigates to:
  - Flag ON → `/projects/view/{id}`
  - Flag OFF → `/projects/view-new/{id}`

### 4. Lesson Opening Modal (`components/OpenContentModal.tsx`)
- Added feature flag check for opening lessons from course outlines
- **Logic**: When opening lessons from course outlines:
  - Flag ON → `/custom-projects-ui/projects/view/{id}`
  - Flag OFF → `/custom-projects-ui/projects/view-new/{id}`

## Behavior Summary

| Feature Flag State | Course Outline View | After Creation | From Lesson Modal |
|-------------------|-------------------|----------------|------------------|
| **OFF** (Default) | `/projects/view-new/*` | `/projects/view-new/*` | `/custom-projects-ui/projects/view-new/*` |
| **ON** (Enterprise) | `/projects/view/*` | `/projects/view/*` | `/custom-projects-ui/projects/view/*` |

## Product Type Identification

Course outlines are identified by:
```typescript
project.designMicroproductType === "Training Plan"
```

## Other Product Types Unaffected

- Video Lesson Presentations: Always use `/projects-2/view/*`
- All other products: Always use `/projects/view/*`
- Only Training Plan (course outlines) routing is controlled by this flag

## Admin Configuration

1. Navigate to Admin → Features
2. Find "Course Table" feature
3. Toggle for individual users or use bulk operations
4. Enterprise users have it enabled by default

## Testing

To test the implementation:
1. Create a course outline
2. Toggle the "Course Table" feature for your user
3. Verify navigation behavior changes:
   - From products page clicks
   - After course outline creation
   - From lesson opening modal
4. Confirm other product types are unaffected 