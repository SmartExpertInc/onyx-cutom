// custom_extensions/frontend/src/components/templates/AiPharmaMarketGrowthSlideTemplate.tsx

import React, { useState } from 'react';
import { AiPharmaMarketGrowthSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const AiPharmaMarketGrowthSlideTemplate: React.FC<AiPharmaMarketGrowthSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'AI Pharma\nMarket Growth',
  bars = [
    { year: '2012', label: '$10 million', widthPercent: 24 },
    { year: '2016', label: '$100 million', widthPercent: 72 },
    { year: '2020', label: '$700 million', widthPercent: 92 },
    { year: '2030', label: '$9000 billion', widthPercent: 100 }
  ],
  doctorImagePath = '',
  doctorImageAlt = 'Doctor',
  panelBackgroundColor = '#dfeeff',
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
    padding: '16px'
  };

  const roundedPanel: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    right: '16px',
    bottom: '16px',
    backgroundColor: panelBackgroundColor,
    borderRadius: '20px'
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '48px',
    top: '48px',
    fontSize: '64px',
    lineHeight: 1.05,
    fontWeight: 700,
    color: '#243850',
    whiteSpace: 'pre-line'
  };

  const barsArea: React.CSSProperties = {
    position: 'absolute',
    left: '64px',
    top: '220px',
    width: '56%',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  };

  const rightImageArea: React.CSSProperties = {
    position: 'absolute',
    right: '48px',
    top: '96px',
    bottom: '96px',
    width: '34%',
    backgroundColor: '#4a6cf0'
  };

  return (
    <div className="ai-pharma-market-growth-slide inter-theme" style={slideStyles}>
      <div style={roundedPanel} />

      <div style={titleStyle}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            multiline={true}
            onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={() => setEditingTitle(false)}
            className="ai-pharma-title-editor"
            style={{ ...titleStyle, position: 'relative' }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
      </div>

      {/* Bars */}
      <div style={barsArea}>
        {bars.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '50px', color: '#6c7a8a' }}>{b.year}</div>
            <div style={{ flexGrow: 1, backgroundColor: '#2c3e55', height: '78px', borderRadius: '6px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#cde1ff', fontSize: '22px' }}>{b.label}</div>
              <div style={{ width: `${b.widthPercent}%`, height: '100%', backgroundColor: '#2c3e55', borderRadius: '6px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Right doctor image */}
      <div style={rightImageArea}>
        <ClickableImagePlaceholder
          imagePath={doctorImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ doctorImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Doctor"
          isEditable={isEditable}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export default AiPharmaMarketGrowthSlideTemplate;

