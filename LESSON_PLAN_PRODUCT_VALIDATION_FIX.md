# Lesson Plan Product Validation Fix

## Problem Analysis

The lesson plan generation was failing with this error:
```
ERROR:main:Failed to parse OpenAI response: Product video-lesson not in recommended products list
```

### Root Cause:
The validation logic was performing strict string matching between:
- **AI-generated product names** in `recommendedProductTypes` (e.g., `"video-lesson"`)  
- **Frontend-sent product names** in `payload.recommendedProducts` (e.g., `"videoLesson"`)

This caused validation failures due to naming convention mismatches between frontend camelCase and backend kebab-case.

## Solution Implementation

### 1. **Enhanced Validation with Product Name Mapping**

**Location**: `custom_extensions/backend/main.py` (lines ~17093-17131)

```python
# Create a mapping of common product name variations
product_name_mapping = {
    'video-lesson': ['video-lesson', 'videoLesson', 'video_lesson', 'video lesson'],
    'presentation': ['presentation', 'presentations'],
    'quiz': ['quiz', 'quizzes'],
    'one-pager': ['one-pager', 'onePager', 'one_pager', 'one pager']
}

# Create reverse mapping for validation
normalized_payload_products = set()
for product in payload.recommendedProducts:
    # Find the canonical name for this product
    canonical_name = None
    for canonical, variations in product_name_mapping.items():
        if product.lower() in [v.lower() for v in variations]:
            canonical_name = canonical
            break
    if canonical_name:
        normalized_payload_products.add(canonical_name)
    else:
        normalized_payload_products.add(product.lower())

# Validate recommendedProductTypes only contains products from the request
for product_name in lesson_plan_data["recommendedProductTypes"]:
    # Normalize the AI-generated product name
    canonical_name = None
    for canonical, variations in product_name_mapping.items():
        if product_name.lower() in [v.lower() for v in variations]:
            canonical_name = canonical
            break
    
    if canonical_name:
        if canonical_name not in normalized_payload_products:
            logger.warning(f"AI generated product '{product_name}' (canonical: '{canonical_name}') not in normalized recommended products: {normalized_payload_products}")
            raise ValueError(f"Product {product_name} not in recommended products list")
    else:
        if product_name.lower() not in normalized_payload_products:
            logger.warning(f"AI generated unknown product '{product_name}' not in recommended products: {payload.recommendedProducts}")
            raise ValueError(f"Product {product_name} not in recommended products list")
```

### 2. **Enhanced Debug Logging**

```python
# Log the recommended products for debugging
logger.info(f"Payload recommended products: {payload.recommendedProducts}")
logger.info(f"AI generated product types: {list(lesson_plan_data['recommendedProductTypes'].keys())}")
```

### 3. **Improved AI Prompt Instructions**

**Added explicit instruction in the prompt**:
```python
- CRITICAL: Use these EXACT product names as keys in recommendedProductTypes: {payload.recommendedProducts}
```

## Product Name Mapping

### **Supported Variations**:

| Canonical Name | Accepted Variations |
|----------------|-------------------|
| `video-lesson` | `video-lesson`, `videoLesson`, `video_lesson`, `video lesson` |
| `presentation` | `presentation`, `presentations` |
| `quiz` | `quiz`, `quizzes` |
| `one-pager` | `one-pager`, `onePager`, `one_pager`, `one pager` |

### **Normalization Process**:

1. **Frontend sends**: `["videoLesson", "presentation"]`
2. **System normalizes to**: `{"video-lesson", "presentation"}`
3. **AI generates**: `{"video-lesson": "...", "presentation": "..."}`
4. **Validation**: ✅ **PASSES** - both normalize to same canonical names

## Error Prevention

### **Before Fix**:
```
Frontend sends: ["videoLesson", "presentation"]
AI generates: {"video-lesson": "...", "presentation": "..."}
Validation: ❌ FAILS - "video-lesson" not in ["videoLesson", "presentation"]
```

### **After Fix**:
```
Frontend sends: ["videoLesson", "presentation"] 
→ Normalized to: {"video-lesson", "presentation"}

AI generates: {"video-lesson": "...", "presentation": "..."}
→ Normalized to: {"video-lesson", "presentation"}

Validation: ✅ PASSES - normalized sets match
```

## Enhanced Error Messages

### **Detailed Warning Logs**:
```python
logger.warning(f"AI generated product '{product_name}' (canonical: '{canonical_name}') not in normalized recommended products: {normalized_payload_products}")
```

### **Debug Information**:
```python
logger.info(f"Payload recommended products: {payload.recommendedProducts}")
logger.info(f"AI generated product types: {list(lesson_plan_data['recommendedProductTypes'].keys())}")
```

## Testing Scenarios

### **Scenario 1: Frontend camelCase**
```json
{
  "recommendedProducts": ["videoLesson", "onePager"]
}
```
**AI Response**: `{"video-lesson": "...", "one-pager": "..."}`
**Result**: ✅ **PASSES** - normalizes correctly

### **Scenario 2: Mixed naming**
```json
{
  "recommendedProducts": ["video-lesson", "presentation"]  
}
```
**AI Response**: `{"video-lesson": "...", "presentation": "..."}`
**Result**: ✅ **PASSES** - exact match

### **Scenario 3: Invalid product**
```json
{
  "recommendedProducts": ["videoLesson"]
}
```
**AI Response**: `{"video-lesson": "...", "unknown-product": "..."}`
**Result**: ❌ **FAILS** - "unknown-product" not in recommended list

## Benefits

### **1. Robust Validation**:
- **Handles naming variations** between frontend and backend
- **Case-insensitive matching** for flexibility
- **Maintains strict validation** for security

### **2. Better Debugging**:
- **Detailed logging** of product names from both sources
- **Clear error messages** with context
- **Warning logs** for troubleshooting

### **3. Backward Compatibility**:
- **Supports existing naming conventions** 
- **No breaking changes** to API contracts
- **Graceful handling** of edge cases

## Quality Assurance

### **Input Validation**:
- Comprehensive product name variations supported
- Case-insensitive matching for user flexibility
- Strict validation against unauthorized products

### **Error Handling**:
- Detailed error messages for debugging
- Graceful fallback for unknown product names
- Comprehensive logging for troubleshooting

### **Security**:
- Still prevents unauthorized products from being generated
- Maintains strict validation while allowing naming flexibility
- Clear audit trail through enhanced logging

## Conclusion

The enhanced validation system now:

- **✅ Handles naming convention mismatches** between frontend and backend
- **✅ Provides detailed debugging information** for troubleshooting  
- **✅ Maintains strict security validation** while adding flexibility
- **✅ Supports common product name variations** used across the system
- **✅ Offers clear error messages** for faster problem resolution

This fix resolves the `"Product video-lesson not in recommended products list"` error while maintaining robust validation and improving the overall reliability of the lesson plan generation system. 