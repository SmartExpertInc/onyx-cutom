// custom_extensions/frontend/src/components/templates/InterestGrowthSlideTemplate.tsx

import React, { useState } from 'react';
import { InterestGrowthSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

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
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [editingYourLogoText, setEditingYourLogoText] = useState(false);
  const [cardList, setCardList] = useState(cards);
  const [editingCard, setEditingCard] = useState<{ index: number; field: 'label' | 'percentage' } | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState('05');
  const [currentYourLogoText, setCurrentYourLogoText] = useState('Your Logo');
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    display: 'grid',
    gridTemplateColumns: '1fr 57%',
    gap: '0px',
    padding: '24px'
  };

  const titleStyle: React.CSSProperties = {
    gridColumn: '2 / 3',
    fontSize: '55px',
    color: '#09090B',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  };

  const cardsGrid: React.CSSProperties = {
    gridColumn: '2 / 3',
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
    height: '498px',
    background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)',
    position: 'relative',
    gridColumn: '1 / 2',
    gridRow: '1 / 3',
    marginTop: '69px',
    overflow: 'hidden',
    borderRadius: '20px',
  };

  const cornerLine: React.CSSProperties = {
    position: 'absolute',
    width: '96px',
    height: '96px',
    border: '2px solid rgba(255,255,255,0.8)'
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, cards, rightImagePath, rightImageAlt, rightPanelColor }, pageNumber: newPageNumber });
    }
  };

  const handleYourLogoTextSave = (newYourLogoText: string) => {
    setCurrentYourLogoText(newYourLogoText);
    setEditingYourLogoText(false);
    if (onUpdate) {
      onUpdate({ ...{ title, cards, rightImagePath, rightImageAlt, rightPanelColor }, yourLogoText: newYourLogoText });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, cards, rightImagePath, rightImageAlt, rightPanelColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="interest-growth-slide" style={slideStyles}>
      {/* Logo in top-left corner */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 10
      }}>
        {currentCompanyLogoPath ? (
          // Show uploaded logo image
          <ClickableImagePlaceholder
            imagePath={currentCompanyLogoPath}
            onImageUploaded={handleCompanyLogoUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={{
              height: '30px',
              maxWidth: '120px',
              objectFit: 'contain'
            }}
          />
        ) : (
          // Show default logo design with clickable area
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: isEditable ? 'pointer' : 'default'
          }}
          onClick={() => isEditable && setShowLogoUploadModal(true)}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #000000',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#000000',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: '#000000',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
            {isEditable && editingYourLogoText ? (
              <ImprovedInlineEditor
                initialValue={currentYourLogoText}
                onSave={handleYourLogoTextSave}
                onCancel={() => setEditingYourLogoText(false)}
                className="your-logo-text-editor"
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#000000',
                  width: '80px',
                  height: 'auto',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingYourLogoText(true)}
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#000000',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentYourLogoText}
              </div>
            )}
          </div>
        )}
      </div>

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
        {[0, 1, 2, 3].map((originalIndex) => {
          const c = cardList[originalIndex];
          const i = originalIndex;
          // Правильный порядок: 
          // 0: top-left (большой), 1: top-right (маленький), 2: bottom-left (маленький), 3: bottom-right (большой)
          const isTopLeft = originalIndex === 0;      // Большой блок
          const isTopRight = originalIndex === 1;     // Маленький блок
          const isBottomLeft = originalIndex === 2;   // Маленький блок с отрицательным margin
          const isBottomRight = originalIndex === 3;  // Большой блок
          
          const cardMarginTop = isBottomLeft ? 0 : 0;
          const cardMainMarginTop = isBottomRight ? -130 : 0;
          const cardHeight = (isTopLeft || isBottomRight) ? 290 : 160;  // Большие: 225px, маленькие: 160px
          const percentageFontSize = (isTopRight || isBottomLeft) ? '48px' : '79px';  // Маленькие: 48px, большие: 79px
          const percentageMinHeight = (isTopRight || isBottomLeft) ? 0 : 88;
          return (
          <div
            key={i}
            style={{ ...cardStyle, height: `${cardHeight}px`, marginTop: `${cardMainMarginTop}px`, borderRadius: '5px' }}
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
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ rightImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Right image"
          isEditable={isEditable}
          style={{ position: 'relative', top: '24px', height: '485px', objectFit: 'cover' }}
        />
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={() => setEditingPageNumber(false)}
            className="page-number-editor"
            style={{
              color: '#000000',
              fontSize: '17px',
              fontWeight: '300',
              width: '30px',
              height: 'auto',
              background: 'transparent',
              border: 'none',
              outline: 'none'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#000000',
              fontSize: '17px',
              fontWeight: '300',
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default InterestGrowthSlideTemplate;

