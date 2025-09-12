// custom_extensions/frontend/src/components/templates/AiPharmaMarketGrowthSlideTemplate.tsx

import React, { useState } from 'react';
import { AiPharmaMarketGrowthSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
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
    backgroundColor: '#DCEAF7',
    borderRadius: '20px'
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '129px',
    top: '70px',
    fontSize: '48px',
    lineHeight: 1.05,
    fontWeight: 700,
    color: '#354963',
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
    right: '90px',
    top: '30px',
    bottom: '97px',
    height: '96%',
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
            style={{ ...titleStyle}}
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
                  style={{ width: '50px', color: '#677686' }}
                />
              ) : (
                <div style={{ color: '#677686' }} onClick={() => isEditable && setEditingBar({ index: i, field: 'year' })}>{b.year}</div>
              )}
            </div>

            <div style={{ flexGrow: 1, backgroundColor: 'transparent', height: '78px', borderRadius: '6px', position: 'relative' }}>
              {/* Width resizable via drag */}
              <div
                style={{ width: `${b.widthPercent}%`, height: '100%', backgroundColor: '#2C405F', borderRadius: '6px', cursor: isEditable ? 'ew-resize' : 'default', minWidth: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '18px' }}
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
              >
                {/* Editable label text on the bar */}
                {isEditable && editingBar?.index === i && editingBar?.field === 'label' ? (
                  <ImprovedInlineEditor
                    initialValue={b.label}
                    onSave={(v) => { const nb=[...currentBars]; nb[i] = { ...nb[i], label: v }; setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); setEditingBar(null); }}
                    onCancel={() => setEditingBar(null)}
                    style={{ color: '#C4D4E2', fontSize: '22px', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none' }}
                  />
                ) : (
                  <div 
                    style={{ color: '#C4D4E2', fontSize: '22px', fontWeight: '500', whiteSpace: 'nowrap', cursor: isEditable ? 'pointer' : 'default' }}
                    onClick={() => isEditable && setEditingBar({ index: i, field: 'label' })}
                  >
                    {b.label}
                  </div>
                )}

                {/* Drag handle */}
                {isEditable && (
                  <div
                    style={{ position: 'absolute', right: 0, top: 0, width: '10px', height: '100%', cursor: 'ew-resize', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      if (!isEditable) return;
                      const container = (e.currentTarget.parentElement!.parentElement as HTMLElement);
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
                )}
              </div>
            </div>

            {isEditable && (
              <button
                onClick={() => { const nb=currentBars.filter((_,idx)=>idx!==i); setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); }}
                style={{ position: 'absolute', right: '110px', top: '-8px', background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
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
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default AiPharmaMarketGrowthSlideTemplate;

