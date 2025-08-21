// custom_extensions/frontend/src/components/VideoDownloadButton.tsx

import React, { useState } from 'react';
import { Video, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

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
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const handleDownloadVideo = async () => {
    try {
      setStatus('generating');
      setProgress(0);

      // Test the backend API first
      const avatarResponse = await fetch('/api/custom/video/avatars');
      const avatarData = await avatarResponse.json();

      if (!avatarData.success) {
        throw new Error(avatarData.error || 'Failed to fetch avatars');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Simulate video generation (replace with actual implementation later)
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);
      setStatus('completed');

      // Simulate success
      onSuccess?.('https://example.com/video.mp4');

    } catch (error) {
      console.error('Video generation failed:', error);
      setStatus('error');
      onError?.(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'generating':
        return `Generating Video... ${progress}%`;
      case 'completed':
        return 'Video Generated Successfully';
      case 'error':
        return 'Generation Failed - Try Again';
      default:
        return 'Download Video';
    }
  };

  const getButtonIcon = () => {
    switch (status) {
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
    
    switch (status) {
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
    <button
      onClick={handleDownloadVideo}
      disabled={status === 'generating'}
      className={getButtonClassName()}
      title={
        status === 'generating' 
          ? 'Video generation in progress...' 
          : 'Generate and download video with AI avatar'
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
  );
};
