# Final Template Update: ImpactStatementsSlideTemplate

## ✅ STATUS: 4/5 Templates Completed

### Completed Templates:
1. ✅ AvatarServiceSlideTemplate
2. ✅ CourseOverviewSlideTemplate  
3. ✅ WorkLifeBalanceSlideTemplate
4. ✅ PhishingDefinitionSlideTemplate
5. ✅ SoftSkillsAssessmentSlideTemplate

### Remaining:
- ❌ ImpactStatementsSlideTemplate (Has title + 3 statements with number & description each)

---

## Changes Needed for ImpactStatementsSlideTemplate

### 1. Add Import (Line ~10)
```typescript
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '@/components/editors/ControlledWysiwygEditor';
```

### 2. Add onEditorActive Prop (Line ~11-14)
```typescript
export const ImpactStatementsSlideTemplate: React.FC<ImpactStatementsSlideProps & {
  theme?: SlideTheme | string;
  pageNumber?: string;
  logoNew?: string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;  // ← ADD
}> = ({
```

### 3. Add onEditorActive to Destructured Props (Line ~34)
```typescript
  voiceoverText,
  onEditorActive  // ← ADD
}) => {
```

### 4. Add Editor Refs (After state declarations, ~Line 44)
```typescript
const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
const numberEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
const descriptionEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
```

### 5. Update handleTitleSave (~Line 65-71)
```typescript
const handleTitleSave = (newTitle: string) => {
  setCurrentTitle(newTitle);
  setEditingTitle(false);
  onEditorActive?.(null as any, 'title');  // ← ADD THIS LINE
  if (onUpdate) {
    onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
  }
};
```

### 6. Update handleStatementSave (~Line 73-80)
```typescript
const handleStatementSave = (index: number, newDescription: string) => {
  const newStatements = [...currentStatements];
  newStatements[index] = { ...newStatements[index], description: newDescription };
  setCurrentStatements(newStatements);
  setEditingStatements(null);
  onEditorActive?.(null as any, `statement-description-${index}`);  // ← ADD THIS LINE
  if (onUpdate) {
    onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
  }
};
```

### 7. Update handleNumberSave (~Line 83-90)
```typescript
const handleNumberSave = (index: number, newNumber: string) => {
  const newStatements = [...currentStatements];
  newStatements[index] = { ...newStatements[index], number: newNumber };
  setCurrentStatements(newStatements);
  setEditingNumbers(null);
  onEditorActive?.(null as any, `statement-number-${index}`);  // ← ADD THIS LINE
  if (onUpdate) {
    onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
  }
};
```

### 8. Update handleTitleCancel (~Line 93-96)
```typescript
const handleTitleCancel = () => {
  setCurrentTitle(title);
  setEditingTitle(false);
  onEditorActive?.(null as any, 'title');  // ← ADD THIS LINE
};
```

### 9. Update handleStatementCancel (~Line 98-101)
```typescript
const handleStatementCancel = () => {
  setCurrentStatements(statements);
  setEditingStatements(null);
  if (editingStatements !== null) {  // ← ADD THIS BLOCK
    onEditorActive?.(null as any, `statement-description-${editingStatements}`);
  }
};
```

### 10. Update handleNumberCancel (~Line 103-106)
```typescript
const handleNumberCancel = () => {
  setCurrentStatements(statements);
  setEditingNumbers(null);
  if (editingNumbers !== null) {  // ← ADD THIS BLOCK
    onEditorActive?.(null as any, `statement-number-${editingNumbers}`);
  }
};
```

### 11. Update Title Rendering (~Line 163-179)
**BEFORE:**
```typescript
{isEditable && editingTitle ? (
  <ImprovedInlineEditor
    initialValue={currentTitle}
    onSave={handleTitleSave}
    onCancel={handleTitleCancel}
    multiline={true}
    className="impact-title-editor title-element"
    style={{ fontSize: '50px', color: '#09090B', lineHeight: '1.2', width: '100%', height: 'auto', minHeight: '4.17%' }}
  />
) : (
  <div className="title-element" onClick={() => isEditable && setEditingTitle(true)}>
    {currentTitle}
  </div>
)}
```

**AFTER:**
```typescript
{isEditable && editingTitle ? (
  <ControlledWysiwygEditor
    ref={titleEditorRef}
    initialValue={currentTitle}
    onSave={handleTitleSave}
    onCancel={handleTitleCancel}
    placeholder="Enter title..."
    className="impact-title-editor title-element"
    style={{ 
      fontSize: '50px', 
      color: '#09090B', 
      lineHeight: '1.2', 
      width: '100%', 
      height: 'auto', 
      minHeight: '4.17%',
      padding: '8px 12px',
      border: '1px solid rgba(0,0,0,0.2)',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)'
    }}
    onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'title', computedStyles)}
  />
) : (
  <div 
    className="title-element" 
    onClick={() => isEditable && setEditingTitle(true)}
    dangerouslySetInnerHTML={{ __html: currentTitle }}
  />
)}
```

### 12. Update Number Rendering (~Line 373-387, 484-497)
**BEFORE:**
```typescript
{isEditable && editingNumbers === index ? (
  <ImprovedInlineEditor
    initialValue={statement.number}
    onSave={(value) => handleNumberSave(index, value)}
    onCancel={handleNumberCancel}
    className="statement-number-editor title-element"
    style={{ fontSize: '60px', color: '#263644', width: '100%', height: 'auto' }}
  />
) : (
  <div className="title-element" onClick={() => isEditable && setEditingNumbers(index)}>
    {statement.number}
  </div>
)}
```

**AFTER:**
```typescript
{isEditable && editingNumbers === index ? (
  <ControlledWysiwygEditor
    ref={(el) => {
      if (numberEditorRefs.current) {
        numberEditorRefs.current[index] = el;
      }
    }}
    initialValue={statement.number}
    onSave={(value) => handleNumberSave(index, value)}
    onCancel={handleNumberCancel}
    placeholder="Enter number..."
    className="statement-number-editor title-element"
    style={{ 
      fontSize: '60px', 
      color: '#263644', 
      width: '100%', 
      height: 'auto',
      padding: '8px 12px',
      border: '1px solid rgba(0,0,0,0.2)',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)'
    }}
    onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, `statement-number-${index}`, computedStyles)}
  />
) : (
  <div 
    className="title-element" 
    onClick={() => isEditable && setEditingNumbers(index)}
    dangerouslySetInnerHTML={{ __html: statement.number }}
  />
)}
```

### 13. Update Description Rendering (~Line 416-433, 520-535)
**BEFORE:**
```typescript
{isEditable && editingStatements === index ? (
  <ImprovedInlineEditor
    initialValue={statement.description}
    onSave={(value) => handleStatementSave(index, value)}
    onCancel={handleStatementCancel}
    multiline={true}
    className="statement-description-editor"
    style={{ fontSize: '22px', color: 'rgba(9, 9, 11, 0.7)', lineHeight: '1.4', width: '100%', height: 'auto', whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}
  />
) : (
  <div onClick={() => isEditable && setEditingStatements(index)}>
    {statement.description}
  </div>
)}
```

**AFTER:**
```typescript
{isEditable && editingStatements === index ? (
  <ControlledWysiwygEditor
    ref={(el) => {
      if (descriptionEditorRefs.current) {
        descriptionEditorRefs.current[index] = el;
      }
    }}
    initialValue={statement.description}
    onSave={(value) => handleStatementSave(index, value)}
    onCancel={handleStatementCancel}
    placeholder="Enter description..."
    className="statement-description-editor"
    style={{ 
      fontSize: '22px', 
      color: 'rgba(9, 9, 11, 0.7)', 
      lineHeight: '1.4', 
      width: '100%', 
      height: 'auto', 
      whiteSpace: 'pre-line', 
      fontFamily: 'Inter, sans-serif',
      padding: '8px 12px',
      border: '1px solid rgba(0,0,0,0.2)',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)'
    }}
    onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, `statement-description-${index}`, computedStyles)}
  />
) : (
  <div 
    onClick={() => isEditable && setEditingStatements(index)}
    dangerouslySetInnerHTML={{ __html: statement.description }}
  />
)}
```

---

## Summary of Changes

| Change Type | Count |
|-------------|-------|
| Imports | 1 |
| Prop additions | 2 |
| Ref additions | 3 |
| Handler updates | 6 |
| Rendering replacements | 5 (title + 2×number + 2×description) |

**Total Edits**: ~15 changes across the file

---

## After Completion

Once ImpactStatementsSlideTemplate is updated, ALL 6 slide templates will support:

✓ Rich text editing via ControlledWysiwygEditor  
✓ TextSettings panel integration  
✓ Computed styles (shows actual CSS values)  
✓ Full formatting: Bold, Italic, Underline, Strikethrough, Font Family, Font Size, Color, Text Align  
✓ HTML persistence with inline styles  
✓ Correct rendering after save/reload

---

## Testing Checklist

After completing ImpactStatementsSlideTemplate:

1. ✅ Open video lesson editor
2. ✅ Add slide for each template type
3. ✅ Click text fields → Editor opens
4. ✅ Select text → TextSettings appears
5. ✅ Apply formatting → Changes apply correctly
6. ✅ Save → Formatting persists
7. ✅ Reload page → Formatting displays correctly
8. ✅ Check console for computed styles logs

---

**Status**: Ready to complete final template! 🚀

