// custom_extensions/frontend/src/app/projects-2/view/components/VideoGenerationModals.tsx

'use client';

import { useState } from 'react';
import GenerateModal from './GenerateModal';
import GenerationCompletedModal from './GenerationCompletedModal';
import { VideoGenerationState } from '../../../../utils/videoGenerationUtils';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface VideoGenerationModalsProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export default function VideoGenerationModals({ isOpen, onClose, title }: VideoGenerationModalsProps) {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<VideoGenerationState['status']>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle opening the generate modal
  const handleOpenGenerateModal = () => {
    setShowGenerateModal(true);
    setShowCompletedModal(false);
    // Reset generation state
    setGenerationStatus('idle');
    setGenerationProgress(0);
    setErrorMessage(null);
    setGenerationJobId(null);
  };

  // Handle generation start
  const handleGenerationStart = (jobId: string) => {
    setGenerationJobId(jobId);
    setShowGenerateModal(false);
    setShowCompletedModal(true);
    setGenerationStatus('generating');
    setGenerationProgress(0);
    
    // Start polling for status updates
    pollForStatusUpdates(jobId);
  };

  // Poll for generation status updates
  const pollForStatusUpdates = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${jobId}`, {
          method: 'GET',
          credentials: 'same-origin',
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            const currentProgress = data.progress || 0;
            setGenerationProgress(currentProgress);
            
            if (data.status === 'completed') {
              clearInterval(pollInterval);
              setGenerationStatus('completed');
              setGenerationProgress(100);
            } else if (data.status === 'failed') {
              clearInterval(pollInterval);
              setGenerationStatus('error');
              setErrorMessage(data.error || 'Video generation failed');
            }
          }
        }
      } catch (error) {
        console.error('Error polling for status:', error);
        clearInterval(pollInterval);
        setGenerationStatus('error');
        setErrorMessage('Failed to check generation status');
      }
    }, 2000);

    // Set timeout to stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (generationStatus === 'generating') {
        setGenerationStatus('error');
        setErrorMessage('Video generation timed out after 10 minutes');
      }
    }, 600000);
  };

  // Handle generation completion
  const handleGenerationComplete = (jobId: string) => {
    setGenerationStatus('completed');
    setGenerationProgress(100);
    setErrorMessage(null);
  };

  // Handle generation error
  const handleGenerationError = (error: string) => {
    setGenerationStatus('error');
    setErrorMessage(error);
  };

  // Handle closing all modals
  const handleCloseAll = () => {
    setShowGenerateModal(false);
    setShowCompletedModal(false);
    onClose();
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <>
      {/* Generate Modal */}
      <GenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title={title}
        onGenerationStart={handleGenerationStart}
      />

      {/* Generation Completed Modal */}
      <GenerationCompletedModal
        isOpen={showCompletedModal}
        onClose={handleCloseAll}
        videoTitle={title}
        jobId={generationJobId || undefined}
        generationStatus={generationStatus}
        generationProgress={generationProgress}
        errorMessage={errorMessage || undefined}
      />

      {/* Initial Modal Trigger */}
      {!showGenerateModal && !showCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            onClick={onClose}
          ></div>
          
          {/* Modal content */}
          <div className="relative bg-white shadow-xl w-[400px] max-w-[95vw] flex flex-col z-10" style={{ borderRadius: '12px' }}>
            {/* Header */}
            <div className="p-6 pb-3">
              <div className="flex justify-center items-center">
                <h2 className="text-lg font-semibold text-gray-700">Video Generation</h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-6 text-center">
                Generate a professional video from your presentation slides with AI avatar narration.
              </p>
              
              {/* Bottom buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-white text-black border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleOpenGenerateModal}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Start Generation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
