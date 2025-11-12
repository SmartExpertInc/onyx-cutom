// custom_extensions/frontend/src/app/projects/view-link/[projectId]/page.tsx
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
import PdfLessonDisplayComponent from '@/components/PdfLessonDisplay';
import EditorPage from '@/components/EditorPage';
import VideoLessonDisplay from '@/components/VideoLessonDisplay';
import VideoProductDisplay from '@/components/VideoProductDisplay';
import QuizDisplay from '@/components/QuizDisplay';
import TextPresentationDisplay from '@/components/TextPresentationDisplay';
import { LessonPlanView } from '@/components/LessonPlanView';
import CourseDisplay, { LessonContentStatusMap } from '@/components/CourseDisplay';
import { useLanguage } from '../../../../contexts/LanguageContext';
import workspaceService, { 
  Workspace, 
  WorkspaceRole, 
  WorkspaceMember, 
  ProductAccess,
  ProductAccessCreate 
} from '../../../../services/workspaceService';

import { Save, Edit, ArrowDownToLine, Info, AlertTriangle, Trash2, XCircle } from 'lucide-react';
import { SmartSlideDeckViewer } from '@/components/SmartSlideDeckViewer';
import PresentationLayout from '@/components/PresentationLayout';
import CommentsForGeneratedProduct from '@/components/CommentsForGeneratedProduct';
import ProductQualityRating from '@/components/ProductQualityRating';
import { useTheme } from '@/hooks/useTheme';
import { createPortal } from 'react-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useFeaturePermission from '../../../../hooks/useFeaturePermission';
import ScormDownloadButton from '@/components/ScormDownloadButton';
import { ToastProvider } from '@/components/ui/toast';
import { ProductViewHeader } from '@/components/ProductViewHeader';
import { generateTextPresentationHtml } from '@/lib/textPresentationHtmlExport';
import { trackOpenProductEditor, trackSaveDraft } from '@/lib/mixpanelClient';

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
const COMPONENT_NAME_VIDEO_PRODUCT = "VideoProductDisplay";
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
  const { isEnabled: scormEnabled } = useFeaturePermission('export_scorm_2004');

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

  // Force app background to #F2F2F4 only while this page is mounted
  useEffect(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    if (!root) return;

    const computed = getComputedStyle(root);
    const prev = {
      start: computed.getPropertyValue('--gradient-start'),
      mid1: computed.getPropertyValue('--gradient-mid1'),
      mid2: computed.getPropertyValue('--gradient-mid2'),
      end: computed.getPropertyValue('--gradient-end'),
    };

    root.style.setProperty('--gradient-start', '#F2F2F4');
    root.style.setProperty('--gradient-mid1', '#F2F2F4');
    root.style.setProperty('--gradient-mid2', '#F2F2F4');
    root.style.setProperty('--gradient-end', '#F2F2F4');

    return () => {
      root.style.setProperty('--gradient-start', prev.start.trim() || '#FFF9F5');
      root.style.setProperty('--gradient-mid1', prev.mid1.trim() || '#ECECFF');
      root.style.setProperty('--gradient-mid2', prev.mid2.trim() || '#BFD7FF');
      root.style.setProperty('--gradient-end', prev.end.trim() || '#CCE8FF');
    };
  }, []);

  const [projectInstanceData, setProjectInstanceData] = useState<ProjectInstanceDetail | null>(null);
  const [allUserMicroproducts, setAllUserMicroproducts] = useState<ProjectListItem[] | undefined>(undefined);
  const [currentProjectType, setCurrentProjectType] = useState<string>('unknown');
  const [parentProjectNameForCurrentView, setParentProjectNameForCurrentView] = useState<string | undefined>(undefined);
  const [projectCreatedAt, setProjectCreatedAt] = useState<string | null>(null);

  const [pageState, setPageState] = useState<'initial_loading' | 'fetching' | 'error' | 'success' | 'nodata'>('initial_loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<MicroProductContentData>(null);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedDataRef = useRef<MicroProductContentData | null>(null);
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
  
  const [isAuthorized, setIsAuthorized] = useState(true);

  const normalizeDateValue = (value: string | Date | null | undefined) => {
    if (!value) return null;
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  };


  // State for the absolute chat URL
  const [chatRedirectUrl, setChatRedirectUrl] = useState<string | null>(null);

  /* --- Persist column visibility (displayOptions) once after creation --- */
  const [displayOptsSynced, setDisplayOptsSynced] = useState(false);

  // Column visibility controls for Training Plan table
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  // Theme picker state for slide decks

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

  // Feature flags for column visibility options
  const { isEnabled: colAssessmentTypeEnabled } = useFeaturePermission('col_assessment_type');
  const { isEnabled: colContentVolumeEnabled } = useFeaturePermission('col_content_volume');
  const { isEnabled: colSourceEnabled } = useFeaturePermission('col_source');
  const { isEnabled: colEstCreationTimeEnabled } = useFeaturePermission('col_est_creation_time');
  const { isEnabled: colEstCompletionTimeEnabled } = useFeaturePermission('col_est_completion_time');
  const { isEnabled: colQualityTierEnabled } = useFeaturePermission('col_quality_tier');
  const { isEnabled: colQuizEnabled } = useFeaturePermission('col_quiz');
  const { isEnabled: colOnePagerEnabled } = useFeaturePermission('col_one_pager');
  const { isEnabled: colVideoPresentationEnabled } = useFeaturePermission('col_video_presentation');
  const { isEnabled: colLessonPresentationEnabled } = useFeaturePermission('col_lesson_presentation');
  const { isEnabled: workspaceTabEnabled } = useFeaturePermission('workspace_tab');

  // Apply feature flags to compute effective visibility used for rendering and exporting
  const effectiveColumnVisibility = useMemo(() => ({
    knowledgeCheck: columnVisibility.knowledgeCheck && colAssessmentTypeEnabled,
    contentAvailability: columnVisibility.contentAvailability && colContentVolumeEnabled,
    informationSource: columnVisibility.informationSource && colSourceEnabled,
    estCreationTime: columnVisibility.estCreationTime && colEstCreationTimeEnabled,
    estCompletionTime: columnVisibility.estCompletionTime && colEstCompletionTimeEnabled,
    qualityTier: columnVisibility.qualityTier && colQualityTierEnabled,
    quiz: columnVisibility.quiz && colQuizEnabled,
    onePager: columnVisibility.onePager && colOnePagerEnabled,
    videoPresentation: columnVisibility.videoPresentation && colVideoPresentationEnabled,
    lessonPresentation: columnVisibility.lessonPresentation && colLessonPresentationEnabled,
  }), [
    columnVisibility,
    colAssessmentTypeEnabled,
    colContentVolumeEnabled,
    colSourceEnabled,
    colEstCreationTimeEnabled,
    colEstCompletionTimeEnabled,
    colQualityTierEnabled,
    colQuizEnabled,
    colOnePagerEnabled,
    colVideoPresentationEnabled,
    colLessonPresentationEnabled,
  ]);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnDropdown, showRoleDropdown, showGeneralAccessDropdown, showEmailRoleDropdown]);

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
    setProjectCreatedAt(null);
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
      console.log('🎬 [CRITICAL DEBUG] Frontend requesting project data:', {
        currentProjectIdStr,
        instanceApiUrl,
        timestamp: new Date().toISOString()
      });
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
      
      // Check if this is a landing page project and redirect accordingly
      if (instanceData.name && instanceData.name.includes("AI-Аудит Landing Page")) {
        if (instanceData.name.includes("Commercial Proposal")) {
          console.log('🔄 [COMMERCIAL PROPOSAL DETECTED] Redirecting to commercial proposal page:', instanceData.project_id);
          router.push(`/create/commercial-proposal/${instanceData.project_id}`);
          return;
        }
        console.log('🔄 [LANDING PAGE DETECTED] Redirecting to dynamic landing page:', instanceData.project_id);
        router.push(`/create/audit-2-dynamic/${instanceData.project_id}`);
        return;
      }
      
      // Check if this is an Event Poster project and redirect accordingly
      if (instanceData.name && instanceData.name.startsWith("Event Poster:")) {
        console.log('🔄 [EVENT POSTER DETECTED] Redirecting to event poster page:', instanceData.project_id);
        // Redirect directly with project ID (same as AI audit approach)
        router.push(`/create/event-poster/results/${instanceData.project_id}`);
        return;
      }
      
      // 🔍 FETCH DATA LOGGING: What we got back from backend
      console.log('📥 [FETCH DATA] Received from backend:', {
        instanceData,
        instanceDataStringified: JSON.stringify(instanceData, null, 2),
        details: instanceData.details,
        detailsStringified: JSON.stringify(instanceData.details, null, 2),
        componentName: instanceData.component_name,
        hasDetails: !!instanceData.details
      });
      
      // 🔍 CRITICAL DEBUG: Verify project ID match
      console.log('🎬 [CRITICAL DEBUG] Project ID verification:', {
        requestedProjectId: currentProjectIdStr,
        receivedProjectId: instanceData.project_id,
        projectIdMatch: currentProjectIdStr === instanceData.project_id?.toString(),
        componentName: instanceData.component_name,
        hasDetails: !!instanceData.details
      });
      
      // 🔍 CRITICAL DEBUG: For video products, log the exact data structure
      if (instanceData.component_name === COMPONENT_NAME_VIDEO_PRODUCT) {
        const videoDetails = instanceData.details as any;
        console.log('🎬 [CRITICAL DEBUG] Video product data analysis:', {
          componentName: instanceData.component_name,
          hasDetails: !!instanceData.details,
          detailsType: typeof instanceData.details,
          detailsKeys: instanceData.details ? Object.keys(instanceData.details) : 'no details',
          detailsContent: instanceData.details,
          hasVideoUrl: videoDetails?.videoUrl ? 'YES' : 'NO',
          hasVideoJobId: videoDetails?.videoJobId ? 'YES' : 'NO',
          hasThumbnailUrl: videoDetails?.thumbnailUrl ? 'YES' : 'NO',
          videoUrlValue: videoDetails?.videoUrl,
          videoJobIdValue: videoDetails?.videoJobId,
          thumbnailUrlValue: videoDetails?.thumbnailUrl
        });
      }

      setProjectInstanceData(instanceData);
      const instanceCreatedAt = (instanceData as any)?.createdAt ?? (instanceData as any)?.created_at;
      const normalizedInstanceDate = normalizeDateValue(instanceCreatedAt);
      if (normalizedInstanceDate) {
        setProjectCreatedAt(normalizedInstanceDate);
      }

      if (typeof window !== 'undefined' && instanceData.sourceChatSessionId) {
        setChatRedirectUrl(`${window.location.origin}/chat?chatId=${instanceData.sourceChatSessionId}`);
      }

      if (listRes.ok) {
        const allMicroproductsData: ProjectListItem[] = await listRes.json();
        setAllUserMicroproducts(allMicroproductsData);
        const currentMicroproductInList = allMicroproductsData.find(mp => mp.id === instanceData.project_id);
        setCurrentProjectType(currentMicroproductInList?.design_microproduct_type || 'unknown');
        setParentProjectNameForCurrentView(currentMicroproductInList?.projectName);
        const listItemCreatedAt = (currentMicroproductInList as any)?.createdAt ?? (currentMicroproductInList as any)?.created_at;
        const normalizedListDate = normalizeDateValue(listItemCreatedAt);
        if (normalizedListDate) {
          setProjectCreatedAt(normalizedListDate);
        }
        // Resilient Event Poster detection based on parent project name (cannot be renamed)
        const parentName = currentMicroproductInList?.projectName || '';
        if (parentName.includes('Event Poster')) {
          console.log('🔄 [EVENT POSTER DETECTED VIA PARENT] Redirecting to event poster page:', instanceData.project_id);
          router.push(`/create/event-poster/results/${instanceData.project_id}`);
          return;
        }
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
        } else if (instanceData.component_name === COMPONENT_NAME_VIDEO_PRODUCT) {
          console.log('🎬 [VIDEO_PRODUCT_DATA] Setting editableData from backend details:', {
            copiedDetails,
            copiedDetailsStringified: JSON.stringify(copiedDetails, null, 2),
            videoJobId: copiedDetails?.videoJobId,
            videoUrl: copiedDetails?.videoUrl,
            thumbnailUrl: copiedDetails?.thumbnailUrl,
            component_name: copiedDetails?.component_name
          });
          
          // 🔍 CRITICAL DEBUG: Log the exact data being set
          console.log('🎬 [VIDEO_PRODUCT_DATA] About to set editableData with:', {
            type: typeof copiedDetails,
            keys: Object.keys(copiedDetails || {}),
            hasVideoUrl: 'videoUrl' in (copiedDetails || {}),
            hasThumbnailUrl: 'thumbnailUrl' in (copiedDetails || {}),
            hasVideoJobId: 'videoJobId' in (copiedDetails || {}),
            videoUrlValue: copiedDetails?.videoUrl,
            thumbnailUrlValue: copiedDetails?.thumbnailUrl,
            videoJobIdValue: copiedDetails?.videoJobId
          });
          
          // 🔧 FIX: Check if we have video data, if not, check for nested data or use fallback
          if (copiedDetails?.videoUrl && copiedDetails?.videoJobId) {
            // We have proper video data
            setEditableData(copiedDetails as any);
          } else {
            // 🔍 DEBUG: Check if video data is nested somewhere else
            console.log('🎬 [VIDEO_PRODUCT_DATA] ⚠️ No video data found in copiedDetails, checking for nested data...');
            console.log('🎬 [VIDEO_PRODUCT_DATA] Full copiedDetails structure:', JSON.stringify(copiedDetails, null, 2));
            
            // Check if video data is in a nested property
            let videoData = null;
            if (copiedDetails && typeof copiedDetails === 'object') {
              // Look for video data in any nested object
              for (const [key, value] of Object.entries(copiedDetails)) {
                if (value && typeof value === 'object' && ('videoUrl' in value || 'videoJobId' in value)) {
                  console.log(`🎬 [VIDEO_PRODUCT_DATA] ⚠️ FOUND VIDEO DATA IN NESTED PROPERTY '${key}':`, value);
                  videoData = value;
                  break;
                }
              }
            }
            
            if (videoData) {
              setEditableData(videoData as any);
            } else {
              // Fallback: create default video product data
              console.log('🎬 [VIDEO_PRODUCT_DATA] ⚠️ No video data found anywhere, using fallback');
              setEditableData({
                videoJobId: 'unknown',
                videoUrl: '',
                thumbnailUrl: '',
                generatedAt: new Date().toISOString(),
                sourceSlides: [],
                component_name: 'VideoProductDisplay'
              } as any);
            }
          }
        } else {
          setEditableData(copiedDetails);
        }
        // Initialize last saved data reference when data is first loaded
        lastSavedDataRef.current = JSON.parse(JSON.stringify(copiedDetails));
      } else {
        const lang = instanceData.detectedLanguage || 'en';
        let newData: MicroProductContentData = null;
        if (instanceData.component_name === COMPONENT_NAME_TRAINING_PLAN) {
          newData = { mainTitle: instanceData.name || t('interface.projectView.newTrainingPlanTitle', 'New Training Plan'), sections: [], detectedLanguage: lang };
        } else if (instanceData.component_name === COMPONENT_NAME_PDF_LESSON) {
          newData = { lessonTitle: instanceData.name || t('interface.projectView.newPdfLessonTitle', 'New PDF Lesson'), contentBlocks: [], detectedLanguage: lang };
        } else if (instanceData.component_name === COMPONENT_NAME_SLIDE_DECK) {
          newData = { lessonTitle: instanceData.name || t('interface.projectView.newSlideDeckTitle', 'New Slide Deck'), slides: [], detectedLanguage: lang };
        } else if (instanceData.component_name === COMPONENT_NAME_VIDEO_LESSON) {
          newData = { mainPresentationTitle: instanceData.name || t('interface.projectView.newVideoLessonTitle', 'New Video Lesson'), slides: [], detectedLanguage: lang };
        } else if (instanceData.component_name === COMPONENT_NAME_QUIZ) {
          newData = { quizTitle: instanceData.name || t('interface.projectView.newQuizTitle', 'New Quiz'), questions: [], detectedLanguage: lang };
        } else if (instanceData.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
          newData = { textTitle: instanceData.name || t('interface.projectView.newTextPresentationTitle', 'New Text Presentation'), contentBlocks: [], detectedLanguage: lang };
        } else if (instanceData.component_name === COMPONENT_NAME_VIDEO_PRODUCT) {
          console.log('🎬 [VIDEO_PRODUCT_DATA] No details data, setting default video product data');
          setEditableData({ 
            videoJobId: 'unknown',
            videoUrl: '',
            thumbnailUrl: '',
            generatedAt: new Date().toISOString(),
            sourceSlides: [],
            component_name: 'VideoProductDisplay'
          } as any);}
        setEditableData(newData);
        // Initialize last saved data reference when creating new data
        lastSavedDataRef.current = newData ? JSON.parse(JSON.stringify(newData)) : null;
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
        (projectInstanceData && projectInstanceData.project_id?.toString() !== projectId);

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
      // Update the last saved data reference after successful manual save
      lastSavedDataRef.current = JSON.parse(JSON.stringify(processedEditableData));
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

    // Check if data has actually changed
    const currentDataString = JSON.stringify(editableData);
    const lastSavedDataString = lastSavedDataRef.current ? JSON.stringify(lastSavedDataRef.current) : null;
    
    if (currentDataString === lastSavedDataString) {
      console.log('Auto-save: No changes detected, skipping save');
      return; // No changes, skip save
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

        // Update the last saved data reference after successful save
        lastSavedDataRef.current = JSON.parse(JSON.stringify(editableData));

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

  useEffect(() => {
    if (editableData == null) return;
    console.log('Auto-save: Editable data changed, triggering auto-save');
    handleAutoSave();
  }, [editableData]);

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
      // Track open product editor event
      trackOpenProductEditor();
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
    console.log('🔍 PDF Download Debug - Start:', {
      projectInstanceData: projectInstanceData?.component_name,
      projectId: projectInstanceData?.project_id,
      projectIdType: typeof projectInstanceData?.project_id,
      componentName: projectInstanceData?.component_name
    });

    if (!projectInstanceData || !projectInstanceData.project_id) {
      console.error('🔍 PDF Download Debug - Missing data:', { projectInstanceData, projectId: projectInstanceData?.project_id });
      alert(t('interface.projectView.projectDataOrIdNotAvailableForDownload', 'Project data or ID is not available for download.'));
      return;
    }

    // Special handling for text presentations
    if (projectInstanceData.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
        console.log('🔍 PDF Download Debug - Text Presentation detected, starting PDF generation...');
        setIsExportingPdf(true);
        setPdfProgress({ current: 0, total: 1, message: 'Generating PDF...' });
        
        try {
            console.log('🔍 PDF Download Debug - Making request to:', `${CUSTOM_BACKEND_URL}/pdf/text-presentation/${projectInstanceData.project_id}`);
            
            // Generate HTML content from editableData (with image conversion to data URIs)
            const htmlContent = await generateTextPresentationHtml(
                editableData as TextPresentationData,
                projectInstanceData.name || 'Text Presentation'
            );
            
            console.log('🔍 PDF Download Debug - Generated HTML content length:', htmlContent.length);
            
            const response = await fetch(`${CUSTOM_BACKEND_URL}/pdf/text-presentation/${projectInstanceData.project_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    html_content: htmlContent,
                    filename: projectInstanceData.name || 'text-presentation'
                })
            });

            console.log('🔍 PDF Download Debug - Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 PDF Download Debug - Error response:', errorText);
                throw new Error(`PDF generation failed: ${response.status} - ${errorText}`);
            }

            // Get the response JSON with download URL
            const responseData = await response.json();
            console.log('🔍 PDF Download Debug - Response data:', responseData);
            
            if (responseData.download_url) {
                // Download the generated PDF
                const downloadResponse = await fetch(`${CUSTOM_BACKEND_URL}${responseData.download_url}`, {
                    credentials: 'same-origin'
                });
                
                if (!downloadResponse.ok) {
                    throw new Error('Failed to download PDF');
                }
                
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = responseData.filename || `${projectInstanceData.name || 'text-presentation'}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
            
            // Close the modal
            setIsExportingPdf(false);
            setPdfProgress(null);
        } catch (error) {
            console.error('Error generating text presentation PDF:', error);
            alert(t('interface.projectView.pdfGenerationError', 'Failed to generate PDF. Please try again.'));
            setIsExportingPdf(false);
            setPdfProgress(null);
        }
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

            // Track save draft event
            trackSaveDraft(sessionStorage.getItem('activeProductType') || currentProjectType, 'pdf', 'Completed');

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
            // Track save draft event
            trackSaveDraft(sessionStorage.getItem('activeProductType') || currentProjectType, 'pdf', 'Failed');
        }
        return;
    }

    // Track save draft event
    trackSaveDraft(sessionStorage.getItem('activeProductType') || currentProjectType, 'pdf', 'Completed');

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

  const trainingPlanContent = editableData as TrainingPlanData | null;

  const totalModules = trainingPlanContent?.sections?.length ?? 0;
  const totalLessons =
    trainingPlanContent?.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) ?? 0;

  const courseMetrics = useMemo(() => {
    const completedLessons = 0;
    if (totalLessons === 0) {
      return {
        completed: completedLessons,
        estimatedDuration: '0h 0m',
        estimatedCompletionTime: '0h 0m',
        creditsUsed: 5,
        creditsTotal: 100,
        progress: 0,
        totalModules,
        totalLessons
      };
    }

    const hours = Math.ceil(totalLessons * 0.5);
    const minutes = Math.ceil((totalLessons * 0.5 % 1) * 60);
    const duration = `${hours}h ${minutes}m`;

    return {
      completed: completedLessons,
      estimatedDuration: duration,
      estimatedCompletionTime: duration,
      creditsUsed: 5,
      creditsTotal: 100,
      progress: Math.round((completedLessons / totalLessons) * 100),
      totalModules,
      totalLessons
    };
  }, [totalLessons, totalModules]);

  const lessonContentStatus: LessonContentStatusMap = useMemo(() => {
    const status: LessonContentStatusMap = {};

    if (!trainingPlanContent?.sections || !projectInstanceData) {
      return status;
    }

    const outlineName = (trainingPlanContent.mainTitle || projectInstanceData.name || '').trim();
    if (!outlineName) {
      return status;
    }

    const projects = allUserMicroproducts ?? [];

    trainingPlanContent.sections.forEach((section) => {
      section.lessons?.forEach((lesson) => {
        const lessonKey = lesson.id || lesson.title;
        if (!lessonKey) {
          return;
        }

        status[lessonKey] = {
          presentation: { exists: false },
          onePager: { exists: false },
          quiz: { exists: false },
          videoLesson: { exists: false }
        };

        const expectedProjectName = `${outlineName}: ${lesson.title}`;
        const legacyQuizPattern = `Quiz - ${outlineName}: ${lesson.title}`;
        const legacyTextPresentationPattern = `Text Presentation - ${outlineName}: ${lesson.title}`;

        projects.forEach((project) => {
          const projectName = project.projectName?.trim();
          if (!projectName) return;

          if (
            projectName !== expectedProjectName &&
            projectName !== legacyQuizPattern &&
            projectName !== legacyTextPresentationPattern
          ) {
            return;
          }

          const microproductType = project.design_microproduct_type || '';

          switch (microproductType) {
            case 'Slide Deck':
            case 'Lesson Presentation':
              status[lessonKey].presentation = { exists: true, productId: project.id };
              break;
            case 'Text Presentation':
              status[lessonKey].onePager = { exists: true, productId: project.id };
              break;
            case 'Quiz':
              status[lessonKey].quiz = { exists: true, productId: project.id };
              break;
            case 'Video Lesson':
            case 'Video Lesson Presentation':
              status[lessonKey].videoLesson = { exists: true, productId: project.id };
              break;
            default:
              break;
          }
        });
      });
    });

    return status;
  }, [trainingPlanContent, allUserMicroproducts, projectInstanceData]);

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
        return (
          <CourseDisplay
            t={t}
            trainingPlanData={trainingPlanContent}
            columnVideoLessonEnabled={colVideoPresentationEnabled}
            lessonContentStatus={lessonContentStatus}
            productId={projectId}
            metrics={courseMetrics}
            isAuthorized={isAuthorized}
          />
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
        // For slide decks, render in view-only mode without editing controls
        return (
          <PresentationLayout
            deck={slideDeckData}
            theme={currentTheme}
            projectId={projectId}
            mode="view"
            viewModeSidebarWidth={400}
          />
        );
      case COMPONENT_NAME_VIDEO_LESSON_PRESENTATION:
        const videoLessonPresentationData = editableData as ComponentBasedSlideDeck | null;
        if (!videoLessonPresentationData) {
          return <div className="p-6 text-center text-gray-500">{t('interface.projectView.noVideoLessonData', 'No video lesson data available')}</div>;
        }
        // For video lesson presentations, render in view-only mode
        return (
          <PresentationLayout
            deck={videoLessonPresentationData}
            theme="dark-purple"
            projectId={projectId}
            mode="view"
            viewModeSidebarWidth={400}
          />
        );
      case COMPONENT_NAME_TEXT_PRESENTATION:
        const textPresentationData = editableData as TextPresentationData | null;
        // Set purpleBoxSection to true for now (user will change this later)
        const textPresentationDataWithBox = textPresentationData ? {
          ...textPresentationData,
          purpleBoxSection: true
        } : null;
        return (
          <TextPresentationDisplay
            dataToDisplay={textPresentationDataWithBox}
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
      case COMPONENT_NAME_VIDEO_PRODUCT:
        const videoProductData = editableData as any; // Video product data is stored as a dictionary
        console.log('🎬 [PROJECT_VIEW] VideoProductDisplay case - editableData:', editableData);
        console.log('🎬 [PROJECT_VIEW] VideoProductDisplay case - editableData type:', typeof editableData);
        console.log('🎬 [PROJECT_VIEW] VideoProductDisplay case - editableData keys:', editableData ? Object.keys(editableData) : 'null');
        return (
          <VideoProductDisplay
            dataToDisplay={videoProductData}
            isEditing={isEditing}
            onTextChange={handleTextChange}
            parentProjectName={parentProjectName}
            isAuthorized={isAuthorized}
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

  const isTrainingPlanView = projectInstanceData?.component_name === COMPONENT_NAME_TRAINING_PLAN;
  const containerClassName = [
    !isTrainingPlanView && 'mx-auto',
    projectInstanceData?.component_name === COMPONENT_NAME_SLIDE_DECK ||
    projectInstanceData?.component_name === COMPONENT_NAME_VIDEO_LESSON ||
    projectInstanceData?.component_name === COMPONENT_NAME_VIDEO_PRODUCT ||
    projectInstanceData?.component_name === COMPONENT_NAME_VIDEO_LESSON_PRESENTATION
      ? 'max-w-[1920px]'
      : (!isTrainingPlanView && 'max-w-7xl')
  ]
    .filter(Boolean)
    .join(' ');

  const productContent = displayContent();
  const layoutWrapperClasses = [
    containerClassName,
    'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 px-4 lg:px-10'
  ].filter(Boolean).join(' ');
  const mainColumnClasses = 'space-y-6 min-w-0';
  const mainCardClasses = [
    'p-3 rounded-xl',
    projectInstanceData?.component_name === COMPONENT_NAME_TRAINING_PLAN ||
    projectInstanceData?.component_name === COMPONENT_NAME_QUIZ
      ? 'bg-[#F2F2F4]'
      : 'bg-transparent'
  ].filter(Boolean).join(' ');

  return (
    <>
      <ProductViewHeader
        projectData={projectInstanceData}
        editableData={editableData as TrainingPlanData | null}
        productId={projectId}
        scormEnabled={scormEnabled}
        componentName={COMPONENT_NAME_TRAINING_PLAN}
        allowedComponentNames={[
          COMPONENT_NAME_TRAINING_PLAN,
          COMPONENT_NAME_SLIDE_DECK,
          COMPONENT_NAME_VIDEO_LESSON_PRESENTATION,
          COMPONENT_NAME_QUIZ,
          COMPONENT_NAME_TEXT_PRESENTATION
        ]}
        t={t}
        onPdfExport={handlePdfDownload}
        isEditing={isEditing}
        onEditOrSave={handleToggleEdit}
        isAuthorized={isAuthorized}
        setIsAuthorized={setIsAuthorized}
        hideCloudAndArrowIndicators
        enableLinkViewButtons
        hideAspectRatioBadge
        createdAt={projectCreatedAt}
      />
      
      <main 
        className={`font-inter ${
          projectInstanceData?.component_name === COMPONENT_NAME_VIDEO_LESSON ||
          projectInstanceData?.component_name === COMPONENT_NAME_VIDEO_PRODUCT ||
          projectInstanceData?.component_name === COMPONENT_NAME_VIDEO_LESSON_PRESENTATION
            ? 'bg-[#F2F2F4] px-12 py-0'
            : 'min-h-screen bg-[#F2F2F4] p-0'
        }`}
      >
        <div className={layoutWrapperClasses}>
          <div className={mainColumnClasses}>
            <div className={mainCardClasses}>
              <Suspense fallback={<div className="py-10 text-center text-gray-500">{t('interface.projectView.loadingContentDisplay', 'Loading content display...')}</div>}>
                {productContent}
              </Suspense>
            </div>
          </div>
          <aside className="flex flex-col gap-6">
            <div className="flex flex-col h-[550px] flex-none">
              <CommentsForGeneratedProduct isAuthorized={isAuthorized} />
            </div>
            <ProductQualityRating isAuthorized={isAuthorized} fullWidth />
          </aside>
        </div>

        {saveError &&
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md text-sm flex items-center">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      }

      {/* PDF Export Loading Modal */}
      <PdfExportLoadingModal 
        isOpen={isExportingPdf} 
        projectName={projectInstanceData?.name || 'Presentation'} 
        pdfDownloadReady={pdfDownloadReady}
        pdfProgress={pdfProgress}
        onDownload={handlePdfDownload}
        onClose={handleClosePdfModal}
      />

    </main>
    </>
  );
}