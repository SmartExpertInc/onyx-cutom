// custom_extensions/frontend/src/components/ProductViewHeader.tsx
"use client";

import React from 'react';
import { ProjectInstanceDetail, TrainingPlanData } from '@/types/projectSpecificTypes';
import ScormDownloadButton from '@/components/ScormDownloadButton';
import { ToastProvider } from '@/components/ui/toast';
import { UserDropdown } from '@/components/UserDropdown';
import { useLanguage } from '@/contexts/LanguageContext';
// All icons are now custom SVGs

interface ProductViewHeaderProps {
  projectData: ProjectInstanceDetail | null;
  editableData: TrainingPlanData | null;
  productId: string | undefined;
  showSmartEditor: boolean;
  setShowSmartEditor: (show: boolean) => void;
  scormEnabled: boolean;
  componentName: string;
  allowedComponentNames?: string[];
  onPdfExport?: () => void;
  // Video Editor Tools (optional - only for Projects2ViewPage)
  showVideoEditorTools?: boolean;
  activeSettingsPanel?: string | null;
  onSettingsButtonClick?: (settingsType: string, event?: React.MouseEvent<HTMLButtonElement>) => void;
  onShapesButtonClick?: (position: { x: number; y: number }) => void;
  onTextButtonClick?: (position: { x: number; y: number }) => void;
  onAvatarButtonClick?: (position: { x: number; y: number }) => void;
  onLanguageVariantModalOpen?: () => void;
  hideAiImproveButton?: boolean;
  // Popup states for active button styling
  isMediaPopupOpen?: boolean;
  isTextPopupOpen?: boolean;
  isShapesPopupOpen?: boolean;
  isAvatarPopupOpen?: boolean;
  // Video Editor Actions (optional - only for Projects2ViewPage)
  showVideoEditorActions?: boolean;
  aspectRatio?: string;
  onAspectRatioChange?: (ratio: string) => void;
  onPreviewClick?: () => void;
  onDebugClick?: () => void;
  onGenerateClick?: () => void;
}

