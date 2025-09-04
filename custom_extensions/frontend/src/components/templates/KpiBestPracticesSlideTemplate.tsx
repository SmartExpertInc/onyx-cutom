// custom_extensions/frontend/src/components/templates/KpiBestPracticesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { KpiBestPracticesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const KpiBestPracticesSlideTemplate: React.FC<KpiBestPracticesSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  leftImagePath = '',
  leftImageAlt = 'Left image',
  bodyText = 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re measuring only the key performance indicators that will help you reach your business goals. The strategic focus is one of the most important aspects of the KPI definition. Here are some best practices for developing the right KPIs.',
  rightImagePath = '',
  rightImageAlt = 'Right image',
  bottomImagePath = '',
  bottomImageAlt = 'Bottom image',
  companyName = 'Company name',
  reportType = 'KPI Report',
  date = 'February 2023',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingBodyText, setEditingBodyText] = useState(false);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingReportType, setEditingReportType] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  
  const [currentBodyText, setCurrentBodyText] = useState(bodyText);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentReportType, setCurrentReportType] = useState(reportType);
  const [currentDate, setCurrentDate] = useState(date);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#F5F5F5', // Light gray background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  const handleBodyTextSave = (newBodyText: string) => {
    setCurrentBodyText(newBodyText);
    setEditingBodyText(false);
    if (onUpdate) {
      onUpdate({ ...{ leftImagePath, leftImageAlt, bodyText, rightImagePath, rightImageAlt, bottomImagePath, bottomImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, bodyText: newBodyText });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ leftImagePath, leftImageAlt, bodyText, rightImagePath, rightImageAlt, bottomImagePath, bottomImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleReportTypeSave = (newReportType: string) => {
    setCurrentReportType(newReportType);
    setEditingReportType(false);
    if (onUpdate) {
      onUpdate({ ...{ leftImagePath, leftImageAlt, bodyText, rightImagePath, rightImageAlt, bottomImagePath, bottomImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, reportType: newReportType });
    }
  };

  const handleDateSave = (newDate: string) => {
    setCurrentDate(newDate);
    setEditingDate(false);
    if (onUpdate) {
      onUpdate({ ...{ leftImagePath, leftImageAlt, bodyText, rightImagePath, rightImageAlt, bottomImagePath, bottomImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, date: newDate });
    }
  };

  const handleLeftImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ leftImagePath, leftImageAlt, bodyText, rightImagePath, rightImageAlt, bottomImagePath, bottomImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, leftImagePath: newImagePath });
    }
  };

  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ leftImagePath, leftImageAlt, bodyText, rightImagePath, rightImageAlt, bottomImagePath, bottomImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, rightImagePath: newImagePath });
    }
  };

  const handleBottomImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ leftImagePath, leftImageAlt, bodyText, rightImagePath, rightImageAlt, bottomImagePath, bottomImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, bottomImagePath: newImagePath });
    }
  };

  return (
    <div className="kpi-best-practices-slide-template inter-theme" style={slideStyles}>
      {/* Main Content Area */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        right: '60px',
        bottom: '60px',
        display: 'flex',
        gap: '30px',
      }}>
        {/* Left Image */}
        <div style={{
          width: '300px',
          height: '400px',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <ClickableImagePlaceholder
            imagePath={leftImagePath}
            onImageUploaded={handleLeftImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Left image"
            isEditable={isEditable}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Center Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Right Avatar */}
          <div style={{
            alignSelf: 'flex-end',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
          }}>
            <ClickableImagePlaceholder
              imagePath={rightImagePath}
              onImageUploaded={handleRightImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Right avatar"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Body Text */}
          <div style={{
            fontSize: '16px',
            color: '#4A4A4A', // Dark gray color as per screenshot
            lineHeight: '1.4',
            flex: 1,
          }}>
            {isEditable && editingBodyText ? (
              <ImprovedInlineEditor
                initialValue={currentBodyText}
                onSave={handleBodyTextSave}
                onCancel={() => setEditingBodyText(false)}
                className="body-text-editor"
                multiline={true}
                style={{
                  fontSize: '16px',
                  color: '#4A4A4A',
                  lineHeight: '1.4',
                  width: '100%',
                  height: 'auto',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingBodyText(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentBodyText}
              </div>
            )}
          </div>

          {/* Bottom Image */}
          <div style={{
            width: '100%',
            height: '150px',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <ClickableImagePlaceholder
              imagePath={bottomImagePath}
              onImageUploaded={handleBottomImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Bottom image"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '60px',
        right: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Company Name */}
        <div style={{
          fontSize: '12px',
          color: '#888888', // Light gray color as per screenshot
        }}>
          {isEditable && editingCompanyName ? (
            <ImprovedInlineEditor
              initialValue={currentCompanyName}
              onSave={handleCompanyNameSave}
              onCancel={() => setEditingCompanyName(false)}
              className="company-name-editor"
              style={{
                fontSize: '12px',
                color: '#888888',
                width: '100%',
                height: 'auto',
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingCompanyName(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentCompanyName}
            </div>
          )}
        </div>

        {/* Report Type */}
        <div style={{
          fontSize: '12px',
          color: '#888888', // Light gray color as per screenshot
        }}>
          {isEditable && editingReportType ? (
            <ImprovedInlineEditor
              initialValue={currentReportType}
              onSave={handleReportTypeSave}
              onCancel={() => setEditingReportType(false)}
              className="report-type-editor"
              style={{
                fontSize: '12px',
                color: '#888888',
                width: '100%',
                height: 'auto',
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingReportType(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentReportType}
            </div>
          )}
        </div>

        {/* Date */}
        <div style={{
          fontSize: '12px',
          color: '#888888', // Light gray color as per screenshot
        }}>
          {isEditable && editingDate ? (
            <ImprovedInlineEditor
              initialValue={currentDate}
              onSave={handleDateSave}
              onCancel={() => setEditingDate(false)}
              className="date-editor"
              style={{
                fontSize: '12px',
                color: '#888888',
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
        </div>
      </div>
    </div>
  );
};

export default KpiBestPracticesSlideTemplate;