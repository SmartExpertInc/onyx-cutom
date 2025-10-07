// custom_extensions/frontend/src/components/templates/ResilienceBehaviorsSlideTemplate.tsx

import React, { useState } from 'react';
import { ResilienceBehaviorsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import YourLogo from '../YourLogo';

export const ResilienceBehaviorsSlideTemplate: React.FC<ResilienceBehaviorsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Research shows that resilient employees engage in three specific behaviors.',
  subtitle = 'Research shows that resilient employees engage in three specific behaviors. These help them remain focused and optimistic despite setbacks or uncertainty:',
  bullets = [
    'Pay attention to your health',
    'Focus on your physical well-being',
    'Practice relaxation techniques',
    'Practice reframing threats as challenges',
    'Watch your stress levels',
    'Mind your mindset',
    'Practice self-awareness',
    'Get connected',
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile',
  logoText = 'Your Logo',
  logoPath = '',
  isEditable = false,
  onUpdate,
  theme,
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const topSectionStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#0F58F9',
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '88px',
    left: '64px',
    right: '420px',
    fontSize: '37px',
    maxWidth: '720px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
  };

  const subtitleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '180px',
    left: '64px',
    right: '420px',
    fontSize: '18px',
    color: '#FFFFFF',
    lineHeight: 1.6,
  };

  const avatarCircleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '60px',
    right: '72px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    border: '3px solid #FFFFFF',
  };

  const bottomSectionStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#E0E7FF',
    padding: '60px 64px 80px 64px',
  };

  const bulletsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: '36px',
    columnGap: '48px',
  };

  const bulletItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    color: '#5D5D5D',
    fontSize: '18px',
    lineHeight: 1.4,
  };

  const bulletNumberStyles: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0F58F9',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 700,
    marginRight: '16px',
    flexShrink: 0,
  };

  const pageNumberStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    left: '64px',
    color: '#5D5D5D',
    fontSize: '13px',
    fontWeight: 400,
  };

  const logoStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    right: '64px',
  };

  return (
    <>
      <style>{`
        .resilience-title {
          font-weight: 800 !important;
        }
        .resilience-subtitle {
          font-weight: 400 !important;
        }
      `}</style>
      <div className="resilience-behaviors-slide inter-theme" style={slideStyles}>
        {/* Top Section - Dark Blue */}
        <div style={topSectionStyles}>
          {/* Title */}
          <div style={titleStyles}>
            {isEditable && editingTitle ? (
              <ImprovedInlineEditor
                initialValue={title}
                onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
                onCancel={() => setEditingTitle(false)}
                className="resilience-title-editor"
                style={{ ...titleStyles, position: 'relative', top: 0, left: 0, right: 0 }}
              />
            ) : (
              <div className="resilience-title" onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
            )}
          </div>

          {/* Subtitle */}
          <div style={subtitleStyles}>
            {isEditable && editingSubtitle ? (
              <ImprovedInlineEditor
                initialValue={subtitle}
                onSave={(v) => { onUpdate && onUpdate({ subtitle: v }); setEditingSubtitle(false); }}
                onCancel={() => setEditingSubtitle(false)}
                className="resilience-subtitle-editor"
                multiline={true}
                style={{ ...subtitleStyles, position: 'relative', top: 0, left: 0, right: 0 }}
              />
            ) : (
              <div className="resilience-subtitle" onClick={() => isEditable && setEditingSubtitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{subtitle}</div>
            )}
          </div>

          {/* Avatar */}
          <div style={avatarCircleStyles}>
            <ClickableImagePlaceholder
              imagePath={profileImagePath}
              onImageUploaded={(p: string) => onUpdate && onUpdate({ profileImagePath: p })}
              size="LARGE"
              position="CENTER"
              description="Profile"
              isEditable={isEditable}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Bottom Section - Light Blue */}
        <div style={bottomSectionStyles}>
          {/* Bullets grid (8 items) */}
          <div style={bulletsGridStyles}>
            {bullets.slice(0, 8).map((b, i) => (
              <div key={i} style={bulletItemStyles}>
                <div style={bulletNumberStyles}>{i + 1}</div>
                <div>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Page Number */}
        <div style={pageNumberStyles}>38</div>

        {/* Logo */}
        <div style={logoStyles}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
            isEditable={isEditable}
            color="#5D5D5D"
            text={logoText}
          />
        </div>
      </div>
    </>
  );
};

export default ResilienceBehaviorsSlideTemplate;

