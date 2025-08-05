"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';
import { locales } from '@/locales';
import {
  AlertCircle, CheckCircle, Info, XCircle, Minus, Type, List, ListOrdered,
  Award, Brain, BookOpen, Edit3, Lightbulb, Search, Compass, CloudDrizzle, EyeOff,
  ClipboardCheck, AlertTriangle, Star, ArrowRight, Circle, Plus,
} from 'lucide-react';

// --- Theme Colors (consistent with other displays) ---
const THEME_COLORS = {
  primaryText: 'text-gray-800',
  headingText: 'text-black',
  accentRed: 'text-[#FF1414]',
  accentRedFill: '#FF1414',
  activeNavBg: 'bg-[#FFF5F5]', // Lighter red for active nav item background
  activeNavText: 'text-[#FF1414]',
  activeNavBorder: 'border-[#FF1414]',
  navText: 'text-gray-600 hover:text-gray-900',
  navBorder: 'border-gray-200',
  contentBg: 'bg-white',
  contentBoxBg: 'bg-gray-50',
  contentPlaceholderText: 'text-gray-500 italic text-sm',
  lightBorder: 'border-gray-300',
  mutedText: 'text-gray-600',
  editableBg: 'bg-yellow-50',
  editableBorder: 'border-yellow-400 focus:ring-1 focus:ring-yellow-500',
};

const editingInputClass = (baseClasses: string = "", type: 'input' | 'textarea' = 'input') => {
  const common = `w-full ${THEME_COLORS.editableBg} ${THEME_COLORS.editableBorder} rounded-md outline-none placeholder-gray-400 text-sm`;
  if (type === 'textarea') {
    return `${common} ${baseClasses} p-3 leading-relaxed`;
  }
  return `${common} ${baseClasses} p-2`;
};

