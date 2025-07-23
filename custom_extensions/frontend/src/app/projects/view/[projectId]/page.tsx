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
import { Save, Edit, ArrowDownToLine, Info, AlertTriangle, ArrowLeft, FolderOpen, Trash2, ChevronDown } from 'lucide-react';
import { SmartSlideDeckViewer } from '@/components/SmartSlideDeckViewer';


const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

// Component Name Constants
const COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable";
const COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay";
const COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay";
const COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay";
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

const DefaultDisplayComponent = ({ instanceData }: { instanceData: ProjectInstanceDetail | null }) => (
  <div className="p-6 border rounded-lg bg-gray-50 shadow-md">
    <div className="flex items-center text-blue-600 mb-3">
        <Info size={24} className="mr-3" />
        <h2 className="text-2xl font-semibold">{instanceData?.name || 'Content Details'}</h2>
    </div>
    <p className="text-gray-700 mb-2">
      This project instance utilizes the design component: <strong className="font-medium text-gray-800">&quot;{instanceData?.component_name || 'Unknown'}&quot;</strong>.
    </p>
    <p className="text-gray-600 mb-4">
      A specific UI for direct viewing or editing this component type might not yet be fully implemented on this page.
      You can typically edit the project&apos;s general details (like name or design template) via the main project editing page.
    </p>
    <details className="group text-sm">
        <summary className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors duration-150 group-open:mb-2 font-medium">
            Toggle Raw Content Preview
        </summary>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto whitespace-pre-wrap border border-gray-200 mt-1 max-h-96">
            {JSON.stringify(instanceData?.details, null, 2)}
        </pre>
    </details>
  </div>
);


