# Analytics Endpoints Implementation

## Overview
This document summarizes the implementation of analytics endpoints for the custom projects system, replacing mock data in PDF generation with real analytics data.

## New Endpoints

### 1. Product Distribution Analytics
**Endpoint:** `GET /api/custom/projects/analytics/product-distribution`

**Purpose:** Provides distribution of product types across all projects for pie chart visualization.

**Response Model:**
```typescript
interface ProductsDistributionResponse {
  total_products: number;
  distribution: ProductTypeDistribution[];
}

interface ProductTypeDistribution {
  type: ProductType;
  count: number;
  percentage: number;
  color: string;
}

enum ProductType {
  ONE_PAGER = "one_pager",
  PRESENTATION = "presentation", 
  QUIZ = "quiz",
  VIDEO_LESSON = "video_lesson"
}
```

**Color Mapping:**
- One-pager: `#9333ea` (Purple)
- Presentation: `#2563eb` (Blue)
- Quiz: `#16a34a` (Green)
- Video Lesson: `#ea580c` (Orange)

### 2. Quality Tiers Distribution Analytics
**Endpoint:** `GET /api/custom/projects/analytics/quality-distribution`

**Purpose:** Provides distribution of lesson quality tiers for pie chart visualization.

**Response Model:**
```typescript
interface QualityTiersDistributionResponse {
  total_lessons: number;
  distribution: QualityTierDistribution[];
}

interface QualityTierDistribution {
  tier: QualityTier;
  count: number;
  percentage: number;
  color: string;
}

enum QualityTier {
  BASIC = "basic",
  INTERACTIVE = "interactive", 
  ADVANCED = "advanced",
  IMMERSIVE = "immersive"
}
```

**Color Mapping:**
- Basic: `#059669` (Green)
- Interactive: `#ea580c` (Orange)
- Advanced: `#7c3aed` (Purple)
- Immersive: `#2563eb` (Blue)

## Implementation Details

### Database Queries

#### Product Distribution Query
```sql
SELECT dt.component_name, COUNT(*) as count
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
WHERE p.onyx_user_id = $1
GROUP BY dt.component_name 
ORDER BY count DESC
```

#### Quality Distribution Query
```sql
WITH lesson_quality_tiers AS (
    SELECT 
        COALESCE(
            lesson->>'quality_tier',
            section->>'quality_tier', 
            p.quality_tier,
            pf.quality_tier,
            'interactive'
        ) as effective_quality_tier
    FROM projects p
    LEFT JOIN project_folders pf ON p.folder_id = pf.id
    CROSS JOIN LATERAL jsonb_array_elements(p.microproduct_content->'sections') AS section
    CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
    WHERE p.onyx_user_id = $1
    AND p.microproduct_content IS NOT NULL
    AND p.microproduct_content->>'sections' IS NOT NULL
)
SELECT 
    LOWER(effective_quality_tier) as quality_tier,
    COUNT(*) as count
FROM lesson_quality_tiers
GROUP BY LOWER(effective_quality_tier)
ORDER BY count DESC
```

### Component to Product Type Mapping
```python
COMPONENT_TO_PRODUCT_TYPE = {
    COMPONENT_NAME_TEXT_PRESENTATION: ProductType.ONE_PAGER,
    COMPONENT_NAME_SLIDE_DECK: ProductType.PRESENTATION,
    COMPONENT_NAME_QUIZ: ProductType.QUIZ,
    COMPONENT_NAME_VIDEO_LESSON: ProductType.VIDEO_LESSON,
    COMPONENT_NAME_VIDEO_LESSON_PRESENTATION: ProductType.VIDEO_LESSON,
    COMPONENT_NAME_PDF_LESSON: ProductType.ONE_PAGER,  # PDF lessons are considered one-pagers
}
```

### PDF Template Integration

The PDF generation endpoint (`/api/custom/pdf/projects-list`) has been updated to:

1. **Fetch real analytics data** using the same queries as the analytics endpoints
2. **Process the data** to match the template's expected format
3. **Pass the data** to the template as `product_distribution` and `quality_distribution` variables
4. **Handle errors gracefully** with fallback to zero values if analytics data cannot be fetched

### Template Updates

The `projects_list_pdf_template.html` has been updated to:

1. **Use real data** instead of hardcoded mock values
2. **Access analytics data** through template variables:
   - `product_distribution.total_products`
   - `product_distribution.one_pager_count`
   - `quality_distribution.total_lessons`
   - `quality_distribution.basic_count`
   - etc.
3. **Provide fallbacks** for cases where analytics data is not available

## Features

### Query Parameters
Both endpoints support:
- `folder_id` (optional): Filter analytics to a specific folder
- Authentication via `onyx_user_id` dependency

### Error Handling
- Graceful fallback to zero values if database queries fail
- Proper logging of errors
- HTTP 500 responses for unexpected errors

### Data Consistency
- Consistent color schemes across endpoints and PDF generation
- Proper mapping of component names to product types
- Quality tier normalization (medium → interactive, premium → advanced)

## Testing

A test script (`test_analytics_endpoints.py`) has been created to verify:
- Database connectivity
- Query execution
- Data retrieval

## Usage Examples

### Fetch Product Distribution
```bash
curl -X GET "http://localhost:8000/api/custom/projects/analytics/product-distribution" \
  -H "Authorization: Bearer <token>"
```

### Fetch Quality Distribution
```bash
curl -X GET "http://localhost:8000/api/custom/projects/analytics/quality-distribution" \
  -H "Authorization: Bearer <token>"
```

### Generate PDF with Real Analytics
```bash
curl -X GET "http://localhost:8000/api/custom/pdf/projects-list" \
  -H "Authorization: Bearer <token>" \
  --output projects_list.pdf
```

## Benefits

1. **Real-time Data**: PDFs now show actual project and lesson statistics
2. **Consistent Analytics**: Same data source for both API endpoints and PDF generation
3. **Scalable**: Analytics are calculated on-demand from the database
4. **Maintainable**: Centralized analytics logic with proper error handling
5. **Flexible**: Support for folder-specific filtering

## Future Enhancements

1. **Caching**: Add Redis caching for frequently accessed analytics data
2. **Time-based Analytics**: Add date range filtering for historical analysis
3. **Additional Metrics**: Include creation time, completion time distributions
4. **Export Options**: Add CSV/JSON export for analytics data 