// custom_extensions/frontend/src/components/templates/ResilienceBehaviorsSlideTemplate.tsx

import React, { useState } from 'react';
import { ResilienceBehaviorsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

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
    backgroundColor: '#B2B89C',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '88px',
    left: '64px',
    right: '420px',
    fontSize: '37px',
    maxWidth: '720px',
    fontWeight: 700,
    color: '#4E563B',
    lineHeight: 1.2,
  };

  const subtitleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '240px',
    left: '64px',
    right: '420px',
    fontSize: '18px',
    color: '#6B7155',
    lineHeight: 1.6,
  };

  const avatarCircleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '92px',
    right: '72px',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#6E7A64',
  };

  const bulletsGridStyles: React.CSSProperties = {
    position: 'absolute',
    left: '64px',
    right: '64px',
    bottom: '68px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: '36px',
    columnGap: '48px',
  };

  const bulletItemStyles: React.CSSProperties = {
    color: '#63694D',
    fontSize: '18px',
  };

  const bulletIndexStyles: React.CSSProperties = {
    color: '#63694D',
    fontSize: '18px',
    marginRight: '12px',
  };

  return (
    <div className="resilience-behaviors-slide inter-theme" style={slideStyles}>
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
          <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
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
          <div onClick={() => isEditable && setEditingSubtitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{subtitle}</div>
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

      {/* Bullets grid (8 items) */}
      <div style={bulletsGridStyles}>
        {bullets.slice(0, 8).map((b, i) => (
          <div key={i} style={bulletItemStyles}>
            <span style={bulletIndexStyles}>{String(i + 1).padStart(2, '0')}.</span>
            {b}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResilienceBehaviorsSlideTemplate;

