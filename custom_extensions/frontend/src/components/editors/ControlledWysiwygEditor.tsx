// components/editors/ControlledWysiwygEditor.tsx
// Wysiwyg editor controlled by external toolbar (TextSettings panel)

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';

export interface ComputedStyles {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: string;
}

export interface ControlledWysiwygEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onEditorReady?: (editor: Editor, computedStyles?: ComputedStyles) => void;
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
        TextStyle.configure({
          HTMLAttributes: {
            class: 'text-style',
          },
        }).extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              fontFamily: {
                default: null,
                parseHTML: element => element.style.fontFamily || null,
                renderHTML: attributes => {
                  if (!attributes.fontFamily) {
                    return {};
                  }
                  return {
                    style: `font-family: ${attributes.fontFamily}`,
                  };
                },
              },
              fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize || null,
                renderHTML: attributes => {
                  if (!attributes.fontSize) {
                    return {};
                  }
                  return {
                    style: `font-size: ${attributes.fontSize}`,
                  };
                },
              },
            };
          },
        }),
        Color,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          alignments: ['left', 'center', 'right', 'justify'],
        }),
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
        // Just focus, don't select all - let user place cursor where they want
        editor.commands.focus('end');
        
        // Read computed styles from the DOM
        try {
          const editorElement = editor.view.dom;
          const computedStyles = window.getComputedStyle(editorElement);
          
          const extractedStyles: ComputedStyles = {
            fontSize: computedStyles.fontSize,      // e.g., "40px" (computed from 2.5rem)
            fontFamily: computedStyles.fontFamily,  // e.g., "Lora, serif"
            color: computedStyles.color,            // e.g., "rgb(255, 255, 255)"
            textAlign: computedStyles.textAlign,    // e.g., "left"
          };
          
          console.log('📏 [ControlledEditor] Computed styles:', extractedStyles);
          
          onEditorReady?.(editor, extractedStyles);
        } catch (error) {
          console.warn('Failed to read computed styles:', error);
          onEditorReady?.(editor);
        }
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

    const handleBlur = (e: React.FocusEvent) => {
      // Don't save if focus is moving to a button or control element
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // Check if we're focusing a formatting button or control
      if (relatedTarget && (
        relatedTarget.closest('[data-textsettings-panel]') ||
        relatedTarget.tagName === 'BUTTON' ||
        relatedTarget.closest('button')
      )) {
        console.log('⚠️ Blur prevented - focusing control element');
        return; // Don't save, keep editor open
      }
      
      if (editor) {
        const html = editor.getHTML();
        const cleanHtml = html.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
        onSave(cleanHtml);
      }
    };

    // Add global styles for formatting tags
    useEffect(() => {
      const styleId = 'controlled-wysiwyg-formatting-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Ensure formatting tags inherit font properties unless explicitly overridden */
          .controlled-wysiwyg-editor strong,
          .controlled-wysiwyg-editor em,
          .controlled-wysiwyg-editor u,
          .controlled-wysiwyg-editor s {
            font-family: inherit !important;
            font-size: inherit !important;
          }
          
          /* Span tags can have inline styles for font-family, font-size, and color */
          .controlled-wysiwyg-editor span {
            /* Inline styles will override via specificity */
          }
        `;
        document.head.appendChild(style);
      }
    }, []);

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

