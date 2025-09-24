# 🔧 Lesson Plan Empty Resources & Prompts Fix

## 🐛 Issues Identified

Based on the screenshot provided:

1. **Resources Section Empty**: The "Source Materials Used" section was completely empty
2. **Prompts Only Show Titles**: The prompts section only displayed titles like "PRESENTATION CREATION PROMPT:" and "QUIZ CREATION PROMPT:" without any content

## 🔍 Root Cause Analysis

### Resources Issue
- **Backend**: The `source_materials` were being extracted correctly but the AI's `materials` response was overriding them
- **Frontend**: The materials parsing logic was not handling empty strings and edge cases properly

### Prompts Issue  
- **Backend**: The AI might not be formatting prompts with the `**Title:**` format consistently
- **Frontend**: The parsing logic was failing when prompts didn't have the expected title format, leaving content empty

## ✅ Fixes Applied

### 1. Backend Fixes (`custom_extensions/backend/main.py`)

#### Materials Override Fix
```python
# Override AI materials with our extracted source materials
logger.info(f"Extracted source materials: {source_materials}")
lesson_plan_data['materials'] = source_materials + [
    "",  # Separator
    "Additional Resources Needed:",
    "- Content creation tools and software", 
    "- Assessment and evaluation instruments",
    "- Visual design and multimedia resources"
]
logger.info(f"Final materials for lesson plan: {lesson_plan_data['materials']}")
```

#### Prompts Debugging & Formatting
```python
# Debug the prompts to see what the AI returned
logger.info(f"AI returned {len(lesson_plan_data.get('suggestedPrompts', []))} prompts")
for i, prompt in enumerate(lesson_plan_data.get('suggestedPrompts', [])):
    logger.info(f"Prompt {i+1}: {prompt[:100]}...")  # Log first 100 chars of each prompt

# Ensure prompts are properly formatted with titles if they're not
if 'suggestedPrompts' in lesson_plan_data:
    formatted_prompts = []
    for i, prompt in enumerate(lesson_plan_data['suggestedPrompts']):
        # Check if prompt already has a title format
        if not prompt.strip().startswith('**'):
            # Try to infer the product type and add title
            if i < len(ai_generated_products):
                product_name = ai_generated_products[i]
                # Format the product name as a title
                if 'video' in product_name.lower():
                    title = "Video Lesson Creation Prompt"
                elif 'presentation' in product_name.lower():
                    title = "Presentation Creation Prompt"
                elif 'quiz' in product_name.lower():
                    title = "Quiz Creation Prompt"
                elif 'one-pager' in product_name.lower():
                    title = "One-Pager Creation Prompt"
                else:
                    title = f"{product_name.replace('-', ' ').title()} Creation Prompt"
                
                formatted_prompt = f"**{title}:**\n{prompt}"
                formatted_prompts.append(formatted_prompt)
            else:
                formatted_prompts.append(prompt)
        else:
            formatted_prompts.append(prompt)
    
    lesson_plan_data['suggestedPrompts'] = formatted_prompts
```

### 2. Frontend Fixes (`custom_extensions/frontend/src/components/LessonPlanView.tsx`)

#### Enhanced Materials Parsing
```tsx
{(() => {
  // Find the separator index
  const separatorIndex = lessonPlanData.materials.findIndex(m => m.includes('Additional Resources'));
  const sourceMaterials = separatorIndex > 0 ? lessonPlanData.materials.slice(0, separatorIndex) : lessonPlanData.materials;
  
  // Filter out empty strings
  const filteredSourceMaterials = sourceMaterials.filter(m => m.trim() !== '');
  
  return filteredSourceMaterials.length > 0 ? filteredSourceMaterials.map((material, index) => (
    <li key={index} className="flex items-start group">
      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
      <span className="text-gray-800 leading-relaxed font-semibold text-lg">{material}</span>
    </li>
  )) : (
    <li className="flex items-start group">
      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm"></div>
      <span className="text-gray-800 leading-relaxed font-semibold text-lg">General Knowledge</span>
    </li>
  );
})()}
```

#### Robust Prompts Parsing
```tsx
{lessonPlanData.suggestedPrompts.map((prompt, index) => {
  // Parse structured prompts with titles
  const lines = prompt.split('\n');
  const titleMatch = lines[0].match(/\*\*(.+?)\*\*/);
  
  let title, content;
  if (titleMatch) {
    title = titleMatch[1];
    content = lines.slice(1).join('\n').trim();
  } else {
    // If no title format found, try to infer from content or use generic title
    if (prompt.toLowerCase().includes('video')) {
      title = 'Video Lesson Creation Prompt';
    } else if (prompt.toLowerCase().includes('presentation')) {
      title = 'Presentation Creation Prompt';
    } else if (prompt.toLowerCase().includes('quiz')) {
      title = 'Quiz Creation Prompt';
    } else if (prompt.toLowerCase().includes('one-pager') || prompt.toLowerCase().includes('onepager')) {
      title = 'One-Pager Creation Prompt';
    } else {
      title = `Content Creation Prompt ${index + 1}`;
    }
    content = prompt;
  }
  
  // Ensure content is not empty
  if (!content || content.trim() === '') {
    content = prompt; // Fallback to original prompt
  }
  
  // ... rest of the component rendering
})}
```

## 🎯 Expected Results After Fix

### Resources Section
**Before:** Empty section
**After:**
```
Source Materials Used:
• Customer Journey Mapping Guide.pdf
• Marketing Research Templates (Folder)
• General Knowledge

Additional Resources Needed:
• Content creation tools and software
• Assessment and evaluation instruments
• Visual design and multimedia resources
```

### Prompts Section
**Before:** Only titles showing
**After:**
```
PRESENTATION CREATION PROMPT:
Create a comprehensive presentation for marketing professionals on Customer Journey Mapping. This presentation should cover key touchpoints, customer analysis methods, and optimization strategies...

QUIZ CREATION PROMPT:  
Create an interactive quiz for marketing professionals on Customer Journey Mapping. Include 10 questions covering customer touchpoints, journey stages, and optimization strategies...
```

## 🚀 Implementation Status

- ✅ **Backend materials override**: Ensures actual source materials are used
- ✅ **Backend prompts formatting**: Adds titles if missing
- ✅ **Frontend materials parsing**: Handles empty strings and edge cases
- ✅ **Frontend prompts parsing**: Robust fallback for missing titles
- ✅ **Debugging logging**: Added extensive logging for troubleshooting

## 🧪 Testing

To test the fixes:

1. **Create a new lesson plan** from an existing course outline
2. **Check Resources section** - should show actual document names or "General Knowledge"
3. **Check Prompts section** - should show both titles and full content for each recommended product
4. **Check backend logs** - should show detailed information about materials and prompts processing

The fixes ensure that even if the AI doesn't format responses perfectly, the frontend will gracefully handle the data and display meaningful content to users. 