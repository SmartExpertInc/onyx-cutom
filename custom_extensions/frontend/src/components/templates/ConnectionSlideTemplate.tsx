// custom_extensions/frontend/src/components/templates/ConnectionSlideTemplate.tsx

import React from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface ConnectionSlideProps extends BaseTemplateProps {
  title?: string;
  description?: string;
  avatarPath?: string;
}

export const ConnectionSlideTemplate: React.FC<ConnectionSlideProps & { theme?: SlideTheme | string }> = ({
  slideId,
  title = 'Connection',
  description = 'Connections create trust, encourage open communication, and build a culture of collaboration.',
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const slide: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#121212',
    position: 'relative',
    overflow: 'hidden',
    color: '#d1d5db',
    fontFamily: currentTheme.fonts.titleFont,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
  };

  const left: React.CSSProperties = {
    padding: '72px 56px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '72px',
    color: '#d1d5db',
    fontWeight: 800,
    marginBottom: '20px'
  };

  const desc: React.CSSProperties = {
    fontSize: '22px',
    lineHeight: 1.5,
    maxWidth: '620px',
    color: '#aeb3bb'
  };

  const right: React.CSSProperties = {
    position: 'relative',
    background: 'linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4))',
  };

  const venn: React.CSSProperties = {
    position: 'absolute',
    right: '80px',
    top: '120px',
    width: '560px',
    height: '560px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.35)',
  };

  const small: React.CSSProperties = {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.35)',
    top: '240px',
    right: '220px'
  };

  const smallRight: React.CSSProperties = {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.35)',
    top: '240px',
    right: '40px'
  };

  const footer: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '82px',
    backgroundColor: '#0a0a0a',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    columnGap: '8px',
    padding: '8px 24px',
    borderTop: '1px solid #2b2b2b'
  };

  const tab: React.CSSProperties = {
    backgroundColor: '#1b1b1b',
    color: '#c8c8c8',
    border: '1px solid #2f2f2f',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  };

  return (
    <div className="connection-slide inter-theme" style={slide}>
      <div style={left}>
        <div style={titleStyle}>{title}</div>
        <div style={desc}>{description}</div>

        {/* Avatar */}
        <div style={{ marginTop: '56px', width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden' }}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(p: string) => onUpdate && onUpdate({ avatarPath: p })}
            size="LARGE"
            position="CENTER"
            description="Avatar"
            isEditable={isEditable}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      </div>

      <div style={right}>
        <div style={venn} />
        <div style={small} />
        <div style={smallRight} />
      </div>

      <div style={footer}>
        {['The Problem','The Solution','Guiding the way','Connection','Transformation','The Journey'].map((t, i) => (
          <div key={i} style={{ ...tab, outline: i===3 ? '2px solid #2563eb' : 'none' }}>{t}</div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionSlideTemplate;

