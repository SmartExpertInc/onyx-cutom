'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

// Component name constants
const COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay";
const COMPONENT_NAME_VIDEO_LESSON_PRESENTATION = "VideoLessonPresentation";

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
        
        // Fetch project instance data
        const response = await fetch(`${CUSTOM_BACKEND_URL}/project-instances/${projectId}`, {
          credentials: 'same-origin'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const data = await response.json();
        setProjectInstanceData(data);
        
        // Set editable data based on component type
        if (data.details) {
          setEditableData(JSON.parse(JSON.stringify(data.details)));
        }
        
      } catch (err: any) {
        console.error('Error fetching project data:', err);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PDF preview...</p>
        </div>
      </div>
    );
  }

  if (error || !projectInstanceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">Failed to load PDF preview</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Render different components based on type
  const renderComponent = () => {
    switch (projectInstanceData.component_name) {
      case COMPONENT_NAME_SLIDE_DECK:
      case COMPONENT_NAME_VIDEO_LESSON_PRESENTATION:
        return <SlideDeckPreview data={editableData} />;
      
      case 'training_plan':
        return <TrainingPlanPreview data={editableData} />;
      
      case 'pdf_lesson':
        return <PdfLessonPreview data={editableData} />;
      
      case 'text_presentation':
        return <TextPresentationPreview data={editableData} />;
      
      case 'video_lesson':
        return <VideoLessonPreview data={editableData} />;
      
      case 'quiz':
        return <QuizPreview data={editableData} />;
      
      default:
        return (
          <div className="p-8 text-center">
            <p className="text-gray-600">Preview not available for this component type</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {projectInstanceData.name}
            </h1>
            <p className="text-sm text-gray-500">
              PDF Preview - {projectInstanceData.component_name.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Print Preview
            </button>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
        
        {renderComponent()}
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

// Add print styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
} 