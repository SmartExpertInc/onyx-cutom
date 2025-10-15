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
    background:'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)',
    color:'#FFFFFF', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative' 
  };

  // Left side - avatar frame
  const avatarFrame: React.CSSProperties = {
    position:'absolute',
    left:'55px',
    top:'75px',
    width:'510px',
    height:'520px',
    background:'#FFFFFF',
    borderRadius:'10px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden'
  };

  const avatarContainer: React.CSSProperties = {
    width:'507px',
    position:'absolute',
    bottom:'-24px',
    borderRadius:'16px',
    overflow:'hidden',
  };

  // Right side - title
  const titleContainer: React.CSSProperties = {
    position:'absolute',
    right:'105px',
    top:'90px',
    width:'430px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize:'56px',
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
    width:'478px',
    height:'315px',
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
    <div className="introduction-data-analysis-slide-template" style={slide}>
      <style>{`
        .introduction-data-analysis-slide-template *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .introduction-data-analysis-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      {/* Logo in top-left corner */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px'
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
        <div className="title-element" style={titleStyle} onClick={() => isEditable && setEditKey('title')}>
          {isEditable && editKey === 'title' ? (
            <ImprovedInlineEditor 
              initialValue={title} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ title: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              className="title-element"
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
        bottom: '15px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
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
              color: 'rgba(255, 255, 255, 0.6)',
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

export default IntroductionDataAnalysisSlideTemplate_old;