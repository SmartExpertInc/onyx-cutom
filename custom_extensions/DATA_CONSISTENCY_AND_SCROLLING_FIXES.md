# Data Consistency and Scrolling Fixes Summary

## Overview
This document summarizes the fixes implemented to resolve data consistency issues between PDF and preview, add scrolling functionality to the PDF preview, and implement date selection features.

## Issues Addressed

### 1. Data Consistency in "Block 1. Course Overview" Table

**Problem**: The data displayed in the "Block 1. Course Overview" table in the frontend preview did not match the data in the PDF. This was due to different data processing logic between frontend and backend.

**Root Cause**: The backend PDF template uses a hierarchical structure with `folders` and `folder_projects`, where each folder contains multiple projects. The frontend was only processing individual projects, not the hierarchical structure.

**Solution**: Updated the `processBlock1CourseOverview` function in `dataProcessing.ts` to match the backend PDF template logic exactly:

- **Hierarchical Processing**: Now processes folders and their projects hierarchically, just like the backend
- **Folder Structure**: Groups projects by `folder_id` and creates folder entries with aggregated totals
- **Individual Projects**: Shows individual projects under their respective folders with proper indentation
- **Unassigned Projects**: Handles projects without folders separately
- **Same Calculations**: Uses the same production time formula (`total_hours * 300`) as the backend

**Files Modified**:
- `onyx-cutom/custom_extensions/frontend/src/utils/dataProcessing.ts`

### 2. PDF Preview Scrolling

**Problem**: The PDF preview page did not allow scrolling, preventing users from viewing content that extended beyond the screen.

**Solution**: Modified the main content container in the PDF preview page to enable vertical scrolling.

**Files Modified**:
- `onyx-cutom/custom_extensions/frontend/src/app/projects/view/[projectId]/pdf-preview/page.tsx`

**Changes**:
```diff
- <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
+ <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto max-h-[calc(100vh-200px)]">
```

### 3. Date Selection Feature

**Problem**: Users requested the ability to select a date or set today's date by default for PDF generation.

**Solution**: Added date selection functionality to both the PDF preview page and the PDF download modal.

**Files Modified**:
- `onyx-cutom/custom_extensions/frontend/src/app/projects/view/[projectId]/pdf-preview/page.tsx`
- `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`

**Changes**:
1. **PDF Preview Page**: Added date picker in the header with default value of today's date
2. **ClientNameModal**: Added date selection field to the PDF customization modal
3. **Backend Integration**: Added `selected_date` parameter to PDF download requests

## Technical Details

### Backend PDF Template Structure
The backend PDF template (`modern_projects_list_pdf_template.html`) processes data hierarchically:

```html
{% if folders %}
    {% for folder in folders %}
        <!-- Folder row with aggregated totals -->
        <tr class="table-row">
            <td class="course-name">{{ folder.name }}</td>
            <td>{{ folder.projects|length }}</td>
            <td>{{ folder.total_lessons }}</td>
            <td>{{ folder.total_hours }}</td>
            <td>{{ (folder.total_hours * 300) }}</td>
        </tr>
        
        {% if folder.projects %}
            {% for project in folder.projects %}
                <!-- Individual project rows -->
                <tr class="table-row">
                    <td class="course-name" style="padding-left: 20px;">{{ project.project_name }}</td>
                    <td>1</td>
                    <td>{{ project.total_lessons }}</td>
                    <td>{{ project.total_hours }}</td>
                    <td>{{ (project.total_hours * 300) }}</td>
                </tr>
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}

{% if unassigned_projects %}
    {% for project in unassigned_projects %}
        <!-- Unassigned project rows -->
    {% endfor %}
{% endif %}
```

### Frontend Data Processing
The updated `processBlock1CourseOverview` function now mirrors this structure:

```typescript
export function processBlock1CourseOverview(projects: any[]): any {
  // Group projects by folder_id to match backend logic
  const folderProjects: { [folderId: number]: any[] } = {};
  const unassignedProjects: any[] = [];

  // Separate projects by folder (same logic as backend)
  projects.forEach(project => {
    if (project.folder_id) {
      if (!folderProjects[project.folder_id]) {
        folderProjects[project.folder_id] = [];
      }
      folderProjects[project.folder_id].push(project);
    } else {
      unassignedProjects.push(project);
    }
  });

  // Create folder entries with aggregated totals
  const folders: any[] = [];
  Object.keys(folderProjects).forEach(folderId => {
    const folderProjectsList = folderProjects[parseInt(folderId)];
    const totalLessons = folderProjectsList.reduce((sum, project) => sum + (project.total_lessons || 0), 0);
    const totalHours = folderProjectsList.reduce((sum, project) => sum + (project.total_hours || 0), 0);
    
    folders.push({
      id: parseInt(folderId),
      name: `Folder ${folderId}`,
      projects: folderProjectsList,
      total_lessons: totalLessons,
      total_hours: totalHours
    });
  });

  // Process data exactly like the backend PDF template
  const result: any[] = [];
  
  // Process folders first (like backend template)
  folders.forEach(folder => {
    // Add folder row
    result.push({
      name: folder.name,
      modules: folder.projects.length,
      lessons: folder.total_lessons,
      learningDuration: folder.total_hours,
      productionTime: folder.total_hours * 300, // Same formula as backend
      isFolder: true
    });

    // Add individual projects under folder (like backend template)
    folder.projects.forEach((project: any) => {
      result.push({
        name: `  ${project.title || project.project_name || 'Untitled'}`, // Indent like backend
        modules: 1,
        lessons: project.total_lessons || 0,
        learningDuration: project.total_hours || 0,
        productionTime: (project.total_hours || 0) * 300, // Same formula as backend
        isProject: true
      });
    });
  });

  // Process unassigned projects (like backend template)
  unassignedProjects.forEach(project => {
    result.push({
      name: project.title || project.project_name || 'Untitled',
      modules: 1,
      lessons: project.total_lessons || 0,
      learningDuration: project.total_hours || 0,
      productionTime: (project.total_hours || 0) * 300, // Same formula as backend
      isUnassigned: true
    });
  });

  // Apply rounding like backend
  return result.map(item => ({
    ...item,
    learningDuration: Math.round(item.learningDuration),
    productionTime: Math.round(item.productionTime)
  }));
}
```

## Date Selection Implementation

### PDF Preview Page
Added date picker in the header with default value of today's date:

```typescript
const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

// In the header
<div className="flex items-center gap-2">
  <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
    Date:
  </label>
  <input
    id="date-select"
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>
```

### ClientNameModal
Added date selection field to the PDF customization modal:

```typescript
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

// In the form
<div>
  <label htmlFor="selected-date" className="block text-sm font-semibold text-gray-700 mb-2">
    {t('interface.selectDate', 'Select Date (optional)')}
  </label>
  <input
    id="selected-date"
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 bg-white hover:border-gray-300"
  />
</div>
```

### Backend Integration
Added `selected_date` parameter to PDF download requests:

```typescript
// Add selected date if provided (default to today)
const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
queryParams.append('selected_date', dateToUse);
```

## Testing Recommendations

1. **Data Consistency**: Compare the "Block 1. Course Overview" table in both PDF and preview to ensure they show identical data
2. **Scrolling**: Verify that the PDF preview page allows vertical scrolling when content exceeds the viewport height
3. **Date Selection**: Test date selection in both the PDF preview page and the PDF download modal
4. **Default Date**: Confirm that today's date is set as default in both locations

## Expected Results

- **Data Consistency**: The "Block 1. Course Overview" table should now show identical data in both PDF and preview
- **Scrolling**: Users should be able to scroll through the entire PDF preview content
- **Date Selection**: Users can select custom dates for PDF generation, with today's date as default
- **Hierarchical Display**: The preview should show folders and their projects hierarchically, matching the PDF structure 