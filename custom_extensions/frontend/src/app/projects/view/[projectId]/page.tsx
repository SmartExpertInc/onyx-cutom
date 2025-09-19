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
import { LessonPlanView } from '@/components/LessonPlanView';
import { useLanguage } from '../../../../contexts/LanguageContext';
import workspaceService, { 
  Workspace, 
  WorkspaceRole, 
  WorkspaceMember, 
  ProductAccess,
  ProductAccessCreate 
} from '../../../../services/workspaceService';

import { Save, Edit, ArrowDownToLine, Info, AlertTriangle, ArrowLeft, FolderOpen, Trash2, ChevronDown, Sparkles, Download, Palette } from 'lucide-react';
import { VideoDownloadButton } from '@/components/VideoDownloadButton';
import { SmartSlideDeckViewer } from '@/components/SmartSlideDeckViewer';
import { ThemePicker } from '@/components/theme/ThemePicker';
import { useTheme } from '@/hooks/useTheme';
import { createPortal } from 'react-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Localization config for column labels based on product language
const columnLabelLocalization = {
  ru: {
    assessmentType: "Тип оценки",
    contentVolume: "Объем контента",
    source: "Источник",
    estCreationTime: "Оц. время создания",
    estCompletionTime: "Оц. время завершения",
    qualityTier: "Уровень качества",
    quiz: "Викторина",
    onePager: "Одностраничный",
    videoPresentation: "Видео презентация",
    lessonPresentation: "Презентация урока"
  },
  uk: {
    assessmentType: "Тип оцінки",
    contentVolume: "Обсяг контенту",
    source: "Джерело",
    estCreationTime: "Оц. час створення",
    estCompletionTime: "Оц. час завершення",
    qualityTier: "Рівень якості",
    quiz: "Вікторина",
    onePager: "Односторінковий",
    videoPresentation: "Відеопрезентація",
    lessonPresentation: "Презентація уроку"
  },
  es: {
    assessmentType: "Tipo de evaluación",
    contentVolume: "Volumen de contenido",
    source: "Fuente",
    estCreationTime: "Tiempo Est. Creación",
    estCompletionTime: "Tiempo Est. Finalización",
    qualityTier: "Nivel de Calidad",
    quiz: "Prueba",
    onePager: "Una página",
    videoPresentation: "Presentación en vídeo",
    lessonPresentation: "Presentación de la lección"
  },
  en: {
    assessmentType: "Assessment Type",
    contentVolume: "Content Volume",
    source: "Source",
    estCreationTime: "Est. Creation Time",
    estCompletionTime: "Est. Completion Time",
    qualityTier: "Quality Tier",
    quiz: "Quiz",
    onePager: "One-Pager",
    videoPresentation: "Video Presentation",
    lessonPresentation: "Lesson Presentation"
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
const COMPONENT_NAME_LESSON_PLAN = "LessonPlanDisplay";

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
  pdfDownloadReady: {url: string, filename: string} | null;
  pdfProgress: {current: number, total: number, message: string} | null;
  onDownload: () => void;
  onClose: () => void;
}> = ({ isOpen, projectName, pdfDownloadReady, pdfProgress, onDownload, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Calculate progress percentage
  const progressPercentage = pdfProgress ? Math.round((pdfProgress.current / pdfProgress.total) * 100) : 0;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center max-w-md mx-4">
        {!pdfDownloadReady ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('actions.generatingPdf', 'Generating PDF')}</h3>
            <p className="text-gray-600 text-center mb-4">
              {t('actions.creatingPresentationPdfExport', 'Creating PDF export for presentation')} <span className="font-semibold text-blue-600">"{projectName}"</span>
            </p>
            
            {/* Progress Bar */}
            {pdfProgress && (
              <div className="w-full mb-4">
                <div className="flex justify-end text-sm text-gray-600 mb-2">
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-500 text-center">
              {t('modals.pdfExport.description', 'This may take a few moments depending on the presentation size...')}
            </p>
          </>
        ) : (
          <>
            <div className="text-green-600 mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('actions.pdfReady', 'PDF Ready!')}</h3>
            <p className="text-gray-600 text-center mb-6">
              {t('actions.pdfGenerationComplete', 'PDF generation completed successfully!')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onDownload}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('actions.downloadPdf', 'Download PDF')}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t('actions.close', 'Close')}
              </button>
            </div>
          </>
        )}
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

  // Add CSS for hidden scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

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
    quiz: false,
    onePager: false,
    videoPresentation: false,
    lessonPresentation: false,
  });
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfDownloadReady, setPdfDownloadReady] = useState<{url: string, filename: string} | null>(null);
  const [pdfProgress, setPdfProgress] = useState<{current: number, total: number, message: string} | null>(null);
  
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

  // Theme picker state for training plans
  const [showTrainingPlanThemePicker, setShowTrainingPlanThemePicker] = useState(false);

  // Role access control state
  const [roleAccess, setRoleAccess] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customEmails, setCustomEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [generalAccessOption, setGeneralAccessOption] = useState<'restricted' | 'anyone'>('restricted');
  const [showGeneralAccessDropdown, setShowGeneralAccessDropdown] = useState(false);
  const [emailRoles, setEmailRoles] = useState<Record<string, string>>({});
  const [showEmailRoleDropdown, setShowEmailRoleDropdown] = useState<string | null>(null);

  // Workspace system integration state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceRoles, setWorkspaceRoles] = useState<WorkspaceRole[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);
  const [productAccess, setProductAccess] = useState<ProductAccess[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Close column dropdown
      if (showColumnDropdown && columnDropdownRef.current && !columnDropdownRef.current.contains(e.target as Node)) {
        setShowColumnDropdown(false);
      }
      // Close role dropdown
      if (showRoleDropdown) {
        const target = e.target as Node;
        const rolesSection = document.querySelector('[data-roles-section]');
        if (rolesSection && !rolesSection.contains(target)) {
          setShowRoleDropdown(false);
        }
      }
      // Close general access dropdown
      if (showGeneralAccessDropdown) {
        const target = e.target as Node;
        const generalAccessSection = document.querySelector('[data-general-access-section]');
        if (generalAccessSection && !generalAccessSection.contains(target)) {
          setShowGeneralAccessDropdown(false);
        }
      }
      // Close email role dropdown
      if (showEmailRoleDropdown) {
        const target = e.target as Node;
        const emailRoleSection = document.querySelector('[data-email-role-section]');
        if (emailRoleSection && !emailRoleSection.contains(target)) {
          setShowEmailRoleDropdown(null);
        }
      }
      // Close training plan theme picker
      if (showTrainingPlanThemePicker) {
        const target = e.target as Node;
        const themePickerSection = document.querySelector('[data-theme-picker-section]');
        if (themePickerSection && !themePickerSection.contains(target)) {
          setShowTrainingPlanThemePicker(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnDropdown, showRoleDropdown, showGeneralAccessDropdown, showEmailRoleDropdown, showTrainingPlanThemePicker]);

  const handleColumnVisibilityChange = (column: string, checked: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: checked
    }));
  };

  // Load workspace data when access modal opens
  useEffect(() => {
    if (roleAccess) {
      loadWorkspaceData();
      loadProductAccess();
    }
  }, [roleAccess]);

  const loadWorkspaceData = async () => {
    try {
      setAccessLoading(true);
      const userWorkspaces = await workspaceService.getWorkspaces();
      setWorkspaces(userWorkspaces);
      
      // Auto-select first workspace if only one exists
      if (userWorkspaces.length === 1) {
        const workspaceId = userWorkspaces[0].id;
        setSelectedWorkspaceId(workspaceId);
        await loadWorkspaceDetails(workspaceId);
      }
    } catch (error) {
      console.error('Failed to load workspace data:', error);
    } finally {
      setAccessLoading(false);
    }
  };

  const loadWorkspaceDetails = async (workspaceId: number) => {
    try {
      const [roles, members] = await Promise.all([
        workspaceService.getWorkspaceRoles(workspaceId),
        workspaceService.getWorkspaceMembers(workspaceId)
      ]);
      setWorkspaceRoles(roles);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error('Failed to load workspace details:', error);
    }
  };

  const loadProductAccess = async () => {
    if (!projectInstanceData?.project_id) return;
    
    try {
              const access = await workspaceService.getProductAccess(projectInstanceData.project_id);
      setProductAccess(access);
      
      // Sync with UI state
      syncAccessToUIState(access);
    } catch (error) {
      console.error('Failed to load product access:', error);
    }
  };

  const syncAccessToUIState = (access: ProductAccess[]) => {
    const emails: string[] = [];
    const roles: string[] = [];
    const emailRoleMap: Record<string, string> = {};
    
    access.forEach(item => {
      if (item.access_type === 'individual' && item.target_id) {
        emails.push(item.target_id);
        emailRoleMap[item.target_id] = 'editor'; // Default role mapping
      } else if (item.access_type === 'role' && item.target_id) {
        roles.push(item.target_id);
      }
    });
    
    setCustomEmails(emails);
    setSelectedRoles(roles);
    setEmailRoles(emailRoleMap);
  };

  // Predefined roles (kept for UI compatibility, but now integrated with workspace roles)
  const predefinedRoles = [
    { id: 'admin', label: 'Admin', description: 'Full access to all features and content management' },
    { id: 'learning_architect', label: 'Learning Architect', description: 'Can design and structure learning experiences' },
    { id: 'learning_designer', label: 'Learning Designer', description: 'Can create and edit learning content' }
  ];

  // Helper functions for role and email management (now integrated with backend)
  const handleRoleToggle = async (roleId: string) => {
    if (!projectInstanceData?.project_id || !selectedWorkspaceId) return;
    
    try {
      const isCurrentlySelected = selectedRoles.includes(roleId);
      
      if (isCurrentlySelected) {
        // Remove role access
        await workspaceService.removeProductAccess(projectInstanceData.project_id, {
          access_type: 'role',
          target_id: roleId,
          workspace_id: selectedWorkspaceId
        });
        setSelectedRoles(prev => prev.filter(id => id !== roleId));
      } else {
        // Add role access
        await workspaceService.grantProductAccess(projectInstanceData.project_id, {
          workspace_id: selectedWorkspaceId,
          access_type: 'role',
          target_id: roleId
        });
        setSelectedRoles(prev => [...prev, roleId]);
      }
      
      // Refresh product access data
      await loadProductAccess();
    } catch (error) {
      console.error('Failed to toggle role access:', error);
    }
  };

  const handleEmailToggle = (email: string) => {
    setSelectedEmails(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim() || customEmails.includes(newEmail.trim()) || !projectInstanceData?.project_id || !selectedWorkspaceId) return;
    
    try {
      const emailToAdd = newEmail.trim();
      
      // Add individual access to backend
      await workspaceService.grantProductAccess(projectInstanceData.project_id, {
        workspace_id: selectedWorkspaceId,
        access_type: 'individual',
        target_id: emailToAdd
      });
      
      // Update UI state
      setCustomEmails(prev => [...prev, emailToAdd]);
      setSelectedEmails(prev => [...prev, emailToAdd]);
      setEmailRoles(prev => ({
        ...prev,
        [emailToAdd]: 'editor'
      }));
      setNewEmail('');
      
      // Refresh product access data
      await loadProductAccess();
    } catch (error) {
      console.error('Failed to add email access:', error);
    }
  };

  const handleEmailRoleChange = async (email: string, roleId: string) => {
    if (!projectInstanceData?.project_id || !selectedWorkspaceId) return;
    
    try {
      // For now, just update the UI state since we're using a simple access model
      // In a more complex system, you might have different permission levels per user
      setEmailRoles(prev => ({
        ...prev,
        [email]: roleId
      }));
    setShowEmailRoleDropdown(null);

      console.log('Role changed for email:', email, 'to role:', roleId);
    } catch (error) {
      console.error('Failed to change email role:', error);
    }
  };

  // Function to handle training plan theme change
  const handleTrainingPlanThemeChange = async (newTheme: string) => {
    if (!projectInstanceData?.project_id || !editableData) return;
    
    try {
      // Update the editable data with new theme
      const updatedData = { ...editableData, theme: newTheme };
      setEditableData(updatedData);
      
      // Save the updated theme to backend
      const saveOperationHeaders: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        saveOperationHeaders['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectInstanceData.project_id}`, {
        method: 'PUT', 
        headers: saveOperationHeaders, 
        body: JSON.stringify({ microProductContent: updatedData }),
      });

      if (response.ok) {
        console.log('Theme updated successfully');
      } else {
        console.error('Failed to update theme');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
    
    setShowTrainingPlanThemePicker(false);
  };

  const handleRemoveEmail = async (email: string) => {
    if (!projectInstanceData?.project_id || !selectedWorkspaceId) return;
    
    try {
      // Remove individual access from backend
      await workspaceService.removeProductAccess(projectInstanceData.project_id, {
        access_type: 'individual',
        target_id: email,
        workspace_id: selectedWorkspaceId
      });
      
      // Update UI state
    setCustomEmails(prev => prev.filter(e => e !== email));
    setSelectedEmails(prev => prev.filter(e => e !== email));
    setEmailRoles(prev => {
      const newRoles = { ...prev };
      delete newRoles[email];
      return newRoles;
    });
      
      // Refresh product access data
      await loadProductAccess();
    } catch (error) {
      console.error('Failed to remove email access:', error);
    }
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

    const hasExplicitParams = ["knowledgeCheck", "contentAvailability", "informationSource", "estCreationTime", "estCompletionTime"].some(k => paramVal(k) !== null);
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
                // Ensure completionTime is normalized to English format before saving
                if (typeof lesson.completionTime !== 'string') {
                  lesson.completionTime = '5m';
                } else {
                  // Normalize completion time to English format (extract numeric part and add 'm')
                  const numbers = lesson.completionTime.match(/\d+/);
                  if (numbers) {
                    lesson.completionTime = `${numbers[0]}m`;
                  } else {
                    lesson.completionTime = '5m'; // Fallback
                  }
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

        // NEW: Refresh products list to update names after rename propagation
        try {
          const listRes = await fetch(`${CUSTOM_BACKEND_URL}/projects`, { cache: 'no-store', headers: saveOperationHeaders });
          if (listRes.ok) {
            const listData: ProjectListItem[] = await listRes.json();
            setAllUserMicroproducts(listData);
            const currentFromList = listData.find(mp => mp.id === projectInstanceData.project_id);
            if (currentFromList?.projectName) {
              setParentProjectNameForCurrentView(currentFromList.projectName);
            } else if (responseData?.project_name || responseData?.microproduct_content?.mainTitle) {
              setParentProjectNameForCurrentView(responseData.project_name || responseData.microproduct_content.mainTitle);
            }
          } else {
            console.warn('Could not refresh projects list after auto-save');
            if (responseData?.project_name || responseData?.microproduct_content?.mainTitle) {
              setParentProjectNameForCurrentView(responseData.project_name || responseData.microproduct_content.mainTitle);
            }
          }
        } catch (e) {
          console.warn('Error refreshing projects list after auto-save', e);
          if (responseData?.project_name || responseData?.microproduct_content?.mainTitle) {
            setParentProjectNameForCurrentView(responseData.project_name || responseData.microproduct_content.mainTitle);
          }
        }

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

  // PDF download handlers
  const handleDownloadPdf = () => {
    if (pdfDownloadReady) {
      console.log('User clicked download button, opening:', pdfDownloadReady.url);
      window.open(pdfDownloadReady.url, '_blank');
      // Close the modal after initiating download
      setIsExportingPdf(false);
      setPdfDownloadReady(null);
      setPdfProgress(null);
    }
  };

  const handleClosePdfModal = () => {
    console.log('User closed PDF modal');
    setIsExportingPdf(false);
    setPdfDownloadReady(null);
    setPdfProgress(null);
  };

  const handlePdfDownload = async () => {
    if (!projectInstanceData || typeof projectInstanceData.project_id !== 'number') {
      alert(t('interface.projectView.projectDataOrIdNotAvailableForDownload', 'Project data or ID is not available for download.'));
      return;
    }

    // Special handling for slide decks and video lesson presentations  
    if (projectInstanceData.component_name === COMPONENT_NAME_SLIDE_DECK || 
        projectInstanceData.component_name === COMPONENT_NAME_VIDEO_LESSON_PRESENTATION) {
        const slideDeckData = editableData as ComponentBasedSlideDeck;
        const theme = slideDeckData?.theme || 'dark-purple';
        
        // Show loading modal with progress
        setIsExportingPdf(true);
        setPdfProgress({ current: 0, total: 1, message: 'Initializing PDF generation...' });
        
        try {
            // Use streaming endpoint for large presentations
            const streamResponse = await fetch(`${CUSTOM_BACKEND_URL}/pdf/slide-deck/${projectInstanceData.project_id}/stream?theme=${theme}`, {
                method: 'GET',
                credentials: 'same-origin'
            });

            if (!streamResponse.ok) {
                throw new Error(`PDF generation failed: ${streamResponse.status}`);
            }

            const reader = streamResponse.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get stream reader');
            }

            const decoder = new TextDecoder();
            let downloadUrl = '';
            let filename = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                console.log('Received stream data:', data);
                                
                                if (data.type === 'progress') {
                                    console.log(`PDF Progress: ${data.message} (${data.current}/${data.total})`);
                                    // Update progress UI with real-time progress
                                    setPdfProgress({
                                        current: data.current,
                                        total: data.total,
                                        message: data.message
                                    });
                                } else if (data.type === 'complete') {
                                    console.log('PDF generation completed:', data.message);
                                    console.log('Download URL received:', data.download_url);
                                    console.log('Filename received:', data.filename);
                                    downloadUrl = data.download_url;
                                    filename = data.filename;
                                } else if (data.type === 'error') {
                                    throw new Error(data.message);
                                }
                            } catch (parseError) {
                                // Ignore JSON parse errors for incomplete chunks
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }

            // Set the download ready state instead of trying to open window immediately
            console.log('PDF generation completed, setting download ready state');
            if (downloadUrl) {
                const fullDownloadUrl = `${CUSTOM_BACKEND_URL}${downloadUrl}`;
                console.log('Download URL ready:', fullDownloadUrl);
                console.log('Filename ready:', filename);
                
                // Set the download ready state - this will update the modal to show download button
                setPdfDownloadReady({
                    url: fullDownloadUrl,
                    filename: filename || `${projectInstanceData.name || 'presentation'}_${new Date().toISOString().split('T')[0]}.pdf`
                });
            } else {
                console.error('No download URL received from server');
                console.log('Variables state:', { downloadUrl, filename });
                throw new Error('No download URL received from server');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(t('interface.projectView.pdfGenerationError', 'Failed to generate PDF. Please try again.'));
            // Reset states on error
            setIsExportingPdf(false);
            setPdfDownloadReady(null);
            setPdfProgress(null);
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
      queryParams.append('quiz', columnVisibility.quiz ? '1' : '0');
      queryParams.append('onePager', columnVisibility.onePager ? '1' : '0');
      queryParams.append('videoPresentation', columnVisibility.videoPresentation ? '1' : '0');
      queryParams.append('lessonPresentation', columnVisibility.lessonPresentation ? '1' : '0');
      queryParams.append('time', columnVisibility.estCreationTime ? '1' : '0');
      queryParams.append('estCompletionTime', columnVisibility.estCompletionTime ? '1' : '0');
      queryParams.append('qualityTier', columnVisibility.qualityTier ? '1' : '0');
    }


    if (queryParams.toString()) {
      pdfUrl += `?${queryParams.toString()}`;
    }

    window.open(pdfUrl, '_blank');
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
        throw new Error(`${t('interface.projectView.failedToMoveToTrash', 'Failed to move to trash')}: ${resp.status} ${responseText.slice(0, 200)}`);
      }
      // redirect to products
      router.push('/projects');
    } catch (e: any) {
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
      case COMPONENT_NAME_LESSON_PLAN:
        // For lesson plans, we need to extract the lesson plan data from the project
        const lessonPlanData = projectInstanceData?.lesson_plan_data;
        if (!lessonPlanData) {
          return (
            <div className="text-center py-10">
              <p className="text-gray-500">No lesson plan data available.</p>
            </div>
          );
        }
        return (
          <LessonPlanView 
            lessonPlanData={lessonPlanData}
            allUserMicroproducts={allUserMicroproducts}
            parentProjectName={parentProjectNameForCurrentView}
          />
        );
      default:
        return <DefaultDisplayComponent instanceData={projectInstanceData} t={t} />;
    }
  };

  const displayName = projectInstanceData?.name || `${t('interface.projectView.project', 'Project')} ${projectId}`;
  const canEditContent = projectInstanceData &&
    [COMPONENT_NAME_PDF_LESSON, COMPONENT_NAME_VIDEO_LESSON, COMPONENT_NAME_QUIZ, COMPONENT_NAME_TEXT_PRESENTATION, COMPONENT_NAME_LESSON_PLAN].includes(projectInstanceData.component_name);

  // Determine product language for column labels
  const productLanguage = (editableData as any)?.detectedLanguage || 'en';
  const columnLabels = columnLabelLocalization[productLanguage as keyof typeof columnLabelLocalization] || columnLabelLocalization.en;

  return (
    <main 
      className="p-4 md:p-8 min-h-screen font-inter"
      style={{
        background: `linear-gradient(110.08deg, rgba(0, 187, 255, 0.2) 19.59%, rgba(0, 187, 255, 0.05) 80.4%), #FFFFFF`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div className="flex items-center gap-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-white rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{
                color: '#0F58F9',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em'
              }}
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 9L1 5L5 1" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('interface.projectView.back', 'Back')}
            </button>
            
            <button
              onClick={() => {
                console.log('Open Products button clicked - navigating to /projects');
                window.location.href = '/projects';
              }}
              className="flex items-center gap-2 bg-white rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{
                color: '#0F58F9',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em'
              }}
            >
              <FolderOpen size={14} style={{ color: '#0F58F9' }} />
              {t('interface.projectView.openProducts', 'Open Products')}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Edit button for editable content types */}
            {canEditContent && (
              <button
                onClick={handleToggleEdit}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium rounded-full shadow-sm focus:outline-none disabled:opacity-60 flex items-center transition-all duration-200 cursor-pointer ${isEditing
                  ? 'text-gray-700 bg-green-600/40 backdrop-blur-sm border border-green-500/20 hover:shadow-md'
                  : 'text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 hover:shadow-md'
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
              projectInstanceData.component_name === COMPONENT_NAME_VIDEO_LESSON_PRESENTATION ? (
                <VideoDownloadButton
                  projectName={projectInstanceData.name}
                  onError={(error) => {
                    console.error('Video generation error:', error);
                    alert(`Video generation failed: ${error}`);
                  }}
                  onSuccess={(downloadUrl) => {
                    console.log('Video generated successfully:', downloadUrl);
                  }}
                />
              ) : (
                <button
                  onClick={handlePdfDownload}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-blue-600/40 backdrop-blur-sm border border-blue-500/20 hover:shadow-md focus:outline-none disabled:opacity-60 flex items-center transition-all duration-200 cursor-pointer"
                  title={t('interface.projectView.downloadPdf', 'Download content as PDF')}
                >
                 <Download size={16} className="mr-2" /> {t('interface.projectView.downloadPdf', 'Download PDF')}
                </button>
              )
            )}

            {/* Smart Edit button for Training Plans */}
            {projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && projectId && (
              <button
                onClick={() => setShowSmartEditor(!showSmartEditor)}
                className="px-4 py-2 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-purple-600/40 backdrop-blur-sm border border-purple-500/20 hover:shadow-md focus:outline-none flex items-center transition-all duration-200 cursor-pointer"
                title={t('interface.projectView.smartEdit', 'Smart edit with AI')}
              >
                <Sparkles size={16} className="mr-2" /> {t('interface.projectView.smartEdit', 'Smart Edit')}
              </button>
            )}

            {/* Theme Picker button for Training Plans */}
            {projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && (
              <DropdownMenu open={showTrainingPlanThemePicker} onOpenChange={setShowTrainingPlanThemePicker}>
                <DropdownMenuTrigger asChild>
                <button
                    className="px-4 py-2 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 hover:shadow-md focus:outline-none flex items-center transition-all duration-200 cursor-pointer"
                  title="Change theme"
                >
                  <Palette size={16} className="mr-2" /> Theme
                  <ChevronDown size={16} className="ml-1" />
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20" style={{ backgroundColor: 'white' }}>
                  <div className="space-y-1">
                  {[
                      { id: 'cherry', label: 'Cherry (Default)', color: '#0540AB' },
                      { id: 'lunaria', label: 'Lunaria', color: '#85749E' },
                      { id: 'wine', label: 'Wine', color: '#0540AB' },
                      { id: 'vanilla', label: 'Vanilla (Engenuity)', color: '#8776A0' },
                      { id: 'terracotta', label: 'Terracotta (Deloitte)', color: '#2D7C21' },
                      { id: 'zephyr', label: 'Zephyr', color: '#0540AB' }
                    ].map((theme) => {
                      const trainingPlanData = editableData as TrainingPlanData | null;
                      const currentTheme = trainingPlanData?.theme || 'cherry';
                      const isSelected = currentTheme === theme.id;
                      
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleTrainingPlanThemeChange(theme.id)}
                        className={`w-full py-1.5 pr-8 pl-2 text-left text-sm hover:bg-gray-50 rounded cursor-pointer flex items-center gap-2 ${isSelected ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'}`}
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: theme.color }}
                          />
                          <span className="flex-1">{theme.label}</span>
                          {isSelected && (
                          <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Role Visibility Dropdown - only for Training Plans */}
            {projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && (
              <>
                <button
                  onClick={() => setRoleAccess(!roleAccess)}
                  className="px-4 py-2 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-sky-200/40 backdrop-blur-sm border border-sky-300/30 hover:shadow-md focus:outline-none flex items-center transition-all duration-200 cursor-pointer"
                  title={t('interface.projectView.configureAccessControl', 'Configure access control')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('interface.projectView.ManageAccess', 'Manage Access')}
                </button>

                {/* Role Access Modal */}
                {roleAccess && createPortal(
                  <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
                    onClick={() => setRoleAccess(false)}
                  >
                    <div
                      className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-2xl font-regular text-gray-900">{t('interface.projectView.addMember', 'Add member to product')}</h2>
                        <button
                          onClick={() => setRoleAccess(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="px-6 pb-6">
                        {/* Add Member Input */}
                        <div className="mb-6">
                          <div className="flex gap-3">
                                <input
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder={t('interface.projectView.addMembersToProduct', 'Add members to product')}
                              className="flex-1 px-4 py-3 text-sm placeholder-gray-400 text-gray-400 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                            />
                            <button
                              onClick={handleAddEmail}
                              disabled={!newEmail.trim()}
                              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t('interface.projectView.add', 'Add')}
                            </button>
                          </div>
                        </div>

                        {/* Members with access */}
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-900 mb-3">{t('interface.projectView.membersWithAccess', 'Members with access')}</h3>
                          <div className="space-y-3 max-h-42 overflow-y-auto pr-2">
                            {customEmails.map((email) => {
                              const currentRole = emailRoles[email] || 'editor';
                              const roleLabel = predefinedRoles.find(r => r.id === currentRole)?.label || 'Editor';
                              return (
                                <div key={email} className="flex items-center justify-between p-2 bg-white rounded-lg min-h-[52px]">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium mr-3">
                                      {email.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-900">{email}</span>
                                  </div>
                                  <div className="relative" data-email-role-section>
                                    <div
                                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                                      onClick={() => setShowEmailRoleDropdown(showEmailRoleDropdown === email ? null : email)}
                                    >
                                      <span className="text-sm text-gray-900">{roleLabel}</span>
                                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                    </div>

                                    {/* Email Role Dropdown */}
                                    {showEmailRoleDropdown === email && (
                                      <div className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-[10001] p-2 min-w-32 max-h-48 overflow-y-auto" style={{
                                        top: '50%',
                                        left: '55%',
                                        transform: 'translate(-50%, -50%)'
                                      }}>
                                        <div className="space-y-1">
                                          {predefinedRoles.map((role) => (
                                            <div
                                              key={role.id}
                                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${currentRole === role.id ? 'bg-blue-50' : ''}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEmailRoleChange(email, role.id);
                                                setShowEmailRoleDropdown(null);
                                              }}
                                            >
                                              <span className="text-sm font-medium text-gray-900">{role.label}</span>
                              </div>
                            ))}
                                          <div className="border-t border-gray-200 pt-1 mt-1">
                                            <div
                                              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-red-50 text-red-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveEmail(email);
                                                setShowEmailRoleDropdown(null);
                                              }}
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                              <span className="text-sm font-medium">Remove</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {customEmails.length === 0 && (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                {t('interface.projectView.noMembersYet', 'No members added yet')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* General access */}
                        <div className="mb-6" data-general-access-section>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">{t('interface.projectView.generalAccess', 'General access')}</h3>
                          <div className="relative">
                            <div
                              className="p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => setShowGeneralAccessDropdown(!showGeneralAccessDropdown)}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-1 ${generalAccessOption === 'restricted' ? 'bg-[#D9D9D9]' : 'bg-[#C4EED0]'}`}>
                                  {generalAccessOption === 'restricted' ? (
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 55.818 55.818" xmlns="http://www.w3.org/2000/svg">
                                      <g id="Group_6" data-name="Group 6" transform="translate(-1212.948 -289.602)">
                                        <path id="Path_19" data-name="Path 19" d="M1249.54,294.79s-4.5.25-5,6.25a17.908,17.908,0,0,0,2.5,10.5s2.193-1.558-.028,5.971,7.278,14.529,10.778,6.279-.5-11.783,2-12.641a33.771,33.771,0,0,0,5.382-2.6l-3.229-6.081-5.21-5.421-7.43-4.027Z" fill="#231f20" />
                                        <path id="Path_20" data-name="Path 20" d="M1219.365,331.985s2.675-14.195,6.425-10.695.25,5.5,2.5,9,5.25,1.5,5.5,5.5.755,6.979,2.618,7.241S1222.967,339.984,1219.365,331.985Z" fill="#231f20" />
                                        <path id="Path_21" data-name="Path 21" d="M1266.766,317.511a25.909,25.909,0,1,1-25.91-25.909A25.909,25.909,0,0,1,1266.766,317.511Z" fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" />
                                        <path id="Path_22" data-name="Path 22" d="M1240.122,311.619a6.078,6.078,0,1,1-6.078-6.079A6.079,6.079,0,0,1,1240.122,311.619Z" fill="#231f20" />
                                      </g>
                                    </svg>
                                  )}
                          </div>
                                <span className="text-sm -mt-3 font-medium text-gray-900">
                                  {generalAccessOption === 'restricted'
                                    ? t('interface.projectView.restricted', 'Restricted')
                                    : t('interface.projectView.anyoneWithLink', 'Anyone with link')
                                  }
                                </span>
                                <svg className="w-4 h-4 -mt-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <p className="text-xs -mt-2 text-gray-600 ml-10">
                                {generalAccessOption === 'restricted'
                                  ? t('interface.projectView.onlyMembersWithAccess', 'Only members with access can open with the link.')
                                  : t('interface.projectView.anyoneOnTheInternet', 'Anyone on the internet with the link can view.')
                                }
                              </p>
                        </div>

                            {/* General Access Dropdown */}
                            {showGeneralAccessDropdown && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3">
                                <div className="space-y-2">
                                  <div
                                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                                    onClick={() => {
                                      setGeneralAccessOption('restricted');
                                      setShowGeneralAccessDropdown(false);
                                    }}
                                  >
                                    <div className="w-6 h-6 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-900">{t('interface.projectView.restricted', 'Restricted')}</span>
                                      <p className="text-xs text-gray-500">{t('interface.projectView.onlyMembersWithAccess', 'Only members with access can open with the link.')}</p>
                                    </div>
                                  </div>
                                  <div
                                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                                    onClick={() => {
                                      setGeneralAccessOption('anyone');
                                      setShowGeneralAccessDropdown(false);
                                    }}
                                  >
                                    <div className="w-6 h-6 bg-[#C4EED0] rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-gray-600" viewBox="0 0 55.818 55.818" xmlns="http://www.w3.org/2000/svg">
                                        <g id="Group_6" data-name="Group 6" transform="translate(-1212.948 -289.602)">
                                          <path id="Path_19" data-name="Path 19" d="M1249.54,294.79s-4.5.25-5,6.25a17.908,17.908,0,0,0,2.5,10.5s2.193-1.558-.028,5.971,7.278,14.529,10.778,6.279-.5-11.783,2-12.641a33.771,33.771,0,0,0,5.382-2.6l-3.229-6.081-5.21-5.421-7.43-4.027Z" fill="#231f20" />
                                          <path id="Path_20" data-name="Path 20" d="M1219.365,331.985s2.675-14.195,6.425-10.695.25,5.5,2.5,9,5.25,1.5,5.5,5.5.755,6.979,2.618,7.241S1222.967,339.984,1219.365,331.985Z" fill="#231f20" />
                                          <path id="Path_21" data-name="Path 21" d="M1266.766,317.511a25.909,25.909,0,1,1-25.91-25.909A25.909,25.909,0,0,1,1266.766,317.511Z" fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" />
                                          <path id="Path_22" data-name="Path 22" d="M1240.122,311.619a6.078,6.078,0,1,1-6.078-6.079A6.079,6.079,0,0,1,1240.122,311.619Z" fill="#231f20" />
                                        </g>
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-900">{t('interface.projectView.anyoneWithLink', 'Anyone with link')}</span>
                                      <p className="text-xs text-gray-500">{t('interface.projectView.anyoneOnTheInternet', 'Anyone on the internet with the link can view.')}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Roles that have access */}
                        <div className="mb-6" data-roles-section>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">{t('interface.projectView.rolesThatHaveAccess', 'Roles that have access')}</h3>
                          <div className="relative">
                            <div
                              className="flex gap-2 p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors overflow-x-auto scrollbar-hide"
                              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                            >
                              {selectedRoles.map((roleId) => {
                                const role = predefinedRoles.find(r => r.id === roleId);
                                return role ? (
                                  <div key={roleId} className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full">
                                    <span className="text-xs text-gray-700">{role.label}</span>
                          <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoleToggle(roleId);
                                      }}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                                    </button>
                                  </div>
                                ) : null;
                              })}
                              {selectedRoles.length === 0 && (
                                <span className="text-gray-500 text-sm">{t('interface.projectView.noRolesSelected', 'No roles selected')}</span>
                              )}
                              <div className="ml-auto">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            {/* Role Dropdown */}
                            {showRoleDropdown && (
                              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3">
                                <div className="space-y-2">
                                  {predefinedRoles.map((role) => (
                                    <label key={role.id} className="flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role.id)}
                                        onChange={() => handleRoleToggle(role.id)}
                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                      />
                                      <div>
                                        <span className="text-sm font-medium text-gray-900">{role.label}</span>
                                        <p className="text-xs text-gray-500">{role.description}</p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Copy link button */}
                        <div className="flex justify-start">
                          <button className="px-6 py-3 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-3xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {t('interface.projectView.copyLink', 'Copy link')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              </>
            )}

            {/* Column Visibility Dropdown - only for Course Outline (Training Plan) products */}
            {projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && (
              <DropdownMenu open={showColumnDropdown} onOpenChange={setShowColumnDropdown}>
                <DropdownMenuTrigger asChild>
                <button
                    className="px-4 py-2 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 hover:shadow-md focus:outline-none flex items-center transition-all duration-200 cursor-pointer"
                  title={t('interface.projectView.configureVisibleColumns', 'Configure visible columns')}
                >
                  <Info size={16} className="mr-2" />
                  {t('interface.projectView.columns', 'Columns')}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10" style={{ backgroundColor: 'white' }}>
                  <div className="space-y-1">
                      {/* Training Plan specific columns */}
                      {projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && (
                        <>
                        <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={columnVisibility.knowledgeCheck}
                              onChange={(e) => handleColumnVisibilityChange('knowledgeCheck', e.target.checked)}
                            className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{columnLabels.assessmentType}</span>
                          </label>
                        <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={columnVisibility.contentAvailability}
                              onChange={(e) => handleColumnVisibilityChange('contentAvailability', e.target.checked)}
                            className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{columnLabels.contentVolume}</span>
                          </label>
                        <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={columnVisibility.informationSource}
                              onChange={(e) => handleColumnVisibilityChange('informationSource', e.target.checked)}
                            className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{columnLabels.source}</span>
                          </label>
                        <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={columnVisibility.estCreationTime}
                              onChange={(e) => handleColumnVisibilityChange('estCreationTime', e.target.checked)}
                            className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{columnLabels.estCreationTime}</span>
                          </label>
                        <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={columnVisibility.estCompletionTime}
                              onChange={(e) => handleColumnVisibilityChange('estCompletionTime', e.target.checked)}
                            className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{columnLabels.estCompletionTime}</span>
                          </label>
                        <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={columnVisibility.qualityTier}
                              onChange={(e) => handleColumnVisibilityChange('qualityTier', e.target.checked)}
                            className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{columnLabels.qualityTier}</span>
                          </label>
                        </>
                      )}

                      {/* Common columns for all component types */}
                    <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columnVisibility.quiz}
                          onChange={(e) => handleColumnVisibilityChange('quiz', e.target.checked)}
                        className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Quiz</span>
                      </label>
                    <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columnVisibility.onePager}
                          onChange={(e) => handleColumnVisibilityChange('onePager', e.target.checked)}
                        className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">One-Pager</span>
                      </label>
                    <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columnVisibility.videoPresentation}
                          onChange={(e) => handleColumnVisibilityChange('videoPresentation', e.target.checked)}
                        className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Video Lesson</span>
                      </label>
                    <label className="flex items-center gap-2 py-1.5 pr-8 pl-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columnVisibility.lessonPresentation}
                          onChange={(e) => handleColumnVisibilityChange('lessonPresentation', e.target.checked)}
                        className="rounded border-gray-100 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Presentation</span>
                      </label>
                    </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* Move to Trash button for non-outline microproducts placed as right-most */}
            {projectInstanceData && projectInstanceData.component_name !== COMPONENT_NAME_TRAINING_PLAN && (
              <button
                onClick={handleMoveToTrash}
                className="px-4 py-2 text-sm font-medium rounded-full shadow-sm text-red-700 bg-red-50/40 backdrop-blur-sm border border-red-400/30 hover:shadow-md focus:outline-none flex items-center transition-all duration-200 cursor-pointer"
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

        {/* Smart Prompt Editor - render outside the white content container */}
        {showSmartEditor && projectInstanceData && projectInstanceData.component_name === COMPONENT_NAME_TRAINING_PLAN && (
          <SmartPromptEditor
            projectId={projectInstanceData.project_id}
            onContentUpdate={handleSmartEditContentUpdate}
            onError={handleSmartEditError}
            onRevert={handleSmartEditRevert}
            currentLanguage={(editableData as TrainingPlanData | null)?.detectedLanguage}
            currentTheme={(editableData as TrainingPlanData | null)?.theme}
          />
        )}

        <div className="bg-transparent p-4 sm:p-6 md:p-8 rounded-xl">
          <Suspense fallback={<div className="py-10 text-center text-gray-500">{t('interface.projectView.loadingContentDisplay', 'Loading content display...')}</div>}>
            {displayContent()}
          </Suspense>
        </div>
      </div>

      {/* PDF Export Loading Modal */}
      <PdfExportLoadingModal 
        isOpen={isExportingPdf} 
        projectName={projectInstanceData?.name || 'Presentation'} 
        pdfDownloadReady={pdfDownloadReady}
        pdfProgress={pdfProgress}
        onDownload={handleDownloadPdf}
        onClose={handleClosePdfModal}
      />
    </main>
  );
}