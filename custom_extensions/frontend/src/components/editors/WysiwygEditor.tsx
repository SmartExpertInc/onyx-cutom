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
  
  // Log toolbar state changes
  useEffect(() => {
    console.log('🔄 [WysiwygEditor] Toolbar visibility changed:', showToolbar);
  }, [showToolbar]);
  
  useEffect(() => {
    console.log('📍 [WysiwygEditor] Toolbar position changed:', toolbarPosition);
  }, [toolbarPosition]);

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
      
      console.log('🔍 [WysiwygEditor] Selection Update Triggered:', {
        from,
        to,
        empty,
        selectionText: editor.state.doc.textBetween(from, to, ' ')
      });
      
      if (empty) {
        console.log('📝 [WysiwygEditor] Selection is empty, hiding toolbar');
        setShowToolbar(false);
        return;
      }

      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      
      console.log('📍 [WysiwygEditor] Raw Coordinates from coordsAtPos:', {
        start: {
          left: start.left,
          right: start.right,
          top: start.top,
          bottom: start.bottom
        },
        end: {
          left: end.left,
          right: end.right,
          top: end.top,
          bottom: end.bottom
        }
      });
      
      // Calculate horizontal center
      const centerX = (start.left + end.left) / 2;
      
      // Calculate vertical position (top of selection)
      const topY = Math.min(start.top, end.top);
      
      console.log('🧮 [WysiwygEditor] Position Calculations:', {
        centerXCalculation: `(${start.left} + ${end.left}) / 2 = ${centerX}`,
        topYCalculation: `Math.min(${start.top}, ${end.top}) = ${topY}`,
        finalPosition: { x: centerX, y: topY }
      });
      
      const newPosition = {
        x: centerX,
        y: topY
      };
      
      console.log('🎯 [WysiwygEditor] Setting toolbar position:', newPosition);
      
      setToolbarPosition(newPosition);
      setShowToolbar(true);
      
      console.log('✅ [WysiwygEditor] Toolbar should now be visible at position:', newPosition);
    },
  });

  useEffect(() => {
    if (editor) {
      console.log('🎯 [WysiwygEditor] Editor initialized, setting focus and selecting all text');
      editor.commands.focus('end');
      editor.commands.selectAll();
      console.log('📝 [WysiwygEditor] Focus and selection commands executed');
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('⌨️ [WysiwygEditor] Key pressed:', e.key);
      if (e.key === 'Escape') {
        console.log('🚫 [WysiwygEditor] Escape key pressed, canceling edit');
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
    console.log('👋 [WysiwygEditor] Editor blur event triggered');
    if (editor) {
      const html = editor.getHTML();
      const cleanHtml = html.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
      console.log('💾 [WysiwygEditor] Saving content on blur:', {
        originalHTML: html,
        cleanedHTML: cleanHtml
      });
      onSave(cleanHtml);
    }
    console.log('👁️ [WysiwygEditor] Hiding toolbar due to blur');
    setShowToolbar(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {showToolbar && (() => {
        // Calculate final toolbar position
        const finalLeft = toolbarPosition.x;
        const finalTop = toolbarPosition.y - 60; // 60px above text
        const offsetY = 60;
        
        console.log('🎨 [WysiwygEditor] Toolbar Rendering Calculations:', {
          basePosition: toolbarPosition,
          offsetY: offsetY,
          finalLeft: finalLeft,
          finalTop: finalTop,
          finalCSSLeft: `${finalLeft}px`,
          finalCSSTop: `${finalTop}px`,
          transform: 'translateX(-50%)',
          explanation: `Toolbar positioned at (${finalLeft}, ${finalTop}) with -50% horizontal transform`
        });
        
        return (
          <div
            style={{
              position: 'fixed',
              left: `${finalLeft}px`,
              top: `${finalTop}px`, // 60px над текстом
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '4px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 10000,
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => {
              // Запобігти blur при кліку на toolbar
              e.preventDefault();
              console.log('🖱️ [WysiwygEditor] Toolbar clicked, preventing blur');
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
        );
      })()}

      <div onBlur={handleBlur}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default WysiwygEditor;