// custom_extensions/frontend/src/components/templates/ImpactValueStatsSidebarSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface ImpactValueStatsSidebarProps extends BaseTemplateProps {
  title: string;
  stats: Array<{
    value: string;
    description: string;
    imagePath?: string;
  }>;
  avatarPath?: string;
  logoPath?: string;
  pageNumber?: string;
  tagText?: string;
}

export const ImpactValueStatsSidebarSlideTemplate: React.FC<ImpactValueStatsSidebarProps & { theme?: SlideTheme | string }> = ({
  title = 'Impact Value',
  stats = [
    { value: '+30%', description: 'Trust and loyalty', imagePath: '' },
    { value: '$3.9', description: 'Saved in costs', imagePath: '' },
    { value: '-15%', description: 'Legal expenses', imagePath: '' }
  ],
  avatarPath = '',
  logoPath = '',
  pageNumber = '19',
  tagText = 'Presentation',
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

  // Right content area - white background
  const rightContent: React.CSSProperties = {
    width: '65%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px'
  };

  // Logo container
  const logoContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  // Title style - white text on blue
  const titleStyle: React.CSSProperties = {
    fontSize: '64px',
    fontWeight: 500,
    color: '#FFFFFF',
    lineHeight: 1.1,
    margin: 0,
    fontFamily: "'Lora', serif",
    marginTop: '-155px',
    marginLeft: '40px'
  };

  // Avatar container - bottom left
  const avatarContainer: React.CSSProperties = {
    width: '140px',
    height: '140px',
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

  // Tag style - top right content
  const tagContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #09090B',
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

  // Stats container
  const statsContainer: React.CSSProperties = {
    display: 'flex',
    gap: '24px',
    flex: 1,
    alignItems: 'flex-end'
  };

  // Stat card style
  const statCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '56px',
    fontWeight: 700,
    color: '#09090B',
    lineHeight: 1,
    margin: 0,
    fontFamily: "'Lora', serif"
  };

  const statImageContainer: React.CSSProperties = {
    width: '100%',
    height: '200px',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const statImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const statDescriptionStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 400,
    color: '#09090B',
    lineHeight: 1.4,
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

      {/* Right Content - White */}
      <div style={rightContent}>
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

        {/* Stats */}
        <div style={statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} style={statCardStyle}>
              <div style={statValueStyle} onClick={() => isEditable && setEditKey(`value-${index}`)}>
                {isEditable && editKey === `value-${index}` ? (
                  <ImprovedInlineEditor 
                    initialValue={stat.value} 
                    onSave={(value) => { 
                      const newStats = [...stats];
                      newStats[index] = { ...newStats[index], value };
                      onUpdate && onUpdate({ stats: newStats }); 
                      setEditKey(null); 
                    }} 
                    onCancel={() => setEditKey(null)} 
                    style={inline(statValueStyle)} 
                  />
                ) : (
                  stat.value
                )}
              </div>
              <div style={statImageContainer}>
                <ClickableImagePlaceholder
                  imagePath={stat.imagePath}
                  onImageUploaded={(path) => {
                    const newStats = [...stats];
                    newStats[index] = { ...newStats[index], imagePath: path };
                    onUpdate && onUpdate({ stats: newStats });
                  }}
                  description={`Stat image ${index + 1}`} 
                  isEditable={isEditable} 
                  style={statImageStyle} 
                />
              </div>
              <div style={statDescriptionStyle} onClick={() => isEditable && setEditKey(`description-${index}`)}>
                {isEditable && editKey === `description-${index}` ? (
                  <ImprovedInlineEditor 
                    initialValue={stat.description} 
                    onSave={(value) => { 
                      const newStats = [...stats];
                      newStats[index] = { ...newStats[index], description: value };
                      onUpdate && onUpdate({ stats: newStats }); 
                      setEditKey(null); 
                    }} 
                    onCancel={() => setEditKey(null)} 
                    style={inline(statDescriptionStyle)} 
                  />
                ) : (
                  stat.description
                )}
              </div>
            </div>
          ))}
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

export default ImpactValueStatsSidebarSlideTemplate;

