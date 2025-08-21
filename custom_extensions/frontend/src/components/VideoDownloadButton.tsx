// custom_extensions/frontend/src/components/VideoDownloadButton.tsx

import React, { useState, useEffect } from 'react';
import { Download, Video, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { SelectedAvatar, VideoGenerationState } from '@/types/elaiTypes';
import { VideoGenerationService } from '@/services/VideoGenerationService';
import { VoiceoverExtractor } from '@/utils/VoiceoverExtractor';
import { AvatarSelectionModal } from './AvatarSelectionModal';

interface VideoDownloadButtonProps {
  projectName?: string;
  onError?: (error: string) => void;
  onSuccess?: (downloadUrl: string) => void;
}

export const VideoDownloadButton: React.FC<VideoDownloadButtonProps> = ({
  projectName,
  onError,
  onSuccess
}) => {
  const [state, setState] = useState<VideoGenerationState>({
    status: 'idle',
    progress: 0
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<SelectedAvatar | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const handleDownloadVideo = async () => {
    try {
      // Check if avatar is selected
      if (!selectedAvatar) {
        setShowAvatarModal(true);
        return;
      }

      // Extract slides and voiceover data
      const slides = VoiceoverExtractor.extractVoiceoverFromSlides();
      
      // Validate slide data
      const validation = VoiceoverExtractor.validateSlideData(slides);
      if (!validation.valid) {
        const errorMessage = validation.errors.join(', ');
        setState({
          status: 'error',
          progress: 0,
          error: errorMessage
        });
        onError?.(errorMessage);
        return;
      }

      // Start video generation
      setState({
        status: 'generating',
        progress: 0
      });
      setShowProgressModal(true);

      const result = await VideoGenerationService.generateVideo(
        slides,
        selectedAvatar,
        (progress, status) => {
          setState(prev => ({
            ...prev,
            progress,
            status: status === 'completed' ? 'completed' : 'generating'
          }));
        }
      );

      if (result.success && result.downloadUrl) {
        setState({
          status: 'completed',
          progress: 100,
          downloadUrl: result.downloadUrl
        });

        // Download the video file
        const downloadSuccess = await VideoGenerationService.downloadVideoFile(
          result.downloadUrl,
          `${projectName || 'video_lesson'}_${new Date().toISOString().split('T')[0]}.mp4`
        );

        if (downloadSuccess) {
          onSuccess?.(result.downloadUrl);
        } else {
          throw new Error('Failed to download video file');
        }
      } else {
        throw new Error(result.error || 'Video generation failed');
      }

    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState({
        status: 'error',
        progress: 0,
        error: errorMessage
      });
      
      onError?.(errorMessage);
    } finally {
      setShowProgressModal(false);
    }
  };

  const handleAvatarSelect = (avatar: SelectedAvatar) => {
    setSelectedAvatar(avatar);
    setShowAvatarModal(false);
  };

  const handleRetry = () => {
    setState({
      status: 'idle',
      progress: 0
    });
    handleDownloadVideo();
  };

  const getButtonText = () => {
    switch (state.status) {
      case 'generating':
        return `Generating Video... ${state.progress}%`;
      case 'completed':
        return 'Video Downloaded Successfully';
      case 'error':
        return 'Generation Failed - Try Again';
      default:
        return 'Download Video';
    }
  };

  const getButtonIcon = () => {
    switch (state.status) {
      case 'generating':
        return <Loader size={16} className="mr-2 animate-spin" />;
      case 'completed':
        return <CheckCircle size={16} className="mr-2" />;
      case 'error':
        return <AlertTriangle size={16} className="mr-2" />;
      default:
        return <Video size={16} className="mr-2" />;
    }
  };

  const getButtonClassName = () => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center transition-colors";
    
    switch (state.status) {
      case 'generating':
        return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-60`;
      case 'completed':
        return `${baseClasses} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`;
      case 'error':
        return `${baseClasses} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      default:
        return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
    }
  };

  return (
    <>
      <button
        onClick={handleDownloadVideo}
        disabled={state.status === 'generating'}
        className={getButtonClassName()}
        title={
          state.status === 'generating' 
            ? 'Video generation in progress...' 
            : 'Generate and download video with AI avatar'
        }
      >
        {getButtonIcon()}
        {getButtonText()}
      </button>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
      />

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                {state.status === 'generating' ? (
                  <Loader size={48} className="mx-auto text-blue-600 animate-spin" />
                ) : state.status === 'completed' ? (
                  <CheckCircle size={48} className="mx-auto text-green-600" />
                ) : (
                  <AlertTriangle size={48} className="mx-auto text-red-600" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {state.status === 'generating' && 'Generating Video'}
                {state.status === 'completed' && 'Video Generated Successfully'}
                {state.status === 'error' && 'Generation Failed'}
              </h3>

              {state.status === 'generating' && (
                <>
                  <p className="text-gray-600 mb-4">
                    Creating your video with AI avatar. This may take a few minutes...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{state.progress}% complete</p>
                </>
              )}

              {state.status === 'completed' && (
                <p className="text-gray-600 mb-4">
                  Your video has been generated and downloaded successfully!
                </p>
              )}

              {state.status === 'error' && (
                <>
                  <p className="text-gray-600 mb-4">
                    {state.error || 'An error occurred during video generation.'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setShowProgressModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}

              {state.status === 'generating' && (
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close (Generation will continue in background)
                </button>
              )}

              {state.status === 'completed' && (
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
