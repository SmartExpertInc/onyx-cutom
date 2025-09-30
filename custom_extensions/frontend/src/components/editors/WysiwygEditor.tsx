// components/editors/WysiwygEditor.tsx

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import StarterKit from '@tiptap/starter-kit';

export interface WysiwygEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function WysiwygEditor({
  initialValue,
  onSave,
  onCancel,
  placeholder = '',
  className = '',
  style = {}
}: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable everything except Bold and Italic
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        // Keep only:
        bold: true,
        italic: true,
        paragraph: true,
        text: true,
        history: true, // For Ctrl+Z
      }),
      BubbleMenu.configure({
        element: document.createElement('div'),
      }),
    ],
    content: initialValue || '',
    editorProps: {
      attributes: {
        class: `wysiwyg-editor ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      // Can call onSave here for real-time save
      // But better to leave it on onBlur
    },
  });

  // Focus on mount
  useEffect(() => {
    if (editor) {
      editor.commands.focus('end');
      // Select all text on mount for consistency with previous behavior
      editor.commands.selectAll();
    }
  }, [editor]);

  // Handle Escape
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

  // Handle Blur
  const handleBlur = () => {
    if (editor) {
      const html = editor.getHTML();
      // Remove extra <p> tags if content is simple
      const cleanHtml = html.replace(/^<p>(.*)<\/p>$/, '$1');
      onSave(cleanHtml);
    }
  };

  if (!editor) {
    return null;
  }

  // Clean styles to avoid conflicts with fontWeight/fontStyle
  const cleanedStyle = { ...style };
  delete cleanedStyle.fontWeight;
  delete cleanedStyle.fontStyle;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* BubbleMenu - appears on selection */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 100,
          placement: 'top',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '4px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: editor.isActive('bold') ? '#3b82f6' : 'white',
              color: editor.isActive('bold') ? 'white' : '#374151',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('bold')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('bold')) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: editor.isActive('italic') ? '#3b82f6' : 'white',
              color: editor.isActive('italic') ? 'white' : '#374151',
              fontStyle: 'italic',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('italic')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('italic')) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
            title="Italic (Ctrl+I)"
          >
            I
          </button>
        </div>
      </BubbleMenu>

      {/* Editor */}
      <EditorContent
        editor={editor}
        onBlur={handleBlur}
        style={{
          ...cleanedStyle,
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '8px',
          minHeight: '1.6em',
          outline: 'none',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
        }}
      />
    </div>
  );
}

export default WysiwygEditor;
