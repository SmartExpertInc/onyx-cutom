// custom_extensions/frontend/src/components/VideoLessonDisplay.tsx
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes'; // Adjust path
import { locales } from '@/locales';
import { useLanguage } from '../contexts/LanguageContext';

// --- Theme Colors (consistent with PdfLessonDisplay & image) ---
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

const DisplayedTextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5 flex-shrink-0 h-3.5 w-3.5">
    <g clipPath="url(#clip0_VideoLesson_19)">
      <path d="M11.0692 -0.160721H1.09155C0.489946 -0.157213 0.00351725 0.32921 0 0.930825V10.9084C0.00350797 11.51 0.489931 11.9965 1.09155 12H11.0692C11.6708 11.9965 12.1572 11.5101 12.1607 10.9084V0.930825C12.1572 0.329225 11.6708 -0.157204 11.0692 -0.160721ZM9.66601 3.42493C9.66601 3.68335 9.45671 3.89265 9.19829 3.89265C8.94045 3.89265 8.73057 3.68335 8.73057 3.42493V3.26941H6.54808V8.57043L7.32741 8.56985C7.58583 8.56985 7.79513 8.77973 7.79513 9.03757C7.79513 9.29599 7.58583 9.50529 7.32741 9.50529H4.8333C4.57488 9.50529 4.36558 9.29599 4.36558 9.03757C4.36558 8.77973 4.57488 8.56985 4.8333 8.56985H5.61264V3.26942H3.43014V3.42495C3.43014 3.68337 3.22026 3.89266 2.96242 3.89266C2.704 3.89266 2.4947 3.68337 2.4947 3.42495V2.8017C2.49763 2.54445 2.70517 2.3369 2.96242 2.33398H9.19829C9.45554 2.33691 9.66309 2.54445 9.66601 2.8017V3.42493Z" fill={THEME_COLORS.accentRedFill}/>
    </g>
    <defs>
      <clipPath id="clip0_VideoLesson_19">
        <rect width="12" height="12" rx="1.71429" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const DisplayingImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5 flex-shrink-0 h-3.5 w-3.5">
    <g clipPath="url(#clip0_VideoLesson_25)">
      <path d="M10.9653 0H1.02208C0.454259 0 0 0.454259 0 1.02208V10.9779C0 11.5457 0.454259 12 1.02208 12H10.9779C11.5457 12 12 11.5457 12 10.9779V1.02208C11.9874 0.454259 11.5331 0 10.9653 0ZM7.98738 6.32177L4.93375 8.35331C4.66877 8.52997 4.31546 8.34069 4.31546 8.02524V3.96215C4.31546 3.64669 4.66877 3.45741 4.93375 3.63407L8 5.66562C8.22713 5.81704 8.22713 6.17035 7.98738 6.32177Z" fill={THEME_COLORS.accentRedFill}/>
    </g>
    <defs>
      <clipPath id="clip0_VideoLesson_25">
        <rect width="12" height="12" rx="1.71429" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const DisplayedVideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5 flex-shrink-0 h-3.5 w-3.5">
    <g clipPath="url(#clip0_VideoLesson_31)">
      <path d="M11.1429 8.76466L12 9.8631V10.6154C11.9979 11.3792 11.4236 11.9977 10.7143 12H8.8929L8.25433 11.0769L5.7172 7.42161L7.77008 5.22472C7.85526 5.13126 7.97419 5.08223 8.0958 5.09088C8.22062 5.10011 8.3358 5.1653 8.41294 5.27088L11.1429 8.76466ZM3.85716 2.76933C3.68359 2.76933 3.5277 2.88183 3.46127 3.05433C3.39484 3.22683 3.43181 3.42528 3.55395 3.55739C3.67663 3.68893 3.86092 3.72874 4.02108 3.6572C4.18127 3.58566 4.28573 3.41778 4.28573 3.23086C4.28573 3.10856 4.24073 2.99087 4.16037 2.90433C4.08002 2.8178 3.97073 2.76933 3.85716 2.76933ZM4.85144 7.71695L4.79144 7.62926L4.07145 6.59543C3.99913 6.49562 3.89252 6.43273 3.77574 6.42005C3.65735 6.40908 3.53948 6.45062 3.45003 6.53543L0.857209 8.79228L6.85336e-05 9.53996V10.6153C0.00221139 11.3792 0.576492 11.9976 1.28578 11.9999H7.82583L7.18298 11.0768L4.85144 7.71695ZM12 1.38474V8.42778L11.1429 7.33396L9.07283 4.6847C8.84408 4.38008 8.50605 4.19432 8.14284 4.17239C7.77963 4.15046 7.42498 4.29469 7.1657 4.56931L5.19852 6.67389L4.75281 6.03697C4.53799 5.73294 4.21495 5.53852 3.86139 5.5016C3.51425 5.46583 3.16817 5.58237 2.90139 5.82467L0.857141 7.60611L0 8.35379V1.38459C0.00214285 0.620756 0.576424 0.00230396 1.28571 0H10.7143C11.4235 0.00230766 11.9978 0.620756 12 1.38459L12 1.38474ZM5.14287 3.23087C5.14287 2.67068 4.82947 2.16589 4.34894 1.95184C3.86894 1.73723 3.31554 1.85607 2.94803 2.25183C2.58053 2.64759 2.47017 3.24354 2.66947 3.76048C2.86821 4.27797 3.33697 4.61547 3.85715 4.61547C4.56644 4.61317 5.14073 3.9947 5.14287 3.23087Z" fill={THEME_COLORS.accentRedFill}/>
    </g>
    <defs>
      <clipPath id="clip0_VideoLesson_31">
        <rect width="12" height="12" rx="1.71429" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const VoiceoverTextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5 flex-shrink-0 h-3.5 w-3.5">
    <rect width="12" height="12" rx="1.71429" fill={THEME_COLORS.accentRedFill}/>
    <path d="M8.85714 6.20003C8.85607 6.94402 8.5925 7.66104 8.11678 8.21226C7.64107 8.76388 6.98782 9.11038 6.28282 9.18502C6.28282 9.19102 6.28567 9.19402 6.28567 9.20002V10.4H7.14282C7.30068 10.4 7.42853 10.5343 7.42853 10.7C7.42853 10.8658 7.30068 11 7.14282 11H4.8571C4.69924 11 4.57139 10.8658 4.57139 10.7C4.57139 10.5343 4.69924 10.4 4.8571 10.4H5.71424V9.20002C5.71424 9.19402 5.7171 9.19102 5.7171 9.18502C5.01211 9.1104 4.35893 8.7639 3.88314 8.21226C3.40742 7.66102 3.14385 6.94402 3.14277 6.20003C3.14277 6.03428 3.27063 5.90004 3.42849 5.90004C3.58635 5.90004 3.7142 6.03428 3.7142 6.20003C3.7142 7.05727 4.14992 7.84968 4.85706 8.2786C5.56421 8.70722 6.43567 8.70722 7.14277 8.2786C7.84992 7.8496 8.28563 7.05721 8.28563 6.20003C8.28563 6.03428 8.41349 5.90004 8.57135 5.90004C8.72921 5.90004 8.85714 6.03428 8.85714 6.20003ZM3.42857 4.10006C3.58608 4.09968 3.71393 3.96544 3.71429 3.80006V2.90007C3.71429 2.73432 3.58643 2.60007 3.42857 2.60007C3.27071 2.60007 3.14286 2.73432 3.14286 2.90007V3.80006C3.14321 3.96544 3.27107 4.09968 3.42857 4.10006ZM2.28571 2.00008C2.12821 2.00046 2.00036 2.1347 2 2.30008V4.40005C2 4.56581 2.12785 4.70005 2.28571 4.70005C2.44357 4.70005 2.57143 4.56581 2.57143 4.40005V2.30008C2.57107 2.1347 2.44322 2.00046 2.28571 2.00008ZM9.71429 2.00008C9.55678 2.00046 9.42893 2.1347 9.42857 2.30008V4.40005C9.42857 4.56581 9.55643 4.70005 9.71429 4.70005C9.87215 4.70005 10 4.56581 10 4.40005V2.30008C9.99964 2.1347 9.87179 2.00046 9.71429 2.00008ZM8.57143 2.60007C8.41392 2.60045 8.28607 2.73469 8.28571 2.90007V3.80006C8.28571 3.96581 8.41357 4.10006 8.57143 4.10006C8.72929 4.10006 8.85714 3.96581 8.85714 3.80006V2.90007C8.85679 2.73469 8.72893 2.60045 8.57143 2.60007ZM6 7.70002C6.37893 7.70002 6.74214 7.54177 7.01001 7.26052C7.27788 6.97927 7.42858 6.59791 7.42858 6.20002V3.50005C7.42858 2.96419 7.15643 2.46883 6.71429 2.20109C6.27216 1.93297 5.72787 1.93297 5.28572 2.20109C4.84358 2.46884 4.57144 2.96421 4.57144 3.50005V6.20002C4.57144 6.59789 4.72215 6.97927 4.99001 7.26052C5.25787 7.54178 5.62106 7.70002 6 7.70002Z" fill="white"/>
  </svg>
);

interface VideoLessonDisplayProps {
  dataToDisplay: VideoLessonData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  className?: string;
  parentProjectName?: string;
  lessonNumber?: number;
}

const VideoLessonDisplay = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  className = "",
  parentProjectName,
  lessonNumber,
}: VideoLessonDisplayProps): React.JSX.Element | null => {
  const searchParams = useSearchParams();
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const { t } = useLanguage();

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

  const handleSlideFieldChange = useCallback((slideId: string, field: keyof Omit<VideoLessonSlideData, 'slideId' | 'slideNumber'>, value: string) => {
    if (!onTextChange || !dataToDisplay) return;
    const slideIndex = dataToDisplay.slides.findIndex(s => s.slideId === slideId);
    if (slideIndex !== -1) {
      const path = ['slides', slideIndex, field];
      onTextChange(path, value);
    }
  }, [onTextChange, dataToDisplay]);

  const handleMainTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onTextChange) {
      onTextChange(['mainPresentationTitle'], event.target.value);
    }
  };

  const handleSlideTitleChange = (slideId: string, value: string) => {
    if (!onTextChange || !dataToDisplay) return;
    const slideIndex = dataToDisplay.slides.findIndex(s => s.slideId === slideId);
    if (slideIndex !== -1) {
      onTextChange(['slides', slideIndex, 'slideTitle'], value);
    }
  };

  if (!dataToDisplay) {
    return <div className="p-6 text-center text-gray-500 text-sm">{t('videoLessonDisplay.noData')}</div>;
  }

  const { mainPresentationTitle, slides = [] } = dataToDisplay;

  const lang = dataToDisplay.detectedLanguage || 'en';
  const tLocal = locales[lang as keyof typeof locales];
  
  // NEW: A unified class for all content display boxes to ensure a consistent look and feel.
  const contentDisplayBoxClass = `p-3 border ${THEME_COLORS.lightBorder} rounded-md ${THEME_COLORS.contentBoxBg} min-h-[60px] ${THEME_COLORS.primaryText} text-base leading-relaxed whitespace-pre-wrap`;


  return (
    <div className={`font-['Inter',_sans-serif] ${THEME_COLORS.contentBg} shadow-xl rounded-lg max-w-5xl mx-auto my-8 border ${THEME_COLORS.lightBorder} ${className}`}>
      <div className="p-6 pb-4">
        {isEditing && onTextChange ? (
          <input
            type="text"
            value={mainPresentationTitle}
            onChange={handleMainTitleChange}
            placeholder={tLocal.videoLesson.editMainTitlePlaceholder}
            className={`w-full text-xl md:text-2xl font-semibold ${THEME_COLORS.headingText} ${editingInputClass('border-b text-center')}`}
          />
        ) : (
          (parentProjectName && lessonNumber) ? (
            <div className="text-left">
              <div className="pl-2.5 border-l-[3px] border-[#FF1414] py-1 mb-2">
                  <span className={`uppercase text-lg sm:text-xl font-medium ${THEME_COLORS.headingText}`}>
                      <span style={{ color: '#FF1414' }}>{tLocal.common.course}:</span> {decodeURIComponent(parentProjectName)}
                  </span>
              </div>
              <h1 className={`uppercase text-2xl sm:text-3xl font-medium ${THEME_COLORS.headingText}`}>
                  <span style={{ color: '#FF1414' }}>{tLocal.common.lesson} №{lessonNumber}:</span> {mainPresentationTitle}
              </h1>
            </div>
          ) : (
            <h1 className={`text-xl md:text-2xl font-semibold ${THEME_COLORS.headingText} text-center`}>
              {mainPresentationTitle}
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
             <div className={`text-center ${THEME_COLORS.mutedText} pt-10`}>{tLocal.videoLesson.noSlides}</div>
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
                      placeholder={tLocal.videoLesson.editSlideTitlePlaceholder}
                      className={`text-lg sm:text-xl font-semibold ${THEME_COLORS.headingText} ${editingInputClass()}`}
                    />
                ) : (
                    <h2 className={`text-lg sm:text-xl font-semibold ${THEME_COLORS.headingText}`}>
                     {currentSlide.slideTitle}
                    </h2>
                )}
              </header>

              {/* Displayed Text */}
              <section>
                <h3 className={`flex items-center text-xs sm:text-sm font-medium ${THEME_COLORS.accentRed} mb-1.5`}>
                  <DisplayedTextIcon /> {tLocal.videoLesson.displayedTextLabel}
                </h3>
                {isEditing && onTextChange ? (
                  <input
                    type="text" // Single short sentence
                    value={currentSlide.displayedText || ''}
                    onChange={(e) => handleSlideFieldChange(currentSlide.slideId, 'displayedText', e.target.value)}
                    placeholder={tLocal.videoLesson.editTextPlaceholder}
                    className={`text-base leading-relaxed ${THEME_COLORS.primaryText} ${editingInputClass('p-3')}`}
                  />
                ) : (
                  <div className={contentDisplayBoxClass}>
                    {currentSlide.displayedText || <span className={THEME_COLORS.mutedText}>{tLocal.videoLesson.emptyContent}</span>}
                  </div>
                )}
              </section>

              {/* Displaying Image Description */}
              <section>
                <h3 className={`flex items-center text-xs sm:text-sm font-medium ${THEME_COLORS.accentRed} mb-1.5`}>
                  <DisplayingImageIcon /> {tLocal.videoLesson.displayingImageLabel}
                </h3>
                {isEditing && onTextChange ? (
                   <textarea
                     value={currentSlide.displayedPictureDescription || ''}
                     onChange={(e) => handleSlideFieldChange(currentSlide.slideId, 'displayedPictureDescription', e.target.value)}
                     placeholder={tLocal.videoLesson.editImageDescPlaceholder}
                     className={`min-h-[60px] text-sm ${THEME_COLORS.primaryText} ${editingInputClass('p-3', 'textarea')}`}
                     rows={2}
                 />
                ) : (
                   <div className={contentDisplayBoxClass}>
                     {currentSlide.displayedPictureDescription || <span className={THEME_COLORS.mutedText}>{tLocal.videoLesson.emptyContent}</span>}
                  </div>
                )}
              </section>

              {/* Displayed Video Description */}
              <section>
                <h3 className={`flex items-center text-xs sm:text-sm font-medium ${THEME_COLORS.accentRed} mb-1.5`}>
                  <DisplayedVideoIcon /> {tLocal.videoLesson.displayedVideoLabel}
                </h3>
                 {isEditing && onTextChange ? (
                   <textarea
                     value={currentSlide.displayedVideoDescription || ''}
                     onChange={(e) => handleSlideFieldChange(currentSlide.slideId, 'displayedVideoDescription', e.target.value)}
                     placeholder={tLocal.videoLesson.editVideoDescPlaceholder}
                     className={`min-h-[60px] text-sm ${THEME_COLORS.primaryText} ${editingInputClass('p-3', 'textarea')}`}
                     rows={2}
                 />
                ) : (
                   <div className={contentDisplayBoxClass}>
                     {currentSlide.displayedVideoDescription || <span className={THEME_COLORS.mutedText}>{tLocal.videoLesson.emptyContent}</span>}
                  </div>
                )}
              </section>

              {/* Voiceover Text */}
              <section className="pt-4 border-t border-dashed border-gray-200">
                <h3 className={`flex items-center text-xs sm:text-sm font-medium ${THEME_COLORS.accentRed} mb-1.5`}>
                  <VoiceoverTextIcon /> {tLocal.videoLesson.voiceoverTextLabel}
                </h3>
                 {isEditing && onTextChange ? (
                  <textarea
                    value={currentSlide.voiceoverText || ''}
                    onChange={(e) => handleSlideFieldChange(currentSlide.slideId, 'voiceoverText', e.target.value)}
                    placeholder={tLocal.videoLesson.editVoiceoverPlaceholder}
                    className={`min-h-[80px] text-sm ${THEME_COLORS.mutedText} ${editingInputClass('p-2', 'textarea')}`}
                    rows={3}
                  />
                ) : (
                  <div className={contentDisplayBoxClass}>
                    {currentSlide.voiceoverText || <span className={THEME_COLORS.mutedText}>{tLocal.videoLesson.emptyContent}</span>}
                  </div>
                )}
              </section>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLessonDisplay;
