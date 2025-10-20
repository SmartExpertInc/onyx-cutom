// components/editors/WysiwygEditor.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextStyleDropdown, setShowTextStyleDropdown] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [currentTextStyle, setCurrentTextStyle] = useState('Normal text');
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const textStyleDropdownRef = useRef<HTMLDivElement>(null);

  const cleanedStyle = { ...style };
  delete cleanedStyle.fontWeight;
  delete cleanedStyle.fontStyle;

  const textStyles = [
    { label: 'Small text', value: 'small', action: () => editor?.chain().focus().setParagraph().run() },
    { label: 'Normal text', value: 'normal', action: () => editor?.chain().focus().setParagraph().run() },
    { label: 'Large text', value: 'large', action: () => editor?.chain().focus().setParagraph().run() },
    { label: 'Heading 4', value: 'h4', action: () => editor?.chain().focus().setHeading({ level: 4 }).run() },
    { label: 'Heading 3', value: 'h3', action: () => editor?.chain().focus().setHeading({ level: 3 }).run() },
    { label: 'Heading 2', value: 'h2', action: () => editor?.chain().focus().setHeading({ level: 2 }).run() },
    { label: 'Heading 1', value: 'h1', action: () => editor?.chain().focus().setHeading({ level: 1 }).run() },
  ];

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
      const { empty } = editor.state.selection;
      setShowToolbar(!empty);
      
      // Отримати поточний колір
      const currentColor = editor.getAttributes('textStyle').color || '#000000';
      setSelectedColor(currentColor);

      // Визначити поточний стиль тексту
      if (editor.isActive('heading', { level: 1 })) {
        setCurrentTextStyle('Heading 1');
      } else if (editor.isActive('heading', { level: 2 })) {
        setCurrentTextStyle('Heading 2');
      } else if (editor.isActive('heading', { level: 3 })) {
        setCurrentTextStyle('Heading 3');
      } else if (editor.isActive('heading', { level: 4 })) {
        setCurrentTextStyle('Heading 4');
      } else {
        setCurrentTextStyle('Normal text');
      }
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
        if (showColorPicker) {
          setShowColorPicker(false);
        } else if (showTextStyleDropdown) {
          setShowTextStyleDropdown(false);
        } else {
          editor.commands.blur();
          onCancel();
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('keydown', handleKeyDown);

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, onCancel, showColorPicker, showTextStyleDropdown]);

  // Закрити dropdowns при кліку поза ними
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (textStyleDropdownRef.current && !textStyleDropdownRef.current.contains(e.target as Node)) {
        setShowTextStyleDropdown(false);
      }
    };

    if (showColorPicker || showTextStyleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker, showTextStyleDropdown]);

  const handleBlur = () => {
    if (editor) {
      const html = editor.getHTML();
      const cleanHtml = html.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
      onSave(cleanHtml);
    }
    setShowToolbar(false);
    setShowColorPicker(false);
    setShowTextStyleDropdown(false);
  };

  const applyColor = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setSelectedColor(color);
    }
  };

  const predefinedColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
    '#888888', '#444444', '#ff6b6b', '#4ecdc4', '#45b7d1',
  ];

  if (!editor) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%',
        paddingTop: '50px'
      }}
    >
      {showToolbar && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '50%',
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
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Text Style Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowTextStyleDropdown(!showTextStyleDropdown);
              }}
              style={{
                minWidth: '120px',
                height: '32px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                transition: 'all 0.2s ease',
              }}
              title="Text Style"
            >
              <span>{currentTextStyle}</span>
              <span style={{ marginLeft: '4px', fontSize: '10px' }}>▼</span>
            </button>

            {/* Text Style Dropdown Menu */}
            {showTextStyleDropdown && (
              <div
                ref={textStyleDropdownRef}
                style={{
                  position: 'absolute',
                  top: '38px',
                  left: '0',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 10001,
                  minWidth: '160px',
                  overflow: 'hidden',
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {textStyles.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      style.action();
                      setCurrentTextStyle(style.label);
                      setShowTextStyleDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: currentTextStyle === style.label ? '#f3f4f6' : 'white',
                      color: '#374151',
                      fontSize: style.value.startsWith('h') ? 
                        (style.value === 'h1' ? '18px' : 
                         style.value === 'h2' ? '16px' : 
                         style.value === 'h3' ? '15px' : '14px') : 
                        (style.value === 'small' ? '12px' : 
                         style.value === 'large' ? '16px' : '14px'),
                      fontWeight: style.value.startsWith('h') ? 'bold' : 'normal',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => {
                      if (currentTextStyle !== style.label) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentTextStyle !== style.label) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bold */}
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
            title="Bold (Ctrl+B)"
          >
            B
          </button>

          {/* Italic */}
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
            title="Italic (Ctrl+I)"
          >
            I
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: editor.isActive('underline') ? '#3b82f6' : 'white',
              color: editor.isActive('underline') ? 'white' : '#374151',
              textDecoration: 'underline',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Underline (Ctrl+U)"
          >
            U
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleStrike().run();
            }}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: editor.isActive('strike') ? '#3b82f6' : 'white',
              color: editor.isActive('strike') ? 'white' : '#374151',
              textDecoration: 'line-through',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Strikethrough"
          >
            S
          </button>

          {/* Color Picker Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowColorPicker(!showColorPicker);
              }}
              style={{
                width: '32px',
                height: '32px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              title="Text Color"
            >
              <span style={{ 
                fontSize: '16px',
                color: selectedColor,
                fontWeight: 'bold'
              }}>
                A
              </span>
              <span style={{
                position: 'absolute',
                bottom: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '3px',
                backgroundColor: selectedColor,
                borderRadius: '1px',
              }}></span>
            </button>

            {/* Color Picker Dropdown */}
            {showColorPicker && (
              <div
                ref={colorPickerRef}
                style={{
                  position: 'absolute',
                  top: '38px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 10001,
                  width: '180px',
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* Predefined Colors */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px',
                  marginBottom: '8px',
                }}>
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyColor(color);
                      }}
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: color,
                        border: selectedColor === color ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Custom Color Input */}
                <div style={{ marginTop: '8px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px',
                  }}>
                    Custom color:
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => {
                      applyColor(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      height: '32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div onBlur={handleBlur}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default WysiwygEditor;