// custom_extensions/frontend/src/components/templates/NegativeImpactsGridSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface NegativeImpactsGridProps extends BaseTemplateProps {
  title?: string;
  topLeft: {
    iconPath?: string;
  };
  topMiddle: {
    iconPath?: string;
  };
  topRight: {
    iconPath?: string;
  };
  bottomLeft: {
    title: string;
    description: string;
  };
  bottomMiddle: {
    title: string;
    description: string;
  };
  bottomRight: {
    title: string;
    description: string;
  };
  avatarPath?: string;
  tagText?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const NegativeImpactsGridSlideTemplate: React.FC<NegativeImpactsGridProps & { theme?: SlideTheme | string }> = ({
  title = 'Pain Points',
  topLeft = {
    iconPath: '/financialLosses.png'
  },
  topMiddle = {
    iconPath: '/fines.png'
  },
  topRight = {
    iconPath: '/lossOfTrust.png'
  },
  bottomLeft = {
    title: 'Financial losses',
    description: 'Data breaches and cyberattacks can result in severe financial losses, averaging over $8 million per incident.'
  },
  bottomMiddle = {
    title: 'Fines',
    description: 'Data breaches and cyberattacks can result in severe financial losses, averaging over $8 million per incident.'
  },
  bottomRight = {
    title: 'Loss of trust',
    description: 'Data breaches and cyberattacks can result in severe financial losses, averaging over $8 million per incident.'
  },
  avatarPath = '',
  tagText = 'Presentation',
  logoPath = '',
  pageNumber = '33',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#FFFFFF', 
    color:'#333333', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    display: 'flex',
    overflow: 'hidden'
  };

  // Left sidebar - blue background with gradient
  const leftSidebar: React.CSSProperties = {
    width: '35%',
    height: '100%',
    background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    justifyContent: 'space-between'
  };

  // Title style - white text on blue
  const titleStyle: React.CSSProperties = {
    fontSize: '64px',
    fontWeight: 500,
    color: '#FFFFFF',
    lineHeight: 1.1,
    margin: 0,
    fontFamily: "'Lora', serif",
    marginTop: '-120px',
    marginLeft: '40px'
  };

  // Avatar container - bottom left
  const avatarContainer: React.CSSProperties = {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    marginBottom: '35px',
    marginLeft: '40px'
  };

  const avatarImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
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
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  };

  const pageNumberStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 300,
    color: '#FFFFFF',
    fontFamily: currentTheme.fonts.contentFont,
    margin: 0
  };

  // Right content area - grid
  const rightContent: React.CSSProperties = {
    width: '65%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '0',
    overflow: 'hidden'
  };

  // Top Left - Light blue
  const topLeftStyle: React.CSSProperties = {
    backgroundColor: '#E0E7FF',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  // Top Middle - White
  const topMiddleStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  // Top Right - Gray
  const topRightStyle: React.CSSProperties = {
    backgroundColor: '#BBBBBB',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  // Bottom Left - White
  const bottomLeftStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    justifyContent: 'flex-start'
  };

  // Bottom Middle - Light blue
  const bottomMiddleStyle: React.CSSProperties = {
    backgroundColor: '#E0E7FF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    justifyContent: 'flex-start'
  };

  // Bottom Right - White
  const bottomRightStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    justifyContent: 'flex-start'
  };

  // Logo container
  const logoContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  // Tag style - Presentation tag in top-left of grid
  const tagStyle: React.CSSProperties = {
    position: 'absolute',
    top: '33px',
    left: '40px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    padding: '10px 25px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '19px',
    borderRadius: '50px',
    fontWeight: 400,
    color: '#374151',
    fontFamily: currentTheme.fonts.contentFont,
    zIndex: 10
  };

  const tagDotStyle: React.CSSProperties = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#4285F4'
  };

  // Icon style for top sections
  const iconStyle: React.CSSProperties = {
    width: '62%',
    objectFit: 'contain',
    position: 'absolute',
    bottom: '50px',
  };

  // Title style for bottom sections
  const bottomTitleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#09090B',
    lineHeight: 1.3,
    margin: 0,
    marginBottom: '16px',
    fontFamily: "'Inter', sans-serif",
    minHeight: '72px', // Фиксированная высота для выравнивания описаний
    display: 'flex',
    alignItems: 'flex-start'
  };

  // Description style for bottom sections
  const descriptionStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 400,
    color: '#09090B',
    lineHeight: 1.5,
    margin: 0,
    marginTop: '0' // Единый отступ для всех описаний
  };

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

  const getIconPath = (iconPath?: string) => {
    if (!iconPath) return '';
    const basePath = '/custom-projects-ui';
    // If path already starts with /, use it directly, otherwise add basePath
    if (iconPath.startsWith('/')) {
      return `${basePath}${iconPath}`;
    }
    return `${basePath}/${iconPath}`;
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ logoPath: newLogoPath });
    }
  };

  return (
    <div style={slide}>
      {/* Left Sidebar - Blue */}
      <div style={leftSidebar}>
        {/* Logo */}
        <div style={logoContainer}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={handleLogoUploaded}
            isEditable={isEditable}
            color="#FFFFFF"
            text="Your Logo"
          />
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
            title.split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {word}
                {i < title.split(' ').length - 1 && <br />}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Avatar */}
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

      {/* Right Content - Grid */}
      <div style={rightContent}>
        {/* Top Left */}
        <div style={topLeftStyle}>
          {/* Tag */}
          <div style={tagStyle} onClick={() => isEditable && setEditKey('tag')}>
            {isEditable && editKey === 'tag' ? (
              <ImprovedInlineEditor 
                initialValue={tagText || ''} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ tagText: value }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(tagStyle)} 
              />
            ) : (
              <>
                <div style={tagDotStyle} />
                <span>{tagText}</span>
              </>
            )}
          </div>
          {topLeft.iconPath ? (
            <img
              src={getIconPath(topLeft.iconPath)}
              alt="Financial losses"
              style={iconStyle}
              loading="lazy"
            />
          ) : (
            <ClickableImagePlaceholder
              imagePath={topLeft.iconPath}
              onImageUploaded={(path) => onUpdate && onUpdate({ topLeft: { ...topLeft, iconPath: path } })}
              description="Top left icon" 
              isEditable={isEditable} 
              style={iconStyle} 
            />
          )}
        </div>

        {/* Top Middle */}
        <div style={topMiddleStyle}>
          {topMiddle.iconPath ? (
            <img
              src={getIconPath(topMiddle.iconPath)}
              alt="Fines"
              style={iconStyle}
              loading="lazy"
            />
          ) : (
            <ClickableImagePlaceholder
              imagePath={topMiddle.iconPath}
              onImageUploaded={(path) => onUpdate && onUpdate({ topMiddle: { ...topMiddle, iconPath: path } })}
              description="Top middle icon" 
              isEditable={isEditable} 
              style={iconStyle} 
            />
          )}
        </div>

        {/* Top Right */}
        <div style={topRightStyle}>
          {topRight.iconPath ? (
            <img
              src={getIconPath(topRight.iconPath)}
              alt="Loss of trust"
              style={iconStyle}
              loading="lazy"
            />
          ) : (
            <ClickableImagePlaceholder
              imagePath={topRight.iconPath}
              onImageUploaded={(path) => onUpdate && onUpdate({ topRight: { ...topRight, iconPath: path } })}
              description="Top right icon" 
              isEditable={isEditable} 
              style={iconStyle} 
            />
          )}
        </div>

        {/* Bottom Left */}
        <div style={bottomLeftStyle}>
          <div style={bottomTitleStyle} onClick={() => isEditable && setEditKey('bottomLeft-title')}>
            {isEditable && editKey === 'bottomLeft-title' ? (
              <ImprovedInlineEditor 
                initialValue={bottomLeft.title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomLeft: { ...bottomLeft, title: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(bottomTitleStyle)} 
              />
            ) : (
              bottomLeft.title
            )}
          </div>
          <div style={descriptionStyle} onClick={() => isEditable && setEditKey('bottomLeft-desc')}>
            {isEditable && editKey === 'bottomLeft-desc' ? (
              <ImprovedInlineEditor 
                initialValue={bottomLeft.description} 
                multiline={true}
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomLeft: { ...bottomLeft, description: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(descriptionStyle)} 
              />
            ) : (
              bottomLeft.description
            )}
          </div>
        </div>

        {/* Bottom Middle */}
        <div style={bottomMiddleStyle}>
          <div style={bottomTitleStyle} onClick={() => isEditable && setEditKey('bottomMiddle-title')}>
            {isEditable && editKey === 'bottomMiddle-title' ? (
              <ImprovedInlineEditor 
                initialValue={bottomMiddle.title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomMiddle: { ...bottomMiddle, title: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(bottomTitleStyle)} 
              />
            ) : (
              bottomMiddle.title
            )}
          </div>
          <div style={descriptionStyle} onClick={() => isEditable && setEditKey('bottomMiddle-desc')}>
            {isEditable && editKey === 'bottomMiddle-desc' ? (
              <ImprovedInlineEditor 
                initialValue={bottomMiddle.description} 
                multiline={true}
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomMiddle: { ...bottomMiddle, description: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(descriptionStyle)} 
              />
            ) : (
              bottomMiddle.description
            )}
          </div>
        </div>

        {/* Bottom Right */}
        <div style={bottomRightStyle}>
          <div style={bottomTitleStyle} onClick={() => isEditable && setEditKey('bottomRight-title')}>
            {isEditable && editKey === 'bottomRight-title' ? (
              <ImprovedInlineEditor 
                initialValue={bottomRight.title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomRight: { ...bottomRight, title: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(bottomTitleStyle)} 
              />
            ) : (
              bottomRight.title
            )}
          </div>
          <div style={descriptionStyle} onClick={() => isEditable && setEditKey('bottomRight-desc')}>
            {isEditable && editKey === 'bottomRight-desc' ? (
              <ImprovedInlineEditor 
                initialValue={bottomRight.description} 
                multiline={true}
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomRight: { ...bottomRight, description: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(descriptionStyle)} 
              />
            ) : (
              bottomRight.description
            )}
          </div>
        </div>
      </div>

      {/* Page number with line - bottom-left */}
      <div style={pageNumberContainerStyle}>
        <div style={pageNumberLineStyle} />
        <div style={pageNumberStyle} onClick={() => isEditable && setEditKey('pageNumber')}>
          {isEditable && editKey === 'pageNumber' ? (
            <ImprovedInlineEditor 
              initialValue={pageNumber || ''} 
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
    </div>
  );
};

export default NegativeImpactsGridSlideTemplate;
