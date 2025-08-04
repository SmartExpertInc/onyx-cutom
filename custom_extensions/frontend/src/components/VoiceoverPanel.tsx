import React, { useEffect, useRef, useState } from 'react';
import { X, Volume2, Save } from 'lucide-react';

interface VoiceoverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Array<{
    slideId: string;
    slideNumber: number;
    slideTitle: string;
    voiceoverText?: string;
  }>;
  currentSlideId?: string;
  onSlideSelect?: (slideId: string) => void;
  onVoiceoverUpdate?: (slideId: string, newVoiceoverText: string) => void;
}

const VoiceoverPanel: React.FC<VoiceoverPanelProps> = ({
  isOpen,
  onClose,
  slides,
  currentSlideId,
  onSlideSelect,
  onVoiceoverUpdate
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const currentSlideRef = useRef<HTMLDivElement>(null);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  // Auto-scroll to current slide when panel opens
  useEffect(() => {
    if (isOpen && currentSlideId && currentSlideRef.current) {
      currentSlideRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isOpen, currentSlideId]);

  // Close panel on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleVoiceoverChange = async (slideId: string, newText: string) => {
    if (!onVoiceoverUpdate) return;

    // Set saving state for this slide
    setSavingStates(prev => ({ ...prev, [slideId]: true }));

    try {
      await onVoiceoverUpdate(slideId, newText);
    } catch (error) {
      console.error('Failed to save voiceover:', error);
    } finally {
      // Clear saving state after a short delay to show feedback
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [slideId]: false }));
      }, 500);
    }
  };

  return (
    <>
      {/* Sliding Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 left-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Voiceover</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto">
          <div className="p-4 space-y-4">
            {slides.map((slide) => {
              const isCurrentSlide = slide.slideId === currentSlideId;
              const isSaving = savingStates[slide.slideId] || false;
              const hasVoiceover = slide.voiceoverText && slide.voiceoverText.trim().length > 0;

              return (
                <div
                  key={slide.slideId}
                  ref={isCurrentSlide ? currentSlideRef : null}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isCurrentSlide
                      ? 'border-blue-300 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Slide Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCurrentSlide
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {slide.slideNumber}
                    </div>
                    <h3 className={`font-medium text-sm ${
                      isCurrentSlide ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {slide.slideTitle}
                    </h3>
                    {isCurrentSlide && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Voiceover Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Volume2 className="w-3 h-3" />
                        <span>Voiceover</span>
                      </div>
                      {isSaving && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Save className="w-3 h-3 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <textarea
                        value={slide.voiceoverText || ''}
                        onChange={(e) => handleVoiceoverChange(slide.slideId, e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:border-blue-500 focus:outline-none transition-colors"
                        rows={4}
                        placeholder="Enter voiceover text for this slide..."
                        onClick={() => onSlideSelect?.(slide.slideId)}
                      />
                      {!hasVoiceover && (
                        <div className="text-xs text-gray-400 italic">
                          Start typing to add voiceover text for this slide
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            Click on any slide to navigate to it • Text is saved automatically as you type
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceoverPanel; 