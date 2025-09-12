// custom_extensions/frontend/src/components/templates/SolutionStepsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { SolutionStepsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const SolutionStepsSlideTemplate: React.FC<SolutionStepsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'The Solution',
  buttonText = 'Step-by-step Guide',
  steps = [
    { title: 'Step 1', description: 'Know the Regulations' },
    { title: 'Step 2', description: 'Conduct Risk Assessments' },
    { title: 'Step 3', description: 'Provide Training and Education' }
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
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingButtonText, setEditingButtonText] = useState(false);
  const [editingSteps, setEditingSteps] = useState<{ index: number; field: 'title' | 'description' } | null>(null);
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentButtonText, setCurrentButtonText] = useState(buttonText);
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [currentWebsite, setCurrentWebsite] = useState(website);
  const [currentDate, setCurrentDate] = useState(date);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  // Helper function for inline editor styling
  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background: \'transparent\',
    border: \'none\',
    outline: \'none\',
    padding: 0,
    margin: 0
  });

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#15232E', // Dark blue-grey background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, buttonText, steps, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleButtonTextSave = (newButtonText: string) => {
    setCurrentButtonText(newButtonText);
    setEditingButtonText(false);
    if (onUpdate) {
      onUpdate({ ...{ title, buttonText, steps, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, buttonText: newButtonText });
    }
  };

  const handleStepSave = (index: number, field: 'title' | 'description', newValue: string) => {
    const newSteps = [...currentSteps];
    newSteps[index] = { ...newSteps[index], [field]: newValue };
    setCurrentSteps(newSteps);
    setEditingSteps(null);
    if (onUpdate) {
      onUpdate({ ...{ title, buttonText, steps, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, steps: newSteps });
    }
  };

  const handleWebsiteSave = (newWebsite: string) => {
    setCurrentWebsite(newWebsite);
    setEditingWebsite(false);
    if (onUpdate) {
      onUpdate({ ...{ title, buttonText, steps, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, website: newWebsite });
    }
  };

  const handleDateSave = (newDate: string) => {
    setCurrentDate(newDate);
    setEditingDate(false);
    if (onUpdate) {
      onUpdate({ ...{ title, buttonText, steps, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, date: newDate });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, buttonText, steps, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, buttonText, steps, profileImagePath, profileImageAlt, website, date, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const positions: string[] = ['15%', '43%', '71%'];

  return (
    <div className="solution-steps-slide-template inter-theme" style={slideStyles}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#DEE2E2',
        lineHeight: '1.1',
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="solution-title-editor"
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              lineHeight: '1.1',
              width: '100%',
              height: 'auto',
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

      {/* Orange Button */}
      <div style={{
        position: 'absolute',
        top: '140px',
        left: '60px',
        backgroundColor: '#EC6140',
        padding: '10px 24px',
        cursor: isEditable ? 'pointer' : 'default',
      }}>
        {isEditable && editingButtonText ? (
          <ImprovedInlineEditor
            initialValue={currentButtonText}
            onSave={handleButtonTextSave}
            onCancel={() => setEditingButtonText(false)}
            className="button-text-editor"
            style={{
              fontSize: '23px',
              fontWeight: '500',
              color: '#F4D4C8',
              width: '100%',
              height: 'auto',
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingButtonText(true)}
            style={{
              fontSize: '23px',
              fontWeight: '500',
              color: '#F4D4C8',
              userSelect: 'none'
            }}
          >
            {currentButtonText}
          </div>
        )}
      </div>

      {/* Profile Image */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#F06C3E', // Orange background
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
            position: 'relative',
            bottom: '-16px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Timeline and Steps */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Timeline Line */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#F1FEFF',
          position: 'relative',
          marginBottom: '40px',
        }}>
          {/* Step Circles */}
          {currentSteps.map((step, index) => (
            <div key={index} style={{
              position: 'absolute',
              top: '50%',
              left: positions[index],
              transform: 'translate(-50%, -50%)',
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              backgroundColor: '#FAF36F', // Yellow circles
              zIndex: 1,
            }} />
          ))}
        </div>

        {/* Step Titles and Descriptions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          {currentSteps.map((step, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: index === 0 ? '16%' : '0',
              marginTop: '-30px',
              width: index === 0 ? '33.33%' : index === 1 ? '16.33%' : index === 2 ? '28%' : '0',
            }}>
              {/* Step Title */}
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#D5DBDD',
                marginBottom: '15px',
              }}>
                {isEditable && editingSteps?.index === index && editingSteps?.field === 'title' ? (
                  <ImprovedInlineEditor
                    initialValue={step.title}
                    onSave={(value) => handleStepSave(index, 'title', value)}
                    onCancel={() => setEditingSteps(null)}
                    className="step-title-editor"
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#D5DBDD',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingSteps({ index, field: 'title' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {step.title}
                  </div>
                )}
              </div>

              {/* Step Description */}
              <div style={{
                fontSize: '16px',
                color: '#A0A9AF',
                lineHeight: '1.3',
                maxWidth: '160px',
              }}>
                {isEditable && editingSteps?.index === index && editingSteps?.field === 'description' ? (
                  <ImprovedInlineEditor
                    initialValue={step.description}
                    onSave={(value) => handleStepSave(index, 'description', value)}
                    onCancel={() => setEditingSteps(null)}
                    className="step-description-editor"
                    style={{
                      fontSize: '16px',
                      color: '#A0A9AF',
                      width: '100%',
                      height: 'auto',
                      lineHeight: '1.3',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingSteps({ index, field: 'description' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '60px',
        right: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Website */}
        <div style={{
          fontSize: '14px',
          color: '#A2ACB1',
        }}>
          {isEditable && editingWebsite ? (
            <ImprovedInlineEditor
              initialValue={currentWebsite}
              onSave={handleWebsiteSave}
              onCancel={() => setEditingWebsite(false)}
              className="website-editor"
              style={{
                fontSize: '14px',
                color: '#A2ACB1',
                width: '100%',
                height: 'auto',
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

        {/* Date and Page Number */}
        <div style={{
          display: 'flex',
          gap: '45px',
          fontSize: '14px',
          color: '#A2ACB1',
        }}>
          {isEditable && editingDate ? (
            <ImprovedInlineEditor
              initialValue={currentDate}
              onSave={handleDateSave}
              onCancel={() => setEditingDate(false)}
              className="date-editor"
              style={{
                fontSize: '14px',
                color: '#A2ACB1',
                width: '100%',
                height: 'auto',
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
          
          {isEditable && editingPageNumber ? (
            <ImprovedInlineEditor
              initialValue={currentPageNumber}
              onSave={handlePageNumberSave}
              onCancel={() => setEditingPageNumber(false)}
              className="page-number-editor"
              style={{
                fontSize: '14px',
                color: '#A2ACB1',
                width: '100%',
                height: 'auto',
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

export default SolutionStepsSlideTemplate;