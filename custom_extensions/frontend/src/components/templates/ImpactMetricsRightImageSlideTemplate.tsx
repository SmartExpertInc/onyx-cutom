// custom_extensions/frontend/src/components/templates/ImpactMetricsRightImageSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface ImpactMetricItem {
  text: string;
}

export interface ImpactMetricsRightImageProps extends BaseTemplateProps {
  title?: string; // optional large heading (third screenshot)
  metrics: ImpactMetricItem[]; // 3 items
  showTitle?: boolean;
  backgroundColor?: string; // slide background
  textColor?: string; // main text color
  bulletBg?: string; // small circle bg
  bulletColor?: string; // arrow color
  rightPanelColor?: string; // rounded rectangle color behind image
  rightImagePath?: string;
  rightImageAlt?: string;
  logoPath?: string;
  logoText?: string;
  pageNumber?: string;
}

export const ImpactMetricsRightImageSlideTemplate: React.FC<ImpactMetricsRightImageProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = '',
  metrics = [
    { text: '300% increase in online visibility' },
    { text: '$5 for every $1 spent average ROI' },
    { text: '95% increase in customer loyalty' }
  ],
  showTitle = false,
  backgroundColor = '#0f2a2e',
  textColor = '#E6ECE9',
  bulletBg = 'rgba(255,255,255,0.2)',
  bulletColor = '#E6ECE9',
  rightPanelColor = '#EA6A20',
  rightImagePath = '',
  rightImageAlt = 'Right image',
  logoPath = '',
  logoText = 'Your Logo',
  pageNumber = '1',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMetricIndex, setEditingMetricIndex] = useState<number | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    color: '#333333',
    fontFamily: currentTheme.fonts.titleFont,
    display: 'grid',
    gridTemplateColumns: '1fr 540px',
    gap: '40px',
    padding: '80px 60px'
  };

  const metricsCol: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '60px',
    alignItems: 'flex-start',
    justifyContent: 'center'
  };

  const metricRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '35px'
  };

  const bullet: React.CSSProperties = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#0F58F9',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const metricText: React.CSSProperties = {
    fontSize: '40px',
    fontWeight: 600,
    lineHeight: 1.1,
    color: 'black',
    maxWidth: '880px'
  };

  const inlineMetricPosition: React.CSSProperties = {
    marginTop: '-10px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '56px',
    fontWeight: 800,
    marginBottom: '30px',
    color: 'black'
  };

  const rightWrap: React.CSSProperties = {
    position: 'absolute',
    width: '430px',
    height: '75%',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  const panel: React.CSSProperties = {
    position: 'absolute',
    inset: '0 0 0 0',
    borderRadius: '10px',
    background: 'linear-gradient(to bottom, #0F58F9, #1023A1)'
  };

  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-26px',
    width: '70',
    height: '95%',
    objectFit: 'contain'
  };

  const inlineTitleStyle: React.CSSProperties = { ...titleStyle, position: 'relative', backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 };
  const inlineMetricStyle: React.CSSProperties = { ...metricText, position: 'relative', backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 };

  return (
    <>
      <style>{`
        .impact-metrics-right-image .metric-text {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
      `}</style>
      <div className="impact-metrics-right-image inter-theme" style={slide}>
      {/* Logo Placeholder */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="#000000"
          text={logoText}
        />
      </div>

      <div style={metricsCol}>
        {showTitle && (
          <div style={{ marginBottom: '10px' }}>
            {isEditable && editingTitle ? (
              <ImprovedInlineEditor
                initialValue={title}
                onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
                onCancel={() => setEditingTitle(false)}
                style={inlineTitleStyle}
              />
            ) : (
              <div onClick={() => isEditable && setEditingTitle(true)} style={{ ...titleStyle, cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
            )}
          </div>
        )}

        {metrics.map((m, i) => (
          <div key={i} style={metricRow}>
            <div style={bullet}>
              <svg width="12" height="13" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.03763 0.538462C3.46535 -0.179487 4.53465 -0.179487 4.96237 0.538461L7.84946 5.38461C8.27718 6.10256 7.74253 7 6.8871 7L1.1129 7C0.257468 7 -0.277182 6.10256 0.150536 5.38462L3.03763 0.538462Z" fill="white"/>
              </svg>
            </div>
            <div style={inlineMetricPosition}>
              {isEditable && editingMetricIndex === i ? (
                <ImprovedInlineEditor
                  initialValue={m.text}
                  onSave={(v) => {
                    const next = [...metrics];
                    next[i] = { text: v };
                    onUpdate && onUpdate({ metrics: next });
                    setEditingMetricIndex(null);
                  }}
                  onCancel={() => setEditingMetricIndex(null)}
                  className="metric-text"
                  style={inlineMetricStyle}
                />
              ) : (
                <div className="metric-text" onClick={() => isEditable && setEditingMetricIndex(i)} style={{ ...metricText, cursor: isEditable ? 'pointer' : 'default' }}>{m.text}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={rightWrap}>
        <div style={panel} />
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={(p) => onUpdate && onUpdate({ rightImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Right image"
          isEditable={isEditable}
          style={imageStyle}
        />
      </div>

      {/* Page number */}
      <div style={{
        position:'absolute',
        bottom:'24px',
        right:'22px',
        color:'#34353C',
        fontSize:'15px',
        fontWeight:400,
        fontFamily:'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '1px',
          height: '15px',
          backgroundColor: '#5F616D'
        }}></div>
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={(v) => {
              setCurrentPageNumber(v);
              setEditingPageNumber(false);
              onUpdate && onUpdate({ pageNumber: v });
            }}
            onCancel={() => setEditingPageNumber(false)}
            style={{ position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, color:'#34353C', fontSize:'15px', fontWeight:400, fontFamily:'Inter, sans-serif' }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
            {currentPageNumber}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default ImpactMetricsRightImageSlideTemplate;

