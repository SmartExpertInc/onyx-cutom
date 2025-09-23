// custom_extensions/frontend/src/app/projects/view-new/[productId]/page.tsx
"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, FolderOpen, Sparkles, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ProjectInstanceDetail, TrainingPlanData, Lesson } from '@/types/projectSpecificTypes';

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
const CustomTooltip: React.FC<{ children: React.ReactNode; content: string }> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 6,
        left: rect.left + rect.width / 2
      });
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
        className="relative inline-block w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-blue-500 text-white px-1.5 py-1 rounded-md shadow-lg text-xs whitespace-nowrap relative max-w-xs">
            <div className="font-medium">{content}</div>
            {/* Simple triangle tail */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-blue-500"></div>
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

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

export default function ProductViewNewPage() {
  const params = useParams<ProductViewNewParams>();
  const productId = params?.productId;
  const router = useRouter();
  
  const [projectData, setProjectData] = useState<ProjectInstanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [lessonContentStatus, setLessonContentStatus] = useState<{[key: string]: {presentation: boolean, onePager: boolean, quiz: boolean, videoLesson: boolean}}>({});

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

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) window.history.back();
      else router.push('/projects');
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
      const contentStatus: {[key: string]: {presentation: boolean, onePager: boolean, quiz: boolean, videoLesson: boolean}} = {};
      
      for (const lesson of lessons) {
        const lessonKey = lesson.id || lesson.title;
        
        // Initialize status for this lesson
        contentStatus[lessonKey] = {
          presentation: false,
          onePager: false,
          quiz: false,
          videoLesson: false
        };

        // Look for projects that match this lesson using the same logic as TrainingPlan.tsx
        const expectedProjectName = `${outlineName}: ${lesson.title}`;
        
        const matchingProjects = allProjects.filter((project: { projectName?: string; design_microproduct_type?: string; microproduct_type?: string }) => {
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
              contentStatus[lessonKey].presentation = true;
              break;
            case 'Text Presentation':
              contentStatus[lessonKey].onePager = true;
              break;
            case 'Quiz':
              contentStatus[lessonKey].quiz = true;
              break;
            case 'Video Lesson':
            case 'Video Lesson Presentation':
              contentStatus[lessonKey].videoLesson = true;
              break;
          }
        }
      }

      setLessonContentStatus(contentStatus);
      console.log('Lesson content status updated:', contentStatus);
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

  // Debug effect to monitor lesson content status changes
  useEffect(() => {
    if (Object.keys(lessonContentStatus).length > 0) {
      console.log('🔍 Lesson content status changed:', lessonContentStatus);
    }
  }, [lessonContentStatus]);

  const handleContentTypeClick = async (lesson: Lesson, contentType: string) => {
    const trainingPlanData = projectData?.details as TrainingPlanData;
    if (!trainingPlanData || !productId) return;

    const params = new URLSearchParams({
      outlineId: productId,
      lesson: lesson.title,
      length: '300-400 words',
      slidesCount: '5',
      lang: trainingPlanData.detectedLanguage || 'en'
    });

    let createUrl = '';
    switch (contentType) {
      case 'presentation':
        createUrl = `/create/lesson-presentation?${params.toString()}`;
        break;
      case 'one-pager':
        createUrl = `/create/text-presentation?${params.toString()}`;
        break;
      case 'quiz':
        createUrl = `/create/quiz?${params.toString()}`;
        break;
      case 'video-lesson':
        // Keep inactive for now
        return;
    }

    // Store a flag to refresh content status when returning to this page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('refresh_lesson_content_status', 'true');
    }

    router.push(createUrl);
    setOpenDropdown(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center text-lg text-gray-600">Loading project details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-8 text-center text-red-700 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center text-gray-500">Project not found or data unavailable.</div>
      </div>
    );
  }

  return (
    <main 
      className="p-4 md:p-8 h-screen overflow-hidden font-inter"
      style={{
        background: `linear-gradient(110.08deg, rgba(0, 187, 255, 0.2) 19.59%, rgba(0, 187, 255, 0.05) 80.4%), #FFFFFF`
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col h-full">
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
              Back
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
              Open Products
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Smart Edit button for Course Outline */}
            <button
              onClick={() => {}}
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

            {/* Download PDF button for Course Outline */}
            <button
              onClick={() => {}}
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
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-[120px] flex-1 overflow-hidden">
          {/* Main Content Area - Course Outline and Modules */}
          <div className="lg:col-span-2 space-y-4 h-full overflow-y-auto pr-2">
            {/* Course Outline Title */}
            <div className="bg-white rounded-lg p-[25px]">
              <h1 className="text-[#191D30] font-regular text-[30px] leading-[100%]">
                {(() => {
                  const trainingPlanData = projectData.details as TrainingPlanData;
                  return trainingPlanData?.mainTitle || projectData.name || 'Course Outline';
                })()}
              </h1>
            </div>

            {/* Render actual modules from the course outline data */}
            {(() => {
              const trainingPlanData = projectData.details as TrainingPlanData;
              if (!trainingPlanData?.sections) {
                return (
                  <div className="bg-white rounded-lg p-[25px]">
                    <p className="text-gray-500">No modules found in this course outline.</p>
                  </div>
                );
              }

              return trainingPlanData.sections.map((section, index) => (
                <div key={section.id || index} className="bg-white rounded-lg p-[25px]">
                  <h2 className="text-[#191D30] font-medium text-[18px] leading-[100%] mb-2">
                    Module {index + 1}: {section.title}
                  </h2>
                  <p className="text-[#9A9DA2] font-normal text-[14px] leading-[100%] mb-[25px]">
                    {section.lessons?.length || 0} lessons
                  </p>
                  <hr className="border-gray-200 mb-4" />
                  {section.lessons && section.lessons.length > 0 && (
                    <div>
                      {section.lessons.map((lesson: Lesson, lessonIndex: number) => (
                        <div key={lesson?.id || lessonIndex} className="flex items-center justify-between gap-6 py-3">
                          <div className="flex items-center gap-2">
                            <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.78446 3.30541C6.32191 3.61252 6.32191 4.38748 5.78446 4.69459L1.19691 7.31605C0.663586 7.62081 1.60554e-07 7.23571 1.87404e-07 6.62146L4.16579e-07 1.37854C4.43429e-07 0.764285 0.663586 0.379192 1.19691 0.683949L5.78446 3.30541Z" fill="#0F58F9"/>
                            </svg>
                            <span className="text-[#191D30] text-[16px] leading-[100%] font-normal">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-6 text-gray-400">
                              <CustomTooltip content="Presentation">
                                <LessonPresentationIcon 
                                  color={(() => {
                                    const lessonKey = lesson.id || lesson.title;
                                    const status = lessonContentStatus[lessonKey];
                                    const hasContent = status?.presentation;
                                    console.log(`🎯 Presentation icon for "${lesson.title}":`, { lessonKey, status, hasContent });
                                    return hasContent ? '#0F58F9' : undefined;
                                  })()}
                                />
                              </CustomTooltip>
                              <CustomTooltip content="One-Pager">
                                <TextPresentationIcon 
                                  color={(() => {
                                    const lessonKey = lesson.id || lesson.title;
                                    const status = lessonContentStatus[lessonKey];
                                    const hasContent = status?.onePager;
                                    console.log(`🎯 One-Pager icon for "${lesson.title}":`, { lessonKey, status, hasContent });
                                    return hasContent ? '#0F58F9' : undefined;
                                  })()}
                                />
                              </CustomTooltip>
                              <CustomTooltip content="Quiz">
                                <QuizIcon 
                                  color={(() => {
                                    const lessonKey = lesson.id || lesson.title;
                                    const status = lessonContentStatus[lessonKey];
                                    const hasContent = status?.quiz;
                                    console.log(`🎯 Quiz icon for "${lesson.title}":`, { lessonKey, status, hasContent });
                                    return hasContent ? '#0F58F9' : undefined;
                                  })()}
                                />
                              </CustomTooltip>
                              <CustomTooltip content="Video Lesson">
                                <VideoScriptIcon 
                                  color={(() => {
                                    const lessonKey = lesson.id || lesson.title;
                                    const status = lessonContentStatus[lessonKey];
                                    const hasContent = status?.videoLesson;
                                    console.log(`🎯 Video Lesson icon for "${lesson.title}":`, { lessonKey, status, hasContent });
                                    return hasContent ? '#0F58F9' : undefined;
                                  })()}
                                />
                              </CustomTooltip>
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === (lesson.id || `${index}-${lessonIndex}`) ? null : (lesson.id || `${index}-${lessonIndex}`))}
                                className="flex items-center gap-1 rounded px-[10px] py-[6px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                                style={{ backgroundColor: '#0F58F9', color: 'white', fontSize: '12px', fontWeight: 600, lineHeight: '120%', letterSpacing: '0.05em' }}
                                title="Create content"
                              >
                                Create
                                <ChevronDown size={12} className="ml-1" />
                              </button>
                              
                              {openDropdown === (lesson.id || `${index}-${lessonIndex}`) && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                                  <div className="p-2">
                                    <button
                                      onClick={() => handleContentTypeClick(lesson, 'presentation')}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-sm hover:rounded-md transition-all duration-200"
                                    >
                                      Presentation
                                    </button>
                                    <button
                                      onClick={() => handleContentTypeClick(lesson, 'one-pager')}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-sm hover:rounded-md transition-all duration-200"
                                    >
                                      One-Pager
                                    </button>
                                    <button
                                      onClick={() => handleContentTypeClick(lesson, 'quiz')}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-sm hover:rounded-md transition-all duration-200"
                                    >
                                      Quiz
                                    </button>
                                    <button
                                      disabled
                                      className="w-full px-4 py-2 text-left text-sm text-gray-400 cursor-not-allowed flex items-center gap-2 rounded-sm hover:rounded-md transition-all duration-200"
                                    >
                                      Video Lesson
                                    </button>
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
            {/* Add New Module Button */}
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
            </div>
          </div>

          {/* Right Panel - Course Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-[25px]">
              <h3 className="text-[#191D30] text-[18px] leading-[100%] font-normal mb-4">Course Summary</h3>
              <div className="text-gray-500">
                Right panel for course summary will go here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


