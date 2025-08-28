import React, { useState, useRef } from 'react';
// NEW: Import types and template registry
import { ComponentBasedSlide, ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes';
import { SlideAddButton } from '@/components/SlideAddButton';

interface Scene {
  id: string;
  name: string;
  order: number;
}

interface SceneTimelineProps {
  scenes: Scene[];
  aspectRatio: string;
  onAddScene: () => void;
  onMenuClick: (sceneId: string, event: React.MouseEvent) => void;
  onSceneRename?: (sceneId: string, newName: string) => void;
  // NEW: Video Lesson specific props
  videoLessonData?: VideoLessonData;
  componentBasedSlideDeck?: ComponentBasedSlideDeck;
  onSlideSelect?: (slideId: string) => void;
  currentSlideId?: string;
  onAddSlide?: (newSlide: ComponentBasedSlide) => void;
}

export default function SceneTimeline({ 
  scenes, 
  aspectRatio, 
  onAddScene, 
  onMenuClick,
  onSceneRename,
  videoLessonData,
  componentBasedSlideDeck,
  onSlideSelect,
  currentSlideId,
  onAddSlide
}: SceneTimelineProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Function to get scene rectangle dimensions based on aspect ratio
  const getSceneRectangleStyles = () => {
    const baseHeight = 64; // 16 * 4 (h-16)
    
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

  const handleRenameClick = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setEditingName(scene.name);
  };

  const handleRenameSave = () => {
    if (editingSceneId && editingName.trim() && onSceneRename) {
      onSceneRename(editingSceneId, editingName.trim());
    }
    setEditingSceneId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingSceneId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSave();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
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
    
  // Debug logging
  console.log('SceneTimeline - videoLessonData:', videoLessonData);
  console.log('SceneTimeline - componentBasedSlideDeck:', componentBasedSlideDeck);
  console.log('SceneTimeline - displayScenes:', displayScenes);
  console.log('SceneTimeline - currentSlideId:', currentSlideId);
  console.log('SceneTimeline - onAddSlide function:', !!onAddSlide);
  console.log('SceneTimeline - Scene names:', displayScenes.map(s => ({ id: s.id, name: s.name, order: s.order })));

  return (
    <div className="bg-white rounded-md overflow-visible p-4" style={{ height: 'calc(25% + 60px)' }}>
      <div className="flex items-end gap-10 overflow-x-auto">
          {/* Play Button with Time */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative flex items-center justify-center h-16">
              <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
              </button>
            </div>
            <div className="h-8 flex items-center justify-center">
              <span className="text-sm text-gray-600">00:00</span>
            </div>
          </div>

          {/* Dynamic Scene Rectangles */}
          {displayScenes.map((scene, index) => (
            <React.Fragment key={scene.id}>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="relative group">
                  <div 
                    className={`bg-gray-100 border rounded-md flex items-center justify-center relative cursor-pointer transition-all ${
                      currentSlideId === scene.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={getSceneRectangleStyles()}
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
                <div className="h-8 flex items-center gap-2 min-w-[120px] justify-center">
                  {editingSceneId === scene.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      onBlur={handleRenameSave}
                      className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none focus:outline-none focus:ring-0 min-w-[80px] text-center"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]" title={scene.name || 'Untitled'}>
                        {scene.name || 'Untitled'}
                      </span>
                      <svg 
                        className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        onClick={() => handleRenameClick(scene)}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                        />
                      </svg>
                    </>
                  )}
                </div>
              </div>

              {/* Transition button - show between scenes (not after the last one) */}
              {index < displayScenes.length - 1 && (
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="relative group flex items-center h-16">
                    <button className="w-16 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <svg 
                        className="w-4 h-4 text-gray-600" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h5v18zm7 0q-.425 0-.712-.288T11 20q0-.425.288-.712T12 19q.425 0 .713.288T13 20q0 .425-.288.713T12 21m0-4q-.425 0-.712-.288T11 16q0-.425.288-.712T12 15q.425 0 .713.288T13 16q0 .425-.288.713T12 17m0-4q-.425 0-.712-.288T11 12q0-.425.288-.712T12 11q.425 0 .713.288T13 12q0 .425-.288.713T12 13m0-4q-.425 0-.712-.288T11 8q0-.425.288-.712T12 7q.425 0 .713.288T13 8q0 .425-.288.713T12 9m0-4q-.425 0-.712-.288T11 4q0-.425.288-.712T12 3q.425 0 .713.288T13 4q0 .425-.288.713T12 5m2 14q-.425 0-.712-.288T13 18q0-.425.288-.712T14 17q.425 0 .713.288T15 18q0 .425-.288.713T14 19m0-4q-.425 0-.712-.288T13 14q0-.425.288-.712T14 13q.425 0 .713.288T15 14q0 .425-.288.713T14 15m0-4q-.425 0-.712-.288T13 10q0-.425.288-.712T14 9q.425 0 .713.288T15 10q0 .425-.288.713T14 11m0-4q-.425 0-.712-.288T13 6q0-.425.288-.712T14 5q.425 0 .713.288T15 6q0 .425-.288.713T14 7m2 14q-.425 0-.712-.288T15 20q0-.425.288-.712T16 19q.425 0 .713.288T17 20q0 .425-.288.713T16 21m0-4q-.425 0-.712-.288T15 16q0-.425.288-.712T16 15q.425 0 .713.288T17 16q0 .425-.288.713T16 17m0-4q-.425 0-.712-.288T15 12q0-.425.288-.712T16 11q.425 0 .713.288T17 12q0 .425-.288.713T16 13m0-4q-.425 0-.712-.288T15 8q0-.425.288-.712T16 7q.425 0 .713.288T17 8q0 .425-.288.713T16 9m0-4q-.425 0-.712-.288T15 4q0-.425.288-.712T16 3q.425 0 .713.288T17 4q0 .425-.288.713T16 5"/>
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
                  <div className="h-8 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Transition</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Add Slide Button - positioned at the end */}
          {(videoLessonData || componentBasedSlideDeck) && onAddSlide ? (
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="h-16 flex items-center justify-center">
                <SlideAddButton
                  currentSlideCount={(componentBasedSlideDeck?.slides.length || videoLessonData?.slides.length || 0)}
                  onAddSlide={onAddSlide}
                  isVisible={true}
                  position="relative"
                  left="auto"
                  top="auto"
                  transform="none"
                  containerStyle={{
                    width: '64px',
                    height: '64px'
                  }}
                />
              </div>
              <div className="h-8 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">Add Slide</span>
              </div>
            </div>
          ) : (
            // Debug: Show which condition is failing
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="h-16 flex items-center justify-center">
                <div 
                  className="bg-red-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-red-400 transition-colors"
                  style={getSceneRectangleStyles()}
                  onClick={() => console.log('Debug: videoLessonData:', !!videoLessonData, 'componentBasedSlideDeck:', !!componentBasedSlideDeck, 'onAddSlide:', !!onAddSlide)}
                >
                  <svg 
                    className="w-8 h-8 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                    />
                  </svg>
                </div>
              </div>
              <div className="h-8 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">Debug</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}
