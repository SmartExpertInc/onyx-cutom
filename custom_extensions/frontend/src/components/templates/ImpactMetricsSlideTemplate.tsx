// custom_extensions/frontend/src/components/templates/ImpactMetricsSlideTemplate.tsx

import React, { useState } from 'react';
import { ImpactMetricsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const ImpactMetricsSlideTemplate: React.FC<ImpactMetricsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  companyName = 'Logo',
  companyLogoPath = '',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  metrics = [
    '300% increase in online visibility',
    '$5 for every $1 spent average ROI',
    '95% increase in customer loyalty'
  ],
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<number | null>(null);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentMetrics, setCurrentMetrics] = useState(metrics);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '650px',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ companyName, companyLogoPath, profileImagePath, profileImageAlt, metrics, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleMetricSave = (index: number, newMetric: string) => {
    const newMetrics = [...currentMetrics];
    newMetrics[index] = newMetric;
    setCurrentMetrics(newMetrics);
    setEditingMetrics(null);
    if (onUpdate) {
      onUpdate({ ...{ companyName, companyLogoPath, profileImagePath, profileImageAlt, metrics, backgroundColor, titleColor, contentColor, accentColor }, metrics: newMetrics });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ companyName, companyLogoPath, profileImagePath, profileImageAlt, metrics, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ companyName, companyLogoPath, profileImagePath, profileImageAlt, metrics, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="impact-metrics-slide-template" style={slideStyles}>
             {/* Left column - Dark teal background with metrics */}
       <div style={{
         flex: '2',
         backgroundColor: themeAccent, // Use theme accent color
         padding: '60px 50px',
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'center',
         position: 'relative'
       }}>
                 {/* Company logo */}
         <div style={{
           position: 'absolute',
           top: '40px',
           left: '50px',
           display: 'flex',
           alignItems: 'center',
           gap: '10px'
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
                 width: '20px',
                 height: '20px',
                 border: `2px solid ${themeBg}`,
                 borderRadius: '50%',
                 position: 'relative',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}>
                 <div style={{
                   width: '8px',
                   height: '2px',
                   backgroundColor: themeBg,
                   position: 'absolute'
                 }} />
               </div>
               <span style={{ fontSize: '14px', fontWeight: '300', color: themeBg }}>{currentCompanyName}</span>
             </div>
           )}
         </div>

        {/* Metrics list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          marginTop: '40px'
        }}>
          {currentMetrics.map((metric, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                fontSize: '28px',
                color: '#ffffff',
                lineHeight: '1.3'
              }}
            >
              {/* Up arrow icon */}
              <div style={{
                fontSize: '32px',
                color: '#ffffff',
                fontWeight: 'bold'
              }}>
                ↗
              </div>
              
              {/* Metric text */}
              <div style={{
                flex: '1'
              }}>
                {isEditable && editingMetrics === index ? (
                  <ImprovedInlineEditor
                    initialValue={metric}
                    onSave={(value) => handleMetricSave(index, value)}
                    onCancel={() => setEditingMetrics(null)}
                    multiline={true}
                    className="metric-editor"
                    style={{
                      fontSize: '28px',
                      color: '#ffffff',
                      lineHeight: '1.3',
                      width: '100%'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingMetrics(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {metric}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

             {/* Right column - Orange background with profile image */}
       <div style={{
         flex: '1',
         backgroundColor: themeTitle, // Use theme title color
         position: 'relative',
         borderTopRightRadius: '20px',
         borderBottomRightRadius: '20px'
       }}>
        {/* Profile image */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '280px',
          height: '350px',
          borderRadius: '15px',
          overflow: 'hidden'
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
              borderRadius: '15px',
              objectFit: 'cover'
            }}
          />
        </div>
             </div>
     </div>

     {/* Logo Upload Modal */}
     {showLogoUploadModal && (
       <PresentationImageUpload
         isOpen={showLogoUploadModal}
         onClose={() => setShowLogoUploadModal(false)}
         onImageUploaded={(newLogoPath) => {
           handleCompanyLogoUploaded(newLogoPath);
           setShowLogoUploadModal(false);
         }}
         title="Upload Company Logo"
       />
     )}
   );
 };

export default ImpactMetricsSlideTemplate; 