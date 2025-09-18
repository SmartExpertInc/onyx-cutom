// custom_extensions/frontend/src/components/templates/PhishingDefinitionSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { PhishingDefinitionSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block',
      }}
    />
  );
}

export const PhishingDefinitionSlideTemplate: React.FC<PhishingDefinitionSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'What is phishing?',
  definitions = [
    "Using data to access a victim's account and withdrawing money or making an online transaction, e.g. buying a product or service.",
    "Using data to open fake bank accounts or credit cards in the name of the victim and using them to cash out illegal checks, etc.",
    "Using the victim's computer systems to install viruses and worms and disseminating phishing emails further to their contacts.",
    "Using data from some systems to gain access to high value organizational data such as banking information, employee credentials, social security numbers, etc."
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  rightImagePath = '',
  rightImageAlt = 'Right side image',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText,
  logoPath = '',
  pageNumber = '06'
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDefinitions, setEditingDefinitions] = useState<number | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDefinitions, setCurrentDefinitions] = useState(definitions);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, title: newTitle });
    }
  };

  const handleDefinitionSave = (index: number, newDefinition: string) => {
    const newDefinitions = [...currentDefinitions];
    newDefinitions[index] = newDefinition;
    setCurrentDefinitions(newDefinitions);
    setEditingDefinitions(null);
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, definitions: newDefinitions });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleDefinitionCancel = () => {
    setCurrentDefinitions(definitions);
    setEditingDefinitions(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, profileImagePath: newImagePath });
    }
  };

  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, rightImagePath: newImagePath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, logoPath: newLogoPath });
    }
  };

  return (
    <div className="phishing-definition-slide-template inter-theme" style={slideStyles}>
      {/* Left section with text */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#E0E7FF',
        padding: '60px',
        paddingTop: '40px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '50px',
          color: '#212222',
          marginBottom: '15px',
          lineHeight: '1.2'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="phishing-title-editor"
              style={{
                fontSize: '50px',
                color: '#212222',
                lineHeight: '1.2'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Definitions */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {currentDefinitions.map((definition, index) => (
            <div
              key={index}
              style={{
                fontSize: '14px',
                color: '#545555',
                lineHeight: '1.5'
              }}
            >
              {isEditable && editingDefinitions === index ? (
                <InlineEditor
                  initialValue={definition}
                  onSave={(value) => handleDefinitionSave(index, value)}
                  onCancel={handleDefinitionCancel}
                  multiline={true}
                  className="definition-editor"
                  style={{
                    fontSize: '14px',
                    color: '#545555',
                    lineHeight: '1.5'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingDefinitions(index)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {definition}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Profile image at bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '115px',
          left: '60px',
          width: '145px',
          height: '145px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="MEDIUM"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              width: '88%',
              height: '100%',
              borderRadius: '50%',
              position: 'relative',
              bottom: '-10px',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Page number with line */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '0px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 20
        }}>
          {/* Small line */}
          <div style={{
            width: '20px',
            height: '1px',
            backgroundColor: 'rgba(9, 9, 11, 0.3)'
          }} />
          {/* Page number */}
          {isEditable && editingPageNumber ? (
            <ImprovedInlineEditor
              initialValue={currentPageNumber}
              onSave={handlePageNumberSave}
              onCancel={handlePageNumberCancel}
              className="page-number-editor"
              style={{
                color: '#09090B',
                fontSize: '17px',
                fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                width: '30px',
                height: 'auto'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingPageNumber(true)}
              style={{
                color: '#09090B',
                fontSize: '17px',
                fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentPageNumber}
            </div>
          )}
        </div>
      </div>

      {/* Right section with image */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative'
      }}>
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={handleRightImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Right side image"
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0px',
            objectFit: 'cover'
          }}
        />

        {/* Logo in bottom-right corner */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          zIndex: 20
        }}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={handleLogoUploaded}
            isEditable={isEditable}
            color="#ffffff"
            text="Your Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default PhishingDefinitionSlideTemplate; 