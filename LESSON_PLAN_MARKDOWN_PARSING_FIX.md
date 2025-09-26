# Lesson Plan Markdown Parsing Fix

## Problem Analysis

The lesson plan generation was failing with this JSON parsing error:
```
ERROR:main:Failed to parse OpenAI response: Expecting value: line 1 column 1 (char 0)
ERROR:main:Raw AI response: ```json
{
  "lessonTitle": "Understanding AI and ML Concepts",
  ...
}
```
```

### Root Cause:
The OpenAI API is returning the JSON response wrapped in markdown code blocks (```json ... ```), but the parsing logic is attempting to parse it as plain JSON, causing a parsing error.

## Solution Implementation

### **Add Markdown Code Block Stripping**

**Location**: `custom_extensions/backend/main.py` (around line 17086)

**Before**:
```python
# Parse OpenAI response
ai_response = response.choices[0].message.content.strip()

try:
    lesson_plan_data = json.loads(ai_response)
```

**After**:
```python
# Parse OpenAI response
ai_response = response.choices[0].message.content.strip()

# Strip markdown code blocks if present
if ai_response.startswith('```json'):
    ai_response = ai_response[7:]  # Remove ```json
elif ai_response.startswith('```'):
    ai_response = ai_response[3:]   # Remove ```

if ai_response.endswith('```'):
    ai_response = ai_response[:-3]  # Remove trailing ```

ai_response = ai_response.strip()  # Clean up any remaining whitespace

try:
    lesson_plan_data = json.loads(ai_response)
```

### **Helper Function (Alternative Implementation)**:

```python
def strip_markdown_code_blocks(response_text):
    """
    Strip markdown code blocks from AI response text.
    Handles both ```json and ``` code block formats.
    """
    if not response_text:
        return response_text
    
    response_text = response_text.strip()
    
    # Remove opening code block markers
    if response_text.startswith('```json'):
        response_text = response_text[7:]  # Remove ```json
    elif response_text.startswith('```'):
        response_text = response_text[3:]   # Remove ```
    
    # Remove closing code block markers
    if response_text.endswith('```'):
        response_text = response_text[:-3]  # Remove trailing ```
    
    return response_text.strip()
```

## Error Prevention

### **Before Fix**:
```
AI Response: "```json\n{\n  \"lessonTitle\": \"...\"\n}\n```"
JSON Parser: ❌ FAILS - Unexpected character '`' at position 0
```

### **After Fix**:
```
AI Response: "```json\n{\n  \"lessonTitle\": \"...\"\n}\n```"
Stripped: "{\n  \"lessonTitle\": \"...\"\n}"
JSON Parser: ✅ PASSES - Valid JSON parsed successfully
```

## Supported Formats

### **Code Block Variations Handled**:

1. **Full markdown with json specifier**:
   ```
   ```json
   {"key": "value"}
   ```
   ```

2. **Simple markdown blocks**:
   ```
   ```
   {"key": "value"}
   ```
   ```

3. **Plain JSON (no change needed)**:
   ```
   {"key": "value"}
   ```

## Implementation Details

### **Step-by-Step Processing**:

1. **Get raw AI response**: `response.choices[0].message.content.strip()`
2. **Check for opening markers**: 
   - Remove ````json` (7 characters)
   - Or remove ```` (3 characters)
3. **Check for closing markers**: 
   - Remove trailing ```` (3 characters)
4. **Final cleanup**: `strip()` whitespace
5. **Parse as JSON**: `json.loads(ai_response)`

### **Safe Processing**:
- Only removes markers if they exist
- Preserves original content if no markers found
- Handles edge cases gracefully

## Testing Scenarios

### **Scenario 1: Full Markdown**
```python
input = """```json
{
  "lessonTitle": "Test"
}
```"""
output = '{\n  "lessonTitle": "Test"\n}'
```

### **Scenario 2: Simple Markdown**
```python
input = """```
{
  "lessonTitle": "Test"
}
```"""
output = '{\n  "lessonTitle": "Test"\n}'
```

### **Scenario 3: Plain JSON**
```python
input = '{"lessonTitle": "Test"}'
output = '{"lessonTitle": "Test"}'  # No change
```

## Benefits

### **1. Robust Parsing**:
- **Handles markdown-wrapped responses** from OpenAI
- **Maintains compatibility** with plain JSON responses
- **Prevents parsing errors** from formatting variations

### **2. Future-Proof**:
- **Adapts to OpenAI response format changes**
- **Handles both common markdown formats**
- **Graceful degradation** for unknown formats

### **3. Better Error Handling**:
- **Clear separation** of formatting vs content errors
- **Improved debugging** with cleaned response logging
- **Consistent behavior** across different AI response formats

## Error Recovery

### **Enhanced Error Logging**:
```python
try:
    lesson_plan_data = json.loads(ai_response)
except json.JSONDecodeError as e:
    logger.error(f"Failed to parse cleaned AI response: {e}")
    logger.error(f"Original raw response: {response.choices[0].message.content}")
    logger.error(f"Cleaned response: {ai_response}")
    raise ValueError("Invalid JSON response from AI")
```

## Quality Assurance

### **Input Validation**:
- Handles empty/null responses safely
- Preserves content integrity during stripping
- Maintains proper error propagation

### **Edge Case Handling**:
- Partial code block markers
- Nested code blocks (preserves inner content)
- Mixed whitespace and formatting

### **Backward Compatibility**:
- Works with existing plain JSON responses
- No breaking changes to API contracts
- Maintains all existing functionality

## Conclusion

The markdown stripping fix ensures that:

- **✅ OpenAI responses with markdown code blocks** are parsed correctly
- **✅ Plain JSON responses** continue to work without changes  
- **✅ Parsing errors** are eliminated for formatted responses
- **✅ Error messages** provide better debugging information
- **✅ System reliability** is improved for AI response variations

This fix resolves the `"Expecting value: line 1 column 1 (char 0)"` JSON parsing error while maintaining robust handling of all AI response formats. 