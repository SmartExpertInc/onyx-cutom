// components/editors/WysiwygEditor.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { ArrowDownIcon, ChevronDownIcon, Sparkles } from 'lucide-react';

export interface WysiwygEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  toolbarAbove?: boolean; // If true, toolbar appears above the editor; if false, below
}

export function WysiwygEditor({
  initialValue,
  onSave,
  onCancel,
  placeholder = '',
  className = '',
  style = {},
  toolbarAbove = true // Default to above for backward compatibility
}: WysiwygEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextStyleDropdown, setShowTextStyleDropdown] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [currentTextStyle, setCurrentTextStyle] = useState('Normal text');
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const textStyleDropdownRef = useRef<HTMLDivElement>(null);
  const hasInitiallySelectedRef = useRef(false); // Track if we've done initial select all

  const cleanedStyle = { ...style };
  delete cleanedStyle.fontWeight;
  delete cleanedStyle.fontStyle;

  const getCurrentTextColor = () => {
    if (!editor) return '#000000';
    
    // Try to get color from editor attributes first
    const editorColor = editor.getAttributes('textStyle').color;
    if (editorColor) return editorColor;
    
    // Try to get from component styles
    if (style.color) return style.color;
    if (cleanedStyle.color) return cleanedStyle.color;
    
    // Try to get from computed styles of the editor element
    try {
      const editorElement = editor.view.dom;
      if (editorElement) {
        const computedStyle = window.getComputedStyle(editorElement);
        const computedColor = computedStyle.color;
        if (computedColor && computedColor !== 'rgb(0, 0, 0)') {
          // Convert rgb to hex if needed
          const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          }
          return computedColor;
        }
      }
    } catch (e) {
      console.warn('Could not get computed color:', e);
    }
    
    return '#000000';
  };

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
    onSelectionUpdate: ({ editor }: { editor: any }) => {
      const { empty } = editor.state.selection;
      setShowToolbar(!empty);
      
      // Отримати поточний колір
      const currentColor = getCurrentTextColor();
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
    onBlur: ({ editor: editorInstance }: { editor: any }) => {
      // Handle blur directly from TipTap editor
      // Save content when editor loses focus (click outside)
      if (editorInstance) {
        const html = editorInstance.getHTML();
        const cleanHtml = html.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
        onSave(cleanHtml);
      }
      setShowToolbar(false);
      setShowColorPicker(false);
      setShowTextStyleDropdown(false);
    },
  });

  useEffect(() => {
    if (editor && !hasInitiallySelectedRef.current) {
      // Use setTimeout to ensure the editor DOM is ready before focusing
      // This prevents issues with cursor positioning
      const timeoutId = setTimeout(() => {
        // On initial focus, select all text (like standard input behavior)
        // This allows user to immediately start typing to replace all text
        // After this initial selection, user can click/select text normally
        // TipTap will handle normal text selection after this initial selectAll
        editor.commands.focus();
        editor.commands.selectAll();
        hasInitiallySelectedRef.current = true;
        
        // Set initial color from editor content or CSS styles
        const initialColor = getCurrentTextColor();
        setSelectedColor(initialColor);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [editor]); // Only depend on editor, not style/cleanedStyle to avoid re-running

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
        width: '100%'
      }}
    >
      {showToolbar && (
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            backgroundColor: 'white',
            borderRadius: '6px',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000000,
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Color Picker Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                // Update color before showing picker
                const currentColor = getCurrentTextColor();
                setSelectedColor(currentColor);
                setShowColorPicker(!showColorPicker);
              }}
              style={{
                width: '25px',
                height: '25px',
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
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: selectedColor,
                borderRadius: '3px',
                border: '1px solid #434343'
              }}></div>
            </button>


            {/* Color Picker Dropdown */}
            {showColorPicker && (
              <div
                ref={colorPickerRef}
                style={{
                  position: 'absolute',
                  ...(toolbarAbove ? { top: '38px' } : { bottom: '38px' }),
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
          <div style={{ width: '1px', height: '20px', backgroundColor: '#E0E0E0', margin: '0 8px' }} />
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
                height: '25px',
                border: '1px solid rgb(0, 0, 0)',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                transition: 'all 0.2s ease',
                fontFamily: 'Public Sans, sans-serif'
              }}
              title="Text Style"
              className='public-sans-font'
            >
              <span>{currentTextStyle}</span>
              <span style={{ marginLeft: '4px' }}><ChevronDownIcon size={16} /></span>
            </button>

            {/* Text Style Dropdown Menu */}
            {showTextStyleDropdown && (
              <div
                ref={textStyleDropdownRef}
                style={{
                  position: 'absolute',
                  ...(toolbarAbove ? { top: '38px' } : { bottom: '38px' }),
                  left: '0',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 10001,
                  minWidth: '150px',
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
                      fontFamily: 'Public Sans, sans-serif'
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
                    className='public-sans-font'
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>
           <div>
             <input
               type="text"
               defaultValue="120"
               style={{
                 width: '40px',
                 height: '25px',
                 border: '1px solid rgb(0, 0, 0)',
                 borderRadius: '6px',
                 padding: '0 8px',
                 fontSize: '14px',
                 textAlign: 'center',
                 backgroundColor: 'white',
                 outline: 'none',
                 color: 'black',
                 fontFamily: 'Public Sans, sans-serif'
               }}
               title="Font Size"
               className='public-sans-font'
             />
           </div>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#E0E0E0', margin: '0 8px' }} />
          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            style={{
              width: '20px',
              height: '25px',
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
            <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.33333 7.00911C7.04058 7.00911 7.71885 6.72816 8.21895 6.22807C8.71905 5.72797 9 5.04969 9 4.34245C9 3.6352 8.71905 2.95693 8.21895 2.45683C7.71885 1.95673 7.04058 1.67578 6.33333 1.67578H1V7.00911M1 7.00911H7C7.70724 7.00911 8.38552 7.29007 8.88562 7.79016C9.38571 8.29026 9.66667 8.96854 9.66667 9.67578C9.66667 10.383 9.38571 11.0613 8.88562 11.5614C8.38552 12.0615 7.70724 12.3424 7 12.3424H1V7.00911Z" stroke="#09090B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            style={{
              width: '20px',
              height: '25px',
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
            <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75852 1.57113C3.75852 1.19834 4.07271 0.898438 4.46324 0.898438H10.5708C10.9614 0.898438 11.2756 1.19834 11.2756 1.57113C11.2756 1.94391 10.9614 2.24382 10.5708 2.24382H8.55356L4.24889 12.1099H6.81231C7.20285 12.1099 7.51703 12.4098 7.51703 12.7826C7.51703 13.1554 7.20285 13.4553 6.81231 13.4553H0.704722C0.314189 13.4553 0 13.1554 0 12.7826C0 12.4098 0.314189 12.1099 0.704722 12.1099H2.72199L7.02667 2.24382H4.46324C4.07271 2.24382 3.75852 1.94391 3.75852 1.57113Z" fill="#434343"/>
            </svg>
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            style={{
              width: '20px',
              height: '25px',
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
            <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.439307 1.57113C0.439307 1.19834 0.733094 0.898438 1.09827 0.898438H3.73411C4.09929 0.898438 4.39307 1.19834 4.39307 1.57113C4.39307 1.94391 4.09929 2.24382 3.73411 2.24382H3.07515V6.27995C3.07515 8.01493 4.45073 9.41917 6.1503 9.41917C7.84987 9.41917 9.22545 8.01493 9.22545 6.27995V2.24382H8.56649C8.20132 2.24382 7.90753 1.94391 7.90753 1.57113C7.90753 1.19834 8.20132 0.898438 8.56649 0.898438H11.2023C11.5675 0.898438 11.8613 1.19834 11.8613 1.57113C11.8613 1.94391 11.5675 2.24382 11.2023 2.24382H10.5434V6.27995C10.5434 8.75769 8.57747 10.7645 6.1503 10.7645C3.72313 10.7645 1.75723 8.75769 1.75723 6.27995V2.24382H1.09827C0.733094 2.24382 0.439307 1.94391 0.439307 1.57113ZM0 12.7826C0 12.4098 0.293787 12.1099 0.658961 12.1099H11.6416C12.0068 12.1099 12.3006 12.4098 12.3006 12.7826C12.3006 13.1554 12.0068 13.4553 11.6416 13.4553H0.658961C0.293787 13.4553 0 13.1554 0 12.7826Z" fill="#434343"/>
            </svg>
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleStrike().run();
            }}
            style={{
              width: '20px',
              height: '25px',
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

           <div style={{ width: '1px', height: '20px', backgroundColor: '#E0E0E0', margin: '0 8px' }} />
            <div style={{ display: 'flex', gap: '4px', height: '25px',padding: '0 10px', marginTop: '3px' }}>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.658961 1.12109C0.293787 1.12109 0 1.421 0 1.79378C0 2.16656 0.293787 2.46647 0.658961 2.46647H7.24857C7.61374 2.46647 7.90753 2.16656 7.90753 1.79378C7.90753 1.421 7.61374 1.12109 7.24857 1.12109H0.658961ZM0.658961 4.70877C0.293787 4.70877 0 5.00868 0 5.38146C0 5.75424 0.293787 6.05415 0.658961 6.05415H11.6416C12.0068 6.05415 12.3006 5.75424 12.3006 5.38146C12.3006 5.00868 12.0068 4.70877 11.6416 4.70877H0.658961ZM0 8.96913C0 9.34192 0.293787 9.64182 0.658961 9.64182H7.24857C7.61374 9.64182 7.90753 9.34192 7.90753 8.96913C7.90753 8.59635 7.61374 8.29644 7.24857 8.29644H0.658961C0.293787 8.29644 0 8.59635 0 8.96913ZM0.658961 11.8841C0.293787 11.8841 0 12.184 0 12.5568C0 12.9296 0.293787 13.2295 0.658961 13.2295H11.6416C12.0068 13.2295 12.3006 12.9296 12.3006 12.5568C12.3006 12.184 12.0068 11.8841 11.6416 11.8841H0.658961Z" fill="#434343"/>
              </svg>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.2948 1.12109C2.92963 1.12109 2.63584 1.421 2.63584 1.79378C2.63584 2.16656 2.92963 2.46647 3.2948 2.46647H9.0058C9.37097 2.46647 9.66476 2.16656 9.66476 1.79378C9.66476 1.421 9.37097 1.12109 9.0058 1.12109H3.2948ZM0.658961 4.70877C0.293787 4.70877 0 5.00868 0 5.38146C0 5.75424 0.293787 6.05415 0.658961 6.05415H11.6416C12.0068 6.05415 12.3006 5.75424 12.3006 5.38146C12.3006 5.00868 12.0068 4.70877 11.6416 4.70877H0.658961ZM2.63584 8.96913C2.63584 9.34192 2.92963 9.64182 3.2948 9.64182H9.0058C9.37097 9.64182 9.66476 9.34192 9.66476 8.96913C9.66476 8.59635 9.37097 8.29644 9.0058 8.29644H3.2948C2.92963 8.29644 2.63584 8.59635 2.63584 8.96913ZM0.658961 11.8841C0.293787 11.8841 0 12.184 0 12.5568C0 12.9296 0.293787 13.2295 0.658961 13.2295H11.6416C12.0068 13.2295 12.3006 12.9296 12.3006 12.5568C12.3006 12.184 12.0068 11.8841 11.6416 11.8841H0.658961Z" fill="#434343"/>
              </svg>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6426 1.12109C12.0078 1.12109 12.3016 1.421 12.3016 1.79378C12.3016 2.16656 12.0078 2.46647 11.6426 2.46647H5.05301C4.68784 2.46647 4.39405 2.16656 4.39405 1.79378C4.39405 1.421 4.68784 1.12109 5.05301 1.12109H11.6426ZM11.6426 4.70877C12.0078 4.70877 12.3016 5.00868 12.3016 5.38146C12.3016 5.75424 12.0078 6.05415 11.6426 6.05415H0.659937C0.294763 6.05415 0.000976562 5.75424 0.000976562 5.38146C0.000976562 5.00868 0.294763 4.70877 0.659937 4.70877H11.6426ZM12.3016 8.96913C12.3016 9.34192 12.0078 9.64182 11.6426 9.64182H5.05301C4.68784 9.64182 4.39405 9.34192 4.39405 8.96913C4.39405 8.59635 4.68784 8.29644 5.05301 8.29644H11.6426C12.0078 8.29644 12.3016 8.59635 12.3016 8.96913ZM11.6426 11.8841C12.0078 11.8841 12.3016 12.184 12.3016 12.5568C12.3016 12.9296 12.0078 13.2295 11.6426 13.2295H0.659937C0.294763 13.2295 0.000976562 12.9296 0.000976562 12.5568C0.000976562 12.184 0.294763 11.8841 0.659937 11.8841H11.6426Z" fill="#434343"/>
              </svg>
            </div>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#E0E0E0', margin: '0 8px' }} />
            <div style={{ display: 'flex', gap: '4px', height: '25px',padding: '0 10px', marginTop: '3px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_396_47086)">
              <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M0 0H3.2V3.2H0V0ZM6.4 3.2H3.2V6.4H0V9.6H3.2V12.8H0V16H3.2V12.8H6.4V16H9.6V12.8H12.8V16H16V12.8H12.8V9.6H16V6.4H12.8V3.2H16V0H12.8V3.2H9.6V0H6.4V3.2ZM6.4 6.4V3.2H9.6V6.4H6.4ZM6.4 9.6H3.2V6.4H6.4V9.6ZM9.6 9.6V6.4H12.8V9.6H9.6ZM9.6 9.6H6.4V12.8H9.6V9.6Z" fill="url(#paint0_linear_396_47086)"/>
              </g>
              <defs>
              <linearGradient id="paint0_linear_396_47086" x1="0.269531" y1="10.6673" x2="17.2695" y2="10.6673" gradientUnits="userSpaceOnUse">
              <stop stop-color="#09090B"/>
              <stop offset="1" stop-color="#434343"/>
              </linearGradient>
              <clipPath id="clip0_396_47086">
              <rect width="16" height="16" fill="white"/>
              </clipPath>
              </defs>
              </svg>
            </div>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#E0E0E0', margin: '0 8px' }} />
          {/* Animate Button */}
          <button
            type="button"
            style={{
              height: '25px',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 10px',
              transition: 'all 0.2s ease',
              gap: '6px',
              fontFamily: 'Public Sans, sans-serif'
            }}
            title="Animate"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_396_47258)">
            <path d="M1 13.8125H7.88103" stroke="#434343" stroke-width="1.18639" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.627 13.8125H14.9997" stroke="#434343" stroke-width="1.18639" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.06822 14.9978C9.72344 14.9978 10.2546 14.4666 10.2546 13.8114C10.2546 13.1562 9.72344 12.625 9.06822 12.625C8.413 12.625 7.88184 13.1562 7.88184 13.8114C7.88184 14.4666 8.413 14.9978 9.06822 14.9978Z" stroke="#434343" stroke-width="1.18639" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.9993 8.11831C14.9993 9.42876 13.937 10.4911 12.6266 10.4911H3.37277C2.06232 10.4911 1 9.42876 1 8.11831V3.37277C1 2.06232 2.06232 1 3.37277 1H12.6266C13.937 1 14.9993 2.06232 14.9993 3.37277V8.11831Z" stroke="#434343" stroke-width="1.18639" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.37305 5.74498C4.6835 5.74498 5.74582 6.8073 5.74582 8.11775C5.74582 6.15209 7.33931 4.55859 9.30497 4.55859H10.2541" stroke="#434343" stroke-width="1.18639" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11.4403 5.74777C12.0955 5.74777 12.6267 5.21661 12.6267 4.56139C12.6267 3.90616 12.0955 3.375 11.4403 3.375C10.7851 3.375 10.2539 3.90616 10.2539 4.56139C10.2539 5.21661 10.7851 5.74777 11.4403 5.74777Z" stroke="#434343" stroke-width="1.18639" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_396_47258">
            <rect width="16" height="16" fill="white"/>
            </clipPath>
            </defs>
            </svg>
            <span className='public-sans-font' style={{ fontSize: '12px', color: '#434343' }}>Animate</span>
          </button>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#E0E0E0', margin: '0 8px' }} />
          {/* Sparkle Button with Arrow */}
          <button
            type="button"
            style={{
              height: '25px',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 8px',
              transition: 'all 0.2s ease',
              gap: '4px',
            }}
            title="Effects"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.1794 2.38805C9.05327 2.4357 8.96919 2.55622 8.96919 2.69076C8.96919 2.82529 9.05327 2.94582 9.1794 2.99347L10.763 3.58768L11.3572 5.1713C11.4049 5.29743 11.5254 5.38151 11.6599 5.38151C11.7945 5.38151 11.915 5.29743 11.9627 5.1713L12.5569 3.58768L14.1405 2.99347C14.2666 2.94582 14.3507 2.82529 14.3507 2.69076C14.3507 2.55622 14.2666 2.4357 14.1405 2.38805L12.5569 1.79384L11.9627 0.210215C11.915 0.0840861 11.7945 0 11.6599 0C11.5254 0 11.4049 0.0840861 11.3572 0.210215L10.763 1.79384L9.1794 2.38805ZM5.74869 2.0545C5.67581 1.89474 5.51605 1.79384 5.34227 1.79384C5.1685 1.79384 5.00873 1.89474 4.93586 2.0545L3.45594 5.24978L0.260667 6.72689C0.100903 6.79977 0 6.95953 0 7.13611C0 7.31269 0.100903 7.46965 0.260667 7.54253L3.45874 9.01964L4.93305 12.2149C5.00593 12.3747 5.16569 12.4756 5.33947 12.4756C5.51325 12.4756 5.67301 12.3747 5.74589 12.2149L7.223 9.01684L10.4211 7.53972C10.5808 7.46685 10.6817 7.30709 10.6817 7.13331C10.6817 6.95953 10.5808 6.79977 10.4211 6.72689L7.2258 5.25258L5.74869 2.0545ZM10.763 10.763L9.1794 11.3572C9.05327 11.4049 8.96919 11.5254 8.96919 11.6599C8.96919 11.7945 9.05327 11.915 9.1794 11.9627L10.763 12.5569L11.3572 14.1405C11.4049 14.2666 11.5254 14.3507 11.6599 14.3507C11.7945 14.3507 11.915 14.2666 11.9627 14.1405L12.5569 12.5569L14.1405 11.9627C14.2666 11.915 14.3507 11.7945 14.3507 11.6599C14.3507 11.5254 14.2666 11.4049 14.1405 11.3572L12.5569 10.763L11.9627 9.1794C11.915 9.05327 11.7945 8.96919 11.6599 8.96919C11.5254 8.96919 11.4049 9.05327 11.3572 9.1794L10.763 10.763Z" fill="#4D4D4D"/>
            </svg>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#4D4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      <div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default WysiwygEditor;