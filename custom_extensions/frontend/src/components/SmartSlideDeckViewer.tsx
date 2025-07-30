// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { FC } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

interface SmartSlideDeckViewerProps {
  /** The slide deck data - must be in component-based format */
  deck: ComponentBasedSlideDeck;
  
  /** Whether the deck is editable */
  isEditable?: boolean;
  
  /** Save callback for changes */
  onSave?: (updatedDeck: ComponentBasedSlideDeck) => void;
  
  /** Show format detection info */
  showFormatInfo?: boolean;
  
  /** Theme ID for the slide deck (optional, uses deck.theme or default) */
  theme?: string;
  
  /** Project ID for direct server saving */
  projectId?: string;

  /** Callback for text changes */
  onTextChange?: (fieldPath: (string | number)[], newValue: any) => void;

  /** Callback for auto-save */
  onAutoSave?: () => void;
}

export const SmartSlideDeckViewer: FC<SmartSlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onTextChange,
  onAutoSave,
  showFormatInfo = false,
  theme,
  projectId
}: SmartSlideDeckViewerProps) => {
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

  // Loading state
  if (!deck) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        No slide deck available
      </div>
    );
  }

  // Success: Render component-based viewer with classic UX and sidebar navigation
  return (
    <div className="slide-deck-viewer">
      {/* Professional Header */}
      <div className="professional-header">
        <div className="header-content">
          {isEditable && (
            <div className="header-controls">
              {/* Add Slide button logic can be kept if needed, but must use onTextChange to update parent */}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Slides Container */}
        <div className="slides-container">
          {deck.slides.map((slide: ComponentBasedSlide, idx: number) => (
            <div
              key={slide.slideId}
              className="professional-slide"
              id={`slide-${slide.slideId}`}
            >
              {/* Component-based slide content */}
              <div className="slide-content">
                <ComponentBasedSlideDeckRenderer
                  slides={[slide]}
                  isEditable={isEditable}
                  onTextChange={(slideId: string, fieldPath: string, value: any) => {
                    // Convert from (slideId, fieldPath, value) to (path, value) format
                    // fieldPath is like 'title' or 'content', so we create path ['slides', idx, 'props', fieldPath]
                    onTextChange && onTextChange(['slides', idx, 'props', fieldPath], value);
                  }}
                  onAutoSave={onAutoSave}
                  theme={deck.theme}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartSlideDeckViewer; 

// CSS стилі для inline editing (копіюємо з інструкції)
const styles = `
  .editable-field {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .editable-field:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }

  .inline-editor-input,
  .inline-editor-textarea {
    width: 100%;
    border: 2px solid #3b82f6;
    border-radius: 4px;
    padding: 8px;
    font-size: inherit;
    font-family: inherit;
    outline: none;
  }

  .inline-editor-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .control-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .edit-button {
    background-color: #3b82f6;
    color: white;
  }

  .edit-button:hover {
    background-color: #2563eb;
  }

  .save-button {
    background-color: #10b981;
    color: white;
  }

  .save-button:hover {
    background-color: #059669;
  }

  .add-button {
    background-color: #8b5cf6;
    color: white;
  }

  .add-button:hover {
    background-color: #7c3aed;
  }
`;

// Додаємо стилі до head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 