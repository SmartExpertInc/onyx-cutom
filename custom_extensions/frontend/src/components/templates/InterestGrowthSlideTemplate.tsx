// custom_extensions/frontend/src/components/templates/InterestGrowthSlideTemplate.tsx

import React, { useState } from 'react';
import { InterestGrowthSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const InterestGrowthSlideTemplate: React.FC<InterestGrowthSlideProps & { theme?: SlideTheme | string }>= ({
  slideId,
  title = 'Interest',
  cards = [
    { label: 'Interest growth', percentage: '50%' },
    { label: 'Interest growth', percentage: '140%' },
    { label: 'Interest growth', percentage: '128%' },
    { label: 'Interest growth', percentage: '100%' }
  ],
  rightImagePath = '',
  rightImageAlt = 'Person',
  rightPanelColor = '#3a5bf0',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    padding: '24px'
  };

  const titleStyle: React.CSSProperties = {
    gridColumn: '1 / 2',
    fontSize: '64px',
    color: '#333',
    fontWeight: 700
  };

  const cardsGrid: React.CSSProperties = {
    gridColumn: '1 / 2',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    alignContent: 'start'
  };

  const cardStyle: React.CSSProperties = {
    border: '2px solid #d8d8d8',
    minHeight: '220px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const rightPanel: React.CSSProperties = {
    gridColumn: '2 / 3',
    backgroundColor: rightPanelColor,
    position: 'relative'
  };

  return (
    <div className="interest-growth-slide inter-theme" style={slideStyles}>
      <div style={titleStyle}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={() => setEditingTitle(false)}
            className="interest-title-editor"
            style={{ ...titleStyle, gridColumn: 'auto' }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
      </div>

      <div style={cardsGrid}>
        {cards.slice(0, 4).map((c, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ color: '#6b6b6b', fontSize: '16px' }}>{c.label}</div>
            <div style={{ fontSize: '72px', fontWeight: 700 }}>{c.percentage}</div>
          </div>
        ))}
      </div>

      <div style={rightPanel}>
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ rightImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Right image"
          isEditable={isEditable}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export default InterestGrowthSlideTemplate;

