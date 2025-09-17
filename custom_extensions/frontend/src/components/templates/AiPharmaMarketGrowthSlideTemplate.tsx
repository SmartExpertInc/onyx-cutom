// custom_extensions/frontend/src/components/templates/AiPharmaMarketGrowthSlideTemplate.tsx

import React, { useState } from 'react';
import { AiPharmaMarketGrowthSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

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
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [editingYourLogoText, setEditingYourLogoText] = useState(false);
  const [currentBars, setCurrentBars] = useState(bars);
  const [editingBar, setEditingBar] = useState<{ index: number; field: 'label' | 'year' | 'widthPercent' } | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState('08');
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
    padding: '16px'
  };

  const roundedPanel: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    right: '16px',
    bottom: '16px',
    backgroundColor: '#E0E7FF',
    borderRadius: '20px'
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '60px',
    top: '125px',
    fontSize: '44px',
    lineHeight: 1.05,
    fontWeight: 700,
    color: '#09090B',
  };

  const barsArea: React.CSSProperties = {
    position: 'absolute',
    left: '64px',
    top: '275px',
    width: '56%',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const rightImageArea: React.CSSProperties = {
    position: 'absolute',
    right: '90px',
    top: '30px',
    bottom: '97px',
    height: '96%',
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, bars, doctorImagePath, doctorImageAlt, panelBackgroundColor }, pageNumber: newPageNumber });
    }
  };

  const handleYourLogoTextSave = (newYourLogoText: string) => {
    setCurrentYourLogoText(newYourLogoText);
    setEditingYourLogoText(false);
    if (onUpdate) {
      onUpdate({ ...{ title, bars, doctorImagePath, doctorImageAlt, panelBackgroundColor }, yourLogoText: newYourLogoText });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, bars, doctorImagePath, doctorImageAlt, panelBackgroundColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="ai-pharma-market-growth-slide" style={slideStyles}>
      <div style={roundedPanel} />

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
              justifyContent: 'center',
              backgroundColor: '#000000'
            }}>
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#FFFFFF',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: '#FFFFFF',
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
          <div 
            key={i} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '18px', 
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (isEditable) {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                // Show delete button
                const deleteBtn = e.currentTarget.querySelector('[data-delete-btn]') as HTMLElement;
                if (deleteBtn) {
                  deleteBtn.style.opacity = '1';
                  deleteBtn.style.pointerEvents = 'auto';
                }
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              // Hide delete button
              const deleteBtn = e.currentTarget.querySelector('[data-delete-btn]') as HTMLElement;
              if (deleteBtn) {
                deleteBtn.style.opacity = '0';
                deleteBtn.style.pointerEvents = 'none';
              }
            }}
          >
            {/* Year editable */}
            <div style={{ width: '50px', minHeight: '22px' }}>
              {isEditable && editingBar?.index === i && editingBar?.field === 'year' ? (
                <ImprovedInlineEditor
                  initialValue={b.year}
                  onSave={(v) => { const nb=[...currentBars]; nb[i] = { ...nb[i], year: v }; setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); setEditingBar(null); }}
                  onCancel={() => setEditingBar(null)}
                  style={{ width: '50px', color: '#09090B' }}
                />
              ) : (
                <div style={{ color: '#09090B' }} onClick={() => isEditable && setEditingBar({ index: i, field: 'year' })}>{b.year}</div>
              )}
            </div>

            <div style={{ flexGrow: 1, backgroundColor: 'transparent', height: '78px', borderRadius: '6px', position: 'relative' }}>
              {/* Width resizable via drag */}
              <div
                style={{ width: `${b.widthPercent}%`, height: '100%', background: 'linear-gradient(to left, #1158C3 0%, #2979DD 30%, rgba(56, 141, 237, 0.95) 48%, rgba(73, 164, 255, 0.71) 77%, rgba(73, 164, 255, 0) 122% )', borderRadius: '2px', cursor: isEditable ? 'ew-resize' : 'default', minWidth: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '18px' }}
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
                    style={{ color: '#ffffff', fontSize: '22px', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none' }}
                  />
                ) : (
                  <div 
                    style={{ color: '#ffffff', fontSize: '22px', fontWeight: '500', whiteSpace: 'nowrap', cursor: isEditable ? 'pointer' : 'default' }}
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

            {/* Delete button - appears on hover */}
            {isEditable && (
              <div
                data-delete-btn
                onClick={() => { const nb=currentBars.filter((_,idx)=>idx!==i); setCurrentBars(nb); onUpdate && onUpdate({ bars: nb }); }}
                style={{ 
                  position: 'absolute', 
                  right: '-40px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#ff4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                aria-label="Delete bar"
              >
                <div style={{
                  width: '16px',
                  height: '2px',
                  backgroundColor: '#ffffff',
                  transform: 'rotate(45deg)',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '16px',
                    height: '2px',
                    backgroundColor: '#ffffff',
                    transform: 'rotate(-90deg)',
                    position: 'absolute',
                    top: '0',
                    left: '0'
                  }} />
                </div>
              </div>
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

      {/* Page number in bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
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

export default AiPharmaMarketGrowthSlideTemplate;

