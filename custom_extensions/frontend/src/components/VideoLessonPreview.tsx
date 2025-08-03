import React, { useState, useEffect } from 'react';
import { FileText, Edit3, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Type definitions
interface VideoLessonSlide {
  id: string;
  slideNumber: number;
  slideTitle: string;
  displayedText: string;
  voiceoverText: string;
  displayedPictureDescription?: string;
  displayedVideoDescription?: string;
}

interface VideoLessonData {
  mainPresentationTitle: string;
  slides: VideoLessonSlide[];
  detectedLanguage?: string;
}

interface VideoLessonPreviewProps {
  markdown: string;
  isEditable?: boolean;
  onContentChange?: (newMarkdown: string) => void;
  className?: string;
}

// Parser to convert AI response to video lesson data
function parseVideoLessonMarkdown(markdown: string): VideoLessonData {
  try {
    // Try to parse as JSON first
    const data = JSON.parse(markdown);
    if (data.mainPresentationTitle && data.slides) {
      return data;
    }
  } catch (e) {
    // If JSON parsing fails, create a fallback structure
    console.warn('Failed to parse video lesson JSON, creating fallback structure');
  }
  
  // Fallback: create a basic structure
  return {
    mainPresentationTitle: 'Video Lesson',
    slides: [{
      id: 'slide_1',
      slideNumber: 1,
      slideTitle: 'Generated Content',
      displayedText: markdown,
      voiceoverText: 'This is the generated content for the video lesson.',
    }],
    detectedLanguage: 'en'
  };
}

// Component to display individual slide with voiceover popup
const VideoSlideDisplay: React.FC<{
  slide: VideoLessonSlide;
  isEditing: boolean;
  onSlideChange?: (newSlide: VideoLessonSlide) => void;
}> = ({ slide, isEditing, onSlideChange }) => {
  const { t } = useLanguage();
  const [showVoiceover, setShowVoiceover] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Slide header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
              {slide.slideNumber}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {slide.slideTitle}
            </h3>
          </div>
          
          {/* Voiceover button */}
          <button
            onClick={() => setShowVoiceover(!showVoiceover)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showVoiceover 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
            }`}
            title={showVoiceover ? t('videoLesson.hideVoiceover', 'Hide Voiceover') : t('videoLesson.showVoiceover', 'Show Voiceover')}
          >
            {showVoiceover ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {t('videoLesson.voiceover', 'Voiceover')}
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="p-6">
        {/* Main slide content */}
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 whitespace-pre-wrap">
            {slide.displayedText}
          </div>
        </div>

        {/* Image/video descriptions if present */}
        {(slide.displayedPictureDescription || slide.displayedVideoDescription) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {t('videoLesson.visualElements', 'Visual Elements')}
            </h4>
            {slide.displayedPictureDescription && (
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('videoLesson.image', 'Image')}
                </span>
                <p className="text-sm text-gray-600">{slide.displayedPictureDescription}</p>
              </div>
            )}
            {slide.displayedVideoDescription && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('videoLesson.video', 'Video')}
                </span>
                <p className="text-sm text-gray-600">{slide.displayedVideoDescription}</p>
              </div>
            )}
          </div>
        )}

        {/* Voiceover popup */}
        {showVoiceover && slide.voiceoverText && (
          <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Volume2 size={20} className="text-blue-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  {t('videoLesson.voiceoverScript', 'Voiceover Script')}
                </h4>
                <div className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                  {slide.voiceoverText}
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  {t('videoLesson.estimatedDuration', 'Estimated duration')}: ~{Math.ceil(slide.voiceoverText.length / 12)} {t('videoLesson.seconds', 'seconds')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main video lesson preview component
const VideoLessonPreview: React.FC<VideoLessonPreviewProps> = ({
  markdown,
  isEditable = false,
  onContentChange,
  className = ""
}) => {
  const { t } = useLanguage();
  const [videoLessonData, setVideoLessonData] = useState<VideoLessonData>(() => 
    parseVideoLessonMarkdown(markdown)
  );

  // Re-parse when markdown changes
  useEffect(() => {
    const newData = parseVideoLessonMarkdown(markdown);
    setVideoLessonData(newData);
  }, [markdown]);

  const handleSlideChange = (newSlide: VideoLessonSlide) => {
    if (!isEditable || !onContentChange) return;
    
    const updatedSlides = [...videoLessonData.slides];
    const slideIndex = updatedSlides.findIndex(s => s.id === newSlide.id);
    
    if (slideIndex !== -1) {
      updatedSlides[slideIndex] = newSlide;
      const updatedData = { ...videoLessonData, slides: updatedSlides };
      setVideoLessonData(updatedData);
      
      // Convert back to JSON and notify parent
      const newMarkdown = JSON.stringify(updatedData, null, 2);
      onContentChange(newMarkdown);
    }
  };

  if (!videoLessonData.slides.length) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('videoLessonPreview.noSlides', 'No slides available')}
        </h3>
        <p className="text-gray-600">
          {t('videoLessonPreview.noSlidesDescription', 'Start generating to create your first video lesson slide.')}
        </p>
      </div>
    );
  }

  const totalVoiceoverTime = videoLessonData.slides.reduce((total, slide) => 
    total + Math.ceil(slide.voiceoverText?.length / 12 || 0), 0
  );

  return (
    <div className={`bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {videoLessonData.mainPresentationTitle}
              </h2>
              <p className="text-sm text-gray-600">
                {videoLessonData.slides.length} {t('videoLessonPreview.slides', 'slides')} • 
                ~{Math.floor(totalVoiceoverTime / 60)}:{(totalVoiceoverTime % 60).toString().padStart(2, '0')} {t('videoLessonPreview.duration', 'duration')}
              </p>
            </div>
          </div>
          
          {isEditable && (
            <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <Edit3 className="w-4 h-4 mr-1" />
              {t('videoLessonPreview.editMode', 'Edit Mode')}
            </div>
          )}
        </div>
      </div>

      {/* All slides displayed vertically */}
      <div className="max-h-[600px] overflow-y-auto">
        <div className="p-6 space-y-6">
          {videoLessonData.slides.map((slide) => (
            <VideoSlideDisplay
              key={slide.id}
              slide={slide}
              isEditing={isEditable}
              onSlideChange={handleSlideChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoLessonPreview; 