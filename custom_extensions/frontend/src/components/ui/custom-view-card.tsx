import React, { useEffect, useState } from 'react';

interface CourseMetrics {
  totalModules: number;
  totalLessons: number;
  completed: number;
  estimatedDuration: string;
  estimatedCompletionTime: string;
  creditsUsed: number;
  creditsTotal: number;
  progress: number;
}

interface ContentType {
  type: string;
  count: number;
  icon: React.ReactNode;
}

interface Source {
  type: string;
  name: string;
  icon: React.ReactNode;
}

interface CustomViewCardProps {
  title?: string;
  metrics: CourseMetrics;
  contentTypes?: ContentType[];
  sources?: Source[];
  className?: string;
  projectId?: string | number;
}

const LessonPresentationIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg className='text-purple-600' width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 7C3 5.11438 3 4.17157 3.58579 3.58579C4.17157 3 5.11438 3 7 3H12H17C18.8856 3 19.8284 3 20.4142 3.58579C21 4.17157 21 5.11438 21 7V10V13C21 14.8856 21 15.8284 20.4142 16.4142C19.8284 17 18.8856 17 17 17H12H7C5.11438 17 4.17157 17 3.58579 16.4142C3 15.8284 3 14.8856 3 13V10V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path> <path d="M9 21L11.625 17.5V17.5C11.8125 17.25 12.1875 17.25 12.375 17.5V17.5L15 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 7L12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M16 8L16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 9L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
  );
  
  const QuizIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg className='text-orange-600' width={size} height={size} strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle><path d="M10.125 8.875C10.125 7.83947 10.9645 7 12 7C13.0355 7 13.875 7.83947 13.875 8.875C13.875 9.56245 13.505 10.1635 12.9534 10.4899C12.478 10.7711 12 11.1977 12 11.75V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><circle cx="12" cy="16" r="1" fill="currentColor"></circle></g></svg>
  );
  
  const VideoScriptIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg className='text-blue-600' width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
  );
  
  const TextPresentationIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg className='text-green-600' width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 14V7C20 5.34315 18.6569 4 17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H13.5M20 14L13.5 20M20 14H15.5C14.3954 14 13.5 14.8954 13.5 16V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
  );

const CustomViewCard: React.FC<CustomViewCardProps> = ({
  title = "Course Summary",
  metrics,
  contentTypes = defaultContentTypes,
  sources = defaultSources,
  className = "",
  projectId
}) => {
  const {
    totalModules,
    totalLessons,
    completed,
    estimatedDuration,
    creditsUsed,
    creditsTotal,
    progress
  } = metrics;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Title */}
      <h2 className="text-xl font-medium text-gray-800 mb-4">
        {title}
      </h2>

      {/* Metrics Section */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Modules</span>
          <span className="text-sm font-medium text-gray-800">{totalModules}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Lessons</span>
          <span className="text-sm font-medium text-gray-800">{totalLessons}</span>
        </div>
        
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Sources Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Sources</h3>
        <div className="grid grid-cols-4 gap-3">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" title={source.name}>
              {source.icon}
            </div>
          ))}
        </div>
      </div>

      
      {/* Divider */}
      <div className="border-t border-gray-200 mb-6"></div>


      {/* Content Types Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Content Types</h3>
        <div className="space-y-3">
          {contentTypes.map((contentType, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="text-gray-500">
                {contentType.icon}
              </div>
              <span className="text-sm text-gray-500">{contentType.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Default content types with icons
export const defaultContentTypes: ContentType[] = [
  {
    type: "Video Lessons",
    count: 0,
    icon: <VideoScriptIcon size={16} />
  },
  {
    type: "Presentations", 
    count: 0,
    icon: <LessonPresentationIcon size={16} />
  },
  {
    type: "One-pagers",
    count: 0,
    icon: <TextPresentationIcon size={16} />
  },
  {
    type: "Quizzes",
    count: 0,
    icon: <QuizIcon size={16} />
  }
];

// Default sources with connector icons
export const defaultSources: Source[] = [
  {
    type: "connector",
    name: "Google Drive",
    icon: <svg className="text-blue-500" width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 6.29L3.42 10.58C2.53 11.46 2.53 12.85 3.42 13.73L7.71 18.02C8.1 18.41 8.73 18.41 9.12 18.02C9.51 17.63 9.51 17 9.12 16.61L5.41 12.9C5.02 12.51 5.02 11.88 5.41 11.49L9.12 7.78C9.51 7.39 9.51 6.76 9.12 6.37C8.73 5.98 8.1 5.98 7.71 6.29Z"/></svg>
  },
  {
    type: "file",
    name: "PDF Document",
    icon: <svg className="text-red-500" width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>
  }
];

export default CustomViewCard;
