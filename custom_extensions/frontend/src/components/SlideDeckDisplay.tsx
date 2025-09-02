"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';
import { locales } from '@/locales';
import {
  AlertCircle, CheckCircle, Info, XCircle, Minus, Type, List, ListOrdered,
  Award, Brain, BookOpen, Edit3, Lightbulb, Search, Compass, CloudDrizzle, EyeOff,
  ClipboardCheck, AlertTriangle, Star, ArrowRight, Circle, Presentation,
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

// Using Lucide React Presentation icon instead of custom SVG

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

        {/* Right Content Pane */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {!currentSlide && slides.length > 0 && (
             <div className={`text-center ${THEME_COLORS.mutedText} pt-10`}>No slide selected</div>
          )}
          {currentSlide && (
            <article className="space-y-5">
              <header className={`pb-3 border-b ${THEME_COLORS.lightBorder} flex items-center`}>
                <Presentation size={20} className="mr-2 flex-shrink-0 h-5 w-5" />
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
      </div>
    </div>
  );
};

export default SlideDeckDisplay; 