# Products-as-Context Implementation - Complete

## Overview
This feature allows users to select previously created products (course outlines, presentations, audits, etc.) as context when creating new products, similar to how they can select files from SmartDrive or connectors.

## Implementation Summary

### 1. Database Migration
**File: `custom_extensions/backend/main.py`** (lines ~6093-6096)

Added a new column to the `projects` table to store the Onyx document ID of each product's JSON representation:

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS product_json_onyx_id TEXT;
CREATE INDEX IF NOT EXISTS idx_projects_product_json_onyx_id ON projects(product_json_onyx_id);
```

This migration runs automatically on backend startup and is idempotent (safe to run multiple times).

### 2. Backend Endpoint
**File: `custom_extensions/backend/main.py`** (lines ~15091-15171)

Created a new endpoint to ensure a product has its JSON uploaded to Onyx:

```python
@app.post("/api/custom-projects-backend/products/{project_id}/ensure-json")
async def ensure_product_json(project_id: int, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
```

**Features:**
- Checks if product already has an Onyx ID (returns immediately if yes)
- Verifies user access (owner or workspace member)
- Serializes product's `microproduct_content` to JSON
- Uploads to Onyx via `/user/file/upload` endpoint
- Stores the returned Onyx document ID in `product_json_onyx_id`
- Comprehensive logging at every step

### 3. Upload Helper
**File: `custom_extensions/backend/app/services/product_json_indexer.py`**

Created a helper function to upload JSON files directly to Onyx:

```python
async def upload_product_json_to_onyx(
    onyx_api_base: str,
    cookies: dict,
    file_name: str,
    json_bytes: bytes,
    folder_id: Optional[int] = None,
) -> str:
```

**Features:**
- Uses user's session cookies for authentication
- Uploads JSON as multipart form data
- Returns Onyx document ID from response
- Comprehensive error handling and logging

### 4. Frontend - Products Selector
**File: `custom_extensions/frontend/src/app/create/from-files/specific/page.tsx`**

Added a new "Products" section to the create-from-files page:

**State Management:**
```typescript
const [products, setProducts] = useState<any[]>([]);
const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
const [loadingProducts, setLoadingProducts] = useState(false);
const [productSearchTerm, setProductSearchTerm] = useState('');
```

**Features:**
- Fetches all user products from `/api/custom-projects-backend/projects`
- Displays products in a grid with checkboxes (reuses `LMSProductCard` component)
- Search functionality to filter products by name or type
- Select all/deselect all functionality

### 5. Frontend - Context Merging Logic
**File: `custom_extensions/frontend/src/app/create/from-files/specific/page.tsx`** (lines ~274-321)

In `handleCreateContent`, products are processed and merged with SmartDrive files:

```typescript
// For each selected product:
// 1. Check if it has product_json_onyx_id
// 2. If not, call ensure-json endpoint to upload and get ID
// 3. Collect all Onyx IDs
const productOnyxIds: string[] = [...];

// Merge with SmartDrive files
const mergedSelectedFiles = [...selectedFiles, ...productOnyxIds];

// Add to URL params
searchParams.set('selectedFiles', mergedSelectedFiles.map(f => encodeURIComponent(f)).join(','));
```

**Key Points:**
- Lazy loading: Only uploads product JSON when needed (first time selected)
- Comprehensive logging at every step for debugging
- Handles three modes:
  1. Connectors + Files/Products
  2. Connectors only
  3. Files/Products only

### 6. API Response Updates
**File: `custom_extensions/backend/main.py`** (lines ~7168-7184)

Updated `ProjectApiResponse` model to include the new field:

```python
class ProjectApiResponse(BaseModel):
    # ... existing fields ...
    product_json_onyx_id: Optional[str] = None
```

Updated the projects listing query to include the new column in SELECT statements.

## Key Technical Detail: Direct Onyx IDs vs SmartDrive Paths

The `map_smartdrive_paths_to_onyx_files` function was updated to handle two types of inputs:

1. **SmartDrive paths** (e.g., `/folder/file.pdf`) - looked up in `smartdrive_imports` table
2. **Direct Onyx file IDs** (e.g., `"9"`) - numeric strings passed through directly

This allows products-as-context to work seamlessly alongside SmartDrive files. The function detects numeric strings using `.isdigit()` and treats them as direct Onyx file IDs, while non-numeric strings are treated as SmartDrive paths that need to be mapped.

## How It Works

### User Flow:
1. User navigates to "Create from Files & Connectors" page
2. User sees three sections: Files (SmartDrive), Connectors, and **Products** (new)
3. User selects one or more products using checkboxes
4. User clicks "Generate" button
5. Frontend checks each selected product:
   - If `product_json_onyx_id` exists → use it
   - If not → call `ensure-json` endpoint → get Onyx ID → use it
6. Frontend merges product Onyx IDs with SmartDrive file IDs
7. Redirects to generate page with `selectedFiles` param containing both
8. Generate page treats product Onyx IDs exactly like SmartDrive file IDs
9. Backend retrieves documents from Onyx and uses them as context for generation

### Technical Flow:
```
User selects product → Frontend checks product_json_onyx_id
                          ↓ (if missing)
                    POST /ensure-json
                          ↓
              Backend serializes product JSON
                          ↓
              Upload to Onyx /user/file/upload
                          ↓
              Store Onyx ID in database
                          ↓
              Return Onyx ID to frontend
                          ↓
          Merge with selectedFiles → Generate page
```

## Logging & Debugging

All components have comprehensive logging with clear prefixes:

- **Frontend**: `[CreateFromSpecificFiles]` - logs selection, API calls, URL construction
- **Backend Endpoint**: `[ensure_product_json]` - logs access check, upload process, persistence
- **Upload Helper**: `[upload_product_json_to_onyx]` - logs HTTP requests/responses

To debug, check:
1. Browser console for frontend logs
2. Backend logs for API processing
3. Look for the prefixes above to trace the flow

## Files Modified

### Backend:
- `custom_extensions/backend/main.py`
  - Added import for upload helper (line ~73)
  - Added DB migration (lines ~6093-6096)
  - Added `product_json_onyx_id` to `ProjectApiResponse` model
  - Updated projects listing queries to include new column
  - Added `ensure_product_json` endpoint (lines ~15091-15175)
  - Updated `map_smartdrive_paths_to_onyx_files` to handle direct Onyx IDs (lines ~15179-15253)

### Frontend:
- `custom_extensions/frontend/src/app/create/from-files/specific/page.tsx`
  - Added products state management
  - Added `loadProducts` function
  - Added Products section UI with search and cards
  - Updated `handleCreateContent` to process and merge product Onyx IDs
  - Added comprehensive logging throughout

### New Files:
- `custom_extensions/backend/app/services/product_json_indexer.py`
  - Upload helper for product JSON to Onyx

## Testing

To test the feature:

1. **Restart backend** to run the DB migration
2. Navigate to `/custom-projects-ui/create/from-files/specific`
3. You should see three sections: Files, Connectors, and Products
4. Select one or more products
5. Click "Generate"
6. Check browser console for logs showing:
   - Products being processed
   - ensure-json API calls (if needed)
   - Onyx IDs being collected
   - Final URL with merged selectedFiles
7. Generate page should receive the product Onyx IDs and use them as context

## Benefits

1. **Reusability**: Users can build upon their previous work
2. **Context Richness**: Products contain structured, high-quality content
3. **Consistency**: Uses same mechanism as SmartDrive files
4. **Performance**: Lazy loading - only uploads JSON when first selected
5. **Debugging**: Comprehensive logging makes troubleshooting easy

## Future Enhancements

Possible improvements:
- Add product type filtering (e.g., only show course outlines)
- Add preview of product content before selection
- Batch upload for multiple products
- Cache product Onyx IDs in frontend to avoid repeated API calls
- Add visual indicator showing which products already have Onyx IDs

