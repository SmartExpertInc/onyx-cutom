# AI Audit-2 Training Plan Language & Editability Fix

## Summary

Fixed two critical issues in the AI-Audit Landing Page (Audit-2) Training Plan section:
1. **Language consistency**: Russian text was appearing even when language was set to English
2. **Editability**: Assessment type and duration values were not editable

## Changes Made

### Backend Changes (`custom_extensions/backend/main.py`)

#### 1. Fixed Russian Prompt Format (Lines 18635-18666)
**Problem**: Russian prompt used inconsistent `wizard_request` format without strict language enforcement.

**Solution**: Replaced with direct prompt matching EN/ES/UA format:
- Added explicit language instruction: "Генерируй ВЕСЬ контент ИСКЛЮЧИТЕЛЬНО на русском языке"
- Added critical language exclusion: "КРИТИЧНО: НЕ используй английские, испанские или украинские слова"
- Standardized format to match other languages

#### 2. Strengthened Language Enforcement (Lines 18560, 18592, 18624, 18656)
**Problem**: Prompts didn't explicitly exclude other languages.

**Solution**: Added critical language exclusions to all prompts:
- **English** (Line 18560): "CRITICAL: Do NOT use Russian, Spanish, or Ukrainian words"
- **Spanish** (Line 18592): "CRÍTICO: NO uses palabras en ruso, inglés o ucraniano"
- **Ukrainian** (Line 18624): "КРИТИЧНО: НЕ використовуйте російські, іспанські або англійські слова"
- **Russian** (Line 18656): "КРИТИЧНО: НЕ используй английские, испанские или украинские слова"

#### 3. Fixed Fallback Defaults (Lines 18696-18717)
**Problem**: Fallback module titles always used Russian "Модуль" regardless of language.

**Solution**: Added language-aware default titles:
```python
if language == "en":
    default_title = f'Module {i+1}'
elif language == "es":
    default_title = f'Módulo {i+1}'
elif language == "ua":
    default_title = f'Модуль {i+1}'
else:  # Russian
    default_title = f'Модуль {i+1}'
```

#### 4. Added Assessment Data Generation (Lines 18738-18762)
**Problem**: Assessment type and duration were generated client-side randomly, causing:
- Non-persistent values (changed on each page load)
- Language timing issues
- Not stored in database

**Solution**: Generate assessment data in backend with proper language support:
```python
for module_idx, module in enumerate(course_modules):
    module['lessonAssessments'] = []
    for lesson_idx, lesson in enumerate(module.get('lessons', [])):
        # Generate random assessment type and duration based on language
        if language == "en":
            assessment_types = ['none', 'test', 'practice']
            durations = ['3 min', '4 min', '5 min', '6 min', '7 min', '8 min']
        elif language == "es":
            assessment_types = ['ninguno', 'prueba', 'práctica']
            durations = ['3 min', '4 min', '5 min', '6 min', '7 min', '8 min']
        elif language == "ua":
            assessment_types = ['немає', 'тест', 'практика']
            durations = ['3 хв', '4 хв', '5 хв', '6 хв', '7 хв', '8 хв']
        else:  # Russian
            assessment_types = ['нет', 'тест', 'практика']
            durations = ['3 мин', '4 мин', '5 мин', '6 мин', '7 мин', '8 мин']
        
        assessment = {
            'type': random.choice(assessment_types),
            'duration': random.choice(durations)
        }
        module['lessonAssessments'].append(assessment)
```

#### 5. Updated Fallback Modules (Lines 18770-18881)
**Problem**: Fallback modules didn't include assessment data.

**Solution**: Added assessment data generation to all fallback modules for each language.

### Frontend Changes (`custom_extensions/frontend/src/app/create/audit-2-dynamic/[projectId]/page.tsx`)

#### 1. Replaced Client-Side Assessment Generation (Lines 1292-1309)
**Problem**: Assessment data was randomly generated on each page load using `getRandomAssessment()`.

