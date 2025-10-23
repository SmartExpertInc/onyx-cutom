# Updating Remaining Templates

## Templates to Update:
1. PhishingDefinitionSlideTemplate.tsx
2. SoftSkillsAssessmentSlideTemplate.tsx  
3. ImpactStatementsSlideTemplate.tsx

## Changes Needed for Each:

### 1. Import ControlledWysiwygEditor
```typescript
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '@/components/editors/ControlledWysiwygEditor';
```

### 2. Add onEditorActive prop
```typescript
export const TemplateComponent: React.FC<Props & {
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}> = ({
  ...
  onEditorActive
}) => {
```

### 3. Add editor refs
```typescript
const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
```

### 4. Update save handlers to clear editor
```typescript
const handleTitleSave = (newTitle: string) => {
  setCurrentTitle(newTitle);
  setEditingTitle(false);
  onEditorActive?.(null as any, 'title');  // ← ADD THIS
  // ... rest of save logic
};
```

### 5. Update cancel handlers
```typescript
const handleTitleCancel = () => {
  setCurrentTitle(title);
  setEditingTitle(false);
  onEditorActive?.(null as any, 'title');  // ← ADD THIS
};
```

### 6. Replace InlineEditor with ControlledWysiwygEditor
```typescript
{isEditable && editingTitle ? (
  <ControlledWysiwygEditor
    ref={titleEditorRef}
    initialValue={currentTitle}
    onSave={handleTitleSave}
    onCancel={handleTitleCancel}
    placeholder="Enter title..."
    style={{ ...originalStyles, padding: '8px 12px', border: '1px solid rgba(...)' }}
    onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'title', computedStyles)}
  />
) : (
  <div
    onClick={() => isEditable && setEditingTitle(true)}
    style={{ ...originalStyles }}
    dangerouslySetInnerHTML={{ __html: currentTitle }}
  />
)}
```

## Note:
- Keep style properties from original InlineEditor
- Add padding, border, and backgroundColor for editor visibility
- Use dangerouslySetInnerHTML for static view to render HTML

