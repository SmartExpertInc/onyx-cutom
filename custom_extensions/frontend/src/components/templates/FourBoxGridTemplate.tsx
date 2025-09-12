import React, { useState } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export interface FourBoxGridProps {
  slideId: string;
  title: string;
  boxes: Array<{
    heading: string;
    text: string;
  }>;
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

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
    backgroundColor: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '64px',
    fontFamily: currentTheme.fonts.contentFont
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '40px',
    wordWrap: 'break-word'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '24px',
    width: '100%',
    flex: 1
  };

  const boxStyles: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '20px',
    color: currentTheme.colors.contentColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    boxShadow: '0 1px 0 0 #393963',
    border: '1px solid #393963',
    minHeight: '160px'
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    color: currentTheme.colors.contentColor,
    marginBottom: '12px',
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word'
  };

  const textStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word'
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
      {/* Title */}
      {isEditable && editingTitle ? (
        <ImprovedInlineEditor
          initialValue={title || ''}
          onSave={handleTitleSave}
          onCancel={handleTitleCancel}
          multiline={true}
          placeholder="Enter slide title..."
          className="inline-editor-title"
          style={inline({
            ...titleStyles,
            // Ensure title behaves exactly like h1 element
            margin: '0',
            padding: '0',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box',
            display: 'block'
          })}
        />
      ) : (
        <h1 
          style={titleStyles}
          onClick={() => {
            if (isEditable) {
              setEditingTitle(true);
            }
          }}
          className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
        >
          {title || 'Click to add title'}
        </h1>
      )}

      <div style={gridStyles}>
        {Array.isArray(boxes) && boxes.length >= 4 ? (
          boxes.slice(0, 4).map((box: any, idx: number) => (
            <div key={idx} style={boxStyles}>
              {/* Box Heading */}
              {isEditable && editingBoxHeadings.includes(idx) ? (
                <ImprovedInlineEditor
                  initialValue={box.heading || ''}
                  onSave={(newHeading) => handleBoxHeadingSave(idx, newHeading)}
                  onCancel={() => handleBoxHeadingCancel(idx)}
                  multiline={true}
                  placeholder="Enter heading..."
                  className="inline-editor-box-heading"
                  style={inline({
                    ...headingStyles,
                    // Ensure heading behaves exactly like div element
                    margin: '0',
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block'
                  })}
                />
              ) : (
                <div 
                  style={headingStyles}
                  onClick={() => {
                    if (isEditable) {
                      startEditingBoxHeading(idx);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                >
                  {box.heading || 'Click to add heading'}
                </div>
              )}

              {/* Box Text */}
              {isEditable && editingBoxTexts.includes(idx) ? (
                <ImprovedInlineEditor
                  initialValue={box.text || ''}
                  onSave={(newText) => handleBoxTextSave(idx, newText)}
                  onCancel={() => handleBoxTextCancel(idx)}
                  multiline={true}
                  placeholder="Enter text..."
                  className="inline-editor-box-text"
                  style={inline({
                    ...textStyles,
                    // Ensure text behaves exactly like div element
                    margin: '0',
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block'
                  })}
                />
              ) : (
                <div 
                  style={textStyles}
                  onClick={() => {
                    if (isEditable) {
                      startEditingBoxText(idx);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                >
                  {box.text || 'Click to add text'}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={inline({ 
            color: '#ff6b6b', 
            fontWeight: 600, 
            padding: '20px', 
            textAlign: 'center',
            gridColumn: '1 / -1'
          })}>
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