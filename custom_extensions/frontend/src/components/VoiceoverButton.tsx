import React, { useState } from 'react';
import { Volume2, X } from 'lucide-react';

interface VoiceoverButtonProps {
  voiceoverText?: string;
  className?: string;
}

export const VoiceoverButton: React.FC<VoiceoverButtonProps> = ({ 
  voiceoverText, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!voiceoverText) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors ${className}`}
        title="View voiceover script"
        aria-label="View voiceover script"
      >
        <Volume2 size={20} />
      </button>

      {/* Voiceover Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Volume2 size={24} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Voiceover Script
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close voiceover script"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {voiceoverText}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 