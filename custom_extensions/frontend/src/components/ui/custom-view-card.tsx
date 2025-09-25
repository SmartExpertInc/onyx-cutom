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
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Title */}
      <h2 className="text-xl font-medium text-gray-800 mb-4">
        {title}
      </h2>

      {/* Metrics Section */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-md text-gray-500">Total Modules</span>
          <span className="text-md font-medium text-gray-800">{totalModules}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-md text-gray-500">Total Lessons</span>
          <span className="text-md font-medium text-gray-800">{totalLessons}</span>
        </div>
        
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Sources Section */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-4">Sources</h3>
        <div className="grid grid-cols-4 gap-3">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" title={source.name}>
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
    name: "Course",
    icon: <svg className="text-green-500" width={16} height={16} viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#05a844" stroke="#05a844"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>globe</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="Icon-Set" transform="translate(-204.000000, -671.000000)" fill="#088c3b"> <path d="M231.596,694.829 C229.681,694.192 227.622,693.716 225.455,693.408 C225.75,691.675 225.907,689.859 225.957,688 L233.962,688 C233.783,690.521 232.936,692.854 231.596,694.829 L231.596,694.829 Z M223.434,700.559 C224.1,698.95 224.645,697.211 225.064,695.379 C226.862,695.645 228.586,696.038 230.219,696.554 C228.415,698.477 226.073,699.892 223.434,700.559 L223.434,700.559 Z M220.971,700.951 C220.649,700.974 220.328,701 220,701 C219.672,701 219.352,700.974 219.029,700.951 C218.178,699.179 217.489,697.207 216.979,695.114 C217.973,695.027 218.98,694.976 220,694.976 C221.02,694.976 222.027,695.027 223.022,695.114 C222.511,697.207 221.822,699.179 220.971,700.951 L220.971,700.951 Z M209.781,696.554 C211.414,696.038 213.138,695.645 214.936,695.379 C215.355,697.211 215.9,698.95 216.566,700.559 C213.927,699.892 211.586,698.477 209.781,696.554 L209.781,696.554 Z M208.404,694.829 C207.064,692.854 206.217,690.521 206.038,688 L214.043,688 C214.093,689.859 214.25,691.675 214.545,693.408 C212.378,693.716 210.319,694.192 208.404,694.829 L208.404,694.829 Z M208.404,679.171 C210.319,679.808 212.378,680.285 214.545,680.592 C214.25,682.325 214.093,684.141 214.043,686 L206.038,686 C206.217,683.479 207.064,681.146 208.404,679.171 L208.404,679.171 Z M216.566,673.441 C215.9,675.05 215.355,676.789 214.936,678.621 C213.138,678.356 211.414,677.962 209.781,677.446 C211.586,675.523 213.927,674.108 216.566,673.441 L216.566,673.441 Z M219.029,673.049 C219.352,673.027 219.672,673 220,673 C220.328,673 220.649,673.027 220.971,673.049 C221.822,674.821 222.511,676.794 223.022,678.886 C222.027,678.973 221.02,679.024 220,679.024 C218.98,679.024 217.973,678.973 216.979,678.886 C217.489,676.794 218.178,674.821 219.029,673.049 L219.029,673.049 Z M223.954,688 C223.9,689.761 223.74,691.493 223.439,693.156 C222.313,693.058 221.168,693 220,693 C218.832,693 217.687,693.058 216.562,693.156 C216.26,691.493 216.1,689.761 216.047,688 L223.954,688 L223.954,688 Z M216.047,686 C216.1,684.239 216.26,682.507 216.562,680.844 C217.687,680.942 218.832,681 220,681 C221.168,681 222.313,680.942 223.438,680.844 C223.74,682.507 223.9,684.239 223.954,686 L216.047,686 L216.047,686 Z M230.219,677.446 C228.586,677.962 226.862,678.356 225.064,678.621 C224.645,676.789 224.1,675.05 223.434,673.441 C226.073,674.108 228.415,675.523 230.219,677.446 L230.219,677.446 Z M231.596,679.171 C232.936,681.146 233.783,683.479 233.962,686 L225.957,686 C225.907,684.141 225.75,682.325 225.455,680.592 C227.622,680.285 229.681,679.808 231.596,679.171 L231.596,679.171 Z M220,671 C211.164,671 204,678.163 204,687 C204,695.837 211.164,703 220,703 C228.836,703 236,695.837 236,687 C236,678.163 228.836,671 220,671 L220,671 Z" id="globe"> </path> </g> </g> </g></svg>
  }
];

export default CustomViewCard;
