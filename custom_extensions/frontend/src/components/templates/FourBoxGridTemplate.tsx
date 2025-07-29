import React from 'react';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export interface FourBoxGridProps {
  slideId: string;
  title: string;
  boxes: Array<{
    heading: string;
    text: string;
  }>;
  theme?: SlideTheme;
  onUpdate?: (updates: Record<string, unknown>) => void;
}

export const FourBoxGridTemplate: React.FC<FourBoxGridProps> = ({
  slideId,
  title,
  boxes,
  theme,
  onUpdate
}) => {
  const currentTheme = theme && theme.colors ? theme : getSafeSlideTheme();

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleBoxChange = (index: number, field: 'heading' | 'text', value: string) => {
    if (!onUpdate || !Array.isArray(boxes)) return;
    
    const newBoxes = [...boxes];
    if (!newBoxes[index]) {
      newBoxes[index] = { heading: '', text: '' };
    }
    newBoxes[index] = { ...newBoxes[index], [field]: value };
    onUpdate({ boxes: newBoxes });
  };

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
    marginBottom: '40px'
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
    fontFamily: currentTheme.fonts.titleFont
  };

  const textStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont
  };

  return (
    <div className="four-box-grid-template" style={slideStyles}>
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="four-box-title-editable"
        />
      </h1>
      <div style={gridStyles}>
        {Array.isArray(boxes) && boxes.length >= 4 ? (
          boxes.slice(0, 4).map((box: any, idx: number) => (
            <div key={idx} style={boxStyles}>
              <div style={headingStyles}>
                <SimpleInlineEditor
                  value={box.heading || ''}
                  onSave={(value) => handleBoxChange(idx, 'heading', value)}
                  placeholder="Box heading"
                  maxLength={50}
                  className="four-box-heading-editable"
                />
              </div>
              <div style={textStyles}>
                <SimpleInlineEditor
                  value={box.text || ''}
                  onSave={(value) => handleBoxChange(idx, 'text', value)}
                  multiline={true}
                  placeholder="Box description"
                  maxLength={200}
                  rows={4}
                  className="four-box-text-editable"
                />
              </div>
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