export const ProductViewHeader: React.FC<ProductViewHeaderProps> = ({
  projectData,
  editableData,
  productId,
  showSmartEditor,
  setShowSmartEditor,
  scormEnabled,
  componentName,
  allowedComponentNames,
  onPdfExport,
  showVideoEditorTools = false,
  activeSettingsPanel = null,
  onSettingsButtonClick,
  onShapesButtonClick,
  onTextButtonClick,
  onAvatarButtonClick,
  onLanguageVariantModalOpen,
  hideAiImproveButton = false,
  isMediaPopupOpen = false,
  isTextPopupOpen = false,
  isShapesPopupOpen = false,
  isAvatarPopupOpen = false,
  showVideoEditorActions = false,
  aspectRatio,
  onAspectRatioChange,
  onPreviewClick,
  onDebugClick,
  onGenerateClick
}) => {
  const { t } = useLanguage();
  const [isResizePopupOpen, setIsResizePopupOpen] = React.useState(false);
  const resizeButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Close resize popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isResizePopupOpen) {
        const isClickInButton = resizeButtonRef.current?.contains(event.target as Node);
        const resizePopupElement = document.querySelector('[data-resize-popup]');
        const isClickInPopup = resizePopupElement?.contains(event.target as Node);
        
        if (!isClickInButton && !isClickInPopup) {
          setIsResizePopupOpen(false);
        }
      }
    };

    if (isResizePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResizePopupOpen]);

  const handleResizeClick = () => {
    setIsResizePopupOpen(!isResizePopupOpen);
  };

  const handleResizeOptionClick = (ratio: string) => {
    if (ratio !== 'Custom' && onAspectRatioChange) {
      onAspectRatioChange(ratio);
    }
    setIsResizePopupOpen(false);
  };

  const resizeOptions = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "16:9",
      description: t('videoEditor.aspectRatio.desktop', 'Desktop video, Youtube')
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="5" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "9:16",
      description: t('videoEditor.aspectRatio.story', 'Instagram story')
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      ratio: "1:1",
      description: t('videoEditor.aspectRatio.square', 'Square, instagram post')
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-gray-500">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none"/>
        </svg>
      ),
      ratio: "Custom",
      description: t('videoEditor.aspectRatio.custom', 'set a custom size')
    }
  ];
  
  // Check if current component should show AI Improve and Export buttons
  const shouldShowButtons = projectData && productId && (
    allowedComponentNames 
      ? allowedComponentNames.includes(projectData.component_name)
      : projectData.component_name === componentName
  );

  // Check if current component is a slide deck (presentation) to show Export button
  const isSlideDeck = projectData?.component_name === 'SlideDeckDisplay';

  return (
    <header className="sticky top-0 z-50 h-16 bg-white flex flex-row justify-between items-center gap-4 py-[14px]" style={{ borderBottom: '1px solid #E4E4E7' }}>
      <div className="max-w-10xl mx-auto w-full flex flex-row justify-between items-center gap-4 px-[14px]">
        <div className="flex items-center gap-x-4">
          <button
            onClick={() => { if (typeof window !== 'undefined') window.location.href = '/projects'; }}
            className="flex items-center justify-center bg-white rounded-md h-9 px-3 transition-all duration-200 hover:shadow-lg cursor-pointer"
            style={{
              border: '1px solid #E4E4E7'
            }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6963 11.831L10.5205 10.4425C10.7998 9.65925 10.7368 8.78439 10.3321 8.04194L12.1168 6.47327C13.0972 7.07503 14.4037 6.95757 15.256 6.11902C16.248 5.143 16.248 3.56044 15.256 2.58438C14.2639 1.60832 12.6553 1.60832 11.6633 2.58438C10.8818 3.35329 10.7164 4.4981 11.1659 5.42681L9.38103 6.99572C8.52665 6.41397 7.43676 6.31227 6.50015 6.69182L4.44195 3.90514C5.18026 2.95143 5.10743 1.58407 4.22185 0.712658C3.25607 -0.237553 1.69021 -0.237553 0.724374 0.712658C-0.241458 1.66292 -0.241458 3.20358 0.724374 4.15379C1.41786 4.8361 2.42044 5.02835 3.28829 4.73105L5.34675 7.51798C4.33025 8.69104 4.38442 10.4545 5.5115 11.5633C5.53315 11.5846 5.55541 11.6046 5.57772 11.6252L3.58345 15.0689C2.75458 14.8761 1.84648 15.0971 1.20005 15.7332C0.207993 16.7093 0.207993 18.292 1.20005 19.268C2.1921 20.244 3.80065 20.244 4.79266 19.268C5.77434 18.3022 5.78405 16.7428 4.82279 15.7645L6.81691 12.3211C7.81832 12.604 8.93798 12.37 9.74277 11.6194L11.9207 13.0089C11.7816 13.6442 11.9624 14.3339 12.4642 14.8276C13.2504 15.601 14.5247 15.601 15.3107 14.8276C16.0968 14.0542 16.0968 12.8004 15.3107 12.027C14.598 11.326 13.4839 11.2606 12.6963 11.831ZM2.06068 16.9455C2.01235 16.9994 1.96687 17.0503 1.92225 17.0941C1.86665 17.1488 1.79068 17.2154 1.69641 17.244C1.57799 17.28 1.45699 17.2483 1.36425 17.1571C1.12173 16.9185 1.21448 16.4671 1.58003 16.1076C1.94568 15.7479 2.40428 15.6566 2.64689 15.8953C2.73958 15.9864 2.77175 16.1055 2.73516 16.2221C2.70609 16.3148 2.6384 16.3898 2.58286 16.4443C2.53824 16.4881 2.4865 16.5328 2.43167 16.5804C2.3684 16.6352 2.30284 16.6918 2.2383 16.7552C2.17381 16.8187 2.11633 16.8832 2.06068 16.9455ZM12.0433 2.95853C12.4088 2.59888 12.8675 2.50753 13.11 2.74618C13.2027 2.83733 13.235 2.95643 13.1983 3.07303C13.1692 3.16583 13.1015 3.24073 13.046 3.29534C13.0015 3.33909 12.9498 3.38384 12.8949 3.43134C12.8315 3.48619 12.7661 3.54279 12.7015 3.60624C12.6369 3.66979 12.5794 3.73434 12.5236 3.79664C12.4755 3.85044 12.4298 3.90149 12.3854 3.94529C12.3299 3.99994 12.2537 4.06654 12.1595 4.09519C12.0409 4.13114 11.92 4.09949 11.8273 4.00824C11.5849 3.76959 11.6777 3.31814 12.0433 2.95853ZM1.56229 1.89272C1.51513 1.94522 1.47087 1.99482 1.42772 2.03747C1.3737 2.09062 1.2996 2.15537 1.20772 2.18342C1.09241 2.21832 0.974611 2.18757 0.884304 2.09887C0.648195 1.86652 0.738654 1.42707 1.0946 1.07696C1.45049 0.726758 1.89694 0.637857 2.13315 0.870209C2.22341 0.95901 2.25486 1.07496 2.21914 1.18836C2.19063 1.27871 2.12492 1.35161 2.07085 1.40466C2.02745 1.44737 1.97703 1.49102 1.92367 1.53707C1.86203 1.59037 1.7982 1.64557 1.73543 1.70737C1.67257 1.76922 1.61641 1.83212 1.56229 1.89272ZM5.96558 7.78808C6.40227 7.35838 6.95001 7.24938 7.23979 7.53443C7.35057 7.64348 7.38904 7.78563 7.34539 7.92493C7.31042 8.03584 7.22967 8.12519 7.1633 8.19054C7.11009 8.24289 7.04819 8.29614 6.98274 8.35294C6.90722 8.41849 6.82896 8.48604 6.75181 8.56189C6.67467 8.63784 6.60596 8.71479 6.53949 8.78924C6.48176 8.85359 6.42743 8.91449 6.37427 8.96674C6.3079 9.03224 6.21709 9.11155 6.10437 9.14585C5.96289 9.1888 5.81835 9.15105 5.70741 9.042C5.41784 8.75669 5.52888 8.21779 5.96558 7.78808ZM13.0368 13.1053C12.9927 13.1486 12.9323 13.2014 12.8577 13.2241C12.7639 13.2525 12.6682 13.2275 12.5946 13.1552C12.4023 12.9662 12.4758 12.6086 12.7656 12.3236C13.0551 12.0386 13.4186 11.9663 13.6108 12.1555C13.6841 12.2276 13.7097 12.322 13.6807 12.4144C13.6577 12.488 13.604 12.5472 13.56 12.5905C13.5248 12.6251 13.4838 12.6606 13.4404 12.6982C13.3904 12.7415 13.3383 12.7865 13.2872 12.8368C13.2361 12.8871 13.1903 12.9381 13.1464 12.9876C13.1081 13.0303 13.072 13.0706 13.0368 13.1053Z" fill="#0F58F9"/>
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-[#191D30] font-semibold text-[16px] leading-none">
              {(() => {
                const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
                return trainingPlanData?.mainTitle || projectData?.name || t('interface.viewNew.courseOutline', 'Course Outline');
              })()}
            </h1>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.7334 12.4172H2.91667C1.58415 12.4172 0.5 11.3331 0.5 10.0006C0.5 8.74958 1.4375 7.71589 2.68066 7.59609C2.75163 7.58926 2.81624 7.55247 2.8584 7.49502C2.90039 7.43757 2.91601 7.36497 2.9012 7.29531C2.59001 5.83031 3.37565 4.36286 4.77018 3.80573C6.13802 3.25316 7.70849 3.75202 8.50293 4.99209C8.56722 5.09268 8.6945 5.13418 8.80599 5.08942C10.023 4.60089 11.4458 5.21647 11.9348 6.42733C12.0541 6.72254 12.5211 6.54387 12.3984 6.2403C11.8352 4.84644 10.2445 4.09585 8.81103 4.55654C7.85726 3.23672 6.11247 2.725 4.58382 3.34186C3.04687 3.95579 2.14599 5.52252 2.36637 7.13629C1 7.39395 0 8.58145 0 10.0006C0 11.6088 1.30843 12.9172 2.91667 12.9172H9.73336C10.0486 12.9172 10.059 12.4172 9.7334 12.4172Z" fill="#71717A"/>
              <path d="M12.2497 7.08398C10.6414 7.08398 9.33301 8.39241 9.33301 10.0007C9.33301 11.6089 10.6414 12.9173 12.2497 12.9173C13.8579 12.9173 15.1663 11.6089 15.1663 10.0007C15.1663 8.39241 13.8579 7.08398 12.2497 7.08398ZM12.2497 12.4173C10.9172 12.4173 9.83301 11.3332 9.83301 10.0007C9.83301 8.66813 10.9172 7.58398 12.2497 7.58398C13.5822 7.58398 14.6663 8.66813 14.6663 10.0007C14.6663 11.3332 13.5822 12.4173 12.2497 12.4173Z" fill="#71717A"/>
              <path d="M13.3661 8.77755C13.4351 8.65802 13.5883 8.61682 13.7079 8.68575C13.8274 8.75476 13.8686 8.90799 13.7997 9.02755L12.2997 11.6252C12.2608 11.6925 12.1922 11.7381 12.1151 11.7483C12.0382 11.7583 11.961 11.7318 11.9061 11.677L10.9061 10.677C10.8087 10.5793 10.8086 10.421 10.9061 10.3234C11.0037 10.2261 11.1621 10.2261 11.2596 10.3234L12.0282 11.092L13.3661 8.77755Z" fill="#71717A"/>
            </svg>

            {/* Divider - Only visible when Resize button is shown */}
            {showVideoEditorActions && (
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
            )}

            {/* Resize Button - Only visible in Projects2ViewPage */}
            {showVideoEditorActions && (
              <div className="relative flex items-center">
                <button
                  ref={resizeButtonRef}
                  onClick={handleResizeClick}
                  className="flex items-center gap-1 hover:bg-gray-100 rounded transition-colors cursor-pointer py-1"
                >
                  {aspectRatio === '16:9' && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#71717A]">
                      <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  )}
                  {aspectRatio === '9:16' && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#71717A]">
                      <rect x="5" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  )}
                  {aspectRatio === '1:1' && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#71717A]">
                      <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  )}
                  {(!aspectRatio || !['16:9', '9:16', '1:1'].includes(aspectRatio)) && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#71717A]">
                      <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  )}
                  <span className="text-xs text-[#71717A]">{aspectRatio || '16:9'}</span>
                </button>

                {/* Resize Popup */}
                {isResizePopupOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 w-56 border" style={{ borderColor: '#E0E0E0' }} data-resize-popup>
                    <div className="py-1">
                      {resizeOptions.map((option, index) => (
                        <button
                          key={index}
                          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors text-left cursor-pointer ${
                            option.ratio === 'Custom' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleResizeOptionClick(option.ratio)}
                          disabled={option.ratio === 'Custom'}
                        >
                          <div>
                            {option.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-black">{option.ratio}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <div className="flex items-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.99967 9.33268L2.66634 5.99935M2.66634 5.99935L5.99967 2.66602M2.66634 5.99935H9.66634C10.6388 5.99935 11.5714 6.38566 12.2591 7.07329C12.9467 7.76092 13.333 8.69356 13.333 9.66602C13.333 10.1475 13.2382 10.6243 13.0539 11.0692C12.8696 11.514 12.5995 11.9183 12.2591 12.2587C11.5714 12.9464 10.6388 13.3327 9.66634 13.3327H7.33301" stroke="#71717A" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0003 9.33268L13.3337 5.99935M13.3337 5.99935L10.0003 2.66602M13.3337 5.99935H6.33366C5.3612 5.99935 4.42857 6.38566 3.74093 7.07329C3.0533 7.76092 2.66699 8.69356 2.66699 9.66602C2.66699 10.1475 2.76183 10.6243 2.9461 11.0692C3.13037 11.514 3.40045 11.9183 3.74093 12.2587C4.42857 12.9464 5.3612 13.3327 6.33366 13.3327H8.66699" stroke="#E0E0E0" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Video Editor Tools - Only visible in Projects2ViewPage */}
        {showVideoEditorTools && (
          <div className="flex items-center gap-1">
            {/* Avatar Button */}
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupWidth = 880;
                const centerX = rect.left + (rect.width / 2) - (popupWidth / 2);
                onAvatarButtonClick?.({ x: centerX, y: 70 });
              }}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-colors cursor-pointer text-[#09090B] ${
                isAvatarPopupOpen 
                  ? 'border shadow-sm rounded-sm' 
                  : 'hover:bg-gray-50'
              }`}
              style={isAvatarPopupOpen ? { borderColor: '#E0E0E0' } : {}}
            >
              <svg width="18" height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 21C19.5 19.4087 18.8679 17.8826 17.7426 16.7574C16.6174 15.6321 15.0913 15 13.5 15M13.5 15C11.9087 15 10.3826 15.6321 9.25736 16.7574C8.13214 17.8826 7.5 19.4087 7.5 21M13.5 15C15.7091 15 17.5 13.2091 17.5 11C17.5 8.79086 15.7091 7 13.5 7C11.2909 7 9.5 8.79086 9.5 11C9.5 13.2091 11.2909 15 13.5 15ZM23.5 13C23.5 18.5228 19.0228 23 13.5 23C7.97715 23 3.5 18.5228 3.5 13C3.5 7.47715 7.97715 3 13.5 3C19.0228 3 23.5 7.47715 23.5 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] mt-0.5 text-[#71717A]">{t('videoEditor.tools.avatar', 'Avatar')}</span>
            </button>

            {/* Shape Button */}
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupWidth = 380;
                const centerX = rect.left + (rect.width / 2) - (popupWidth / 2);
                onShapesButtonClick?.({ x: centerX, y: 70 });
              }}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-colors cursor-pointer text-[#09090B] ${
                isShapesPopupOpen 
                  ? 'border shadow-sm rounded-sm' 
                  : 'hover:bg-gray-50'
              }`}
              style={isShapesPopupOpen ? { borderColor: '#E0E0E0' } : {}}
            >
              <svg width="18" height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.38889 11.178C9.24566 11.1858 9.10305 11.1538 8.97684 11.0856C8.85063 11.0175 8.74573 10.9157 8.67375 10.7916C8.60176 10.6676 8.56549 10.526 8.56895 10.3826C8.57241 10.2392 8.61545 10.0995 8.69333 9.97906L12.8333 3.40017C12.8984 3.28303 12.9926 3.18468 13.1068 3.11465C13.2211 3.04463 13.3515 3.00531 13.4854 3.0005C13.6193 2.99569 13.7522 3.02557 13.8712 3.08722C13.9901 3.14887 14.0912 3.24022 14.1644 3.3524L18.2778 9.95573C18.3589 10.0722 18.4065 10.2086 18.4157 10.3502C18.4248 10.4917 18.395 10.6331 18.3296 10.759C18.2641 10.8849 18.1655 10.9905 18.0443 11.0643C17.9231 11.1382 17.7841 11.1775 17.6422 11.178H9.38889Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.1667 15.6224H4.61111C3.99746 15.6224 3.5 16.1199 3.5 16.7335V22.2891C3.5 22.9027 3.99746 23.4002 4.61111 23.4002H10.1667C10.7803 23.4002 11.2778 22.9027 11.2778 22.2891V16.7335C11.2778 16.1199 10.7803 15.6224 10.1667 15.6224Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.6111 23.4002C21.7589 23.4002 23.5 21.6591 23.5 19.5113C23.5 17.3635 21.7589 15.6224 19.6111 15.6224C17.4633 15.6224 15.7222 17.3635 15.7222 19.5113C15.7222 21.6591 17.4633 23.4002 19.6111 23.4002Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] mt-0.5 text-[#71717A]">{t('videoEditor.tools.shape', 'Shape')}</span>
            </button>

            {/* Text Button */}
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupWidth = 200;
                const centerX = rect.left + (rect.width / 2) - (popupWidth / 2);
                onTextButtonClick?.({ x: centerX, y: 70 });
              }}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-colors cursor-pointer text-[#09090B] ${
                isTextPopupOpen 
                  ? 'border shadow-sm rounded-sm' 
                  : 'hover:bg-gray-50'
              }`}
              style={isTextPopupOpen ? { borderColor: '#E0E0E0' } : {}}
            >
              <svg width="18" height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.24219 23C8.24219 23.41 7.90219 23.75 7.49219 23.75H6.49219C4.42219 23.75 2.74219 22.07 2.74219 20V19C2.74219 18.59 3.08219 18.25 3.49219 18.25C3.90219 18.25 4.24219 18.59 4.24219 19V20C4.24219 21.24 5.25219 22.25 6.49219 22.25H7.49219C7.90219 22.25 8.24219 22.59 8.24219 23ZM20.4922 2.25H19.4922C19.0822 2.25 18.7422 2.59 18.7422 3C18.7422 3.41 19.0822 3.75 19.4922 3.75H20.4922C21.7322 3.75 22.7422 4.76 22.7422 6V7C22.7422 7.41 23.0822 7.75 23.4922 7.75C23.9022 7.75 24.2422 7.41 24.2422 7V6C24.2422 3.93 22.5622 2.25 20.4922 2.25ZM3.49219 7.75C3.90219 7.75 4.24219 7.41 4.24219 7V6C4.24219 4.76 5.25219 3.75 6.49219 3.75H7.49219C7.90219 3.75 8.24219 3.41 8.24219 3C8.24219 2.59 7.90219 2.25 7.49219 2.25H6.49219C4.42219 2.25 2.74219 3.93 2.74219 6V7C2.74219 7.41 3.08219 7.75 3.49219 7.75ZM23.4922 18.25C23.0822 18.25 22.7422 18.59 22.7422 19V20C22.7422 21.24 21.7322 22.25 20.4922 22.25H19.4922C19.0822 22.25 18.7422 22.59 18.7422 23C18.7422 23.41 19.0822 23.75 19.4922 23.75H20.4922C22.5622 23.75 24.2422 22.07 24.2422 20V19C24.2422 18.59 23.9022 18.25 23.4922 18.25ZM18.7422 9C18.7422 9.41 19.0822 9.75 19.4922 9.75C19.9022 9.75 20.2422 9.41 20.2422 9V8C20.2422 7.04 19.4522 6.25 18.4922 6.25H8.49219C7.53219 6.25 6.74219 7.04 6.74219 8V9C6.74219 9.41 7.08219 9.75 7.49219 9.75C7.90219 9.75 8.24219 9.41 8.24219 9V8C8.24219 7.86 8.35219 7.75 8.49219 7.75H12.7422V19.25H10.4922C10.0822 19.25 9.74219 19.59 9.74219 20C9.74219 20.41 10.0822 20.75 10.4922 20.75H16.4922C16.9022 20.75 17.2422 20.41 17.2422 20C17.2422 19.59 16.9022 19.25 16.4922 19.25H14.2422V7.75H18.4922C18.6322 7.75 18.7422 7.86 18.7422 8V9Z" fill="#171718"/>
              </svg>
              <span className="text-[10px] mt-0.5 text-[#71717A]">{t('videoEditor.tools.text', 'Text')}</span>
            </button>

            {/* Media Button */}
            <button
              onClick={(e) => onSettingsButtonClick?.('media', e)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-colors cursor-pointer text-[#09090B] ${
                isMediaPopupOpen 
                  ? 'border shadow-sm rounded-sm' 
                  : 'hover:bg-gray-50'
              }`}
              style={isMediaPopupOpen ? { borderColor: '#E0E0E0' } : {}}
            >
              <svg width="18" height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.1848 13.8249V20.7023C21.1848 21.2235 20.9778 21.7233 20.6093 22.0918C20.2408 22.4603 19.741 22.6673 19.2198 22.6673H5.46498C4.94384 22.6673 4.44403 22.4603 4.07553 22.0918C3.70702 21.7233 3.5 21.2235 3.5 20.7023V6.94747C3.5 6.42633 3.70702 5.92653 4.07553 5.55802C4.44403 5.18951 4.94384 4.98249 5.46498 4.98249H12.3424M16.2724 6.94747H22.1673M19.2198 4V9.89494M21.1848 16.7724L18.1529 13.7404C17.7844 13.372 17.2847 13.1651 16.7636 13.1651C16.2426 13.1651 15.7429 13.372 15.3744 13.7404L6.44747 22.6673M11.3599 10.8774C11.3599 11.9627 10.4802 12.8424 9.39494 12.8424C8.30971 12.8424 7.42996 11.9627 7.42996 10.8774C7.42996 9.7922 8.30971 8.91245 9.39494 8.91245C10.4802 8.91245 11.3599 9.7922 11.3599 10.8774Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] mt-0.5 text-[#71717A]">{t('videoEditor.tools.media', 'Media')}</span>
            </button>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {/* AI Improve button for Course Outline and Presentations */}
          {shouldShowButtons && !hideAiImproveButton && (
          <button
              onClick={() => setShowSmartEditor(!showSmartEditor)}
              className="flex items-center gap-2 rounded-md h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
            style={{
                backgroundColor: '#FFFFFF',
              color: '#0F58F9',
              fontSize: '14px',
              fontWeight: '600',
              lineHeight: '140%',
                letterSpacing: '0.05em',
                border: '1px solid #0F58F9'
              }}
              title={t('productViewHeader.aiImprove', 'AI Improve')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.1986 3.99953L9.99843 5.79926M2.79912 3.39963V5.79926M11.1983 8.19888V10.5985M5.79883 1V2.19981M3.99901 4.59944H1.59924M12.3982 9.3987H9.99843M6.39877 1.59991H5.19889M12.7822 1.98385L12.0142 1.21597C11.9467 1.14777 11.8664 1.09363 11.7778 1.05668C11.6893 1.01973 11.5942 1.00071 11.4983 1.00071C11.4023 1.00071 11.3073 1.01973 11.2188 1.05668C11.1302 1.09363 11.0498 1.14777 10.9823 1.21597L1.21527 10.9825C1.14707 11.05 1.09293 11.1303 1.05598 11.2189C1.01903 11.3074 1 11.4024 1 11.4984C1 11.5943 1.01903 11.6893 1.05598 11.7779C1.09293 11.8664 1.14707 11.9468 1.21527 12.0143L1.9832 12.7822C2.05029 12.8511 2.13051 12.9059 2.21912 12.9433C2.30774 12.9807 2.40296 13 2.49915 13C2.59534 13 2.69056 12.9807 2.77918 12.9433C2.86779 12.9059 2.94801 12.8511 3.0151 12.7822L12.7822 3.01569C12.8511 2.94861 12.9059 2.86839 12.9433 2.77978C12.9807 2.69117 13 2.59595 13 2.49977C13 2.40358 12.9807 2.30837 12.9433 2.21976C12.9059 2.13115 12.8511 2.05093 12.7822 1.98385Z" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('productViewHeader.aiImprove', 'AI Improve')}
          </button>
          )}

          {/* Export button for slide deck presentations */}
          {isSlideDeck && (
            <button
              onClick={() => {
                if (onPdfExport) {
                  onPdfExport();
                } else {
                  console.log('PDF export function not provided');
                }
              }}
              className="flex items-center gap-2 rounded-md h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
              style={{
                backgroundColor: '#0F58F9',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em',
                border: '1px solid #0F58F9'
              }}
              title={t('productViewHeader.exportToPdf', 'Export to PDF')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1V9M7 9L4 6M7 9L10 6M2 12V13H12V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('productViewHeader.export', 'Export')}
            </button>
          )}

          {shouldShowButtons && scormEnabled && (
            <ToastProvider>
              <ScormDownloadButton
                courseOutlineId={Number(productId)}
                label={t('productViewHeader.exportScorm', 'Export to SCORM 2004')}
                className="rounded h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none disabled:opacity-60 bg-[#0F58F9] text-white"
                style={{ fontSize: '14px', fontWeight: 600, lineHeight: '140%', letterSpacing: '0.05em' }}
              />
            </ToastProvider>
          )}

          {/* Video Editor Actions - Only visible in Projects2ViewPage */}
          {showVideoEditorActions && (
            <>
              {/* Preview Button */}
              <button
                onClick={onPreviewClick}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border border-[#E4E4E7] h-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-700">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span className="text-black text-sm font-normal">{t('videoEditor.actions.preview', 'Preview')}</span>
              </button>

              {/* Debug Button */}
              <button
                onClick={onDebugClick}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border border-[#E4E4E7] h-8"
                title={t('videoEditor.actions.debugTooltip', 'Render slides with transitions only (no avatar) - for testing and debugging')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-700">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <line x1="2" y1="7" x2="7" y2="7"></line>
                  <line x1="2" y1="17" x2="7" y2="17"></line>
                  <line x1="17" y1="17" x2="22" y2="17"></line>
                  <line x1="17" y1="7" x2="22" y2="7"></line>
                </svg>
                <span className="text-black text-sm font-normal">{t('videoEditor.actions.debug', 'Debug')}</span>
              </button>

              {/* Generate Button */}
              <button
                onClick={onGenerateClick}
                className="bg-[#0F58F9] text-white hover:bg-[#0D4CD4] rounded-md px-3 py-1.5 flex items-center gap-2 h-8 border border-[#0F58F9] cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5423 11.8593C11.1071 12.0258 10.8704 12.2637 10.702 12.6981C10.5353 12.2637 10.297 12.0274 9.86183 11.8593C10.297 11.6928 10.5337 11.4565 10.702 11.0204C10.8688 11.4549 11.1071 11.6912 11.5423 11.8593ZM10.7628 5.05818C11.1399 3.656 11.6552 3.14044 13.0612 2.76346C11.6568 2.387 11.1404 1.87251 10.7628 0.46875C10.3858 1.87093 9.87044 2.38649 8.46442 2.76346C9.86886 3.13993 10.3852 3.65442 10.7628 5.05818ZM11.1732 7.95231C11.1732 7.8202 11.1044 7.6607 10.9118 7.607C9.33637 7.16717 8.34932 6.66503 7.61233 5.92985C6.8754 5.19411 6.37139 4.20858 5.93249 2.63565C5.8787 2.44339 5.71894 2.37465 5.58662 2.37465C5.4543 2.37465 5.29454 2.44339 5.24076 2.63565C4.80022 4.20858 4.29727 5.19405 3.56092 5.92985C2.82291 6.66668 1.83688 7.1688 0.261415 7.607C0.0688515 7.6607 0 7.82021 0 7.95231C0 8.08442 0.0688515 8.24393 0.261415 8.29763C1.83688 8.73746 2.82393 9.2396 3.56092 9.97477C4.29892 10.7116 4.80186 11.696 5.24076 13.269C5.29455 13.4612 5.45431 13.53 5.58662 13.53C5.71895 13.53 5.87871 13.4612 5.93249 13.269C6.37303 11.696 6.87598 10.7106 7.61233 9.97477C8.35034 9.23795 9.33637 8.73582 10.9118 8.29763C11.1044 8.24392 11.1732 8.08442 11.1732 7.95231Z" fill="white"/>
                </svg>
                <span className="text-sm font-normal">{t('videoEditor.actions.generate', 'Generate')}</span>
              </button>
            </>
          )}

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

