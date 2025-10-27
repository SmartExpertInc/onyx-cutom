// custom_extensions/frontend/src/components/ProductViewHeader.tsx
"use client";

import React from 'react';
import { ProjectInstanceDetail, TrainingPlanData, TextPresentationData } from '@/types/projectSpecificTypes';
import ScormDownloadButton from '@/components/ScormDownloadButton';
import { ToastProvider } from '@/components/ui/toast';
import { UserDropdown } from '@/components/UserDropdown';

interface ProductViewHeaderProps {
  projectData: ProjectInstanceDetail | null;
  editableData: TrainingPlanData | TextPresentationData | null;
  productId: string | undefined;
  showSmartEditor: boolean;
  setShowSmartEditor: (show: boolean) => void;
  scormEnabled: boolean;
  componentName: string;
  allowedComponentNames?: string[];
  t: (key: string, fallback: string) => string;
  onPdfExport?: () => void;
  isEditing?: boolean;
  onEditOrSave?: () => void;
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
  t,
  onPdfExport,
  isEditing,
  onEditOrSave
}) => {
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
            {isOnePager && (
              <>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <div className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="14" height="14" rx="2" stroke="#4D4D4D"/>
                <mask id="path-2-inside-1_1435_10944" fill="white">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5133 2.5C11.7784 2.5 11.9933 2.7149 11.9933 2.98V7.24667C11.9933 7.51177 11.7784 7.72667 11.5133 7.72667C11.2483 7.72667 11.0333 7.51177 11.0333 7.24667V4.13883L4.13882 11.0333H7.24667C7.51177 11.0333 7.72667 11.2483 7.72667 11.5133C7.72667 11.7784 7.51177 11.9933 7.24667 11.9933H2.98C2.85269 11.9933 2.7306 11.9428 2.64059 11.8528C2.55057 11.7627 2.5 11.6406 2.5 11.5133V7.24667C2.5 6.98157 2.7149 6.76667 2.98 6.76667C3.2451 6.76667 3.46 6.98157 3.46 7.24667V10.3545L10.3545 3.46H7.24667C6.98157 3.46 6.76667 3.2451 6.76667 2.98C6.76667 2.7149 6.98157 2.5 7.24667 2.5H11.5133Z"/>
                </mask>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5133 2.5C11.7784 2.5 11.9933 2.7149 11.9933 2.98V7.24667C11.9933 7.51177 11.7784 7.72667 11.5133 7.72667C11.2483 7.72667 11.0333 7.51177 11.0333 7.24667V4.13883L4.13882 11.0333H7.24667C7.51177 11.0333 7.72667 11.2483 7.72667 11.5133C7.72667 11.7784 7.51177 11.9933 7.24667 11.9933H2.98C2.85269 11.9933 2.7306 11.9428 2.64059 11.8528C2.55057 11.7627 2.5 11.6406 2.5 11.5133V7.24667C2.5 6.98157 2.7149 6.76667 2.98 6.76667C3.2451 6.76667 3.46 6.98157 3.46 7.24667V10.3545L10.3545 3.46H7.24667C6.98157 3.46 6.76667 3.2451 6.76667 2.98C6.76667 2.7149 6.98157 2.5 7.24667 2.5H11.5133Z" fill="#4D4D4D"/>
                <path d="M11.0333 4.13883H12.0333V1.72462L10.3262 3.43172L11.0333 4.13883ZM4.13882 11.0333L3.43171 10.3262L1.7246 12.0333H4.13882V11.0333ZM3.46 10.3545H2.46V12.7687L4.16711 11.0616L3.46 10.3545ZM10.3545 3.46L11.0616 4.16711L12.7687 2.46H10.3545V3.46ZM11.5133 2.5V3.5C11.2262 3.5 10.9933 3.26723 10.9933 2.98H11.9933H12.9933C12.9933 2.16257 12.3307 1.5 11.5133 1.5V2.5ZM11.9933 2.98H10.9933V7.24667H11.9933H12.9933V2.98H11.9933ZM11.9933 7.24667H10.9933C10.9933 6.95944 11.2262 6.72667 11.5133 6.72667V7.72667V8.72667C12.3307 8.72667 12.9933 8.06409 12.9933 7.24667H11.9933ZM11.5133 7.72667V6.72667C11.8005 6.72667 12.0333 6.95944 12.0333 7.24667H11.0333H10.0333C10.0333 8.06409 10.696 8.72667 11.5133 8.72667V7.72667ZM11.0333 7.24667H12.0333V4.13883H11.0333H10.0333V7.24667H11.0333ZM11.0333 4.13883L10.3262 3.43172L3.43171 10.3262L4.13882 11.0333L4.84592 11.7405L11.7405 4.84593L11.0333 4.13883ZM4.13882 11.0333V12.0333H7.24667V11.0333V10.0333H4.13882V11.0333ZM7.24667 11.0333V12.0333C6.95944 12.0333 6.72667 11.8005 6.72667 11.5133H7.72667H8.72667C8.72667 10.696 8.06409 10.0333 7.24667 10.0333V11.0333ZM7.72667 11.5133H6.72667C6.72667 11.2262 6.95944 10.9933 7.24667 10.9933V11.9933V12.9933C8.06409 12.9933 8.72667 12.3307 8.72667 11.5133H7.72667ZM7.24667 11.9933V10.9933H2.98V11.9933V12.9933H7.24667V11.9933ZM2.98 11.9933V10.9933C3.11785 10.9933 3.25015 11.0481 3.34774 11.1457L2.64059 11.8528L1.93344 12.5598C2.21105 12.8375 2.58754 12.9933 2.98 12.9933V11.9933ZM2.64059 11.8528L3.34774 11.1457C3.44524 11.2432 3.5 11.3754 3.5 11.5133H2.5H1.5C1.5 11.9058 1.6559 12.2823 1.93344 12.5598L2.64059 11.8528ZM2.5 11.5133H3.5V7.24667H2.5H1.5V11.5133H2.5ZM2.5 7.24667H3.5C3.5 7.53385 3.26719 7.76667 2.98 7.76667V6.76667V5.76667C2.16262 5.76667 1.5 6.42928 1.5 7.24667H2.5ZM2.98 6.76667V7.76667C2.69281 7.76667 2.46 7.53385 2.46 7.24667H3.46H4.46C4.46 6.42928 3.79738 5.76667 2.98 5.76667V6.76667ZM3.46 7.24667H2.46V10.3545H3.46H4.46V7.24667H3.46ZM3.46 10.3545L4.16711 11.0616L11.0616 4.16711L10.3545 3.46L9.64741 2.75289L2.75289 9.64741L3.46 10.3545ZM10.3545 3.46V2.46H7.24667V3.46V4.46H10.3545V3.46ZM7.24667 3.46V2.46C7.53385 2.46 7.76667 2.69281 7.76667 2.98H6.76667H5.76667C5.76667 3.79738 6.42928 4.46 7.24667 4.46V3.46ZM6.76667 2.98H7.76667C7.76667 3.26719 7.53385 3.5 7.24667 3.5V2.5V1.5C6.42928 1.5 5.76667 2.16262 5.76667 2.98H6.76667ZM7.24667 2.5V3.5H11.5133V2.5V1.5H7.24667V2.5Z" fill="#4D4D4D" mask="url(#path-2-inside-1_1435_10944)"/>
                </svg>
                <span className="text-[#4D4D4D] text-[15px] font-medium">A4</span>
              </div>
            </>)}
            {isSlideDeck && (
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

        <div className="flex items-center space-x-3">
          {/* Edit/Save button for Text Presentations */}
          {isOnePager && onEditOrSave && (
            <button
              onClick={onEditOrSave}
              className="flex items-center gap-2 rounded-md h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
              style={{
                backgroundColor: isEditing ? '#10B981' : '#FFFFFF',
                color: isEditing ? '#FFFFFF' : '#171718',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em',
                border: isEditing ? '1px solid #10B981' : '1px solid #171718'
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
          )}

          {/* AI Improve button for Course Outline and Presentations */}
          {shouldShowButtons && (
          <button
              onClick={() => setShowSmartEditor(!showSmartEditor)}
              className="flex items-center gap-2 rounded-md h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
            style={{
                backgroundColor: '#FFFFFF',
              color: '#171718',
              fontSize: '14px',
              fontWeight: '600',
              lineHeight: '140%',
                letterSpacing: '0.05em',
                border: '1px solid #171718'
              }}
              title={t('actions.aiAgent', 'AI Improve')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.1986 3.99953L9.99843 5.79926M2.79912 3.39963V5.79926M11.1983 8.19888V10.5985M5.79883 1V2.19981M3.99901 4.59944H1.59924M12.3982 9.3987H9.99843M6.39877 1.59991H5.19889M12.7822 1.98385L12.0142 1.21597C11.9467 1.14777 11.8664 1.09363 11.7778 1.05668C11.6893 1.01973 11.5942 1.00071 11.4983 1.00071C11.4023 1.00071 11.3073 1.01973 11.2188 1.05668C11.1302 1.09363 11.0498 1.14777 10.9823 1.21597L1.21527 10.9825C1.14707 11.05 1.09293 11.1303 1.05598 11.2189C1.01903 11.3074 1 11.4024 1 11.4984C1 11.5943 1.01903 11.6893 1.05598 11.7779C1.09293 11.8664 1.14707 11.9468 1.21527 12.0143L1.9832 12.7822C2.05029 12.8511 2.13051 12.9059 2.21912 12.9433C2.30774 12.9807 2.40296 13 2.49915 13C2.59534 13 2.69056 12.9807 2.77918 12.9433C2.86779 12.9059 2.94801 12.8511 3.0151 12.7822L12.7822 3.01569C12.8511 2.94861 12.9059 2.86839 12.9433 2.77978C12.9807 2.69117 13 2.59595 13 2.49977C13 2.40358 12.9807 2.30837 12.9433 2.21976C12.9059 2.13115 12.8511 2.05093 12.7822 1.98385Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('actions.aiAgent', 'AI Improve')}
          </button>
          )}

          {/* Export button for slide deck presentations, quizzes, and text presentations */}
          {(isSlideDeck || isQuiz || isOnePager) && (
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
              title="Export to PDF"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1V9M7 9L4 6M7 9L10 6M2 12V13H12V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </button>
          )}

          {shouldShowButtons && scormEnabled && (
            <ToastProvider>
              <ScormDownloadButton
                courseOutlineId={Number(productId)}
                label={t('interface.viewNew.exportScorm', 'Export to SCORM 2004')}
                className="rounded h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none disabled:opacity-60 bg-[#0F58F9] text-white"
                style={{ fontSize: '14px', fontWeight: 600, lineHeight: '140%', letterSpacing: '0.05em' }}
              />
            </ToastProvider>
          )}

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

