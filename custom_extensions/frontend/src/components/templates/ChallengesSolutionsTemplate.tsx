import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import Image from 'next/image';
import groupImg from './group_img.png';

export interface ChallengesSolutionsTemplateProps {
  title?: string;
  subtitle?: string;
  theme?: string;
  isEditable?: boolean;
  slideId?: string;
  onUpdate?: (data: Partial<ChallengesSolutionsTemplateProps>) => void;
}

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

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        style={{
          ...style,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          textAlign: 'inherit',
          lineHeight: 'inherit',
          width: '100%',
          minHeight: '60px'
        }}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        style={{
          ...style,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          textAlign: 'inherit',
          width: '100%'
        }}
    />
  );
}

const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsTemplateProps> = ({
  title = 'Challenges & Solutions',
  subtitle = 'Type The Subtitle Of Your Great Here',
  theme,
  isEditable = true,
  slideId = 'challenges-solutions',
  onUpdate
}: ChallengesSolutionsTemplateProps) => {
  const currentTheme = getSlideTheme(theme) || DEFAULT_SLIDE_THEME;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const handleTitleSave = (value: string) => {
    setCurrentTitle(value);
    setIsEditingTitle(false);
    if (onUpdate) {
      onUpdate({ title: value });
    }
  };

  const handleSubtitleSave = (value: string) => {
    setCurrentSubtitle(value);
    setIsEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ subtitle: value });
    }
  };


  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: '#ffffff',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif',
    minHeight: '600px',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '2.5rem',
    fontFamily: 'Georgia, serif',
    marginBottom: '10px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    flexShrink: 0
  };

  const subtitleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '1.1rem',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '40px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'normal',
    flexShrink: 0
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    position: 'relative',
    height: '400px',
    width: '100%'
  };

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  return (
    <div style={slideStyles} ref={slideContainerRef}>
      {/* Title */}
      {isEditingTitle ? (
        <InlineEditor
          initialValue={currentTitle}
          onSave={handleTitleSave}
          onCancel={() => setIsEditingTitle(false)}
          placeholder="Enter title"
          style={titleStyles}
        />
      ) : (
        <h1
          style={titleStyles}
          onClick={() => isEditable && setIsEditingTitle(true)}
          data-draggable={isEditable}
        >
          {currentTitle}
        </h1>
      )}

      {/* Subtitle */}
      {isEditingSubtitle ? (
        <InlineEditor
          initialValue={currentSubtitle}
          onSave={handleSubtitleSave}
          onCancel={() => setIsEditingSubtitle(false)}
          placeholder="Enter subtitle"
          style={subtitleStyles}
        />
      ) : (
        <h2
          style={subtitleStyles}
          onClick={() => isEditable && setIsEditingSubtitle(true)}
          data-draggable={isEditable}
        >
          {currentSubtitle}
        </h2>
      )}

      {/* Main Content with Image */}
      <div style={mainContentStyles}>
        {/* Left side text items */}
        <div style={{
          position: 'absolute',
          left: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          zIndex: 10
        }}>
          {[1, 2, 3].map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                fontSize: '16px',
                color: '#000000',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal'
              }}>
                Title goes here
              </div>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1976D2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%'
                  }}></div>
                </div>
                {/* Dotted line to center */}
                <div style={{
                  position: 'absolute',
                  right: '-100px',
                  top: '50%',
                  width: '100px',
                  height: '2px',
                  borderTop: '2px dotted #1976D2',
                  transform: 'translateY(-50%)'
                }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Right side text items */}
        <div style={{
          position: 'absolute',
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          zIndex: 10
        }}>
          {[1, 2, 3].map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              flexDirection: 'row-reverse'
            }}>
              <div style={{
                fontSize: '16px',
                color: '#000000',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal'
              }}>
                Title goes here
              </div>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1976D2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%'
                  }}></div>
                </div>
                {/* Dotted line to center */}
                <div style={{
                  position: 'absolute',
                  left: '-100px',
                  top: '50%',
                  width: '100px',
                  height: '2px',
                  borderTop: '2px dotted #1976D2',
                  transform: 'translateY(-50%)'
                }}></div>
              </div>
            </div>
          ))}
        </div>

        <div style={imageContainerStyles}>
          <Image src={groupImg} alt="Group" width={500} height={400} />
        </div>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate;