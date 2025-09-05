// custom_extensions/frontend/src/components/templates/StaySafeTipsSlideTemplate.tsx

import React, { useState } from 'react';
import { StaySafeTipsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const StaySafeTipsSlideTemplate: React.FC<StaySafeTipsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = '4 tips to staysafe online',
  tips = [
    { number: '1', heading: 'Know the scams', description: 'Read articles and blogs, follow the news, and share this so you can learn about different kinds of scams and what you can do to avoid them.' },
    { number: '2', heading: "Don't click", description: 'These phishing emails have links that lead to websites that can lure you into giving personal information or download malware to your computer' },
    { number: '3', heading: 'Shop safely', description: 'Don\'t shop on a site unless it has the "https". Also, protect yourself and use a credit card instead of a debit card while shopping online' },
    { number: '4', heading: 'Passwords', description: 'Do away with the "Fitguy1982" password and use an extremely uncrackable one like 9&4yiw2pyqx# Phrases are good too.' },
  ],
  actorImagePath = '',
  actorImageAlt = 'Actor image',
  backgroundColor,
  titleColor,
  contentColor,
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg } = currentTheme.colors;

  const [editingTitle, setEditingTitle] = useState(false);

  const handleTitleSave = (newTitle: string) => {
    setEditingTitle(false);
    if (onUpdate) onUpdate({ title: newTitle });
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#0E0E0E',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const leftPanelStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '66.5%',
    backgroundColor: '#FFFFFF',
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    top: '44px',
    left: '44px',
    fontSize: '76px',
    lineHeight: '1.05',
    fontWeight: 800,
    color: '#2b2b2b',
    maxWidth: '78%',
  };

  const tipsGridStyles: React.CSSProperties = {
    position: 'absolute',
    top: '280px',
    left: '44px',
    width: '61%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto auto',
    columnGap: '72px',
    rowGap: '64px',
  };

  const numberStyles: React.CSSProperties = {
    fontSize: '30px',
    fontWeight: 700,
    color: '#7E61F8',
    marginBottom: '8px',
  };

  const tipHeadingStyles: React.CSSProperties = {
    fontSize: '40px',
    fontWeight: 800,
    color: '#1f1f1f',
    marginBottom: '8px',
  };

  const tipDescStyles: React.CSSProperties = {
    fontSize: '16px',
    color: '#5f6a6a',
    lineHeight: 1.4,
    maxWidth: '95%',
  };

  const rightPanelStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '33.5%',
    backgroundColor: '#0E0E0E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="stay-safe-tips-slide inter-theme" style={slideStyles}>
      {/* Left white content panel */}
      <div style={leftPanelStyles} />

      {/* Title */}
      <div style={titleStyles}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="stay-safe-title-editor"
            style={{ ...titleStyles, position: 'relative', top: 0, left: 0 }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingTitle(true)}
            style={{ cursor: isEditable ? 'pointer' : 'default', userSelect: 'none' }}
          >
            {title}
          </div>
        )}
      </div>

      {/* Tips grid */}
      <div style={tipsGridStyles}>
        {tips.slice(0, 4).map((tip, index) => (
          <div key={index}>
            <div style={numberStyles}>{tip.number}</div>
            <div style={tipHeadingStyles}>{tip.heading}</div>
            <div style={tipDescStyles}>{tip.description}</div>
          </div>
        ))}
      </div>

      {/* Right actor image over black */}
      <div style={rightPanelStyles}>
        <ClickableImagePlaceholder
          imagePath={actorImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ actorImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Actor image"
          isEditable={isEditable}
          style={{ width: '92%', height: '92%', objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default StaySafeTipsSlideTemplate;

