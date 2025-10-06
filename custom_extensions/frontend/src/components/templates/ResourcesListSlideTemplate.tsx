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
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    top: '100px',
    fontSize: '53px',
    fontWeight: 800,
    color: '#FFFFFF',
  };

  const listContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '200px',
    left: '56px',
    right: '56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  };



  const itemStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    color: '#09090B',
    borderRadius: '2px',
    padding: '15px 15px',
    fontSize: '28px',
    fontWeight: 600,
  };

  return (
    <div className="resources-list-slide inter-theme" style={slideStyles}>
      <style>{`
        .resources-list-slide *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .resources-list-slide .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      {/* Logo */}
      <div style={{ position: 'absolute', top: '30px', left: '30px' }}>
        {logoPath ? (
          <ClickableImagePlaceholder
            imagePath={logoPath}
            onImageUploaded={(p: string) => onUpdate && onUpdate({ logoPath: p })}
            size="SMALL"
            position="CENTER"
            description="Your Logo"
            isEditable={isEditable}
            style={{ height: '30px', maxWidth: '120px', objectFit: 'contain' }}
          />
        ) : (
          <div
            onClick={() => isEditable && setShowLogoUpload(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #ffffff',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#ffffff', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#ffffff', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#ffffff', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Profile Image */}
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '60px',
        width: '170px',
        height: '170px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ profileImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Profile photo"
          isEditable={isEditable}
          style={{
            width: '110%',
            height: '110%',
            borderRadius: '50%',
            position: 'relative',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            objectFit: 'cover'
          }}
        />
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
            className="resources-title-editor title-element"
            style={{ ...titleStyles, position: 'relative', left: 0, top: 0 }}
          />
        ) : (
          <div className="title-element" onClick={() => isEditable && setEditingTitle(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>{title}</div>
        )}
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

