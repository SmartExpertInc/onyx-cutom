import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
// NEW: Import types and template registry
import { ComponentBasedSlide, ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutGrid, Gem } from 'lucide-react';

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
  // Transition props
  onTransitionClick?: (transitionIndex: number) => void;
  activeTransitionIndex?: number | null;
  showReady?: boolean;
}

// Helper function to strip HTML tags from strings
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

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
  onOpenTemplateSelector,
  onTransitionClick,
  activeTransitionIndex,
  showReady
}: SceneTimelineProps) {
  const slideRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [transitionPositions, setTransitionPositions] = useState<{ [key: string]: { x: number, y: number } }>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const [playheadPosition, setPlayheadPosition] = useState(0); // x position in pixels
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

  // Convert Video Lesson slides to scenes if provided
  const displayScenes = (() => {
    if (componentBasedSlideDeck) {
      // Handle component-based slide deck
      return componentBasedSlideDeck.slides.map((slide, index) => ({
        id: slide.slideId,
        // ✅ Use slideTitle if available (plain text), otherwise strip HTML from props.title
        name: slide.slideTitle || stripHtmlTags(slide.props?.title as string || '') || `Slide ${slide.slideNumber}`,
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
  
  const SECONDS_PER_SLIDE = 30;
  const totalDuration = displayScenes.length * SECONDS_PER_SLIDE;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1; // Update every 100ms
        if (newTime >= totalDuration) {
          setIsPlaying(false);
          return 0; // Reset to start
        }
        return newTime;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Calculate playhead position and auto-scroll
  useEffect(() => {
    const updatePlayhead = () => {
      if (!timelineContainerRef.current || displayScenes.length === 0) return;
      
      const firstSlide = slideRefs.current[displayScenes[0].id];
      const lastSlide = slideRefs.current[displayScenes[displayScenes.length - 1].id];
      
      if (!firstSlide || !lastSlide) return;
      
      const firstRect = firstSlide.getBoundingClientRect();
      const lastRect = lastSlide.getBoundingClientRect();
      
      const startX = firstRect.left;
      const endX = lastRect.right;
      const totalWidth = endX - startX;
      
      const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
      const xPosition = startX + (totalWidth * progress);
      
      setPlayheadPosition(xPosition);
      
      // Auto-scroll when playhead approaches the right edge
      if (isPlaying && timelineContainerRef.current) {
        const containerRect = timelineContainerRef.current.getBoundingClientRect();
        const containerRightEdge = containerRect.right;
        const playheadRelativeToContainer = xPosition - containerRect.left;
        const scrollThreshold = containerRect.width * 0.8; // Start scrolling when 80% to the right
        
        if (playheadRelativeToContainer > scrollThreshold) {
          const scrollAmount = playheadRelativeToContainer - scrollThreshold;
          timelineContainerRef.current.scrollLeft += scrollAmount;
        }
      }
    };
    
    updatePlayhead();
    
    const container = timelineContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updatePlayhead);
    }
    
    window.addEventListener('resize', updatePlayhead);
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', updatePlayhead);
      }
      window.removeEventListener('resize', updatePlayhead);
    };
  }, [currentTime, displayScenes, totalDuration, isPlaying]);

  // Update transition button positions when slides change
  useEffect(() => {
    const updatePositions = () => {
      const newPositions: { [key: string]: { x: number, y: number } } = {};
      const containerRect = timelineContainerRef.current?.getBoundingClientRect();

      Object.entries(slideRefs.current).forEach(([slideId, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const position = {
            x: rect.right,
            y: rect.top + rect.height / 2
          };

          // Only store positions that remain in the horizontal bounds of the scroll container
          if (!containerRect || (position.x >= containerRect.left && position.x <= containerRect.right)) {
            newPositions[slideId] = position;
          }
        }
      });

      setTransitionPositions(newPositions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);
    
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [displayScenes]);

  // Function to get scene rectangle dimensions based on aspect ratio (16:9 only)
  const getSceneRectangleStyles = () => {
    const baseHeight = 80; // Increased for bigger cards
    return {
      width: `${Math.round(baseHeight * 16 / 9)}px`,
      height: `${baseHeight}px`,
    };
  };

  const transitionPositionsWithVisibility = useMemo(() => {
    if (!timelineContainerRef.current) return transitionPositions;
    const containerRect = timelineContainerRef.current.getBoundingClientRect();
    const adjusted: { [key: string]: { x: number; y: number } } = {};

    Object.entries(transitionPositions).forEach(([id, position]) => {
      if (position.x >= containerRect.left && position.x <= containerRect.right) {
        adjusted[id] = position;
      }
    });

    return adjusted;
  }, [transitionPositions]);

  return (
    <>
    <div className="bg-white border border-[#E0E0E0] rounded-md overflow-visible px-4 py-12" style={{ height: 'auto', minHeight: '120px' }}>
      <div className="flex items-end gap-4 pb-2 justify-center">
          {/* Play Button with Time - Fixed */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ width: '65px' }}>
            <div className="relative flex items-center justify-center">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-colors cursor-pointer" 
                style={{ border: '1px solid #878787' }}
              >
                {isPlaying ? (
                  // Pause icon
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-[#878787]"></div>
                    <div className="w-1 h-3 bg-[#878787]"></div>
                  </div>
                ) : (
                  // Play icon
                  <div className="w-0 h-0 border-l-[8px] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" style={{ borderLeftColor: '#878787' }}></div>
                )}
              </button>
            </div>
            <div className="h-8 flex items-center justify-center">
              <span className="text-[10px] text-[#A5A5A5]">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Scrollable Slides Container */}
          <div 
            ref={timelineContainerRef}
            className="flex items-end gap-1 overflow-x-auto overflow-y-visible flex-1"
          >
          {/* Dynamic Scene Rectangles */}
          {displayScenes.map((scene, index) => (
            <React.Fragment key={scene.id}>
              <div 
                ref={el => { slideRefs.current[scene.id] = el; }}
                className="flex flex-col items-center gap-2 flex-shrink-0 relative"
              >
                <div className="relative group">
                  <div 
                    className={`bg-gray-100 border rounded-sm flex items-center justify-center relative cursor-pointer transition-all ${
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
                        className="w-6 h-3 bg-white rounded-sm shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMenuClick(scene.id, e);
                        }}
                      >
                        <svg width="12" height="3" viewBox="0 0 12 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.29599 1.19509C5.29599 1.5725 5.60194 1.87845 5.97935 1.87845C6.35677 1.87845 6.66272 1.5725 6.66272 1.19509C6.66272 0.817672 6.35677 0.511719 5.97935 0.511719C5.60194 0.511718 5.29599 0.817672 5.29599 1.19509Z" stroke="#E0E0E0" strokeWidth="1.02505" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10.0796 1.19509C10.0796 1.5725 10.3855 1.87845 10.7629 1.87845C11.1403 1.87845 11.4463 1.5725 11.4463 1.19509C11.4463 0.817672 11.1403 0.511719 10.7629 0.511719C10.3855 0.511719 10.0796 0.817672 10.0796 1.19509Z" stroke="#E0E0E0" strokeWidth="1.02505" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M0.51242 1.19509C0.51242 1.5725 0.818374 1.87845 1.19579 1.87845C1.5732 1.87845 1.87915 1.5725 1.87915 1.19509C1.87915 0.817672 1.5732 0.511718 1.19579 0.511718C0.818374 0.511718 0.51242 0.817672 0.51242 1.19509Z" stroke="#E0E0E0" strokeWidth="1.02505" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          </div>

          {/* Action Buttons Group - Fixed */}
          <div className="flex items-end gap-1 flex-shrink-0">
            {/* Add Slide Button - Opens Templates Panel */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="h-20 flex items-center justify-center">
                <button
                  onClick={onOpenTemplateSelector}
                    className="w-12 h-20 rounded-md flex items-center justify-center transition-colors cursor-pointer"
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

            {/* Chevron Up Button - Non-functional for now */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="h-20 flex items-center justify-center">
                <DropdownMenu open={isAddDropdownOpen} onOpenChange={setIsAddDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-8 h-20 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                      style={{ backgroundColor: '#CCDBFC' }}
                      title="Add slide options"
                      type="button"
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
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    sideOffset={12}
                    className="w-[220px] rounded-2xl border border-[#E5E7EB] bg-white shadow-xl p-2 space-y-1"
                  >
                    <DropdownMenuItem
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EEF4FF] transition-colors text-sm font-medium text-[#171718]"
                      onSelect={(event) => {
                        event.preventDefault();
                        setIsAddDropdownOpen(false);
                        onOpenTemplateSelector?.();
                      }}
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#EEF4FF] text-[#0F58F9]">
                        <LayoutGrid size={16} strokeWidth={2} />
                      </span>
                      Add from template
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FEF3FF] transition-colors text-sm font-medium text-[#171718]"
                      onSelect={(event) => {
                        event.preventDefault();
                        setIsAddDropdownOpen(false);
                        console.log('Premium slides clicked');
                      }}
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#FEF3FF] text-[#A855F7]">
                        <Gem size={16} strokeWidth={2} />
                      </span>
                      Premium Slides
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portal for playhead line - rendered outside to avoid overflow clipping */}
      {isMounted && typeof window !== 'undefined' && playheadPosition > 0 && (isPlaying || currentTime > 0) && (() => {
        // Check if playhead is within visible bounds of timeline container
        const containerRect = timelineContainerRef.current?.getBoundingClientRect();
        if (!containerRect) return false;
        return playheadPosition >= containerRect.left && playheadPosition <= containerRect.right;
      })() && ReactDOM.createPortal(
        <div
          className="fixed pointer-events-none"
          style={{
            left: `${playheadPosition}px`,
            top: 0,
            height: '100vh',
            zIndex: 40
          }}
        >
          {/* Time display above the line */}
          <div 
            className="absolute text-[9px] px-2 py-1 rounded-full"
            style={{
              backgroundColor: '#CCDBFC',
              color: '#0F58F9',
              bottom: 'calc(100vh - ' + (timelineContainerRef.current?.getBoundingClientRect().top || 0) + 'px + 15px)',
              transform: 'translateX(-50%)',
              left: 0
            }}
          >
            {formatTime(currentTime)}
          </div>
          {/* Triangle arrow above the line */}
          <div 
            className="absolute flex justify-center"
            style={{
              top: `${(timelineContainerRef.current?.getBoundingClientRect().top || 0) - 11}px`,
              left: '-5px',
              width: '13px'
            }}
          >
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.06329 10.5C6.67839 11.1667 5.71614 11.1667 5.33124 10.5L0.135086 1.5C-0.249814 0.833332 0.231312 -2.67268e-07 1.00111 -1.9997e-07L11.3934 7.08554e-07C12.1632 7.75852e-07 12.6443 0.833334 12.2594 1.5L7.06329 10.5Z" fill="#0F58F9"/>
            </svg>
          </div>
          {/* Vertical line */}
          <div 
            className="bg-[#0F58F9]"
            style={{
              width: '2px',
              height: `${timelineContainerRef.current?.getBoundingClientRect().height || 0}px`,
              position: 'absolute',
              top: `${timelineContainerRef.current?.getBoundingClientRect().top || 0}px`,
            }}
          ></div>
        </div>,
        document.body
      )}
      
      {/* Portal for transition buttons - rendered outside to avoid overflow clipping */}
      {isMounted && typeof window !== 'undefined' && ReactDOM.createPortal(
        <>
          {displayScenes.map((scene, index) => {
            if (index >= displayScenes.length - 1) return null;
            
            const position = transitionPositionsWithVisibility[scene.id];
            if (!position) return null;
            
            return (
              <div 
                key={`transition-${scene.id}`}
                className="fixed pointer-events-auto"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 40
                }}
              >
                <div className="relative group">
                  <button 
                    className={`w-7 h-7 border rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg ${
                      activeTransitionIndex === index
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onTransitionClick?.(index)}
                  >
                    <svg 
                      width="13" 
                      height="9" 
                      viewBox="0 0 13 9" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-4 h-3"
                    >
                      <path 
                        d="M8.49836 4.13605C8.62336 4.26113 8.6234 4.46393 8.49836 4.58898L4.58877 8.49857C4.46371 8.62354 4.2609 8.62354 4.13584 8.49857L0.226252 4.58898C0.101204 4.46393 0.101253 4.26113 0.226252 4.13605L4.13584 0.226463C4.26091 0.101391 4.4637 0.101391 4.58877 0.226463L8.49836 4.13605ZM0.905642 4.36252L4.3623 7.81918L7.81897 4.36252L4.3623 0.905853L0.905642 4.36252Z" 
                        fill={activeTransitionIndex === index ? '#ffffff' : '#848485'}
                      />
                      <path 
                        d="M6.21777 0.453125L10.061 4.29634L6.21777 8.13955" 
                        stroke={activeTransitionIndex === index ? '#ffffff' : '#848485'} 
                        strokeWidth="0.640535" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M8.13867 0.453125L11.9819 4.29634L8.13867 8.13955" 
                        stroke={activeTransitionIndex === index ? '#ffffff' : '#848485'} 
                        strokeWidth="0.640535" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                    <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {componentBasedSlideDeck?.transitions?.[index]?.type 
                        ? `Transition: ${componentBasedSlideDeck.transitions[index].type}`
                        : 'Add transition'}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </>,
        document.body
      )}
    </>
    );
}
