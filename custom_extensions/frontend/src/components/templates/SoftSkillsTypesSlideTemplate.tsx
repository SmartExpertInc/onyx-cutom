// custom_extensions/frontend/src/components/templates/SoftSkillsTypesSlideTemplate.tsx

import React, { useState } from 'react';
import { SoftSkillsTypesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const SoftSkillsTypesSlideTemplate: React.FC<SoftSkillsTypesSlideProps & { theme?: SlideTheme | string; }> = ({
  slideId,
  title = 'Types of\nSoft Skills',
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
    backgroundColor: '#F2F2F2',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '56px',
    left: '56px',
    fontSize: '82px',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#333333',
    whiteSpace: 'pre-line',
  };

  const avatarCircleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    right: '56px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#8A6AD8',
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
    backgroundColor: '#E5E5E5',
    borderRadius: '6px',
    overflow: 'hidden',
    height: '340px',
  };

  const cardLabelStyles: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '20px',
    fontWeight: 600,
  };

  return (
    <div className="soft-skills-types-slide inter-theme" style={slideStyles}>
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
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={cardLabelStyles}>• {c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftSkillsTypesSlideTemplate;

