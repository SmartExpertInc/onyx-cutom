// components/editors/WysiwygEditor.tsx

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  const cleanedStyle = { ...style };
  delete cleanedStyle.fontWeight;
  delete cleanedStyle.fontStyle;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
    ],
    content: initialValue || '',
    editorProps: {
      attributes: {
        class: `wysiwyg-editor ${className}`,
        style: Object.entries(cleanedStyle)
          .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${value}`;
          })
          .join('; '),
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to, empty } = editor.state.selection;
      
      if (empty) {
        setShowToolbar(false);
        return;
      }

      // Отримати координати виділення
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      
      // Позиціонувати toolbar над центром виділення
      setToolbarPosition({
        x: (start.left + end.left) / 2,
        y: start.top
      });
      setShowToolbar(true);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.focus('end');
      editor.commands.selectAll();
    }
  }, [editor]);

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
    setShowToolbar(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Custom BubbleMenu */}
      {showToolbar && (
        <div
          style={{
            position: 'fixed',
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y - 50}px`,
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '4px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
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
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
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
      )}

      <div onBlur={handleBlur}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default WysiwygEditor;