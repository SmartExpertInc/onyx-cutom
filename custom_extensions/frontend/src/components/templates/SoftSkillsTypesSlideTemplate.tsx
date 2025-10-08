// custom_extensions/frontend/src/components/templates/SoftSkillsTypesSlideTemplate.tsx

import React, { useState } from 'react';
import { SoftSkillsTypesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

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
  isEditable = false,
  onUpdate,
  theme,
}) => {
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
    top: '33px',
    left: '56px',
    fontSize: '60px',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#3C3C3C',
  };

  const avatarCircleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    right: '56px',
    width: '170px',
    height: '170px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#0F58F9',
  };

  const cardsRowStyles: React.CSSProperties = {
    position: 'absolute',
    left: '20px',
    right: '20px',
    bottom: '20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
  };

  const cardStyles: React.CSSProperties = {
    position: 'relative',
    backgroundColor: '#E5E5E5',
    borderRadius: '0px',
    overflow: 'hidden',
    height: '400px',
  };

  const cardLabelStyles: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#CAC7C6',
    padding: '6px 10px',
    fontSize: '25px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div className="soft-skills-types-slide inter-theme" style={slideStyles}>
      <style>{`
        .soft-skills-types-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .soft-skills-types-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      {/* Title */}
      <div style={titleStyles}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
            onCancel={() => setEditingTitle(false)}
            className="sst-title-editor title-element"
            multiline={true}
            style={{ ...titleStyles, position: 'relative', top: 0, left: 0 }}
          />
        ) : (
          <div className="title-element" onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
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
              <span style={{ fontSize: '41px', color: '#FFFFFF', lineHeight: 1, display: 'inline-block', marginRight: '8px' }}>•</span>
              <span style={{ fontSize: '18px', marginTop: '7px' }}>{c.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftSkillsTypesSlideTemplate;

