"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TrainingPlanData, Lesson } from '@/types/trainingPlan';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { createPortal } from 'react-dom';
import { Check, Plus } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

// Small inline product icons (from view-new-2), using currentColor so parent can set gray
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

// Custom Tooltip Component matching the view-new-2 style
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

interface PublicCourseData {
  projectId: number;
  projectName: string;
  mainTitle: string;
  sections: any[];
  language: string;
  isPublicView: boolean;
  sharedAt: string;
  expiresAt: string;
}

export default function PublicCourseViewerPage() {
  const params = useParams();
  const { t } = useLanguage();
  const shareToken = params?.share_token as string;

  const [courseData, setCourseData] = useState<PublicCourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        console.log(`🔍 [PUBLIC COURSE VIEWER] Fetching course data for token: ${shareToken}`);
        
        if (!shareToken) {
          setError('Share token is required');
          setLoading(false);
          return;
        }
        
        const apiUrl = `${CUSTOM_BACKEND_URL}/public/course-outlines/${shareToken}`;
        
        console.log(`📡 [PUBLIC COURSE VIEWER] Making API request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        console.log(`📡 [PUBLIC COURSE VIEWER] API response status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Shared course outline not found or link is invalid');
          } else if (response.status === 410) {
            throw new Error('This shared course outline link has expired');
          } else {
            throw new Error(`Failed to load shared course outline: ${response.status}`);
          }
        }
        
        const data = await response.json();
        console.log(`📥 [PUBLIC COURSE VIEWER] Data received:`, data);
        
        setCourseData(data);
        console.log(`✅ [PUBLIC COURSE VIEWER] Course data loaded successfully`);
        
      } catch (err) {
        console.error(`❌ [PUBLIC COURSE VIEWER] Error loading course:`, err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchCourseData();
    } else {
      setError('Share token not found');
      setLoading(false);
    }
  }, [shareToken]);

  const handleProductClick = (productId: number) => {
    if (!productId || !shareToken) return;
    
    // Navigate to the public product view page with share token
    window.location.href = `/public/product/${productId}?share_token=${shareToken}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course outline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-lg font-semibold mb-2">Unable to Load Course</h2>
            <p>{error}</p>
          </div>
          <p className="text-gray-600 text-sm">
            Please check the link or contact the person who shared it with you.
          </p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No course data available</p>
        </div>
      </div>
    );
  }

  // Convert the public course data to TrainingPlanData format
  const trainingPlanData: TrainingPlanData = {
    mainTitle: courseData.mainTitle,
    sections: courseData.sections,
    detectedLanguage: courseData.language,
    theme: 'cherry', // Default theme for public view
    isPublicView: true
  };

  return (
    <main 
      className="p-4 md:p-8 font-inter min-h-screen"
      style={{
        background: `linear-gradient(110.08deg, rgba(0, 187, 255, 0.2) 19.59%, rgba(0, 187, 255, 0.05) 80.4%), #FFFFFF`
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col">

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-[200px]">
          {/* Main Content Area - Course Outline and Modules */}
          <div className="lg:col-span-3 space-y-4">
            {/* Course Outline Title */}
            <div className="bg-white rounded-lg p-[25px]">
              <h1 className="text-[#191D30] font-semibold text-[32px] leading-none">
                {courseData.mainTitle}
              </h1>
            </div>

            {/* Render actual modules from the course outline data */}
            {courseData.sections && courseData.sections.length > 0 ? (
              courseData.sections.map((section, index) => (
                <div key={section.id || index} className="bg-white rounded-lg p-[25px]">
                  <h2 className="text-[#191D30] font-semibold text-[20px] leading-[100%] mb-2">
                    Module {index + 1}: {section.title}
                  </h2>
                  <p className="text-[#9A9DA2] font-normal text-[14px] leading-[100%] mb-[25px]">
                    {section.lessons?.length || 0} lessons
                  </p>
                  <hr className="border-gray-200 mb-4 -mx-[25px]" />
                  
                  {/* Product Types Header */}
                  <div className="grid mb-4 gap-4 items-center px-2" style={{ gridTemplateColumns: `1fr 80px 80px 80px 80px` }}>
                    <div className="text-sm font-medium text-gray-700">
                      {/* Lesson Title */}
                    </div>
                    <div className="flex flex-col items-center text-[10px] font-medium text-blue-600 justify-center gap-1 bg-blue-50 rounded-lg p-2 h-12">
                      <LessonPresentationIcon size={18} color="#2563eb" />
                      <span>Presentation</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px] font-medium text-blue-600 justify-center gap-1 bg-blue-50 rounded-lg p-2 h-12">
                      <TextPresentationIcon size={18} color="#2563eb" />
                      <span>One-Pager</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px] font-medium text-blue-600 justify-center gap-1 bg-blue-50 rounded-lg p-2 h-12">
                      <QuizIcon size={18} color="#2563eb" />
                      <span>Quiz</span>
                    </div>
                    <div className="flex flex-col items-center text-[10px] font-medium text-blue-600 justify-center gap-1 bg-blue-50 rounded-lg p-2 h-12">
                      <VideoScriptIcon size={18} color="#2563eb" />
                      <span>Video Lesson</span>
                    </div>
                  </div>

                  {section.lessons && section.lessons.length > 0 && (
                    <div>
                      {section.lessons.map((lesson: Lesson, lessonIndex: number) => {
                        const hasPresentation = lesson.attached_products?.some((p: any) => p.type === 'Slide Deck' || p.component_name === 'SlideDeckDisplay');
                        const hasOnePager = lesson.attached_products?.some((p: any) => p.type === 'One Pager' || p.component_name === 'OnePagerDisplay');
                        const hasQuiz = lesson.attached_products?.some((p: any) => p.type === 'Quiz' || p.component_name === 'QuizDisplay');
                        const hasVideoLesson = lesson.attached_products?.some((p: any) => p.type === 'Video Lesson' || p.component_name === 'VideoLessonDisplay');

                        return (
                          <div key={lesson?.id || lessonIndex} className="grid py-3 gap-4 items-center px-2" style={{ gridTemplateColumns: `1fr 80px 80px 80px 80px` }}>
                            {/* Lesson Title Column */}
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#0F58F9] rounded-full"></div>
                              <span className="text-[#191D30] text-[16px] leading-[100%] font-normal">
                                {lesson.title.replace(/^\d+\.\d*\.?\s*/, '')}
                              </span>
                            </div>
                            
                            {/* Presentation Status Column */}
                            <div className="flex items-center justify-center">
                              {hasPresentation ? (
                                <CustomTooltip content="View" position="top">
                                  <div 
                                    className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-all duration-200"
                                    onClick={() => {
                                      const product = lesson.attached_products?.find((p: any) => p.type === 'Slide Deck' || p.component_name === 'SlideDeckDisplay');
                                      if (product && product.id) {
                                        handleProductClick(product.id);
                                      }
                                    }}
                                  >
                                    <Check size={10} strokeWidth={3.5} className="text-white" />
                                  </div>
                                </CustomTooltip>
                              ) : (
                                <div className="w-[18px] h-[18px] rounded-full bg-gray-300 flex items-center justify-center">
                                  <Plus size={10} strokeWidth={3.5} className="text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* One-Pager Status Column */}
                            <div className="flex items-center justify-center">
                              {hasOnePager ? (
                                <CustomTooltip content="View" position="top">
                                  <div 
                                    className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-all duration-200"
                                    onClick={() => {
                                      const product = lesson.attached_products?.find((p: any) => p.type === 'One Pager' || p.component_name === 'OnePagerDisplay');
                                      if (product && product.id) {
                                        handleProductClick(product.id);
                                      }
                                    }}
                                  >
                                    <Check size={10} strokeWidth={3.5} className="text-white" />
                                  </div>
                                </CustomTooltip>
                              ) : (
                                <div className="w-[18px] h-[18px] rounded-full bg-gray-300 flex items-center justify-center">
                                  <Plus size={10} strokeWidth={3.5} className="text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* Quiz Status Column */}
                            <div className="flex items-center justify-center">
                              {hasQuiz ? (
                                <CustomTooltip content="View" position="top">
                                  <div 
                                    className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-all duration-200"
                                    onClick={() => {
                                      const product = lesson.attached_products?.find((p: any) => p.type === 'Quiz' || p.component_name === 'QuizDisplay');
                                      if (product && product.id) {
                                        handleProductClick(product.id);
                                      }
                                    }}
                                  >
                                    <Check size={10} strokeWidth={3.5} className="text-white" />
                                  </div>
                                </CustomTooltip>
                              ) : (
                                <div className="w-[18px] h-[18px] rounded-full bg-gray-300 flex items-center justify-center">
                                  <Plus size={10} strokeWidth={3.5} className="text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* Video Lesson Status Column */}
                            <div className="flex items-center justify-center">
                              {hasVideoLesson ? (
                                <CustomTooltip content="View" position="top">
                                  <div 
                                    className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-all duration-200"
                                    onClick={() => {
                                      const product = lesson.attached_products?.find((p: any) => p.type === 'Video Lesson' || p.component_name === 'VideoLessonDisplay');
                                      if (product && product.id) {
                                        handleProductClick(product.id);
                                      }
                                    }}
                                  >
                                    <Check size={10} strokeWidth={3.5} className="text-white" />
                                  </div>
                                </CustomTooltip>
                              ) : (
                                <div className="w-[18px] h-[18px] rounded-full bg-gray-300 flex items-center justify-center">
                                  <Plus size={10} strokeWidth={3.5} className="text-gray-500" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-[25px]">
                <p className="text-[#9A9DA2]">No modules found in this course outline.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
