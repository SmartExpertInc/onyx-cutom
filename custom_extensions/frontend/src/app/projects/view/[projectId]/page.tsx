// custom_extensions/frontend/src/app/projects/view/[projectId]/page.tsx
"use client";

import React, { Suspense, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ProjectInstanceDetail,
  MicroProductContentData,
  TrainingPlanData,
  PdfLessonData,
  QuizData,
  TextPresentationData,
} from '@/types/projectSpecificTypes';
import { VideoLessonData } from '@/types/videoLessonTypes';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { ProjectListItem } from '@/types/products';
import TrainingPlanTableComponent from '@/components/TrainingPlanTable';
import PdfLessonDisplayComponent from '@/components/PdfLessonDisplay';
import EditorPage from '@/components/EditorPage';
import VideoLessonDisplay from '@/components/VideoLessonDisplay';
import QuizDisplay from '@/components/QuizDisplay';
import TextPresentationDisplay from '@/components/TextPresentationDisplay';
import SmartPromptEditor from '@/components/SmartPromptEditor';
import { useLanguage } from '../../../../contexts/LanguageContext';

import { Save, Edit, ArrowDownToLine, Info, AlertTriangle, ArrowLeft, FolderOpen, Trash2, ChevronDown, Sparkles, Download, Palette } from 'lucide-react';
import { SmartSlideDeckViewer } from '@/components/SmartSlideDeckViewer';
import { ThemePicker } from '@/components/theme/ThemePicker';
import { useTheme } from '@/hooks/useTheme';
import { createPortal } from 'react-dom';

// Localization config for column labels based on product language
const columnLabelLocalization = {
  ru: {
    assessmentType: "Тип оценки",
    contentVolume: "Объем контента", 
    source: "Источник",
    estCreationTime: "Оц. время создания",
    estCompletionTime: "Оц. время завершения",
    qualityTier: "Уровень качества"
  },
  uk: {
    assessmentType: "Тип оцінки",
    contentVolume: "Обсяг контенту",
    source: "Джерело", 
    estCreationTime: "Оц. час створення",
    estCompletionTime: "Оц. час завершення",
    qualityTier: "Рівень якості"
  },
  es: {
    assessmentType: "Tipo de evaluación",
    contentVolume: "Volumen de contenido",
    source: "Fuente",
    estCreationTime: "Tiempo Est. Creación", 
    estCompletionTime: "Tiempo Est. Finalización",
    qualityTier: "Nivel de Calidad"
  },
  en: {
    assessmentType: "Assessment Type",
    contentVolume: "Content Volume",
    source: "Source",
    estCreationTime: "Est. Creation Time",
    estCompletionTime: "Est. Completion Time", 
    qualityTier: "Quality Tier"
  }
};

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

// Component Name Constants
const COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable";
const COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay";
const COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay";
const COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay";
const COMPONENT_NAME_VIDEO_LESSON_PRESENTATION = "VideoLessonPresentationDisplay";
const COMPONENT_NAME_QUIZ = "QuizDisplay";
const COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay";

type ProjectViewParams = {
  projectId: string;
};

const slugify = (text: string | null | undefined): string => {
  if (!text) return "document";
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// PDF Export Loading Modal Component
const PdfExportLoadingModal: React.FC<{
  isOpen: boolean;
  projectName: string;
}> = ({ isOpen, projectName }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center max-w-md mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('actions.generatingPdf', 'Generating PDF')}</h3>
        <p className="text-gray-600 text-center mb-4">
          {t('actions.creatingPresentationPdfExport', 'Creating PDF export for presentation')} <span className="font-semibold text-blue-600">"{projectName}"</span>
        </p>
        <p className="text-sm text-gray-500 text-center">
          {t('modals.pdfExport.description', 'This may take a few moments depending on the presentation size...')}
        </p>
      </div>
    </div>,
    document.body
  );
};