export default function ProjectInstanceViewPage() {
  const params = useParams<ProjectViewParams>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projectId } = params || {};

  const [projectInstanceData, setProjectInstanceData] = useState<ProjectInstanceDetail | null>(null);
  const [allUserMicroproducts, setAllUserMicroproducts] = useState<ProjectListItem[] | undefined>(undefined);
  const [parentProjectNameForCurrentView, setParentProjectNameForCurrentView] = useState<string | undefined>(undefined);

  const [pageState, setPageState] = useState<'initial_loading' | 'fetching' | 'error' | 'success' | 'nodata'>('initial_loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<MicroProductContentData>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // State for the absolute chat URL
  const [chatRedirectUrl, setChatRedirectUrl] = useState<string | null>(null);

  /* --- Persist column visibility (displayOptions) once after creation --- */
  const [displayOptsSynced, setDisplayOptsSynced] = useState(false);

  // Column visibility controls for Training Plan table
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    knowledgeCheck: true,
    contentAvailability: true,
    informationSource: true,
    estCreationTime: true,
    estCompletionTime: true,
    qualityTier: false, // Hidden by default
  });
  const columnDropdownRef = useRef<HTMLDivElement>(null);

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
      setErrorMessage("Invalid Project ID format.");
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
          console.warn("Could not fetch full projects list to determine parent project name.");
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
          setEditableData(copiedDetails as TextPresentationData);
        } else {
          setEditableData(copiedDetails); 
        }
      } else {
        const lang = instanceData.detectedLanguage || 'en'; 
        if (instanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
          setEditableData({ mainTitle: instanceData.name || "New Training Plan", sections: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_PDF_LESSON) {
          setEditableData({ lessonTitle: instanceData.name || "New PDF Lesson", contentBlocks: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_SLIDE_DECK) {
          setEditableData({ lessonTitle: instanceData.name || "New Slide Deck", slides: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_VIDEO_LESSON) {
          setEditableData({ mainPresentationTitle: instanceData.name || "New Video Lesson", slides: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_QUIZ) {
          setEditableData({ quizTitle: instanceData.name || "New Quiz", questions: [], detectedLanguage: lang });
        } else if (instanceData.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
          setEditableData({ textTitle: instanceData.name || "New Text Presentation", contentBlocks: [], detectedLanguage: lang });
        } else {
          setEditableData(null);
        }
      }
      setPageState(instanceData ? 'success' : 'nodata');
    } catch (err: any) {
      console.error("Fetch Page Data Error:", err);
      setErrorMessage(err.message || "An unknown error occurred while fetching project data.");
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
      setErrorMessage("Project ID is missing in URL.");
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
    setEditableData(currentData => {
      if (currentData === null || currentData === undefined) {
        console.warn("Attempted to update null or undefined editableData at path:", path);
        return null;
      }

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
      return newData;
    });
  }, []);

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
      setSaveError("Project ID or editable data is missing.");
      alert("Error: Project ID or data is missing.");
      return;
    }
    if (!projectInstanceData) {
      setSaveError("Project instance data not loaded.");
      alert("Error: Project instance data not loaded.");
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
      setSaveError("Content editing is not supported for this component type on this page.");
      alert("Error: Cannot save. Content editing for this component type is not supported here.");
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
      const payload = { microProductContent: editableData };
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
                return `${location}: ${err.msg || 'Validation error'}`;
              }).join('; ');
              errorDetail = `Validation errors: ${validationErrors}`;
            } else {
              errorDetail = errorJson.detail;
            }
          }
        }
        catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }
      setIsEditing(false);
      await fetchPageData(projectId);
      alert("Content saved successfully!");
    } catch (err: any) {
      setSaveError(err.message || "Could not save data.");
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (!projectInstanceData) { alert("Project data not loaded yet."); return; }
    const editableComponentTypes = [
      COMPONENT_NAME_PDF_LESSON,
      COMPONENT_NAME_TRAINING_PLAN,
      COMPONENT_NAME_SLIDE_DECK,
      COMPONENT_NAME_VIDEO_LESSON,
      COMPONENT_NAME_QUIZ,
      COMPONENT_NAME_TEXT_PRESENTATION,
    ];
    if (!editableComponentTypes.includes(projectInstanceData.component_name)) {
      alert(`Content editing is currently supported for ${editableComponentTypes.join(', ')} types on this page.`);
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
          setEditableData({ mainTitle: projectInstanceData.name || "New Training Plan", sections: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_PDF_LESSON) {
          setEditableData({ lessonTitle: projectInstanceData.name || "New PDF Lesson", contentBlocks: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
          setEditableData({ textTitle: projectInstanceData.name || "New Text Presentation", contentBlocks: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_VIDEO_LESSON) {
          setEditableData({ mainPresentationTitle: projectInstanceData.name || "New Video Lesson", slides: [], detectedLanguage: lang });
        } else if (projectInstanceData.component_name === COMPONENT_NAME_QUIZ) {
          setEditableData({ quizTitle: projectInstanceData.name || "New Quiz", questions: [], detectedLanguage: lang });
        } else {
          setEditableData(null);
        }
      }
      setIsEditing(true);
    }
  };

  const handlePdfDownload = () => {
    if (!projectInstanceData || typeof projectInstanceData.project_id !== 'number') {
        alert("Project data or ID is not available for download.");
        return;
    }
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

    window.open(pdfUrl, '_blank');
  };

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
        const t = await resp.text();
        throw new Error(`Failed to move to trash: ${resp.status} ${t.slice(0,200)}`);
      }
      // redirect to products
      router.push('/projects');
    } catch (e:any) {
      alert(e.message || 'Could not move to trash');
    }
  };

  if (pageState === 'initial_loading' || pageState === 'fetching') {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><div className="p-8 text-center text-lg text-gray-600">Loading project details...</div></div>;
  }
  if (pageState === 'error') {
    return <div className="flex items-center justify-center min-h-screen bg-red-50"><div className="p-8 text-center text-red-700 text-lg">Error: {errorMessage || "Failed to load project data."}</div></div>;
  }
    if (!projectInstanceData) {
      return <div className="flex items-center justify-center min-h-screen bg-gray-100"><div className="p-8 text-center text-gray-500">Project not found or data unavailable.</div></div>;
  }

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
            {/* Smart Prompt Editor - only show when editing Training Plans */}
            {isEditing && (
              <SmartPromptEditor
                projectId={projectInstanceData.project_id}
                onContentUpdate={handleSmartEditContentUpdate}
                onError={handleSmartEditError}
                onRevert={handleSmartEditRevert}
              />
            )}
            <TrainingPlanTableComponent
              dataToDisplay={trainingPlanData}
              isEditing={isEditing}
              onTextChange={handleTextChange}
              sourceChatSessionId={projectInstanceData.sourceChatSessionId}
              allUserMicroproducts={allUserMicroproducts}
              parentProjectName={parentProjectNameForCurrentView}
              theme={trainingPlanData?.theme || 'cherry'}
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
          return <div className="p-6 text-center text-gray-500">No slide deck data available</div>;
        }
                // For slide decks, use the new SmartSlideDeckViewer with component-based templates
        return (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            zIndex: 9999, 
            backgroundColor: '#f8f9fa',
            padding: '20px'
          }}>
            <SmartSlideDeckViewer
              deck={slideDeckData}
              isEditable={isEditing}
              onSave={(updatedDeck) => {
                // Convert the updated deck back to the format expected by handleTextChange
                if (handleTextChange) {
                  handleTextChange([], updatedDeck as any);
                }
              }}
              showFormatInfo={true}
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
        return <DefaultDisplayComponent instanceData={projectInstanceData} />;
    }
  };

  const displayName = projectInstanceData?.name || `Project ${projectId}`;
  const canEditContent = projectInstanceData &&
                          [COMPONENT_NAME_TRAINING_PLAN, COMPONENT_NAME_PDF_LESSON, COMPONENT_NAME_SLIDE_DECK, COMPONENT_NAME_VIDEO_LESSON, COMPONENT_NAME_QUIZ, COMPONENT_NAME_TEXT_PRESENTATION].includes(projectInstanceData.component_name);

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
              Back
            </button>
            
            <Link
                href="/projects"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                >
                <FolderOpen size={16} className="mr-2" />
                Open Products
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {projectInstanceData && (typeof projectInstanceData.project_id === 'number') && (
                  <button
                    onClick={handlePdfDownload}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 flex items-center"
                    title="Download content as PDF"
                  >
                   <ArrowDownToLine size={16} className="mr-2" /> Download PDF
                  </button>
            )}
            {canEditContent && projectId && (
              <button
                onClick={handleToggleEdit}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 flex items-center
                                ${isEditing ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'}`}
                title={isEditing ? "Save current changes" : "Edit content"}
              >
                {isEditing ? (
                  <> <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Content'} </>
                ) : (
                  <> <Edit size={16} className="mr-2" /> Edit Content </>
                )}
              </button>
            )}
            {/* Column Visibility Dropdown - only for Training Plans */}
            {projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && (
              <div className="relative" ref={columnDropdownRef}>
                <button
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  title="Configure visible columns"
                >
                  <Info size={16} className="mr-2" />
                  Columns
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {showColumnDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Visible Columns</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.knowledgeCheck}
                          onChange={(e) => handleColumnVisibilityChange('knowledgeCheck', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Assessment Type</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.contentAvailability}
                          onChange={(e) => handleColumnVisibilityChange('contentAvailability', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Content Volume</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.informationSource}
                          onChange={(e) => handleColumnVisibilityChange('informationSource', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Source</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.estCreationTime}
                          onChange={(e) => handleColumnVisibilityChange('estCreationTime', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Est. Creation Time</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.estCompletionTime}
                          onChange={(e) => handleColumnVisibilityChange('estCompletionTime', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Est. Completion Time</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={columnVisibility.qualityTier}
                          onChange={(e) => handleColumnVisibilityChange('qualityTier', e.target.checked)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Quality Tier</span>
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
                title="Move this product to Trash"
              >
                <Trash2 size={16} className="mr-2" /> Move to Trash
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
            <Suspense fallback={<div className="py-10 text-center text-gray-500">Loading content display...</div>}>
              {displayContent()}
            </Suspense>
        </div>
      </div>
    </main>
  );
}