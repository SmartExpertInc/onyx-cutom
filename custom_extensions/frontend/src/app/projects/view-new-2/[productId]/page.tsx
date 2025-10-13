// custom_extensions/frontend/src/app/projects/view-new/[productId]/page.tsx
"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FolderOpen, Sparkles, Edit3, Check, Plus, RefreshCw, ShieldAlert, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ProjectInstanceDetail, TrainingPlanData, Lesson } from '@/types/projectSpecificTypes';
import CustomViewCard, { defaultContentTypes } from '@/components/ui/custom-view-card';
import SmartPromptEditor from '@/components/SmartPromptEditor';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useFeaturePermission } from '@/hooks/useFeaturePermission';
import ScormDownloadButton from '@/components/ScormDownloadButton';
import { ToastProvider } from '@/components/ui/toast';
import { UserDropdown } from '@/components/UserDropdown';

// Small inline product icons (from generate page), using currentColor so parent can set gray
const LessonPresentationIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: color || 'currentColor' }}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 7C3 5.11438 3 4.17157 3.58579 3.58579C4.17157 3 5.11438 3 7 3H12H17C18.8856 3 19.8284 3 20.4142 3.58579C21 4.17157 21 5.11438 21 7V10V13C21 14.8856 21 15.8284 20.4142 16.4142C19.8284 17 18.8856 17 17 17H12H7C5.11438 17 4.17157 17 3.58579 16.4142C3 15.8284 3 14.8856 3 13V10V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path> <path d="M9 21L11.625 17.5V17.5C11.8125 17.25 12.1875 17.25 12.375 17.5V17.5L15 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 7L12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M16 8L16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 9L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
);

const QuizIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color }) => (
  <svg width={size} height={size} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: color || 'currentColor' }}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path d="M10.125 8.875C10.125 7.83947 10.9645 7 12 7C13.0355 7 13.875 7.83947 13.875 8.875C13.875 9.56245 13.505 10.1635 12.9534 10.4899C12.478 10.7711 12 11.1977 12 11.75V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><circle cx="12" cy="16" r="1" fill="currentColor"></circle></g></svg>
);

const VideoScriptIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: color || 'currentColor' }}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
);

const TextPresentationIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: color || 'currentColor' }}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 14V7C20 5.34315 18.6569 4 17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H13.5M20 14L13.5 20M20 14H15.5C14.3954 14 13.5 14.8954 13.5 16V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
);

// Custom Tooltip Component matching the text presentation page style
const CustomTooltip: React.FC<{ children: React.ReactNode; content: string; position?: 'top' | 'bottom' }> = ({ children, content, position = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      if (position === 'top') {
        setTooltipPosition({
          top: rect.top - 6,
          left: rect.left + rect.width / 2
        });
      } else {
        setTooltipPosition({
          top: rect.bottom + 6,
          left: rect.left + rect.width / 2
        });
      }
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        ref={elementRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: position === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)'
          }}
        >
          <div className="bg-blue-500 text-white px-1.5 py-1 rounded-md shadow-lg text-xs whitespace-nowrap relative max-w-xs">
            <div className="font-medium">{content}</div>
            {/* Simple triangle tail */}
            <div className={`absolute ${position === 'top' ? 'top-full' : 'bottom-full'} left-1/2 transform -translate-x-1/2`}>
              <div className={`w-0 h-0 border-l-3 border-r-3 ${position === 'top' ? 'border-t-3 border-t-blue-500' : 'border-b-3 border-b-blue-500'} border-l-transparent border-r-transparent`}></div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};


type ProductViewNewParams = {
  productId: string;
};

// Component Name Constants
const COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

