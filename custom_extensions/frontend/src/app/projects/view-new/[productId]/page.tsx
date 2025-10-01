// custom_extensions/frontend/src/app/projects/view-new/[productId]/page.tsx
"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FolderOpen, Sparkles, ChevronDown, Edit3, RefreshCcw } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ProjectInstanceDetail, TrainingPlanData, Lesson } from '@/types/projectSpecificTypes'; 
import CustomViewCard, { defaultContentTypes } from '@/components/ui/custom-view-card';
import SmartPromptEditor from '@/components/SmartPromptEditor';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useFeaturePermission } from '@/hooks/useFeaturePermission';

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
  const searchParams = useSearchParams();
  
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

  // PDF download handler
  const handlePdfDownload = async () => {
    if (!projectData || !projectData.project_id) {
      alert('Project data is not available for download.');
      return;
    }

    try {
      const nameForSlug = projectData.name || 'document';
      const docNameSlug = nameForSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const pdfProjectId = projectData.project_id;

      // Build PDF URL with project ID and document name slug
      let pdfUrl = `${CUSTOM_BACKEND_URL}/pdf/${pdfProjectId}/${docNameSlug}`;
      
      // Add query parameters for training plan PDFs to match the course outline functionality
      const queryParams = new URLSearchParams();
      
      // Add parent project name and lesson number if available (same as main view page)
      const parentProjectName = searchParams?.get('parentProjectName');
      const lessonNumber = searchParams?.get('lessonNumber');
      
      if (parentProjectName) {
        queryParams.append('parentProjectName', parentProjectName);
      }
      
      if (lessonNumber) {
        queryParams.append('lessonNumber', lessonNumber);
      }
      
      // Use course outline template for this view-new page
      queryParams.append('templateType', 'course-outline');
      
      // Add column visibility settings for Training Plan PDFs (same as in the main view page)
      queryParams.append('knowledgeCheck', '1'); // Default to show all columns
      queryParams.append('contentAvailability', '1');
      queryParams.append('informationSource', '1');
      queryParams.append('time', '1');
      queryParams.append('estCompletionTime', '1');
      queryParams.append('qualityTier', '1');
      queryParams.append('quiz', '1');
      queryParams.append('onePager', '1');
      queryParams.append('videoPresentation', '1');
      queryParams.append('lessonPresentation', '1');
      
      // Add the query parameters to the URL
      if (queryParams.toString()) {
        pdfUrl += `?${queryParams.toString()}`;
      }
      
      // Open PDF in new tab for download
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

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
                sources.add('Generate');
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
        [t('interface.customViewCard.source.createdfromscratch')]: <svg className="text-blue-500" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
      };
      
      return connectorMap[connectorName] || 
       <svg className="text-green-500" width={16} height={16} viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#05a844" stroke="#05a844"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>globe</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="Icon-Set" transform="translate(-204.000000, -671.000000)" fill="#088c3b"> <path d="M231.596,694.829 C229.681,694.192 227.622,693.716 225.455,693.408 C225.75,691.675 225.907,689.859 225.957,688 L233.962,688 C233.783,690.521 232.936,692.854 231.596,694.829 L231.596,694.829 Z M223.434,700.559 C224.1,698.95 224.645,697.211 225.064,695.379 C226.862,695.645 228.586,696.038 230.219,696.554 C228.415,698.477 226.073,699.892 223.434,700.559 L223.434,700.559 Z M220.971,700.951 C220.649,700.974 220.328,701 220,701 C219.672,701 219.352,700.974 219.029,700.951 C218.178,699.179 217.489,697.207 216.979,695.114 C217.973,695.027 218.98,694.976 220,694.976 C221.02,694.976 222.027,695.027 223.022,695.114 C222.511,697.207 221.822,699.179 220.971,700.951 L220.971,700.951 Z M209.781,696.554 C211.414,696.038 213.138,695.645 214.936,695.379 C215.355,697.211 215.9,698.95 216.566,700.559 C213.927,699.892 211.586,698.477 209.781,696.554 L209.781,696.554 Z M208.404,694.829 C207.064,692.854 206.217,690.521 206.038,688 L214.043,688 C214.093,689.859 214.25,691.675 214.545,693.408 C212.378,693.716 210.319,694.192 208.404,694.829 L208.404,694.829 Z M208.404,679.171 C210.319,679.808 212.378,680.285 214.545,680.592 C214.25,682.325 214.093,684.141 214.043,686 L206.038,686 C206.217,683.479 207.064,681.146 208.404,679.171 L208.404,679.171 Z M216.566,673.441 C215.9,675.05 215.355,676.789 214.936,678.621 C213.138,678.356 211.414,677.962 209.781,677.446 C211.586,675.523 213.927,674.108 216.566,673.441 L216.566,673.441 Z M219.029,673.049 C219.352,673.027 219.672,673 220,673 C220.328,673 220.649,673.027 220.971,673.049 C221.822,674.821 222.511,676.794 223.022,678.886 C222.027,678.973 221.02,679.024 220,679.024 C218.98,679.024 217.973,678.973 216.979,678.886 C217.489,676.794 218.178,674.821 219.029,673.049 L219.029,673.049 Z M223.954,688 C223.9,689.761 223.74,691.493 223.439,693.156 C222.313,693.058 221.168,693 220,693 C218.832,693 217.687,693.058 216.562,693.156 C216.26,691.493 216.1,689.761 216.047,688 L223.954,688 L223.954,688 Z M216.047,686 C216.1,684.239 216.26,682.507 216.562,680.844 C217.687,680.942 218.832,681 220,681 C221.168,681 222.313,680.942 223.438,680.844 C223.74,682.507 223.9,684.239 223.954,686 L216.047,686 L216.047,686 Z M230.219,677.446 C228.586,677.962 226.862,678.356 225.064,678.621 C224.645,676.789 224.1,675.05 223.434,673.441 C226.073,674.108 228.415,675.523 230.219,677.446 L230.219,677.446 Z M231.596,679.171 C232.936,681.146 233.783,683.479 233.962,686 L225.957,686 C225.907,684.141 225.75,682.325 225.455,680.592 C227.622,680.285 229.681,679.808 231.596,679.171 L231.596,679.171 Z M220,671 C211.164,671 204,678.163 204,687 C204,695.837 211.164,703 220,703 C228.836,703 236,695.837 236,687 C236,678.163 228.836,671 220,671 L220,671 Z" id="globe"> </path> </g> </g> </g></svg>;
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
        
        // Check if this is an event poster and redirect accordingly
        if ((data as any).productType === "event_poster" || (data as any).microproductType === "event_poster" || 
            (data.details && (data.details as any).eventName)) {
          console.log('🔄 [EVENT POSTER DETECTED] Redirecting to event poster results page:', productId);
          
          // Store poster data in localStorage for the results page
          const eventData = data.details || {};
          const sessionKey = `eventPoster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(sessionKey, JSON.stringify(eventData));
          
          // Redirect to event poster results page with session key
          router.push(`/create/event-poster/results?sessionKey=${sessionKey}`);
          return;
        }
        
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
        <div className="p-8 text-center text-gray-500">{t('interface.viewNew.projectNotFound', 'Project not found or data unavailable.')}</div>
      </div>
    );
  }

  return (
    <main 
      className="p-4 md:p-8 font-inter min-h-screen"
      style={{
        background: `linear-gradient(110.08deg, rgba(0, 187, 255, 0.2) 19.59%, rgba(0, 187, 255, 0.05) 80.4%), #FFFFFF`
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-x-4">
            <button
              onClick={handleBack}
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
              {t('interface.viewNew.back', 'Back')}
            </button>

            <button
              onClick={() => { if (typeof window !== 'undefined') window.location.href = '/projects'; }}
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
              {t('interface.viewNew.openProducts', 'Open Products')}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Smart Edit button for Course Outline */}
            {projectData && projectData.component_name === COMPONENT_NAME_TRAINING_PLAN && productId && (
              <button
                onClick={() => setShowSmartEditor(!showSmartEditor)}
                className="flex items-center gap-2 rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  lineHeight: '140%',
                  letterSpacing: '0.05em'
                }}
                title="Smart edit with AI"
              >
                <Sparkles size={14} style={{ color: 'white' }} /> Smart Edit
              </button>
            )}

            {/* Download PDF button for Course Outline
            <button
              onClick={handlePdfDownload}
              className="flex items-center gap-2 bg-white rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none disabled:opacity-60"
              style={{
                backgroundColor: '#0F58F9',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em'
              }}
              title="Download content as PDF"
            >
              <Download size={14} style={{ color: 'white' }} /> Download PDF
            </button> */}
          </div>
        </div>

        {/* Smart Prompt Editor - positioned between top panel and main content */}
        {showSmartEditor && projectData && projectData.component_name === COMPONENT_NAME_TRAINING_PLAN && editableData && (
          <div className="px-[120px]">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-[120px]">
          {/* Main Content Area - Course Outline and Modules */}
          <div className="lg:col-span-2 space-y-4">
            {/* Course Outline Title */}
            <div className="bg-white rounded-lg p-[25px]">
              {isEditingField('mainTitle') ? (
                <input
                  type="text"
                  value={(() => {
                    const trainingPlanData = (editableData || projectData.details) as TrainingPlanData;
                    return trainingPlanData?.mainTitle || projectData.name || t('interface.viewNew.courseOutline', 'Course Outline');
                  })()}
                  onChange={(e) => handleInputChange(['mainTitle'], e.target.value)}
                  onBlur={handleInputBlur}
                  className="text-[#191D30] font-semibold text-[32px] leading-none bg-transparent border-none outline-none w-full"
                  placeholder={t('interface.viewNew.courseTitle', 'Course Title')}
                  autoFocus
                />
              ) : (
                <div className="group flex items-center gap-2">
                  <h1 
                    className="text-[#191D30] font-semibold text-[32px] leading-none cursor-pointer"
                    onClick={() => startEditing('mainTitle')}
                  >
                    {(() => {
                      const trainingPlanData = (editableData || projectData.details) as TrainingPlanData;
                      return trainingPlanData?.mainTitle || projectData.name || t('interface.viewNew.courseOutline', 'Course Outline');
                    })()}
                  </h1>
                  <button
                    onClick={() => startEditing('mainTitle')}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center"
                    title={t('interface.viewNew.editCourseTitle', 'Edit course title')}
                  >
                    <Edit3 size={16} className="text-gray-500 hover:text-gray-700 flex-shrink-0" />
                  </button>
                </div>
              )}
            </div>

            {/* Render actual modules from the course outline data */}
            {(() => {
              const trainingPlanData = (editableData || projectData.details) as TrainingPlanData;
              if (!trainingPlanData?.sections) {
                return (
                  <div className="bg-white rounded-lg p-[25px]">
                    <p className="text-gray-500">{t('interface.viewNew.noModulesFound', 'No modules found in this course outline.')}</p>
                  </div>
                );
              }

              return trainingPlanData.sections.map((section, index) => (
                <div key={section.id || index} className="bg-white rounded-lg p-[25px]">
                  {isEditingField('sectionTitle', index) ? (
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleInputChange(['sections', index, 'title'], e.target.value)}
                      onBlur={handleInputBlur}
                      className="text-[#191D30] font-semibold text-[20px] leading-[100%] mb-2 bg-transparent border-none outline-none w-full"
                      placeholder={t('interface.viewNew.moduleTitle', 'Module Title')}
                      autoFocus
                    />
                  ) : (
                    <div className="group flex items-center gap-2 mb-2">
                      <h2 
                        className="text-[#191D30] font-semibold text-[20px] leading-[100%] cursor-pointer"
                        onClick={() => startEditing('sectionTitle', index)}
                      >
                        {t('interface.viewNew.moduleTitle', 'Module')} {index + 1}: {section.title}
                      </h2>
                      <button
                        onClick={() => startEditing('sectionTitle', index)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center"
                        title={t('interface.viewNew.editModuleTitle', 'Edit module title')}
                      >
                        <Edit3 size={14} className="text-gray-500 hover:text-gray-700 flex-shrink-0" />
                      </button>
                    </div>
                  )}
                  <p className="text-[#9A9DA2] font-normal text-[14px] leading-[100%] mb-[25px]">
                    {section.lessons?.length || 0} {t('interface.viewNew.lessons', 'lessons')}
                  </p>
                  <hr className="border-gray-200 mb-4 -mx-[25px]" />
                  {section.lessons && section.lessons.length > 0 && (
                    <div>
                      {section.lessons.map((lesson: Lesson, lessonIndex: number) => (
                        <div key={lesson?.id || lessonIndex} className="flex items-center justify-between gap-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#0F58F9] rounded-full"></div>
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
                                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center"
                                  title={t('interface.viewNew.editLessonTitle', 'Edit lesson title')}
                                >
                                  <Edit3 size={14} className="text-gray-500 hover:text-gray-700 flex-shrink-0" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-6 text-gray-400">
                              <CustomTooltip content={t('interface.viewNew.presentation', 'Presentation')}>
                                <div 
                                  onClick={() => {
                                    const lessonKey = lesson.id || lesson.title;
                                    const status = lessonContentStatus[lessonKey];
                                    if (status?.presentation?.exists && status.presentation.productId) {
                                      handleIconClick(status.presentation.productId);
                                    }
                                  }}
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  <LessonPresentationIcon 
                                    color={(() => {
                                      const lessonKey = lesson.id || lesson.title;
                                      const status = lessonContentStatus[lessonKey];
                                      const hasContent = status?.presentation?.exists;
                                      return hasContent ? '#0F58F9' : undefined;
                                    })()}
                                  />
                                </div>
                              </CustomTooltip>
                              <CustomTooltip content={t('interface.viewNew.onePager', 'One-Pager')}>
                                <div 
                                  onClick={() => {
                                    const lessonKey = lesson.id || lesson.title;
                                    const status = lessonContentStatus[lessonKey];
                                    if (status?.onePager?.exists && status.onePager.productId) {
                                      handleIconClick(status.onePager.productId);
                                    }
                                  }}
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  <TextPresentationIcon 
                                    color={(() => {
                                      const lessonKey = lesson.id || lesson.title;
                                      const status = lessonContentStatus[lessonKey];
                                      const hasContent = status?.onePager?.exists;
                                      return hasContent ? '#0F58F9' : undefined;
                                    })()}
                                  />
                                </div>
                              </CustomTooltip>
                              <CustomTooltip content={t('interface.viewNew.quiz', 'Quiz')}>
                                <div 
                                  onClick={() => {
                                    const lessonKey = lesson.id || lesson.title;
                                    const status = lessonContentStatus[lessonKey];
                                    if (status?.quiz?.exists && status.quiz.productId) {
                                      handleIconClick(status.quiz.productId);
                                    }
                                  }}
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  <QuizIcon 
                                    color={(() => {
                                      const lessonKey = lesson.id || lesson.title;
                                      const status = lessonContentStatus[lessonKey];
                                      const hasContent = status?.quiz?.exists;
                                      return hasContent ? '#0F58F9' : undefined;
                                    })()}
                                  />
                                </div>
                              </CustomTooltip>
                              {videoLessonEnabled && (
                                <CustomTooltip content={t('interface.viewNew.videoLesson', 'Video Lesson')}>
                                  <div 
                                    onClick={() => {
                                      const lessonKey = lesson.id || lesson.title;
                                      const status = lessonContentStatus[lessonKey];
                                      if (status?.videoLesson?.exists && status.videoLesson.productId) {
                                        handleIconClick(status.videoLesson.productId);
                                      }
                                    }}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                  >
                                    <VideoScriptIcon 
                                      color={(() => {
                                        const lessonKey = lesson.id || lesson.title;
                                        const status = lessonContentStatus[lessonKey];
                                        const hasContent = status?.videoLesson?.exists;
                                        return hasContent ? '#0F58F9' : undefined;
                                      })()}
                                    />
                                  </div>
                                </CustomTooltip>
                              )}
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === (lesson.id || `${index}-${lessonIndex}`) ? null : (lesson.id || `${index}-${lessonIndex}`))}
                                className="flex items-center gap-1 rounded px-[10px] py-[6px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                                style={{ backgroundColor: '#0F58F9', color: 'white', fontSize: '12px', fontWeight: 600, lineHeight: '120%', letterSpacing: '0.05em' }}
                                title={t('interface.viewNew.createContent', 'Create content')}
                              >
                                {t('interface.viewNew.create', 'Create')}
                                <ChevronDown size={12} className="ml-1" />
                              </button>
                              
                              {openDropdown === (lesson.id || `${index}-${lessonIndex}`) && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                                  <div className="p-1">
                                    {(() => {
                                      const lessonKey = lesson.id || lesson.title;
                                      const status = lessonContentStatus[lessonKey];
                                      const hasPresentation = status?.presentation?.exists;
                                      const hasOnePager = status?.onePager?.exists;
                                      const hasQuiz = status?.quiz?.exists;
                                      const hasVideoLesson = status?.videoLesson?.exists;

                                      return (
                                        <>
                                          <div className={`flex items-center justify-between px-3 py-2 ${!hasPresentation ? 'hover:bg-gray-50 cursor-pointer' : ''}`} onClick={!hasPresentation ? () => handleContentTypeClick(lesson, 'presentation') : undefined}>
                                            <span className={`text-sm ${hasPresentation ? 'text-gray-400' : 'text-gray-700'}`}>
                                              {t('interface.viewNew.presentation', 'Presentation')}
                                            </span>
                                            {hasPresentation && (
                                              <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                                <button
                                                  onClick={() => handleContentTypeClick(lesson, 'presentation')}
                                                  className="p-1 cursor-pointer"
                                                >
                                                  <RefreshCcw size={14} className="text-gray-700" />
                                                </button>
                                              </CustomTooltip>
                                            )}
                                          </div>
                                          <div className={`flex items-center justify-between px-3 py-2 ${!hasOnePager ? 'hover:bg-gray-50 cursor-pointer' : ''}`} onClick={!hasOnePager ? () => handleContentTypeClick(lesson, 'one-pager') : undefined}>
                                            <span className={`text-sm ${hasOnePager ? 'text-gray-400' : 'text-gray-700'}`}>
                                              {t('interface.viewNew.onePager', 'One-Pager')}
                                            </span>
                                            {hasOnePager && (
                                              <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                                <button
                                                  onClick={() => handleContentTypeClick(lesson, 'one-pager')}
                                                  className="p-1 cursor-pointer"
                                                >
                                                  <RefreshCcw size={14} className="text-gray-700" />
                                                </button>
                                              </CustomTooltip>
                                            )}
                                          </div>
                                          <div className={`flex items-center justify-between px-3 py-2 ${!hasQuiz ? 'hover:bg-gray-50 cursor-pointer' : ''}`} onClick={!hasQuiz ? () => handleContentTypeClick(lesson, 'quiz') : undefined}>
                                            <span className={`text-sm ${hasQuiz ? 'text-gray-400' : 'text-gray-700'}`}>
                                              {t('interface.viewNew.quiz', 'Quiz')}
                                            </span>
                                            {hasQuiz && (
                                              <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                                <button
                                                  onClick={() => handleContentTypeClick(lesson, 'quiz')}
                                                  className="p-1 cursor-pointer"
                                                >
                                                  <RefreshCcw size={14} className="text-gray-700" />
                                                </button>
                                              </CustomTooltip>
                                            )}
                                          </div>
                                          {videoLessonEnabled && (
                                            <div className={`flex items-center justify-between px-3 py-2 ${!hasVideoLesson ? 'hover:bg-gray-50 cursor-pointer' : ''}`} onClick={!hasVideoLesson ? () => handleContentTypeClick(lesson, 'video-lesson') : undefined}>
                                              <span className={`text-sm ${hasVideoLesson ? 'text-gray-400' : 'text-gray-700'}`}>
                                                {t('interface.viewNew.videoLesson', 'Video Lesson')}
                                              </span>
                                              {hasVideoLesson && (
                                                <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                                  <button
                                                    onClick={() => handleContentTypeClick(lesson, 'video-lesson')}
                                                    className="p-1 cursor-pointer"
                                                  >
                                                    <RefreshCcw size={14} className="text-gray-700" />
                                                  </button>
                                                </CustomTooltip>
                                              )}
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
          <div className="lg:col-span-1">
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
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center">
          <span className="mr-2">⚠️</span>
          <span>{saveError}</span>
          <button
            onClick={() => setSaveError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
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


