// custom_extensions/frontend/src/components/templates/PersonalAccountabilitySlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface PersonalAccountabilityProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  avatarPath?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const PersonalAccountabilitySlideTemplate: React.FC<PersonalAccountabilityProps & { theme?: SlideTheme | string }> = ({
  title = 'Personal Accountability and Responsibility',
  subtitle = 'Empower individuals to take ownership of their actions and outcomes',
  avatarPath = '',
  logoPath = '',
  pageNumber = '10',
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

  // Left section with content
  const leftSection: React.CSSProperties = {
    width: '50%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    position: 'relative',
    padding: '30px 60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  // Right section with avatar
  const rightSection: React.CSSProperties = {
    width: '50%',
    height: '100%',
    backgroundColor: '#2563EB',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  // Logo container
  const logoContainer: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    left: '30px',
    zIndex: 20
  };

  // Title style
  const titleStyle: React.CSSProperties = {
    fontSize: '42px',
    fontWeight: 700,
    color: '#1F2937',
    lineHeight: 1.3,
    margin: 0,
    marginBottom: '24px',
    fontFamily: "'Lora', serif"
  };

  // Subtitle style
  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 400,
    color: '#4B5563',
    lineHeight: 1.6,
    margin: 0,
    fontFamily: "'Lora', serif"
  };

  // Content container
  const contentContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    paddingTop: '80px'
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

  // Avatar container - centered in right section
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
      {/* Left Section */}
      <div style={leftSection}>
        {/* Logo */}
        <div style={logoContainer}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={handleLogoUploaded}
            isEditable={isEditable}
            color="#000000"
            text="Your Logo"
          />
        </div>

        {/* Content */}
        <div style={contentContainer}>
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
          <div style={subtitleStyle} onClick={() => isEditable && setEditKey('subtitle')}>
            {isEditable && editKey === 'subtitle' ? (
              <ImprovedInlineEditor 
                initialValue={subtitle} 
                multiline={true}
                onSave={(value) => { 
                  onUpdate && onUpdate({ subtitle: value }); 
                  setEditKey(null); 
                }} 
                onCancel={() => setEditKey(null)} 
                style={inline(subtitleStyle)} 
              />
            ) : (
              subtitle
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

      {/* Right Section with Avatar */}
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
    </div>
  );
};

export default PersonalAccountabilitySlideTemplate;

