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
    { number: '50%', description: 'decrease in turnover\nrates.' },
    { number: '$2.8B', description: 'the cost of harassment\nto businesses in the United States annually.' },
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
    gap: '5.83%',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    paddingTop: '3.33%',
    paddingBottom: '5.42%',
    paddingLeft: '4.17%',
    paddingRight: '3.33%',
    boxSizing: 'border-box',
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
      {/* Left section with title and profile image - MATCHES HTML: gap: 17px */}
      <div style={{
        width: '45%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.57%'
      }}>
        {/* Title - MATCHES HTML: maxWidth: 784px, fontSize: 74px, minHeight: 45px */}
        <div style={{
          fontSize: '50px',
          color: '#09090B',
          lineHeight: '1.2',
          flex: 1,
          minHeight: '4.17%',
          display: 'flex',
          alignItems: 'flex-start',
          fontWeight: 500
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="impact-title-editor title-element"
              style={{
                fontSize: '50px',
                color: '#09090B',
                lineHeight: '1.2',
                width: '100%',
                height: 'auto',
                minHeight: '4.17%'
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
                fontSize: '50px',
                color: '#09090B',
                lineHeight: '1.2',
                minHeight: '4.17%'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Profile image in gradient container - MATCHES HTML: width: 784px, height: 279px, borderRadius: 13px */}
        <div style={{
          width: '100%',
          height: '47.83%',
          background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)',
          borderRadius: '0.68%',
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
            fit="contain"
            style={{
              width: '80%',
              height: '110%',
              position: 'relative',
              bottom: '-4.17%',
            }}
          />
        </div>
      </div>

      {/* Logo in bottom-right corner - MATCHES HTML: bottom: 32px, right: 48px */}
      <div style={{
        position: 'absolute',
        bottom: '1.67%',
        right: '2.5%'
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

      {/* Page number with line - MATCHES HTML: bottom: 24px, gap: 13px, line: 32px × 1.5px, fontSize: 27px */}
      <div style={{
        position: 'absolute',
        bottom: '1.25%',
        left: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.68%'
      }}>
        {/* Small line */}
        <div style={{
          width: '1.67%',
          height: '0.14%',
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
              fontSize: '1.4vw',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: 'auto',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#09090B99',
              fontSize: '1.4vw',
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
      {/* Right section with impact statements - MATCHES HTML: gap: 24px */}
      <div style={{
        display: 'flex',
        gap: '1.25%',
        width: '55%',
        height: '100%'
      }}>
        {/* Левая колонка (два блока) - MATCHES HTML: gap: 12px */}
        <div style={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.11%'
        }}>
          {[currentStatements[0], currentStatements[2]].filter(Boolean).map((statement, idx) => {
            const index = idx === 0 ? 0 : 2;
            return (
            <div
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '0.68%',
                padding: '1.67%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.83%',
                boxShadow: '0px 0.31% 1.67% rgba(0, 0, 0, 0.08)',
                ...(idx === 1 ? { height: '25.83%' } : { flex: 1 })
              }}
            >
              {/* Number - MATCHES HTML: fontSize: 93px, minHeight/maxHeight: 54px */}
              <div className="title-element" style={{
                fontSize: '60px',
                color: '#263644',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                fontWeight: 500
              }}>
                {isEditable && editingNumbers === index ? (
                  <ImprovedInlineEditor
                    initialValue={statement.number}
                    onSave={(value) => handleNumberSave(index, value)}
                    onCancel={handleNumberCancel}
                    className="statement-number-editor title-element"
                    style={{
                      fontSize: '60px',
                      color: '#263644',
                      width: '100%',
                      height: 'auto',
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
                      fontSize: '60px',
                      color: themeBg,
                      overflow: 'hidden'
                    }}
                  >
                    {statement.number}
                  </div>
                )}
              </div>

              {/* Description - MATCHES HTML: fontSize: 29px, minHeight: 22px */}
              <div style={{
                fontSize: '22px',
                color: 'rgba(9, 9, 11, 0.7)',
                lineHeight: '1.4',
                display: 'flex',
                alignItems: 'flex-start',
                fontFamily: 'Inter, sans-serif'
              }}>
                {isEditable && editingStatements === index ? (
                  <ImprovedInlineEditor
                    initialValue={statement.description}
                    onSave={(value) => handleStatementSave(index, value)}
                    onCancel={handleStatementCancel}
                    multiline={true}
                    className="statement-description-editor"
                    style={{
                      fontSize: '22px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%',
                      height: 'auto',
                      whiteSpace: 'pre-line',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingStatements(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '22px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%',
                      whiteSpace: 'pre-line',
                      fontFamily: 'Inter, sans-serif'
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
                borderRadius: '0.68%',
                padding: '1.67%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.83%',
                boxShadow: '0px 0.31% 1.67% rgba(0, 0, 0, 0.08)',
                flex: 1
              }}
            >
              <div className="title-element" style={{
                fontSize: '4.84vw',
                color: '#263644',
                minHeight: '5%',
                maxHeight: '5%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                fontWeight: 500
              }}>
                {isEditable && editingNumbers === 1 ? (
                  <ImprovedInlineEditor
                    initialValue={currentStatements[1].number}
                    onSave={(value) => handleNumberSave(1, value)}
                    onCancel={handleNumberCancel}
                    className="statement-number-editor title-element"
                    style={{
                      fontSize: '4.84vw',
                      color: '#263644',
                      width: '100%',
                      height: 'auto',
                      minHeight: '5%',
                      maxHeight: '5%'
                    }}
                  />
                ) : (
                  <div
                    className="title-element"
                    onClick={() => isEditable && setEditingNumbers(1)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '4.84vw',
                      color: themeBg,
                      fontWeight: 500,
                      width: '100%'
                    }}
                  >
                    {currentStatements[1].number}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '1.51vw',
                color: 'rgba(9, 9, 11, 0.7)',
                lineHeight: '1.4',
                minHeight: '2.04%',
                fontFamily: 'Inter, sans-serif'
              }}>
                {isEditable && editingStatements === 1 ? (
                  <ImprovedInlineEditor
                    initialValue={currentStatements[1].description}
                    onSave={(value) => handleStatementSave(1, value)}
                    onCancel={handleStatementCancel}
                    multiline={true}
                    className="statement-description-editor"
                    style={{
                      fontSize: '1.51vw',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%',
                      height: 'auto',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingStatements(1)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '1.51vw',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%',
                      fontFamily: 'Inter, sans-serif'
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