export default function ProjectInstanceViewPage() {
  const params = useParams<ProjectViewParams>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projectId } = params || {};
  const { t } = useLanguage();

  const [projectInstanceData, setProjectInstanceData] = useState<ProjectInstanceDetail | null>(null);
  const [allUserMicroproducts, setAllUserMicroproducts] = useState<ProjectListItem[] | undefined>(undefined);
  const [parentProjectNameForCurrentView, setParentProjectNameForCurrentView] = useState<string | undefined>(undefined);

  const [pageState, setPageState] = useState<'initial_loading' | 'fetching' | 'error' | 'success' | 'nodata'>('initial_loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<MicroProductContentData>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    knowledgeCheck: true,
    contentAvailability: true,
    informationSource: true,
    estCreationTime: true,
    estCompletionTime: true,
    qualityTier: false, // Hidden by default
  });
    const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfDownloadCount, setPdfDownloadCount] = useState(0);
   
  // Smart editing state
  const [showSmartEditor, setShowSmartEditor] = useState(false);
  

  
  // State for the absolute chat URL
  const [chatRedirectUrl, setChatRedirectUrl] = useState<string | null>(null);

  /* --- Persist column visibility (displayOptions) once after creation --- */
  const [displayOptsSynced, setDisplayOptsSynced] = useState(false);

  // Column visibility controls for Training Plan table
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  // Theme picker state for slide decks
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showColumnDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target as Node)) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnDropdown]);

  const handleColumnVisibilityChange = (column: string, checked: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: checked
    }));
  };

  const fetchPageData = useCallback(async (currentProjectIdStr: string) => {
    setPageState('fetching');
    setErrorMessage(null);
    setProjectInstanceData(null);
    setAllUserMicroproducts(undefined);
    setParentProjectNameForCurrentView(undefined);
    setEditableData(null);
    setIsEditing(false);
    setSaveError(null);

    const currentProjectIdNum = parseInt(currentProjectIdStr, 10);
    if (isNaN(currentProjectIdNum)) {
      setErrorMessage(t('interface.projectView.invalidProjectIdFormat', 'Invalid Project ID format.'));
      setPageState('error');
      return;
    }

    const commonHeaders: HeadersInit = {};
    const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
    if (devUserId && process.env.NODE_ENV === 'development') {
      commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
    }

    try {
      const instanceApiUrl = `${CUSTOM_BACKEND_URL}/projects/view/${currentProjectIdStr}`;
      const instanceResPromise = fetch(instanceApiUrl, { cache: 'no-store', headers: commonHeaders });
      const listApiUrl = `${CUSTOM_BACKEND_URL}/projects`;
      const listResPromise = fetch(listApiUrl, { cache: 'no-store', headers: commonHeaders });

      const [instanceRes, listRes] = await Promise.all([instanceResPromise, listResPromise]);

      if (!instanceRes.ok) {
        const errorText = await instanceRes.text();
        let errorDetail = `HTTP error ${instanceRes.status} fetching project instance (ID: ${currentProjectIdStr})`;
        try { const errorJson = JSON.parse(errorText); errorDetail = errorJson.detail || errorDetail; }
        catch { errorDetail = `${errorDetail} - ${errorText.substring(0, 150)}`; }
        throw new Error(errorDetail);
      }
      const instanceData: ProjectInstanceDetail = await instanceRes.json();
      
      // 🔍 FETCH DATA LOGGING: What we got back from backend
      console.log('📥 [FETCH DATA] Received from backend:', {
        instanceData,
        instanceDataStringified: JSON.stringify(instanceData, null, 2),
        details: instanceData.details,
        detailsStringified: JSON.stringify(instanceData.details, null, 2),
        componentName: instanceData.component_name,
        hasDetails: !!instanceData.details
      });
      
      setProjectInstanceData(instanceData);
      
      if (typeof window !== 'undefined' && instanceData.sourceChatSessionId) {
        setChatRedirectUrl(`${window.location.origin}/chat?chatId=${instanceData.sourceChatSessionId}`);
      }

      if (listRes.ok) {
        const allMicroproductsData: ProjectListItem[] = await listRes.json();
        setAllUserMicroproducts(allMicroproductsData);
        const currentMicroproductInList = allMicroproductsData.find(mp => mp.id === instanceData.project_id);
        setParentProjectNameForCurrentView(currentMicroproductInList?.projectName);
      } else {
          console.warn(t('interface.projectView.couldNotFetchFullProjectsList', 'Could not fetch full projects list to determine parent project name.'));
      }

      if (instanceData.details) {
        const copiedDetails = JSON.parse(JSON.stringify(instanceData.details));
        if (instanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
          // Normalize completionTime for all lessons
          if (copiedDetails.sections) {
            copiedDetails.sections.forEach((section: any) => {
              if (section.lessons) {
                section.lessons.forEach((lesson: any) => {
                  if (!lesson.completionTime) lesson.completionTime = '5m';
                });
              }
            });
          }
          setEditableData(copiedDetails as TrainingPlanData);
        } else if (instanceData.component_name === COMPONENT_NAME_PDF_LESSON) {
          setEditableData(copiedDetails as PdfLessonData);
        } else if (instanceData.component_name === COMPONENT_NAME_SLIDE_DECK) {
          setEditableData(copiedDetails as ComponentBasedSlideDeck);
        } else if (instanceData.component_name === COMPONENT_NAME_VIDEO_LESSON) {
          setEditableData(copiedDetails as VideoLessonData);
        } else if (instanceData.component_name === COMPONENT_NAME_QUIZ) {
          setEditableData(copiedDetails as QuizData);
        } else if (instanceData.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
          console.log('📥 [TEXT PRESENTATION DATA] Setting editableData from backend details:', {
            copiedDetails,
            copiedDetailsStringified: JSON.stringify(copiedDetails, null, 2),
            contentBlocks: copiedDetails.contentBlocks,
            contentBlocksStringified: JSON.stringify(copiedDetails.contentBlocks, null, 2),
            imageBlocksFromBackend: Array.isArray(copiedDetails.contentBlocks) 
              ? copiedDetails.contentBlocks.filter((block: any) => block.type === 'image').map((block: any, index: number) => ({
                  index,
                  block,
                  blockStringified: JSON.stringify(block, null, 2),
                  blockKeys: Object.keys(block),
                  isValid: !!(block.src && typeof block.src === 'string'),
                  hasCorruptProps: 'style' in block
                }))
              : 'No content blocks or not array'
          });
          setEditableData(copiedDetails as TextPresentationData);
        } else {
          setEditableData(copiedDetails); 
        }
      } else {
        const lang = instanceData.detectedLanguage || 'en'; 
        if (instanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
          setEditableData({ mainTitle: instanceData.name || t('interface.projectView.newTrainingPlanTitle', 'New Training Plan'), sections: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_PDF_LESSON) {
          setEditableData({ lessonTitle: instanceData.name || t('interface.projectView.newPdfLessonTitle', 'New PDF Lesson'), contentBlocks: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_SLIDE_DECK) {
          setEditableData({ lessonTitle: instanceData.name || t('interface.projectView.newSlideDeckTitle', 'New Slide Deck'), slides: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_VIDEO_LESSON) {
          setEditableData({ mainPresentationTitle: instanceData.name || t('interface.projectView.newVideoLessonTitle', 'New Video Lesson'), slides: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_QUIZ) {
          setEditableData({ quizTitle: instanceData.name || t('interface.projectView.newQuizTitle', 'New Quiz'), questions: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
          setEditableData({ textTitle: instanceData.name || t('interface.projectView.newTextPresentationTitle', 'New Text Presentation'), contentBlocks: [], detectedLanguage: lang });
        } else {
          setEditableData(null);
        }
      }
      setPageState(instanceData ? 'success' : 'nodata');
    } catch (err: any) {
      console.error("Fetch Page Data Error:", err);
      setErrorMessage(err.message || t('interface.projectView.unknownErrorOccurred', 'An unknown error occurred while fetching project data.'));
      setPageState('error');
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      const needsFetch = pageState === 'initial_loading' ||
        (projectInstanceData && projectInstanceData.project_id?.toString() !== projectId) ||
        (!projectInstanceData && (pageState === 'error' || pageState === 'nodata'));

      if (needsFetch) {
        fetchPageData(projectId);
      }
    } else if (params && Object.keys(params).length > 0 && !projectId) {
      setErrorMessage(t('interface.projectView.projectIdMissing', 'Project ID is missing in URL.'));
      setPageState('error');
    }
  }, [projectId, params, fetchPageData, pageState, projectInstanceData]);

  useEffect(() => {
    if (displayOptsSynced) return;
    if (!projectId || !editableData || !projectInstanceData) return;
    if (projectInstanceData.component_name !== COMPONENT_NAME_TRAINING_PLAN) return;

    const paramVal = (key: string): string | null => searchParams?.get(key) ?? null;

    const hasExplicitParams = ["knowledgeCheck","contentAvailability","informationSource","estCreationTime","estCompletionTime"].some(k => paramVal(k) !== null);
    if (!hasExplicitParams) return; // nothing to persist

    const desired = {
      knowledgeCheck: paramVal("knowledgeCheck") === "0" ? false : true,
      contentAvailability: paramVal("contentAvailability") === "0" ? false : true,
      informationSource: paramVal("informationSource") === "0" ? false : true,
      estCreationTime: paramVal("estCreationTime") === "0" ? false : true,
      estCompletionTime: paramVal("estCompletionTime") === "0" ? false : true,
    } as const;

    // @ts-ignore – runtime check only
    const currentStored = (editableData as any)?.displayOptions || {};

    if (JSON.stringify(currentStored) === JSON.stringify(desired)) {
      setDisplayOptsSynced(true);
      return;
    }

    const mergedContent = { ...(editableData as any), displayOptions: desired };

    const saveOpts = async () => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = typeof window !== 'undefined' ? sessionStorage.getItem('dev_user_id') : null;
      if (devUserId && process.env.NODE_ENV === 'development') headers['X-Dev-Onyx-User-ID'] = devUserId;

      try {
        await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ microProductContent: mergedContent }),
        });
        setDisplayOptsSynced(true);
      } catch (e) {
        console.warn('Could not persist displayOptions', e);
      }
    };

    saveOpts();
  }, [displayOptsSynced, projectId, editableData, projectInstanceData, searchParams]);

  const handleTextChange = useCallback((path: (string | number)[], newValue: any) => {
    console.log('🔄 [HANDLE TEXT CHANGE] Called with:', { 
      path, 
      newValueType: typeof newValue,
      newValueLength: Array.isArray(newValue) ? newValue.length : 'N/A',
      currentEditableData: editableData 
    });

    // 🔍 DETAILED ANALYSIS: If this is updating contentBlocks
    if (path.length === 1 && path[0] === 'contentBlocks' && Array.isArray(newValue)) {
      console.log('🔄 [CONTENT BLOCKS UPDATE] Detailed analysis:', {
        totalBlocks: newValue.length,
        blockTypes: newValue.map((block, index) => ({ index, type: block.type })),
        imageBlocks: newValue.filter(block => block.type === 'image').map((block, index) => ({
          arrayIndex: newValue.indexOf(block),
          block,
          blockStringified: JSON.stringify(block, null, 2),
          blockKeys: Object.keys(block),
          isValidImageBlock: !!(block.src && typeof block.src === 'string' && block.src.startsWith('/static_design_images/')),
          hasCorruptProperties: 'style' in block
        })),
        fullNewValueStringified: JSON.stringify(newValue, null, 2)
      });
    }

    setEditableData(currentData => {
      if (currentData === null || currentData === undefined) {
        console.warn("Attempted to update null or undefined editableData at path:", path);
        return null;
      }

      console.log('🔄 [BEFORE UPDATE] Current editableData:', {
        currentDataStringified: JSON.stringify(currentData, null, 2),
        currentContentBlocks: (currentData as any)?.contentBlocks || 'No contentBlocks'
      });

      const newData = JSON.parse(JSON.stringify(currentData));
      let target: any = newData;

      try {
        for (let i = 0; i < path.length - 1; i++) {
          const segment = path[i];
          if (target[segment] === undefined || target[segment] === null) {
            target[segment] = (typeof path[i + 1] === 'number') ? [] : {};
          }
          target = target[segment];
        }

        const finalKey = path[path.length - 1];
        if (typeof target === 'object' && target !== null && (typeof finalKey === 'string' || typeof finalKey === 'number')) {
          target[finalKey] = newValue;
        } else if (Array.isArray(target) && typeof finalKey === 'number') {
          if (finalKey <= target.length) {
              target[finalKey] = newValue;
          } else {
            console.warn("Index out of bounds for array update at path:", path, "Target length:", target.length, "Index:", finalKey);
            return currentData;
          }
        } else {
          console.warn(`Cannot set value at path: ${path.join('.')}. Final key '${finalKey}' not valid for target type '${typeof target}'`);
          return currentData;
        }
      } catch (e: any) {
        console.error("Error updating editableData at path:", path, e.message);
        return currentData;
      }
      
      console.log('🔄 [AFTER UPDATE] Updated data:', {
        newDataStringified: JSON.stringify(newData, null, 2),
        updatedContentBlocks: (newData as any)?.contentBlocks || 'No contentBlocks',
        imageBlocksInResult: Array.isArray((newData as any)?.contentBlocks) 
          ? (newData as any).contentBlocks.filter((block: any) => block.type === 'image').map((block: any, index: number) => ({
              index,
              block,
              blockStringified: JSON.stringify(block, null, 2),
              isValid: !!(block.src && typeof block.src === 'string')
            }))
          : 'Not an array'
      });
      
      return newData;
    });
  }, [editableData]);

  // Handler for SmartPromptEditor content updates
  const handleSmartEditContentUpdate = useCallback((updatedContent: any) => {
    setEditableData(updatedContent);
    // Note: Don't refetch from server here since with confirmation flow,
    // changes are only saved after user explicitly confirms them
  }, []);

  // Handler for SmartPromptEditor errors
  const handleSmartEditError = useCallback((error: string) => {
    setSaveError(error);
  }, []);

  // Handler for SmartPromptEditor revert
  const handleSmartEditRevert = useCallback(() => {
    // Refetch the original data from the server to restore the original content
    if (projectId) {
      fetchPageData(projectId);
    }
  }, [projectId, fetchPageData]);

  const handleSave = async () => {
    if (!projectId || !editableData) {
      setSaveError(t('interface.projectView.projectIdOrEditableDataMissing', 'Project ID or editable data is missing.'));
      alert(t('interface.projectView.errorProjectIdOrDataMissing', 'Error: Project ID or data is missing.'));
      return;
    }
    if (!projectInstanceData) {
      setSaveError(t('interface.projectView.projectInstanceDataNotLoaded', 'Project instance data not loaded.'));
      alert(t('interface.projectView.errorProjectInstanceDataNotLoaded', 'Error: Project instance data not loaded.'));
      return;
    }
    const editableComponentTypes = [
      COMPONENT_NAME_PDF_LESSON,
      COMPONENT_NAME_TRAINING_PLAN,
      COMPONENT_NAME_SLIDE_DECK,
      COMPONENT_NAME_VIDEO_LESSON,
      COMPONENT_NAME_QUIZ,
      COMPONENT_NAME_TEXT_PRESENTATION,
    ];
    if (!editableComponentTypes.includes(projectInstanceData.component_name)) {
      setSaveError(t('interface.projectView.contentEditingNotSupported', 'Content editing is not supported for this component type on this page.'));
      alert(t('interface.projectView.errorCannotSave', 'Error: Cannot save. Content editing for this component type is not supported here.'));
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const saveOperationHeaders: HeadersInit = { 'Content-Type': 'application/json' };
    const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
    if (devUserId && process.env.NODE_ENV === 'development') {
      saveOperationHeaders['X-Dev-Onyx-User-ID'] = devUserId;
    }

    try {
      // Apply same validation as auto-save for slide decks
      let processedEditableData = editableData;
      if (projectInstanceData.component_name === COMPONENT_NAME_SLIDE_DECK && editableData) {
        const slideDeckData = editableData as ComponentBasedSlideDeck;
        processedEditableData = JSON.parse(JSON.stringify(slideDeckData)); // Deep clone
        
        // Apply same validation as auto-save - with proper type checking
        const processedSlideDeck = processedEditableData as ComponentBasedSlideDeck;
        if (processedSlideDeck.slides && Array.isArray(processedSlideDeck.slides)) {
          processedSlideDeck.slides.forEach((slide: any, index: number) => {
            if (!slide.slideId) {
              slide.slideId = `slide-${Date.now()}-${index}`;
            }
            if (!slide.templateId) {
              slide.templateId = 'content-slide';
            }
            if (!slide.props) {
              slide.props = {};
            }
            if (!slide.props.title) {
              slide.props.title = `Slide ${index + 1}`;
            }
            if (!slide.props.content) {
              slide.props.content = '';
            }
            // 🔑 CRITICAL: Ensure slideTitle exists for backend compatibility
            if (!slide.slideTitle) {
              slide.slideTitle = slide.props.title || `Slide ${index + 1}`;
              console.log(`🔧 Save: Added missing slideTitle "${slide.slideTitle}" to slide ${slide.slideId}`);
            }
            if (!slide.slideNumber) {
              slide.slideNumber = index + 1;
            }
          });
        }
      }
      
      const payload = { microProductContent: processedEditableData };
      
      // 🔍 CRITICAL SAVE LOGGING: What we're sending to backend
      console.log('💾 [SAVE OPERATION] Sending to backend:', {
        payload,
        payloadStringified: JSON.stringify(payload, null, 2),
        editableData,
        editableDataStringified: JSON.stringify(editableData, null, 2),
        imageBlocksBeforeSave: Array.isArray((editableData as any)?.contentBlocks) 
          ? (editableData as any).contentBlocks.filter((block: any) => block.type === 'image').map((block: any, index: number) => ({
              index,
              block,
              blockStringified: JSON.stringify(block, null, 2),
              blockKeys: Object.keys(block),
              isValid: !!(block.src && typeof block.src === 'string'),
              hasCorruptProps: 'style' in block
            }))
          : 'No content blocks or not array'
      });
      
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
        method: 'PUT', headers: saveOperationHeaders, body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorDataText = await response.text();
        let errorDetail = `HTTP error ${response.status}`;
        try { 
          const errorJson = JSON.parse(errorDataText); 
          if (errorJson.detail) {
            // Handle Pydantic validation errors (array of objects) vs regular string errors
            if (Array.isArray(errorJson.detail)) {
              // Format validation errors nicely
              const validationErrors = errorJson.detail.map((err: any) => {
                const location = err.loc ? err.loc.join('.') : 'unknown';
                return `${location}: ${err.msg || t('interface.projectView.validationError', 'Validation error')}`;
              }).join('; ');
              errorDetail = `${t('interface.projectView.validationErrors', 'Validation errors')}: ${validationErrors}`;
            } else {
              errorDetail = errorJson.detail;
            }
          }
        }
        catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }
      console.log('💾 [SAVE SUCCESS] Save completed, refetching data...');
      setIsEditing(false);
      await fetchPageData(projectId);
      console.log('💾 [SAVE COMPLETE] Data refetched after save');
      alert(t('interface.projectView.contentSavedSuccessfully', 'Content saved successfully!'));
    } catch (err: any) {
      setSaveError(err.message || t('interface.projectView.couldNotSaveData', 'Could not save data.'));
      alert(`${t('interface.projectView.saveFailed', 'Save failed')}: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save function that doesn't refresh the page or show alerts
  const handleAutoSave = async () => {
    console.log('Auto-save triggered'); // Debug log
    if (!projectId || !editableData || !projectInstanceData) {
      console.log('Auto-save: Missing required data', { projectId, hasEditableData: !!editableData, hasProjectInstance: !!projectInstanceData });
      return; // Silent fail for auto-save
    }
    
    const editableComponentTypes = [
      COMPONENT_NAME_PDF_LESSON,
      COMPONENT_NAME_TRAINING_PLAN,
      COMPONENT_NAME_SLIDE_DECK,
      COMPONENT_NAME_VIDEO_LESSON,
      COMPONENT_NAME_QUIZ,
      COMPONENT_NAME_TEXT_PRESENTATION,
    ];
    if (!editableComponentTypes.includes(projectInstanceData.component_name)) {
      console.log('Auto-save: Unsupported component type', projectInstanceData.component_name);
      return; // Silent fail for unsupported types
    }

    const saveOperationHeaders: HeadersInit = { 'Content-Type': 'application/json' };
    const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
    if (devUserId && process.env.NODE_ENV === 'development') {
      saveOperationHeaders['X-Dev-Onyx-User-ID'] = devUserId;
    }

    try {
      const payload = { microProductContent: editableData };
      console.log('Auto-save: Payload being sent:', JSON.stringify(payload, null, 2));
      
      // Only do detailed validation for TrainingPlanData
      if (projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
        const trainingPlanData = editableData as TrainingPlanData;
        console.log('Auto-save: Data validation check:', {
          hasMainTitle: !!trainingPlanData.mainTitle,
          hasSections: !!trainingPlanData.sections,
          sectionsLength: trainingPlanData.sections?.length || 0,
          hasDetectedLanguage: !!trainingPlanData.detectedLanguage,
          sectionsStructure: trainingPlanData.sections?.map(section => ({
            hasId: !!section.id,
            hasTitle: !!section.title,
            hasLessons: !!section.lessons,
            lessonsLength: section.lessons?.length || 0,
            lessonsStructure: section.lessons?.map(lesson => ({
              hasTitle: !!lesson.title,
              hasCheck: !!lesson.check,
              hasContentAvailable: !!lesson.contentAvailable,
              hasSource: !!lesson.source,
              hasHours: typeof lesson.hours === 'number',
              hasCompletionTime: !!lesson.completionTime
            }))
          }))
        });
        
        // Validate and fix data structure before sending
        if (trainingPlanData.sections) {
          trainingPlanData.sections.forEach(section => {
            if (section.lessons) {
              section.lessons.forEach(lesson => {
                // Ensure hours is always a number
                if (typeof lesson.hours !== 'number') {
                  lesson.hours = 0;
                }
                // Ensure check and contentAvailable objects exist
                if (!lesson.check) {
                  lesson.check = { type: 'unknown', text: '' };
                }
                if (!lesson.contentAvailable) {
                  lesson.contentAvailable = { type: 'unknown', text: '' };
                }
                // Ensure source is a string
                if (typeof lesson.source !== 'string') {
                  lesson.source = '';
                }
                // Ensure completionTime is a string
                if (typeof lesson.completionTime !== 'string') {
                  lesson.completionTime = '5m';
                }
              });
            }
          });
        }
      }
      
      // Add validation for Slide Deck data
      if (projectInstanceData.component_name === COMPONENT_NAME_SLIDE_DECK) {
        const slideDeckData = editableData as ComponentBasedSlideDeck;
        console.log('Auto-save: Slide deck validation check:', {
          hasLessonTitle: !!slideDeckData.lessonTitle,
          hasSlides: !!slideDeckData.slides,
          slidesLength: slideDeckData.slides?.length || 0,
          hasTheme: !!slideDeckData.theme,
          slidesStructure: slideDeckData.slides?.map(slide => ({
            hasSlideId: !!slide.slideId,
            hasTemplateId: !!slide.templateId,
            hasProps: !!slide.props,
            propsKeys: slide.props ? Object.keys(slide.props) : []
          }))
        });
        
        // Validate and fix slide deck structure before sending - IMPROVED FOR BACKEND COMPATIBILITY
        if (slideDeckData.slides) {
          slideDeckData.slides.forEach((slide: any, index) => {
            // Ensure slide has required properties
            if (!slide.slideId) {
              slide.slideId = `slide-${Date.now()}-${index}`;
            }
            if (!slide.templateId) {
              slide.templateId = 'content-slide';
            }
            if (!slide.props) {
              slide.props = {};
            }
            
            // Ensure props have required fields
            if (!slide.props.title) {
              slide.props.title = `Slide ${index + 1}`;
            }
            if (!slide.props.content) {
              slide.props.content = '';
            }
            
            // 🔑 CRITICAL: Ensure slideTitle exists for backend compatibility
            if (!slide.slideTitle) {
              slide.slideTitle = slide.props.title || `Slide ${index + 1}`;
              console.log(`🔧 Auto-save: Added missing slideTitle "${slide.slideTitle}" to slide ${slide.slideId}`);
            }
            
            // Ensure slideNumber is set
            if (!slide.slideNumber) {
              slide.slideNumber = index + 1;
            }
          });
        }
      }
      
      console.log('🔍 Auto-save: Sending request to', `${CUSTOM_BACKEND_URL}/projects/update/${projectId}`);
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
        method: 'PUT', headers: saveOperationHeaders, body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error('🔍 Auto-save failed:', response.status);
        const errorText = await response.text();
        console.error('🔍 Auto-save error details:', errorText);
        
        // Try to parse error details for better debugging
        try {
          const errorJson = JSON.parse(errorText);
          console.error('🔍 Auto-save parsed error:', errorJson);
          if (errorJson.detail) {
            console.error('🔍 Auto-save validation errors:', errorJson.detail);
          }
        } catch (e) {
          console.error('🔍 Could not parse error response as JSON');
        }
      } else {
        console.log('🔍 Auto-save successful');
        const responseData = await response.json();
        console.log('🔍 Auto-save response data:', JSON.stringify(responseData, null, 2));
        
        // Check if the response data matches what we sent
        if (projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
          const trainingPlanData = editableData as TrainingPlanData;
          console.log('🔍 Auto-save: Training plan data comparison:', {
            sentMainTitle: trainingPlanData.mainTitle,
            receivedMainTitle: responseData.microproduct_content?.mainTitle,
            sentSectionsCount: trainingPlanData.sections?.length || 0,
            receivedSectionsCount: responseData.microproduct_content?.sections?.length || 0,
            dataMatches: JSON.stringify(trainingPlanData) === JSON.stringify(responseData.microproduct_content)
          });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_SLIDE_DECK) {
          const slideDeckData = editableData as ComponentBasedSlideDeck;
          console.log('🔍 Auto-save: Slide deck data comparison:', {
            sentLessonTitle: slideDeckData.lessonTitle,
            receivedLessonTitle: responseData.microproduct_content?.lessonTitle,
            sentSlidesCount: slideDeckData.slides?.length || 0,
            receivedSlidesCount: responseData.microproduct_content?.slides?.length || 0,
            dataMatches: JSON.stringify(slideDeckData) === JSON.stringify(responseData.microproduct_content)
          });
        }
      }
      // Don't refresh page or show alerts for auto-save
    } catch (err: any) {
      console.error('🔍 Auto-save error:', err.message);
    }
  };

  const handlePdfDownload = async () => {
    console.log('🔍 handlePdfDownload called');
    console.log('🔍 projectInstanceData:', projectInstanceData);
    console.log('🔍 projectId:', projectId);
    console.log('🔍 pdfDownloadCount:', pdfDownloadCount);
    
    if (!projectInstanceData || typeof projectInstanceData.project_id !== 'number') {
        console.error('🔍 Error: Project data or ID not available');
        alert(t('interface.projectView.projectDataOrIdNotAvailableForDownload', 'Project data or ID is not available for download.'));
        return;
    }
    
    // Increment download count
    const newCount = pdfDownloadCount + 1;
    setPdfDownloadCount(newCount);
    
    // First click: download PDF
    if (newCount === 1) {
        console.log('🔍 First click: Downloading PDF...');
        
        // Special handling for slide decks and video lesson presentations  
        if (projectInstanceData.component_name === COMPONENT_NAME_SLIDE_DECK || 
            projectInstanceData.component_name === COMPONENT_NAME_VIDEO_LESSON_PRESENTATION) {
            const slideDeckData = editableData as ComponentBasedSlideDeck;
            const theme = slideDeckData?.theme || 'dark-purple';
            
            // Show loading modal
            setIsExportingPdf(true);
            
            try {
                const response = await fetch(`${CUSTOM_BACKEND_URL}/pdf/slide-deck/${projectInstanceData.project_id}?theme=${theme}`, {
                    method: 'GET',
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    throw new Error(`PDF generation failed: ${response.status}`);
                }

                // Get the blob from the response
                const blob = await response.blob();
                
                // Create a download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectInstanceData.name || 'presentation'}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert(t('interface.projectView.pdfGenerationError', 'Failed to generate PDF. Please try again.'));
            } finally {
                // Hide loading modal
                setIsExportingPdf(false);
            }
            return;
        }
        
        // Original PDF download logic for other component types
        const nameForSlug = projectInstanceData.name || 'document';
        const docNameSlug = slugify(nameForSlug);
        const pdfProjectId = projectInstanceData.project_id;

        const parentProjectName = searchParams?.get('parentProjectName');
        const lessonNumber = searchParams?.get('lessonNumber');

        let pdfUrl = `${CUSTOM_BACKEND_URL}/pdf/${pdfProjectId}/${docNameSlug}`;
        
        const queryParams = new URLSearchParams();
        if (parentProjectName) {
            queryParams.append('parentProjectName', parentProjectName);
        }
        const details = projectInstanceData.details;
        if (details && 'lessonNumber' in details && typeof details.lessonNumber === 'number') {
           queryParams.append('lessonNumber', details.lessonNumber.toString());
        }
        
        // Add column visibility settings for Training Plan PDFs
        if (projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
            queryParams.append('knowledgeCheck', columnVisibility.knowledgeCheck ? '1' : '0');
            queryParams.append('contentAvailability', columnVisibility.contentAvailability ? '1' : '0');
            queryParams.append('informationSource', columnVisibility.informationSource ? '1' : '0');
            queryParams.append('estCreationTime', columnVisibility.estCreationTime ? '1' : '0');
            queryParams.append('estCompletionTime', columnVisibility.estCompletionTime ? '1' : '0');
            queryParams.append('qualityTier', columnVisibility.qualityTier ? '1' : '0');
        }
        
        if (queryParams.toString()) {
            pdfUrl += `?${queryParams.toString()}`;
        }

        // Download PDF in background
        console.log('🔍 Downloading PDF from URL:', pdfUrl);
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `${projectInstanceData.name || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log('🔍 PDF download initiated');
        
        // Show message that PDF is downloaded and next click will open preview
        alert(t('interface.projectView.pdfDownloadedClickAgainForPreview', 'PDF downloaded! Click "Download PDF" again to open preview page.'));
        
    } else {
        // Second click: open React preview page
        console.log('🔍 Second click: Opening PDF preview page...');
        const previewUrl = `/projects/view/${projectId}/pdf-preview`;
        console.log('🔍 Preview URL:', previewUrl);
        window.open(previewUrl, '_blank');
        
        // Reset count after opening preview
        setPdfDownloadCount(0);
  };

  const handleToggleEdit = () => {
    if (!projectInstanceData) { alert(t('interface.projectView.projectDataNotLoaded', 'Project data not loaded yet.')); return; }
    const editableComponentTypes = [
      COMPONENT_NAME_PDF_LESSON,
      COMPONENT_NAME_TRAINING_PLAN,
      COMPONENT_NAME_SLIDE_DECK,
      COMPONENT_NAME_VIDEO_LESSON,
      COMPONENT_NAME_QUIZ,
      COMPONENT_NAME_TEXT_PRESENTATION,
    ];
    if (!editableComponentTypes.includes(projectInstanceData.component_name)) {
      alert(`${t('interface.projectView.contentEditingSupported', 'Content editing is currently supported for')} ${editableComponentTypes.join(', ')} ${t('interface.projectView.typesOnThisPage', 'types on this page.')}`);
      return;
    }

    if (isEditing) {
      handleSave();
    } else {
      const lang = projectInstanceData.details?.detectedLanguage || 'en';
      if (projectInstanceData.details) {
        setEditableData(JSON.parse(JSON.stringify(projectInstanceData.details)));
      } else { 
        if (projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
          setEditableData({ mainTitle: projectInstanceData.name || t('interface.projectView.newTrainingPlanTitle', 'New Training Plan'), sections: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_PDF_LESSON) {
          setEditableData({ lessonTitle: projectInstanceData.name || t('interface.projectView.newPdfLessonTitle', 'New PDF Lesson'), contentBlocks: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
          setEditableData({ textTitle: projectInstanceData.name || t('interface.projectView.newTextPresentationTitle', 'New Text Presentation'), contentBlocks: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_VIDEO_LESSON) {
          setEditableData({ mainPresentationTitle: projectInstanceData.name || t('interface.projectView.newVideoLessonTitle', 'New Video Lesson'), slides: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_QUIZ) {
          setEditableData({ quizTitle: projectInstanceData.name || t('interface.projectView.newQuizTitle', 'New Quiz'), questions: [], detectedLanguage: lang });
        } else {
          setEditableData(null);
        }
      }
      setIsEditing(true);
    }
  };

  // Theme management for slide decks
  const slideDeckData = projectInstanceData?.component_name === COMPONENT_NAME_SLIDE_DECK 
    ? (editableData as ComponentBasedSlideDeck) 
    : null;

  const { currentTheme, changeTheme, isChangingTheme } = useTheme({
    initialTheme: slideDeckData?.theme,
    slideDeck: slideDeckData || undefined,
    projectId: projectId,
    enablePersistence: true,
    onThemeChange: (newTheme, updatedDeck) => {
      console.log('🎨 Theme changed:', { newTheme, updatedDeck });
      
      // Update the editable data with new theme
      if (updatedDeck && projectInstanceData?.component_name === COMPONENT_NAME_SLIDE_DECK) {
        setEditableData(updatedDeck);
        
        // Auto-save the theme change
        if (isEditing) {
          handleAutoSave();
        }
      }
    }
  });

  // Log theme restoration on mount
  useEffect(() => {
    if (projectInstanceData?.component_name === COMPONENT_NAME_SLIDE_DECK) {
      console.log('🎨 Theme system initialized:', {
        projectId,
        currentTheme,
        slideDeckTheme: slideDeckData?.theme,
        hasSlideDeck: !!slideDeckData
      });
    }
  }, [projectId, currentTheme, slideDeckData, projectInstanceData?.component_name]);

  /* --- Send single non-outline item to trash --- */
  const handleMoveToTrash = async () => {
    if (!projectInstanceData) return;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const devUserId = typeof window !== 'undefined' ? sessionStorage.getItem('dev_user_id') : null;
    if (devUserId && process.env.NODE_ENV === 'development') headers['X-Dev-Onyx-User-ID'] = devUserId;

    try {
      const resp = await fetch(`${CUSTOM_BACKEND_URL}/projects/delete-multiple`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ project_ids: [projectInstanceData.project_id], scope: 'self' })
      });
      if (!resp.ok) {
        const responseText = await resp.text();
        throw new Error(`${t('interface.projectView.failedToMoveToTrash', 'Failed to move to trash')}: ${resp.status} ${responseText.slice(0,200)}`);
      }
      // redirect to products
      router.push('/projects');
    } catch (e:any) {
      alert(e.message || t('interface.projectView.couldNotMoveToTrash', 'Could not move to trash'));
    }
  };



  if (pageState === 'initial_loading' || pageState === 'fetching') {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><div className="p-8 text-center text-lg text-gray-600">{t('interface.projectView.loadingProject', 'Loading project details...')}</div></div>;
  }
  if (pageState === 'error') {
    return <div className="flex items-center justify-center min-h-screen bg-red-50"><div className="p-8 text-center text-red-700 text-lg">{t('interface.projectView.errorLoadingProject', 'Error: Failed to load project data.')}</div></div>;
  }
    if (!projectInstanceData) {
      return <div className="flex items-center justify-center min-h-screen bg-gray-100"><div className="p-8 text-center text-gray-500">{t('interface.projectView.projectNotFound', 'Project not found or data unavailable.')}</div></div>;
  }

  const DefaultDisplayComponent = ({ instanceData, t }: { instanceData: ProjectInstanceDetail | null; t: (key: string, fallback?: string) => string }) => (
    <div className="p-6 border rounded-lg bg-gray-50 shadow-md">
      <div className="flex items-center text-blue-600 mb-3">
          <Info size={24} className="mr-3" />
          <h2 className="text-2xl font-semibold">{instanceData?.name || t('interface.projectView.contentDetails', 'Content Details')}</h2>
      </div>
      <p className="text-gray-700 mb-2">
        {t('interface.projectView.utilizesDesignComponent', 'This project instance utilizes the design component:')} <strong className="font-medium text-gray-800">&quot;{instanceData?.component_name || t('interface.projectView.unknownComponent', 'Unknown')}&quot;</strong>.
      </p>
      <p className="text-gray-600 mb-4">
        {t('interface.projectView.specificUIForDirectViewing', 'A specific UI for direct viewing or editing this component type might not yet be fully implemented on this page.')}
        {t('interface.projectView.editGeneralDetails', 'You can typically edit the project&apos;s general details (like name or design template) via the main project editing page.')}
      </p>
      <details className="group text-sm">
          <summary className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors duration-150 group-open:mb-2 font-medium">
              {t('interface.projectView.toggleRawContentPreview', 'Toggle Raw Content Preview')}
          </summary>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto whitespace-pre-wrap border border-gray-200 mt-1 max-h-96">
              {JSON.stringify(instanceData?.details, null, 2)}
          </pre>
      </details>
    </div>
  );

  const displayContent = () => {
    if (!projectInstanceData || pageState !== 'success') {
      return null; 
    }

    const parentProjectName = searchParams?.get('parentProjectName') || parentProjectNameForCurrentView;
    const lessonNumberStr = searchParams?.get('lessonNumber');
    let lessonNumber: number | undefined = lessonNumberStr ? parseInt(lessonNumberStr, 10) : undefined;
    
    if (lessonNumber === undefined && projectInstanceData.details && 'lessonNumber' in projectInstanceData.details && typeof projectInstanceData.details.lessonNumber === 'number') {
      lessonNumber = projectInstanceData.details.lessonNumber;
    }

    switch (projectInstanceData.component_name) {
      case COMPONENT_NAME_TRAINING_PLAN:
        const trainingPlanData = editableData as TrainingPlanData | null;
        return (
          <div>
            {/* Smart Prompt Editor - show when smart editing is enabled */}
            {showSmartEditor && (
              <SmartPromptEditor
                projectId={projectInstanceData.project_id}
                onContentUpdate={handleSmartEditContentUpdate}
                onError={handleSmartEditError}
                onRevert={handleSmartEditRevert}
                currentLanguage={trainingPlanData?.detectedLanguage}
                currentTheme={trainingPlanData?.theme}
              />
            )}
            <TrainingPlanTableComponent
              dataToDisplay={trainingPlanData}
              onTextChange={handleTextChange}
              onAutoSave={handleAutoSave}
              sourceChatSessionId={projectInstanceData.sourceChatSessionId}
              allUserMicroproducts={allUserMicroproducts}
              parentProjectName={parentProjectNameForCurrentView}
              theme={trainingPlanData?.theme || 'cherry'}
              projectId={projectId ? parseInt(projectId) : undefined}
              projectCustomRate={projectInstanceData.custom_rate}
              projectQualityTier={projectInstanceData.quality_tier}
              projectIsAdvanced={projectInstanceData.is_advanced}
              projectAdvancedRates={projectInstanceData.advanced_rates}
              columnVisibility={columnVisibility}
            />
          </div>
        );
      case COMPONENT_NAME_PDF_LESSON:
        const pdfLessonData = editableData as PdfLessonData | null;
        return (
          <PdfLessonDisplayComponent 
            dataToDisplay={pdfLessonData} 
            isEditing={isEditing} 
            onTextChange={handleTextChange}
            parentProjectName={parentProjectName}
            lessonNumber={lessonNumber}
          />
        );
      case COMPONENT_NAME_SLIDE_DECK:
        const slideDeckData = editableData as ComponentBasedSlideDeck | null;
        if (!slideDeckData) {
          return <div className="p-6 text-center text-gray-500">{t('interface.projectView.noSlideDeckData', 'No slide deck data available')}</div>;
        }
                // For slide decks, use the new SmartSlideDeckViewer with component-based templates
        return (
          <div style={{ 
            width: '100%',
            minHeight: '600px',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <SmartSlideDeckViewer
              deck={slideDeckData}
              isEditable={true}
              onSave={(updatedDeck) => {
                // Update the editableData state with the new deck and trigger save
                console.log('🔍 page.tsx: Received updated deck:', updatedDeck);
                setEditableData(updatedDeck);
                
                // Use the updated deck directly for immediate save
                console.log('🔍 page.tsx: Triggering auto-save with updated data');
                // Create a temporary auto-save function that uses the updated deck
                const tempAutoSave = async () => {
                  if (!projectId || !projectInstanceData) {
                    console.log('🔍 page.tsx: Missing required data for auto-save');
                    return;
                  }
                  
                  const saveOperationHeaders: HeadersInit = { 'Content-Type': 'application/json' };
                  const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
                  if (devUserId && process.env.NODE_ENV === 'development') {
                    saveOperationHeaders['X-Dev-Onyx-User-ID'] = devUserId;
                  }

                  try {
                    const payload = { microProductContent: updatedDeck };
                    console.log('🔍 page.tsx: Sending updated deck to backend:', JSON.stringify(payload, null, 2));
                    
                    const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
                      method: 'PUT', headers: saveOperationHeaders, body: JSON.stringify(payload),
                    });
                    
                    if (!response.ok) {
                      console.error('🔍 page.tsx: Auto-save failed:', response.status);
                      const errorText = await response.text();
                      console.error('🔍 page.tsx: Auto-save error details:', errorText);
                    } else {
                      console.log('🔍 page.tsx: Auto-save successful with updated data');
                      const responseData = await response.json();
                      console.log('🔍 page.tsx: Auto-save response:', JSON.stringify(responseData, null, 2));
                    }
                  } catch (err: any) {
                    console.error('🔍 page.tsx: Auto-save error:', err.message);
                  }
                };
                
                tempAutoSave();
              }}
              // onAutoSave removed to prevent duplicate save requests
              showFormatInfo={true}
              theme={currentTheme}
              projectId={projectId}
            />
          </div>
        );
      case COMPONENT_NAME_VIDEO_LESSON_PRESENTATION:
        const videoLessonPresentationData = editableData as ComponentBasedSlideDeck | null;
        if (!videoLessonPresentationData) {
          return <div className="p-6 text-center text-gray-500">{t('interface.projectView.noVideoLessonData', 'No video lesson data available')}</div>;
        }
        // For video lesson presentations, use the same SmartSlideDeckViewer but with voiceover support
        return (
          <div style={{ 
            width: '100%',
            minHeight: '600px',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <SmartSlideDeckViewer
              deck={videoLessonPresentationData}
              isEditable={true}
              onSave={(updatedDeck) => {
                // Update the editableData state with the new deck and trigger save
                console.log('🔍 page.tsx: Received updated video lesson deck:', updatedDeck);
                setEditableData(updatedDeck);
                
                // Use the updated deck directly for immediate save
                console.log('🔍 page.tsx: Triggering auto-save with updated video lesson data');
                // Create a temporary auto-save function that uses the updated deck
                const tempAutoSave = async () => {
                  if (!projectId || !projectInstanceData) {
                    console.log('🔍 page.tsx: Missing required data for auto-save');
                    return;
                  }
                  
                  const saveOperationHeaders: HeadersInit = { 'Content-Type': 'application/json' };
                  const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
                  if (devUserId && process.env.NODE_ENV === 'development') {
                    saveOperationHeaders['X-Dev-Onyx-User-ID'] = devUserId;
                  }

                  try {
                    const payload = { microProductContent: updatedDeck };
                    console.log('🔍 page.tsx: Sending updated video lesson deck to backend:', JSON.stringify(payload, null, 2));
                    
                    const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
                      method: 'PUT', headers: saveOperationHeaders, body: JSON.stringify(payload),
                    });
                    
                    if (!response.ok) {
                      console.error('🔍 page.tsx: Auto-save failed:', response.status);
                      const errorText = await response.text();
                      console.error('🔍 page.tsx: Auto-save error details:', errorText);
                    } else {
                      console.log('🔍 page.tsx: Auto-save successful with updated data');
                      const responseData = await response.json();
                      console.log('🔍 page.tsx: Auto-save response:', JSON.stringify(responseData, null, 2));
                    }
                  } catch (err: any) {
                    console.error('🔍 page.tsx: Auto-save error:', err.message);
                  }
                };
                
                tempAutoSave();
              }}
              // onAutoSave removed to prevent duplicate save requests
              showFormatInfo={true}
              theme="dark-purple"
              hasVoiceover={true} // Enable voiceover features
              projectId={projectId}
            />
          </div>
        );
       case COMPONENT_NAME_TEXT_PRESENTATION:
        const textPresentationData = editableData as TextPresentationData | null;
        return (
          <TextPresentationDisplay
            dataToDisplay={textPresentationData}
            isEditing={isEditing}
            onTextChange={handleTextChange}
            parentProjectName={parentProjectName}
          />
        );
      case COMPONENT_NAME_VIDEO_LESSON:
        const videoData = editableData as VideoLessonData | null;
        return (
          <VideoLessonDisplay
            dataToDisplay={videoData}
            isEditing={isEditing}
            onTextChange={handleTextChange}
            parentProjectName={parentProjectName}
            lessonNumber={lessonNumber}
          />
        );
      case COMPONENT_NAME_QUIZ:
        const quizData = editableData as QuizData | null;
        return (
          <QuizDisplay 
            dataToDisplay={quizData} 
            isEditing={isEditing} 
            onTextChange={handleTextChange} 
            parentProjectName={parentProjectName}
            lessonNumber={lessonNumber}
          />
        );
      default:
        return <DefaultDisplayComponent instanceData={projectInstanceData} t={t} />;
    }
  };

  const displayName = projectInstanceData?.name || `${t('interface.projectView.project', 'Project')} ${projectId}`;
  const canEditContent = projectInstanceData &&
                          [COMPONENT_NAME_PDF_LESSON, COMPONENT_NAME_VIDEO_LESSON, COMPONENT_NAME_QUIZ, COMPONENT_NAME_TEXT_PRESENTATION].includes(projectInstanceData.component_name);

  // Determine product language for column labels
  const productLanguage = (editableData as any)?.detectedLanguage || 'en';
  const columnLabels = columnLabelLocalization[productLanguage as keyof typeof columnLabelLocalization] || columnLabelLocalization.en;

  return (
    <main className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          <div className="flex items-center gap-x-4">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('interface.projectView.back', 'Back')}
            </button>
            
            <Link
                href="/projects"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                >
                <FolderOpen size={16} className="mr-2" />
                {t('interface.projectView.openProducts', 'Open Products')}
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {/* Edit button for editable content types */}
            {canEditContent && (
              <button
                onClick={handleToggleEdit}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 flex items-center ${
                  isEditing 
                    ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
                }`}
                title={isEditing ? t('interface.projectView.saveChanges', 'Save changes') : t('interface.projectView.editContent', 'Edit content')}
              >
                {isEditing ? (
                  <>
                    <Save size={16} className="mr-2" />
                    {isSaving ? t('interface.projectView.saving', 'Saving...') : t('interface.projectView.save', 'Save')}
                  </>
                ) : (
                  <>
                    <Edit size={16} className="mr-2" />
                    {t('interface.projectView.editContent', 'Edit Content')}
                  </>
                )}
              </button>
            )}
            
                         {projectInstanceData && (typeof projectInstanceData.project_id === 'number') && (
                   <button
                     onClick={() => {
                       console.log('🔍 Download PDF button clicked');
                       handlePdfDownload();
                     }}
                     disabled={isSaving}
                     className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 flex items-center"
                     title={
                       pdfDownloadCount === 0 
                         ? (projectInstanceData.component_name === COMPONENT_NAME_SLIDE_DECK 
                             ? t('interface.projectView.downloadSlideDeckPdf', 'Download presentation as PDF')
                             : t('interface.projectView.downloadPdf', 'Download content as PDF'))
                         : t('interface.projectView.openPreview', 'Open preview page')
                     }
                   >
                    <Download size={16} className="mr-2" /> {
                      pdfDownloadCount === 0
                        ? (projectInstanceData.component_name === COMPONENT_NAME_SLIDE_DECK 
                            ? t('interface.projectView.downloadSlideDeckPdf', 'Download PDF')
                            : t('interface.projectView.downloadPdf', 'Download PDF'))
                        : t('interface.projectView.openPreview', 'Open Preview')
                    }
                   </button>
             )}
            
            {/* Smart Edit button for Training Plans */}
            {projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && projectId && (
              <button
                onClick={() => setShowSmartEditor(!showSmartEditor)}
                className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center"
                title={t('interface.projectView.smartEdit', 'Smart edit with AI')}
              >
                <Sparkles size={16} className="mr-2" /> {t('interface.projectView.smartEdit', 'Smart Edit')}
              </button>
            )}

            {/* Column Visibility Dropdown - only for Training Plans */}
            {projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && (
              <div className="relative" ref={columnDropdownRef}>
                <button
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  title={t('interface.projectView.configureVisibleColumns', 'Configure visible columns')}
                >
                  <Info size={16} className="mr-2" />
                  {t('interface.projectView.columns', 'Columns')}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {showColumnDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">{t('interface.projectView.visibleColumns', 'Visible Columns')}</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.knowledgeCheck}
                          onChange={(e) => handleColumnVisibilityChange('knowledgeCheck', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{columnLabels.assessmentType}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.contentAvailability}
                          onChange={(e) => handleColumnVisibilityChange('contentAvailability', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{columnLabels.contentVolume}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.informationSource}
                          onChange={(e) => handleColumnVisibilityChange('informationSource', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{columnLabels.source}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.estCreationTime}
                          onChange={(e) => handleColumnVisibilityChange('estCreationTime', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{columnLabels.estCreationTime}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.estCompletionTime}
                          onChange={(e) => handleColumnVisibilityChange('estCompletionTime', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{columnLabels.estCompletionTime}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.qualityTier}
                          onChange={(e) => handleColumnVisibilityChange('qualityTier', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{columnLabels.qualityTier}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Move to Trash button for non-outline microproducts placed as right-most */}
            {projectInstanceData && projectInstanceData.component_name !== COMPONENT_NAME_TRAINING_PLAN && (
              <button
                onClick={handleMoveToTrash}
                className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white border border-red-400 hover:bg-red-50 focus:outline-none flex items-center"
                title={t('interface.projectView.moveToTrashTooltip', 'Move this product to Trash')}
              >
                <Trash2 size={16} className="mr-2" /> {t('interface.projectView.moveToTrash', 'Move to Trash')}
              </button>
            )}
          </div>
        </div>

        {saveError &&
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md text-sm flex items-center">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        }

        <div className="bg-white p-4 sm:p-6 md:p-8 shadow-xl rounded-xl border border-gray-200">
            <Suspense fallback={<div className="py-10 text-center text-gray-500">{t('interface.projectView.loadingContentDisplay', 'Loading content display...')}</div>}>
              {displayContent()}
            </Suspense>
        </div>
      </div>

      {/* PDF Export Loading Modal */}
      <PdfExportLoadingModal 
        isOpen={isExportingPdf} 
        projectName={projectInstanceData?.name || 'Presentation'} 
      />
    </main>
  );
}