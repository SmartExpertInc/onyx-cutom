// custom_extensions/frontend/src/components/templates/PhishingDefinitionSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { PhishingDefinitionSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import AvatarImageDisplay from '../AvatarImageDisplay';
import YourLogo from '../YourLogo';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '@/components/editors/ControlledWysiwygEditor';

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
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
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
  pageNumber = '06',
  onEditorActive
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDefinitions, setEditingDefinitions] = useState<number | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDefinitions, setCurrentDefinitions] = useState(definitions);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);
  
  // Editor refs
  const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const definitionEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);

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
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    onEditorActive?.(null as any, 'title');
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, title: newTitle });
    }
  };

  const handleDefinitionSave = (index: number, newDefinition: string) => {
    const newDefinitions = [...currentDefinitions];
    newDefinitions[index] = newDefinition;
    setCurrentDefinitions(newDefinitions);
    setEditingDefinitions(null);
    onEditorActive?.(null as any, `definition-${index}`);
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, definitions: newDefinitions });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
    onEditorActive?.(null as any, 'title');
  };

  const handleDefinitionCancel = () => {
    setCurrentDefinitions(definitions);
    setEditingDefinitions(null);
    if (editingDefinitions !== null) {
      onEditorActive?.(null as any, `definition-${editingDefinitions}`);
    }
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
      {/* Left section with text - MATCHES HTML: padding: 96px, paddingTop: 64px */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#E0E7FF',
        padding: '5%',
        paddingTop: '3.33%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Title - MATCHES HTML: fontSize: 80px, marginBottom: 24px */}
        <div style={{
          fontSize: '50px',
          color: '#212222',
          marginBottom: '1.25%',
          lineHeight: '1.2'
        }}>
          {isEditable && editingTitle ? (
            <ControlledWysiwygEditor
              ref={titleEditorRef}
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter title..."
              className="phishing-title-editor"
              style={{
                fontSize: '50px',
                color: '#212222',
                lineHeight: '1.2',
                padding: '8px 12px',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }}
              onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'title', computedStyles)}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              className={isEditable ? 'cursor-pointer hover:opacity-80' : ''}
              dangerouslySetInnerHTML={{ __html: currentTitle }}
            />
          )}
        </div>

        {/* Definitions - MATCHES HTML: gap: 32px, marginBottom: 64px, fontSize: 22px */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.67%',
          marginBottom: '3.33%'
        }}>
          {currentDefinitions.map((definition, index) => (
            <div
              key={index}
              style={{
                fontSize: '15px',
                color: '#545555',
                lineHeight: '1.5'
              }}
            >
              {isEditable && editingDefinitions === index ? (
                <ControlledWysiwygEditor
                  ref={(el) => {
                    if (definitionEditorRefs.current) {
                      definitionEditorRefs.current[index] = el;
                    }
                  }}
                  initialValue={definition}
                  onSave={(value) => handleDefinitionSave(index, value)}
                  onCancel={handleDefinitionCancel}
                  placeholder="Enter definition..."
                  className="definition-editor"
                  style={{
                    fontSize: '1.15vw',
                    color: '#545555',
                    lineHeight: '1.5',
                    padding: '8px 12px',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, `definition-${index}`, computedStyles)}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingDefinitions(index)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  className={isEditable ? 'cursor-pointer hover:opacity-80' : ''}
                  dangerouslySetInnerHTML={{ __html: definition }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Profile image at bottom left - MATCHES HTML: bottom: 149px, left: 96px, width: 256px, height: 256px */}
        <div style={{
          position: 'absolute',
          bottom: '7.76%',
          left: '5%',
          width: '140px',
          height: '140px',
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
              height: '135%',
              borderRadius: '50%',
              position: 'relative',
              bottom: '0px',
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }} />
          {/* Page number */}
          {isEditable && editingPageNumber ? (
            <ImprovedInlineEditor
              initialValue={currentPageNumber}
              onSave={handlePageNumberSave}
              onCancel={handlePageNumberCancel}
              className="page-number-editor"
              style={{
                color: '#000000',
                fontSize: '17px',
                fontWeight: '300',
                width: '30px',
                height: 'auto'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingPageNumber(true)}
              style={{
                color: '#000000',
                fontSize: '17px',
                fontWeight: '300',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentPageNumber}
            </div>
          )}
        </div>
      </div>

      {/* Right section with avatar */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative'
      }}>
        <AvatarImageDisplay
          size="LARGE"
          position="CENTER"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0px',
            objectFit: 'cover'
          }}
        />

        {/* Logo in bottom-right corner - MATCHES HTML: bottom: 48px, right: 48px, fontSize: 26px */}
        <div style={{
          position: 'absolute',
          bottom: '2.5%',
          right: '2.5%',
          zIndex: 20
        }}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={handleLogoUploaded}
            isEditable={isEditable}
            color="#ffffff"
            text="Your Logo"
            fontSize="20px"
          />
        </div>
      </div>
    </div>
  );
};

export default PhishingDefinitionSlideTemplate; 