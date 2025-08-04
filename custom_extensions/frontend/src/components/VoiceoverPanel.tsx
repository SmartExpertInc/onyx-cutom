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
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-scroll to current slide when panel opens
  useEffect(() => {
    if (isOpen && currentSlideId && currentSlideRef.current) {
      currentSlideRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isOpen, currentSlideId]);

  // Synchronized scrolling with main content
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      const mainContent = document.querySelector('.main-content');
      const panelContent = panelRef.current?.querySelector('.panel-content');
      
      if (mainContent && panelContent) {
        const mainScrollTop = mainContent.scrollTop;
        const mainScrollHeight = mainContent.scrollHeight;
        const mainClientHeight = mainContent.clientHeight;
        const panelScrollHeight = panelContent.scrollHeight;
        const panelClientHeight = panelContent.clientHeight;
        
        // Calculate scroll percentage and apply to panel
        const scrollPercentage = mainScrollTop / (mainScrollHeight - mainClientHeight);
        const panelScrollTop = scrollPercentage * (panelScrollHeight - panelClientHeight);
        
        panelContent.scrollTop = panelScrollTop;
      }
    };

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  // Close panel on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editingSlideId) {
          // Cancel editing if currently editing
          setEditingSlideId(null);
          setEditingText('');
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, editingSlideId]);

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

  const handleEditVoiceover = (slideId: string, currentText: string) => {
    setEditingSlideId(slideId);
    setEditingText(currentText || '');
  };

  const handleSaveVoiceover = async () => {
    if (!editingSlideId || !onVoiceoverUpdate) return;

    setIsSaving(true);
    try {
      await onVoiceoverUpdate(editingSlideId, editingText);
      setEditingSlideId(null);
      setEditingText('');
    } catch (error) {
      console.error('Failed to save voiceover:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlideId(null);
    setEditingText('');
  };

  const handlePanelScroll = () => {
    const panelContent = panelRef.current?.querySelector('.panel-content');
    const mainContent = document.querySelector('.main-content');
    
    if (panelContent && mainContent) {
      const panelScrollTop = panelContent.scrollTop;
      const panelScrollHeight = panelContent.scrollHeight;
      const panelClientHeight = panelContent.clientHeight;
      const mainScrollHeight = mainContent.scrollHeight;
      const mainClientHeight = mainContent.clientHeight;
      
      // Calculate scroll percentage and apply to main content
      const scrollPercentage = panelScrollTop / (panelScrollHeight - panelClientHeight);
      const mainScrollTop = scrollPercentage * (mainScrollHeight - mainClientHeight);
      
      mainContent.scrollTop = mainScrollTop;
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
        <div 
          className="panel-content h-full overflow-y-auto"
          onScroll={handlePanelScroll}
        >
          <div className="p-4 space-y-4">
            {slides.map((slide) => {
              const isCurrentSlide = slide.slideId === currentSlideId;
              const isEditing = editingSlideId === slide.slideId;
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
                      {!isEditing && (
                        <button
                          onClick={() => handleEditVoiceover(slide.slideId, slide.voiceoverText || '')}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:border-blue-500 focus:outline-none text-black"
                          style={{
                            minHeight: '60px',
                            height: 'auto',
                            overflow: 'hidden'
                          }}
                          placeholder="Enter voiceover text for this slide..."
                          autoFocus
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveVoiceover}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            <Save className="w-3 h-3" />
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer"
                        onClick={() => onSlideSelect?.(slide.slideId)}
                      >
                        {hasVoiceover ? (
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {slide.voiceoverText}
                          </p>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            No voiceover available for this slide
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            Click on any slide to navigate to it • Click Edit to modify voiceover text
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceoverPanel; 