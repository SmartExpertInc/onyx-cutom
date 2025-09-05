// custom_extensions/frontend/src/components/templates/ResourcesListSlideTemplate.tsx

import React, { useState } from 'react';
import { ResourcesListSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const ResourcesListSlideTemplate: React.FC<ResourcesListSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Resources',
  resources = [
    { text: 'Resource 1: [Website/Book Title] - [Link/Author Name]' },
    { text: 'Resource 2: [Website/Book Title] - [Link/Author Name]' },
    { text: 'Resource 3: [Website/Book Title] - [Link/Author Name]' },
  ],
  logoPath = '',
  logoAlt = 'Your Logo',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  backgroundColor,
  barColor,
  titleColor,
  contentColor,
  isEditable = false,
  onUpdate,
  theme,
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingTitle, setEditingTitle] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#4A471F',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    bottom: '48px',
    fontSize: '64px',
    fontWeight: 800,
    color: '#D7D1B0',
  };

  const listContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '152px',
    left: '56px',
    right: '56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  };

  const itemStyles: React.CSSProperties = {
    backgroundColor: '#59562A',
    color: '#D7D1B0',
    borderRadius: '8px',
    padding: '28px 28px',
    fontSize: '28px',
    fontWeight: 600,
  };

  return (
    <div className="resources-list-slide inter-theme" style={slideStyles}>
      {/* Logo */}
      <div style={{ position: 'absolute', top: '40px', left: '48px' }}>
        {logoPath ? (
          <ClickableImagePlaceholder
            imagePath={logoPath}
            onImageUploaded={(p: string) => onUpdate && onUpdate({ logoPath: p })}
            size="SMALL"
            position="CENTER"
            description="Your Logo"
            isEditable={isEditable}
            style={{ height: '32px', width: '120px', objectFit: 'contain' }}
          />
        ) : (
          <div
            onClick={() => isEditable && setShowLogoUpload(true)}
            style={{ color: '#B9B48D', fontSize: '18px', cursor: isEditable ? 'pointer' : 'default' }}
          >
            Your Logo
          </div>
        )}
      </div>

      {/* Profile circle bottom-right */}
      <div style={{ position: 'absolute', right: '48px', bottom: '48px', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#919363' }}>
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

      {/* Items */}
      <div style={listContainerStyles}>
        {resources.slice(0, 3).map((r, i) => (
          <div key={i} style={itemStyles}>{r.text}</div>
        ))}
      </div>

      {/* Title */}
      <div style={titleStyles}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title}
            onSave={(v) => {
              setEditingTitle(false);
              onUpdate && onUpdate({ title: v });
            }}
            onCancel={() => setEditingTitle(false)}
            className="resources-title-editor"
            style={{ ...titleStyles, position: 'relative', left: 0, bottom: 0 }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
      </div>

      {showLogoUpload && (
        <PresentationImageUpload
          isOpen={showLogoUpload}
          onClose={() => setShowLogoUpload(false)}
          onImageUploaded={(p: string) => { onUpdate && onUpdate({ logoPath: p }); setShowLogoUpload(false); }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default ResourcesListSlideTemplate;

