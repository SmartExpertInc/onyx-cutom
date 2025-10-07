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
  const [editingBullet, setEditingBullet] = useState<number | null>(null);

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
    background: 'linear-gradient(to bottom, #0F58F9, #1023A1)',
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '45px',
    left: '310px',
    right: '40px',
    fontSize: '37px',
    maxWidth: '720px',
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.2,
  };

  const subtitleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '155px',
    left: '310px',
    right: '170px',
    fontSize: '18px',
    color: '#CFDAF7',
    lineHeight: 1.6,
  };

  const avatarCircleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    left: '70px',
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
    flexDirection: 'column',
    gap: '20px',
    color: '#34353C',
    fontSize: '17px',
    lineHeight: 1.4,
    paddingRight: '80px',
  };

  const bulletNumberStyles: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '3px',
    backgroundColor: '#0F58F9',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 700,
    marginRight: '16px',
    flexShrink: 0,
    alignSelf: 'flex-start',
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
          font-weight: 900 !important;
        }
        .resilience-subtitle {
          font-weight: 400 !important;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .resilience-bullet-text {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .resilience-bullet-number {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
      `}</style>
      <div className="resilience-behaviors-slide inter-theme" style={slideStyles}>
        {/* Top Section - Dark Blue */}
        <div style={topSectionStyles}>

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
        </div>

        {/* Bottom Section - Light Blue */}
        <div style={bottomSectionStyles}>
          {/* Bullets grid (8 items) */}
          <div style={bulletsGridStyles}>
            {bullets.slice(0, 8).map((b, i) => (
              <div key={i} style={bulletItemStyles}>
                <div className="resilience-bullet-number" style={bulletNumberStyles}>{i + 1}</div>
                {isEditable && editingBullet === i ? (
                  <ImprovedInlineEditor
                    initialValue={b}
                    onSave={(v) => {
                      const updatedBullets = [...bullets];
                      updatedBullets[i] = v;
                      onUpdate && onUpdate({ bullets: updatedBullets });
                      setEditingBullet(null);
                    }}
                    onCancel={() => setEditingBullet(null)}
                    multiline={true}
                    className="resilience-bullet-text"
                    style={{ ...bulletItemStyles, position: 'relative', top: 0, left: 0, right: 0 }}
                  />
                ) : (
                  <div className="resilience-bullet-text" onClick={() => isEditable && setEditingBullet(i)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{b}</div>
                )}
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
            color="#09090B"
            text={logoText}
          />
        </div>
      </div>
    </>
  );
};

export default ResilienceBehaviorsSlideTemplate;

