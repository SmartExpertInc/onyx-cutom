import React from 'react';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export interface BigNumberItem {
  value: string;
  label: string;
  description: string;
}

export interface BigNumbersTemplateProps {
  slideId: string;
  title: string;
  items: BigNumberItem[];
  theme?: SlideTheme;
  onUpdate?: (updates: Record<string, unknown>) => void;
}

export const BigNumbersTemplate: React.FC<BigNumbersTemplateProps> = ({
  slideId,
  title,
  items,
  theme,
  onUpdate
}: BigNumbersTemplateProps) => {
  const currentTheme = theme || getSafeSlideTheme();
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleItemChange = (index: number, field: keyof BigNumberItem, value: string) => {
    if (!onUpdate || !Array.isArray(items)) return;
    
    const newItems = [...items];
    if (!newItems[index]) {
      newItems[index] = { value: '', label: '', description: '' };
    }
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate({ items: newItems });
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '64px',
    fontFamily: currentTheme.fonts.contentFont,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: 'left',
    marginBottom: '56px',
    width: '100%',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '32px',
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 16px',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '4.5rem',
    color: contentColor,
    marginBottom: '16px',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    color: contentColor,
    marginBottom: '10px',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    lineHeight: 1.5,
  };

  return (
    <div className="big-numbers-template" style={slideStyles}>
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="slide-title-editable"
        />
      </h1>
      <div style={gridStyles}>
        {Array.isArray(items) && items.length >= 3 ? (
          items.slice(0, 3).map((item: BigNumberItem, idx: number) => (
            <div key={idx} style={itemStyles}>
              <div style={valueStyles}>
                <SimpleInlineEditor
                  value={item.value || ''}
                  onSave={(value) => handleItemChange(idx, 'value', value)}
                  placeholder="Value"
                  maxLength={20}
                  className="big-number-value-editable"
                />
              </div>
              <div style={labelStyles}>
                <SimpleInlineEditor
                  value={item.label || ''}
                  onSave={(value) => handleItemChange(idx, 'label', value)}
                  placeholder="Label"
                  maxLength={50}
                  className="big-number-label-editable"
                />
              </div>
              <div style={descriptionStyles}>
                <SimpleInlineEditor
                  value={item.description || ''}
                  onSave={(value) => handleItemChange(idx, 'description', value)}
                  multiline={true}
                  placeholder="Description"
                  maxLength={200}
                  rows={3}
                  className="big-number-description-editable"
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
            Error: This slide requires exactly 3 items with "value", "label", and "description" fields.
            {!Array.isArray(items) && <div>Found: {typeof items}</div>}
            {Array.isArray(items) && <div>Found {items.length} items (need 3)</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BigNumbersTemplate; 