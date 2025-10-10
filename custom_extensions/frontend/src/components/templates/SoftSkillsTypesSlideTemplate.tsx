// custom_extensions/frontend/src/components/templates/SoftSkillsTypesSlideTemplate.tsx

import React, { useState } from 'react';
import { SoftSkillsTypesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import YourLogo from '../YourLogo';

export const SoftSkillsTypesSlideTemplate: React.FC<SoftSkillsTypesSlideProps & { theme?: SlideTheme | string; }> = ({
  slideId,
  title = 'Types of Soft Skills',
  cards = [
    { label: 'Time management' },
    { label: 'Team work' },
    { label: 'Work ethic' },
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile',
  logoText = 'Your Logo',
  logoPath = '',
  isEditable = false,
  onUpdate,
  theme,
}: SoftSkillsTypesSlideProps & { theme?: SlideTheme | string; }) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '22%',
    left: '28%',
    transform: 'translate(-50%, -50%)',
    fontSize: '56px',
    lineHeight: 1.1,
    fontWeight: 400,
    color: '#000000',
    fontFamily: 'serif',
    textAlign: 'center',
    margin: 0,
    padding: 0,
  };

  const logoStyles: React.CSSProperties = {
    position: 'absolute',
    top: '48px',
    left: '48px',
    color: '#000000',
    fontSize: '16px',
    fontWeight: 500,
  };

  const avatarCircleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '48px',
    right: '48px',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#0F58F9',
  };

  const cardsRowStyles: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    right: '56px',
    bottom: '64px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '28px',
  };

  const cardStyles: React.CSSProperties = {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: '0px',
    overflow: 'hidden',
    height: '340px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  };

  const cardLabelStyles: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'sans-serif',
  };

  const playIconStyles: React.CSSProperties = {
    width: '0',
    height: '0',
    borderLeft: '8px solid #FFFFFF',
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    marginRight: '8px',
  };

  return (
    <div className="soft-skills-types-slide inter-theme" style={slideStyles}>
      {/* Logo */}
      <YourLogo
        logoPath={logoPath}
        onLogoUploaded={(p: string) => onUpdate && onUpdate({ logoPath: p })}
        isEditable={isEditable}
        color="#000000"
        text={logoText}
        style={logoStyles}
      />

      {/* Title */}
      <div style={titleStyles}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={() => setEditingTitle(false)}
            className="sst-title-editor"
            multiline={true}
            style={{ ...titleStyles, position: 'relative', top: 0, left: 0 }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
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
          style={{ height: '102%', borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>

      {/* Cards */}
      <div style={cardsRowStyles}>
        {cards.slice(0, 3).map((c, i) => (
          <div key={i} style={cardStyles}>
            <ClickableImagePlaceholder
              imagePath={c.imagePath || ''}
              onImageUploaded={(p: string) => {
                const next = [...cards];
                next[i] = { ...next[i], imagePath: p };
                onUpdate && onUpdate({ cards: next });
              }}
              size="LARGE"
              position="CENTER"
              description="Card image"
              isEditable={isEditable}
              style={{ width: '100%', height: '100%', borderRadius: '0px', objectFit: 'cover' }}
            />
            <div style={cardLabelStyles}>
              <div style={playIconStyles}></div>
              <span>{c.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftSkillsTypesSlideTemplate;

