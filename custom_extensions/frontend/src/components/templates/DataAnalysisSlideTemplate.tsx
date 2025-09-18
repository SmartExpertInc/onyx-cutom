// custom_extensions/frontend/src/components/templates/DataAnalysisSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { DataAnalysisSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

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

export const DataAnalysisSlideTemplate: React.FC<DataAnalysisSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Introduction to Data Analysis',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  excelIconPath = '',
  excelIconAlt = 'Excel icon',
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
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentExcelIconPath, setCurrentExcelIconPath] = useState(excelIconPath);
  const [showExcelIconUploadModal, setShowExcelIconUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    background: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, profileImagePath, profileImageAlt, excelIconPath, excelIconAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, profileImagePath, profileImageAlt, excelIconPath, excelIconAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleExcelIconUploaded = (newImagePath: string) => {
    setCurrentExcelIconPath(newImagePath);
    if (onUpdate) {
      onUpdate({ ...{ title, profileImagePath, profileImageAlt, excelIconPath, excelIconAlt, backgroundColor, titleColor, contentColor, accentColor }, excelIconPath: newImagePath });
    }
  };

  return (
    <div className="data-analysis-slide-template" style={slideStyles}>
             {/* Left Section - Profile Image */}
       <div style={{
         width: '33%',
         height: '100%',
         backgroundColor: themeAccent,
         borderRadius: '20px',
         margin: '40px',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center'
       }}>
         <ClickableImagePlaceholder
           imagePath={profileImagePath}
           onImageUploaded={handleProfileImageUploaded}
           size="LARGE"
           position="CENTER"
           description="Profile"
           isEditable={isEditable}
           style={{
             width: '200px',
             height: '200px',
             borderRadius: '0',
             objectFit: 'cover'
           }}
         />
       </div>

      {/* Right Section - Title and Excel Icon */}
      <div style={{
        width: '67%',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        margin: '40px 40px 40px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 40px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '48px',
          color: '#333333',
          fontWeight: 'bold',
          lineHeight: '1.2',
          whiteSpace: 'pre-line',
          minHeight: '60px',
          maxHeight: '120px',
          display: 'flex',
          alignItems: 'flex-start',
          overflow: 'hidden'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="data-analysis-title-editor"
              style={{
                fontSize: '48px',
                color: '#333333',
                fontWeight: 'bold',
                lineHeight: '1.2',
                whiteSpace: 'pre-line',
                width: '100%',
                height: '100%',
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
                alignItems: 'flex-start'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

                 {/* Excel Icon Section */}
         <div style={{
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center',
           gap: '20px'
         }}>
           {/* Excel Icon */}
           <div style={{
             width: '120px',
             height: '120px',
             backgroundColor: themeAccent,
             borderRadius: '15px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             position: 'relative'
           }}>
                           {currentExcelIconPath ? (
               <ClickableImagePlaceholder
                 imagePath={currentExcelIconPath}
                 onImageUploaded={handleExcelIconUploaded}
                 size="MEDIUM"
                 position="CENTER"
                 description="Excel icon"
                 isEditable={isEditable}
                 style={{
                   width: '80px',
                   height: '80px',
                   objectFit: 'contain'
                 }}
               />
             ) : (
               <div style={{
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 gap: '8px',
                 cursor: isEditable ? 'pointer' : 'default'
               }} onClick={() => isEditable && setShowExcelIconUploadModal(true)}>
                 {/* Excel X */}
                 <div style={{
                   width: '60px',
                   height: '60px',
                   backgroundColor: '#217346',
                   borderRadius: '8px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: 'white',
                   fontSize: '32px',
                   fontWeight: 'bold'
                 }}>
                   X
                 </div>
                 {/* Download Arrow */}
                 <div style={{
                   width: '0',
                   height: '0',
                   borderLeft: '8px solid transparent',
                   borderRight: '8px solid transparent',
                   borderTop: '12px solid #333333'
                 }} />
               </div>
             )}
           </div>
                  </div>
       </div>

       {/* Excel Icon Upload Modal */}
       {showExcelIconUploadModal && (
         <PresentationImageUpload
           isOpen={showExcelIconUploadModal}
           onClose={() => setShowExcelIconUploadModal(false)}
           onImageUploaded={(newIconPath) => {
             handleExcelIconUploaded(newIconPath);
             setShowExcelIconUploadModal(false);
           }}
           title="Upload Excel Icon"
         />
       )}
     </div>
   );
 };

export default DataAnalysisSlideTemplate; 