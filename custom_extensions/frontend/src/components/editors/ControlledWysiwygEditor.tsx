// components/editors/ControlledWysiwygEditor.tsx
// Wysiwyg editor controlled by external toolbar (TextSettings panel)

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

export interface ControlledWysiwygEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onEditorReady?: (editor: Editor) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
}

export interface ControlledWysiwygEditorRef {
  getEditor: () => Editor | null;
  focus: () => void;
  blur: () => void;
}

export const ControlledWysiwygEditor = forwardRef<ControlledWysiwygEditorRef, ControlledWysiwygEditorProps>(
  ({ 
    initialValue, 
    onSave, 
    onCancel, 
    placeholder = '', 
    className = '', 
    style = {},
    onEditorReady,
    onSelectionChange
  }, ref) => {
    const cleanedStyle = { ...style };
    delete cleanedStyle.fontWeight;
    delete cleanedStyle.fontStyle;

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4],
          },
          bulletList: false,
          orderedList: false,
          blockquote: false,
          code: false,
          codeBlock: false,
          horizontalRule: false,
        }),
        Underline,
        TextStyle,
        Color,
      ],
      content: initialValue || '',
      editorProps: {
        attributes: {
          class: `controlled-wysiwyg-editor ${className}`,
          style: Object.entries(cleanedStyle)
            .map(([key, value]) => {
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              return `${cssKey}: ${value}`;
            })
            .join('; '),
        },
      },
      onSelectionUpdate: ({ editor }) => {
        const { empty } = editor.state.selection;
        onSelectionChange?.(!empty);
      },
    });

    useEffect(() => {
      if (editor) {
        editor.commands.focus('end');
        editor.commands.selectAll();
        onEditorReady?.(editor);
      }
    }, [editor, onEditorReady]);

    useEffect(() => {
      if (!editor) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          editor.commands.blur();
          onCancel();
        }
      };

      const editorElement = editor.view.dom;
      editorElement.addEventListener('keydown', handleKeyDown);

      return () => {
        editorElement.removeEventListener('keydown', handleKeyDown);
      };
    }, [editor, onCancel]);

    const handleBlur = () => {
      if (editor) {
        const html = editor.getHTML();
        const cleanHtml = html.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
        onSave(cleanHtml);
      }
    };

    // Expose editor instance to parent via ref
    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      focus: () => editor?.commands.focus(),
      blur: () => editor?.commands.blur(),
    }));

    if (!editor) {
      return null;
    }

    return (
      <div 
        style={{ 
          position: 'relative', 
          width: '100%',
          paddingTop: '4px' // Small padding instead of toolbar space
        }}
      >
        <div onBlur={handleBlur}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

ControlledWysiwygEditor.displayName = 'ControlledWysiwygEditor';

export default ControlledWysiwygEditor;

