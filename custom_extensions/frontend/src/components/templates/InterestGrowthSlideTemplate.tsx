// custom_extensions/frontend/src/components/templates/InterestGrowthSlideTemplate.tsx

import React, { useState } from 'react';
import { InterestGrowthSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
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
  const [cardList, setCardList] = useState(cards);
  const [editingCard, setEditingCard] = useState<{ index: number; field: 'label' | 'percentage' } | null>(null);

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
    fontSize: '65px',
    color: '#2A2B2C',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  };

  const cardsGrid: React.CSSProperties = {
    gridColumn: '1 / 2',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'auto auto',
    gap: '24px',
    alignContent: 'start',
    marginTop: '12px'
  };

  const cardStyle: React.CSSProperties = {
    border: '2px solid #d9d9d9',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'end',
    backgroundColor: '#fff',
    position: 'relative',
    alignSelf: 'start'
  };

  const rightPanel: React.CSSProperties = {
    width: '430px',
    backgroundColor: '#4D70D4',
    position: 'relative',
    marginLeft: '18%',
    marginTop: '-100px'
  };

  const cornerLine: React.CSSProperties = {
    position: 'absolute',
    width: '96px',
    height: '96px',
    border: '2px solid rgba(255,255,255,0.8)'
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
        {cardList.slice(0, 4).map((c, i) => {
          const isRightTop = i === 1;
          const isRightBottom = i === 3;
          const isLeftBottom = i === 2;
          const cardMarginTop = isLeftBottom ? -64 : 0;
          const cardHeight = isRightTop ? 287 : (isRightBottom ? 160 : 225);
          const percentageFontSize = isRightBottom ? '48px' : '79px';
          const percentageMinHeight = isRightBottom ? 0 : 88;
          return (
          <div
            key={i}
            style={{ ...cardStyle, height: `${cardHeight}px`, marginTop: `${cardMarginTop}px` }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget.querySelector('.card-delete-btn') as HTMLElement | null;
              if (btn) btn.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget.querySelector('.card-delete-btn') as HTMLElement | null;
              if (btn) btn.style.opacity = '0';
            }}
          >
            {/* Label (fixed height to avoid shift) */}
            <div style={{ minHeight: '22px' }}>
              {isEditable && editingCard?.index === i && editingCard?.field === 'label' ? (
                <ImprovedInlineEditor
                  initialValue={c.label}
                  onSave={(v) => { const next=[...cardList]; next[i] = { ...next[i], label: v }; setCardList(next); onUpdate && onUpdate({ cards: next }); setEditingCard(null); }}
                  onCancel={() => setEditingCard(null)}
                  style={{ color: '#606060', fontSize: '16px' }}
                />
              ) : (
                <div style={{ color: '#606060', fontSize: '16px' }} onClick={() => isEditable && setEditingCard({ index: i, field: 'label' })}>{c.label}</div>
              )}
            </div>

            {/* Percentage (fixed height to avoid shift) */}
            <div style={{ minHeight: `${percentageMinHeight}px`, display: 'flex', alignItems: 'flex-end' }}>
              {isEditable && editingCard?.index === i && editingCard?.field === 'percentage' ? (
                <ImprovedInlineEditor
                  initialValue={c.percentage}
                  onSave={(v) => { const next=[...cardList]; next[i] = { ...next[i], percentage: v }; setCardList(next); onUpdate && onUpdate({ cards: next }); setEditingCard(null); }}
                  onCancel={() => setEditingCard(null)}
                  style={{ fontSize: percentageFontSize, color: '#202022', fontWeight: 800, lineHeight: 1 }}
                />
              ) : (
                <div style={{ fontSize: percentageFontSize, color: '#202022', fontWeight: 800, lineHeight: 1 }} onClick={() => isEditable && setEditingCard({ index: i, field: 'percentage' })}>{c.percentage}</div>
              )}
            </div>

            {/* Hover-only delete button (absolute, no layout shift) */}
            {isEditable && (
              <button
                className="card-delete-btn"
                onClick={() => { if (cardList.length>1){ const next=cardList.filter((_,idx)=>idx!==i); setCardList(next); onUpdate && onUpdate({ cards: next }); } }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: '#ffffff', border: '1px solid #ddd', color: '#333', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', opacity: 0, transition: 'opacity 120ms ease' }}
              >
                Delete
              </button>
            )}
          </div>
          );
        })}
      </div>

      <div style={rightPanel}>
        {/* Optional unified logo in the top-left of the right panel if needed in future */}
        <div style={{ ...cornerLine, width: '120px', borderTop: 'none', borderLeft: 'none' }} />
        <div style={{ ...cornerLine, height: '120px', right: '0', top: '50%', transform: 'translateY(-50%)', borderRight: 'none' }} />
        <div style={{ ...cornerLine, width: '100px', height: '60px', left: '50px', bottom: '0px', borderBottom: 'none' }} />
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ rightImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Right image"
          isEditable={isEditable}
          style={{ position: 'relative', top: '24px', width: '405px', height: '595px', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export default InterestGrowthSlideTemplate;

