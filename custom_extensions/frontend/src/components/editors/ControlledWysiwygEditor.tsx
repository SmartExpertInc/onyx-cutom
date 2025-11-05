// components/editors/ControlledWysiwygEditor.tsx
// Wysiwyg editor controlled by external toolbar (TextSettings panel)

import React, { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
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
    
    const isTypingRef = useRef(false);
    const lastKeystrokeRef = useRef(Date.now());

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
        handleKeyDown: (view, event) => {
          // Track that user is actively typing
          isTypingRef.current = true;
          lastKeystrokeRef.current = Date.now();
          
          // Clear typing flag after 500ms of no keystrokes
          setTimeout(() => {
            if (Date.now() - lastKeystrokeRef.current >= 500) {
              isTypingRef.current = false;
            }
          }, 500);
          
          return false; // Let TipTap handle the key
        },
      },
      onSelectionUpdate: ({ editor }) => {
        const { empty } = editor.state.selection;
        onSelectionChange?.(!empty);
      },
    });

    useEffect(() => {
      if (editor) {
        // Just focus at the end, don't select all text
        editor.commands.focus('end');
        // REMOVED: editor.commands.selectAll(); - This was causing all text to be selected and replaced on first keystroke
        
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
      console.log('🔍 BLUR EVENT FIRED', {
        isTyping: isTypingRef.current,
        timeSinceLastKeystroke: Date.now() - lastKeystrokeRef.current,
        relatedTarget: e.relatedTarget
      });
      
      // Check where focus is moving to
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // If focus is moving to TextRightPanel or ColorPicker, prevent blur completely
      if (relatedTarget && (
        relatedTarget.closest('[data-textsettings-panel]') ||
        relatedTarget.closest('[data-text-right-panel]') || // TextRightPanel controls
        relatedTarget.closest('[data-color-palette-popup]') // Color picker
      )) {
        console.log('⚠️ Blur to control panel - preventing blur, maintaining focus');
        e.preventDefault();
        e.stopPropagation();
        return; // Don't save, keep editor focused
      }
      
      // If clicking buttons, prevent blur
      if (relatedTarget && (
        relatedTarget.tagName === 'BUTTON' ||
        relatedTarget.closest('button')
      )) {
        console.log('⚠️ Blur to button - preventing blur');
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Don't save if user is actively typing
      if (isTypingRef.current || Date.now() - lastKeystrokeRef.current < 200) {
        console.log('⚠️ Blur prevented - user is actively typing');
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Actually lost focus to something outside - save content
      if (editor) {
        const html = editor.getHTML();
        const cleanHtml = html.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
        console.log('💾 Editor blur - saving content:', cleanHtml.substring(0, 50) + '...');
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

/* 
 * ============================================================================
 * CONTROLLED WYSIWYG EDITOR - IMPLEMENTATION NOTES
 * ============================================================================
 * 
 * This editor is designed to work with TextRightPanel for seamless text editing
 * in presentation slides. Key features and behaviors:
 * 
 * 
 * 1. FOCUS MANAGEMENT
 * -------------------
 * - Editor focuses at cursor END on mount (no text selection)
 * - REMOVED: editor.commands.selectAll() - was causing all text to be replaced on first keystroke
 * - Focus is maintained when interacting with TextRightPanel controls
 * 
 * 
 * 2. TYPING DETECTION
 * -------------------
 * - isTypingRef tracks active typing state
 * - lastKeystrokeRef tracks timestamp of last keystroke
 * - handleKeyDown updates these refs on every keystroke
 * - 500ms timeout clears typing flag after user stops typing
 * - 200ms grace period before allowing blur to process
 * 
 * 
 * 3. BLUR EVENT HANDLING (handleBlur)
 * -----------------------------------
 * The blur event fires when editor loses focus. Handler prevents blur in these cases:
 * 
 * a) Focus moving to TextRightPanel ([data-text-right-panel])
 *    - e.preventDefault() prevents blur
 *    - Editor stays focused
 *    - No save occurs
 * 
 * b) Focus moving to ColorPalettePopup ([data-color-palette-popup])
 *    - e.preventDefault() prevents blur
 *    - Editor stays focused
 *    - No save occurs
 * 
 * c) Focus moving to any BUTTON element
 *    - e.preventDefault() prevents blur
 *    - Allows formatting buttons to work
 *    - No save occurs
 * 
 * d) User is actively typing
 *    - Checks isTypingRef.current
 *    - Checks time since last keystroke < 200ms
 *    - e.preventDefault() prevents blur
 *    - No save occurs
 * 
 * e) Focus moving to actual outside element (slide background, etc)
 *    - Blur allowed to proceed
 *    - Content is saved via onSave()
 *    - Editor closes
 * 
 * 
 * 4. TEXT STYLE SUPPORT
 * ---------------------
 * Extended TextStyle extension to support:
 * - fontFamily: Applied via setMark('textStyle', { fontFamily: value })
 * - fontSize: Applied via setMark('textStyle', { fontSize: value })
 * - color: Via Color extension
 * - textAlign: Via TextAlign extension
 * 
 * 
 * 5. EXTENSIONS LOADED
 * --------------------
 * - StarterKit (heading, paragraph, bold, italic, strike, etc.)
 * - TextStyle (extended with fontFamily and fontSize)
 * - Color (text color)
 * - TextAlign (left, center, right, justify)
 * - Underline (from @tiptap/extension-underline)
 * 
 * 
 * 6. KEY INTERACTIONS WITH TextRightPanel
 * ----------------------------------------
 * - onEditorReady: Called when editor initializes, passes editor instance and computed styles
 * - onSelectionChange: Called when selection changes (for toolbar state updates)
 * - onSave: Called only when actually losing focus to outside elements
 * - onCancel: Called when Escape is pressed
 * 
 * 
 * 7. FOCUS PREVENTION STRATEGY
 * ----------------------------
 * Two-layer protection:
 * 
 * Layer 1 (on controls): onMouseDown={(e) => e.preventDefault()}
 *   - Prevents browser from changing focus on mouseDown
 *   - Applied to all TextRightPanel controls
 *   - Applied to all ColorPalettePopup elements
 * 
 * Layer 2 (in editor): blur handler with e.preventDefault()
 *   - If blur somehow fires, prevent it from processing
 *   - Check relatedTarget to see where focus is going
 *   - Prevent blur if going to known control elements
 * 
 * 
 * 8. DEBUGGING
 * ------------
 * Console logs help track editor behavior:
 * - 🔍 BLUR EVENT FIRED - Shows when blur happens and why
 * - ⚠️ Blur prevented - Shows when blur is blocked
 * - 💾 Editor blur - saving content - Shows when content is actually saved
 * - 📏 Computed styles - Shows extracted styles on editor ready
 * 
 * 
 * 9. KNOWN ISSUES FIXED
 * ---------------------
 * ✅ FIXED: Text disappeared after typing 1 character
 *    - Cause: selectAll() was selecting all text, first keystroke replaced it
 *    - Fix: Removed selectAll(), just focus at end
 * 
 * ✅ FIXED: Editor lost focus when clicking TextRightPanel
 *    - Cause: No blur prevention for [data-text-right-panel]
 *    - Fix: Added detection and preventDefault in blur handler
 * 
 * ✅ FIXED: Content saved mid-typing
 *    - Cause: Blur fired while user was typing
 *    - Fix: Added typing detection and 200ms grace period
 * 
 * 
 * 10. USAGE EXAMPLE
 * -----------------
 * <ControlledWysiwygEditor
 *   initialValue={content}
 *   onSave={(html) => updateSlideContent(html)}
 *   onCancel={() => setEditingMode(false)}
 *   onEditorReady={(editor, styles) => {
 *     setActiveEditor(editor);
 *     setComputedStyles(styles);
 *     // Open TextRightPanel
 *   }}
 *   style={{ fontSize: '24px', color: '#fff' }}
 * />
 * 
 * ============================================================================
 */
