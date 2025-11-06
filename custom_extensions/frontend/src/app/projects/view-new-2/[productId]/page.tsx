// custom_extensions/frontend/src/app/projects/view-new/[productId]/page.tsx
"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FolderOpen, Sparkles, Edit3, Plus, ShieldAlert, ChevronDown, Eye, XCircle, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ProjectInstanceDetail, TrainingPlanData, Lesson } from '@/types/projectSpecificTypes';
import CustomViewCard, { defaultContentTypes } from '@/components/ui/custom-view-card';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useFeaturePermission } from '@/hooks/useFeaturePermission';
import { ProductViewHeader } from '@/components/ProductViewHeader';
import { AiAgent } from '@/components/ui/ai-agent';

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
  const { isEnabled: columnVideoLessonEnabled } = useFeaturePermission('col_video_presentation');
  const { isEnabled: scormEnabled } = useFeaturePermission('export_scorm_2004');
  
  // Helper function for Slavic pluralization (Russian, Ukrainian)
  const getSlavicPluralForm = (count: number): 'one' | 'few' | 'many' => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastDigit === 1 && lastTwoDigits !== 11) return 'one';
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return 'few';
    return 'many';
  };
  
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

  // Course sharing state
  const [isSharing, setIsSharing] = useState(false);
  const [shareData, setShareData] = useState<{
    shareToken: string;
    publicUrl: string;
    expiresAt: string;
  } | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{[key: number]: boolean}>({});
  const [showAiAgent, setShowAiAgent] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedExamples, setSelectedExamples] = useState<string[]>([]);
  const [aiAgentChatStarted, setAiAgentChatStarted] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [previewContent, setPreviewContent] = useState<TrainingPlanData | null>(null);
  const advancedSectionRef = useRef<HTMLDivElement>(null);

  // AI Agent examples (similar to course outline)
  const aiAgentExamples = [
    { short: t('interface.aiAgent.example1', 'Make it more engaging'), detailed: t('interface.aiAgent.example1Full', 'Make the course outline more engaging for students') },
    { short: t('interface.aiAgent.example2', 'Add more details'), detailed: t('interface.aiAgent.example2Full', 'Add more details to the lesson descriptions') },
    { short: t('interface.aiAgent.example3', 'Simplify language'), detailed: t('interface.aiAgent.example3Full', 'Simplify the language for better understanding') }
  ];

  const toggleExample = (example: { short: string; detailed: string }) => {
    setSelectedExamples((prev) =>
      prev.includes(example.short)
        ? prev.filter((e) => e !== example.short)
        : [...prev, example.short]
    );
    setEditPrompt((prev) => {
      if (prev.includes(example.detailed)) {
        return prev.replace(example.detailed, '').trim();
      }
      return prev ? `${prev} ${example.detailed}` : example.detailed;
    });
  };

  const handleApplyEdit = async () => {
    const trimmed = editPrompt.trim();
    if (!trimmed || loadingEdit || !productId) return;

    const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
    if (!trainingPlanData) return;

    setLoadingEdit(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/training-plan/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'same-origin',
        body: JSON.stringify({
          prompt: trimmed,
          projectId: parseInt(productId),
          language: trainingPlanData.detectedLanguage || "en",
          theme: trainingPlanData.theme || "cherry",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const packet = JSON.parse(line);
            if (packet.type === "done" && packet.updatedContent) {
              if (packet.isPreview) {
                // This is a preview - store it and show immediately in the UI
                setPreviewContent(packet.updatedContent);
                setEditableData(packet.updatedContent);
              } else {
                // Old immediate update flow (fallback if backend doesn't send isPreview)
                setEditableData(packet.updatedContent);
                setEditPrompt('');
                setSelectedExamples([]);
              }
            } else if (packet.type === "error") {
              throw new Error(packet.message || "AI edit failed");
            }
          } catch (e) {
            if (e instanceof SyntaxError) {
              console.warn("Failed to parse packet:", line);
              continue;
            }
            throw e;
          }
        }
      }
    } catch (error) {
      console.error('Error applying edit:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to apply edit');
    } finally {
      setLoadingEdit(false);
    }
  };

  // Confirm the AI edit and save to database
  const handleConfirmEdit = async () => {
    if (!previewContent || !productId) return;

    try {
      const trainingPlanData = (editableData || projectData?.details) as TrainingPlanData;
      
      const response = await fetch(`${CUSTOM_BACKEND_URL}/training-plan/confirm-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'same-origin',
        body: JSON.stringify({
          projectId: parseInt(productId),
          updatedContent: previewContent,
          language: trainingPlanData?.detectedLanguage || "en",
          theme: trainingPlanData?.theme || "cherry",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Changes are confirmed and saved
        setEditableData(previewContent);
        setPreviewContent(null);
        setEditPrompt('');
        setSelectedExamples([]);
        
        // Refresh the project data to ensure everything is in sync
        const commonHeaders: HeadersInit = {};
        const devUserId = "dummy-onyx-user-id-for-testing";
        if (devUserId && process.env.NODE_ENV === 'development') {
          commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
        }
        
        const refreshResponse = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${productId}`, {
          cache: 'no-store',
          headers: commonHeaders
        });
        if (refreshResponse.ok) {
          const refreshedData: ProjectInstanceDetail = await refreshResponse.json();
          setProjectData(refreshedData);
          setEditableData(refreshedData.details as TrainingPlanData);
        }
      } else {
        setSaveError("Failed to save changes");
      }
    } catch (error) {
      console.error('Error confirming edit:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    }
  };

  // Revert the AI edit preview
  const handleRevertEdit = async () => {
    if (!productId) return;
    
    // Refetch the original data from the server to restore
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

      if (response.ok) {
        const data: ProjectInstanceDetail = await response.json();
        setProjectData(data);
        setEditableData(data.details as TrainingPlanData);
      }
    } catch (error) {
      console.error('Error refetching project data:', error);
      setError('Failed to restore original content');
    }
    
    setPreviewContent(null);
    setEditPrompt('');
    setSelectedExamples([]);
  };

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
  const handleIconClick = useCallback((productId: number, contentType?: string) => {
    // Video lessons should navigate to view-new-2, all other products use view
    if (contentType === 'video-lesson') {
      router.push(`/projects-2/view/${productId}`);
    } else {
      router.push(`/projects/view/${productId}`);
    }
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

  /* --- Course sharing handlers --- */
  const handleShareCourse = async () => {
    if (!productId) return;
    
    setIsSharing(true);
    setShareError(null);
    
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
      const response = await fetch(`${CUSTOM_BACKEND_URL}/course-outlines/${productId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expires_in_days: 30 // Default 30 days
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to share course: ${response.status}`);
      }

      const data = await response.json();
      setShareData({
        shareToken: data.share_token,
        publicUrl: data.public_url,
        expiresAt: data.expires_at
      });
      
      console.log('✅ [COURSE SHARING] Successfully created share link:', data.public_url);
      
    } catch (error: any) {
      console.error('❌ [COURSE SHARING] Error sharing course:', error);
      setShareError(error.message || 'Failed to create share link');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ [COURSE SHARING] Link copied to clipboard');
    } catch (error) {
      console.error('❌ [COURSE SHARING] Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('✅ [COURSE SHARING] Link copied to clipboard (fallback)');
    }
  };

  const handleCloseShareModal = () => {
    setShareData(null);
    setShareError(null);
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
      <ProductViewHeader
        projectData={projectData}
        editableData={editableData}
        productId={productId}
        showAiAgent={showAiAgent}
        setShowAiAgent={setShowAiAgent}
        scormEnabled={scormEnabled}
        componentName={COMPONENT_NAME_TRAINING_PLAN}
        t={t}
      />

      <div 
        className="max-w-7xl mx-auto flex flex-col transition-all duration-300 ease-in-out"
        style={{
          marginRight: showAiAgent ? '400px' : '0'
        }}
      >
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-8 lg:px-[100px]">
          {/* Main Content Area - Course Outline and Modules */}
          <div className="lg:col-span-3 space-y-4 pb-4">
            {/* AI Edit Preview Confirmation Banner */}
            {previewContent && (
              <div className="w-full bg-white rounded-lg p-6 border border-[#E0E0E0] mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('actions.reviewChanges', 'Review Changes')}</h3>
                </div>
                
                <p className="text-gray-700 mb-6">
                  {t('actions.reviewChangesMessage', 'The AI has updated your training plan. Please review the changes below. You can accept these changes to save them permanently, or revert to go back to the original content.')}
                </p>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirmEdit}
                    className="flex items-center gap-2 rounded-md h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: '#0F58F9',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '140%',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('actions.acceptChanges', 'Accept Changes')}
                  </button>
                  
                  <button
                    onClick={handleRevertEdit}
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
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="#0F58F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 3v5h-5" stroke="#0F58F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="#0F58F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 21v-5h5" stroke="#0F58F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('actions.revertChanges', 'Revert Changes')}
                  </button>
                </div>
              </div>
            )}
            
            {/* Course Info Bar */}
            <div className="flex justify-between items-center py-3 mb-0">
              <div className="flex items-center gap-2 text-[#797979] text-[14px]">
                <span>
                  {totalModules} {(() => {
                    const form = getSlavicPluralForm(totalModules);
                    if (form === 'one') return t('interface.viewNew.module', 'module');
                    if (form === 'few') return t('interface.viewNew.modulesGenitive', 'modules');
                    return t('interface.viewNew.modules', 'modules');
                  })()}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#797979]"></span>
                <span>
                  {totalLessons} {(() => {
                    const form = getSlavicPluralForm(totalLessons);
                    if (form === 'one') return t('interface.viewNew.lessonSingular', 'lesson total');
                    if (form === 'few') return t('interface.viewNew.lessonsGenitive', 'lessons total');
                    return t('interface.viewNew.lessonsTotal', 'lessons total');
                  })()}
                </span>
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
                <span className="text-[#797979] text-[14px] font-medium">{t('interface.viewNew.collapseAll', 'Collapse All')}</span>
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
                <div key={section.id || index} className="bg-[#F9F9F9] rounded-lg border border-[#E0E0E0] overflow-hidden">
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
                        <span className="bg-white text-[#A5A5A5] text-[12px] px-2 py-[5px] rounded-full">
                          {section.lessons?.length || 0} {(() => {
                            const count = section.lessons?.length || 0;
                            const form = getSlavicPluralForm(count);
                            if (form === 'one') return t('interface.viewNew.lesson', 'Lesson');
                            if (form === 'few') return t('interface.viewNew.lessonsGenitiveSingle', 'Lessons');
                            return t('interface.viewNew.lessonsGenitivePlural', 'Lessons');
                          })()}
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
                  <div className="grid mb-4 gap-4 items-center px-[25px] py-[10px] mx-[-25px]" style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 100px' : ''} 100px 100px 100px`, borderBottom: '1px solid #E0E0E0' }} >
                    <div className="text-[14px] font-medium text-[#4D4D4D]">
                      {t('interface.viewNew.lessons', 'Lessons')}
                    </div>
  {columnVideoLessonEnabled && (
    <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.99967 11.3333V14M5.33301 14H10.6663M6.66634 4.66667L9.99967 6.66667L6.66634 8.66667V4.66667ZM2.66634 2H13.333C14.0694 2 14.6663 2.59695 14.6663 3.33333V10C14.6663 10.7364 14.0694 11.3333 13.333 11.3333H2.66634C1.92996 11.3333 1.33301 10.7364 1.33301 10V3.33333C1.33301 2.59695 1.92996 2 2.66634 2Z" stroke="#0AFFEA" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>{t('interface.viewNew.videoLesson', 'Video Lesson')}</span>
    </div>
  )}
  <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.66699 6.86732C6.80033 6.60065 7.00033 6.33398 7.26699 6.20065C7.54308 6.04103 7.86539 5.98046 8.18059 6.02895C8.49579 6.07745 8.78498 6.2321 9.00033 6.46732C9.20033 6.73398 9.33366 7.00065 9.33366 7.33398C9.33366 8.20065 8.00033 8.66732 8.00033 8.66732M8.00033 11.334H8.00699M9.66699 1.33398H4.00033C3.6467 1.33398 3.30756 1.47446 3.05752 1.72451C2.80747 1.97456 2.66699 2.3137 2.66699 2.66732V13.334C2.66699 13.6876 2.80747 14.0267 3.05752 14.2768C3.30756 14.5268 3.6467 14.6673 4.00033 14.6673H12.0003C12.3539 14.6673 12.6931 14.5268 12.9431 14.2768C13.1932 14.0267 13.3337 13.6876 13.3337 13.334V5.00065L9.66699 1.33398Z" stroke="#FF960A" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>{t('interface.viewNew.quiz', 'Quiz')}</span>
  </div>
  <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3333 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H13.3333C13.7015 6.66667 14 6.36819 14 6V2.66667C14 2.29848 13.7015 2 13.3333 2Z" stroke="#D60AFF" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.33333 9.33333H2.66667C2.29848 9.33333 2 9.63181 2 10V13.3333C2 13.7015 2.29848 14 2.66667 14H7.33333C7.70152 14 8 13.7015 8 13.3333V10C8 9.63181 7.70152 9.33333 7.33333 9.33333Z" stroke="#D60AFF" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3333 9.33333H11.3333C10.9651 9.33333 10.6667 9.63181 10.6667 10V13.3333C10.6667 13.7015 10.9651 14 11.3333 14H13.3333C13.7015 14 14 13.7015 14 13.3333V10C14 9.63181 13.7015 9.33333 13.3333 9.33333Z" stroke="#D60AFF" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>{t('interface.viewNew.presentation', 'Presentation')}</span>
  </div>
                    <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
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
                          <div key={lesson?.id || lessonIndex} className="grid gap-4 items-center pl-[24px] py-[16px] rounded-md" style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 100px' : ''} 100px 100px 100px`, border: '1px solid #E0E0E0' }} >
                            {/* Lesson Title Column */}
                            <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[#171718] text-[16px] font-medium">{lessonIndex + 1}.</span>
                              {isEditingField('lessonTitle', index, lessonIndex) ? (
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => handleInputChange(['sections', index, 'lessons', lessonIndex, 'title'], e.target.value)}
                                  onBlur={handleInputBlur}
                                  className="text-[#171718] text-[16px] leading-[100%] font-medium bg-transparent border-none outline-none flex-1"
                                  placeholder={t('interface.viewNew.lessonTitle', 'Lesson Title')}
                                  autoFocus
                                />
                              ) : (
                                <div className="group flex items-center gap-2">
                                  <span 
                                    className="text-[#191D30] text-[16px] leading-[100%] font-medium cursor-pointer"
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
                                <span className="text-[#A5A5A5] text-[9px]">{actualCreatedCount}/{totalProducts} {t('interface.viewNew.created', 'created')}</span>
                              </div>
                            </div>
                            
                            {columnVideoLessonEnabled && (
                              <div className="flex items-center justify-center">
                                {hasVideoLesson ? (
                                  <div className="relative group flex items-center justify-center">
                                    <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                      <div 
                                        className="w-[30px] h-[30px] rounded-full bg-[#0F58F9] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-2"
                                        onClick={() => {
                                          setShowRegenerateModal({
                                            isOpen: true,
                                            lesson: lesson,
                                            contentType: 'video-lesson',
                                            existingProductId: status?.videoLesson?.productId || null
                                          });
                                        }}
                                      >
                                        <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M7 2.41421H2.33333C1.97971 2.41421 1.64057 2.55469 1.39052 2.80474C1.14048 3.05479 1 3.39392 1 3.74755V13.0809C1 13.4345 1.14048 13.7736 1.39052 14.0237C1.64057 14.2737 1.97971 14.4142 2.33333 14.4142H11.6667C12.0203 14.4142 12.3594 14.2737 12.6095 14.0237C12.8595 13.7736 13 13.4345 13 13.0809V8.41421M12 1.41421C12.2652 1.149 12.6249 1 13 1C13.3751 1 13.7348 1.149 14 1.41421C14.2652 1.67943 14.4142 2.03914 14.4142 2.41421C14.4142 2.78929 14.2652 3.149 14 3.41421L7.66667 9.74755L5 10.4142L5.66667 7.74755L12 1.41421Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                    </CustomTooltip>
                                    {/* View icon on hover */}
                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                      <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                        <div 
                                          className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                          style={{ border: '1px solid #0F58F9' }}
                                          onClick={() => {
                                            if (status?.videoLesson?.productId) {
                                              handleIconClick(status.videoLesson.productId);
                                            }
                                          }}
                                        >
                                          <Eye size={15} strokeWidth={2} className="text-[#0F58F9]" />
                                        </div>
                                      </CustomTooltip>
                                    </div>
                                  </div>
                                ) : (
                                  <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                    <div 
                                      className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                      style={{ border: '1px solid #0F58F9' }}
                                      onClick={() => handleContentTypeClick(lesson, 'video-lesson')}
                                    >
                                      <Plus size={15} strokeWidth={2} className="text-[#0F58F9]" />
                                    </div>
                                  </CustomTooltip>
                                )}
                              </div>
                            )}

                            {/* Quiz Status Column */}
                            <div className="flex items-center justify-center">
                              {hasQuiz ? (
                                <div className="relative group flex items-center justify-center">
                                  <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                    <div 
                                      className="w-[30px] h-[30px] rounded-full bg-[#0F58F9] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-2"
                                      onClick={() => {
                                        setShowRegenerateModal({
                                          isOpen: true,
                                          lesson: lesson,
                                          contentType: 'quiz',
                                          existingProductId: status?.quiz?.productId || null
                                        });
                                      }}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 2.41421H2.33333C1.97971 2.41421 1.64057 2.55469 1.39052 2.80474C1.14048 3.05479 1 3.39392 1 3.74755V13.0809C1 13.4345 1.14048 13.7736 1.39052 14.0237C1.64057 14.2737 1.97971 14.4142 2.33333 14.4142H11.6667C12.0203 14.4142 12.3594 14.2737 12.6095 14.0237C12.8595 13.7736 13 13.4345 13 13.0809V8.41421M12 1.41421C12.2652 1.149 12.6249 1 13 1C13.3751 1 13.7348 1.149 14 1.41421C14.2652 1.67943 14.4142 2.03914 14.4142 2.41421C14.4142 2.78929 14.2652 3.149 14 3.41421L7.66667 9.74755L5 10.4142L5.66667 7.74755L12 1.41421Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  </CustomTooltip>
                                  {/* View icon on hover */}
                                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                    <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                      <div 
                                        className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid #0F58F9' }}
                                        onClick={() => {
                                          if (status?.quiz?.productId) {
                                            handleIconClick(status.quiz.productId);
                                          }
                                        }}
                                      >
                                        <Eye size={15} strokeWidth={2} className="text-[#0F58F9]" />
                                      </div>
                                    </CustomTooltip>
                                  </div>
                                </div>
                              ) : (
                                <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                  <div 
                                    className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ border: '1px solid #0F58F9' }}
                                    onClick={() => handleContentTypeClick(lesson, 'quiz')}
                                  >
                                    <Plus size={15} strokeWidth={2} className="text-[#0F58F9]" />
                                  </div>
                                </CustomTooltip>
                              )}
                            </div>

                            {/* Presentation Status Column */}
                            <div className="flex items-center justify-center">
                              {hasPresentation ? (
                                <div className="relative group flex items-center justify-center">
                                  <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                    <div 
                                      className="w-[30px] h-[30px] rounded-full bg-[#0F58F9] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-2"
                                      onClick={() => {
                                        setShowRegenerateModal({
                                          isOpen: true,
                                          lesson: lesson,
                                          contentType: 'presentation',
                                          existingProductId: status?.presentation?.productId || null
                                        });
                                      }}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 2.41421H2.33333C1.97971 2.41421 1.64057 2.55469 1.39052 2.80474C1.14048 3.05479 1 3.39392 1 3.74755V13.0809C1 13.4345 1.14048 13.7736 1.39052 14.0237C1.64057 14.2737 1.97971 14.4142 2.33333 14.4142H11.6667C12.0203 14.4142 12.3594 14.2737 12.6095 14.0237C12.8595 13.7736 13 13.4345 13 13.0809V8.41421M12 1.41421C12.2652 1.149 12.6249 1 13 1C13.3751 1 13.7348 1.149 14 1.41421C14.2652 1.67943 14.4142 2.03914 14.4142 2.41421C14.4142 2.78929 14.2652 3.149 14 3.41421L7.66667 9.74755L5 10.4142L5.66667 7.74755L12 1.41421Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  </CustomTooltip>
                                  {/* View icon on hover */}
                                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                    <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                      <div 
                                        className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid #0F58F9' }}
                                        onClick={() => {
                                          if (status?.presentation?.productId) {
                                            handleIconClick(status.presentation.productId);
                                          }
                                        }}
                                      >
                                        <Eye size={15} strokeWidth={2} className="text-[#0F58F9]" />
                                      </div>
                                    </CustomTooltip>
                                  </div>
                                </div>
                              ) : (
                                <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                  <div 
                                    className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ border: '1px solid #0F58F9' }}
                                    onClick={() => handleContentTypeClick(lesson, 'presentation')}
                                  >
                                    <Plus size={15} strokeWidth={2} className="text-[#0F58F9]" />
                                  </div>
                                </CustomTooltip>
                              )}
                            </div>

                            {/* One-Pager Status Column */}
                            <div className="flex items-center justify-center">
                              {hasOnePager ? (
                                <div className="relative group flex items-center justify-center">
                                  <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top">
                                    <div 
                                      className="w-[30px] h-[30px] rounded-full bg-[#0F58F9] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-200 group-hover:-translate-x-2"
                                      onClick={() => {
                                        setShowRegenerateModal({
                                          isOpen: true,
                                          lesson: lesson,
                                          contentType: 'one-pager',
                                          existingProductId: status?.onePager?.productId || null
                                        });
                                      }}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 2.41421H2.33333C1.97971 2.41421 1.64057 2.55469 1.39052 2.80474C1.14048 3.05479 1 3.39392 1 3.74755V13.0809C1 13.4345 1.14048 13.7736 1.39052 14.0237C1.64057 14.2737 1.97971 14.4142 2.33333 14.4142H11.6667C12.0203 14.4142 12.3594 14.2737 12.6095 14.0237C12.8595 13.7736 13 13.4345 13 13.0809V8.41421M12 1.41421C12.2652 1.149 12.6249 1 13 1C13.3751 1 13.7348 1.149 14 1.41421C14.2652 1.67943 14.4142 2.03914 14.4142 2.41421C14.4142 2.78929 14.2652 3.149 14 3.41421L7.66667 9.74755L5 10.4142L5.66667 7.74755L12 1.41421Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  </CustomTooltip>
                                  {/* View icon on hover */}
                                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                    <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top">
                                      <div 
                                        className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ border: '1px solid #0F58F9' }}
                                        onClick={() => {
                                          if (status?.onePager?.productId) {
                                            handleIconClick(status.onePager.productId);
                                          }
                                        }}
                                      >
                                        <Eye size={15} strokeWidth={2} className="text-[#0F58F9]" />
                                      </div>
                                    </CustomTooltip>
                                  </div>
                                </div>
                              ) : (
                                <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top">
                                  <div 
                                    className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ border: '1px solid #0F58F9' }}
                                    onClick={() => handleContentTypeClick(lesson, 'one-pager')}
                                  >
                                    <Plus size={15} strokeWidth={2} className="text-[#0F58F9]" />
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
                className="flex items-center gap-2 rounded h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
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
                className="flex items-center gap-2 rounded h-9 px-[15px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
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

      {/* Course Share Modal */}
      {shareData && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">{t('interface.viewNew.shareCourse', 'Share Course Outline')}</h2>
              <button
                onClick={handleCloseShareModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interface.viewNew.shareLink', 'Share Link')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareData.publicUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900"
                  />
                  <button
                    onClick={() => copyToClipboard(shareData.publicUrl)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    {t('interface.viewNew.copy', 'Copy')}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  {t('interface.viewNew.shareDescription', 'Anyone with this link can view your course outline and attached products.')}
                </p>
                <p>
                  <strong>{t('interface.viewNew.expires', 'Expires:')}</strong> {new Date(shareData.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Share Error Modal */}
      {shareError && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">{t('interface.viewNew.shareError', 'Share Error')}</h2>
              </div>
              <p className="text-gray-600 mb-4">{shareError}</p>
              <button
                onClick={handleCloseShareModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('interface.viewNew.close', 'Close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* AI Agent Side Panel - slides from right, positioned below header */}
      <div 
        className="fixed right-0 transition-transform duration-300 ease-in-out z-30 flex flex-col"
        style={{
          top: '64px', // Start below the header
          height: 'calc(100vh - 64px)', // Full height minus header
          width: '400px',
          backgroundColor: '#F9F9F9',
          transform: showAiAgent ? 'translateX(0)' : 'translateX(100%)',
          borderLeft: '1px solid #CCCCCC'
        }}
      >
        {projectData && (
          <AiAgent
              editPrompt={editPrompt}
              setEditPrompt={setEditPrompt}
              examples={aiAgentExamples}
              selectedExamples={selectedExamples}
              toggleExample={toggleExample}
              loadingEdit={loadingEdit}
              onApplyEdit={handleApplyEdit}
              onClose={() => setShowAiAgent(false)}
              advancedSectionRef={advancedSectionRef}
              placeholder={t('interface.aiAgent.describeImprovements', "Describe what you'd like to improve...")}
              buttonText={t('interface.aiAgent.edit', 'Edit')}
              hasStartedChat={aiAgentChatStarted}
              setHasStartedChat={setAiAgentChatStarted}
              hasFooter={false}
            />
          )}
      </div>
    </main>
  );
}


