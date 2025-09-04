// custom_extensions/frontend/src/components/templates/KpiReportChartSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { KpiReportChartSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const KpiReportChartSlideTemplate: React.FC<KpiReportChartSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'KPI Report',
  legend = [
    { color: '#FFFFFF', label: 'Gross Profit' },
    { color: '#C77B4A', label: 'Net Profit' },
    { color: '#7B947B', label: 'Operating Profit' }
  ],
  bars = [
    { percentage: '42%', color: '#FFFFFF', height: 180 },
    { percentage: '30%', color: '#C77B4A', height: 130 },
    { percentage: '22%', color: '#7B947B', height: 95 }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
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
  const [editingLegend, setEditingLegend] = useState<{ index: number; field: 'label' } | null>(null);
  const [editingBars, setEditingBars] = useState<{ index: number; field: 'percentage' } | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingReportType, setEditingReportType] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  
  const [currentLegend, setCurrentLegend] = useState(legend);
  const [currentBars, setCurrentBars] = useState(bars);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentReportType, setCurrentReportType] = useState(reportType);
  const [currentDate, setCurrentDate] = useState(date);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#3C453C', // Dark olive-green background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  const handleLegendSave = (index: number, field: 'label', newValue: string) => {
    const newLegend = [...currentLegend];
    newLegend[index] = { ...newLegend[index], [field]: newValue };
    setCurrentLegend(newLegend);
    setEditingLegend(null);
    if (onUpdate) {
      onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, legend: newLegend });
    }
  };

  const handleBarSave = (index: number, field: 'percentage', newValue: string) => {
    const newBars = [...currentBars];
    newBars[index] = { ...newBars[index], [field]: newValue };
    setCurrentBars(newBars);
    setEditingBars(null);
    if (onUpdate) {
      onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleReportTypeSave = (newReportType: string) => {
    setCurrentReportType(newReportType);
    setEditingReportType(false);
    if (onUpdate) {
      onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, reportType: newReportType });
    }
  };

  const handleDateSave = (newDate: string) => {
    setCurrentDate(newDate);
    setEditingDate(false);
    if (onUpdate) {
      onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, date: newDate });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const addBar = () => {
    if (isEditable) {
      const newBars = [...currentBars, { percentage: '0%', color: '#888888', height: 50 }];
      setCurrentBars(newBars);
      if (onUpdate) {
        onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
      }
    }
  };

  const removeBar = (index: number) => {
    if (isEditable && currentBars.length > 1) {
      const newBars = currentBars.filter((_, i) => i !== index);
      setCurrentBars(newBars);
      if (onUpdate) {
        onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
      }
    }
  };

  const adjustBarHeight = (index: number, delta: number) => {
    if (isEditable) {
      const newBars = [...currentBars];
      newBars[index] = { ...newBars[index], height: Math.max(20, Math.min(200, newBars[index].height + delta)) };
      setCurrentBars(newBars);
      if (onUpdate) {
        onUpdate({ ...{ title, legend, bars, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, bars: newBars });
      }
    }
  };

  return (
    <div className="kpi-report-chart-slide-template inter-theme" style={slideStyles}>
      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {currentLegend.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: item.color,
            }} />
            <div style={{
              fontSize: '16px',
              color: '#FFFFFF', // White text as per screenshot
            }}>
              {isEditable && editingLegend?.index === index && editingLegend?.field === 'label' ? (
                <ImprovedInlineEditor
                  initialValue={item.label}
                  onSave={(value) => handleLegendSave(index, 'label', value)}
                  onCancel={() => setEditingLegend(null)}
                  className="legend-label-editor"
                  style={{
                    fontSize: '16px',
                    color: '#FFFFFF',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingLegend({ index, field: 'label' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {item.label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        right: '60px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '20px',
        height: '200px',
      }}>
        {currentBars.map((bar, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
          }}>
            {/* Bar */}
            <div style={{
              width: '60px',
              height: `${bar.height}px`,
              backgroundColor: bar.color,
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {/* Percentage Text */}
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: bar.color === '#FFFFFF' ? '#333333' : '#FFFFFF', // Dark text for white bars, white for others
              }}>
                {isEditable && editingBars?.index === index && editingBars?.field === 'percentage' ? (
                  <ImprovedInlineEditor
                    initialValue={bar.percentage}
                    onSave={(value) => handleBarSave(index, 'percentage', value)}
                    onCancel={() => setEditingBars(null)}
                    className="bar-percentage-editor"
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: bar.color === '#FFFFFF' ? '#333333' : '#FFFFFF',
                      width: '100%',
                      height: 'auto',
                      textAlign: 'center',
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

              {/* Interactive Controls */}
              {isEditable && (
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '4px',
                }}>
                  <button
                    onClick={() => adjustBarHeight(index, 10)}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #333333',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => adjustBarHeight(index, -10)}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #333333',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                  {currentBars.length > 1 && (
                    <button
                      onClick={() => removeBar(index)}
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#FF4444',
                        border: '1px solid #333333',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Bar Button */}
        {isEditable && (
          <button
            onClick={addBar}
            style={{
              width: '60px',
              height: '40px',
              backgroundColor: '#FFFFFF',
              border: '2px dashed #333333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333333',
            }}
          >
            +
          </button>
        )}
      </div>

      {/* Profile Image */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '60px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid #FFFFFF', // White border as per screenshot
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
          fontSize: '14px',
          color: '#AAAAAA', // Light gray color as per screenshot
        }}>
          {isEditable && editingCompanyName ? (
            <ImprovedInlineEditor
              initialValue={currentCompanyName}
              onSave={handleCompanyNameSave}
              onCancel={() => setEditingCompanyName(false)}
              className="company-name-editor"
              style={{
                fontSize: '14px',
                color: '#AAAAAA',
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
          fontSize: '14px',
          color: '#AAAAAA', // Light gray color as per screenshot
        }}>
          {isEditable && editingReportType ? (
            <ImprovedInlineEditor
              initialValue={currentReportType}
              onSave={handleReportTypeSave}
              onCancel={() => setEditingReportType(false)}
              className="report-type-editor"
              style={{
                fontSize: '14px',
                color: '#AAAAAA',
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
          fontSize: '14px',
          color: '#AAAAAA', // Light gray color as per screenshot
        }}>
          {isEditable && editingDate ? (
            <ImprovedInlineEditor
              initialValue={currentDate}
              onSave={handleDateSave}
              onCancel={() => setEditingDate(false)}
              className="date-editor"
              style={{
                fontSize: '14px',
                color: '#AAAAAA',
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

export default KpiReportChartSlideTemplate;