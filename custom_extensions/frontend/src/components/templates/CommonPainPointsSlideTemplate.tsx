// custom_extensions/frontend/src/components/templates/CommonPainPointsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface CommonPainPointsProps extends BaseTemplateProps {
  title: string;
  painPoints: Array<{
    text: string;
    iconType: 'document' | 'message' | 'arrow';
  }>;
  avatarPath?: string;
  logoPath?: string;
  pageNumber?: string;
  tagText?: string;
}

export const CommonPainPointsSlideTemplate: React.FC<CommonPainPointsProps & { theme?: SlideTheme | string }> = ({
  title = 'Common Pain Points',
  painPoints = [
    { text: 'Hindered career progression and access to valuable resources.', iconType: 'document' },
    { text: 'Strained communication and reduced effectiveness.', iconType: 'message' },
    { text: 'Missed opportunities for collaboration and growth.', iconType: 'arrow' }
  ],
  avatarPath = '',
  logoPath = '',
  pageNumber = '31',
  tagText = 'Pain Points',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#E0E7FF', 
    color:'#333333', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    display: 'flex',
    overflow: 'hidden'
  };

  // Left section with text
  const leftSection: React.CSSProperties = {
    width: '50%',
    height: '100%',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 60px',
    justifyContent: 'flex-start'
  };

  // Right section with image
  const rightSection: React.CSSProperties = {
    width: '50%',
    height: '100%',
    backgroundColor: '#2563EB',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '16px 0 0 16px'
  };

  // Tag container
  const tagContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F3F4F6',
    padding: '6px 12px',
    borderRadius: '20px',
    width: 'fit-content',
    marginBottom: '30px'
  };

  const tagDot: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2563EB'
  };

  const tagTextStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 400,
    color: '#09090B',
    margin: 0
  };

  // Title style
  const titleStyle: React.CSSProperties = {
    fontSize: '56px',
    fontWeight: 700,
    color: '#09090B',
    lineHeight: 1.2,
    margin: 0,
    marginBottom: '40px',
    fontFamily: "'Lora', serif"
  };

  // Pain points list
  const painPointsList: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  };

  // Pain point item
  const painPointItem: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  };

  // Icon container
  const iconContainer: React.CSSProperties = {
    width: '48px',
    height: '48px',
    backgroundColor: '#2563EB',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  // Icon image style
  const iconImageStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    objectFit: 'contain'
  };

  // Pain point text style
  const painPointTextStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 400,
    color: '#09090B',
    lineHeight: 1.6,
    margin: 0,
    flex: 1
  };

  // Avatar container
  const avatarContainer: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  const avatarImageStyle: React.CSSProperties = {
    width: '70%',
    height: '90%',
    objectFit: 'contain',
    position: 'relative'
  };

  // Footer - Logo
  const footerContainer: React.CSSProperties = {
    position: 'absolute',
    bottom: '30px',
    right: '60px',
    zIndex: 10
  };

  // Page number with line - bottom-left
  const pageNumberContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    zIndex: 10
  };

  const pageNumberLineStyle: React.CSSProperties = {
    width: '32px',
    height: '1.5px',
    backgroundColor: 'rgba(9, 9, 11, 0.6)'
  };

  const pageNumberStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 300,
    color: 'rgba(9, 9, 11, 0.6)',
    fontFamily: currentTheme.fonts.contentFont,
    margin: 0
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

  const getIconPath = (iconType: string) => {
    // Try different possible paths
    const basePath = '/icons';
    switch(iconType) {
      case 'document':
        return `${basePath}/documentPainPoints.png`;
      case 'message':
        return `${basePath}/messagePainPoints.png`;
      case 'arrow':
        return `${basePath}/topArrowPainPoints.png`;
      default:
        return '';
    }
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ logoPath: newLogoPath });
    }
  };

  return (
    <div style={slide}>
      {/* Left Section */}
      <div style={leftSection}>
        {/* Tag */}
        <div style={tagContainer}>
          <div style={tagDot} />
          <div style={tagTextStyle} onClick={() => isEditable && setEditKey('tagText')}>
            {isEditable && editKey === 'tagText' ? (
              <ImprovedInlineEditor 
                initialValue={tagText} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ tagText: value }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(tagTextStyle)} 
              />
            ) : (
              tagText
            )}
          </div>
        </div>

        {/* Title */}
        <div style={titleStyle} onClick={() => isEditable && setEditKey('title')}>
          {isEditable && editKey === 'title' ? (
            <ImprovedInlineEditor 
              initialValue={title} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ title: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(titleStyle)} 
            />
          ) : (
            title
          )}
        </div>

        {/* Pain Points */}
        <div style={painPointsList}>
          {painPoints.map((point, index) => (
            <div key={index} style={painPointItem}>
              <div style={iconContainer}>
                <img 
                  src={getIconPath(point.iconType)} 
                  alt={point.iconType}
                  style={iconImageStyle}
                  onError={(e) => {
                    console.error(`Failed to load icon: ${getIconPath(point.iconType)}`);
                    // Try to load from public root if /icons/ doesn't work
                    const img = e.target as HTMLImageElement;
                    const altPath = getIconPath(point.iconType).replace('/icons/', '/');
                    if (altPath !== getIconPath(point.iconType) && !img.dataset.triedAlt) {
                      img.dataset.triedAlt = 'true';
                      img.src = altPath;
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
              </div>
              <div style={painPointTextStyle} onClick={() => isEditable && setEditKey(`text-${index}`)}>
                {isEditable && editKey === `text-${index}` ? (
                  <ImprovedInlineEditor 
                    initialValue={point.text} 
                    multiline={true}
                    onSave={(value) => { 
                      const newPoints = [...painPoints];
                      newPoints[index] = { ...newPoints[index], text: value };
                      onUpdate && onUpdate({ painPoints: newPoints }); 
                      setEditKey(null); 
                    }} 
                    onCancel={() => setEditKey(null)} 
                    style={inline(painPointTextStyle)} 
                  />
                ) : (
                  point.text
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div style={rightSection}>
        <div style={avatarContainer}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(path) => onUpdate && onUpdate({ avatarPath: path })}
            description="Avatar" 
            isEditable={isEditable} 
            style={avatarImageStyle} 
          />
        </div>
      </div>

      {/* Page number with line - bottom-left */}
      <div style={pageNumberContainerStyle}>
        <div style={pageNumberLineStyle} />
        <div style={pageNumberStyle} onClick={() => isEditable && setEditKey('pageNumber')}>
          {isEditable && editKey === 'pageNumber' ? (
            <ImprovedInlineEditor 
              initialValue={pageNumber} 
              onSave={(value) => { 
                onUpdate && onUpdate({ pageNumber: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(pageNumberStyle)} 
            />
          ) : (
            pageNumber
          )}
        </div>
      </div>

      {/* Footer - Logo */}
      <div style={footerContainer}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={handleLogoUploaded}
          isEditable={isEditable}
          color="#09090B"
          text="Your Logo"
        />
      </div>
    </div>
  );
};

export default CommonPainPointsSlideTemplate;

