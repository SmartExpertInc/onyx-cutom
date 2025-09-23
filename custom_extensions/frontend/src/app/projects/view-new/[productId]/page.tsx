// custom_extensions/frontend/src/app/projects/view-new/[productId]/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, FolderOpen, Sparkles } from 'lucide-react';
import { ProjectInstanceDetail, TrainingPlanData, Lesson } from '@/types/projectSpecificTypes';
import CustomViewCard, { defaultSources } from '@/components/ui/custom-view-card';

// Small inline product icons (from generate page), using currentColor so parent can set gray
const LessonPresentationIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 7C3 5.11438 3 4.17157 3.58579 3.58579C4.17157 3 5.11438 3 7 3H12H17C18.8856 3 19.8284 3 20.4142 3.58579C21 4.17157 21 5.11438 21 7V10V13C21 14.8856 21 15.8284 20.4142 16.4142C19.8284 17 18.8856 17 17 17H12H7C5.11438 17 4.17157 17 3.58579 16.4142C3 15.8284 3 14.8856 3 13V10V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path> <path d="M9 21L11.625 17.5V17.5C11.8125 17.25 12.1875 17.25 12.375 17.5V17.5L15 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 7L12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M16 8L16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 9L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
);

const QuizIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path d="M10.125 8.875C10.125 7.83947 10.9645 7 12 7C13.0355 7 13.875 7.83947 13.875 8.875C13.875 9.56245 13.505 10.1635 12.9534 10.4899C12.478 10.7711 12 11.1977 12 11.75V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><circle cx="12" cy="16" r="1" fill="currentColor"></circle></g></svg>
);

const VideoScriptIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
);

const TextPresentationIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 14V7C20 5.34315 18.6569 4 17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H13.5M20 14L13.5 20M20 14H15.5C14.3954 14 13.5 14.8954 13.5 16V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
);

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
  const [userCredits, setUserCredits] = useState<number | null>(null);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

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
  const trainingPlanData = projectData?.details as TrainingPlanData;
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
              } else if (lesson.source.includes('text') || lesson.source.includes('Text')) {
                sources.add('Create from scratch');
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
        'scratch': <svg className="text-blue-500" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
        'Create from scratch': <svg className="text-blue-500" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
      };
      
      return connectorMap[connectorName] || 
      <svg className="text-gray-800" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>;
    };
    
    return Array.from(sources).map(source => ({
      type: source === 'PDF Document' || source === 'Create from scratch' ? 'file' : 'connector',
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
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [productId]);

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
      className="p-4 md:p-8 min-h-screen font-inter"
      style={{
        background: `linear-gradient(110.08deg, rgba(0, 187, 255, 0.2) 19.59%, rgba(0, 187, 255, 0.05) 80.4%), #FFFFFF`
      }}
    >
      <div className="max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-[120px]">
          {/* Main Content Area - Course Outline and Modules */}
          <div className="lg:col-span-2 space-y-4">
            {/* Course Outline Title */}
            <div className="bg-white rounded-lg p-[25px]">
              <h1 className="text-[#191D30] font-semibold text-[30px] leading-[100%]">
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
                  <p className="text-[#9A9DA2] font-normal text-[14px] leading-[100%] mb-4">
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
                              <LessonPresentationIcon />
                              <TextPresentationIcon />
                              <QuizIcon />
                              <VideoScriptIcon />
                            </div>
                            <button
                              className="flex items-center gap-1 rounded px-[10px] py-[6px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
                              style={{ backgroundColor: '#0F58F9', color: 'white', fontSize: '12px', fontWeight: 600, lineHeight: '120%', letterSpacing: '0.05em' }}
                              title="Add content"
                            >
                              + Content
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>

          {/* Right Panel - Course Summary */}
          <div className="lg:col-span-1">
            <CustomViewCard
              projectId={productId}
              sources={getSourcesFromProject()}
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
    </main>
  );
}


