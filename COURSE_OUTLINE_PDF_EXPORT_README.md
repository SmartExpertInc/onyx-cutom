# Course Outline PDF Export Implementation

This implementation adds PDF download functionality to the course outline page, allowing users to download the page content as a PDF file.

## Features Added

### 1. HTML Template (`custom_extensions/backend/templates/course_outline_pdf_template.html`)
- Responsive HTML template for course outline PDF generation
- Matches the visual design of the web page
- Print-optimized styles for PDF generation
- Supports all course outline content including modules, lessons, and summary metrics

### 2. Backend API Endpoint (`custom_extensions/backend/main.py`)
- **Endpoint**: `GET /api/custom/pdf/course-outline/{project_id}`
- **Function**: `download_course_outline_pdf()`
- Fetches project data from database
- Generates PDF using the HTML template
- Returns PDF file for download

### 3. Frontend Integration (`custom_extensions/frontend/src/app/projects/view-new/[productId]/page.tsx`)
- Updated "Download PDF" button to call the new API endpoint
- Opens PDF in new tab for download
- Maintains existing UI/UX design

### 4. Python Script (`generate_course_outline_html.py`)
- Standalone script to generate HTML files from course outline projects
- Can be used for batch processing or standalone HTML generation
- Command-line interface for easy usage

## Usage

### Web Interface
1. Navigate to any course outline page (`/projects/view-new/{productId}`)
2. Click the "Download PDF" button
3. PDF will be generated and downloaded automatically

### Command Line (Python Script)
```bash
# Generate HTML file for project ID 123
python generate_course_outline_html.py 123

# Generate HTML file with custom output name
python generate_course_outline_html.py 123 my_course_outline.html

# Use specific user ID
python generate_course_outline_html.py 123 --user-id "user-123"
```

## Technical Details

### Database Requirements
- Requires access to the `projects` table
- Needs `microproduct_content` field containing course outline data
- Uses `onyx_user_id` for authentication

### Dependencies
- FastAPI backend with PDF generation service
- Jinja2 templating engine
- AsyncPG for database access
- Pyppeteer for PDF generation (via existing PDF service)

### File Structure
```
custom_extensions/
├── backend/
│   ├── templates/
│   │   └── course_outline_pdf_template.html
│   └── main.py (updated with new endpoint)
├── frontend/
│   └── src/app/projects/view-new/[productId]/
│       └── page.tsx (updated download button)
└── generate_course_outline_html.py
```

## Error Handling

- **404**: Project not found
- **400**: No course outline data found
- **500**: PDF generation failed
- Graceful fallbacks for missing data

## Styling

The PDF template includes:
- Print-optimized CSS styles
- Responsive design for different page sizes
- Consistent branding with the web interface
- Proper page breaks and typography

## Future Enhancements

- Add progress indicators for large course outlines
- Support for custom themes/styling
- Batch PDF generation for multiple projects
- Email delivery of generated PDFs
