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

  // Function to extract voiceover text from slides
  const extractVoiceoverTexts = async (): Promise<string[]> => {
    console.log('🎬 [VIDEO_DOWNLOAD] Extracting voiceover texts from DOM...');
    
    const voiceoverTexts: string[] = [];
    
    // Find all voiceover elements on the page
    const voiceoverElements = document.querySelectorAll('[data-voiceover-text], .voiceover-text, .slide-voiceover');
    
    console.log('🎬 [VIDEO_DOWNLOAD] Found voiceover elements:', voiceoverElements.length);
    
    voiceoverElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        voiceoverTexts.push(text);
        console.log(`🎬 [VIDEO_DOWNLOAD] Voiceover ${index + 1}:`, text.substring(0, 100) + '...');
      }
    });

    // If no voiceover elements found, try to extract from slide content
    if (voiceoverTexts.length === 0) {
      console.log('🎬 [VIDEO_DOWNLOAD] No voiceover elements found, extracting from slide content...');
      
      const slideElements = document.querySelectorAll('.slide-content, .real-slide, [data-slide-id]');
      
      slideElements.forEach((slideElement, index) => {
        // Extract text content from slide
        const slideText = slideElement.textContent?.trim();
        if (slideText && slideText.length > 10) { // Only include slides with substantial content
          voiceoverTexts.push(slideText);
          console.log(`🎬 [VIDEO_DOWNLOAD] Slide ${index + 1} content:`, slideText.substring(0, 100) + '...');
        }
      });
    }

    return voiceoverTexts;
  };

  // Function to monitor rendering progress
  const monitorRenderingProgress = async (videoId: string, onProgressUpdate: (progress: number) => void): Promise<string> => {
    console.log('🎬 [VIDEO_DOWNLOAD] Starting to monitor rendering progress for video:', videoId);
    
    const maxWaitTime = 15 * 60 * 1000; // 15 minutes
    const checkInterval = 5000; // Check every 5 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const statusResponse = await fetch(`${CUSTOM_BACKEND_URL}/video/status/${videoId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
        });

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        console.log('🎬 [VIDEO_DOWNLOAD] Status check response:', statusData);

        if (!statusData.success) {
          throw new Error(statusData.error || 'Status check failed');
        }

        const status = statusData.status;
        const progress = statusData.progress || 0;

        console.log('🎬 [VIDEO_DOWNLOAD] Video status:', status, 'Progress:', progress + '%');
        onProgressUpdate(progress);

        if (status === 'rendered' || status === 'ready') {
          console.log('🎬 [VIDEO_DOWNLOAD] Video rendering completed!');
          return statusData.downloadUrl || statusData.videoUrl || '';
        }

        if (status === 'failed' || status === 'error') {
          throw new Error(statusData.error || 'Video rendering failed');
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        
      } catch (error) {
        console.error('🎬 [VIDEO_DOWNLOAD] Error checking video status:', error);
        throw error;
      }
    }

    throw new Error('Video rendering timeout after 15 minutes');
  };

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

      console.log('🎬 [VIDEO_DOWNLOAD] Avatar fetch successful! Starting actual video generation...');
      
      // Step 1: Extract voiceover text from slides
      console.log('🎬 [VIDEO_DOWNLOAD] Step 1: Extracting voiceover text from slides...');
      setProgress(10);
      
      const voiceoverTexts = await extractVoiceoverTexts();
      console.log('🎬 [VIDEO_DOWNLOAD] Extracted voiceover texts:', voiceoverTexts);
      
      if (!voiceoverTexts || voiceoverTexts.length === 0) {
        throw new Error('No voiceover text found in slides');
      }

      // Step 2: Create video with Elai API
      console.log('🎬 [VIDEO_DOWNLOAD] Step 2: Creating video with Elai API...');
      setProgress(20);
      
      const createVideoResponse = await fetch(`${CUSTOM_BACKEND_URL}/video/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          projectName: projectName || 'Generated Video',
          voiceoverTexts: voiceoverTexts,
          avatarCode: avatarData.avatars[0]?.code || 'gia.casual' // Use first avatar as default
        })
      });

      if (!createVideoResponse.ok) {
        const errorText = await createVideoResponse.text();
        throw new Error(`Failed to create video: ${createVideoResponse.status} - ${errorText}`);
      }

      const createVideoData = await createVideoResponse.json();
      console.log('🎬 [VIDEO_DOWNLOAD] Video creation response:', createVideoData);

      if (!createVideoData.success) {
        throw new Error(createVideoData.error || 'Failed to create video');
      }

      const videoId = createVideoData.videoId;
      console.log('🎬 [VIDEO_DOWNLOAD] Video created with ID:', videoId);

      // Step 3: Start rendering
      console.log('🎬 [VIDEO_DOWNLOAD] Step 3: Starting video rendering...');
      setProgress(30);
      
      const renderResponse = await fetch(`${CUSTOM_BACKEND_URL}/video/render/${videoId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!renderResponse.ok) {
        const errorText = await renderResponse.text();
        throw new Error(`Failed to start rendering: ${renderResponse.status} - ${errorText}`);
      }

      const renderData = await renderResponse.json();
      console.log('🎬 [VIDEO_DOWNLOAD] Render response:', renderData);

      if (!renderData.success) {
        throw new Error(renderData.error || 'Failed to start rendering');
      }

      // Step 4: Monitor rendering progress
      console.log('🎬 [VIDEO_DOWNLOAD] Step 4: Monitoring rendering progress...');
      setProgress(40);
      
      const downloadUrl = await monitorRenderingProgress(videoId, (progressPercent) => {
        // Update progress from 40% to 90% based on rendering progress
        const newProgress = 40 + (progressPercent * 0.5); // 40% to 90%
        setProgress(newProgress);
        console.log('🎬 [VIDEO_DOWNLOAD] Rendering progress:', progressPercent + '%');
      });

      // Step 5: Complete
      console.log('🎬 [VIDEO_DOWNLOAD] Step 5: Video generation completed!');
      setProgress(100);
      setStatus('completed');
      console.log('🎬 [VIDEO_DOWNLOAD] Final download URL:', downloadUrl);
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
