// custom_extensions/frontend/src/components/templates/ImpactStatementsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ImpactStatementsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const ImpactStatementsSlideTemplate: React.FC<ImpactStatementsSlideProps & {
  theme?: SlideTheme | string;
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

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '645px',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '60px 80px',
    paddingBottom: '35px',
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
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="impact-statements-slide-template" style={slideStyles}>
      {/* Left section with title and profile image */}
      <div style={{
        width: '75%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Title */}
        <div style={{
          maxWidth: '390px',
          fontSize: '40px',
          color: themeTitle,
          lineHeight: '1.2',
          marginBottom: '40px',
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
              className="impact-title-editor"
              style={{
                maxWidth: '390px',
                fontSize: '40px',
                color: themeTitle,
                lineHeight: '1.2',
                width: '100%',
                height: 'auto',
                minHeight: '50px'
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
                maxWidth: '390px',
                fontSize: '40px',
                color: themeTitle,
                lineHeight: '1.2',
                minHeight: '50px'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Profile image in orange container */}
        <div style={{
          width: '300px',
          height: '200px',
          backgroundColor: themeAccent,
          borderRadius: '24px',
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
              height: '92%',
              objectFit: 'cover',
              position: 'relative',
              bottom: '-21px',
            }}
          />
        </div>
      </div>

      {/* Right section with impact statements */}
      <div style={{
        display: 'flex',
        gap: '31px',
        width: '65%',
        height: '100%'
      }}>
        {/* Левая колонка (два блока) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          {currentStatements.slice(0, 2).map((statement, index) => (
            <div
              key={index}
              style={{
                backgroundColor: themeAccent,
                borderRadius: '20px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minHeight: index === 1 ? '195.5px' : '325px'
              }}
            >
              {/* Number */}
              <div style={{
                fontSize: '48px',
                color: themeBg,
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
                    className="statement-number-editor"
                    style={{
                      fontSize: '48px',
                      color: themeBg,
                      width: '100%',
                      height: 'auto',
                      minHeight: '60px',
                      maxHeight: '60px'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingNumbers(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '48px',
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
                fontSize: '14px',
                color: themeBg,
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
                      fontSize: '14px',
                      color: themeBg,
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
                      fontSize: '14px',
                      color: themeBg,
                      lineHeight: '1.4',
                      width: '100%'
                    }}
                  >
                    {statement.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Правая колонка (один блок) */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch'
        }}>
          {currentStatements[2] && (
            <div
              style={{
                backgroundColor: themeAccent,
                borderRadius: '20px',
                padding: '30px',
                paddingTop: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                height: '550px'
              }}
            >
              <div style={{
                fontSize: '48px',
                color: themeBg,
              }}>
                {isEditable && editingNumbers === 2 ? (
                  <ImprovedInlineEditor
                    initialValue={currentStatements[2].number}
                    onSave={(value) => handleNumberSave(2, value)}
                    onCancel={handleNumberCancel}
                    className="statement-number-editor"
                    style={{
                      fontSize: '48px',
                      color: themeBg,
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingNumbers(2)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '48px',
                      color: themeBg,
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    {currentStatements[2].number}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '14px',
                color: themeBg,
                lineHeight: '1.4'
              }}>
                {isEditable && editingStatements === 2 ? (
                  <ImprovedInlineEditor
                    initialValue={currentStatements[2].description}
                    onSave={(value) => handleStatementSave(2, value)}
                    onCancel={handleStatementCancel}
                    multiline={true}
                    className="statement-description-editor"
                    style={{
                      fontSize: '14px',
                      color: themeBg,
                      lineHeight: '1.4',
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingStatements(2)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontSize: '14px',
                      color: themeBg,
                      lineHeight: '1.4',
                      width: '100%'
                    }}
                  >
                    {currentStatements[2].description}
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