// --- SVG Icon Components ---
const SlidePresentationIcon = () => (
  <svg width="20" height="21" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 flex-shrink-0 h-5 w-5">
    <g clipPath="url(#clip0_SlideLesson_13)">
      <path d="M0 16.5H15.5789V4.71053H0V16.5ZM4.21053 15.2368H2.94737C2.71579 15.2368 2.52632 15.0474 2.52632 14.8158C2.52632 14.5842 2.71579 14.3947 2.94737 14.3947H4.21053C4.44211 14.3947 4.63158 14.5842 4.63158 14.8158C4.63158 15.0474 4.44211 15.2368 4.21053 15.2368ZM4.21053 13.1316H2.94737C2.71579 13.1316 2.52632 12.9421 2.52632 12.7105C2.52632 12.4789 2.71579 12.2895 2.94737 12.2895H4.21053C4.44211 12.2895 4.63158 12.4789 4.63158 12.7105C4.63158 12.9421 4.44211 13.1316 4.21053 13.1316ZM4.21053 11.0263H2.94737C2.71579 11.0263 2.52632 10.8368 2.52632 10.6053C2.52632 10.3737 2.71579 10.1842 2.94737 10.1842H4.21053C4.44211 10.1842 4.63158 10.3737 4.63158 10.6053C4.63158 10.8368 4.44211 11.0263 4.21053 11.0263ZM4.21053 8.92105H2.94737C2.71579 8.92105 2.52632 8.73158 2.52632 8.5C2.52632 8.26842 2.71579 8.07895 2.94737 8.07895H4.21053C4.44211 8.07895 4.63158 8.26842 4.63158 8.5C4.63158 8.73158 4.44211 8.92105 4.21053 8.92105ZM12.6316 15.2368H6.31579C6.08421 15.2368 5.89474 15.0474 5.89474 14.8158C5.89474 14.5842 6.08421 14.3947 6.31579 14.3947H12.6316C12.8632 14.3947 13.0526 14.5842 13.0526 14.8158C13.0526 15.0474 12.8632 15.2368 12.6316 15.2368ZM12.6316 13.1316H6.31579C6.08421 13.1316 5.89474 12.9421 5.89474 12.7105C5.89474 12.4789 6.08421 12.2895 6.31579 12.2895H12.6316C12.8632 12.2895 13.0526 12.4789 13.0526 12.7105C13.0526 12.9421 12.8632 13.1316 12.6316 13.1316ZM12.6316 11.0263H6.31579C6.08421 11.0263 5.89474 10.8368 5.89474 10.6053C5.89474 10.3737 6.08421 10.1842 6.31579 10.1842H12.6316C12.8632 10.1842 13.0526 10.3737 13.0526 10.6053C13.0526 10.8368 12.8632 11.0263 12.6316 11.0263ZM12.6316 8.92105H6.31579C6.08421 8.92105 5.89474 8.73158 5.89474 8.5C5.89474 8.26842 6.08421 8.07895 6.31579 8.07895H12.6316C12.8632 8.07895 13.0526 8.26842 13.0526 8.5C13.0526 8.73158 12.8632 8.92105 12.6316 8.92105ZM1.68421 5.97368H13.8947C14.1263 5.97368 14.3158 6.16316 14.3158 6.39474C14.3158 6.62632 14.1263 6.81579 13.8947 6.81579H1.68421C1.45263 6.81579 1.26316 6.62632 1.26316 6.39474C1.26316 6.16316 1.45263 5.97368 1.68421 5.97368ZM15.5789 0.5V3.86842H0V0.5H15.5789Z" fill={THEME_COLORS.accentRedFill}/>
    </g>
    <defs>
      <clipPath id="clip0_SlideLesson_13">
        <rect y="0.5" width="15.5789" height="16" rx="0.888889" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Content rendering components (similar to PdfLessonDisplay)
const parseAndStyleText = (text: string | undefined | null): React.ReactNode[] => {
  if (!text) return [];
  const segments = text.split(/\*\*(.*?)\*\*/g); 
  return segments.map((segment, index) => {
    if (index % 2 === 1) { 
      return <span key={index} className="font-medium text-black">{segment}</span>;
    }
    return segment; 
  }).filter(segment => segment !== ""); 
};

const iconMap: { [key: string]: React.ElementType } = {
  alertCircle: AlertCircle, checkCircle: CheckCircle, info: Info, xCircle: XCircle,
  type: Type, list: List, listOrdered: ListOrdered,
  award: Award, brain: Brain, bookOpen: Edit3, lightbulb: Lightbulb,
  search: Search, compass: Compass, cloudDrizzle: CloudDrizzle, eyeOff: EyeOff,
  clipboardCheck: ClipboardCheck, alertTriangle: AlertTriangle,
  star: Star, arrowRight: ArrowRight, circle: Circle,
  default: Minus,
};

const getAlertColors = (alertType: string) => {
    switch (alertType) {
        case 'info': return { bgColor: 'bg-blue-50', borderColor: 'border-blue-400', textColor: 'text-gray-700', iconColorClass: 'text-blue-500', Icon: Info };
        case 'success': return { bgColor: 'bg-green-50', borderColor: 'border-green-400', textColor: 'text-gray-700', iconColorClass: 'text-green-500', Icon: CheckCircle };
        case 'warning': return { bgColor: 'bg-yellow-50', borderColor: 'border-yellow-400', textColor: 'text-gray-700', iconColorClass: 'text-yellow-500', Icon: AlertTriangle };
        case 'danger': return { bgColor: 'bg-red-50', borderColor: 'border-red-400', textColor: 'text-gray-700', iconColorClass: 'text-red-500', Icon: XCircle };
        default: return { bgColor: 'bg-blue-50', borderColor: 'border-blue-400', textColor: 'text-gray-700', iconColorClass: 'text-blue-500', Icon: Info };
    }
};

interface RenderBlockProps { 
  block: AnyContentBlock;
  depth?: number;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newText: string) => void;
  basePath?: (string | number)[];
}

