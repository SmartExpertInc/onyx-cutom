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
    fontSize: '96px',
    color: '#222',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginTop: '8px'
  };

  const cardsGrid: React.CSSProperties = {
    gridColumn: '1 / 2',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    alignContent: 'start',
    marginTop: '12px'
  };

  const cardStyle: React.CSSProperties = {
    border: '2px solid #d9d9d9',
    minHeight: '260px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    position: 'relative'
  };

  const rightPanel: React.CSSProperties = {
    gridColumn: '2 / 3',
    backgroundColor: rightPanelColor,
    position: 'relative'
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
        {cardList.slice(0, 4).map((c, i) => (
          <div
            key={i}
            style={cardStyle}
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
                  style={{ color: '#6b6b6b', fontSize: '16px' }}
                />
              ) : (
                <div style={{ color: '#6b6b6b', fontSize: '16px' }} onClick={() => isEditable && setEditingCard({ index: i, field: 'label' })}>{c.label}</div>
              )}
            </div>

            {/* Percentage (fixed height to avoid shift) */}
            <div style={{ minHeight: '88px', display: 'flex', alignItems: 'flex-end' }}>
              {isEditable && editingCard?.index === i && editingCard?.field === 'percentage' ? (
                <ImprovedInlineEditor
                  initialValue={c.percentage}
                  onSave={(v) => { const next=[...cardList]; next[i] = { ...next[i], percentage: v }; setCardList(next); onUpdate && onUpdate({ cards: next }); setEditingCard(null); }}
                  onCancel={() => setEditingCard(null)}
                  style={{ fontSize: '88px', fontWeight: 800, lineHeight: 1 }}
                />
              ) : (
                <div style={{ fontSize: '88px', fontWeight: 800, lineHeight: 1 }} onClick={() => isEditable && setEditingCard({ index: i, field: 'percentage' })}>{c.percentage}</div>
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
        ))}

        {isEditable && (
          <button
            onClick={() => { const next=[...cardList, { label: 'Interest growth', percentage: '50%' }]; setCardList(next); onUpdate && onUpdate({ cards: next }); }}
            style={{ background: '#222', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}
          >
            Add card
          </button>
        )}
      </div>

      <div style={rightPanel}>
        {/* Optional unified logo in the top-left of the right panel if needed in future */}
        <div style={{ ...cornerLine, left: '24px', top: '24px', borderRight: 'none', borderBottom: 'none' }} />
        <div style={{ ...cornerLine, right: '24px', top: '24px', borderLeft: 'none', borderBottom: 'none' }} />
        <div style={{ ...cornerLine, left: '24px', bottom: '24px', borderRight: 'none', borderTop: 'none' }} />
        <div style={{ ...cornerLine, right: '24px', bottom: '24px', borderLeft: 'none', borderTop: 'none' }} />
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

