// custom_extensions/frontend/src/components/templates/TwoColumnWithCutoutImageSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface TwoColumnWithCutoutImageProps extends BaseTemplateProps {
  content: string;
  leftImagePath?: string;
  leftTopImagePath?: string;
  bottomImagePath?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const TwoColumnWithCutoutImageSlideTemplate: React.FC<TwoColumnWithCutoutImageProps & { theme?: SlideTheme | string }> = ({
  content = 'We expect you to meet or exceed these metrics, and we will provide you with regular feedback and performance evaluations to help you track your progress and identify areas for improvement. We believe that by embodying these qualities and achieving your performance metrics, you will contribute to the success of our company and your own personal growth and development.',
  leftImagePath = '',
  leftTopImagePath = '',
  bottomImagePath = '',
  logoPath = '',
  pageNumber = '09',
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

  // Left section with large image
  const leftSection: React.CSSProperties = {
    width: '60%',
    height: '100%',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '40px'
  };

  // Right section with content
  const rightSection: React.CSSProperties = {
    width: '40%',
    height: '100%',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 30px',
    gap: '24px'
  };

  // Logo container
  const logoContainer: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    left: '30px',
    zIndex: 20
  };

  // Left section container - clipped/cropped
  const leftSectionContainer: React.CSSProperties = {
    width: '100%',
    height: '87%',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    clipPath: 'polygon( 0 0, calc(100% - 160px) 0, calc(100% - 160px) 160px, 100% 160px, 100% 100%, 0 100% )'
  };


  // Left image style
  const leftImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'relative',
    zIndex: 1
  };

  // Small image in the cutout corner of left image
  const leftTopImageContainer: React.CSSProperties = {
    position: 'absolute',
    top: '77px',
    right: '41px',
    width: '150px',
    height: '157px',
    borderRadius: '0',
    overflow: 'hidden',
    zIndex: 20
  };

  const leftTopImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  // Content text style
  const contentStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 400,
    color: '#09090B',
    lineHeight: 1.6,
    margin: 0,
    marginTop: '38px',
    fontFamily: currentTheme.fonts.contentFont,
    flex: 1
  };

  // Bottom image container
  const bottomImageContainer: React.CSSProperties = {
    width: '100%',
    height: '180px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '38px',
    flexShrink: 0
  };

  const bottomImageStyle: React.CSSProperties = {
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
    backgroundColor: 'rgba(9, 9, 11, 0.6)'
  };

  const pageNumberStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 300,
    color: 'rgba(9, 9, 11, 0.6)',
    fontFamily: currentTheme.fonts.contentFont,
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

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ logoPath: newLogoPath });
    }
  };

  return (
    <div style={slide}>
      {/* Logo - top left */}
      <div style={logoContainer}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={handleLogoUploaded}
          isEditable={isEditable}
          color="#09090B"
          text="Your Logo"
        />
      </div>

      {/* Left Section - Large Image with small image in cutout corner */}
      <div style={leftSection}>
        {/* Large image with clipPath */}
        <div style={leftSectionContainer}>
          <ClickableImagePlaceholder
            imagePath={leftImagePath}
            onImageUploaded={(path) => onUpdate && onUpdate({ leftImagePath: path })}
            description="Left side image" 
            isEditable={isEditable} 
            style={leftImageStyle} 
          />
        </div>
        {/* Small image in the cutout corner - outside clipPath container */}
        <div style={leftTopImageContainer}>
          <ClickableImagePlaceholder
            imagePath={leftTopImagePath}
            onImageUploaded={(path) => onUpdate && onUpdate({ leftTopImagePath: path })}
            description="Cutout corner image" 
            isEditable={isEditable} 
            style={leftTopImageStyle} 
          />
        </div>
      </div>

      {/* Right Section - Content */}
      <div style={rightSection}>
        {/* Content Text */}
        <div style={contentStyle} onClick={() => isEditable && setEditKey('content')}>
          {isEditable && editKey === 'content' ? (
            <ImprovedInlineEditor 
              initialValue={content} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ content: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(contentStyle)} 
            />
          ) : (
            content
          )}
        </div>

        {/* Bottom - Image */}
        <div style={bottomImageContainer}>
          <ClickableImagePlaceholder
            imagePath={bottomImagePath}
            onImageUploaded={(path) => onUpdate && onUpdate({ bottomImagePath: path })}
            description="Bottom image" 
            isEditable={isEditable} 
            style={bottomImageStyle} 
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
    </div>
  );
};

export default TwoColumnWithCutoutImageSlideTemplate;