const RenderBlock: React.FC<RenderBlockProps> = ({ 
  block, depth = 0, isEditing, onTextChange, basePath = []
}) => {
  const fieldPath = (fieldKey: string) => [...basePath, fieldKey];
  
  const handleInputChangeEvent = (
    pathForData: (string | number)[], 
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> 
  ) => {
    if (onTextChange) {
      onTextChange(pathForData, event.target.value);
    }
  };
  
  switch (block.type) {
    case 'headline': {
      const { level, text } = block;
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      
      let textStyleClass = 'uppercase '; 
      if (level === 1) { textStyleClass += `text-lg lg:text-xl font-semibold ${THEME_COLORS.headingText}`; } 
      else if (level === 2) { textStyleClass += `text-base lg:text-lg font-semibold ${THEME_COLORS.headingText}`; }  
      else if (level === 3) { textStyleClass += `text-base lg:text-lg font-semibold ${THEME_COLORS.accentRed}`; } 
      else if (level === 4) { textStyleClass += `text-sm lg:text-base font-medium text-gray-700`; }
      else { textStyleClass += `text-base font-medium text-gray-700`; }

      const styledText = parseAndStyleText(text);

      return (
        <Tag className={`${textStyleClass} mb-3`}>
          {isEditing && onTextChange ? (
            <input 
              type="text" 
              value={text}
              onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)}
              className={`${editingInputClass()} ${textStyleClass.replace(/text-\w+/g, '').replace(/font-\w+/g, '').replace('uppercase', '')} m-0 p-0`} 
              style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', display: 'inline', width: 'auto', flexGrow: 1, textTransform: 'uppercase' }}
            />
          ) : ( styledText )}
        </Tag>
      );
    }
    
    case 'paragraph': { 
      const { text } = block;
      const styledText = parseAndStyleText(text);

      if (isEditing && onTextChange) {
        return (
          <div className="mb-3">
            <textarea 
              value={text} 
              onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)}
              className={`${editingInputClass('', 'textarea')} w-full text-sm leading-normal text-gray-700`} 
            />
          </div>
        );
      }
      return ( <p className={`${THEME_COLORS.primaryText} text-sm leading-normal mb-3`}>{styledText}</p> );
    }
    
    case 'bullet_list': 
    case 'numbered_list': {
      const { items } = block; 
      const isNumbered = block.type === 'numbered_list';
      const ListTag = isNumbered ? 'ol' : 'ul';

      return (
        <ListTag className={`${isNumbered ? 'list-decimal' : 'list-disc'} pl-6 mb-3 space-y-1`}>
          {items.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">
              {typeof item === 'string' ? parseAndStyleText(item) : (
                <RenderBlock 
                  block={item} 
                  depth={depth + 1} 
                  isEditing={isEditing}
                  onTextChange={onTextChange}
                  basePath={[...basePath, 'items', index]}
                />
              )}
            </li>
          ))}
        </ListTag>
      );
    }
    
    case 'alert': {
      const { title, text, alertType } = block;
      const { bgColor, borderColor, textColor, iconColorClass, Icon } = getAlertColors(alertType);
      
      return (
        <div className={`${bgColor} ${borderColor} border-l-4 p-4 mb-4 rounded-r-md`}>
          <div className="flex items-start">
            <Icon className={`${iconColorClass} h-5 w-5 mr-3 mt-0.5 flex-shrink-0`} />
            <div className="flex-1">
              {title && (
                <h4 className={`font-medium ${textColor} mb-1`}>
                  {isEditing && onTextChange ? (
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => handleInputChangeEvent(fieldPath('title'), e)}
                      className={editingInputClass()}
                    />
                  ) : title}
                </h4>
              )}
              <p className={`text-sm ${textColor}`}>
                {isEditing && onTextChange ? (
                  <textarea 
                    value={text}
                    onChange={(e) => handleInputChangeEvent(fieldPath('text'), e)}
                    className={editingInputClass('', 'textarea')}
                  />
                ) : parseAndStyleText(text)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    case 'section_break': {
      const { style = 'solid' } = block;
      if (style === 'none') return <div className="mb-4"></div>;
      return (
        <hr className={`my-4 ${style === 'dashed' ? 'border-dashed' : 'border-solid'} border-gray-300`} />
      );
    }
    
    default:
      return null;
  }
};

interface SlideDeckDisplayProps {
  dataToDisplay: SlideDeckData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  className?: string;
  parentProjectName?: string;
  lessonNumber?: number;
}

const SlideDeckDisplay = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  className = "",
  parentProjectName,
  lessonNumber,
}: SlideDeckDisplayProps): React.JSX.Element | null => {
  const searchParams = useSearchParams();
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [showAddSlideDropdown, setShowAddSlideDropdown] = useState(false);

  useEffect(() => {
    if (dataToDisplay?.slides && dataToDisplay.slides.length > 0) {
      setActiveSlideId(dataToDisplay.currentSlideId || dataToDisplay.slides[0].slideId);
    } else {
      setActiveSlideId(null);
    }
  }, [dataToDisplay]);

  const handleSlideNavClick = (slideId: string) => {
    setActiveSlideId(slideId);
    if (onTextChange && dataToDisplay) {
      onTextChange(['currentSlideId'], slideId);
    }
  };

  const currentSlide = useMemo(() => {
    if (!activeSlideId || !dataToDisplay?.slides) return null;
    return dataToDisplay.slides.find(s => s.slideId === activeSlideId) || null;
  }, [activeSlideId, dataToDisplay?.slides]);

  const handleSlideTitleChange = (slideId: string, value: string) => {
    if (!onTextChange || !dataToDisplay) return;
    const slideIndex = dataToDisplay.slides.findIndex(s => s.slideId === slideId);
    if (slideIndex !== -1) {
      onTextChange(['slides', slideIndex, 'slideTitle'], value);
    }
  };

  const handleAddSlide = () => {
    // TODO: Implement add slide functionality for presentations
    // For now, just close the dropdown
    setShowAddSlideDropdown(false);
  };

  const handleMainTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onTextChange) {
      onTextChange(['lessonTitle'], event.target.value);
    }
  };

  if (!dataToDisplay) {
    return <div className="p-6 text-center text-gray-500 text-sm">No lesson data available.</div>;
  }

  const { lessonTitle, slides = [] } = dataToDisplay;

  const lang = dataToDisplay.detectedLanguage || 'en';
  const t = locales[lang as keyof typeof locales];

  return (
    <div className={`font-['Inter',_sans-serif] ${THEME_COLORS.contentBg} shadow-xl rounded-lg max-w-5xl mx-auto my-8 border ${THEME_COLORS.lightBorder} ${className}`}>
      <div className="p-6 pb-4">
        {isEditing && onTextChange ? (
          <input
            type="text"
            value={lessonTitle}
            onChange={handleMainTitleChange}
            placeholder="Edit lesson title..."
            className={`w-full text-xl md:text-2xl font-semibold ${THEME_COLORS.headingText} ${editingInputClass('border-b text-center')}`}
          />
        ) : (
          (parentProjectName && lessonNumber) ? (
            <div className="text-left">
              <div className="pl-2.5 border-l-[3px] border-[#FF1414] py-1 mb-2">
                  <span className={`uppercase text-lg sm:text-xl font-medium ${THEME_COLORS.headingText}`}>
                      <span style={{ color: '#FF1414' }}>{t.common.course}:</span> {decodeURIComponent(parentProjectName)}
                  </span>
              </div>
              <h1 className={`uppercase text-2xl sm:text-3xl font-medium ${THEME_COLORS.headingText}`}>
                  <span style={{ color: '#FF1414' }}>{t.common.lesson} №{lessonNumber}:</span> {lessonTitle}
              </h1>
            </div>
          ) : (
            <h1 className={`text-xl md:text-2xl font-semibold ${THEME_COLORS.headingText} text-center`}>
              {lessonTitle}
            </h1>
          )
        )}
      </div>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-220px)] md:min-h-[600px]">
        {/* Left Navigation Pane */}
        <div className={`w-full md:w-1/3 lg:w-1/4 ${THEME_COLORS.contentBoxBg} p-3 md:p-4 border-b md:border-b-0 md:border-r ${THEME_COLORS.navBorder} flex-shrink-0 md:overflow-y-auto`}>
          <nav>
            <ul className="space-y-1">
              {slides.map((slide) => (
                <li key={slide.slideId}>
                  <button
                    onClick={() => handleSlideNavClick(slide.slideId)}
                    className={`
                      w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-colors duration-150
                      flex items-center group border-l-4
                      ${slide.slideId === activeSlideId
                        ? `${THEME_COLORS.activeNavBg} ${THEME_COLORS.activeNavText} font-semibold ${THEME_COLORS.activeNavBorder}`
                        : `border-transparent ${THEME_COLORS.navText} hover:${THEME_COLORS.activeNavBg}`
                      }
                    `}
                  >
                    <span className={`mr-2 font-medium ${slide.slideId === activeSlideId ? THEME_COLORS.accentRed : 'text-gray-500 group-hover:text-gray-600'}`}>№{slide.slideNumber}</span>
                    <span className="truncate" title={slide.slideTitle}>{slide.slideTitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Center Content Pane */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {!currentSlide && slides.length > 0 && (
             <div className={`text-center ${THEME_COLORS.mutedText} pt-10`}>No slide selected</div>
          )}
          {currentSlide && (
            <article className="space-y-5">
              <header className={`pb-3 border-b ${THEME_COLORS.lightBorder} flex items-center`}>
                <SlidePresentationIcon />
                {isEditing && onTextChange ? (
                    <input
                      type="text"
                      value={currentSlide.slideTitle}
                      onChange={(e) => handleSlideTitleChange(currentSlide.slideId, e.target.value)}
                      placeholder="Edit slide title..."
                      className={`text-lg sm:text-xl font-semibold ${THEME_COLORS.headingText} ${editingInputClass()}`}
                    />
                ) : (
                  <h2 className={`text-lg sm:text-xl font-semibold ${THEME_COLORS.headingText}`}>
                    {currentSlide.slideTitle}
                  </h2>
                )}
              </header>

              <div className="space-y-4">
                {currentSlide.contentBlocks.map((block, index) => (
                  <RenderBlock 
                    key={index} 
                    block={block} 
                    isEditing={isEditing}
                    onTextChange={onTextChange}
                    basePath={['slides', dataToDisplay.slides.findIndex(s => s.slideId === currentSlide.slideId), 'contentBlocks', index]}
                  />
                ))}
              </div>
            </article>
          )}
        </div>

        {/* Right Sidebar - Add Slide Controls */}
        {isEditing && (
          <div className="w-20 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-6 sticky top-0 h-[calc(100vh-220px)] overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowAddSlideDropdown(!showAddSlideDropdown)}
                  className="w-12 h-12 rounded-lg bg-transparent hover:bg-gray-100 hover:scale-105 border-none cursor-pointer flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-200"
                  title="Add new slide"
                >
                  <Plus size={20} />
                </button>
                
                {showAddSlideDropdown && (
                  <div className="absolute right-full top-0 mr-4 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Add New Slide</span>
                      <button 
                        onClick={() => setShowAddSlideDropdown(false)}
                        className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleAddSlide}
                        className="w-full p-3 text-left hover:bg-gray-50 rounded-md flex items-center gap-3"
                      >
                        <span className="text-xl">📄</span>
                        <div>
                          <div className="font-medium text-gray-900">Standard Slide</div>
                          <div className="text-sm text-gray-600">Add a new presentation slide</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideDeckDisplay; 