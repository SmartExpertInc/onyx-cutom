// custom_extensions/frontend/src/components/templates/PhishingRiseSlideTemplate.tsx

import React, { useState } from 'react';
import { PhishingRiseSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const PhishingRiseSlideTemplate: React.FC<PhishingRiseSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Phishing rise',
  description = 'This has become a growing threat in the world of today, and in 2016 they hit a 12-year high. Tara Seals\' US North America News Reporter, Infosecurity Magazine noted that they Anti-Phishing Working Group documented a 250% increase in phishing sites between October 2015 and March 2016. There has also been a noted that 93% of phishing emails are now ransomware.',
  bars = [
    { year: '2019', valueLabel: '33M$', height: 160 },
    { year: '2020', valueLabel: '39M$', height: 200 },
    { year: '2021', valueLabel: '55M$', height: 330 },
    { year: '2022', valueLabel: '44M$', height: 270 },
    { year: '2023', valueLabel: '67M$', height: 420 },
    { year: '2024', valueLabel: '35M$', height: 210 }
  ],
  actorImagePath = '',
  actorImageAlt = 'Actor image',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [currentBars, setCurrentBars] = useState(bars);
  const [editingBar, setEditingBar] = useState<{ index: number; field: 'valueLabel' | 'year' } | null>(null);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    fontFamily: currentTheme.fonts.titleFont
  };

  // Left content area
  const leftArea: React.CSSProperties = {
    padding: '48px 48px 48px 48px',
    position: 'relative',
    backgroundColor: '#ffffff'
  };

  const largeFaintTitle: React.CSSProperties = {
    fontSize: '56px',
    fontWeight: 700,
    color: '#e9e9ee'
  };

  const paragraph: React.CSSProperties = {
    marginTop: '24px',
    maxWidth: '540px',
    lineHeight: 1.6,
    color: '#a6a7b0',
    fontSize: '16px'
  };

  const avatarHolder: React.CSSProperties = {
    position: 'absolute',
    left: '72px',
    bottom: '56px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #c6b9ff'
  };

  // Right chart area
  const rightArea: React.CSSProperties = {
    position: 'relative',
    backgroundColor: '#ffffff'
  };

  const yLabels: React.CSSProperties = {
    position: 'absolute',
    left: '30px',
    top: '24px',
    color: '#8d96a3',
    fontSize: '14px'
  };

  const chart: React.CSSProperties = {
    position: 'absolute',
    right: '48px',
    left: '96px',
    bottom: '72px',
    top: '72px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '36px',
    borderLeft: '1px solid #f0f0f0'
  };

  const yearStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#777',
    marginTop: '8px',
    fontSize: '14px'
  };

  const addBar = () => {
    const newBars = [...currentBars, { year: '2025', valueLabel: 'New', height: 180 }];
    setCurrentBars(newBars);
    onUpdate && onUpdate({ bars: newBars });
  };

  const removeBar = (index: number) => {
    if (currentBars.length <= 1) return;
    const newBars = currentBars.filter((_, i) => i !== index);
    setCurrentBars(newBars);
    onUpdate && onUpdate({ bars: newBars });
  };

  const setBarHeight = (index: number, height: number) => {
    const clamped = Math.max(40, Math.min(460, height));
    const newBars = [...currentBars];
    newBars[index] = { ...newBars[index], height: clamped };
    setCurrentBars(newBars);
    onUpdate && onUpdate({ bars: newBars });
  };

  return (
    <div className="phishing-rise-slide inter-theme" style={slideStyles}>
      {/* Left */}
      <div style={leftArea}>
        <div style={largeFaintTitle}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={title}
              onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
              onCancel={() => setEditingTitle(false)}
              className="phishing-title-editor"
              style={{ ...largeFaintTitle }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
          )}
        </div>
        <div style={paragraph}>
          {isEditable && editingDescription ? (
            <ImprovedInlineEditor
              initialValue={description}
              multiline={true}
              onSave={(v) => { onUpdate && onUpdate({ description: v }); setEditingDescription(false); }}
              onCancel={() => setEditingDescription(false)}
              className="phishing-description-editor"
              style={{ ...paragraph }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingDescription(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{description}</div>
          )}
        </div>

        {/* Avatar */}
        <div style={avatarHolder}>
          <ClickableImagePlaceholder
            imagePath={actorImagePath}
            onImageUploaded={(p: string) => onUpdate && onUpdate({ actorImagePath: p })}
            size="LARGE"
            position="CENTER"
            description="Actor"
            isEditable={isEditable}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={rightArea}>
        {/* Y labels */}
        <div style={yLabels}>
          <div style={{ marginBottom: '64px' }}>70</div>
          <div style={{ marginBottom: '64px' }}>60</div>
          <div style={{ marginBottom: '64px' }}>40</div>
          <div style={{ marginBottom: '64px' }}>20</div>
          <div>0</div>
        </div>

        {/* Bars */}
        <div style={chart}>
          {currentBars.map((b, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {isEditable && editingBar?.index === idx && editingBar?.field === 'valueLabel' ? (
                <ImprovedInlineEditor
                  initialValue={b.valueLabel}
                  onSave={(v) => { const nb=[...currentBars]; nb[idx] = { ...nb[idx], valueLabel: v }; setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); setEditingBar(null); }}
                  onCancel={() => setEditingBar(null)}
                  style={{ color: '#8d96a3', marginBottom: '8px', fontSize: '14px' }}
                />
              ) : (
                <div style={{ color: '#8d96a3', marginBottom: '8px', fontSize: '14px' }} onClick={() => isEditable && setEditingBar({ index: idx, field: 'valueLabel' })}>{b.valueLabel}</div>
              )}

              <div
                style={{ width: '90px', height: `${b.height}px`, backgroundColor: '#0d0d0d', position: 'relative', cursor: isEditable ? 'ns-resize' : 'default' }}
                onMouseDown={(e) => {
                  if (!isEditable) return;
                  const startY = e.clientY;
                  const startH = b.height;
                  const onMove = (me: MouseEvent) => {
                    const delta = startY - me.clientY;
                    setBarHeight(idx, startH + delta);
                  };
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
              />

              {isEditable && editingBar?.index === idx && editingBar?.field === 'year' ? (
                <ImprovedInlineEditor
                  initialValue={b.year}
                  onSave={(v) => { const nb=[...currentBars]; nb[idx] = { ...nb[idx], year: v }; setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); setEditingBar(null); }}
                  onCancel={() => setEditingBar(null)}
                  style={{ ...yearStyle }}
                />
              ) : (
                <div style={yearStyle} onClick={() => isEditable && setEditingBar({ index: idx, field: 'year' })}>{b.year}</div>
              )}

              {isEditable && (
                <button
                  onClick={() => removeBar(idx)}
                  style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  aria-label="Delete bar"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {isEditable && (
            <button onClick={addBar} style={{ position: 'absolute', right: '12px', top: '12px', background: '#0d0d0d', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}>Add bar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhishingRiseSlideTemplate;

