// custom_extensions/frontend/src/components/VideoDownloadButton.tsx

import React, { useState } from 'react';
import { Video, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

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
      console.log('🎬 [VIDEO_DOWNLOAD] Starting video download process...');
      console.log('🎬 [VIDEO_DOWNLOAD] Environment check:');
      console.log('  - CUSTOM_BACKEND_URL:', CUSTOM_BACKEND_URL);
      console.log('  - NEXT_PUBLIC_CUSTOM_BACKEND_URL:', process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL);
      console.log('  - Window location:', window.location.href);
      
      setStatus('generating');
      setProgress(0);

      // Test the backend API first
      const apiUrl = `${CUSTOM_BACKEND_URL}/video/avatars`;
      console.log('🎬 [VIDEO_DOWNLOAD] Making API request to:', apiUrl);
      console.log('🎬 [VIDEO_DOWNLOAD] Full URL will be:', new URL(apiUrl, window.location.origin).href);
      
      const startTime = Date.now();
      console.log('🎬 [VIDEO_DOWNLOAD] Request start time:', new Date(startTime).toISOString());
      
      const avatarResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
      const endTime = Date.now();
      
      console.log('🎬 [VIDEO_DOWNLOAD] Response received after:', endTime - startTime, 'ms');
      console.log('🎬 [VIDEO_DOWNLOAD] Response status:', avatarResponse.status);
      console.log('🎬 [VIDEO_DOWNLOAD] Response status text:', avatarResponse.statusText);
      console.log('🎬 [VIDEO_DOWNLOAD] Response headers:', Object.fromEntries(avatarResponse.headers.entries()));
      console.log('🎬 [VIDEO_DOWNLOAD] Response URL:', avatarResponse.url);
      console.log('🎬 [VIDEO_DOWNLOAD] Response type:', avatarResponse.type);
      console.log('🎬 [VIDEO_DOWNLOAD] Response redirected:', avatarResponse.redirected);
      
      if (!avatarResponse.ok) {
        console.error('🎬 [VIDEO_DOWNLOAD] Response not OK!');
        console.error('🎬 [VIDEO_DOWNLOAD] Status:', avatarResponse.status);
        console.error('🎬 [VIDEO_DOWNLOAD] Status text:', avatarResponse.statusText);
        
        const errorText = await avatarResponse.text();
        console.error('🎬 [VIDEO_DOWNLOAD] Error response body:', errorText);
        
        throw new Error(`HTTP ${avatarResponse.status}: ${avatarResponse.statusText} - ${errorText}`);
      }
      
      console.log('🎬 [VIDEO_DOWNLOAD] Parsing JSON response...');
      const avatarData = await avatarResponse.json();
      console.log('🎬 [VIDEO_DOWNLOAD] Parsed response data:', avatarData);

      if (!avatarData.success) {
        console.error('🎬 [VIDEO_DOWNLOAD] API returned success: false');
        console.error('🎬 [VIDEO_DOWNLOAD] Error from API:', avatarData.error);
        throw new Error(avatarData.error || 'Failed to fetch avatars');
      }

      console.log('🎬 [VIDEO_DOWNLOAD] Avatar fetch successful! Starting video generation simulation...');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            console.log('🎬 [VIDEO_DOWNLOAD] Progress simulation completed (90%)');
            return 90;
          }
          const newProgress = prev + 10;
          console.log('🎬 [VIDEO_DOWNLOAD] Progress update:', newProgress + '%');
          return newProgress;
        });
      }, 500);

      // Simulate video generation (replace with actual implementation later)
      console.log('🎬 [VIDEO_DOWNLOAD] Simulating video generation (3 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);
      setStatus('completed');
      console.log('🎬 [VIDEO_DOWNLOAD] Video generation simulation completed successfully!');

      // Simulate success
      const downloadUrl = 'https://example.com/video.mp4';
      console.log('🎬 [VIDEO_DOWNLOAD] Calling onSuccess with download URL:', downloadUrl);
      onSuccess?.(downloadUrl);

    } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Video generation failed with error:', error);
      console.error('🎬 [VIDEO_DOWNLOAD] Error type:', typeof error);
      console.error('🎬 [VIDEO_DOWNLOAD] Error constructor:', error?.constructor?.name);
      console.error('🎬 [VIDEO_DOWNLOAD] Error stack:', (error as Error)?.stack);
      
      if (error instanceof Error) {
        console.error('🎬 [VIDEO_DOWNLOAD] Error message:', error.message);
        console.error('🎬 [VIDEO_DOWNLOAD] Error name:', error.name);
      }
      
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('🎬 [VIDEO_DOWNLOAD] Calling onError with message:', errorMessage);
      onError?.(errorMessage);
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
