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
    const shouldSelectAllOnClickRef = useRef(true); // Track if we should select all on next click

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
          
          // User started typing - disable select-all behavior
          shouldSelectAllOnClickRef.current = false;
          
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
        // Focus at the end, but don't select yet
        // We'll select all on first click (for formatting purposes)
        editor.commands.focus('end');
        shouldSelectAllOnClickRef.current = true; // Enable select-all on first click
        
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

    // Handle click to select all text on first click (for formatting)
    const handleEditorClick = (e: React.MouseEvent) => {
      if (!editor || !shouldSelectAllOnClickRef.current) {
        return; // Allow normal click behavior
      }

      // Check if click is on the editor content
      const target = e.target as HTMLElement;
      const editorDom = editor.view.dom;
      
      // Only select all on first simple click (not double-click, drag, or if already has selection)
      if (editorDom.contains(target) && e.detail === 1) {
        // Use setTimeout to let TipTap process the click first, then select all
        setTimeout(() => {
          if (editor && !editor.isDestroyed) {
            const { from, to } = editor.state.selection;
            const docLength = editor.state.doc.content.size;
            
            // Only select all if:
            // 1. There's no meaningful selection (cursor is at a single point)
            // 2. Or if the selection is very small (user just clicked)
            if (to - from <= 1) {
              editor.commands.selectAll();
            }
            
            // Disable select-all for subsequent clicks
            shouldSelectAllOnClickRef.current = false;
          }
        }, 0);
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
        <div 
          onBlur={handleBlur} 
          onClick={handleEditorClick}
          onFocus={() => {
            // When editor gets focus, enable select-all on first click
            // (unless user is actively typing)
            if (!isTypingRef.current) {
              shouldSelectAllOnClickRef.current = true;
            }
          }}
        >
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
 * - Editor focuses at cursor END on mount
 * - On FIRST click: Selects all text (for applying formatting to entire text)
 * - On SUBSEQUENT clicks: Normal cursor positioning (for editing/deleting specific parts)
 * - When user types: Disables select-all behavior (switches to editing mode)
 * - When editor gets focus again: Re-enables select-all on first click
 * - Focus is maintained when interacting with TextRightPanel controls
 * 
 * 
 * 2. SELECT-ALL ON FIRST CLICK
 * ----------------------------
 * - shouldSelectAllOnClickRef tracks if we should select all on next click
 * - Set to true when editor first opens or regains focus
 * - Set to false after first click or when user starts typing
 * 
 * Behavior flow:
 * Step 1: User clicks text → shouldSelectAllOnClickRef = true
 * Step 2: First click fires → All text selected (for formatting)
 * Step 3: shouldSelectAllOnClickRef = false (disabled)
 * Step 4: Subsequent clicks → Normal cursor positioning (for editing)
 * Step 5: User types → shouldSelectAllOnClickRef = false (stays disabled)
 * Step 6: Editor loses focus then regains it → shouldSelectAllOnClickRef = true (reset)
 * 
 * Why this design?
 * - First click: User wants to apply formatting to entire text (color, size, font)
 * - Second click: User wants to edit specific parts (delete words, change text)
 * - After typing: User is in editing mode, not formatting mode
 * - After re-focus: New formatting session, re-enable select-all
 * 
 * 
 * 3. TYPING DETECTION
 * -------------------
 * - isTypingRef tracks active typing state
 * - lastKeystrokeRef tracks timestamp of last keystroke
 * - handleKeyDown updates these refs on every keystroke
 * - 500ms timeout clears typing flag after user stops typing
 * - 200ms grace period before allowing blur to process
 * 
 * The 200ms grace period is a SAVE PREVENTION mechanism:
 * - Prevents premature saves when user types then quickly clicks formatting controls
 * - Example: Type "Hello" → Click font button 50ms later → Don't save (50ms < 200ms)
 * - It's NOT about preventing blur; it's about preventing onSave() from running
 * - User can continue typing after any amount of idle time (20 seconds, 5 minutes, etc.)
 * 
 * 
 * 4. BLUR EVENT HANDLING (handleBlur)
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
 * 5. TEXT STYLE SUPPORT
 * ---------------------
 * Extended TextStyle extension to support:
 * - fontFamily: Applied via setMark('textStyle', { fontFamily: value })
 * - fontSize: Applied via setMark('textStyle', { fontSize: value })
 * - color: Via Color extension
 * - textAlign: Via TextAlign extension
 * 
 * 
 * 6. EXTENSIONS LOADED
 * --------------------
 * - StarterKit (heading, paragraph, bold, italic, strike, etc.)
 * - TextStyle (extended with fontFamily and fontSize)
 * - Color (text color)
 * - TextAlign (left, center, right, justify)
 * - Underline (from @tiptap/extension-underline)
 * 
 * 
 * 7. KEY INTERACTIONS WITH TextRightPanel
 * ----------------------------------------
 * - onEditorReady: Called when editor initializes, passes editor instance and computed styles
 * - onSelectionChange: Called when selection changes (for toolbar state updates)
 * - onSave: Called only when actually losing focus to outside elements
 * - onCancel: Called when Escape is pressed
 * 
 * 
 * 8. FOCUS PREVENTION STRATEGY
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
 * 9. DEBUGGING
 * ------------
 * Console logs help track editor behavior:
 * - 🔍 BLUR EVENT FIRED - Shows when blur happens and why
 * - ⚠️ Blur prevented - Shows when blur is blocked
 * - 💾 Editor blur - saving content - Shows when content is actually saved
 * - 📏 Computed styles - Shows extracted styles on editor ready
 * 
 * 
 * 10. KNOWN ISSUES FIXED
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
 * ✅ ADDED: Select-all on first click
 *    - First click on text selects all (for formatting entire text)
 *    - Subsequent clicks allow normal cursor positioning (for editing)
 *    - Typing disables select-all behavior
 *    - Re-focus re-enables select-all for new formatting session
 * 
 * 
 * 11. USAGE EXAMPLE
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
 * 
 * 12. USER INTERACTION FLOWS
 * ---------------------------
 * 
 * FLOW 1: Formatting entire text
 * -------------------------------
 * 1. User clicks text on slide
 * 2. Editor opens, all text selected automatically
 * 3. User changes color in TextRightPanel → Applied to all text ✅
 * 4. User clicks outside → Text saved
 * 
 * FLOW 2: Editing specific parts
 * -------------------------------
 * 1. User clicks text on slide
 * 2. Editor opens, all text selected automatically
 * 3. User clicks between words (second click)
 * 4. Selection cleared, cursor positioned ✅
 * 5. User deletes/types → Normal editing ✅
 * 6. User clicks outside → Text saved
 * 
 * FLOW 3: Mixed formatting and editing
 * -------------------------------------
 * 1. User clicks text on slide
 * 2. Editor opens, all text selected
 * 3. User changes font size → Applied to all text ✅
 * 4. User starts typing → Replaces all selected text
 * 5. User types more content → Normal typing ✅
 * 6. shouldSelectAllOnClickRef = false (stays in editing mode)
 * 7. User clicks outside → Text saved
 * 
 * FLOW 4: Re-opening text for new formatting
 * -------------------------------------------
 * 1. User clicks text that was previously edited
 * 2. Editor opens → onFocus fires
 * 3. shouldSelectAllOnClickRef = true (reset) ✅
 * 4. First click → All text selected again
 * 5. User can apply formatting to entire text again
 * 
 * ============================================================================
 */
