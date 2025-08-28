"use client";

import React, { useState } from 'react';
import { Video, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface SlideVideoButtonProps {
  projectName?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  className?: string;
}

const SlideVideoButton: React.FC<SlideVideoButtonProps> = ({
  projectName,
  onError,
  onSuccess,
  className = ''
}) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [jobId, setJobId] = useState<string | null>(null);

  // Function to extract actual slide data from current project
  const extractSlideData = async (): Promise<{ slides: any[], theme: string }> => {
    console.log('🎬 [SLIDE_VIDEO] Extracting slide data from current project...');
    
    try {
      // Try to get slide data from the global window object (if SmartSlideDeckViewer exposed it)
      const slideViewerData = (window as any).currentSlideData;
      if (slideViewerData?.deck?.slides) {
        console.log('🎬 [SLIDE_VIDEO] Found slide data in window object:', slideViewerData.deck.slides.length, 'slides');
        return {
          slides: slideViewerData.deck.slides,
          theme: slideViewerData.deck.theme || 'dark-purple'
        };
      }

      // Fallback: Try to extract from the URL by getting project ID and fetching data
      const currentUrl = window.location.href;
      const projectIdMatch = currentUrl.match(/\/projects\/view\/(\d+)/);
      
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        console.log('🎬 [SLIDE_VIDEO] Extracted project ID from URL:', projectId);
        
        // Fetch project data from API
        const response = await fetch(`/api/custom/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          console.log('🎬 [SLIDE_VIDEO] Fetched project data:', projectData);
          
          if (projectData.details?.slides) {
            return {
              slides: projectData.details.slides,
              theme: projectData.details.theme || 'dark-purple'
            };
          }
        }
      }

      console.log('🎬 [SLIDE_VIDEO] Could not extract slide data');
      return { slides: [], theme: 'dark-purple' };
      
    } catch (error) {
      console.error('🎬 [SLIDE_VIDEO] Error extracting slide data:', error);
      return { slides: [], theme: 'dark-purple' };
    }
  };

  const checkJobStatus = async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🎬 [SLIDE_VIDEO] Job status:', result);

      if (result.status === 'completed') {
        setStatus('completed');
        onSuccess?.(`Slide-only video generated successfully! Job ID: ${jobId}`);
        return true;
      } else if (result.status === 'failed') {
        setStatus('failed');
        onError?.(result.error || 'Video generation failed');
        return true;
      }

      return false;
    } catch (error) {
      console.error('🎬 [SLIDE_VIDEO] Error checking job status:', error);
      return false;
    }
  };

  const downloadVideo = async (jobId: string) => {
    try {
      console.log('🎬 [SLIDE_VIDEO] Downloading video for job:', jobId);
      
      const downloadUrl = `${CUSTOM_BACKEND_URL}/presentations/${jobId}/video`;
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slide_video_${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('🎬 [SLIDE_VIDEO] Video downloaded successfully');
      onSuccess?.('Video downloaded successfully!');
      
    } catch (error) {
      console.error('🎬 [SLIDE_VIDEO] Download error:', error);
      onError?.(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateVideo = async () => {
    try {
      setStatus('generating');
      console.log('🎬 [SLIDE_VIDEO] Starting slide-only video generation...');

      // Extract slide data
      const slideData = await extractSlideData();
      
      if (!slideData.slides || slideData.slides.length === 0) {
        const errorMsg = 'No slide data found. Please make sure you have a slide open.';
        console.error('🎬 [SLIDE_VIDEO]', errorMsg);
        setStatus('failed');
        onError?.(errorMsg);
        return;
      }

      console.log('🎬 [SLIDE_VIDEO] Slide data extracted successfully');
      console.log('🎬 [SLIDE_VIDEO] Slides count:', slideData.slides.length);
      console.log('🎬 [SLIDE_VIDEO] Theme:', slideData.theme);

      // Prepare request payload
      const requestPayload = {
        slides: slideData.slides,
        theme: slideData.theme
      };

      console.log('🎬 [SLIDE_VIDEO] Request payload:', requestPayload);

      // Call the slide-only video generation endpoint
      const response = await fetch(`${CUSTOM_BACKEND_URL}/slide-video/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Video generation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start video generation');
      }

      const jobId = result.jobId;
      setJobId(jobId);
      console.log('🎬 [SLIDE_VIDEO] Video generation started with job ID:', jobId);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const isComplete = await checkJobStatus(jobId);
        if (isComplete) {
          clearInterval(pollInterval);
          // Auto-download the video
          await downloadVideo(jobId);
        }
      }, 2000); // Check every 2 seconds

      // Set a timeout to stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (status === 'generating') {
          setStatus('failed');
          onError?.('Video generation timed out. Please check the status manually.');
        }
      }, 300000); // 5 minutes

    } catch (error) {
      console.error('🎬 [SLIDE_VIDEO] Video generation failed:', error);
      setStatus('failed');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMsg);
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'generating':
        return 'Generating Slide Video...';
      case 'completed':
        return '✅ Video Generated';
      case 'failed':
        return '❌ Generation Failed';
      default:
        return '🎬 Generate Slide Video';
    }
  };

  const getButtonIcon = () => {
    switch (status) {
      case 'generating':
        return <Loader size={16} className="mr-2 animate-spin" />;
      case 'completed':
        return <CheckCircle size={16} className="mr-2" />;
      case 'failed':
        return <AlertTriangle size={16} className="mr-2" />;
      default:
        return <Video size={16} className="mr-2" />;
    }
  };

  const getButtonClassName = () => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center transition-colors";
    
    switch (status) {
      case 'generating':
        return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-60 ${className}`;
      case 'completed':
        return `${baseClasses} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 ${className}`;
      case 'failed':
        return `${baseClasses} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 ${className}`;
      default:
        return `${baseClasses} text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 ${className}`;
    }
  };

  return (
    <button
      onClick={handleGenerateVideo}
      disabled={status === 'generating'}
      className={getButtonClassName()}
      title={
        status === 'generating' 
          ? 'Slide-only video generation in progress...' 
          : 'Generate video from slide image only (no AI avatar)'
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
  );
};

export default SlideVideoButton;
