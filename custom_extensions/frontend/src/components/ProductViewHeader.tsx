// custom_extensions/frontend/src/components/ProductViewHeader.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ProjectInstanceDetail, TrainingPlanData, TextPresentationData } from '@/types/projectSpecificTypes';
import ScormDownloadButton from '@/components/ScormDownloadButton';
import { ToastProvider } from '@/components/ui/toast';
import { UserDropdown } from '@/components/UserDropdown';

interface ProductViewHeaderProps {
  projectData: ProjectInstanceDetail | null;
  editableData: TrainingPlanData | TextPresentationData | null;
  productId: string | undefined;
  showAiAgent?: boolean;
  setShowAiAgent?: (show: boolean) => void;
  scormEnabled: boolean;
  componentName: string;
  allowedComponentNames?: string[];
  t: (key: string, fallback: string) => string;
  onPdfExport?: () => void;
  onExportClick?: () => void;
  onDraftClick?: () => void;
  onCopyLink?: () => void;
  isEditing?: boolean;
  onEditOrSave?: () => void;
  isAuthorized?: boolean;
  setIsAuthorized?: (isAuthorized: boolean) => void;
  hideCloudAndArrowIndicators?: boolean;
  enableLinkViewButtons?: boolean;
  hideAspectRatioBadge?: boolean;
  createdAt?: string | Date | null;
  exportOptions?: Array<{ key: string; label: string; icon: React.ReactNode; onSelect?: () => void }>;
}

