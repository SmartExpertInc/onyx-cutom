// custom_extensions/frontend/src/components/templates/EnterpriseRoadmapSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { EnterpriseRoadmapSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const EnterpriseRoadmapSlideTemplate: React.FC<EnterpriseRoadmapSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Enterprise Offerings: Roadmap',
  description = 'These KPIs typically measure performance in a shorter time frame, and are focused on organizational processes and efficiencies. Some examples include sales by region, average monthly transportation costs and cost per acquisition (CPA)',
  tableData = [
    { featureName: 'Mobile optimization', status: 'Testin', dueDate: '14 April', assignee: 'Julius' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
    { featureName: 'Cross-platform sync', status: 'Consept', dueDate: '30 June', assignee: 'Vanessa' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
    { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' }
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
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingTableData, setEditingTableData] = useState<{ rowIndex: number; field: 'featureName' | 'status' | 'dueDate' | 'assignee' } | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingReportType, setEditingReportType] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentTableData, setCurrentTableData] = useState(tableData);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentReportType, setCurrentReportType] = useState(reportType);
  const [currentDate, setCurrentDate] = useState(date);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#FFFFFF', // White background as per screenshot
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
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleDescriptionSave = (newDescription: string) => {
    setCurrentDescription(newDescription);
    setEditingDescription(false);
    if (onUpdate) {
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, description: newDescription });
    }
  };

  const handleTableDataSave = (rowIndex: number, field: 'featureName' | 'status' | 'dueDate' | 'assignee', newValue: string) => {
    const newTableData = [...currentTableData];
    newTableData[rowIndex] = { ...newTableData[rowIndex], [field]: newValue };
    setCurrentTableData(newTableData);
    setEditingTableData(null);
    if (onUpdate) {
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, tableData: newTableData });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleReportTypeSave = (newReportType: string) => {
    setCurrentReportType(newReportType);
    setEditingReportType(false);
    if (onUpdate) {
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, reportType: newReportType });
    }
  };

  const handleDateSave = (newDate: string) => {
    setCurrentDate(newDate);
    setEditingDate(false);
    if (onUpdate) {
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, date: newDate });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, description, tableData, profileImagePath, profileImageAlt, companyName, reportType, date, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="enterprise-roadmap-slide-template inter-theme" style={slideStyles}>
      {/* Header Section */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        right: '60px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '30px',
      }}>
        {/* Profile Image */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#10B981', // Dark green background as per screenshot
          flexShrink: 0,
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

        {/* Title and Description */}
        <div style={{
          flex: 1,
        }}>
          {/* Title */}
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#4A4A4A', // Dark gray/black color as per screenshot
            marginBottom: '12px',
            lineHeight: '1.1',
            textAlign: 'center',
          }}>
            {isEditable && editingTitle ? (
              <ImprovedInlineEditor
                initialValue={currentTitle}
                onSave={handleTitleSave}
                onCancel={() => setEditingTitle(false)}
                className="roadmap-title-editor"
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#4A4A4A',
                  lineHeight: '1.1',
                  width: '100%',
                  height: 'auto',
                  textAlign: 'center',
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

          {/* Description */}
          <div style={{
            fontSize: '14px',
            color: '#888888', // Lighter gray color as per screenshot
            lineHeight: '1.4',
            textAlign: 'left',
          }}>
            {isEditable && editingDescription ? (
              <ImprovedInlineEditor
                initialValue={currentDescription}
                onSave={handleDescriptionSave}
                onCancel={() => setEditingDescription(false)}
                className="roadmap-description-editor"
                multiline={true}
                style={{
                  fontSize: '14px',
                  color: '#888888',
                  lineHeight: '1.4',
                  width: '100%',
                  height: 'auto',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingDescription(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentDescription}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        position: 'absolute',
        top: '200px',
        left: '60px',
        right: '60px',
        bottom: '60px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          backgroundColor: '#10B981', // Dark green background as per screenshot
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '20px',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>Feature Name</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>Status</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>Due Date</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>Assignee</div>
        </div>

        {/* Table Body */}
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {currentTableData.map((row, rowIndex) => (
            <div key={rowIndex} style={{
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '20px',
              alignItems: 'center',
              backgroundColor: rowIndex % 2 === 0 ? '#F9F9F9' : '#FFFFFF', // Alternating row colors
              borderBottom: '1px solid #E5E5E5',
            }}>
              {/* Feature Name */}
              <div style={{
                fontSize: '14px',
                color: '#4A4A4A',
                fontWeight: '500',
              }}>
                {isEditable && editingTableData?.rowIndex === rowIndex && editingTableData?.field === 'featureName' ? (
                  <ImprovedInlineEditor
                    initialValue={row.featureName}
                    onSave={(value) => handleTableDataSave(rowIndex, 'featureName', value)}
                    onCancel={() => setEditingTableData(null)}
                    className="table-feature-name-editor"
                    style={{
                      fontSize: '14px',
                      color: '#4A4A4A',
                      fontWeight: '500',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingTableData({ rowIndex, field: 'featureName' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {row.featureName}
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{
                fontSize: '14px',
                color: '#4A4A4A',
              }}>
                {isEditable && editingTableData?.rowIndex === rowIndex && editingTableData?.field === 'status' ? (
                  <ImprovedInlineEditor
                    initialValue={row.status}
                    onSave={(value) => handleTableDataSave(rowIndex, 'status', value)}
                    onCancel={() => setEditingTableData(null)}
                    className="table-status-editor"
                    style={{
                      fontSize: '14px',
                      color: '#4A4A4A',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingTableData({ rowIndex, field: 'status' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {row.status}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div style={{
                fontSize: '14px',
                color: '#4A4A4A',
              }}>
                {isEditable && editingTableData?.rowIndex === rowIndex && editingTableData?.field === 'dueDate' ? (
                  <ImprovedInlineEditor
                    initialValue={row.dueDate}
                    onSave={(value) => handleTableDataSave(rowIndex, 'dueDate', value)}
                    onCancel={() => setEditingTableData(null)}
                    className="table-due-date-editor"
                    style={{
                      fontSize: '14px',
                      color: '#4A4A4A',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingTableData({ rowIndex, field: 'dueDate' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {row.dueDate}
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div style={{
                fontSize: '14px',
                color: '#4A4A4A',
              }}>
                {isEditable && editingTableData?.rowIndex === rowIndex && editingTableData?.field === 'assignee' ? (
                  <ImprovedInlineEditor
                    initialValue={row.assignee}
                    onSave={(value) => handleTableDataSave(rowIndex, 'assignee', value)}
                    onCancel={() => setEditingTableData(null)}
                    className="table-assignee-editor"
                    style={{
                      fontSize: '14px',
                      color: '#4A4A4A',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingTableData({ rowIndex, field: 'assignee' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {row.assignee}
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
          {currentCompanyLogoPath ? (
            // Show uploaded logo image
            <ClickableImagePlaceholder
              imagePath={currentCompanyLogoPath}
              onImageUploaded={handleCompanyLogoUploaded}
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
            // Show default logo design with clickable area
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            >
              <div style={{
                width: '30px',
                height: '30px',
                border: `2px solid #888888`,
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#888888',
                  position: 'absolute'
                }} />
                <div style={{
                  width: '2px',
                  height: '12px',
                  backgroundColor: '#888888',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: '300', color: '#888888' }}>Your Logo</div>
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

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default EnterpriseRoadmapSlideTemplate;