export default function ProductViewNewPage() {
  const params = useParams<ProductViewNewParams>();
  const productId = params?.productId;
  const router = useRouter();
  const { t } = useLanguage();
  const { isEnabled: videoLessonEnabled } = useFeaturePermission('video_lesson');
  // const { isEnabled: columnVideoLessonEnabled } = useFeaturePermission('column_video_lesson');
  const columnVideoLessonEnabled = true; // Temporarily enabled to check styles
  const { isEnabled: scormEnabled } = useFeaturePermission('export_scorm_2004');
  
  const [projectData, setProjectData] = useState<ProjectInstanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState<{
    isOpen: boolean;
    lesson: Lesson | null;
    contentType: string;
    existingProductId: number | null;
  }>({
    isOpen: false,
    lesson: null,
    contentType: '',
    existingProductId: null
  });
  const [lessonContentStatus, setLessonContentStatus] = useState<{[key: string]: {
    presentation: {exists: boolean, productId?: number}, 
    onePager: {exists: boolean, productId?: number}, 
    quiz: {exists: boolean, productId?: number}, 
    videoLesson: {exists: boolean, productId?: number}
  }}>({});
  const [collapsedSections, setCollapsedSections] = useState<{[key: number]: boolean}>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  
  // Smart editing state
  const [showSmartEditor, setShowSmartEditor] = useState(false);
  const [editableData, setEditableData] = useState<TrainingPlanData | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Inline editing state
  const [editingField, setEditingField] = useState<{
    type: 'mainTitle' | 'sectionTitle' | 'lessonTitle';
    sectionIndex?: number;
    lessonIndex?: number;
  } | null>(null);
  const [autoSaveTimeoutRef, setAutoSaveTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  // Helper function to start editing a field
  const startEditing = (type: 'mainTitle' | 'sectionTitle' | 'lessonTitle', sectionIndex?: number, lessonIndex?: number) => {
    setEditingField({
      type,
      sectionIndex,
      lessonIndex
    });
  };

  // Helper function to stop editing
  const stopEditing = () => {
    setEditingField(null);
  };

  // Helper function to check if a field is currently being edited
  const isEditingField = (type: 'mainTitle' | 'sectionTitle' | 'lessonTitle', sectionIndex?: number, lessonIndex?: number) => {
    return editingField?.type === type && 
           editingField?.sectionIndex === sectionIndex && 
           editingField?.lessonIndex === lessonIndex;
  };

  // Handle input changes with auto-save
  const handleInputChange = (path: (string | number)[], value: string) => {
    if (!editableData) return;

    // Create a deep copy and update the value
    const updatedData = JSON.parse(JSON.stringify(editableData));
    let current = updatedData;
    
    // Navigate to the target location
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Set the new value
    current[path[path.length - 1]] = value;
    
    setEditableData(updatedData);

    // Clear existing timeout
    if (autoSaveTimeoutRef) {
      clearTimeout(autoSaveTimeoutRef);
    }
    
    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      saveChanges(updatedData);
      
      // Special handling for lesson title changes - trigger re-matching of related content
      if (editingField?.type === 'lessonTitle') {
        console.log('Lesson title edited (auto-save), triggering content re-matching...');
        // Slight delay to allow parent to refresh product list, then trigger re-match
        setTimeout(() => {
          if (updatedData?.sections) {
            const allLessons: Lesson[] = [];
            updatedData.sections.forEach((section: any) => {
              if (section.lessons) {
                allLessons.push(...section.lessons);
              }
            });
            checkLessonContentStatus(updatedData.mainTitle || '', allLessons);
          }
        }, 100);
      }
    }, 2000);
    setAutoSaveTimeoutRef(timeout);
  };

  // Handle input blur (immediate save)
  const handleInputBlur = () => {
    if (autoSaveTimeoutRef) {
      clearTimeout(autoSaveTimeoutRef);
      setAutoSaveTimeoutRef(null);
    }
    if (editableData) {
      saveChanges(editableData);
      
      // Special handling for lesson title changes - trigger re-matching of related content
      if (editingField?.type === 'lessonTitle') {
        console.log('Lesson title edited, triggering content re-matching...');
        // Slight delay to allow parent to refresh product list, then trigger re-match
        setTimeout(() => {
          const trainingPlanData = editableData as TrainingPlanData;
          if (trainingPlanData?.sections) {
            const allLessons: Lesson[] = [];
            trainingPlanData.sections.forEach((section: any) => {
              if (section.lessons) {
                allLessons.push(...section.lessons);
              }
            });
            checkLessonContentStatus(trainingPlanData.mainTitle || '', allLessons);
          }
        }, 100);
      }
    }
    stopEditing();
  };

  // Save changes to backend (mirror old interface behavior)
  const saveChanges = async (data: TrainingPlanData) => {
    if (!productId) return;

    try {
      const commonHeaders: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
      }

      // Send only microProductContent (backend will sync project_name with mainTitle for training plans)
      const payload = { microProductContent: data };
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${productId}`, {
        method: 'PUT',
        headers: commonHeaders,
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorDataText = await response.text();
        let errorDetail = `HTTP error ${response.status}`;
        try {
          const errorJson = JSON.parse(errorDataText);
          if (errorJson.detail) {
            if (Array.isArray(errorJson.detail)) {
              const validationErrors = errorJson.detail.map((err: any) => {
                const location = err.loc ? err.loc.join('.') : 'unknown';
                return `${location}: ${err.msg || 'Validation error'}`;
              }).join('; ');
              errorDetail = `Validation errors: ${validationErrors}`;
            } else {
              errorDetail = errorJson.detail;
            }
          }
        } catch {
          // keep default errorDetail
        }
        throw new Error(errorDetail);
      }

      // Optional: read response for debugging consistency with old interface
      try {
        const responseData = await response.json();
        console.log('Auto-save response:', JSON.stringify(responseData, null, 2));
      } catch {
        // ignore if no JSON body
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    }
  };

  // Add click outside listener
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (editingField) {
        const target = event.target as HTMLElement;
        if (!target.closest('input[type="text"]')) {
          stopEditing();
        }
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [editingField]);

  // Fetch user credits on component mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/credits/me`, {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const credits = await response.json();
          setUserCredits(credits.credits_balance);
        }
      } catch (error) {
        console.error('Failed to fetch user credits:', error);
        // Keep userCredits as null to show loading state
      }
    };

    fetchUserCredits();
  }, []);

  // Calculate metrics from project data
  const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
  const totalModules = trainingPlanData?.sections?.length || 0;
  const totalLessons = trainingPlanData?.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;
  const completed = 0; // Placeholder - would need actual completion data
  
  // Calculate real estimated duration from project data
  const estimatedDuration = totalLessons > 0 
    ? `${Math.ceil(totalLessons * 0.5)}h ${Math.ceil((totalLessons * 0.5 % 1) * 60)}m`
    : "0h 0m";
  
  // Calculate estimated completion time based on actual lessons
  const estimatedCompletionTime = totalLessons > 0 ? `${Math.ceil(totalLessons * 0.5)}h ${Math.ceil((totalLessons * 0.5 % 1) * 60)}m` : "0h 0m";
  
  // Calculate credits based on actual project data
  const creditsUsed = 5; // Assuming 5 credits per lesson
  const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  // Filter content types based on video lesson permission
  const filteredContentTypes = videoLessonEnabled 
    ? defaultContentTypes 
    : defaultContentTypes.filter(contentType => contentType.type !== "Video Lessons");

  // Extract sources from project data
  const getSourcesFromProject = () => {
    const sources = new Set<string>();
    
    if (trainingPlanData?.sections) {
      trainingPlanData.sections.forEach(section => {
        if (section.lessons) {
          section.lessons.forEach(lesson => {
            if (lesson.source) {
              // Extract connector name from source string like "Connector Search: notion"
              const match = lesson.source.match(/Connector Search:\s*(.+)/i);
              if (match) {
                sources.add(match[1]);
              } else if (lesson.source.includes('PDF') || lesson.source.includes('Document')) {
                sources.add('PDF Document');
              } else if (lesson.source.includes('text') || lesson.source.includes('Text') || lesson.source === 'Create from scratch') {
                sources.add(t('interface.customViewCard.source.createdfromscratch'));
              } else {
                sources.add(lesson.source);
              }
            }
          });
        }
      });
    }
    
    // Connector icon mapping
    const getConnectorIcon = (connectorName: string) => {
      const connectorMap: { [key: string]: React.ReactNode } = {
        'notion': <img src="/Notion.png" alt="Notion" className="w-5 h-5" />,
        'google_drive': <img src="/GoogleDrive.png" alt="Google Drive" className="w-5 h-5" />,
        'dropbox': <img src="/Dropbox.png" alt="Dropbox" className="w-5 h-5" />,
        'slack': <img src="/Slack.png" alt="Slack" className="w-5 h-5" />,
        'confluence': <img src="/Confluence.svg" alt="Confluence" className="w-5 h-5" />,
        'github': <img src="/Github.png" alt="GitHub" className="w-5 h-5" />,
        'gitlab': <img src="/Gitlab.png" alt="GitLab" className="w-5 h-5" />,
        'jira': <img src="/Jira.svg" alt="Jira" className="w-5 h-5" />,
        'asana': <img src="/Asana.png" alt="Asana" className="w-5 h-5" />,
        'salesforce': <img src="/Salesforce.png" alt="Salesforce" className="w-5 h-5" />,
        'hubspot': <img src="/HubSpot.png" alt="HubSpot" className="w-5 h-5" />,
        'airtable': <img src="/Airtable.svg" alt="Airtable" className="w-5 h-5" />,
        'teams': <img src="/Teams.png" alt="Microsoft Teams" className="w-5 h-5" />,
        'gmail': <img src="/Gmail.png" alt="Gmail" className="w-5 h-5" />,
        'zendesk': <img src="/Zendesk.svg" alt="Zendesk" className="w-5 h-5" />,
        'PDF Document': <svg className="text-red-500" width={17} height={17} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width="0.048"></g><g id="SVGRepo_iconCarrier"> <path d="M12.37 8.87988H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6.38 8.87988L7.13 9.62988L9.38 7.37988" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.37 15.8799H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6.38 15.8799L7.13 16.6299L9.38 14.3799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>,
        [t('interface.customViewCard.source.createdfromscratch')]: <svg className="text-gray-700" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
      };
      
      return connectorMap[connectorName] || 
      <svg className="text-gray-800" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>;
    };
    
    return Array.from(sources).map(source => ({
      type: source === 'PDF Document' || source === t('interface.customViewCard.source.createdfromscratch') ? 'file' : 'connector',
      name: source,
      icon: getConnectorIcon(source)
    }));
  };

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) window.history.back();
      else router.push('/projects');
    }
  }, [router]);

  // Function to handle icon clicks for navigation
  const handleIconClick = useCallback((productId: number) => {
    router.push(`/projects/view/${productId}`);
  }, [router]);

  // Function to check existing content for lessons
  const checkLessonContentStatus = useCallback(async (outlineName: string, lessons: Lesson[]) => {
    if (!outlineName || !lessons.length) return;

    try {
      const commonHeaders: HeadersInit = {};
      const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
      }

      // Fetch all projects for the user
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects`, {
        headers: commonHeaders
      });

      if (!response.ok) {
        console.error('Failed to fetch projects for content status check');
        return;
      }

      const allProjects = await response.json();
      
      // Check for existing products for each lesson
      const contentStatus: {[key: string]: {
        presentation: {exists: boolean, productId?: number}, 
        onePager: {exists: boolean, productId?: number}, 
        quiz: {exists: boolean, productId?: number}, 
        videoLesson: {exists: boolean, productId?: number}
      }} = {};
      
      for (const lesson of lessons) {
        const lessonKey = lesson.id || lesson.title;
        
        // Initialize status for this lesson
        contentStatus[lessonKey] = {
          presentation: {exists: false},
          onePager: {exists: false},
          quiz: {exists: false},
          videoLesson: {exists: false}
        };

        // Look for projects that match this lesson using the same logic as TrainingPlan.tsx
        const expectedProjectName = `${outlineName}: ${lesson.title}`;
        
        const matchingProjects = allProjects.filter((project: { id: number; projectName?: string; design_microproduct_type?: string; microproduct_type?: string }) => {
          const projectName = project.projectName?.trim();
          
          // Method 1: New naming convention - project name follows "Outline Name: Lesson Title" pattern
          const newPatternMatch = projectName === expectedProjectName;
          
          // Method 2: Legacy patterns for backward compatibility
          const legacyQuizPattern = `Quiz - ${outlineName}: ${lesson.title}`;
          const legacyQuizPatternMatch = projectName === legacyQuizPattern;
          
          const legacyTextPresentationPattern = `Text Presentation - ${outlineName}: ${lesson.title}`;
          const legacyTextPresentationPatternMatch = projectName === legacyTextPresentationPattern;
          
          return newPatternMatch || legacyQuizPatternMatch || legacyTextPresentationPatternMatch;
        });
        
        // Check each matching project to see what type of content it is
        for (const project of matchingProjects) {
          const microproductType = project.design_microproduct_type || project.microproduct_type;
          
          // Map microproduct types to our content status
          switch (microproductType) {
            case 'Slide Deck':
            case 'Lesson Presentation':
              contentStatus[lessonKey].presentation = {exists: true, productId: project.id};
              break;
            case 'Text Presentation':
              contentStatus[lessonKey].onePager = {exists: true, productId: project.id};
              break;
            case 'Quiz':
              contentStatus[lessonKey].quiz = {exists: true, productId: project.id};
              break;
            case 'Video Lesson':
            case 'Video Lesson Presentation':
              contentStatus[lessonKey].videoLesson = {exists: true, productId: project.id};
              break;
          }
        }
      }

      setLessonContentStatus(contentStatus);
    } catch (error) {
      console.error('Error checking lesson content status:', error);
    }
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const commonHeaders: HeadersInit = {};
        const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
        if (devUserId && process.env.NODE_ENV === 'development') {
          commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
        }

        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${productId}`, {
          cache: 'no-store',
          headers: commonHeaders
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch project data: ${response.status}`);
        }

        const data: ProjectInstanceDetail = await response.json();
        setProjectData(data);

        // Check for existing content for lessons
        const trainingPlanData = data.details as TrainingPlanData;
        if (trainingPlanData?.sections && trainingPlanData?.mainTitle) {
          const allLessons: Lesson[] = [];
          trainingPlanData.sections.forEach(section => {
            if (section.lessons) {
              allLessons.push(...section.lessons);
            }
          });
          await checkLessonContentStatus(trainingPlanData.mainTitle, allLessons);
        }

        // Clear refresh flag if it exists
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('refresh_lesson_content_status');
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [productId]);

  // Update editableData when projectData changes
  useEffect(() => {
    if (projectData?.details) {
      setEditableData(projectData.details as TrainingPlanData);
    }
  }, [projectData]);

  // Handler for SmartPromptEditor content updates
  const handleSmartEditContentUpdate = useCallback((updatedContent: TrainingPlanData) => {
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
    if (productId) {
      const fetchProjectData = async () => {
        try {
          const commonHeaders: HeadersInit = {};
          const devUserId = "dummy-onyx-user-id-for-testing";
          if (devUserId && process.env.NODE_ENV === 'development') {
            commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
          }

          const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${productId}`, {
            cache: 'no-store',
            headers: commonHeaders
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch project data: ${response.status}`);
          }

          const data: ProjectInstanceDetail = await response.json();
          setProjectData(data);
          setEditableData(data.details as TrainingPlanData);
        } catch (error) {
          console.error('Error refetching project data:', error);
          setError('Failed to restore original content');
        }
      };
      fetchProjectData();
    }
  }, [productId]);

  const handleContentTypeClick = async (lesson: Lesson, contentType: string) => {
    const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
    if (!trainingPlanData || !productId) return;

    // Check if content already exists
    const lessonKey = lesson.id || lesson.title;
    const status = lessonContentStatus[lessonKey];
    let existingProductId: number | null = null;

    switch (contentType) {
      case 'presentation':
        if (status?.presentation?.exists && status.presentation.productId) {
          existingProductId = status.presentation.productId;
        }
        break;
      case 'one-pager':
        if (status?.onePager?.exists && status.onePager.productId) {
          existingProductId = status.onePager.productId;
        }
        break;
      case 'quiz':
        if (status?.quiz?.exists && status.quiz.productId) {
          existingProductId = status.quiz.productId;
        }
        break;
      case 'video-lesson':
        if (status?.videoLesson?.exists && status.videoLesson.productId) {
          existingProductId = status.videoLesson.productId;
        }
        break;
    }

    // If content exists, show regenerate modal instead of navigating
    if (existingProductId) {
      setShowRegenerateModal({
        isOpen: true,
        lesson: lesson,
        contentType: contentType,
        existingProductId: existingProductId
      });
      setOpenDropdown(null);
      return;
    }

    // Map content types to product and lessonType parameters (matching CreateContentTypeModal pattern)
    let product = '';
    let lessonType = '';

    switch (contentType) {
      case 'presentation':
        product = 'lesson';
        lessonType = 'lessonPresentation';
        break;
      case 'one-pager':
        product = 'text-presentation';
        lessonType = 'textPresentation';
        break;
      case 'quiz':
        product = 'quiz';
        lessonType = 'multiple-choice';
        break;
      case 'video-lesson':
        product = 'video-lesson';
        lessonType = 'videoLesson';
        break;
      default:
        return;
    }

    // Find the module name for this lesson
    const moduleName = trainingPlanData.sections?.find(section => 
      section.lessons?.some(l => l.title === lesson.title)
    )?.title || '';

    // Find the lesson number within the module
    const lessonNumber = trainingPlanData.sections?.find(section => 
      section.lessons?.some(l => l.title === lesson.title)
    )?.lessons?.findIndex(l => l.title === lesson.title) || 0;

    const params = new URLSearchParams({
      product: product,
      lessonType: lessonType,
      lessonTitle: lesson.title,
      moduleName: moduleName,
      lessonNumber: String(lessonNumber + 1), // Convert to 1-based indexing
      courseName: trainingPlanData.mainTitle || ''
    });

    // Store a flag to refresh content status when returning to this page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('refresh_lesson_content_status', 'true');
    }

    router.push(`/create?${params.toString()}`);
    setOpenDropdown(null);
  };

  // Handle regenerate confirmation
  const handleRegenerateConfirm = async () => {
    if (!showRegenerateModal.existingProductId) return;

    try {
      // Delete the existing product using the same logic as the old interface
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = typeof window !== 'undefined' ? sessionStorage.getItem('dev_user_id') : null;
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const resp = await fetch(`${CUSTOM_BACKEND_URL}/projects/delete-multiple`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          project_ids: [showRegenerateModal.existingProductId], 
          scope: 'self' 
        })
      });

      if (!resp.ok) {
        const responseText = await resp.text();
        throw new Error(`Failed to delete existing product: ${resp.status} ${responseText.slice(0, 200)}`);
      }

      // Close modal and navigate to create page
      setShowRegenerateModal({
        isOpen: false,
        lesson: null,
        contentType: '',
        existingProductId: null
      });

      // Navigate to create page with the same parameters as handleContentTypeClick
      const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
      if (!trainingPlanData) return;

      const lesson = showRegenerateModal.lesson!;
      const contentType = showRegenerateModal.contentType;

      // Map content types to product and lessonType parameters
      let product = '';
      let lessonType = '';

      switch (contentType) {
        case 'presentation':
          product = 'lesson';
          lessonType = 'lessonPresentation';
          break;
        case 'one-pager':
          product = 'text-presentation';
          lessonType = 'textPresentation';
          break;
        case 'quiz':
          product = 'quiz';
          lessonType = 'multiple-choice';
          break;
        case 'video-lesson':
          product = 'video-lesson';
          lessonType = 'videoLesson';
          break;
        default:
          return;
      }

      // Find the module name for this lesson
      const moduleName = trainingPlanData.sections?.find(section => 
        section.lessons?.some(l => l.title === lesson.title)
      )?.title || '';

      // Find the lesson number within the module
      const lessonNumber = trainingPlanData.sections?.find(section => 
        section.lessons?.some(l => l.title === lesson.title)
      )?.lessons?.findIndex(l => l.title === lesson.title) || 0;

      const params = new URLSearchParams({
        product: product,
        lessonType: lessonType,
        lessonTitle: lesson.title,
        moduleName: moduleName,
        lessonNumber: String(lessonNumber + 1), // Convert to 1-based indexing
        courseName: trainingPlanData.mainTitle || ''
      });

      // Store a flag to refresh content status when returning to this page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('refresh_lesson_content_status', 'true');
      }

      router.push(`/create?${params.toString()}`);
    } catch (error) {
      console.error('Error deleting existing product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete existing product');
    }
  };

  // Handle regenerate cancel
  const handleRegenerateCancel = () => {
    setShowRegenerateModal({
      isOpen: false,
      lesson: null,
      contentType: '',
      existingProductId: null
    });
  };

  // Toggle section collapse
  const toggleSectionCollapse = (index: number) => {
    setCollapsedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Collapse all sections
  const collapseAllSections = () => {
    const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
    if (!trainingPlanData?.sections) return;
    
    const allCollapsed: {[key: number]: boolean} = {};
    trainingPlanData.sections.forEach((_, index) => {
      allCollapsed[index] = true;
    });
    setCollapsedSections(allCollapsed);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center text-lg text-gray-600">{t('interface.viewNew.loadingProjectDetails', 'Loading project details...')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-8 text-center text-red-700 text-lg">{t('interface.viewNew.error', 'Error:')} {error}</div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center text-[#9A9DA2]">{t('interface.viewNew.projectNotFound', 'Project not found or data unavailable.')}</div>
      </div>
    );
  }

  return (
    <main 
      className="font-inter min-h-screen"
      style={{
        background: '#F8F8F8'
      }}
    >
      <header className="sticky top-0 z-50 h-16 bg-white flex flex-row justify-between items-center gap-4 py-[14px]" style={{ borderBottom: '1px solid #E4E4E7' }}>
        <div className="max-w-7xl mx-auto w-full flex flex-row justify-between items-center gap-4 px-[14px]">
          <div className="flex items-center gap-x-8">
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
              <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 6.44444C13 5.2657 12.5364 4.13524 11.7113 3.30175C10.8861 2.46825 9.76695 2 8.6 2H2V18.6667H9.7C10.5752 18.6667 11.4146 19.0179 12.0335 19.643C12.6523 20.2681 13 21.1159 13 22M13 6.44444V22M13 6.44444C13 5.2657 13.4636 4.13524 14.2887 3.30175C15.1139 2.46825 16.233 2 17.4 2H24V18.6667H16.3C15.4248 18.6667 14.5854 19.0179 13.9665 19.643C13.3477 20.2681 13 21.1159 13 22" stroke="#719AF5" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-[#191D30] font-semibold text-[24px] leading-none">
                {(() => {
                  const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
                  return trainingPlanData?.mainTitle || projectData?.name || t('interface.viewNew.courseOutline', 'Course Outline');
                })()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* AI Agent button for Course Outline */}
            {projectData && projectData.component_name === COMPONENT_NAME_TRAINING_PLAN && productId && (
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
                title="AI Agent"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.1986 3.99953L9.99843 5.79926M2.79912 3.39963V5.79926M11.1983 8.19888V10.5985M5.79883 1V2.19981M3.99901 4.59944H1.59924M12.3982 9.3987H9.99843M6.39877 1.59991H5.19889M12.7822 1.98385L12.0142 1.21597C11.9467 1.14777 11.8664 1.09363 11.7778 1.05668C11.6893 1.01973 11.5942 1.00071 11.4983 1.00071C11.4023 1.00071 11.3073 1.01973 11.2188 1.05668C11.1302 1.09363 11.0498 1.14777 10.9823 1.21597L1.21527 10.9825C1.14707 11.05 1.09293 11.1303 1.05598 11.2189C1.01903 11.3074 1 11.4024 1 11.4984C1 11.5943 1.01903 11.6893 1.05598 11.7779C1.09293 11.8664 1.14707 11.9468 1.21527 12.0143L1.9832 12.7822C2.05029 12.8511 2.13051 12.9059 2.21912 12.9433C2.30774 12.9807 2.40296 13 2.49915 13C2.59534 13 2.69056 12.9807 2.77918 12.9433C2.86779 12.9059 2.94801 12.8511 3.0151 12.7822L12.7822 3.01569C12.8511 2.94861 12.9059 2.86839 12.9433 2.77978C12.9807 2.69117 13 2.59595 13 2.49977C13 2.40358 12.9807 2.30837 12.9433 2.21976C12.9059 2.13115 12.8511 2.05093 12.7822 1.98385Z" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('actions.aiAgent', 'AI Agent')}
            </button>
            )}

            {/* Export button */}
              <button
              className="flex items-center gap-2 rounded-md h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                style={{
                backgroundColor: '#0F58F9',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  lineHeight: '140%',
                  letterSpacing: '0.05em'
                }}
              title="Export"
              >
              <svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.74154 8.67253V1.18945M4.74154 8.67253L1.53451 5.4655M4.74154 8.67253L7.94857 5.4655M8.48307 10.8105H1" stroke="white" strokeWidth="0.801758" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('actions.export', 'Export')}
              </button>

            {projectData && projectData.component_name === COMPONENT_NAME_TRAINING_PLAN && productId && scormEnabled && (
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

      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Smart Prompt Editor - positioned between top panel and main content */}
        {showSmartEditor && projectData && projectData.component_name === COMPONENT_NAME_TRAINING_PLAN && editableData && (
          <div className="px-4 md:px-8 lg:px-[120px]">
            <SmartPromptEditor
              projectId={projectData.project_id}
              onContentUpdate={handleSmartEditContentUpdate}
              onError={handleSmartEditError}
              onRevert={handleSmartEditRevert}
              currentLanguage={editableData.detectedLanguage}
              currentTheme={editableData.theme}
            />
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-8 lg:px-[120px]">
          {/* Main Content Area - Course Outline and Modules */}
          <div className="lg:col-span-3 space-y-4">
            {/* Course Info Bar */}
            <div className="flex justify-between items-center py-3 mb-0">
              <div className="flex items-center gap-2 text-[#797979] text-[14px]">
                <span>{totalModules} modules</span>
                <span className="w-1 h-1 rounded-full bg-[#797979]"></span>
                <span>{totalLessons} lessons total</span>
              </div>
                  <button
                className="flex items-center gap-2 bg-transparent rounded-md h-9 px-3 transition-all duration-200 hover:bg-gray-50 cursor-pointer"
                style={{
                  border: '1px solid #E0E0E0'
                }}
                onClick={collapseAllSections}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#797979" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[#797979] text-[14px] font-medium">Collapse All</span>
                  </button>
            </div>

            {/* Render actual modules from the course outline data */}
            {(() => {
              const trainingPlanData = (editableData || projectData.details) as TrainingPlanData;
              if (!trainingPlanData?.sections) {
                return (
                  <div className="bg-white rounded-lg p-[25px]">
                    <p className="text-[#9A9DA2]">{t('interface.viewNew.noModulesFound', 'No modules found in this course outline.')}</p>
                  </div>
                );
              }

              return trainingPlanData.sections.map((section, index) => (
                <div key={section.id || index} className="bg-white rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <div className="bg-[#CCDBFC] px-[12px] py-[24px]">
                  {isEditingField('sectionTitle', index) ? (
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleInputChange(['sections', index, 'title'], e.target.value)}
                      onBlur={handleInputBlur}
                        className="text-[#0F58F9] font-semibold text-[20px] leading-[100%] bg-transparent border-none outline-none w-full"
                      placeholder={t('interface.viewNew.moduleTitle', 'Module Title')}
                      autoFocus
                    />
                  ) : (
                      <div className="group flex items-center gap-2">
                      <button 
                        className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-transform duration-300"
                        style={{ backgroundColor: '#719AF5' }}
                        onClick={() => toggleSectionCollapse(index)}
                      >
                        <ChevronDown size={14} className={`text-white transition-transform duration-300 ${collapsedSections[index] ? '-rotate-90' : ''}`} />
                      </button>
                      <h2 
                          className="text-[#0F58F9] font-semibold text-[20px] leading-[100%] cursor-pointer"
                        onClick={() => startEditing('sectionTitle', index)}
                      >
                        {t('interface.viewNew.moduleTitle', 'Module')} {index + 1}: {section.title}
                      </h2>
                      <button
                        onClick={() => startEditing('sectionTitle', index)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center cursor-pointer"
                        title={t('interface.viewNew.editModuleTitle', 'Edit module title')}
                      >
                          <Edit3 size={14} className="text-[#0F58F9] hover:text-blue-700" />
                      </button>
                        <span className="bg-white text-[#797979] text-[12px] px-2 py-[5px] rounded-full ml-3">
                          {section.lessons?.length || 0} {section.lessons?.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                    </div>
                  )}
                  </div>
                  
                  {/* Module Content */}
                  <div 
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: collapsedSections[index] ? '0' : '10000px',
                      opacity: collapsedSections[index] ? 0 : 1
                    }}
                  >
                  <div className="p-[25px] pt-0">
                  
                  {/* Product Types Header */}
                  <div className="grid mb-4 gap-4 items-center px-[25px] py-[10px] mx-[-25px]" style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 80px' : ''} 80px 80px 80px`, borderBottom: '1px solid #E0E0E0' }} >
                    <div className="text-[14px] font-medium text-[#434343]">
                      Lessons
                    </div>
                    {columnVideoLessonEnabled && (
                      <div className="flex flex-col items-center text-[10px] font-medium text-[#434343] justify-center gap-1 p-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.99967 11.3333V14M5.33301 14H10.6663M6.66634 4.66667L9.99967 6.66667L6.66634 8.66667V4.66667ZM2.66634 2H13.333C14.0694 2 14.6663 2.59695 14.6663 3.33333V10C14.6663 10.7364 14.0694 11.3333 13.333 11.3333H2.66634C1.92996 11.3333 1.33301 10.7364 1.33301 10V3.33333C1.33301 2.59695 1.92996 2 2.66634 2Z" stroke="#4CFFF0" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{t('interface.viewNew.videoLesson', 'Video Lesson')}</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center text-[10px] font-medium text-[#434343] justify-center gap-1 p-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.66699 6.86732C6.80033 6.60065 7.00033 6.33398 7.26699 6.20065C7.54308 6.04103 7.86539 5.98046 8.18059 6.02895C8.49579 6.07745 8.78498 6.2321 9.00033 6.46732C9.20033 6.73398 9.33366 7.00065 9.33366 7.33398C9.33366 8.20065 8.00033 8.66732 8.00033 8.66732M8.00033 11.334H8.00699M9.66699 1.33398H4.00033C3.6467 1.33398 3.30756 1.47446 3.05752 1.72451C2.80747 1.97456 2.66699 2.3137 2.66699 2.66732V13.334C2.66699 13.6876 2.80747 14.0267 3.05752 14.2768C3.30756 14.5268 3.6467 14.6673 4.00033 14.6673H12.0003C12.3539 14.6673 12.6931 14.5268 12.9431 14.2768C13.1932 14.0267 13.3337 13.6876 13.3337 13.334V5.00065L9.66699 1.33398Z" stroke="#FFE149" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{t('interface.viewNew.quiz', 'Quiz')}</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px] font-medium text-[#434343] justify-center gap-1 p-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3333 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H13.3333C13.7015 6.66667 14 6.36819 14 6V2.66667C14 2.29848 13.7015 2 13.3333 2Z" stroke="#D817FF" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.33333 9.33333H2.66667C2.29848 9.33333 2 9.63181 2 10V13.3333C2 13.7015 2.29848 14 2.66667 14H7.33333C7.70152 14 8 13.7015 8 13.3333V10C8 9.63181 7.70152 9.33333 7.33333 9.33333Z" stroke="#D817FF" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.3333 9.33333H11.3333C10.9651 9.33333 10.6667 9.63181 10.6667 10V13.3333C10.6667 13.7015 10.9651 14 11.3333 14H13.3333C13.7015 14 14 13.7015 14 13.3333V10C14 9.63181 13.7015 9.33333 13.3333 9.33333Z" stroke="#D817FF" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{t('interface.viewNew.presentation', 'Presentation')}</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px] font-medium text-[#434343] justify-center gap-1 p-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.33366 1.33398V5.33398H13.3337M9.66699 1.33398H4.00033C3.6467 1.33398 3.30756 1.47446 3.05752 1.72451C2.80747 1.97456 2.66699 2.3137 2.66699 2.66732V13.334C2.66699 13.6876 2.80747 14.0267 3.05752 14.2768C3.30756 14.5268 3.6467 14.6673 4.00033 14.6673H12.0003C12.3539 14.6673 12.6931 14.5268 12.9431 14.2768C13.1932 14.0267 13.3337 13.6876 13.3337 13.334V5.00065L9.66699 1.33398Z" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{t('interface.viewNew.onePager', 'One-Pager')}</span>
                    </div>
                  </div>

                  {section.lessons && section.lessons.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {section.lessons.map((lesson: Lesson, lessonIndex: number) => {
                        const lessonKey = lesson.id || lesson.title;
                        const status = lessonContentStatus[lessonKey];
                        const hasPresentation = status?.presentation?.exists;
                        const hasOnePager = status?.onePager?.exists;
                        const hasQuiz = status?.quiz?.exists;
                        const hasVideoLesson = status?.videoLesson?.exists;

                        const createdCount = [hasPresentation, hasOnePager, hasQuiz, hasVideoLesson].filter(Boolean).length;
                        const totalProducts = columnVideoLessonEnabled ? 4 : 3;
                        const actualCreatedCount = columnVideoLessonEnabled ? createdCount : [hasPresentation, hasOnePager, hasQuiz].filter(Boolean).length;

                        return (
                          <div key={lesson?.id || lessonIndex} className="grid gap-4 items-center pl-[24px] py-[16px] rounded-md" style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 80px' : ''} 80px 80px 80px`, border: '1px solid #E0E0E0' }} >
                            {/* Lesson Title Column */}
                            <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[#191D30] text-[16px] font-normal">{lessonIndex + 1}.</span>
                              {isEditingField('lessonTitle', index, lessonIndex) ? (
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => handleInputChange(['sections', index, 'lessons', lessonIndex, 'title'], e.target.value)}
                                  onBlur={handleInputBlur}
                                  className="text-[#191D30] text-[16px] leading-[100%] font-normal bg-transparent border-none outline-none flex-1"
                                  placeholder={t('interface.viewNew.lessonTitle', 'Lesson Title')}
                                  autoFocus
                                />
                              ) : (
                                <div className="group flex items-center gap-2">
                                  <span 
                                    className="text-[#191D30] text-[16px] leading-[100%] font-normal cursor-pointer"
                                    onClick={() => startEditing('lessonTitle', index, lessonIndex)}
                                  >
                                    {lesson.title.replace(/^\d+\.\d*\.?\s*/, '')}
                                  </span>
                                  <button
                                    onClick={() => startEditing('lessonTitle', index, lessonIndex)}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center cursor-pointer"
                                    title={t('interface.viewNew.editLessonTitle', 'Edit lesson title')}
                                  >
                                    <Edit3 size={14} className="text-[#9A9DA2] hover:text-gray-700" />
                                  </button>
                                </div>
                              )}
                              </div>
                              {/* Progress Scale */}
                              <div className="flex items-center gap-2 ml-6">
                                <div className="relative w-32 h-[3px] bg-[#CCDBFC] rounded-full overflow-hidden">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-[#719AF5] rounded-full transition-all duration-300"
                                    style={{ width: `${(actualCreatedCount / totalProducts) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[#797979] text-[9px]">{actualCreatedCount}/{totalProducts} created</span>
                              </div>
                            </div>
                            
                            {columnVideoLessonEnabled && (
                              <div className="flex items-center justify-center">
                                {hasVideoLesson ? (
                                  <div className="relative group flex items-center justify-center">
                                    <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                      <div 
                                        className="w-[24px] h-[24px] rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-1"
                                        onClick={() => {
                                          if (status?.videoLesson?.productId) {
                                            handleIconClick(status.videoLesson.productId);
                                          }
                                        }}
                                      >
                                        <Check size={12} strokeWidth={3.5} className="text-white" />
                                      </div>
                                    </CustomTooltip>
                                    {/* Regenerate icon on hover */}
                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-3">
                                      <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                        <div 
                                          className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                          style={{ border: '1px solid #0F58F9' }}
                                          onClick={() => {
                                            setShowRegenerateModal({
                                              isOpen: true,
                                              lesson: lesson,
                                              contentType: 'video-lesson',
                                              existingProductId: status?.videoLesson?.productId || null
                                            });
                                          }}
                                        >
                                          <RefreshCw size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                        </div>
                                      </CustomTooltip>
                                    </div>
                                  </div>
                                ) : (
                                  <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                    <div 
                                      className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                      style={{ border: '1px solid #0F58F9' }}
                                      onClick={() => handleContentTypeClick(lesson, 'video-lesson')}
                                    >
                                      <Plus size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                    </div>
                                  </CustomTooltip>
                                )}
                              </div>
                            )}

                            {/* Quiz Status Column */}
                            <div className="flex items-center justify-center">
                              {hasQuiz ? (
                                <div className="relative group flex items-center justify-center">
                                  <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                    <div 
                                      className="w-[24px] h-[24px] rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-1"
                                      onClick={() => {
                                        if (status?.quiz?.productId) {
                                          handleIconClick(status.quiz.productId);
                                        }
                                      }}
                                    >
                                      <Check size={12} strokeWidth={3.5} className="text-white" />
                                    </div>
                                  </CustomTooltip>
                                  {/* Regenerate icon on hover */}
                                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-3">
                                    <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                      <div 
                                        className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid #0F58F9' }}
                                        onClick={() => {
                                          setShowRegenerateModal({
                                            isOpen: true,
                                            lesson: lesson,
                                            contentType: 'quiz',
                                            existingProductId: status?.quiz?.productId || null
                                          });
                                        }}
                                      >
                                        <RefreshCw size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                      </div>
                                    </CustomTooltip>
                                  </div>
                                </div>
                              ) : (
                                <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                  <div 
                                    className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ border: '1px solid #0F58F9' }}
                                    onClick={() => handleContentTypeClick(lesson, 'quiz')}
                                  >
                                    <Plus size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                  </div>
                                </CustomTooltip>
                              )}
                            </div>

                            {/* Presentation Status Column */}
                            <div className="flex items-center justify-center">
                              {hasPresentation ? (
                                <div className="relative group flex items-center justify-center">
                                  <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                    <div 
                                      className="w-[24px] h-[24px] rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-1"
                                      onClick={() => {
                                        if (status?.presentation?.productId) {
                                          handleIconClick(status.presentation.productId);
                                        }
                                      }}
                                    >
                                      <Check size={12} strokeWidth={3.5} className="text-white" />
                                    </div>
                                  </CustomTooltip>
                                  {/* Regenerate icon on hover */}
                                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-3">
                                    <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                      <div 
                                        className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid #0F58F9' }}
                                        onClick={() => {
                                          setShowRegenerateModal({
                                            isOpen: true,
                                            lesson: lesson,
                                            contentType: 'presentation',
                                            existingProductId: status?.presentation?.productId || null
                                          });
                                        }}
                                      >
                                        <RefreshCw size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                      </div>
                                    </CustomTooltip>
                                  </div>
                                </div>
                              ) : (
                                <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                  <div 
                                    className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ border: '1px solid #0F58F9' }}
                                    onClick={() => handleContentTypeClick(lesson, 'presentation')}
                                  >
                                    <Plus size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                  </div>
                                </CustomTooltip>
                              )}
                            </div>

                            {/* One-Pager Status Column */}
                            <div className="flex items-center justify-center">
                              {hasOnePager ? (
                                <div className="relative group flex items-center justify-center">
                                  <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                    <div 
                                      className="w-[24px] h-[24px] rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-1"
                                      onClick={() => {
                                        if (status?.onePager?.productId) {
                                          handleIconClick(status.onePager.productId);
                                        }
                                      }}
                                    >
                                      <Check size={12} strokeWidth={3.5} className="text-white" />
                                    </div>
                                  </CustomTooltip>
                                  {/* Regenerate icon on hover */}
                                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-3">
                                    <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                      <div 
                                        className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid #0F58F9' }}
                                        onClick={() => {
                                          setShowRegenerateModal({
                                            isOpen: true,
                                            lesson: lesson,
                                            contentType: 'one-pager',
                                            existingProductId: status?.onePager?.productId || null
                                          });
                                        }}
                                      >
                                        <RefreshCw size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                      </div>
                                    </CustomTooltip>
                                  </div>
                                </div>
                              ) : (
                                <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                  <div 
                                    className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ border: '1px solid #0F58F9' }}
                                    onClick={() => handleContentTypeClick(lesson, 'one-pager')}
                                  >
                                    <Plus size={12} strokeWidth={3.5} className="text-[#0F58F9]" />
                                  </div>
                                </CustomTooltip>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                  </div>
                </div>
              ));
            })()}
            {/* Add New Module Button
            <div className="flex justify-center">
              <button
                className="flex items-center justify-center gap-2 rounded px-[15px] py-[8px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none w-full"
                style={{
                  backgroundColor: '#0F58F9',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '140%',
                  letterSpacing: '0.05em'
                }}
              >
                + Add new module
              </button>
            </div> */}
          </div>

          {/* Right Panel - Course Summary */}
          <div className="lg:col-span-1 hidden">
            <CustomViewCard
              projectId={productId}
              sources={getSourcesFromProject()}
              contentTypes={filteredContentTypes}
              metrics={{
                totalModules: totalModules,
                totalLessons: totalLessons,
                completed: completed,
                estimatedDuration: estimatedDuration,
                estimatedCompletionTime: estimatedCompletionTime,
                creditsUsed: creditsUsed,
                creditsTotal: userCredits || 100,
                progress: progress
              }}
            />
          </div>
        </div>
      </div>

      {/* Error display */}
      {saveError && (
        <div 
          className="fixed top-4 right-4 rounded px-[15px] py-[8px] pr-[20px] z-50 flex items-center gap-2 transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
          style={{
            backgroundColor: '#DC2626',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            lineHeight: '140%',
            letterSpacing: '0.05em'
          }}
        >
          <ShieldAlert size={14} style={{ color: 'white' }} />
          <span>{saveError}</span>
          <button
            onClick={() => setSaveError(null)}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateModal.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('interface.viewNew.regenerateProduct', 'Regenerate Product')}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {t('interface.viewNew.regenerateDescription', 'You are about to create a new product. The old one will be deleted.')}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleRegenerateCancel}
                className="flex items-center gap-2 rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: '#6B7280',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  lineHeight: '140%',
                  letterSpacing: '0.05em'
                }}
              >
                {t('interface.viewNew.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleRegenerateConfirm}
                className="flex items-center gap-2 rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: '#0F58F9',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  lineHeight: '140%',
                  letterSpacing: '0.05em'
                }}
              >
                {t('interface.viewNew.ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


