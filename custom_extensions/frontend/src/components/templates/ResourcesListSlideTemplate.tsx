// custom_extensions/frontend/src/components/templates/ResourcesListSlideTemplate.tsx

import React, { useState } from 'react';
import { ResourcesListSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';


  // Helper function for inline editor styling
  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0
  });

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
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#4D4828',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    bottom: '33px',
    fontSize: '53px',
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
    backgroundColor: '#58552E',
    color: '#D6D2AC',
    borderRadius: '2px',
    padding: '15px 15px',
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
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isEditable ? 'pointer' : 'default' }}
            onClick={() => isEditable && setShowLogoUpload(true)}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #B9B48D',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#B9B48D', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#B9B48D', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <div style={{ color: '#B9B48D', fontSize: '18px' }}>Your Logo</div>
          </div>
        )}
      </div>

      {/* Profile circle bottom-right */}
      <div style={{ position: 'absolute', right: '48px', bottom: '11px', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#9E9E58' }}>
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
          <div key={i} style={itemStyles}>
            {isEditable && editingResourceIndex === i ? (
              <ImprovedInlineEditor
                initialValue={r.text}
                onSave={(v) => {
                  const next = [...resources];
                  next[i] = { text: v };
                  setEditingResourceIndex(null);
                  onUpdate && onUpdate({ resources: next });
                }}
                onCancel={() => setEditingResourceIndex(null)}
                className="resources-item-editor"
                multiline={true}
                style={{ fontSize: '28px', fontWeight: 600, color: '#D7D1B0' }}
              />
            ) : (
              <div onClick={() => isEditable && setEditingResourceIndex(i)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
                {r.text}
              </div>
            )}
          </div>
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

