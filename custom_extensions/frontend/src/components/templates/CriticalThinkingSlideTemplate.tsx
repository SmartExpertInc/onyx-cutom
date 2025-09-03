// custom_extensions/frontend/src/components/templates/CriticalThinkingSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { CriticalThinkingSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const CriticalThinkingSlideTemplate: React.FC<CriticalThinkingSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Critical Thinking\nand Problem Solving',
  content = 'Critical thinking and problem solving are essential skills that empower individuals to analyze information, make informed decisions, and overcome challenges.',
  highlightedPhrases = ['analyze information,', 'make informed decisions,', 'overcome challenges.'],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  companyLogoPath = '',
  companyLogoAlt = 'Company logo',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editingHighlightedPhrases, setEditingHighlightedPhrases] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);
  const [currentHighlightedPhrases, setCurrentHighlightedPhrases] = useState(highlightedPhrases);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '650px',
    backgroundColor: '#F5F5F5', // Light grey background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
    border: '2px solid #FFFFFF', // White border as per screenshot
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
    }
  };

  const handleHighlightedPhraseSave = (index: number, newPhrase: string) => {
    const newPhrases = [...currentHighlightedPhrases];
    newPhrases[index] = newPhrase;
    setCurrentHighlightedPhrases(newPhrases);
    setEditingHighlightedPhrases(null);
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, highlightedPhrases: newPhrases });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleContentCancel = () => {
    setCurrentContent(content);
    setEditingContent(false);
  };

  const handleHighlightedPhraseCancel = () => {
    setCurrentHighlightedPhrases(highlightedPhrases);
    setEditingHighlightedPhrases(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  // Function to render content with highlighted phrases
  const renderContentWithHighlights = () => {
    let contentText = currentContent;
    let result = [];
    let lastIndex = 0;

    currentHighlightedPhrases.forEach((phrase, index) => {
      const phraseIndex = contentText.indexOf(phrase, lastIndex);
      if (phraseIndex !== -1) {
        // Add text before the phrase
        if (phraseIndex > lastIndex) {
          result.push(
            <span key={`text-${index}`}>
              {contentText.substring(lastIndex, phraseIndex)}
            </span>
          );
        }
        
        // Add highlighted phrase with exact colors from screenshot
        result.push(
          <span
            key={`highlight-${index}`}
            style={{
              backgroundColor: '#E8CCC6', // Light red/orange background as per screenshot
              color: '#DA8372', // Red/orange text color as per screenshot
              opacity: 1,
              padding: '0px 10px',
              borderRadius: '3px'
            }}
          >
            {isEditable && editingHighlightedPhrases === index ? (
              <ImprovedInlineEditor
                initialValue={phrase}
                onSave={(value) => handleHighlightedPhraseSave(index, value)}
                onCancel={handleHighlightedPhraseCancel}
                className="highlighted-phrase-editor"
                style={{
                  backgroundColor: 'transparent',
                  color: '#DA8372',
                  width: '100%',
                  height: 'auto'
                }}
              />
            ) : (
              <span
                onClick={() => isEditable && setEditingHighlightedPhrases(index)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {phrase}
              </span>
            )}
          </span>
        );
        
        lastIndex = phraseIndex + phrase.length;
      }
    });

    // Add remaining text
    if (lastIndex < contentText.length) {
      result.push(
        <span key="text-end">
          {contentText.substring(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div className="critical-thinking-slide-template inter-theme" style={slideStyles}>
      {/* Profile Image - Top Left with orange background */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: '#FF6B35', // Orange background as per screenshot
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={handleProfileImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Profile"
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            overflow: 'hidden'
          }}
        />
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        marginLeft: '200px',
        marginRight: '100px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '38px',
          color: '#4A4A4A', // Dark grey color as per screenshot
          lineHeight: '1.2',
          marginBottom: '40px',
          whiteSpace: 'pre-line',
          minHeight: '60px',
          maxHeight: '120px',
          display: 'flex',
          alignItems: 'flex-start',
          overflow: 'hidden',
          position: 'absolute',
          top: '50px',
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="critical-thinking-title-editor"
              style={{
                fontSize: '38px',
                color: '#4A4A4A',
                lineHeight: '1.2',
                whiteSpace: 'pre-line',
                width: '100%',
                height: 'auto',
                minHeight: '60px',
                maxHeight: '120px'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                fontSize: '38px',
                color: '#4A4A4A',
                lineHeight: '1.2',
                whiteSpace: 'pre-line',
                minHeight: '60px',
                maxHeight: '120px',
                overflow: 'hidden'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          fontSize: '36px',
          color: '#4A4A4A', // Dark grey color as per screenshot
          lineHeight: '1.6',
          maxWidth: '640px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'flex-start',
          marginTop: '30px'
        }}>
          {isEditable && editingContent ? (
            <ImprovedInlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="critical-thinking-content-editor"
              style={{
                fontSize: '36px',
                color: '#4A4A4A',
                lineHeight: '1.6',
                maxWidth: '600px',
                width: '100%',
                height: 'auto',
                minHeight: '40px'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingContent(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                fontSize: '36px',
                color: '#4A4A4A',
                lineHeight: '1.6',
                maxWidth: '600px',
                minHeight: '40px',
                width: '100%'
              }}
            >
              {renderContentWithHighlights()}
            </div>
          )}
        </div>
      </div>

      {/* Company Logo - Bottom Left */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {currentCompanyLogoPath ? (
          <ClickableImagePlaceholder
            imagePath={currentCompanyLogoPath}
            onImageUploaded={handleCompanyLogoUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={{
              width: '60px',
              height: '30px',
              objectFit: 'contain'
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: isEditable ? 'pointer' : 'default'
          }}
          onClick={() => isEditable && setShowLogoUploadModal(true)}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: `2px solid #4A4A4A`, // Dark grey border as per screenshot
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#4A4A4A', // Dark grey color as per screenshot
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: '#4A4A4A', // Dark grey color as per screenshot
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '300', color: '#4A4A4A' }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default CriticalThinkingSlideTemplate; 