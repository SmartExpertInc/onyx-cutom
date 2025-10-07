// custom_extensions/frontend/src/components/templates/ImpactStatementsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ImpactStatementsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const ImpactStatementsSlideTemplate: React.FC<ImpactStatementsSlideProps & {
  theme?: SlideTheme | string;
  pageNumber?: string;
  logoNew?: string;
}> = ({
  slideId,
  title = 'Here are some impact value statements backed by numbers:',
  statements = [
    { number: '50%', description: 'decrease in turnover rates.' },
    { number: '$2.8B', description: 'the cost of harassment to businesses in the United States annually.' },
    { number: '40%', description: 'increase in employee morale and engagement' }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  pageNumber = '18',
  logoNew = '',
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
  const [editingStatements, setEditingStatements] = useState<number | null>(null);
  const [editingNumbers, setEditingNumbers] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentStatements, setCurrentStatements] = useState(statements);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    display: 'flex',
    gap: '70px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    paddingTop: '40px',
    paddingBottom: '65px',
    paddingLeft: '50px',
    paddingRight: '40px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleStatementSave = (index: number, newDescription: string) => {
    const newStatements = [...currentStatements];
    newStatements[index] = { ...newStatements[index], description: newDescription };
    setCurrentStatements(newStatements);
    setEditingStatements(null);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
    }
  };

  const handleNumberSave = (index: number, newNumber: string) => {
    const newStatements = [...currentStatements];
    newStatements[index] = { ...newStatements[index], number: newNumber };
    setCurrentStatements(newStatements);
    setEditingNumbers(null);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleStatementCancel = () => {
    setCurrentStatements(statements);
    setEditingStatements(null);
  };

  const handleNumberCancel = () => {
    setCurrentStatements(statements);
    setEditingNumbers(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, pageNumber, logoNew, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, pageNumber, logoNew, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, pageNumber, logoNew, backgroundColor, titleColor, contentColor, accentColor }, logoNew: newLogoPath });
    }
  };

  return (
    <div className="impact-statements-slide-template inter-theme" style={slideStyles}>
      <style>{`
        .impact-statements-slide-template *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .impact-statements-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      {/* Left section with title and profile image */}
      <div style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Title */}
        <div style={{
          maxWidth: '537px',
          fontSize: '48px',
          color: '#09090B',
          lineHeight: '1.1',
          flex: 1,
          minHeight: '50px',
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="impact-title-editor title-element"
              style={{
                maxWidth: '537px',
                fontSize: '48px',
                color: '#09090B',
                lineHeight: '1.1',
                width: '100%',
                height: 'auto',
                minHeight: '50px'
              }}
            />
          ) : (
            <div
              className="title-element"
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                fontSize: '48px',
                color: '#09090B',
                lineHeight: '1.1',
                minHeight: '50px'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Profile image in gradient container */}
        <div style={{
          width: '520px',
          height: '310px',
          background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
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
              width: '43%',
              height: '100%',
              objectFit: 'cover',
              position: 'relative',
              bottom: '-55px',
            }}
          />
        </div>
      </div>

      {/* Logo in bottom-right corner */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '30px'
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
            onClick={() => isEditable && setShowLogoUploadModal(true)}
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
              border: '2px solid #09090B',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#09090B', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#09090B', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#09090B', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
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
          backgroundColor: 'rgba(9, 9, 11, 0.6)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
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
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleLogoNewUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
      {/* Right section with impact statements */}
      <div style={{
        display: 'flex',
        gap: '15px',
        width: '50%',
        height: '100%'
      }}>
        {/* Левая колонка (два блока) */}
        <div style={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {[currentStatements[0], currentStatements[2]].filter(Boolean).map((statement, idx) => {
            const index = idx === 0 ? 0 : 2;
            return (
            <div
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                ...(idx === 1 ? { height: '310px' } : { flex: 1 })
              }}
            >
              {/* Number */}
              <div className="title-element" style={{
                fontSize: '58px',
                color: '#263644',
                minHeight: '60px',
                maxHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                {isEditable && editingNumbers === index ? (
                  <ImprovedInlineEditor
                    initialValue={statement.number}
                    onSave={(value) => handleNumberSave(index, value)}
                    onCancel={handleNumberCancel}
                    className="statement-number-editor title-element"
                    style={{
                      fontSize: '58px',
                      color: '#263644',
                      width: '100%',
                      height: 'auto',
                      minHeight: '60px',
                      maxHeight: '60px'
                    }}
                  />
                ) : (
                  <div
                    className="title-element"
                    onClick={() => isEditable && setEditingNumbers(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '58px',
                      color: themeBg,
                      minHeight: '60px',
                      maxHeight: '60px',
                      overflow: 'hidden'
                    }}
                  >
                    {statement.number}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{
                fontSize: '18px',
                color: 'rgba(9, 9, 11, 0.7)',
                lineHeight: '1.4',
                minHeight: '25px',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                {isEditable && editingStatements === index ? (
                  <ImprovedInlineEditor
                    initialValue={statement.description}
                    onSave={(value) => handleStatementSave(index, value)}
                    onCancel={handleStatementCancel}
                    multiline={true}
                    className="statement-description-editor"
                    style={{
                      fontSize: '18px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingStatements(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '18px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%'
                    }}
                  >
                    {statement.description}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>

        {/* Правая колонка (один блок) */}
        <div style={{
          width: '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'stretch'
        }}>
          {currentStatements[1] && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                flex: 1
              }}
            >
              <div className="title-element" style={{
                fontSize: '58px',
                color: '#263644',
              }}>
                {isEditable && editingNumbers === 1 ? (
                  <ImprovedInlineEditor
                    initialValue={currentStatements[1].number}
                    onSave={(value) => handleNumberSave(1, value)}
                    onCancel={handleNumberCancel}
                    className="statement-number-editor title-element"
                    style={{
                      fontSize: '58px',
                      color: '#263644',
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                ) : (
                  <div
                    className="title-element"
                    onClick={() => isEditable && setEditingNumbers(1)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '58px',
                      color: themeBg,
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    {currentStatements[1].number}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '18px',
                color: 'rgba(9, 9, 11, 0.7)',
                lineHeight: '1.4'
              }}>
                {isEditable && editingStatements === 1 ? (
                  <ImprovedInlineEditor
                    initialValue={currentStatements[1].description}
                    onSave={(value) => handleStatementSave(1, value)}
                    onCancel={handleStatementCancel}
                    multiline={true}
                    className="statement-description-editor"
                    style={{
                      fontSize: '18px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingStatements(1)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '18px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%'
                    }}
                  >
                    {currentStatements[1].description}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpactStatementsSlideTemplate; 