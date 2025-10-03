// custom_extensions/frontend/src/components/templates/IntroductionDataAnalysisSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

export interface IntroductionDataAnalysisProps extends BaseTemplateProps {
  title: string;
  avatarPath?: string;
  iconPath?: string;
  logoNew?: string;
  pageNumber?: string;
}

export const IntroductionDataAnalysisSlideTemplate: React.FC<IntroductionDataAnalysisProps & { theme?: SlideTheme | string }> = ({
  title = 'Introduction\nto Data Analysis',
  avatarPath = '',
  iconPath = '',
  logoNew = '',
  pageNumber = '05',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)',
    color:'#FFFFFF', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative' 
  };

  // Left side - avatar frame
  const avatarFrame: React.CSSProperties = {
    position:'absolute',
    left:'55px',
    top:'50%',
    transform:'translateY(-50%)',
    width:'500px',
    height:'486px',
    background:'#FFFFFF',
    borderRadius:'10px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden'
  };

  const avatarContainer: React.CSSProperties = {
    width:'467px',
    position:'absolute',
    bottom:'-24px',
    borderRadius:'16px',
    overflow:'hidden',
  };

  // Right side - title
  const titleContainer: React.CSSProperties = {
    position:'absolute',
    right:'115px',
    top:'90px',
    width:'430px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize:'64px',
    color:'#FFFFFF',
    lineHeight:1.2,
    marginBottom:'40px',
    whiteSpace: 'pre-line',
    fontFamily: currentTheme.fonts.titleFont,
  };

  // Icon frame
  const iconFrame: React.CSSProperties = {
    position:'absolute',
    right:'55px',
    top:'280px',
    width:'488px',
    height:'290px',
    background:'#FFFFFF',
    borderRadius:'10px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  };

  const iconContainer: React.CSSProperties = {
    width:'180px',
    overflow:'hidden',
    marginBottom: 0
  };

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ logoNew: newLogoPath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  return (
    <div style={slide}>
      {/* Logo in top-left corner */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px'
      }}>
        {logoNew ? (
          <ClickableImagePlaceholder
            imagePath={logoNew}
            onImageUploaded={handleLogoNewUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={{
              height: '30px',
              maxWidth: '120px',
              objectFit: 'contain'
            }}
          />
        ) : (
          <div 
            onClick={() => isEditable && setShowUploadModal(true)}
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

      {/* Left side - Avatar frame */}
      <div style={avatarFrame}>
        <div style={avatarContainer}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={(path) => onUpdate && onUpdate({ avatarPath: path })}
            description="Avatar" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>
      </div>

      {/* Right side - Title */}
      <div style={titleContainer}>
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
      </div>

      {/* Icon frame */}
      <div style={iconFrame}>
        <div style={iconContainer}>
          <ClickableImagePlaceholder
            imagePath={iconPath}
            onImageUploaded={(path) => onUpdate && onUpdate({ iconPath: path })}
            description="Icon" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '400',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '400',
              fontFamily: currentTheme.fonts.contentFont,
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {/* Logo Upload Modal */}
      {showUploadModal && (
        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleLogoNewUploaded(newLogoPath);
            setShowUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default IntroductionDataAnalysisSlideTemplate;