// custom_extensions/frontend/src/components/TrainingPlanTable.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { TrainingPlanData, Section as SectionType, Lesson as LessonType } from '@/types/trainingPlan';
import { ProjectListItem } from '@/types/products';
import { CreateContentTypeModal } from './CreateContentTypeModal';
import OpenOrCreateModal from './OpenOrCreateModal';
import OpenContentModal from './OpenContentModal';
import { useSearchParams } from 'next/navigation';

// --- Custom SVG Icons ---
const NewPieChartIcon = ({ color = '#FF1414', className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.23618 4.45109C7.29889 4.52215 7.3286 4.62291 7.31771 4.71767C7.10348 6.58871 5.53656 8 3.67288 8C1.64747 8 0 6.35149 0 4.32497C0 2.45827 1.45205 0.852133 3.30583 0.668632C3.40056 0.658956 3.49167 0.690319 3.56065 0.75371C3.62964 0.817101 3.66991 0.906516 3.66991 1.0006V4.33332H6.98993C7.08401 4.33332 7.17379 4.38002 7.23618 4.45109ZM7.98647 3.24899C7.81515 1.47437 6.4981 0.172845 4.68889 0.0013554C4.59614 -0.00698556 4.50536 0.0233755 4.43671 0.0867668C4.36805 0.150158 4.33009 0.23924 4.33009 0.333326V0.341666V3.34441C4.33009 3.52858 4.47566 3.66604 4.65786 3.66604H7.62865H7.66331C7.66529 3.66604 7.6676 3.66604 7.66991 3.66604C7.85212 3.66604 8 3.52257 8 3.33841C8 3.30504 7.99538 3.27935 7.98647 3.24899Z" fill={color}/></svg>
);
const NewClockIcon = ({ color = '#FF1414', className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M4 0C1.79077 0 0 1.79077 0 4C0 6.20923 1.79077 8 4 8C6.20923 8 8 6.20923 8 4C8 1.79077 6.20923 0 4 0ZM4.30769 1.53846C4.30769 1.45686 4.27527 1.37859 4.21757 1.32089C4.15987 1.26319 4.0816 1.23077 4 1.23077C3.9184 1.23077 3.84013 1.26319 3.78243 1.32089C3.72473 1.37859 3.69231 1.45686 3.69231 1.53846V4C3.69231 4.16985 3.83015 4.30769 4 4.30769H5.84615C5.92776 4.30769 6.00602 4.27527 6.06373 4.21757C6.12143 4.15987 6.15385 4.0816 6.15385 4C6.15385 3.9184 6.12143 3.84013 6.06373 3.78243C6.00602 3.72473 5.92776 3.69231 5.84615 3.69231H4.30769V1.53846Z" fill={color}/></svg>
);
const NewTestIcon = ({ color = '#FF1414', className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.4 6.35C5.5275 6.35 5.63812 6.30312 5.73187 6.20937C5.82562 6.11562 5.8725 6.005 5.8725 5.8775C5.8725 5.75 5.82562 5.63938 5.73187 5.54563C5.63812 5.45188 5.5275 5.405 5.4 5.405C5.2725 5.405 5.16188 5.45188 5.06813 5.54563C4.97438 5.63938 4.9275 5.75 4.9275 5.8775C4.9275 6.005 4.97438 6.11562 5.06813 6.20937C5.16188 6.30312 5.2725 6.35 5.4 6.35ZM5.0625 4.91H5.7375C5.7375 4.6925 5.76 4.53312 5.805 4.43187C5.85 4.33062 5.955 4.1975 6.12 4.0325C6.345 3.8075 6.495 3.62562 6.57 3.48688C6.645 3.34812 6.6825 3.185 6.6825 2.9975C6.6825 2.66 6.56437 2.38437 6.32812 2.17062C6.09188 1.95687 5.7825 1.85 5.4 1.85C5.0925 1.85 4.82438 1.93625 4.59562 2.10875C4.36688 2.28125 4.2075 2.51 4.1175 2.795L4.725 3.0425C4.7925 2.855 4.88437 2.71438 5.00062 2.62063C5.11687 2.52688 5.25 2.48 5.4 2.48C5.58 2.48 5.72625 2.53062 5.83875 2.63188C5.95125 2.73312 6.0075 2.87 6.0075 3.0425C6.0075 3.1475 5.9775 3.24687 5.9175 3.34062C5.8575 3.43437 5.7525 3.5525 5.6025 3.695C5.355 3.9125 5.20312 4.08312 5.14687 4.20687C5.09062 4.33062 5.0625 4.565 5.0625 4.91ZM2.7 7.7C2.4525 7.7 2.24062 7.61188 2.06437 7.43563C1.88812 7.25938 1.8 7.0475 1.8 6.8V1.4C1.8 1.1525 1.88812 0.940625 2.06437 0.764375C2.24062 0.588125 2.4525 0.5 2.7 0.5H8.1C8.3475 0.5 8.55937 0.588125 8.73563 0.764375C8.91187 0.940625 9 1.1525 9 1.4V6.8C9 7.0475 8.91187 7.25938 8.73563 7.43563C8.55937 7.61188 8.3475 7.7 8.1 7.7H2.7ZM0.9 9.5C0.6525 9.5 0.440625 9.41187 0.264375 9.23563C0.088125 9.05937 0 8.8475 0 8.6V2.3H0.9V8.6H7.2V9.5H0.9Z" fill={color}/>
  </svg>
);
const NewPracticeIcon = ({ color = '#FF1414', className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.59091 6.22727H7.77273V5C7.77273 4.89151 7.72961 4.78744 7.6529 4.71073C7.5762 4.63403 7.47213 4.59091 7.36364 4.59091H4.90909V3.77273H5.72727C5.83576 3.77273 5.93984 3.72963 6.01654 3.65291C6.09325 3.57619 6.13636 3.47214 6.13636 3.36364V0.909091C6.13636 0.800592 6.09325 0.69654 6.01654 0.619819C5.93984 0.543102 5.83576 0.5 5.72727 0.5H3.27273C3.16423 0.5 3.06018 0.543102 2.98345 0.619819C2.90674 0.69654 2.86364 0.800592 2.86364 0.909091V3.36364C2.86364 3.47214 2.90674 3.57619 2.98345 3.65291C3.06018 3.72963 3.16423 3.77273 3.27273 3.77273H4.09091V4.59091H1.63636C1.52786 4.59091 1.42381 4.63403 1.34709 4.71073C1.27037 4.78744 1.22727 4.89151 1.22727 5V6.22727H0.409091C0.300592 6.22727 0.19654 6.27039 0.119819 6.3471C0.0431018 6.4238 0 6.52787 0 6.63636V9.09091C0 9.1994 0.0431018 9.30347 0.119819 9.38018C0.19654 9.45688 0.300592 9.5 0.409091 9.5H2.86364C2.97214 9.5 3.07619 9.45688 3.15291 9.38018C3.22963 9.30347 3.27273 9.1994 3.27273 9.09091V6.63636C3.27273 6.52787 3.22963 6.4238 3.15291 6.3471C3.07619 6.27039 2.97214 6.22727 2.86364 6.22727H2.04545V5.40909H6.95455V6.22727H6.13636C6.02787 6.22727 5.9238 6.27039 5.8471 6.3471C5.77039 6.4238 5.72727 6.52787 5.72727 6.63636V9.09091C5.72727 9.1994 5.77039 9.30347 5.8471 9.38018C5.9238 9.45688 6.02787 9.5 6.13636 9.5H8.59091C8.6994 9.5 8.80347 9.45688 8.88018 9.38018C8.95688 9.30347 9 9.1994 9 9.09091V6.63636C9 6.52787 8.95688 6.4238 8.88018 6.3471C8.80347 6.27039 8.6994 6.22727 8.59091 6.22727Z" fill={color}/>
  </svg>
);
const NewNoIcon = ({ color = '#FF1414', className = '' }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 0.500015C2.01857 0.500015 0 2.51859 0 5.00002C0 7.48144 2.01857 9.50002 4.5 9.50002C6.98143 9.50002 9 7.48144 9 5.00002C9 2.51859 6.98143 0.500015 4.5 0.500015ZM6.36779 6.29391C6.52805 6.45417 6.52668 6.7135 6.36642 6.87239C6.28698 6.95183 6.18288 6.99155 6.07786 6.99155C5.97284 6.99155 5.86875 6.95183 5.78793 6.87239L4.49859 5.57849L3.20598 6.86783C3.12517 6.94728 3.02153 6.98699 2.91742 6.98699C2.81332 6.98699 2.70694 6.94727 2.62749 6.86646C2.46724 6.7062 2.4686 6.44824 2.62749 6.28798L3.92139 4.99865L2.63205 3.70604C2.4718 3.54578 2.47316 3.28645 2.63342 3.12756C2.79231 2.9673 3.05164 2.9673 3.2119 3.12756L4.50124 4.42146L5.79385 3.13212C5.95411 2.97323 6.21344 2.97323 6.37233 3.13349C6.53259 3.29375 6.53122 3.55171 6.37233 3.71197L5.07843 5.0013L6.36779 6.29391Z" fill={color}/>
    </svg>
);

const editingInputClassBase = "p-1 bg-yellow-50 border border-yellow-400 rounded text-black outline-none focus:ring-1 focus:ring-yellow-600 placeholder-gray-400";
const editingInputClass = `w-full ${editingInputClassBase} text-xs`;
const editingInputSmallClass = `${editingInputClassBase} h-8 text-xs`;
const editingInputTitleClass = `${editingInputClassBase} text-base font-semibold`;
const editingInputMainTitleClass = `${editingInputClassBase} text-xl md:text-2xl font-bold bg-gray-700 text-white`;

const StatusBadge = ({
  type, text, columnContext, isEditing, onTextChange, path, iconColor = '#FF1414'
}: {
  type: string; text: string; columnContext?: 'check' | 'contentAvailable';
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  path?: (string | number)[];
  iconColor?: string;
}) => {
  const defaultIconSize = "w-4 h-4";

  if (isEditing && onTextChange && path && (columnContext === 'check' || columnContext === 'contentAvailable')) {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => onTextChange(path, e.target.value)}
        className={`${editingInputSmallClass} w-full`}
        placeholder={columnContext === 'check' ? "Check text" : "Availability text"}
      />
    );
  }
  if (columnContext === 'contentAvailable') {
    return ( <div className="inline-flex items-center space-x-2"> <NewPieChartIcon color={iconColor} className={`${defaultIconSize} shrink-0`} /> <span className="text-xs font-medium text-gray-700">{text}</span> </div> );
  }
  switch (type) {
    case 'test': case 'video_test': return ( <div className="inline-flex items-center space-x-2"> <NewTestIcon color={iconColor} className={`${defaultIconSize} shrink-0`} /> <span className="text-xs font-medium text-gray-700">{text}</span> </div> );
    case 'practice': case 'practice_supervisor': case 'role_play': case 'demo_supervisor': case 'error_analysis_supervisor': case 'demo_practice': case 'practice_case': case 'practice_discussion': case 'oral_quiz': case 'photo_analysis': case 'other_check': return ( <div className="inline-flex items-center space-x-2"> <NewPracticeIcon color={iconColor} className={`${defaultIconSize} shrink-0`} /> <span className="text-xs font-medium text-gray-700">{text}</span> </div> );
    default: return ( 
        <div className="inline-flex items-center space-x-2">
            <NewNoIcon color={iconColor} className={`${defaultIconSize} shrink-0`} /> 
            <span className="text-xs font-medium text-gray-700">{text || (type === 'no' ? 'No' : type)}</span> 
        </div> 
    );
  }
};

interface TrainingPlanTableProps {
  dataToDisplay?: TrainingPlanData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  allUserMicroproducts?: ProjectListItem[];
  parentProjectName?: string;
  sourceChatSessionId?: string | null;
  theme?: string;
  columnVisibility?: {
    knowledgeCheck: boolean;
    contentAvailability: boolean;
    informationSource: boolean;
    estCreationTime: boolean;
    estCompletionTime: boolean;
  };
}

const localizationConfig = {
  ru: { moduleAndLessons: "Модуль и уроки", knowledgeCheck: "Проверка знаний", contentAvailability: "Наличие контента", source: "Источник информации", time: "Оц. время создания", estCreationTime: "Оц. время создания", estCompletionTime: "Оц. время завершения" },
  en: { moduleAndLessons: "Module / Lesson", knowledgeCheck: "Assessment Type", contentAvailability: "Content Volume", source: "Source", time: "Est. Creation Time", estCreationTime: "Est. Creation Time", estCompletionTime: "Est. Completion Time" },
  uk: { moduleAndLessons: "Модуль та уроки", knowledgeCheck: "Перевірка знань", contentAvailability: "Наявність контенту", source: "Джерело інформації", time: "Оц. час створення", estCreationTime: "Оц. час створення", estCompletionTime: "Оц. час завершення" },
};
const timeUnits = {
  ru: { timeUnitSingular: "ч", timeUnitDecimalPlural: "ч", timeUnitGeneralPlural: "ч", minuteUnit: "м" },
  en: { timeUnitSingular: "h", timeUnitDecimalPlural: "h", timeUnitGeneralPlural: "h", minuteUnit: "m" },
  uk: { timeUnitSingular: "год", timeUnitDecimalPlural: "год", timeUnitGeneralPlural: "год", minuteUnit: "хв" },
};

const formatHoursDisplay = (hours: number | string, language: 'ru' | 'en' | 'uk', localized: typeof localizationConfig['ru'] | typeof localizationConfig['en'] | typeof localizationConfig['uk'], isEditingContext?: boolean) => {
    const numHours = Number(hours);
    if (isNaN(numHours)) return isEditingContext ? "" : "-";
    if (numHours <= 0 && !isEditingContext) return '-';
    if (isEditingContext && numHours === 0 && (typeof hours === 'number' || hours === "0")) return "0";
    if (isEditingContext && hours === "") return "";

    const numStr = numHours % 1 === 0 ? numHours.toFixed(0) : numHours.toFixed(1);
    if (language === 'en') { return `${numStr}${timeUnits.en.timeUnitSingular}`; }
    if (language === 'ru') { return `${numStr}${timeUnits.ru.timeUnitSingular}`; }
    return `${numStr} ${timeUnits.uk.timeUnitSingular}`;
};

const formatCompletionTimeDisplay = (completionTime: string, language: 'ru' | 'en' | 'uk'): string => {
    if (!completionTime) return '-';
    
    // Extract minutes from completion time string (e.g., "5m", "6m", "7m", "8m")
    const minutes = parseInt(completionTime.replace(/[^0-9]/g, '')) || 0;
    
    if (language === 'en') {
        return `${minutes}${timeUnits.en.minuteUnit}`;
    } else if (language === 'ru') {
        return `${minutes}${timeUnits.ru.minuteUnit}`;
    } else {
        return `${minutes}${timeUnits.uk.minuteUnit}`;
    }
};

const MAX_SOURCE_LENGTH = 25;

const findMicroproductByTitle = (
  titleToMatch: string | undefined | null,
  parentProjectName: string | undefined,
  allUserMicroproducts: ProjectListItem[] | undefined
): ProjectListItem | undefined => {

  if (!allUserMicroproducts || !parentProjectName || !titleToMatch) {
    return undefined;
  }

  const trimmedTitleToMatch = titleToMatch.trim();
  const trimmedParentProjectName = parentProjectName.trim();

  const found = allUserMicroproducts.find(
    (mp) => {
      const mpMicroName = mp.microProductName ?? (mp as any).microproduct_name;
      const mpProjectName = mp.projectName?.trim();

      // Method 1: Legacy matching - project name matches outline and microProductName matches lesson
      const legacyProjectMatch = mpProjectName === trimmedParentProjectName;
      const legacyNameMatch = mpMicroName?.trim() === trimmedTitleToMatch;
      
      // Method 2: New naming convention - project name follows "Outline Name: Lesson Title" pattern
      const expectedNewProjectName = `${trimmedParentProjectName}: ${trimmedTitleToMatch}`;
      const newPatternMatch = mpProjectName === expectedNewProjectName;
      
      return (legacyProjectMatch && legacyNameMatch) || newPatternMatch;
    }
  );

  return found;
};


const TrainingPlanTable: React.FC<TrainingPlanTableProps> = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  allUserMicroproducts,
  parentProjectName,
  sourceChatSessionId,
  theme = 'cherry', // Default theme
  columnVisibility,
}) => {
  const [contentModalState, setContentModalState] = useState<{
    isOpen: boolean; lessonTitle: string; moduleName: string; lessonNumber: number;
  }>({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0 });

  const [openOrCreateModalState, setOpenOrCreateModalState] = useState<{
    isOpen: boolean; lessonTitle: string; moduleName: string; lessonNumber: number;
    hasLesson: boolean; hasQuiz: boolean;
  }>({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0, hasLesson: false, hasQuiz: false });

  const [openContentModalState, setOpenContentModalState] = useState<{
    isOpen: boolean; lessonTitle: string; moduleName: string; lessonNumber: number;
    hasLesson: boolean; hasVideoLesson: boolean; hasQuiz: boolean;
    lessonId?: number; videoLessonId?: number; quizId?: number; parentProjectName?: string;
  }>({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0, hasLesson: false, hasVideoLesson: false, hasQuiz: false });

  // Function to find existing lesson for a given lesson title
  const findExistingLesson = (lessonTitle: string): ProjectListItem | undefined => {
    return findMicroproductByTitle(lessonTitle, parentProjectName, allUserMicroproducts);
  };

  // Function to find existing quiz for a given lesson title
  const findExistingQuiz = (lessonTitle: string): ProjectListItem | undefined => {
    if (!allUserMicroproducts || !parentProjectName || !lessonTitle) {
      return undefined;
    }

    const trimmedTitleToMatch = lessonTitle.trim();
    const trimmedParentProjectName = parentProjectName.trim();

    // Look for quiz with naming pattern "Quiz - {lesson_title}"
    const quizName = `Quiz - ${trimmedTitleToMatch}`;
    
    return allUserMicroproducts.find(
      (mp) => {
        const mpProjectName = mp.projectName?.trim();
        const mpProductType = (mp as any).product_type || (mp as any).productType;
        
        // Check if it's a quiz and the name matches
        return mpProductType === "Quiz" && mpProjectName === quizName;
      }
    );
  };

  // Function to find existing video lesson (placeholder for future implementation)
  const findExistingVideoLesson = (lessonTitle: string): ProjectListItem | undefined => {
    // TODO: Implement video lesson detection when video lessons are supported
    return undefined;
  };

  const handleLessonClick = (lesson: LessonType, moduleName: string, lessonNumber: number) => {
    const lessonTitle = lesson.title;
    
    // Check what content already exists
    const existingLesson = findExistingLesson(lessonTitle);
    const existingQuiz = findExistingQuiz(lessonTitle);
    const existingVideoLesson = findExistingVideoLesson(lessonTitle);
    
    const hasLesson = !!existingLesson;
    const hasQuiz = !!existingQuiz;
    const hasVideoLesson = !!existingVideoLesson;
    
    // Scenario 1: No content exists - show create modal
    if (!hasLesson && !hasQuiz && !hasVideoLesson) {
      setContentModalState({ 
        isOpen: true, 
        lessonTitle, 
        moduleName, 
        lessonNumber 
      });
    }
    // Scenario 2: Only lesson exists (no quiz/video lesson) - show open or create modal
    else if (hasLesson && !hasQuiz && !hasVideoLesson) {
      setOpenOrCreateModalState({ 
        isOpen: true, 
        lessonTitle, 
        moduleName, 
        lessonNumber,
        hasLesson,
        hasQuiz
      });
    }
    // Scenario 3: Both lesson and quiz exist (or lesson+quiz+video) - show open modal
    else if (hasLesson && hasQuiz) {
      setOpenContentModalState({
        isOpen: true,
        lessonTitle,
        moduleName,
        lessonNumber,
        hasLesson,
        hasQuiz,
        hasVideoLesson,
        lessonId: existingLesson?.id,
        quizId: existingQuiz?.id,
        videoLessonId: existingVideoLesson?.id,
        parentProjectName
      });
    }
    // Scenario 4: Only quiz or only video lesson exists (no lesson) - fallback to open or create modal
    else {
      setOpenOrCreateModalState({ 
        isOpen: true, 
        lessonTitle, 
        moduleName, 
        lessonNumber,
        hasLesson,
        hasQuiz
      });
    }
  };

  const handleOpenOrCreateOpen = () => {
    const { lessonTitle, moduleName, lessonNumber, hasLesson, hasQuiz } = openOrCreateModalState;
    
    // Check what content exists
    const existingLesson = findExistingLesson(lessonTitle);
    const existingQuiz = findExistingQuiz(lessonTitle);
    const existingVideoLesson = findExistingVideoLesson(lessonTitle);
    
    setOpenContentModalState({
      isOpen: true,
      lessonTitle,
      moduleName,
      lessonNumber,
      hasLesson: !!existingLesson,
      hasVideoLesson: !!existingVideoLesson,
      hasQuiz: !!existingQuiz,
      lessonId: existingLesson?.id,
      videoLessonId: existingVideoLesson?.id,
      quizId: existingQuiz?.id,
      parentProjectName
    });
    
    setOpenOrCreateModalState({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0, hasLesson: false, hasQuiz: false });
  };

  const handleOpenOrCreateCreate = () => {
    const { lessonTitle, moduleName, lessonNumber, hasLesson, hasQuiz } = openOrCreateModalState;
    
    setContentModalState({ 
      isOpen: true, 
      lessonTitle, 
      moduleName, 
      lessonNumber 
    });
    
    setOpenOrCreateModalState({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0, hasLesson: false, hasQuiz: false });
  };

  // Theme configuration for training plan colors
  const themeConfig = {
    cherry: {
      courseHeaderBg: "#1e2939", // main course header background (current gray-800)
      moduleHeaderBg: "#F1F1F1", // module headers background (light gray)
      courseHeaderTextColor: "text-white", // white text on dark background
      numberColor: "text-gray-600", // current gray
      iconColor: "#FF1414", // current red
    },
    lunaria: {
      courseHeaderBg: "#85749E", // main course header background (purple)
      moduleHeaderBg: "#F1F1F1", // module headers background (light gray)
      courseHeaderTextColor: "text-white", // white text on purple background
      numberColor: "text-white",
      iconColor: "#85749E", // same as course header
    },
    wine: {
      courseHeaderBg: "#1e2939", // main course header background (current gray-800)
      moduleHeaderBg: "#F1F1F1", // module headers background (light gray)
      courseHeaderTextColor: "text-white", // white text on dark background
      numberColor: "text-gray-600",
      iconColor: "#FF1414",
    },
    vanilla: {
      courseHeaderBg: "#8776A0", // main course header background 
      moduleHeaderBg: "#F1F1F1", // module headers background (light gray)
      courseHeaderTextColor: "text-white", // white text on dark background
      numberColor: "text-gray-600",
      iconColor: "#8776A0",
    },
    terracotta: {
      courseHeaderBg: "#2D7C21", // main course header background 
      moduleHeaderBg: "#F1F1F1", // module headers background (light gray)
      courseHeaderTextColor: "text-white", // white text on dark background
      numberColor: "text-gray-600",
      iconColor: "#2D7C21",
    },
    zephyr: {
      courseHeaderBg: "#1e2939", // main course header background (current gray-800)
      moduleHeaderBg: "#F1F1F1", // module headers background (light gray)
      courseHeaderTextColor: "text-white", // white text on dark background
      numberColor: "text-gray-600",
      iconColor: "#FF1414",
    },
  };

  const currentTheme = themeConfig[theme as keyof typeof themeConfig] || themeConfig.cherry;
  const iconBaseColor = currentTheme.iconColor;
  const sections = dataToDisplay?.sections;
  const mainTitle = dataToDisplay?.mainTitle;
  const lang = dataToDisplay?.detectedLanguage === 'ru' ? 'ru' : dataToDisplay?.detectedLanguage === 'uk' ? 'uk' : 'en';
  const localized = localizationConfig[lang];

  const handleGenericInputChange = (path: (string|number)[], event: React.ChangeEvent<HTMLInputElement>) => {
    if (onTextChange) onTextChange(path, event.target.value);
  };

  const handleNumericInputChange = (
    path: (string|number)[],
    event: React.ChangeEvent<HTMLInputElement>,
    autoCalcPath?: (string|number)[]
  ) => {
    if (onTextChange) {
        const valueStr = event.target.value;
        const numValue = parseFloat(valueStr);
        onTextChange(path, valueStr === "" ? "" : (isNaN(numValue) ? 0 : numValue));
        if (autoCalcPath && valueStr !== "") {
            onTextChange(autoCalcPath, false);
        }
    }
  };

  const truncateText = (text: string | undefined | null, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Calculate total completion time for a section
  const calculateTotalCompletionTime = (section: SectionType): string => {
    if (!section.lessons || section.lessons.length === 0) return formatCompletionTimeDisplay('0m', lang);
    
    const totalMinutes = section.lessons.reduce((total, lesson) => {
      const completionTime = lesson.completionTime || '5m';
      const minutes = parseInt(completionTime.replace(/[^0-9]/g, '')) || 5;
      return total + minutes;
    }, 0);
    
    return formatCompletionTimeDisplay(`${totalMinutes}m`, lang);
  };

  // ---- Determine column visibility based on query params OR stored displayOptions ----
  const searchParams = useSearchParams();

  const storedOpts = dataToDisplay?.displayOptions;

  const visibleColumns = useMemo(() => {
    const def = {
      knowledgeCheck: true,
      contentAvailability: true,
      informationSource: true,
      estCreationTime: true,
      estCompletionTime: true,
    };

    const fromQuery = (key: keyof typeof def): boolean | undefined => {
      const val = searchParams?.get(key);
      if (val === '1') return true;
      if (val === '0') return false;
      return undefined;
    };

    // Use columnVisibility prop if provided, otherwise fall back to stored options or defaults
    if (columnVisibility) {
      return {
        knowledgeCheck: columnVisibility.knowledgeCheck,
        contentAvailability: columnVisibility.contentAvailability,
        informationSource: columnVisibility.informationSource,
        estCreationTime: columnVisibility.estCreationTime !== false,
        estCompletionTime: columnVisibility.estCompletionTime !== false,
      };
    }

    return {
      knowledgeCheck: fromQuery('knowledgeCheck') ?? storedOpts?.knowledgeCheck ?? def.knowledgeCheck,
      contentAvailability: fromQuery('contentAvailability') ?? storedOpts?.contentAvailability ?? def.contentAvailability,
      informationSource: fromQuery('informationSource') ?? storedOpts?.informationSource ?? def.informationSource,
      estCreationTime: true,
      estCompletionTime: true,
    };
  }, [searchParams, storedOpts, columnVisibility]);

  const columnOrder: Array<{key: string; width: number}> = [
    { key: 'module', width: 4 },
    { key: 'knowledgeCheck', width: 2 },
    { key: 'contentAvailability', width: 1 },
    { key: 'informationSource', width: 2 },
    { key: 'estCreationTime', width: 1 },
    { key: 'estCompletionTime', width: 1 },
  ];

  const activeColumns = columnOrder.filter((c) => {
    if (c.key === 'module') return true;
    // @ts-ignore dynamic access
    return visibleColumns[c.key];
  });

  const gridTemplate = activeColumns.map((c) => `${c.width}fr`).join(' ');

  if (!dataToDisplay) {
    return <div className="p-8 text-center">Training plan data is unavailable for display.</div>;
  }
  if ((!sections || sections.length === 0) && !isEditing && mainTitle === undefined) {
    return <div className="p-8 text-center">No training plan data available.</div>;
  }

  let lessonCounter = 0;

  return (
    <div className="font-['Inter',_sans-serif] bg-gray-50">
      <CreateContentTypeModal
        isOpen={contentModalState.isOpen}
        onClose={() => setContentModalState({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0 })}
        lessonTitle={contentModalState.lessonTitle}
        moduleName={contentModalState.moduleName}
        lessonNumber={contentModalState.lessonNumber}
        sourceChatSessionId={sourceChatSessionId}
        hasLesson={!!findExistingLesson(contentModalState.lessonTitle)}
        hasQuiz={!!findExistingQuiz(contentModalState.lessonTitle)}
      />
      <OpenOrCreateModal
        isOpen={openOrCreateModalState.isOpen}
        onClose={() => setOpenOrCreateModalState({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0, hasLesson: false, hasQuiz: false })}
        lessonTitle={openOrCreateModalState.lessonTitle}
        moduleName={openOrCreateModalState.moduleName}
        lessonNumber={openOrCreateModalState.lessonNumber}
        hasLesson={openOrCreateModalState.hasLesson}
        hasQuiz={openOrCreateModalState.hasQuiz}
        onOpen={handleOpenOrCreateOpen}
        onCreate={handleOpenOrCreateCreate}
      />
      <OpenContentModal
        isOpen={openContentModalState.isOpen}
        onClose={() => setOpenContentModalState({ isOpen: false, lessonTitle: '', moduleName: '', lessonNumber: 0, hasLesson: false, hasVideoLesson: false, hasQuiz: false, lessonId: undefined, videoLessonId: undefined, quizId: undefined })}
        lessonTitle={openContentModalState.lessonTitle}
        moduleName={openContentModalState.moduleName}
        lessonNumber={openContentModalState.lessonNumber}
        hasLesson={openContentModalState.hasLesson}
        hasVideoLesson={openContentModalState.hasVideoLesson}
        hasQuiz={openContentModalState.hasQuiz}
        lessonId={openContentModalState.lessonId}
        videoLessonId={openContentModalState.videoLessonId}
        quizId={openContentModalState.quizId}
        parentProjectName={openContentModalState.parentProjectName || parentProjectName}
      />
      <div className="shadow-lg rounded-lg overflow-hidden border border-gray-300 bg-white">
        {(isEditing || (mainTitle !== undefined && mainTitle !== null)) && (
          <div className={`p-4 ${isEditing ? 'text-black' : currentTheme.courseHeaderTextColor}`} style={{ backgroundColor: currentTheme.courseHeaderBg }}>
            {isEditing && onTextChange ? (
              <input
                type="text" value={mainTitle || ''}
                onChange={(e) => handleGenericInputChange(['mainTitle'], e)}
                className={editingInputMainTitleClass} placeholder="Main Training Plan Title"
              />
            ) : ( <h1 className="text-xl md:text-2xl font-bold">{mainTitle}</h1> )}
          </div>
        )}

        {/* --- Table Header Row (dynamic columns) --- */}
        <div
          className="text-gray-500 p-4 text-xs font-semibold items-center border-b border-gray-300 uppercase tracking-wider"
          style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
        >
          {activeColumns.map((col, idx) => {
            const borderClasses = idx < activeColumns.length - 1 ? 'border-r border-gray-400' : '';
            const common = `px-2 ${borderClasses}`;
            switch (col.key) {
              case 'module':
                return (
                  <div key={col.key} className={`pr-2 ${borderClasses}`}>{localized.moduleAndLessons}</div>
                );
              case 'knowledgeCheck':
                return <div key={col.key} className={common}>{localized.knowledgeCheck}</div>;
              case 'contentAvailability':
                return <div key={col.key} className={common}>{localized.contentAvailability}</div>;
              case 'informationSource':
                return <div key={col.key} className={common}>{localized.source}</div>;
              case 'estCreationTime':
                return <div key={col.key} className={common}>{localized.estCreationTime}</div>;
              case 'estCompletionTime':
                return <div key={col.key} className={common}>{localized.estCompletionTime}</div>;
              default:
                return null;
            }
          })}
        </div>

        <div className="text-sm">
          {(sections || []).map((section: SectionType, sectionIdx: number) => (
            <React.Fragment key={section.id || `section-${sectionIdx}`}>
              <div
                className="p-4 font-semibold items-center border-t border-gray-300"
                style={{ display: 'grid', gridTemplateColumns: gridTemplate, backgroundColor: currentTheme.moduleHeaderBg }}
              >
                {/* Module column */}
                <div className="flex items-center space-x-2 pr-2">
                  {isEditing && onTextChange ? (
                    <>
                      <input type="text" value={section.id} onChange={(e) => handleGenericInputChange(['sections', sectionIdx, 'id'], e)} className={`${editingInputSmallClass} w-24 mr-2`} placeholder="ID"/>
                      <input type="text" value={section.title} onChange={(e) => handleGenericInputChange(['sections', sectionIdx, 'title'], e)} className={`${editingInputTitleClass} flex-grow`} placeholder="Section Title"/>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center text-white rounded-sm w-auto px-1.5 h-5 text-xs font-bold" style={{ backgroundColor: iconBaseColor }}>{section.id}</span>
                      <span className="font-semibold text-gray-800">{section.title}</span>
                    </>
                  )}
                </div>
                {/* Render placeholder or time column for remaining active columns */}
                {activeColumns.slice(1).map((col, idx) => {
                  const isLast = idx === activeColumns.slice(1).length - 1;
                  const borderClasses = isLast ? '' : 'border-r border-gray-400';
                  if (col.key === 'estCreationTime') {
                    return (
                      <div key={col.key} className={`flex items-center justify-start space-x-2 font-semibold px-2 ${borderClasses}`}>
                        <div className="w-4 flex justify-center"> <NewClockIcon color={iconBaseColor} className="w-4 h-4"/> </div>
                        {isEditing && onTextChange ? (
                            <input
                              type="number" step="0.1"
                              value={section.totalHours === null || section.totalHours === undefined ? '' : section.totalHours}
                              onChange={(e) => handleNumericInputChange(
                                  ['sections', sectionIdx, 'totalHours'], e,
                                  ['sections', sectionIdx, 'autoCalculateHours']
                              )}
                              className={`${editingInputSmallClass} w-16 text-right`}
                              placeholder="Hrs"
                              title={section.autoCalculateHours ? "Auto-calculated. Editing sets to manual." : "Manual hours"}
                            />
                        ) : (
                          <span style={{ color: iconBaseColor }} className="flex-grow text-left">
                            {formatHoursDisplay(section.totalHours, lang, localized, false)}
                          </span>
                        )}
                      </div>
                    );
                  }
                  if (col.key === 'estCompletionTime') {
                    return (
                      <div key={col.key} className={`flex items-center justify-start space-x-2 font-semibold px-2 ${borderClasses}`}>
                        <div className="w-4 flex justify-center"> <NewClockIcon color={iconBaseColor} className="w-4 h-4"/> </div>
                        <span style={{ color: iconBaseColor }} className="flex-grow text-left">{calculateTotalCompletionTime(section)}</span>
                      </div>
                    );
                  }
                  // other columns not used in section header => render empty cell to keep alignment
                  return <div key={col.key} className={`px-2 ${borderClasses}`}></div>;
                })}
              </div>
              {(section.lessons || []).map((lesson: LessonType, lessonIndex: number) => {
                lessonCounter++;
                const currentLessonNumber = lessonCounter;
                const matchingMicroproduct = findMicroproductByTitle(lesson.title, parentProjectName, allUserMicroproducts);

                return (
                  <div
                    key={lesson.id || `lesson-${sectionIdx}-${lessonIndex}`}
                    className="p-4 items-center border-t border-gray-300 hover:bg-gray-50 transition-colors duration-150 min-h-[50px]"
                    style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
                  >
                    {/* Module + Lesson title column */}
                    <div className={`text-gray-800 pr-2 ${activeColumns.length > 1 ? 'border-r border-gray-400' : ''}`}> 
                      {isEditing && onTextChange ? (
                        <input type="text" value={lesson.title} onChange={(e) => handleGenericInputChange(['sections', sectionIdx, 'lessons', lessonIndex, 'title'], e)} className={editingInputClass} placeholder="Lesson Title"/>
                      ) : (
                        <button
                          onClick={() => handleLessonClick(lesson, section.title, currentLessonNumber)}
                          className="text-left text-gray-700 hover:text-blue-600 hover:underline focus:outline-none"
                        >
                          {lesson.title}
                        </button>
                      )}
                    </div>
                    {/* Other dynamic columns */}
                    {activeColumns.slice(1).map((col, idx) => {
                      const isLast = idx === activeColumns.slice(1).length - 1;
                      const borderClasses = isLast ? '' : 'border-r border-gray-400';
                      const commonCls = `px-2 ${borderClasses}`;
                      switch (col.key) {
                        case 'knowledgeCheck':
                          return (
                            <div key={col.key} className={`flex justify-start ${commonCls}`}>
                              <StatusBadge type={lesson.check.type} text={lesson.check.text} columnContext="check" isEditing={isEditing} onTextChange={onTextChange} path={['sections', sectionIdx, 'lessons', lessonIndex, 'check', 'text']} iconColor={iconBaseColor}/>
                            </div>
                          );
                        case 'contentAvailability':
                          return (
                            <div key={col.key} className={`flex justify-start ${commonCls}`}>
                              <StatusBadge type={lesson.contentAvailable.type} text={lesson.contentAvailable.text} columnContext="contentAvailable" isEditing={isEditing} onTextChange={onTextChange} path={['sections', sectionIdx, 'lessons', lessonIndex, 'contentAvailable', 'text']} iconColor={iconBaseColor}/>
                            </div>
                          );
                        case 'informationSource':
                          return (
                            <div key={col.key} className={`text-gray-600 ${commonCls}`}>
                              {isEditing && onTextChange ? (
                                <input type="text" value={lesson.source} onChange={(e) => handleGenericInputChange(['sections', sectionIdx, 'lessons', lessonIndex, 'source'], e)} className={editingInputSmallClass} placeholder="Source"/>
                              ) : (
                                <span title={lesson.source || ''}>{truncateText(lesson.source, MAX_SOURCE_LENGTH)}</span>
                              )}
                            </div>
                          );
                        case 'estCreationTime':
                          return (
                            <div key={col.key} className={`flex items-center justify-start space-x-2 text-gray-500 px-2 ${borderClasses}`}>
                              <div className="w-4 flex justify-center"> <NewClockIcon color={iconBaseColor} className="w-4 h-4" /> </div>
                              {isEditing && onTextChange ? (
                                <input type="number" step="0.1" value={lesson.hours || 0} onChange={(e) => handleNumericInputChange(['sections', sectionIdx, 'lessons', lessonIndex, 'hours'], e)} className={`${editingInputSmallClass} w-16 text-right`} placeholder="Hrs"/>
                              ) : ( <span className="flex-grow text-left">{formatHoursDisplay(lesson.hours, lang, localized, false)}</span> )}
                            </div>
                          );
                        case 'estCompletionTime':
                          return (
                            <div key={col.key} className={`flex items-center justify-start space-x-2 text-gray-500 px-2 ${borderClasses}`}>
                              <div className="w-4 flex justify-center"> <NewClockIcon color={iconBaseColor} className="w-4 h-4" /> </div>
                              {isEditing && onTextChange ? (
                                <input 
                                  type="text" 
                                  value={lesson.completionTime || ''} 
                                  onChange={(e) => handleGenericInputChange(['sections', sectionIdx, 'lessons', lessonIndex, 'completionTime'], e)} 
                                  className={`${editingInputSmallClass} w-16 text-right`} 
                                  placeholder="5m"
                                />
                              ) : (
                                <span className="flex-grow text-left">{formatCompletionTimeDisplay(lesson.completionTime, lang)}</span>
                              )}
                            </div>
                          );
                        default:
                          return <div key={col.key} className={commonCls}></div>;
                      }
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TrainingPlanTable;
