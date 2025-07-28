// custom_extensions/frontend/src/components/templates/ChallengesSolutionsTemplate.tsx

import React from 'react';
import { ChallengesSolutionsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsProps & { theme?: SlideTheme }> = ({
  slideId,
  title,
  challengesTitle = 'Виклики',
  solutionsTitle = 'Рішення',
  challenges,
  solutions,
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor: currentTheme.colors.backgroundColor,
    padding: '60px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontWeight: 700,
    color: currentTheme.colors.titleColor,
    fontFamily: currentTheme.fonts.titleFont,
    textAlign: 'center',
    marginBottom: '50px',
    lineHeight: 1.3,
    maxWidth: '900px',
    margin: '0 auto 50px auto'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    maxWidth: '1000px',
    margin: '0 auto'
  };

  const calloutBoxStyles = (bgColor: string): React.CSSProperties => ({
    backgroundColor: bgColor,
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  });

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.titleFont,
    margin: 0
  };

  const listStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const listItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
    fontSize: currentTheme.fonts.contentSize,
    lineHeight: 1.5,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont
  };

  const bulletStyles: React.CSSProperties = {
    minWidth: '6px',
    width: '6px',
    height: '6px',
    backgroundColor: currentTheme.colors.contentColor,
    borderRadius: '50%',
    marginTop: '8px'
  };

  const editOverlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    display: isEditable ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  // SVG Icons
  const XMarkIcon = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 512 512" 
      fill={currentTheme.colors.accentColor}
      style={{ flexShrink: 0 }}
    >
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 512 512" 
      fill={currentTheme.colors.accentColor}
      style={{ flexShrink: 0 }}
    >
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
    </svg>
  );

  const handleClick = () => {
    if (isEditable && onUpdate) {
      onUpdate({ slideId });
    }
  };

  return (
    <div className="challenges-solutions-template" style={slideStyles} onClick={handleClick}>
      {/* Main Title */}
      <h1 style={titleStyles}>
        {title}
      </h1>

      {/* Two Column Grid */}
      <div style={gridStyles}>
        {/* Challenges Column */}
        <div style={calloutBoxStyles(currentTheme.colors.backgroundColor)}>
          <div style={headerStyles}>
            <XMarkIcon />
            <h2 style={sectionTitleStyles}>{challengesTitle}</h2>
          </div>
          <ul style={listStyles}>
            {challenges.map((challenge, index) => (
              <li key={index} style={listItemStyles}>
                <div style={bulletStyles}></div>
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions Column */}
        <div style={calloutBoxStyles(currentTheme.colors.backgroundColor)}>
          <div style={headerStyles}>
            <CheckIcon />
            <h2 style={sectionTitleStyles}>{solutionsTitle}</h2>
          </div>
          <ul style={listStyles}>
            {solutions.map((solution, index) => (
              <li key={index} style={listItemStyles}>
                <div style={bulletStyles}></div>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Edit Overlay */}
      <div style={editOverlayStyles}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          Натисніть для редагування викликів та рішень
        </div>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate; 