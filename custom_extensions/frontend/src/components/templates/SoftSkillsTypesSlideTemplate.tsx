// custom_extensions/frontend/src/components/templates/SoftSkillsTypesSlideTemplate.tsx

import React, { useState } from 'react';
import { SoftSkillsTypesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import YourLogo from '../YourLogo';

export const SoftSkillsTypesSlideTemplate: React.FC<SoftSkillsTypesSlideProps & { theme?: SlideTheme | string; }> = ({
<<<<<<< HEAD
  slideId,
=======
  slideId: _slideId,
>>>>>>> origin/slides-ai-fix-valeria
  title = 'Types of Soft Skills',
  cards = [
    { label: 'Time management' },
    { label: 'Team work' },
    { label: 'Work ethic' },
  ],
  profileImagePath = '',
<<<<<<< HEAD
  profileImageAlt = 'Profile',
  logoText = 'Your Logo',
=======
  profileImageAlt: _profileImageAlt = 'Profile',
>>>>>>> origin/slides-ai-fix-valeria
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
<<<<<<< HEAD
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
=======
    top: '96px',
    left: '56px',
    fontSize: '60px',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#09090B',
>>>>>>> origin/slides-ai-fix-valeria
  };

  const avatarCircleStyles: React.CSSProperties = {
    position: 'absolute',
<<<<<<< HEAD
    top: '48px',
    right: '48px',
    width: '150px',
    height: '150px',
=======
    top: '40px',
    right: '44px',
    width: '170px',
    height: '170px',
>>>>>>> origin/slides-ai-fix-valeria
    borderRadius: '50%',
    backgroundColor: '#0F58F9',
    overflow: 'hidden',
<<<<<<< HEAD
    backgroundColor: '#0F58F9',
=======
>>>>>>> origin/slides-ai-fix-valeria
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
    backgroundColor: '#FFFFFF',
    borderRadius: '0px',
    overflow: 'hidden',
<<<<<<< HEAD
    height: '340px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
=======
    height: '400px',
>>>>>>> origin/slides-ai-fix-valeria
  };

  const cardLabelStyles: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#FFFFFF',
<<<<<<< HEAD
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
=======
    padding: '6px 10px',
    fontSize: '25px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
>>>>>>> origin/slides-ai-fix-valeria
  };

  return (
    <div className="soft-skills-types-slide inter-theme" style={slideStyles}>
<<<<<<< HEAD
=======
      <style>{`
        .soft-skills-types-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .soft-skills-types-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      
>>>>>>> origin/slides-ai-fix-valeria
      {/* Logo */}
      <YourLogo
        logoPath={logoPath}
        onLogoUploaded={(p: string) => onUpdate && onUpdate({ logoPath: p })}
        isEditable={isEditable}
<<<<<<< HEAD
        color="#000000"
        text={logoText}
        style={logoStyles}
=======
        color="#09090B"
        fontSize="17px"
        text="Your Logo"
        style={{ position: 'absolute', left: '20px', top: '20px' }}
>>>>>>> origin/slides-ai-fix-valeria
      />

      {/* Title */}
      {isEditable && editingTitle ? (
        <ImprovedInlineEditor
          initialValue={title}
          onSave={(v) => { onUpdate && onUpdate({ title: v }); setEditingTitle(false); }}
          onCancel={() => setEditingTitle(false)}
          className="sst-title-editor title-element"
          multiline={true}
          style={{ ...titleStyles, background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, width: 'fit-content', maxWidth: '1200px' }}
        />
      ) : (
        <div 
          className="title-element" 
          onClick={() => isEditable && setEditingTitle(true)} 
          style={{ 
            ...titleStyles, 
            cursor: isEditable ? 'pointer' : 'default',
            padding: 0,
            margin: 0,
            width: 'fit-content',
            maxWidth: '1200px'
          }}
        >
          {title}
        </div>
      )}

      {/* Avatar */}
      <div style={avatarCircleStyles}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ profileImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Profile"
          isEditable={isEditable}
<<<<<<< HEAD
          style={{ height: '102%', borderRadius: '50%', objectFit: 'cover' }}
=======
          style={{ width: '110%', height: '110%', borderRadius: '50%', position: 'relative', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', objectFit: 'cover' }}
>>>>>>> origin/slides-ai-fix-valeria
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
<<<<<<< HEAD
              <div style={playIconStyles}></div>
              <span>{c.label}</span>
=======
              <svg width="10" height="12" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', flexShrink: 0 }}>
                <path d="M6 2.73354C6.66667 3.11844 6.66667 4.08069 6 4.46559L1.5 7.06367C0.833334 7.44857 -3.3649e-08 6.96745 0 6.19765L2.2713e-07 1.00149C2.60779e-07 0.231693 0.833333 -0.249434 1.5 0.135466L6 2.73354Z" fill="#FFFFFF"/>
              </svg>
              <span style={{ fontSize: '23px' }}>{c.label}</span>
>>>>>>> origin/slides-ai-fix-valeria
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftSkillsTypesSlideTemplate;

