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
  const [currentBars, setCurrentBars] = useState(bars);
  const [editingBar, setEditingBar] = useState<{ index: number; field: 'label' | 'year' | 'widthPercent' } | null>(null);

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
        {currentBars.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative' }}>
            {/* Year editable */}
            <div style={{ width: '50px', minHeight: '22px' }}>
              {isEditable && editingBar?.index === i && editingBar?.field === 'year' ? (
                <ImprovedInlineEditor
                  initialValue={b.year}
                  onSave={(v) => { const nb=[...currentBars]; nb[i] = { ...nb[i], year: v }; setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); setEditingBar(null); }}
                  onCancel={() => setEditingBar(null)}
                  style={{ width: '50px', color: '#6c7a8a' }}
                />
              ) : (
                <div style={{ color: '#6c7a8a' }} onClick={() => isEditable && setEditingBar({ index: i, field: 'year' })}>{b.year}</div>
              )}
            </div>

            <div style={{ flexGrow: 1, backgroundColor: '#2c3e55', height: '78px', borderRadius: '6px', position: 'relative' }}>
              {/* Label editable */}
              <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', minHeight: '24px' }}>
                {isEditable && editingBar?.index === i && editingBar?.field === 'label' ? (
                  <ImprovedInlineEditor
                    initialValue={b.label}
                    onSave={(v) => { const nb=[...currentBars]; nb[i] = { ...nb[i], label: v }; setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); setEditingBar(null); }}
                    onCancel={() => setEditingBar(null)}
                    style={{ color: '#cde1ff', fontSize: '22px' }}
                  />
                ) : (
                  <div style={{ color: '#cde1ff', fontSize: '22px' }} onClick={() => isEditable && setEditingBar({ index: i, field: 'label' })}>{b.label}</div>
                )}
              </div>

              {/* Width resizable via drag */}
              <div
                style={{ width: `${b.widthPercent}%`, height: '100%', backgroundColor: '#2c3e55', borderRadius: '6px', cursor: isEditable ? 'ew-resize' : 'default' }}
                onMouseDown={(e) => {
                  if (!isEditable) return;
                  const container = (e.currentTarget.parentElement as HTMLElement);
                  const containerRect = container.getBoundingClientRect();
                  const onMove = (me: MouseEvent) => {
                    const rel = Math.min(Math.max((me.clientX - containerRect.left) / containerRect.width, 0), 1);
                    const nb = [...currentBars];
                    nb[i] = { ...nb[i], widthPercent: Math.round(rel * 100) };
                    setCurrentBars(nb);
                    onUpdate && onUpdate({ bars: nb });
                  };
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
              />
            </div>

            {isEditable && (
              <button
                onClick={() => { const nb=currentBars.filter((_,idx)=>idx!==i); setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); }}
                style={{ position: 'absolute', right: '-8px', top: '-8px', background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                aria-label="Delete bar"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {isEditable && (
          <button
            onClick={() => { const nb=[...currentBars, { year: '2035', label: 'New item', widthPercent: 50 }]; setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); }}
            style={{ alignSelf: 'flex-start', marginLeft: '50px', background: '#2c3e55', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
          >
            Add bar
          </button>
        )}
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

