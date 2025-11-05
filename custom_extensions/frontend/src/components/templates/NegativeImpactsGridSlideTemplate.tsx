// custom_extensions/frontend/src/components/templates/NegativeImpactsGridSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface NegativeImpactsGridProps extends BaseTemplateProps {
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
  tagText?: string;
  logoPath?: string;
}

export const NegativeImpactsGridSlideTemplate: React.FC<NegativeImpactsGridProps & { theme?: SlideTheme | string }> = ({
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
  tagText = 'Presentation',
  logoPath = '',
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

  // Left sidebar - blue background
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

  // Top Left - Very light blue/off-white
  const topLeftStyle: React.CSSProperties = {
    backgroundColor: '#F8FAFC',
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

  // Top Right - Light gray
  const topRightStyle: React.CSSProperties = {
    backgroundColor: '#D1D5DB',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  // Bottom sections - All very light blue/off-white
  const bottomSectionStyle: React.CSSProperties = {
    backgroundColor: '#F8FAFC',
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
    top: '20px',
    left: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
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
    width: '60%',
    height: '60%',
    objectFit: 'contain',
    maxWidth: '200px',
    maxHeight: '200px'
  };

  // Title style for bottom sections
  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#09090B',
    lineHeight: 1.3,
    margin: 0,
    marginBottom: '16px',
    fontFamily: "'Inter', sans-serif"
  };

  // Description style for bottom sections
  const descriptionStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 400,
    color: '#09090B',
    lineHeight: 1.5,
    margin: 0
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
        <div style={bottomSectionStyle}>
          <div style={titleStyle} onClick={() => isEditable && setEditKey('bottomLeft-title')}>
            {isEditable && editKey === 'bottomLeft-title' ? (
              <ImprovedInlineEditor 
                initialValue={bottomLeft.title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomLeft: { ...bottomLeft, title: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(titleStyle)} 
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
        <div style={bottomSectionStyle}>
          <div style={titleStyle} onClick={() => isEditable && setEditKey('bottomMiddle-title')}>
            {isEditable && editKey === 'bottomMiddle-title' ? (
              <ImprovedInlineEditor 
                initialValue={bottomMiddle.title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomMiddle: { ...bottomMiddle, title: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(titleStyle)} 
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
        <div style={bottomSectionStyle}>
          <div style={titleStyle} onClick={() => isEditable && setEditKey('bottomRight-title')}>
            {isEditable && editKey === 'bottomRight-title' ? (
              <ImprovedInlineEditor 
                initialValue={bottomRight.title} 
                onSave={(value) => { 
                  onUpdate && onUpdate({ bottomRight: { ...bottomRight, title: value } }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(titleStyle)} 
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
    </div>
  );
};

export default NegativeImpactsGridSlideTemplate;