**Solution**: Use backend-generated data:
```typescript
const generateAssessmentData = () => {
    if (!landingPageData?.courseOutlineModules) return {}
    
    const data: { [key: string]: { type: string; duration: string }[] } = {}
    
    landingPageData.courseOutlineModules.forEach((module: any, moduleIndex: number) => {
      // Use backend-generated assessment data if available, otherwise use fallback
      if (module.lessonAssessments && module.lessonAssessments.length > 0) {
        data[`module-${moduleIndex}`] = module.lessonAssessments
      } else if (module.lessons) {
        // Fallback: generate default assessments if backend data is missing
        data[`module-${moduleIndex}`] = module.lessons.map(() => ({ type: 'test', duration: '5 min' }))
      }
    })
    
    return data
  }
```

#### 2. Made Assessment Values Editable (Lines 3434-3483)
**Problem**: Assessment type and duration were displayed as plain text, not editable.

**Solution**: Added `InlineEditor` components for both fields:
- Assessment type editing: Field name `assessmentType_0_${index}`
- Duration editing: Field name `assessmentDuration_0_${index}`
- Added hover effects and click handlers
- Updated SVG icon condition to check all "none" variants

#### 3. Added Save Handlers for Assessment Fields (Lines 540-550, 787-803, 1058-1072)
**Problem**: No save handlers existed for assessment type and duration.

**Solution**: Added handlers in three locations:
- **Current value retrieval** (Lines 540-550)
- **Update logic** (Lines 787-803)
- **Recovery logic** (Lines 1058-1072)

```typescript
// Current value retrieval
else if (field.startsWith('assessmentType_')) {
  const parts = field.split('_')
  const moduleIndex = parseInt(parts[1])
  const lessonIndex = parseInt(parts[2])
  currentValue = landingPageData.courseOutlineModules?.[moduleIndex]?.lessonAssessments?.[lessonIndex]?.type || '';
}

// Update logic
else if (field.startsWith('assessmentType_')) {
  const parts = field.split('_')
  const moduleIndex = parseInt(parts[1])
  const lessonIndex = parseInt(parts[2])
  if (updatedData.courseOutlineModules && updatedData.courseOutlineModules[moduleIndex]?.lessonAssessments) {
    updatedData.courseOutlineModules[moduleIndex].lessonAssessments[lessonIndex].type = newValue
    console.log('✅ [TEXT SAVE] Successfully updated assessment type', moduleIndex, lessonIndex);
  }
}
```

## Data Structure Changes

### Before
```typescript
courseOutlineModules: [
  {
    title: "Module Title",
    lessons: ["Lesson 1", "Lesson 2", ...]
  }
]
```

### After
```typescript
courseOutlineModules: [
  {
    title: "Module Title",
    lessons: ["Lesson 1", "Lesson 2", ...],
    lessonAssessments: [
      { type: "test", duration: "5 min" },
      { type: "practice", duration: "7 min" },
      ...
    ]
  }
]
```

## Testing

After implementation, test the following:

1. **Language Consistency**:
   - Generate audit-2 in **English** → verify all module/lesson names and assessment values are in English
   - Generate audit-2 in **Spanish** → verify all content is in Spanish
   - Generate audit-2 in **Ukrainian** → verify all content is in Ukrainian
   - Generate audit-2 in **Russian** → verify all content is in Russian

2. **Editability**:
   - Click on assessment type values → verify inline editor appears
   - Click on duration values → verify inline editor appears
   - Edit values → verify changes are saved to database
   - Reload page → verify edited values persist

3. **Backward Compatibility**:
   - Test with existing audit-2 projects (created before this fix)
   - Verify fallback logic works when `lessonAssessments` is missing

## Benefits

1. **✅ Language Consistency**: All content now respects the language parameter
2. **✅ Data Persistence**: Assessment values are stored in database, not regenerated on each load
3. **✅ Full Editability**: Users can now edit all values in the Training Plan table
4. **✅ Better UX**: Consistent, predictable behavior across all languages
5. **✅ Maintainability**: Standardized prompt format across all languages

## Files Modified

1. `custom_extensions/backend/main.py` - Lines 18522-18881
2. `custom_extensions/frontend/src/app/create/audit-2-dynamic/[projectId]/page.tsx` - Lines 1292-1309, 3434-3483, 540-550, 787-803, 1058-1072

## Date
October 20, 2025