export const ProductViewHeader: React.FC<ProductViewHeaderProps> = ({
  projectData,
  editableData,
  productId,
  showAiAgent,
  setShowAiAgent,
  scormEnabled,
  componentName,
  allowedComponentNames,
  t,
  onPdfExport,
  onExportClick,
  onDraftClick,
  onCopyLink,
  isEditing,
  onEditOrSave,
  isAuthorized = true,
  setIsAuthorized,
  hideCloudAndArrowIndicators = false,
  enableLinkViewButtons = false,
  hideAspectRatioBadge = false,
  createdAt = null,
  exportOptions
}) => {

  const [localIsAuthorized, setLocalIsAuthorized] = useState(isAuthorized);

  useEffect(() => {
    if (!setIsAuthorized) {
      setLocalIsAuthorized(isAuthorized);
    }
  }, [isAuthorized, setIsAuthorized]);

  const [viewportWidth, setViewportWidth] = useState<number | null>(() => (typeof window === 'undefined' ? null : window.innerWidth));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentIsAuthorized = setIsAuthorized ? isAuthorized : localIsAuthorized;

  const handleAuthToggle = (value: boolean) => {
    if (value === currentIsAuthorized) return;
    if (setIsAuthorized) {
      setIsAuthorized(value);
    } else {
      setLocalIsAuthorized(value);
    }
  };

  // Check if current component should show AI Improve and Export buttons
  const shouldShowButtons = projectData && productId && (
    allowedComponentNames 
      ? allowedComponentNames.includes(projectData.component_name)
      : projectData.component_name === componentName
  );

  // Check if current component is a slide deck (presentation) to show Export button
  const isSlideDeck = projectData?.component_name === 'SlideDeckDisplay';
  
  // Check if current component is a quiz to show Export button
  const isQuiz = projectData?.component_name === 'QuizDisplay';
  const isOnePager = projectData?.component_name === 'TextPresentationDisplay';
  const shouldShowAuthToggle = !(isOnePager || isQuiz);
  const isVideoLesson = projectData?.component_name === 'VideoLessonDisplay' || 
                        projectData?.component_name === 'VideoLessonPresentationDisplay';
  const isCourse = projectData?.component_name === 'TrainingPlanTable';
  const isPresentation = projectData?.component_name === 'SlideDeckDisplay' || projectData?.component_name === 'VideoProductDisplay';
  const isVideoProduct = projectData?.component_name === 'VideoProductDisplay';
  const shouldShowLinkButtons = enableLinkViewButtons && (isCourse || isPresentation || isVideoProduct || isQuiz);
  const isQuizLinkView = shouldShowLinkButtons && isQuiz;
  const isMobileMidViewport = viewportWidth !== null && viewportWidth >= 390 && viewportWidth < 640;
  const isMobileViewport = viewportWidth !== null && viewportWidth < 640;
  const useMobileLinkViewLayout = isMobileMidViewport && enableLinkViewButtons && shouldShowLinkButtons;

  const getOrdinalSuffix = (day: number) => {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const formattedCreatedAt = useMemo(() => {
    if (!createdAt) return null;
    const dateObj = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
  }, [createdAt]);

  // Debug logging for PDF export
  console.log('🔍 ProductViewHeader Debug:', {
    componentName: projectData?.component_name,
    isOnePager,
    isQuiz,
    isSlideDeck,
    onPdfExport: !!onPdfExport
  });

  const handleDraft = () => {
    if (onDraftClick) {
      onDraftClick();
      return;
    }
    if (onEditOrSave) {
      onEditOrSave();
    }
  };

  const handleExport = () => {
    if (exportOptions && exportOptions.length > 0) {
      setShowExportMenu(prev => !prev);
      return;
    }
    if (onExportClick) {
      onExportClick();
    } else if (onPdfExport) {
      onPdfExport();
    } else {
      console.warn('Export action not provided');
    }
  };

  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink();
      return;
    }
    if (typeof window !== 'undefined') {
      const linkToCopy = window.location.href;
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(linkToCopy).catch((err) => {
          console.error('Failed to copy link:', err);
        });
      } else {
        console.warn('Clipboard API not available');
      }
    }
  };

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showExportMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node) &&
          exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const handleExportOptionSelect = (onSelect?: () => void) => {
    if (onSelect) {
      onSelect();
    }
    setShowExportMenu(false);
  };

  const canShowAiImproveButton = Boolean(
    projectData &&
    projectData.component_name === componentName &&
    productId &&
    setShowAiAgent &&
    !showAiAgent
  );

  const canShowPdfExportButton = !shouldShowLinkButtons && currentIsAuthorized && (isSlideDeck || isQuiz || isOnePager);
  const canShowScormButton = shouldShowButtons && scormEnabled;
  const canShowDraftButton = shouldShowLinkButtons && currentIsAuthorized && (isPresentation || isVideoProduct);
  const showDraftButton = canShowDraftButton && !useMobileLinkViewLayout;
  const actionButtonFontSize = '14px';
  const actionButtonHeight = useMobileLinkViewLayout ? 44 : 36;
  const actionButtonWidth = useMobileLinkViewLayout ? 138 : undefined;
  const actionButtonPadding = {
    paddingLeft: useMobileLinkViewLayout ? '16px' : '15px',
    paddingRight: useMobileLinkViewLayout ? '16px' : '20px'
  };
  const homeButtonHeight = useMobileLinkViewLayout ? 44 : 36;
  const homeButtonPaddingX = useMobileLinkViewLayout ? 16 : 12;
  const homeIconWidth = useMobileLinkViewLayout ? 26 : 23;
  const homeIconHeight = useMobileLinkViewLayout ? 26 : 28;

  const renderHomeButton = () => (
          <button
            onClick={() => { if (typeof window !== 'undefined') window.location.href = '/projects'; }}
      className="flex items-center justify-center bg-white rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer"
            style={{
              border: '1px solid #E4E4E7',
              height: `${homeButtonHeight}px`,
              paddingLeft: `${homeButtonPaddingX}px`,
              paddingRight: `${homeButtonPaddingX}px`
            }}
          >
            <svg width={homeIconWidth} height={homeIconHeight} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6963 11.831L10.5205 10.4425C10.7998 9.65925 10.7368 8.78439 10.3321 8.04194L12.1168 6.47327C13.0972 7.07503 14.4037 6.95757 15.256 6.11902C16.248 5.143 16.248 3.56044 15.256 2.58438C14.2639 1.60832 12.6553 1.60832 11.6633 2.58438C10.8818 3.35329 10.7164 4.4981 11.1659 5.42681L9.38103 6.99572C8.52665 6.41397 7.43676 6.31227 6.50015 6.69182L4.44195 3.90514C5.18026 2.95143 5.10743 1.58407 4.22185 0.712658C3.25607 -0.237553 1.69021 -0.237553 0.724374 0.712658C-0.241458 1.66292 -0.241458 3.20358 0.724374 4.15379C1.41786 4.8361 2.42044 5.02835 3.28829 4.73105L5.34675 7.51798C4.33025 8.69104 4.38442 10.4545 5.5115 11.5633C5.53315 11.5846 5.55541 11.6046 5.57772 11.6252L3.58345 15.0689C2.75458 14.8761 1.84648 15.0971 1.20005 15.7332C0.207993 16.7093 0.207993 18.292 1.20005 19.268C2.1921 20.244 3.80065 20.244 4.79266 19.268C5.77434 18.3022 5.78405 16.7428 4.82279 15.7645L6.81691 12.3211C7.81832 12.604 8.93798 12.37 9.74277 11.6194L11.9207 13.0089C11.7816 13.6442 11.9624 14.3339 12.4642 14.8276C13.2504 15.601 14.5247 15.601 15.3107 14.8276C16.0968 14.0542 16.0968 12.8004 15.3107 12.027C14.598 11.326 13.4839 11.2606 12.6963 11.831ZM2.06068 16.9455C2.01235 16.9994 1.96687 17.0503 1.92225 17.0941C1.86665 17.1488 1.79068 17.2154 1.69641 17.244C1.57799 17.28 1.45699 17.2483 1.36425 17.1571C1.12173 16.9185 1.21448 16.4671 1.58003 16.1076C1.94568 15.7479 2.40428 15.6566 2.64689 15.8953C2.73958 15.9864 2.77175 16.1055 2.73516 16.2221C2.70609 16.3148 2.6384 16.3898 2.58286 16.4443C2.53824 16.4881 2.4865 16.5328 2.43167 16.5804C2.3684 16.6352 2.30284 16.6918 2.2383 16.7552C2.17381 16.8187 2.11633 16.8832 2.06068 16.9455ZM12.0433 2.95853C12.4088 2.59888 12.8675 2.50753 13.11 2.74618C13.2027 2.83733 13.235 2.95643 13.1983 3.07303C13.1692 3.16583 13.1015 3.24073 13.046 3.29534C13.0015 3.33909 12.9498 3.38384 12.8949 3.43134C12.8315 3.48619 12.7661 3.54279 12.7015 3.60624C12.6369 3.66979 12.5794 3.73434 12.5236 3.79664C12.4755 3.85044 12.4298 3.90149 12.3854 3.94529C12.3299 3.99994 12.2537 4.06654 12.1595 4.09519C12.0409 4.13114 11.92 4.09949 11.8273 4.00824C11.5849 3.76959 11.6777 3.31814 12.0433 2.95853ZM1.56229 1.89272C1.51513 1.94522 1.47087 1.99482 1.42772 2.03747C1.3737 2.09062 1.2996 2.15537 1.20772 2.18342C1.09241 2.21832 0.974611 2.18757 0.884304 2.09887C0.648195 1.86652 0.738654 1.42707 1.0946 1.07696C1.45049 0.726758 1.89694 0.637857 2.13315 0.870209C2.22341 0.95901 2.25486 1.07496 2.21914 1.18836C2.19063 1.27871 2.12492 1.35161 2.07085 1.40466C2.02745 1.44737 1.97703 1.49102 1.92367 1.53707C1.86203 1.59037 1.7982 1.64557 1.73543 1.70737C1.67257 1.76922 1.61641 1.83212 1.56229 1.89272ZM5.96558 7.78808C6.40227 7.35838 6.95001 7.24938 7.23979 7.53443C7.35057 7.64348 7.38904 7.78563 7.34539 7.92493C7.31042 8.03584 7.22967 8.12519 7.1633 8.19054C7.11009 8.24289 7.04819 8.29614 6.98274 8.35294C6.90722 8.41849 6.82896 8.48604 6.75181 8.56189C6.67467 8.63784 6.60596 8.71479 6.53949 8.78924C6.48176 8.85359 6.42743 8.91449 6.37427 8.96674C6.3079 9.03224 6.21709 9.11155 6.10437 9.14585C5.96289 9.1888 5.81835 9.15105 5.70741 9.042C5.41784 8.75669 5.52888 8.21779 5.96558 7.78808ZM13.0368 13.1053C12.9927 13.1486 12.9323 13.2014 12.8577 13.2241C12.7639 13.2525 12.6682 13.2275 12.5946 13.1552C12.4023 12.9662 12.4758 12.6086 12.7656 12.3236C13.0551 12.0386 13.4186 11.9663 13.6108 12.1555C13.6841 12.2276 13.7097 12.322 13.6807 12.4144C13.6577 12.488 13.604 12.5472 13.56 12.5905C13.5248 12.6251 13.4838 12.6606 13.4404 12.6982C13.3904 12.7415 13.3383 12.7865 13.2872 12.8368C13.2361 12.8871 13.1903 12.9381 13.1464 12.9876C13.1081 13.0303 13.072 13.0706 13.0368 13.1053Z" fill="#0F58F9"/>
            </svg>
          </button>
  );
          
  const renderTitleSection = () => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1
                className={`text-[#191D30] text-[16px] line-clamp-1 leading-none ${
                  enableLinkViewButtons ? 'font-medium' : 'font-semibold'
                }`}
              >
                {(() => {
                  const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
                  return trainingPlanData?.mainTitle || projectData?.name || t('interface.viewNew.courseOutline', 'Course Outline');
                })()}
              </h1>
              {!isVideoLesson && !hideCloudAndArrowIndicators && !(isOnePager && isQuiz && isMobileViewport) && !isQuizLinkView && !(isQuiz && isMobileViewport) && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.7334 12.4172H2.91667C1.58415 12.4172 0.5 11.3331 0.5 10.0006C0.5 8.74958 1.4375 7.71589 2.68066 7.59609C2.75163 7.58926 2.81624 7.55247 2.8584 7.49502C2.90039 7.43757 2.91601 7.36497 2.9012 7.29531C2.59001 5.83031 3.37565 4.36286 4.77018 3.80573C6.13802 3.25316 7.70849 3.75202 8.50293 4.99209C8.56722 5.09268 8.6945 5.13418 8.80599 5.08942C10.023 4.60089 11.4458 5.21647 11.9348 6.42733C12.0541 6.72254 12.5211 6.54387 12.3984 6.2403C11.8352 4.84644 10.2445 4.09585 8.81103 4.55654C7.85726 3.23672 6.11247 2.725 4.58382 3.34186C3.04687 3.95579 2.14599 5.52252 2.36637 7.13629C1 7.39395 0 8.58145 0 10.0006C0 11.6088 1.30843 12.9172 2.91667 12.9172H9.73336C10.0486 12.9172 10.059 12.4172 9.7334 12.4172Z" fill="#71717A"/>
                    <path d="M12.2497 7.08398C10.6414 7.08398 9.33301 8.39241 9.33301 10.0007C9.33301 11.6089 10.6414 12.9173 12.2497 12.9173C13.8579 12.9173 15.1663 11.6089 15.1663 10.0007C15.1663 8.39241 13.8579 7.08398 12.2497 7.08398ZM12.2497 12.4173C10.9172 12.4173 9.83301 11.3332 9.83301 10.0007C9.83301 8.66813 10.9172 7.58398 12.2497 7.58398C13.5822 7.58398 14.6663 8.66813 14.6663 10.0007C14.6663 11.3332 13.5822 12.4173 12.2497 12.4173Z" fill="#71717A"/>
                    <path d="M13.3661 8.77755C13.4351 8.65802 13.5883 8.61682 13.7079 8.68575C13.8274 8.75476 13.8686 8.90799 13.7997 9.02755L12.2997 11.6252C12.2608 11.6925 12.1922 11.7381 12.1151 11.7483C12.0382 11.7583 11.961 11.7318 11.9061 11.677L10.9061 10.677C10.8087 10.5793 10.8086 10.421 10.9061 10.3234C11.0037 10.2261 11.1621 10.2261 11.2596 10.3234L12.0282 11.092L13.3661 8.77755Z" fill="#71717A"/>
                  </svg>
                </>
              )}
              {isOnePager && (
                <div className="hidden sm:flex items-center">
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="14" height="14" rx="2" stroke="#4D4D4D"/>
                <mask id="path-2-inside-1_1435_10944" fill="white">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5133 2.5C11.7784 2.5 11.9933 2.7149 11.9933 2.98V7.24667C11.9933 7.51177 11.7784 7.72667 11.5133 7.72667C11.2483 7.72667 11.0333 7.51177 11.0333 7.24667V4.13883L4.13882 11.0333H7.24667C7.51177 11.0333 7.72667 11.2483 7.72667 11.5133C7.72667 11.7784 7.51177 11.9933 7.24667 11.9933H2.98C2.85269 11.9933 2.7306 11.9428 2.64059 11.8528C2.55057 11.7627 2.5 11.6406 2.5 11.5133V7.24667C2.5 6.98157 2.7149 6.76667 2.98 6.76667C3.2451 6.76667 3.46 6.98157 3.46 7.24667V10.3545L10.3545 3.46H7.24667C6.98157 3.46 6.76667 3.2451 6.76667 2.98C6.76667 2.7149 6.98157 2.5 7.24667 2.5H11.5133Z"/>
                </mask>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5133 2.5C11.7784 2.5 11.9933 2.7149 11.9933 2.98V7.24667C11.9933 7.51177 11.7784 7.72667 11.5133 7.72667C11.2483 7.72667 11.0333 7.51177 11.0333 7.24667V4.13883L4.13882 11.0333H7.24667C7.51177 11.0333 7.72667 11.2483 7.72667 11.5133C7.72667 11.7784 7.51177 11.9933 7.24667 11.9933H2.98C2.85269 11.9933 2.7306 11.9428 2.64059 11.8528C2.55057 11.7627 2.5 11.6406 2.5 11.5133V7.24667C2.5 6.98157 2.7149 6.76667 2.98 6.76667C3.2451 6.76667 3.46 6.98157 3.46 7.24667V10.3545L10.3545 3.46H7.24667C6.98157 3.46 6.76667 3.2451 6.76667 2.98C6.76667 2.7149 6.98157 2.5 7.24667 2.5H11.5133Z" fill="#4D4D4D"/>
                <path d="M11.0333 4.13883H12.0333V1.72462L10.3262 3.43172L11.0333 4.13883ZM4.13882 11.0333L3.43171 10.3262L1.72460 12.0333H4.13882V11.0333ZM3.46 10.3545H2.46V12.7687L4.16711 11.0616L3.46 10.3545ZM10.3545 3.46L11.0616 4.16711L12.7687 2.46H10.3545V3.46ZM11.5133 2.5V3.5C11.2262 3.5 10.9933 3.26723 10.9933 2.98H11.9933H12.9933C12.9933 2.16257 12.3307 1.5 11.5133 1.5V2.5ZM11.9933 2.98H10.9933V7.24667H11.9933H12.9933V2.98H11.9933ZM11.9933 7.24667H10.9933C10.9933 6.95944 11.2262 6.72667 11.5133 6.72667V7.72667V8.72667C12.3307 8.72667 12.9933 8.06409 12.9933 7.24667H11.9933ZM11.5133 7.72667V6.72667C11.8005 6.72667 12.0333 6.95944 12.0333 7.24667H11.0333H10.0333C10.0333 8.06409 10.696 8.72667 11.5133 8.72667V7.72667ZM11.0333 7.24667H12.0333V4.13883H11.0333H10.0333V7.24667H11.0333ZM11.0333 4.13883L10.3262 3.43172L3.43171 10.3262L4.13882 11.0333L4.84592 11.7405L11.7405 4.84593L11.0333 4.13883ZM4.13882 11.0333V12.0333H7.24667V11.0333V10.0333H4.13882V11.0333ZM7.24667 11.0333V12.0333C6.95944 12.0333 6.72667 11.8005 6.72667 11.5133H7.72667H8.72667C8.72667 10.696 8.06409 10.0333 7.24667 10.0333V11.0333ZM7.72667 11.5133H6.72667C6.72667 11.2262 6.95944 10.9933 7.24667 10.9933V11.9933V12.9933C8.06409 12.9933 8.72667 12.3307 8.72667 11.5133H7.72667ZM7.24667 11.9933V10.9933H2.98V11.9933V12.9933H7.24667V11.9933ZM2.98 11.9933V10.9933C3.11785 10.9933 3.25015 11.0481 3.34774 11.1457L2.64059 11.8528L1.93344 12.5598C2.21105 12.8375 2.58754 12.9933 2.98 12.9933V11.9933ZM2.64059 11.8528L3.34774 11.1457C3.44524 11.2432 3.5 11.3754 3.5 11.5133H2.5H1.5C1.5 11.9058 1.6559 12.2823 1.93344 12.5598L2.64059 11.8528ZM2.5 11.5133H3.5V7.24667H2.5H1.5V11.5133H2.5ZM2.5 7.24667H3.5C3.5 7.53385 3.26719 7.76667 2.98 7.76667V6.76667V5.76667C2.16262 5.76667 1.5 6.42928 1.5 7.24667H2.5ZM2.98 6.76667V7.76667C2.69281 7.76667 2.46 7.53385 2.46 7.24667H3.46H4.46C4.46 6.42928 3.79738 5.76667 2.98 5.76667V6.76667ZM3.46 7.24667H2.46V10.3545H3.46H4.46V7.24667H3.46ZM3.46 10.3545L4.16711 11.0616L11.0616 4.16711L10.3545 3.46L9.64741 2.75289L2.75289 9.64741L3.46 10.3545ZM10.3545 3.46V2.46H7.24667V3.46V4.46H10.3545V3.46ZM7.24667 3.46V2.46C7.53385 2.46 7.76667 2.69281 7.76667 2.98H6.76667H5.76667C5.76667 3.79738 6.42928 4.46 7.24667 4.46V3.46ZM6.76667 2.98H7.76667C7.76667 3.26719 7.53385 3.5 7.24667 3.5V2.5V1.5C6.42928 1.5 5.76667 2.16262 5.76667 2.98H6.76667ZM7.24667 2.5V3.5H11.5133V2.5V1.5H7.24667V2.5Z" fill="#4D4D4D" mask="url(#path-2-inside-1_1435_10944)"/>
                </svg>
                <span className="text-[#4D4D4D] text-[15px] font-medium">A4</span>
                </div>
          </div>
        )}
              {isSlideDeck && !hideAspectRatioBadge && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="4" width="12" height="8" rx="1" stroke="#71717A" strokeWidth="1.5"/>
                    </svg>
                    <span className="text-[#71717A] text-sm font-medium">16:9</span>
                  </div>
                </>
              )}
              {!isVideoLesson && !hideCloudAndArrowIndicators && !(isOnePager && isQuiz && isMobileViewport) && !isQuizLinkView && !(isQuiz && isMobileViewport) && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex items-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.99967 9.33268L2.66634 5.99935M2.66634 5.99935L5.99967 2.66602M2.66634 5.99935H9.66634C10.6388 5.99935 11.5714 6.38566 12.2591 7.07329C12.9467 7.76092 13.333 8.69356 13.333 9.66602C13.333 10.1475 13.2382 10.6243 13.0539 11.0692C12.8696 11.514 12.5995 11.9183 12.2591 12.2587C11.5714 12.9464 10.6388 13.3327 9.66634 13.3327H7.33301" stroke="#71717A" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.0003 9.33268L13.3337 5.99935M13.3337 5.99935L10.0003 2.66602M13.3337 5.99935H6.33366C5.3612 5.99935 4.42857 6.38566 3.74093 7.07329C3.0533 7.76092 2.66699 8.69356 2.66699 9.66602C2.66699 10.1475 2.76183 10.6243 2.9461 11.0692C3.13037 11.514 3.40045 11.9183 3.74093 12.2587C4.42857 12.9464 5.3612 13.3327 6.33366 13.3327H8.66699" stroke="#E0E0E0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </>
              )}
            </div>
            {((enableLinkViewButtons || isOnePager || isQuiz) && !(isQuiz && !isMobileViewport)) && (
                <div className="flex items-center gap-1.5 text-[10px] text-[#878787]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g clipPath="url(#clip0_4291_33172)">
                      <path d="M10.6 11.8C10.6 10.8452 10.2207 9.92955 9.54559 9.25442C8.87045 8.57929 7.95478 8.2 7 8.2M7 8.2C6.04522 8.2 5.12955 8.57929 4.45442 9.25442C3.77928 9.92955 3.4 10.8452 3.4 11.8M7 8.2C8.32548 8.2 9.4 7.12548 9.4 5.8C9.4 4.47452 8.32548 3.4 7 3.4C5.67452 3.4 4.6 4.47452 4.6 5.8C4.6 7.12548 5.67452 8.2 7 8.2ZM13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_4291_33172">
                        <rect width="14" height="14" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <span>username@app.contentbuilder.ai</span>
                  <span aria-hidden="true">•</span>
                  <span>{formattedCreatedAt ?? 'Unknown date'}</span>
                </div>
            )}
          </div>
  );

  const renderAuthToggle = () => (
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => handleAuthToggle(true)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                currentIsAuthorized 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Auth
            </button>
            <button
              onClick={() => handleAuthToggle(false)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                !currentIsAuthorized 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unauth
            </button>
          </div>
  );

  const renderDraftButton = () => (
    <button
      onClick={handleDraft}
      className="flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#171718',
        border: '1px solid #171718',
        fontSize: actionButtonFontSize,
        lineHeight: '140%',
        letterSpacing: '0.05em',
        height: `${actionButtonHeight}px`,
        width: actionButtonWidth ? `${actionButtonWidth}px` : undefined,
        ...actionButtonPadding
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 11.9142H12.5M9.5 0.914214C9.76522 0.648997 10.1249 0.5 10.5 0.5C10.6857 0.5 10.8696 0.53658 11.0412 0.607651C11.2128 0.678721 11.3687 0.782892 11.5 0.914214C11.6313 1.04554 11.7355 1.20144 11.8066 1.37302C11.8776 1.5446 11.9142 1.7285 11.9142 1.91421C11.9142 2.09993 11.8776 2.28383 11.8066 2.45541C11.7355 2.62699 11.6313 2.78289 11.5 2.91421L3.16667 11.2475L0.5 11.9142L1.16667 9.24755L9.5 0.914214Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Draft
    </button>
  );

  const renderExportControl = () => {
    if (!currentIsAuthorized) return null;

    return (
      <div className="relative">
        <button
          ref={exportButtonRef}
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#0F58F9',
            border: '1px solid #0F58F9',
            fontSize: actionButtonFontSize,
            lineHeight: '140%',
            letterSpacing: '0.05em',
            height: `${actionButtonHeight}px`,
            width: actionButtonWidth ? `${actionButtonWidth}px` : undefined,
            ...actionButtonPadding
          }}
        >
          <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.1429 7.88542V0.402344M4.1429 7.88542L0.935872 4.67839M4.1429 7.88542L7.34994 4.67839M7.88444 10.0234H0.401367" stroke="#0F58F9" strokeWidth="0.801758" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export
        </button>
        {exportOptions && exportOptions.length > 0 && showExportMenu && (
          <div
            ref={exportMenuRef}
            className="absolute left-0 mt-2 w-56 rounded-lg border border-[#0F58F9] bg-white py-1 shadow-xl z-[60]"
          >
            {exportOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleExportOptionSelect(option.onSelect)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#171718] transition-colors hover:bg-[#F2F2F4]"
              >
                {option.icon && <span className="flex h-4 w-4 items-center justify-center">{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCopyLinkButton = () => (
    <button
      onClick={handleCopyLink}
      className="flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
      style={{
        backgroundColor: currentIsAuthorized ? '#0F58F9' : '#FFFFFF',
        color: currentIsAuthorized ? '#FFFFFF' : '#0F58F9',
        border: '1px solid #0F58F9',
        fontSize: actionButtonFontSize,
        lineHeight: '140%',
        letterSpacing: '0.05em',
        height: `${actionButtonHeight}px`,
        width: actionButtonWidth ? `${actionButtonWidth}px` : undefined,
        ...actionButtonPadding
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.29319 7.10401C5.55232 7.45079 5.88293 7.73773 6.26259 7.94537C6.64225 8.153 7.06208 8.27647 7.4936 8.30741C7.92512 8.33834 8.35824 8.27602 8.76358 8.12466C9.16893 7.97331 9.53701 7.73646 9.84287 7.43018L11.6531 5.61814C12.2027 5.04855 12.5068 4.28567 12.4999 3.49382C12.493 2.70197 12.1757 1.9445 11.6163 1.38456C11.057 0.824612 10.3002 0.506995 9.50919 0.500114C8.71813 0.493233 7.95602 0.797639 7.38701 1.34777L6.34915 2.38063M7.70681 5.89599C7.44768 5.54921 7.11707 5.26227 6.73741 5.05463C6.35775 4.847 5.93792 4.72353 5.5064 4.69259C5.07488 4.66166 4.64176 4.72398 4.23642 4.87534C3.83107 5.02669 3.46299 5.26354 3.15713 5.56982L1.34692 7.38186C0.797339 7.95145 0.49324 8.71433 0.500114 9.50618C0.506988 10.298 0.824286 11.0555 1.38367 11.6154C1.94305 12.1754 2.69976 12.493 3.49081 12.4999C4.28187 12.5068 5.04397 12.2024 5.61299 11.6522L6.64482 10.6194" stroke={currentIsAuthorized ? 'white' : '#0F58F9'} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Copy Link
    </button>
  );

  const renderSignUpButton = () => (
    <button
      className="flex items-center justify-center rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
      style={{
        backgroundColor: '#0F58F9',
        color: '#FFFFFF',
        border: '1px solid #0F58F9',
        fontSize: actionButtonFontSize,
        lineHeight: '140%',
        letterSpacing: '0.05em',
        height: `${actionButtonHeight}px`,
        width: actionButtonWidth ? `${actionButtonWidth}px` : undefined,
        ...actionButtonPadding
      }}
    >
      Sign up
    </button>
  );

  const renderAiImproveButton = () => (
    <button
      onClick={() => setShowAiAgent?.(!showAiAgent)}
      className="flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#171718',
        fontSize: actionButtonFontSize,
        lineHeight: '140%',
        letterSpacing: '0.05em',
        border: '1px solid #171718',
        height: `${actionButtonHeight}px`,
        width: actionButtonWidth ? `${actionButtonWidth}px` : undefined,
        ...actionButtonPadding
      }}
      title={t('actions.aiAgent', 'AI Improve')}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.1986 3.99953L9.99843 5.79926M2.79912 3.39963V5.79926M11.1983 8.19888V10.5985M5.79883 1V2.19981M3.99901 4.59944H1.59924M12.3982 9.3987H9.99843M6.39877 1.59991H5.19889M12.7822 1.98385L12.0142 1.21597C11.9467 1.14777 11.8664 1.09363 11.7778 1.05668C11.6893 1.01973 11.5942 1.00071 11.4983 1.00071C11.4023 1.00071 11.3073 1.01973 11.2188 1.05668C11.1302 1.09363 11.0498 1.14777 10.9823 1.21597L1.21527 10.9825C1.14707 11.05 1.09293 11.1303 1.05598 11.2189C1.01903 11.3074 1 11.4024 1 11.4984C1 11.5943 1.01903 11.6893 1.05598 11.7779C1.09293 11.8664 1.14707 11.9468 1.21527 12.0143L1.9832 12.7822C2.05029 12.8511 2.13051 12.9059 2.21912 12.9433C2.30774 12.9807 2.40296 13 2.49915 13C2.59534 13 2.69056 12.9807 2.77918 12.9433C2.86779 12.9059 2.94801 12.8511 3.0151 12.7822L12.7822 3.01569C12.8511 2.94861 12.9059 2.86839 12.9433 2.77978C12.9807 2.69117 13 2.59595 13 2.49977C13 2.40358 12.9807 2.30837 12.9433 2.21976C12.9059 2.13115 12.8511 2.05093 12.7822 1.98385Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {t('actions.aiAgent', 'AI Improve')}
    </button>
  );

  const renderPdfExportButton = () => (
    <button
      onClick={() => {
        console.log('🔍 Export button clicked for:', projectData?.component_name);
        if (onPdfExport) {
          console.log('🔍 Calling onPdfExport function...');
          onPdfExport();
        } else {
          console.error('🔍 PDF export function not provided');
        }
      }}
      className="flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
      style={{
        backgroundColor: '#0F58F9',
        color: '#FFFFFF',
        fontSize: actionButtonFontSize,
        lineHeight: '140%',
        letterSpacing: '0.05em',
        border: '1px solid #0F58F9',
        height: `${actionButtonHeight}px`,
        width: actionButtonWidth ? `${actionButtonWidth}px` : undefined,
        ...actionButtonPadding
      }}
      title="Export to PDF"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 1V9M7 9L4 6M7 9L10 6M2 12V13H12V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Export
    </button>
  );

  const renderScormButton = () => (
    <ToastProvider>
      <ScormDownloadButton
        courseOutlineId={Number(productId)}
        label={t('interface.viewNew.exportScorm', 'Export to SCORM 2004')}
        className="rounded transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none disabled:opacity-60 bg-[#0F58F9] text-white"
        style={{
          fontSize: actionButtonFontSize,
          height: `${actionButtonHeight}px`,
          paddingLeft: useMobileLinkViewLayout ? '20px' : '15px',
          paddingRight: useMobileLinkViewLayout ? '24px' : '20px'
        }}
      />
    </ToastProvider>
  );

  if (useMobileLinkViewLayout) {
    return (
      <header className="sticky top-0 z-50 bg-white py-3" style={{ borderBottom: '1px solid #E4E4E7' }}>
        <div className="max-w-10xl mx-auto w-full flex flex-col gap-3 px-[14px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-x-4">
              {renderHomeButton()}
            </div>
            <div className="flex items-center gap-2">
              {currentIsAuthorized ? (
                <div
                  className="flex items-center"
                  style={useMobileLinkViewLayout ? { height: `${actionButtonHeight}px` } : undefined}
                >
                  <UserDropdown buttonSize={homeButtonHeight} />
                </div>
              ) : (
                <>
                  {renderCopyLinkButton()}
                  {renderSignUpButton()}
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {renderTitleSection()}
          </div>
          {shouldShowAuthToggle && (
            <div className="flex items-center">
              {renderAuthToggle()}
            </div>
          )}
          {(showDraftButton || canShowAiImproveButton || (canShowPdfExportButton && !isOnePager) || canShowScormButton) && (
            <div className="flex flex-wrap items-center gap-2">
              {showDraftButton && renderDraftButton()}
              {canShowAiImproveButton && renderAiImproveButton()}
              {canShowPdfExportButton && !isOnePager && renderPdfExportButton()}
              {canShowScormButton && renderScormButton()}
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 h-[120px] md:h-16 bg-white flex flex-row justify-between items-center gap-4 py-[14px]" style={{ borderBottom: '1px solid #E4E4E7' }}>
        <div className="max-w-10xl mx-auto w-full flex flex-row justify-between items-center gap-4 px-[14px]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-y-2 gap-x-4 text-left">
          <div className="flex flex-row w-full md:w-auto justify-between">{renderHomeButton()}
          {currentIsAuthorized ? (
            <div
              className="block md:hidden flex items-center"
              style={useMobileLinkViewLayout ? { height: `${actionButtonHeight}px` } : undefined}
            >
              <UserDropdown buttonSize={homeButtonHeight} />
            </div>
          ) : (
            <div className="block md:hidden flex items-center gap-3">
              <div className="hidden md:block w-px bg-gray-300" style={{ height: `${actionButtonHeight}px` }} />
              {isMobileViewport && renderCopyLinkButton()}
              {renderSignUpButton()}
            </div>
          )}
          </div>
          {renderTitleSection()}
        </div>

        <div className="flex items-center space-x-3">
          {shouldShowAuthToggle && renderAuthToggle()}

          {shouldShowLinkButtons && (
            <div className="flex items-center space-x-2">
              {showDraftButton && renderDraftButton()}
              {!isQuizLinkView && renderExportControl()}
              {renderCopyLinkButton()}
            </div>
          )}

        {isOnePager && onEditOrSave && (
          <div className="hidden sm:flex">
            <button
              onClick={onEditOrSave}
              className="flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
              style={{
                backgroundColor: isEditing ? '#10B981' : '#FFFFFF',
                color: isEditing ? '#FFFFFF' : '#171718',
                fontSize: actionButtonFontSize,
                lineHeight: '140%',
                letterSpacing: '0.05em',
                border: isEditing ? '1px solid #10B981' : '1px solid #171718',
                height: `${actionButtonHeight}px`,
                width: actionButtonWidth ? `${actionButtonWidth}px` : undefined,
                ...actionButtonPadding
              }}
              title={isEditing ? 'Save' : 'Edit'}
            >
              {isEditing ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.1986 3.99953L9.99843 5.79926M2.79912 3.39963V5.79926M11.1983 8.19888V10.5985M5.79883 1V2.19981M3.99901 4.59944H1.59924M12.3982 9.3987H9.99843M6.39877 1.59991H5.19889M12.7822 1.98385L12.0142 1.21597C11.9467 1.14777 11.8664 1.09363 11.7778 1.05668C11.6893 1.01973 11.5942 1.00071 11.4983 1.00071C11.4023 1.00071 11.3073 1.01973 11.2188 1.05668C11.1302 1.09363 11.0498 1.14777 10.9823 1.21597L1.21527 10.9825C1.14707 11.05 1.09293 11.1303 1.05598 11.2189C1.01903 11.3074 1 11.4024 1 11.4984C1 11.5943 1.01903 11.6893 1.05598 11.7779C1.09293 11.8664 1.14707 11.9468 1.21527 12.0143L1.9832 12.7822C2.05029 12.8511 2.13051 12.9059 2.21912 12.9433C2.30774 12.9807 2.40296 13 2.49915 13C2.59534 13 2.69056 12.9807 2.77918 12.9433C2.86779 12.9059 2.94801 12.8511 3.0151 12.7822L12.7822 3.01569C12.8511 2.94861 12.9059 2.86839 12.9433 2.77978C12.9807 2.69117 13 2.59595 13 2.49977C13 2.40358 12.9807 2.30837 12.9433 2.21976C12.9059 2.13115 12.8511 2.05093 12.7822 1.98385Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit
                </>
              )}
            </button>
          </div>
          )}

          {canShowAiImproveButton && renderAiImproveButton()}

          {canShowPdfExportButton && (
            (isOnePager || isQuiz) ? (
              <div className="hidden sm:flex">
                {renderPdfExportButton()}
              </div>
            ) : (
              renderPdfExportButton()
            )
          )}

          {canShowScormButton && renderScormButton()}

          {currentIsAuthorized ? (
            <div
              className="hidden md:flex items-center"
              style={useMobileLinkViewLayout ? { height: `${actionButtonHeight}px` } : undefined}
            >
              <UserDropdown buttonSize={homeButtonHeight} />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <div className="hidden md:block w-px bg-gray-300" style={{ height: `${actionButtonHeight}px` }} />
              {isMobileViewport && renderCopyLinkButton()}
              {renderSignUpButton()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};