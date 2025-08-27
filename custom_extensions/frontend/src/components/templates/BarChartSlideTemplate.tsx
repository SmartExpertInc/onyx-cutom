// custom_extensions/frontend/src/components/templates/BarChartSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { BarChartSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

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

export const BarChartSlideTemplate: React.FC<BarChartSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  bars = [
    { percentage: '20%', description: 'Decrease in insurance costs', height: 60 },
    { percentage: '30%', description: 'Increase in employee morale and satisfaction', height: 90 },
    { percentage: '52%', description: 'Decrease in insurance costs', height: 156 }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  website = 'www.company.com',
  date = 'Date Goes Here',
  pageNumber = 'Page Number',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingBars, setEditingBars] = useState<{ index: number; field: 'percentage' | 'description' } | null>(null);
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentBars, setCurrentBars] = useState(bars);
  const [currentWebsite, setCurrentWebsite] = useState(website);
  const [currentDate, setCurrentDate] = useState(date);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    backgroundColor: themeBg,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  const handleBarSave = (index: number, field: 'percentage' | 'description', value: string) => {
    const newBars = [...currentBars];
    newBars[index] = { ...newBars[index], [field]: value };
    setCurrentBars(newBars);
    setEditingBars(null);
    if (onUpdate) {
      onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
    }
  };

  const handleWebsiteSave = (newWebsite: string) => {
    setCurrentWebsite(newWebsite);
    setEditingWebsite(false);
    if (onUpdate) {
      onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, website: newWebsite });
    }
  };

  const handleDateSave = (newDate: string) => {
    setCurrentDate(newDate);
    setEditingDate(false);
    if (onUpdate) {
      onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, date: newDate });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handleBarCancel = () => {
    setCurrentBars(bars);
    setEditingBars(null);
  };

  const handleWebsiteCancel = () => {
    setCurrentWebsite(website);
    setEditingWebsite(false);
  };

  const handleDateCancel = () => {
    setCurrentDate(date);
    setEditingDate(false);
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const addBar = () => {
    const newBars = [...currentBars, { percentage: '25%', description: 'New metric', height: 75 }];
    setCurrentBars(newBars);
    if (onUpdate) {
      onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
    }
  };

  const removeBar = (index: number) => {
    if (currentBars.length > 1) {
      const newBars = currentBars.filter((_, i) => i !== index);
      setCurrentBars(newBars);
      if (onUpdate) {
        onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
      }
    }
  };

  const adjustBarHeight = (index: number, newHeight: number) => {
    const newBars = [...currentBars];
    newBars[index] = { ...newBars[index], height: Math.max(20, Math.min(200, newHeight)) };
    setCurrentBars(newBars);
    if (onUpdate) {
      onUpdate({ ...{ bars, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
    }
  };

  return (
    <div className="bar-chart-slide-template" style={slideStyles}>
      {/* Profile Image - Top Left */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: themeAccent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={handleProfileImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Profile photo"
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Bar Chart Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '60px',
        height: '400px',
        marginTop: '80px',
        position: 'relative'
      }}>
        {/* Horizontal baseline */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '1px',
          backgroundColor: themeContent,
          opacity: 0.3
        }} />

        {/* Bars */}
        {currentBars.map((bar, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (isEditable) {
                const controls = e.currentTarget.querySelector('.bar-controls') as HTMLElement;
                if (controls) controls.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (isEditable) {
                const controls = e.currentTarget.querySelector('.bar-controls') as HTMLElement;
                if (controls) controls.style.opacity = '0';
              }
            }}
          >
            {/* Percentage */}
            <div style={{
              fontSize: '32px',
              color: themeTitle,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {isEditable && editingBars?.index === index && editingBars?.field === 'percentage' ? (
                <InlineEditor
                  initialValue={bar.percentage}
                  onSave={(value) => handleBarSave(index, 'percentage', value)}
                  onCancel={handleBarCancel}
                  className="bar-percentage-editor"
                  style={{
                    fontSize: '32px',
                    color: themeTitle,
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingBars({ index, field: 'percentage' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {bar.percentage}
                </div>
              )}
            </div>

            {/* Bar */}
            <div style={{
              width: '80px',
              height: `${bar.height}px`,
              backgroundColor: themeAccent,
              borderRadius: '4px 4px 0 0',
              position: 'relative'
            }}>
              {/* Height adjustment controls */}
              {isEditable && (
                <div 
                  className="bar-controls"
                  style={{
                    position: 'absolute',
                    right: '-30px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease-in-out'
                  }}
                >
                  <button
                    onClick={() => adjustBarHeight(index, bar.height + 10)}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: themeAccent,
                      border: 'none',
                      borderRadius: '50%',
                      color: themeBg,
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => adjustBarHeight(index, bar.height - 10)}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: themeAccent,
                      border: 'none',
                      borderRadius: '50%',
                      color: themeBg,
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{
              fontSize: '14px',
              color: themeContent,
              textAlign: 'center',
              maxWidth: '120px',
              lineHeight: '1.3'
            }}>
              {isEditable && editingBars?.index === index && editingBars?.field === 'description' ? (
                <InlineEditor
                  initialValue={bar.description}
                  onSave={(value) => handleBarSave(index, 'description', value)}
                  onCancel={handleBarCancel}
                  multiline={true}
                  className="bar-description-editor"
                  style={{
                    fontSize: '14px',
                    color: themeContent,
                    textAlign: 'center',
                    maxWidth: '120px',
                    lineHeight: '1.3'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingBars({ index, field: 'description' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {bar.description}
                </div>
              )}
            </div>

            {/* Remove button */}
            {isEditable && currentBars.length > 1 && (
              <button
                className="bar-controls"
                onClick={() => removeBar(index)}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#ff4444',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add bar button - positioned outside the chart area */}
      {isEditable && (
        <button
          onClick={addBar}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            backgroundColor: themeAccent,
            border: 'none',
            borderRadius: '50%',
            color: themeBg,
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          +
        </button>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '60px',
        right: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: themeContent
      }}>
        {/* Website */}
        <div>
          {isEditable && editingWebsite ? (
            <InlineEditor
              initialValue={currentWebsite}
              onSave={handleWebsiteSave}
              onCancel={handleWebsiteCancel}
              className="footer-website-editor"
              style={{
                fontSize: '12px',
                color: themeContent
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingWebsite(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentWebsite}
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          {isEditable && editingDate ? (
            <InlineEditor
              initialValue={currentDate}
              onSave={handleDateSave}
              onCancel={handleDateCancel}
              className="footer-date-editor"
              style={{
                fontSize: '12px',
                color: themeContent
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingDate(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentDate}
            </div>
          )}
        </div>

        {/* Page Number */}
        <div>
          {isEditable && editingPageNumber ? (
            <InlineEditor
              initialValue={currentPageNumber}
              onSave={handlePageNumberSave}
              onCancel={handlePageNumberCancel}
              className="footer-page-number-editor"
              style={{
                fontSize: '12px',
                color: themeContent
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingPageNumber(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentPageNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarChartSlideTemplate; 