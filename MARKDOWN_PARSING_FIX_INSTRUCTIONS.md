# Manual Fix Instructions for Markdown Parsing Error

## Problem
The AI is returning JSON wrapped in markdown code blocks, causing parsing errors:
```
ERROR:main:Failed to parse OpenAI response: Expecting value: line 1 column 1 (char 0)
ERROR:main:Raw AI response: ```json
{
  "lessonTitle": "Understanding AI and ML Concepts",
  ...
}
```
```

## Solution
Add markdown stripping logic before JSON parsing in the lesson plan generation.

## Location to Edit
File: `custom_extensions/backend/main.py`
Around line 17100 (search for: `lesson_plan_data = json.loads(ai_response)`)

## Code to Add

**BEFORE** (current code):
```python
        try:
            lesson_plan_data = json.loads(ai_response)
```

**AFTER** (with fix):
```python
        # Strip markdown code blocks if present (similar to existing LLM parsing logic)
        ai_response = re.sub(r"^```json\s*|\s*```$", "", ai_response.strip(), flags=re.MULTILINE)
        ai_response = re.sub(r"^```(?:json)?\s*|\s*```$", "", ai_response, flags=re.IGNORECASE | re.MULTILINE).strip()
        
        try:
            lesson_plan_data = json.loads(ai_response)
```

## Step-by-Step Instructions

1. **Open** `custom_extensions/backend/main.py`
2. **Search** for the line: `lesson_plan_data = json.loads(ai_response)`
3. **Add** the markdown stripping code **BEFORE** the `try:` block
4. **Save** the file

## Expected Result
After applying this fix:
- AI responses with ```json code blocks will be parsed correctly
- Plain JSON responses will continue to work
- The "Expecting value: line 1 column 1 (char 0)" error will be resolved

## Verification
The fix uses the same regex patterns already used elsewhere in the codebase for LLM response parsing, ensuring consistency and reliability. 