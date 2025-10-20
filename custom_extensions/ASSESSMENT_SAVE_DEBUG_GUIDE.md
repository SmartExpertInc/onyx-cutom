# Assessment Data Save Debugging Guide

## Issue
Assessment type and duration values are not persisting after page reload, even though they appear to save successfully.

## Debugging Steps

### 1. Check Frontend Logs (Browser Console)

When you edit an assessment value, look for these logs:

#### A. Before Save
```
🔄 [TEXT SAVE] Saving field: assessmentType_0_1
📝 [TEXT SAVE] Previous value: test
📝 [TEXT SAVE] New value: practice
```

#### B. Checking lessonAssessments Initialization
```
⚠️ [TEXT SAVE] lessonAssessments not found, initializing array for module 0
```
OR
```
✅ [TEXT SAVE] Successfully updated assessment type 0 1
```

#### C. Payload Being Sent
```
🎯 [ASSESSMENT PERSISTENCE] ==========================================
🎯 [ASSESSMENT PERSISTENCE] Saving assessment field: assessmentType_0_1
🎯 [ASSESSMENT PERSISTENCE] New value: practice
🎯 [ASSESSMENT PERSISTENCE] courseOutlineModules in updatedData: [...]
🎯 [ASSESSMENT PERSISTENCE] Full courseOutlineModules: {...}
🎯 [ASSESSMENT PERSISTENCE] Will be included in API payload: YES
```

#### D. API Call
```
🎯 [ASSESSMENT API] ==========================================
🎯 [ASSESSMENT API] Field being saved: assessmentType_0_1
🎯 [ASSESSMENT API] courseOutlineModules in payload: [...]
🎯 [ASSESSMENT API] Module 0 lessonAssessments: [...]
🎯 [ASSESSMENT API] Module 1 lessonAssessments: [...]
```

#### E. Success Response
```
✅ [AUTO SAVE] Successfully saved to database
```

### 2. Check Backend Logs (Server Console)

After the save request, look for:

```
🎯 [ASSESSMENT BACKEND] ==========================================
🎯 [ASSESSMENT BACKEND] Project 123 - courseOutlineModules FOUND in payload!
🎯 [ASSESSMENT BACKEND] Number of modules: 4
🎯 [ASSESSMENT BACKEND] Module 0: 'Module Title'
🎯 [ASSESSMENT BACKEND] - Has lessonAssessments: true
🎯 [ASSESSMENT BACKEND] - lessonAssessments: [
  {
    "type": "practice",
    "duration": "5 min"
  },
  ...
]
🎯 [ASSESSMENT BACKEND] This data WILL BE stored in database
```

### 3. Check Page Load (After Reload)

When the page loads, check:

```
📡 [FRONTEND DATA FLOW] Making API request to: /api/custom-projects-backend/ai-audit/landing-page/123
📡 [FRONTEND DATA FLOW] API response status: 200
```

Then check the `landingPageData` in the console:
```javascript
console.log(landingPageData.courseOutlineModules[0].lessonAssessments);
```

Should show the saved values.

## Common Issues & Solutions

### Issue 1: lessonAssessments Not in Payload
**Symptom**: Backend logs show `❌ NO lessonAssessments found in module X`

**Solution**: 
- The frontend initialization is failing
- Check if `updatedData.courseOutlineModules[moduleIndex].lessonAssessments` exists before saving
- The backward compatibility code should create it automatically

### Issue 2: Data Saved But Not Retrieved
**Symptom**: Backend logs show data being saved, but page reload shows old values

**Solution**:
- Check the GET endpoint `/ai-audit/landing-page/${projectId}` 
- Verify it's returning the `lessonAssessments` field
- Check if `generateAssessmentData()` is pulling from the right source

### Issue 3: Frontend Shows Old Values After Edit
**Symptom**: Edit works, but immediately reverts to old value

**Solution**:
- Check if `setLandingPageData(updatedData)` is being called after save
- Check if `setAssessmentData()` needs to be called to refresh the display

## Manual Database Check

If you have access to the database, run:

```sql
SELECT microproduct_content->'courseOutlineModules'->0->'lessonAssessments' 
FROM projects 
WHERE id = YOUR_PROJECT_ID;
```

This will show if the `lessonAssessments` are actually stored in the database.

## Quick Test

1. **Open browser console** (F12)
2. **Filter logs** by "ASSESSMENT" to see only relevant logs
3. **Edit an assessment value** (click on "test" and change to "practice")
4. **Watch the logs** - they should show:
   - ✅ Field updated in local state
   - ✅ Data included in API payload
   - ✅ Backend received the data
   - ✅ Save successful
5. **Reload the page**
6. **Check if the value persisted**

## Expected Flow

```
1. User clicks on assessment value
   └─> InlineEditor appears

2. User types new value and presses Enter
   └─> handleTextSave() called
   └─> lessonAssessments initialized if missing
   └─> updatedData.courseOutlineModules[X].lessonAssessments[Y].type = newValue
   └─> setLandingPageData(updatedData) called

3. API call sent to /projects/update/{projectId}
   └─> Payload includes full courseOutlineModules with lessonAssessments

4. Backend receives payload
   └─> Logs show lessonAssessments are present
   └─> Data stored in database

5. Page reload
   └─> GET /ai-audit/landing-page/{projectId}
   └─> Response includes courseOutlineModules with lessonAssessments
   └─> generateAssessmentData() uses module.lessonAssessments
   └─> Display shows saved values
```

## Next Steps

1. **Try editing a value** and watch the console
2. **Check which step fails** in the expected flow
3. **Share the console logs** showing where it breaks
4. Based on the logs, we can identify:
   - Is data being sent correctly?
   - Is backend receiving it?
   - Is it being saved to DB?
   - Is it being retrieved on reload?

## Files to Check

### Frontend
- `custom_extensions/frontend/src/app/create/audit-2-dynamic/[projectId]/page.tsx`
  - Lines 788-826: Assessment save logic
  - Lines 1146-1188: API call with logging
  - Lines 1293-1309: generateAssessmentData() function

### Backend
- `custom_extensions/backend/main.py`
  - Lines 25955-26111: Project update endpoint
  - Lines 26037-26052: Assessment data logging
  - Need to check GET endpoint for retrieval

## Date
October 20, 2025

