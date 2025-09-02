# 🎯 Source Context Tracking Implementation

## ✅ **Feature Overview**

This implementation adds comprehensive tracking of which files/connectors/sources were used to create each product (course outlines, presentations, quizzes, etc.) in the database.

## 🗄️ **Database Schema Changes**

### **New Columns Added to `projects` Table**

```sql
-- Added in startup migration
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_context_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_context_data JSONB;
CREATE INDEX IF NOT EXISTS idx_projects_source_context_type ON projects(source_context_type);
```

### **Column Definitions**

| Column | Type | Purpose | Example Values |
|--------|------|---------|----------------|
| `source_context_type` | `TEXT` | Type of source used | `'connectors'`, `'files'`, `'knowledge_base'`, `'text'`, `'prompt'` |
| `source_context_data` | `JSONB` | Detailed source information | `{'connector_ids': ['3'], 'connector_sources': ['notion']}` |

## 🔧 **Implementation Details**

### **1. Updated Models**

#### **ProjectCreateRequest Model**
```python
class ProjectCreateRequest(BaseModel):
    # ... existing fields ...
    # Source context tracking
    source_context_type: Optional[str] = None  # 'files', 'connectors', 'knowledge_base', 'text', 'prompt'
    source_context_data: Optional[dict] = None  # JSON data about the source
```

### **2. Helper Function**

#### **`build_source_context(payload)` Function**
```python
def build_source_context(payload) -> tuple[Optional[str], Optional[dict]]:
    """
    Build source context type and data from a finalize payload.
    Returns (context_type, context_data) tuple.
    """
```

**Detects and extracts:**
- **Connectors**: `fromConnectors=True` → `connector_ids`, `connector_sources`
- **Knowledge Base**: `fromKnowledgeBase=True` → `search_query`
- **Files**: `fromFiles=True` → `folder_ids`, `file_ids`
- **Text**: `fromText=True` → `text_mode`, `user_text` (full content), `user_text_length`
- **Prompt**: Default fallback → `prompt`, `prompt_length`

### **3. Updated Database Operations**

#### **Updated `add_project_to_custom_db` Function**
```sql
INSERT INTO projects (
    onyx_user_id, project_name, product_type, microproduct_type,
    microproduct_name, microproduct_content, design_template_id, 
    source_chat_session_id, is_standalone, created_at, folder_id,
    source_context_type, source_context_data  -- NEW FIELDS
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11, $12)
```

### **4. Updated Finalize Endpoints**

All finalize endpoints now call `build_source_context(payload)` and pass the result to `ProjectCreateRequest`:

- ✅ **Course Outline Finalize** (`wizard_outline_finalize`)
- ✅ **Lesson Presentation Finalize** (`wizard_lesson_finalize`)  
- ✅ **Quiz Finalize** (`quiz_finalize`)
- ✅ **Text Presentation Finalize** (`text_presentation_finalize`)

## 📊 **Source Context Types & Data Structures**

### **1. Connectors (`'connectors'`)**
```json
{
  "connector_ids": ["3", "5"],
  "connector_sources": ["notion", "google_drive"]
}
```

### **2. Knowledge Base (`'knowledge_base'`)**
```json
{
  "search_query": "machine learning basics"
}
```

### **3. Files (`'files'`)**
```json
{
  "folder_ids": ["folder_123", "folder_456"],
  "file_ids": ["file_789", "file_101"]
}
```

### **4. Text (`'text'`)**
```json
{
  "text_mode": "context",
  "user_text": "This is the full text content that the user provided for content creation...",
  "user_text_length": 1500
}
```

### **5. Prompt (`'prompt'`)**
```json
{
  "prompt": "Create a course about Python programming",
  "prompt_length": 45
}
```

## 🔍 **Analytics & Queries**

### **Source Usage Analytics**
```sql
-- Count projects by source type
SELECT source_context_type, COUNT(*) as project_count
FROM projects 
WHERE source_context_type IS NOT NULL
GROUP BY source_context_type
ORDER BY project_count DESC;
```

### **Connector Usage Analytics**
```sql
-- Most used connectors
SELECT 
    jsonb_array_elements_text(source_context_data->'connector_sources') as connector_source,
    COUNT(*) as usage_count
FROM projects 
WHERE source_context_type = 'connectors'
GROUP BY connector_source
ORDER BY usage_count DESC;
```

