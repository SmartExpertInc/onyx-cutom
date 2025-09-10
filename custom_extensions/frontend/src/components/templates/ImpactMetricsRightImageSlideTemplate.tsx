// custom_extensions/frontend/src/components/templates/ImpactMetricsRightImageSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

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
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMetricIndex, setEditingMetricIndex] = useState<number | null>(null);

  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor,
    position: 'relative',
    color: textColor,
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
    gap: '22px'
  };

  const bullet: React.CSSProperties = {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: bulletBg,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const metricText: React.CSSProperties = {
    fontSize: '64px',
    fontWeight: 700,
    lineHeight: 1.1,
    color: textColor,
    maxWidth: '880px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '56px',
    fontWeight: 800,
    marginBottom: '30px',
    color: textColor
  };

  const rightWrap: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const panel: React.CSSProperties = {
    position: 'absolute',
    inset: '0 0 0 0',
    borderRadius: '30px',
    backgroundColor: rightPanelColor
  };

  const imageStyle: React.CSSProperties = {
    position: 'relative',
    width: '85%',
    height: '85%',
    objectFit: 'contain'
  };

  const inlineTitleStyle: React.CSSProperties = { ...titleStyle, position: 'relative', backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 };
  const inlineMetricStyle: React.CSSProperties = { ...metricText, position: 'relative', backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 };

  return (
    <div className="impact-metrics-right-image inter-theme" style={slide}>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M12 5l-5 5M12 5l5 5" stroke={bulletColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
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
                  style={inlineMetricStyle}
                />
              ) : (
                <div onClick={() => isEditable && setEditingMetricIndex(i)} style={{ ...metricText, cursor: isEditable ? 'pointer' : 'default' }}>{m.text}</div>
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
    </div>
  );
};

export default ImpactMetricsRightImageSlideTemplate;

