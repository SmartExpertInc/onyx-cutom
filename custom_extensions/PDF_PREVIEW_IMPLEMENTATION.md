# PDF Preview and Download Implementation

This document describes the implementation of PDF preview and download functionality in the ContentBuilder AI project.

## Overview

The PDF preview and download feature allows users to:
1. Download a PDF file
2. Simultaneously view a preview of the content that will be in the PDF

## Components

### 1. PdfDownloadButton.tsx (for Lessons)

**Location**: `onyx-cutom/custom_extensions/frontend/src/components/PdfDownloadButton.tsx`

**Purpose**: Handles PDF download and preview for lesson content.

**Features**:
- Downloads PDF with lesson content
- Opens preview in a new window
- Handles pop-up blocker scenarios
- Uses base64 encoded PDF data for download

**Usage**:
```tsx
<PdfDownloadButton 
  dataToDisplay={lessonData} 
  parentProjectName="Course Name" 
  lessonNumber={1} 
/>
```

### 2. PdfLessonDisplay.tsx (Integration)

**Location**: `onyx-cutom/custom_extensions/frontend/src/components/PdfLessonDisplay.tsx`

**Changes**:
- Imports `PdfDownloadButton` component
- Integrates the button into the lesson display interface
- Removes duplicate `Download` icon import (now handled by `PdfDownloadButton`)

### 3. ProjectsTable.tsx (Updated Implementation)

**Location**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`

**Previous Implementation**: 
- Used `window.open()` to create a new window with HTML preview
- Generated HTML content dynamically for project list
- Caused TypeScript errors with `project.status` property

**Current Implementation**:
- **Removed**: All `window.open()` preview functionality
- **Added**: Modal-based preview system
- **Features**:
  - Downloads PDF in background
  - Shows project structure in an in-page modal
  - Modal can be closed with a cross button
  - Displays client name, manager name, and project list
  - Responsive design with scrollable content

**Key Changes**:
1. **State Management**:
   ```tsx
   const [showPreviewModal, setShowPreviewModal] = useState(false);
   const [previewData, setPreviewData] = useState<{
       clientName: string | null;
       managerName: string | null;
       projects: Project[];
   } | null>(null);
   ```

2. **handleClientNameConfirm Function**:
   - Removed `window.open()` and HTML generation code
   - Added modal state management
   - Filters projects based on selection
   - Sets preview data and opens modal

3. **PreviewModal Component**:
   - New modal component for displaying project structure
   - Shows client name, manager name, total projects count
   - Displays project list in a table format
   - Includes close button (cross icon)
   - Responsive design with proper scrolling

## Technical Details

### PDF Download Process

1. **For Lessons** (`PdfDownloadButton.tsx`):
   - Uses base64 encoded PDF data
   - Creates temporary download link
   - Triggers download automatically

2. **For Projects** (`ProjectsTable.tsx`):
   - Uses backend API endpoint
   - Builds query parameters with filters
   - Downloads via temporary anchor element

### Preview Display

1. **For Lessons**: Opens in new browser window
2. **For Projects**: Displays in modal overlay

### Error Handling

- Pop-up blocker detection for lesson previews
- Graceful fallback with user notification
- TypeScript type safety improvements

## Usage Examples

### Lesson PDF Download
```tsx
// In PdfLessonDisplay.tsx
<PdfDownloadButton 
  dataToDisplay={lessonData} 
  parentProjectName={projectName} 
  lessonNumber={lessonNumber} 
/>
```

### Project List PDF Download
```tsx
// In ProjectsTable.tsx - triggered via ClientNameModal
// User fills form and clicks "Download PDF"
// PDF downloads and modal opens with preview
```

## Recent Updates

### Latest Changes (Modal Implementation for ProjectsTable.tsx)

1. **Removed Preview Window**: Eliminated `window.open()` functionality that was causing TypeScript errors
2. **Added Modal System**: Implemented in-page modal for project structure preview
3. **Fixed TypeScript Errors**: Resolved `Property 'status' does not exist on type 'Project'` error
4. **Improved UX**: Better user experience with modal-based preview instead of new window
5. **Maintained Functionality**: PDF download still works simultaneously with preview display

### Benefits of Modal Approach

- **No Pop-up Blockers**: Eliminates issues with browser pop-up blockers
- **Better Integration**: Seamless integration with existing UI
- **Improved Accessibility**: Better keyboard navigation and screen reader support
- **Responsive Design**: Works better on mobile devices
- **Type Safety**: Eliminates TypeScript errors related to missing properties

## Future Enhancements

1. **Print Functionality**: Add print button to modal
2. **Export Options**: Support for different file formats
3. **Customization**: Allow users to customize preview layout
4. **Real-time Updates**: Live preview updates as data changes 