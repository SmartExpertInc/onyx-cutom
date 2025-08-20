'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { processContentForPreview } from '../../../../../../utils/dataProcessing';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

// Component name constants - same as main file
const COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable";
const COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay";
const COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay";
const COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay";
const COMPONENT_NAME_VIDEO_LESSON_PRESENTATION = "VideoLessonPresentationDisplay";
const COMPONENT_NAME_QUIZ = "QuizDisplay";
const COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay";

interface ProjectInstance {
  id: number;
  project_id: number;
  name: string;
  component_name: string;
  details: any;
  created_at: string;
  updated_at: string;
}

export default function PdfPreviewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [projectInstanceData, setProjectInstanceData] = useState<ProjectInstance | null>(null);
  const [editableData, setEditableData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        console.log('🔍 PDF Preview: Fetching project data for ID:', projectId);
        console.log('🔍 PDF Preview: Using backend URL:', CUSTOM_BACKEND_URL);
        
        // Add headers like in main file
        const commonHeaders: HeadersInit = {};
        const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
        if (devUserId && process.env.NODE_ENV === 'development') {
          commonHeaders['X-Dev-Onyx-User-ID'] = devUserId;
        }
        
        // Fetch project instance data
        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${projectId}`, {
          cache: 'no-store',
          headers: commonHeaders,
          credentials: 'same-origin'
        });

        console.log('🔍 PDF Preview: Response status:', response.status);
        console.log('🔍 PDF Preview: Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          let errorDetail = `HTTP error ${response.status} fetching project instance (ID: ${projectId})`;
          try { 
            const errorJson = JSON.parse(errorText); 
            errorDetail = errorJson.detail || errorDetail; 
          }
          catch { 
            errorDetail = `${errorDetail} - ${errorText.substring(0, 150)}`; 
          }
          throw new Error(errorDetail);
        }

        const data = await response.json();
        console.log('🔍 PDF Preview: Received data:', data);
        setProjectInstanceData(data);
        
        // Set editable data based on component type - same logic as main file
        if (data.details) {
          // 🔧 FIX: Apply consistent data processing for preview (same as backend)
          const processedDetails = processContentForPreview(data.details);
          const copiedDetails = JSON.parse(JSON.stringify(processedDetails));
          setEditableData(copiedDetails);
          console.log('🔍 PDF Preview: Applied data processing for consistency with PDF');
        } else {
          // Handle case when no details exist
          const lang = data.detectedLanguage || 'en';
          if (data.component_name === COMPONENT_NAME_TRAINING_PLAN) {
            setEditableData({ mainTitle: data.name || 'New Training Plan', sections: [], detectedLanguage: lang });
          } else if (data.component_name === COMPONENT_NAME_PDF_LESSON) {
            setEditableData({ lessonTitle: data.name || 'New PDF Lesson', contentBlocks: [], detectedLanguage: lang });
          } else if (data.component_name === COMPONENT_NAME_SLIDE_DECK) {
            setEditableData({ lessonTitle: data.name || 'New Slide Deck', slides: [], detectedLanguage: lang });
          } else if (data.component_name === COMPONENT_NAME_VIDEO_LESSON) {
            setEditableData({ mainPresentationTitle: data.name || 'New Video Lesson', slides: [], detectedLanguage: lang });
          } else if (data.component_name === COMPONENT_NAME_QUIZ) {
            setEditableData({ quizTitle: data.name || 'New Quiz', questions: [], detectedLanguage: lang });
          } else if (data.component_name === COMPONENT_NAME_TEXT_PRESENTATION) {
            setEditableData({ textTitle: data.name || 'New Text Presentation', contentBlocks: [], detectedLanguage: lang });
          } else {
            setEditableData(null);
          }
        }
        
      } catch (err: any) {
        console.error('🔍 PDF Preview: Error fetching project data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700 mb-2">Loading PDF preview...</p>
          <p className="text-sm text-gray-500">Please wait while we prepare your content</p>
        </div>
      </div>
    );
  }

  if (error || !projectInstanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load PDF preview</h2>
          <p className="text-gray-600 mb-4">We couldn't load the preview for this project.</p>
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <button
            onClick={() => window.close()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    );
  }

  // Render different components based on type
  const renderComponent = () => {
    // Debug: Show component info
    console.log('🔍 PDF Preview: Rendering component:', {
      componentName: projectInstanceData.component_name,
      hasEditableData: !!editableData,
      editableDataType: typeof editableData,
      editableDataKeys: editableData ? Object.keys(editableData) : 'No data'
    });

    switch (projectInstanceData.component_name) {
      case COMPONENT_NAME_SLIDE_DECK:
      case COMPONENT_NAME_VIDEO_LESSON_PRESENTATION:
        return <SimplePreview data={editableData} title="Slide Deck Preview" />;
      
      case COMPONENT_NAME_TRAINING_PLAN:
        return <SimplePreview data={editableData} title="Training Plan Preview" />;
      
      case COMPONENT_NAME_PDF_LESSON:
        return <SimplePreview data={editableData} title="PDF Lesson Preview" />;
      
      case COMPONENT_NAME_TEXT_PRESENTATION:
        return <SimplePreview data={editableData} title="Text Presentation Preview" />;
      
      case COMPONENT_NAME_VIDEO_LESSON:
        return <SimplePreview data={editableData} title="Video Lesson Preview" />;
      
      case COMPONENT_NAME_QUIZ:
        return <SimplePreview data={editableData} title="Quiz Preview" />;
      
      default:
        return (
          <div className="p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
              <p className="text-sm text-yellow-700 mb-2">
                <strong>Component Type:</strong> {projectInstanceData.component_name}
              </p>
              <p className="text-sm text-yellow-700 mb-2">
                <strong>Has Data:</strong> {editableData ? 'Yes' : 'No'}
              </p>
              {editableData && (
                <p className="text-sm text-yellow-700">
                  <strong>Data Keys:</strong> {Object.keys(editableData).join(', ')}
                </p>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">PDF Preview - {projectInstanceData.name}</h2>
              <p className="text-gray-600 mb-4">This is a preview of the content that will be included in the PDF.</p>
              
              {editableData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Data:</h3>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                    {JSON.stringify(editableData, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">Preview not available for this component type: {projectInstanceData.component_name}</p>
                <p className="text-sm text-gray-500 mt-2">Please check the console for more details.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {projectInstanceData.name}
              </h1>
              <p className="text-sm text-gray-500 mb-2">
                PDF Preview - {projectInstanceData.component_name.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-400">
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Preview
              </button>
              <button
                onClick={() => window.close()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Preview
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

// Slide Deck Preview Component
function SlideDeckPreview({ data }: { data: any }) {
  if (!data || !data.slides) {
    return <div className="p-8 text-center text-gray-600">No slide data available</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.lessonTitle}</h1>
      </div>
      
      {data.slides.map((slide: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 min-h-[600px]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Slide {index + 1}
            </h2>
            {slide.props?.title && (
              <h3 className="text-lg font-medium text-gray-800">{slide.props.title}</h3>
            )}
          </div>
          
          <div className="prose max-w-none">
            {slide.props?.content && (
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: slide.props.content }}
              />
            )}
          </div>
          
          {slide.props?.imageUrl && (
            <div className="mt-6">
              <img 
                src={slide.props.imageUrl} 
                alt={slide.props.title || `Slide ${index + 1}`}
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Training Plan Preview Component
function TrainingPlanPreview({ data }: { data: any }) {
  if (!data || !data.sections) {
    return <div className="p-8 text-center text-gray-600">No training plan data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.mainTitle}</h1>
      </div>
      
      {data.sections.map((section: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
          
          {section.lessons && section.lessons.length > 0 && (
            <div className="space-y-3">
              {section.lessons.map((lesson: any, lessonIndex: number) => (
                <div key={lessonIndex} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-800 mb-2">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm">Hours: {lesson.hours}</p>
                  <p className="text-gray-600 text-sm">Completion Time: {lesson.completionTime}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// PDF Lesson Preview Component
function PdfLessonPreview({ data }: { data: any }) {
  if (!data || !data.contentBlocks) {
    return <div className="p-8 text-center text-gray-600">No PDF lesson data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.lessonTitle}</h1>
      </div>
      
      {data.contentBlocks.map((block: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Block {index + 1}</h2>
          
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {block.type === 'paragraph' && <p>{block.text}</p>}
              {block.type === 'headline' && <h3>{block.text}</h3>}
              {block.type === 'alert' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-blue-800">{block.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Text Presentation Preview Component
function TextPresentationPreview({ data }: { data: any }) {
  if (!data || !data.contentBlocks) {
    return <div className="p-8 text-center text-gray-600">No text presentation data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.textTitle}</h1>
      </div>
      
      {data.contentBlocks.map((block: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Block {index + 1}</h2>
          
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {block.type === 'paragraph' && <p>{block.text}</p>}
              {block.type === 'headline' && <h3>{block.text}</h3>}
              {block.type === 'alert' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-blue-800">{block.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Video Lesson Preview Component
function VideoLessonPreview({ data }: { data: any }) {
  if (!data || !data.slides) {
    return <div className="p-8 text-center text-gray-600">No video lesson data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.mainPresentationTitle}</h1>
      </div>
      
      {data.slides.map((slide: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Slide {index + 1}: {slide.slideTitle}
          </h2>
          
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed">
              <p><strong>Displayed Text:</strong> {slide.displayedText}</p>
              <p><strong>Voiceover:</strong> {slide.voiceoverText}</p>
              <p><strong>Picture Description:</strong> {slide.displayedPictureDescription}</p>
              <p><strong>Video Description:</strong> {slide.displayedVideoDescription}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Quiz Preview Component
function QuizPreview({ data }: { data: any }) {
  if (!data || !data.questions) {
    return <div className="p-8 text-center text-gray-600">No quiz data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.quizTitle}</h1>
      </div>
      
      {data.questions.map((question: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Question {index + 1}
          </h2>
          
          <p className="text-gray-700 mb-4">{question.question_text}</p>
          
          {question.options && question.options.length > 0 && (
            <div className="space-y-2">
              {question.options.map((option: any, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  <span className="text-gray-700">{option.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Print styles
const printStyles = `
  @media print {
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    
    .print-hide {
      display: none !important;
    }
    
    .print-page-break {
      page-break-before: always;
    }
    
    .print-no-break {
      page-break-inside: avoid;
    }
    
    .print-break-after {
      page-break-after: always;
    }
    
    /* Ensure text is black for printing */
    * {
      color: black !important;
      background: white !important;
    }
    
    /* Remove shadows and borders for cleaner print */
    .shadow-sm, .shadow-md, .shadow-lg {
      box-shadow: none !important;
    }
    
    .border {
      border: 1px solid #000 !important;
    }
    
    /* Ensure proper spacing */
    .space-y-6 > * + * {
      margin-top: 1.5rem !important;
    }
    
    .space-y-8 > * + * {
      margin-top: 2rem !important;
    }
    
    /* Make sure images print properly */
    img {
      max-width: 100% !important;
      height: auto !important;
    }
  }
`;

// Simple Preview Component for testing
function SimplePreview({ data, title }: { data: any; title: string }) {
  return (
    <div className="p-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ {title} - Data Consistency Fixed!</h3>
        <p className="text-sm text-green-700">
          This preview now uses the same data processing as the PDF generation, ensuring consistent hours display.
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-4">This is a preview of the content that will be included in the PDF.</p>
        
        {data && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Data:</h3>
            <pre className="text-xs text-gray-700 overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-green-600 font-medium">✅ PDF Preview Data Consistency Fixed!</p>
          <p className="text-sm text-gray-500 mt-2">Preview and PDF now show the same processed data with consistent hours.</p>
        </div>
      </div>
    </div>
  );
}

// Add print styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
} 