### **Product Type by Source Analytics**
```sql
-- Product types by source
SELECT 
    product_type,
    source_context_type,
    COUNT(*) as count
FROM projects 
WHERE source_context_type IS NOT NULL
GROUP BY product_type, source_context_type
ORDER BY count DESC;
```

## 🧪 **Testing**

### **Test Script: `test_source_context_tracking.py`**
- ✅ Verifies database schema changes
- ✅ Tests INSERT operations with source context
- ✅ Validates JSONB data storage
- ✅ Checks existing project analytics

### **Manual Testing**
1. **Create Course Outline from Connectors**:
   ```
   /create/from-files/specific → select Notion → Course Outline → Generate → Finalize
   ```
   **Expected DB**: `source_context_type='connectors'`, `source_context_data={'connector_ids': ['3'], 'connector_sources': ['notion']}`

2. **Create Quiz from Knowledge Base**:
   ```
   /create/generate → Knowledge Base → Quiz → Generate → Finalize  
   ```
   **Expected DB**: `source_context_type='knowledge_base'`, `source_context_data={'search_query': 'quiz topic'}`

## 📈 **Benefits**

### **1. User Analytics**
- Track which sources users prefer
- Identify most valuable connectors
- Understand content creation patterns

### **2. Product Insights**
- See which sources produce best content
- Optimize connector recommendations
- Improve source-specific features

### **3. Debugging & Support**
- Quickly identify source of any project
- Reproduce issues with specific sources
- Validate connector functionality

### **4. Compliance & Auditing**
- Track data sources for compliance
- Audit connector usage
- Maintain content lineage

## 🚀 **Usage Examples**

### **Query: Find all projects created from Notion**
```sql
SELECT project_name, created_at, source_context_data
FROM projects 
WHERE source_context_type = 'connectors'
  AND source_context_data->'connector_sources' @> '["notion"]';
```

### **Query: Most popular source types this month**
```sql
SELECT 
    source_context_type,
    COUNT(*) as projects_created
FROM projects 
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND source_context_type IS NOT NULL
GROUP BY source_context_type
ORDER BY projects_created DESC;
```

### **Query: Users creating most from connectors**
```sql
SELECT 
    onyx_user_id,
    COUNT(*) as connector_projects
FROM projects 
WHERE source_context_type = 'connectors'
GROUP BY onyx_user_id
ORDER BY connector_projects DESC
LIMIT 10;
```

## 💾 **Data Storage Considerations**

### **Text Content Storage**
- **Full Text Preservation**: When users create content from text (`fromText=True`), the complete original text is stored in `source_context_data->user_text`
- **Use Cases**: 
  - Audit trail for content creation
  - Reproduce exact generation conditions
  - Analyze what text inputs produce best results
  - Support user queries about source material

### **Storage Efficiency**
- **JSONB Format**: Uses PostgreSQL's efficient JSONB storage
- **Indexed Access**: `source_context_type` is indexed for fast queries
- **Flexible Schema**: JSON structure allows different data per source type

### **Example Text Storage Query**
```sql
-- Find all projects created from specific text content
SELECT project_name, created_at, source_context_data->'user_text' as original_text
FROM projects 
WHERE source_context_type = 'text'
  AND source_context_data->>'user_text' ILIKE '%machine learning%';
```

## 🎯 **Summary**

### **✅ Complete Implementation**
- **Database Schema**: Added source context columns with proper indexing
- **Models**: Updated `ProjectCreateRequest` with source context fields
- **Helper Function**: `build_source_context()` extracts context from any payload
- **Database Operations**: Updated `add_project_to_custom_db()` to store context
- **Finalize Endpoints**: All endpoints now track source context

### **🎉 Ready for Production**
Every product created through the platform now automatically tracks:
- **What source was used** (connectors, files, knowledge base, etc.)
- **Specific source details** (which connectors, file IDs, search queries, etc.)
- **When it was created** (existing timestamp)
- **By which user** (existing user tracking)

This provides comprehensive analytics and auditing capabilities for all content creation! 🎯 