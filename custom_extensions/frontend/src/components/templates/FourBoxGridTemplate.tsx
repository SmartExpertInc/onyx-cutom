import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { FourBoxGridProps } from '@/types/slideTemplates';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

interface BoxItem {
  heading: string;
  text: string;
}

export const FourBoxGridTemplate: React.FC<FourBoxGridProps> = ({
  slideId,
  title,
  boxes,
  theme,
  onUpdate,
  isEditable = false
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingBoxHeadings, setEditingBoxHeadings] = useState<number[]>([]);
  const [editingBoxTexts, setEditingBoxTexts] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for draggable elements (following Big Image Left pattern)
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Use existing slideId for element positioning (following Big Image Left pattern)
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    background: '#ffffff', // Белый фон
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '60px 80px',
    fontFamily: currentTheme.fonts.contentFont
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: '#000000', // Черный цвет для заголовка на белом фоне
    textAlign: 'left',
    marginBottom: '40px',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '24px',
    width: '100%'
  };

  const boxStyles: React.CSSProperties = {
    background: 'linear-gradient(90deg, #002D91 0%, #000C5B 100%)', // Синий градиент как в теме
    borderRadius: '8px',
    padding: '20px',
    color: '#ffffff', // Белый цвет текста
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: '200px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    color: '#ffffff', // Белый цвет для заголовков в блоках
    marginBottom: '12px',
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const textStyles: React.CSSProperties = {
    fontSize: '1rem',
    color: '#ffffff', // Белый цвет для текста в блоках
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    opacity: 0.9
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle box heading editing
  const handleBoxHeadingSave = (index: number, newHeading: string) => {
    if (onUpdate && boxes) {
      const updatedBoxes = [...boxes];
      updatedBoxes[index] = { ...updatedBoxes[index], heading: newHeading };
      onUpdate({ boxes: updatedBoxes });
    }
    setEditingBoxHeadings(editingBoxHeadings.filter(i => i !== index));
  };

  const handleBoxHeadingCancel = (index: number) => {
    setEditingBoxHeadings(editingBoxHeadings.filter((i: number) => i !== index));
  };

  // Handle box text editing
  const handleBoxTextSave = (index: number, newText: string) => {
    if (onUpdate && boxes) {
      const updatedBoxes = [...boxes];
      updatedBoxes[index] = { ...updatedBoxes[index], text: newText };
      onUpdate({ boxes: updatedBoxes });
    }
    setEditingBoxTexts(editingBoxTexts.filter((i: number) => i !== index));
  };

  const handleBoxTextCancel = (index: number) => {
    setEditingBoxTexts(editingBoxTexts.filter((i: number) => i !== index));
  };

  const startEditingBoxHeading = (index: number) => {
    setEditingBoxHeadings([...editingBoxHeadings, index]);
  };

  const startEditingBoxText = (index: number) => {
    setEditingBoxTexts([...editingBoxTexts, index]);
  };

  return (
    <div className="four-box-grid-template" style={slideStyles}>
      {/* Title - wrapped */}
      <div 
        ref={titleRef}
        data-moveable-element={`${slideId}-title`}
        data-draggable="true" 
        style={{ display: 'inline-block' }}
      >
        {isEditable && editingTitle ? (
          <WysiwygEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            placeholder="Enter slide title..."
            className="inline-editor-title"
            style={{
              ...titleStyles,
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              boxSizing: 'border-box',
              display: 'block',
              lineHeight: '1.2'
            }}
          />
        ) : (
          <h1 
            style={titleStyles}
            onClick={(e) => {
              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
            dangerouslySetInnerHTML={{ __html: title || 'Click to add title' }}
          />
        )}
      </div>

      <div style={gridStyles}>
        {Array.isArray(boxes) && boxes.length >= 4 ? (
          boxes.slice(0, 4).map((box: any, idx: number) => (
            <div 
              key={idx} 
              data-moveable-element={`${slideId}-box-${idx}`}
              data-draggable="true"
              style={boxStyles}
            >
              {/* Box Heading */}
              {isEditable && editingBoxHeadings.includes(idx) ? (
                <WysiwygEditor
                  initialValue={box.heading || ''}
                  onSave={(newHeading) => handleBoxHeadingSave(idx, newHeading)}
                  onCancel={() => handleBoxHeadingCancel(idx)}
                  placeholder="Enter heading..."
                  className="inline-editor-box-heading"
                  style={{
                    ...headingStyles,
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    lineHeight: '1.2'
                  }}
                />
              ) : (
                <div 
                  style={headingStyles}
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      startEditingBoxHeading(idx);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: box.heading || 'Click to add heading' }}
                />
              )}

              {/* Box Text */}
              {isEditable && editingBoxTexts.includes(idx) ? (
                <WysiwygEditor
                  initialValue={box.text || ''}
                  onSave={(newText) => handleBoxTextSave(idx, newText)}
                  onCancel={() => handleBoxTextCancel(idx)}
                  placeholder="Enter text..."
                  className="inline-editor-box-text"
                  style={{
                    ...textStyles,
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    lineHeight: '1.6'
                  }}
                />
              ) : (
                <div 
                  style={textStyles}
                  onClick={(e) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      startEditingBoxText(idx);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: box.text || 'Click to add text' }}
                />
              )}
            </div>
          ))
        ) : (
          <div style={{ 
            color: '#ff6b6b', 
            fontWeight: 600, 
            padding: '20px', 
            textAlign: 'center',
            gridColumn: '1 / -1'
          }}>
            Error: This slide requires exactly 4 boxes with "heading" and "text" fields.
            {!Array.isArray(boxes) && <div>Found: {typeof boxes}</div>}
            {Array.isArray(boxes) && <div>Found {boxes.length} boxes (need 4)</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FourBoxGridTemplate; 