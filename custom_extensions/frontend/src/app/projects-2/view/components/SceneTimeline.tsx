import React from 'react';
// NEW: Import types and template registry
import { ComponentBasedSlide, ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes';

interface Scene {
  id: string;
  name: string | {};
  order: number;
}

interface SceneTimelineProps {
  scenes: Scene[];
  aspectRatio?: string;
  onAddScene: () => void;
  onMenuClick: (sceneId: string, event: React.MouseEvent) => void;
  // NEW: Video Lesson specific props
  videoLessonData?: VideoLessonData;
  componentBasedSlideDeck?: ComponentBasedSlideDeck;
  onSlideSelect?: (slideId: string) => void;
  currentSlideId?: string;
  onAddSlide?: (newSlide: ComponentBasedSlide) => void;
  onOpenTemplateSelector?: () => void;
}

export default function SceneTimeline({ 
  scenes, 
  aspectRatio = '16:9', 
  onAddScene, 
  onMenuClick,
  videoLessonData,
  componentBasedSlideDeck,
  onSlideSelect,
  currentSlideId,
  onAddSlide,
  onOpenTemplateSelector
}: SceneTimelineProps) {
  // Function to get scene rectangle dimensions based on aspect ratio
  const getSceneRectangleStyles = () => {
    const baseHeight = 80; // Increased for bigger cards
    
    switch (aspectRatio) {
      case '16:9':
        return {
          width: `${Math.round(baseHeight * 16 / 9)}px`,
          height: `${baseHeight}px`,
        };
      case '9:16':
        return {
          width: `${Math.round(baseHeight * 9 / 16)}px`,
          height: `${baseHeight}px`,
        };
      case '1:1':
        return {
          width: `${baseHeight}px`,
          height: `${baseHeight}px`,
        };
      default:
        return {
          width: `${Math.round(baseHeight * 16 / 9)}px`,
          height: `${baseHeight}px`,
        };
    }
  };

  // Convert Video Lesson slides to scenes if provided
  const displayScenes = (() => {
    if (componentBasedSlideDeck) {
      // Handle component-based slide deck
      return componentBasedSlideDeck.slides.map((slide, index) => ({
        id: slide.slideId,
        name: slide.props?.title || '',
        order: slide.slideNumber,
        slideData: slide
      }));
    } else if (videoLessonData) {
      // Handle old video lesson data
      return videoLessonData.slides.map((slide, index) => ({
        id: slide.slideId,
        name: slide.slideTitle || '',
        order: slide.slideNumber,
        slideData: slide
      }));
    }
    return []; // Commented out regular scenes for now
  })();

  return (
    <div className="bg-white rounded-md overflow-visible p-4" style={{ height: 'auto', minHeight: '120px' }}>
      <div className="flex items-end gap-4 pb-2">
          {/* Play Button with Time - Fixed */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative flex items-center justify-center h-16">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-colors cursor-pointer" style={{ border: '1px solid #878787' }}>
                <div className="w-0 h-0 border-l-[8px] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" style={{ borderLeftColor: '#878787' }}></div>
              </button>
            </div>
            <div className="h-8 flex items-center justify-center">
              <span className="text-xs" style={{ color: '#A5A5A5' }}>00:00 / 01:17</span>
            </div>
          </div>

          {/* Scrollable Slides Container */}
          <div className="flex items-end gap-1 overflow-x-auto flex-1">
          {/* Dynamic Scene Rectangles */}
          {displayScenes.map((scene, index) => (
            <React.Fragment key={scene.id}>
              <div className="flex flex-col items-center gap-2 flex-shrink-0 relative">
                <div className="relative group">
                  <div 
                    className={`bg-gray-100 border rounded-md flex items-center justify-center relative cursor-pointer transition-all ${
                      currentSlideId === scene.id 
                        ? 'bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      ...getSceneRectangleStyles(),
                      ...(currentSlideId === scene.id && { borderColor: '#0F58F9' })
                    }}
                    onClick={() => onSlideSelect?.(scene.id)}
                  >
                    {/* Simple visual indicator instead of text content */}
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{scene.order}</span>
                    </div>
                    
                    {/* Three-dot menu button - visible on hover */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMenuClick(scene.id, e);
                        }}
                      >
                        <svg 
                          className="w-3 h-3 text-gray-600" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <circle cx="6" cy="12" r="2"/>
                          <circle cx="12" cy="12" r="2"/>
                          <circle cx="18" cy="12" r="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transition button - show between scenes (not after the last one) - Overlapping on slides */}
              {index < displayScenes.length - 1 && (
                <div className="absolute top-0 right-0 transform translate-x-1/2 flex items-center h-16 z-10">
                  <div className="relative group">
                    <button className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer shadow-md">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.49836 4.13605C8.62336 4.26113 8.6234 4.46393 8.49836 4.58898L4.58877 8.49857C4.46371 8.62354 4.2609 8.62354 4.13584 8.49857L0.226252 4.58898C0.101204 4.46393 0.101253 4.26113 0.226252 4.13605L4.13584 0.226463C4.26091 0.101391 4.4637 0.101391 4.58877 0.226463L8.49836 4.13605ZM0.905642 4.36252L4.3623 7.81918L7.81897 4.36252L4.3623 0.905853L0.905642 4.36252Z" fill="#848485"/>
                        <path d="M6.21777 0.453125L10.061 4.29634L6.21777 8.13955" stroke="#848485" strokeWidth="0.640535" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.13867 0.453125L11.9819 4.29634L8.13867 8.13955" stroke="#848485" strokeWidth="0.640535" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Add transition
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          </div>

          {/* Add Slide Button - Opens Templates Panel - Fixed */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="h-16 flex items-center justify-center">
                <button
                  onClick={onOpenTemplateSelector}
                  className="w-12 h-16 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                  style={{ backgroundColor: '#CCDBFC' }}
                  title="Add new slide"
                >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="#0F58F9" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Chevron Up Button - Non-functional for now - Fixed */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="h-16 flex items-center justify-center">
                <button
                  onClick={() => {}}
                  className="w-10 h-16 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                  style={{ backgroundColor: '#CCDBFC' }}
                  title="Chevron up"
                >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="#0F58F9" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 15l7-7 7 7" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}
