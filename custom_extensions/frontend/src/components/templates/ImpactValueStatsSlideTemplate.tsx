// custom_extensions/frontend/src/components/templates/ImpactValueStatsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

export interface ImpactValueStatsProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  stats: Array<{
    percentage: string;
    description: string;
  }>;
  avatarPath?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const ImpactValueStatsSlideTemplate: React.FC<ImpactValueStatsProps & { theme?: SlideTheme | string }> = ({
  title = 'Impact Value',
  subtitle = 'Statistics for effective critical thinking and problem-solving skills',
  stats = [
    { percentage: '20%', description: 'Statistics for effective critical thinking and problem-solving skills' },
    { percentage: '35%', description: 'Increase in innovation and problem-solving capabilities.' },
    { percentage: '60%', description: 'Likelihood of being promoted to leadership positions.' }
  ],
  avatarPath = '',
  logoPath = '',
  pageNumber = '17',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#F5F5F5', 
    color:'#333333', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  // Top header section with blue background
  const headerSection: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)',
    padding: '40px 80px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexShrink: 0
  };

  // Avatar container
  const avatarContainer: React.CSSProperties = {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    flexShrink: 0
  };

  // Title and subtitle container
  const titleContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginLeft: '25px',
    flex: 1
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
    margin: 0,
    fontFamily: "'Lora', serif"
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 400,
    color: '#FFFFFF',
    lineHeight: 1.4,
    opacity: '0.8',
    margin: 0,
    fontFamily: "'Lora', serif"
  };

  // Content area with stats cards
  const contentSection: React.CSSProperties = {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: '50px 80px',
    display: 'flex',
    gap: '32px',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  };

  // Stats card style
  const statCardStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)',
    borderRadius: '12px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    height: '305px',
    marginTop: '-40px',
    maxWidth: '320px',
    minHeight: '200px',
    justifyContent: 'space-between'
  };

  const percentageStyle: React.CSSProperties = {
    fontSize: '64px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1,
    margin: 0,
    fontFamily: "'Lora', serif"
  };

  const statDescriptionStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 400,
    color: '#FFFFFF',
    lineHeight: 1.4,
    margin: 0,
    opacity: '0.8',
    fontFamily: "'Lora', serif"
  };

  // Footer section - Logo in bottom-right
  const footerSection: React.CSSProperties = {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    zIndex: 10
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
      {/* Top Header Section */}
      <div style={headerSection}>
        {/* Avatar */}
        <div style={avatarContainer}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(path) => onUpdate && onUpdate({ avatarPath: path })}
            description="Avatar" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>

        {/* Title and Subtitle */}
        <div style={titleContainer}>
          <div style={titleStyle} onClick={() => isEditable && setEditKey('title')}>
            {isEditable && editKey === 'title' ? (
              <ImprovedInlineEditor 
                initialValue={title} 
                multiline={false}
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
                multiline={false}
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

      {/* Content Section with Stats Cards */}
      <div style={contentSection}>
        {stats.map((stat, index) => (
          <div key={index} style={statCardStyle}>
            <div style={percentageStyle} onClick={() => isEditable && setEditKey(`percentage-${index}`)}>
              {isEditable && editKey === `percentage-${index}` ? (
                <ImprovedInlineEditor 
                  initialValue={stat.percentage} 
                  onSave={(value) => { 
                    const newStats = [...stats];
                    newStats[index] = { ...newStats[index], percentage: value };
                    onUpdate && onUpdate({ stats: newStats }); 
                    setEditKey(null); 
                  }} 
                  onCancel={() => setEditKey(null)} 
                  style={inline(percentageStyle)} 
                />
              ) : (
                stat.percentage
              )}
            </div>
            <div style={statDescriptionStyle} onClick={() => isEditable && setEditKey(`description-${index}`)}>
              {isEditable && editKey === `description-${index}` ? (
                <ImprovedInlineEditor 
                  initialValue={stat.description} 
                  multiline={true}
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

      {/* Logo - bottom-right */}
      <div style={footerSection}>
        <div style={logoContainerStyle}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={handleLogoUploaded}
            isEditable={isEditable}
            color="#9CA3AF"
            text="Your Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default ImpactValueStatsSlideTemplate;

