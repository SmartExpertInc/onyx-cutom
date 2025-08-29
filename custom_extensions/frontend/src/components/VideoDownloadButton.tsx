// custom_extensions/frontend/src/components/VideoDownloadButton.tsx

import React, { useState } from 'react';
import { Video, Loader, CheckCircle, AlertTriangle, Image } from 'lucide-react';
import SlideImageDownloadButton from './SlideImageDownloadButton';
import StandaloneSlideImageButton from './StandaloneSlideImageButton';
import HtmlPreviewButton from './HtmlPreviewButton';
import SlideVideoButton from './SlideVideoButton';
import AvatarSelector, { Avatar, AvatarVariant } from './AvatarSelector';

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
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<AvatarVariant | undefined>(undefined);

    // Function to extract actual slide data from current project
  const extractSlideData = async (): Promise<{ slides: any[], theme: string, voiceoverTexts: string[] }> => {
    console.log('🎬 [VIDEO_DOWNLOAD] Extracting slide data from current project...');
    
    try {
      // Try to get slide data from the global window object (if SmartSlideDeckViewer exposed it)
      const slideViewerData = (window as any).currentSlideData;
      if (slideViewerData?.deck?.slides) {
        console.log('🎬 [VIDEO_DOWNLOAD] Found slide data in window object:', slideViewerData.deck.slides.length, 'slides');
        
        // Extract voiceover texts from slides
        const voiceoverTexts = slideViewerData.deck.slides
          .map((slide: any) => slide.voiceoverText || slide.props?.voiceoverText)
          .filter((text: string) => text && text.trim().length > 0);
        
        console.log('🎬 [VIDEO_DOWNLOAD] Extracted voiceover texts:', voiceoverTexts);
        
        return {
          slides: slideViewerData.deck.slides,
          theme: slideViewerData.deck.theme || 'dark-purple',
          voiceoverTexts: voiceoverTexts
        };
      }

      // Fallback: Try to extract from the URL by getting project ID and fetching data
      const currentUrl = window.location.href;
      const projectIdMatch = currentUrl.match(/\/projects\/view\/(\d+)/);
      
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        console.log('🎬 [VIDEO_DOWNLOAD] Extracted project ID from URL:', projectId);
        
        // Fetch project data from API
        const response = await fetch(`/api/custom/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          console.log('🎬 [VIDEO_DOWNLOAD] Fetched project data:', projectData);
          
          if (projectData.details?.slides) {
            // Extract voiceover texts from slides
            const voiceoverTexts = projectData.details.slides
              .map((slide: any) => slide.voiceoverText || slide.props?.voiceoverText)
              .filter((text: string) => text && text.trim().length > 0);
            
            console.log('🎬 [VIDEO_DOWNLOAD] Extracted voiceover texts:', voiceoverTexts);
            
            return {
              slides: projectData.details.slides,
              theme: projectData.details.theme || 'dark-purple',
              voiceoverTexts: voiceoverTexts
            };
          }
        }
      }

      console.log('🎬 [VIDEO_DOWNLOAD] Could not extract slide data');
      return { slides: [], theme: 'dark-purple', voiceoverTexts: [] };
        
      } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Error extracting slide data:', error);
      return { slides: [], theme: 'dark-purple', voiceoverTexts: [] };
    }
  };

  const handleAvatarSelect = (avatar: Avatar, variant?: AvatarVariant) => {
    setSelectedAvatar(avatar);
    setSelectedVariant(variant || undefined);
    console.log('🎬 [VIDEO_DOWNLOAD] Avatar selected:', {
      avatar: avatar.name,
      variant: variant?.name,
      code: variant ? `${avatar.code}.${variant.code}` : avatar.code
    });
  };

  const handleDownloadVideo = async () => {
    if (!selectedAvatar) {
      onError?.('Please select an avatar first');
      return;
    }

    try {
      setStatus('generating');
      setProgress(0);

      console.log('🎬 [VIDEO_DOWNLOAD] Starting video generation with selected avatar:', {
        avatar: selectedAvatar.name,
        variant: selectedVariant?.name,
        avatarCode: selectedVariant ? `${selectedAvatar.code}.${selectedVariant.code}` : selectedAvatar.code
      });

      // Extract slide data
      const slideData = await extractSlideData();
      
      if (!slideData.slides || slideData.slides.length === 0) {
        const errorMsg = 'No slide data found. Please make sure you have a slide open.';
        console.error('🎬 [VIDEO_DOWNLOAD]', errorMsg);
        onError?.(errorMsg);
        return;
      }

      console.log('🎬 [VIDEO_DOWNLOAD] Slide data extracted successfully');
      console.log('🎬 [VIDEO_DOWNLOAD] Slides count:', slideData.slides.length);
      console.log('🎬 [VIDEO_DOWNLOAD] Theme:', slideData.theme);

      // Create the request payload
      const requestPayload = {
        projectName: projectName || 'Generated Video',
        voiceoverTexts: slideData.voiceoverTexts.length > 0 ? slideData.voiceoverTexts : [
          "Welcome to this professional presentation. We'll be exploring key concepts and insights that will help you understand the material better."
        ],  // Use actual voiceover texts or fallback
        slidesData: slideData.slides,  // Add the extracted slide data
        theme: slideData.theme,  // Use the extracted theme
        avatarCode: selectedVariant ? `${selectedAvatar.code}.${selectedVariant.code}` : selectedAvatar.code,
        useAvatarMask: true,
        layout: 'picture_in_picture',
        duration: 30.0,
        quality: 'high',
        resolution: [1920, 1080]
      };

      console.log('🎬 [VIDEO_DOWNLOAD] Request payload:', requestPayload);

      // Create presentation
      const createResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(requestPayload)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create presentation: ${createResponse.status} - ${errorText}`);
      }

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create presentation');
      }

      const newJobId = createData.jobId;
      setJobId(newJobId);
      console.log('🎬 [VIDEO_DOWNLOAD] Presentation job created:', newJobId);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/custom/presentations/${newJobId}`, {
            method: 'GET',
            credentials: 'same-origin',
          });

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          const statusData = await statusResponse.json();
          
          if (statusData.success) {
            const currentProgress = statusData.progress || 0;
            setProgress(currentProgress);
            
            console.log('🎬 [VIDEO_DOWNLOAD] Job progress:', currentProgress);

            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              setStatus('completed');
       setProgress(100);
              console.log('🎬 [VIDEO_DOWNLOAD] Video generation completed');
              
              // Auto-download the video
              await downloadVideo(newJobId);
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              setStatus('error');
              throw new Error(statusData.error || 'Video generation failed');
            }
          } else {
            throw new Error(statusData.error || 'Status check failed');
          }
        } catch (error) {
          console.error('🎬 [VIDEO_DOWNLOAD] Status check error:', error);
          clearInterval(pollInterval);
          setStatus('error');
          onError?.(error instanceof Error ? error.message : 'Status check failed');
        }
      }, 2000);

      // Set a timeout to stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (status === 'generating') {
          setStatus('error');
          onError?.('Video generation timed out. Please check the status manually.');
        }
      }, 300000);

    } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Video generation failed:', error);
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMsg);
    }
  };

  const downloadVideo = async (jobId: string) => {
    try {
      console.log('🎬 [VIDEO_DOWNLOAD] Downloading video for job:', jobId);
      
      const downloadResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/custom/presentations/${jobId}/video`, {
         method: 'GET',
        headers: {
          'Accept': 'video/mp4',
        },
         credentials: 'same-origin',
       });
       
      if (!downloadResponse.ok) {
        throw new Error(`Download failed: ${downloadResponse.status}`);
      }

      // Create blob and download
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `professional_presentation_${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('🎬 [VIDEO_DOWNLOAD] Video downloaded successfully');
      onSuccess?.(url);
       
     } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Download failed:', error);
      onError?.(error instanceof Error ? error.message : 'Download failed');
     }
   };

   const getButtonText = () => {
    switch (status) {
      case 'generating':
        return `Creating Professional Video... ${progress}%`;
             case 'completed':
        return 'Professional Video Ready';
      case 'error':
        return 'Generation Failed - Try Again';
      default:
        return 'Create Professional Video';
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
    <div className="flex flex-col gap-4">
      {/* Avatar Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select AI Avatar
        </label>
        <AvatarSelector
          onAvatarSelect={handleAvatarSelect}
          selectedAvatar={selectedAvatar}
          selectedVariant={selectedVariant}
          className="w-full"
        />
        {selectedAvatar && (
          <p className="text-xs text-gray-500">
            Selected: {selectedAvatar.name}
            {selectedVariant && ` - ${selectedVariant.name}`}
          </p>
        )}
      </div>

      {/* Debug Buttons */}
      <div className="flex flex-col gap-2">
        {/* HTML Preview Button - Always available for debugging */}
        <HtmlPreviewButton
          projectName={projectName}
          onError={onError}
          onSuccess={onSuccess}
          className="text-xs py-1"
        />
        
        {/* Standalone Slide Image Button - Always available */}
        <StandaloneSlideImageButton
          projectName={projectName}
          onError={onError}
          onSuccess={onSuccess}
          className="text-xs py-1"
        />
        
        {/* Slide-Only Video Button - Always available */}
        <SlideVideoButton
          projectName={projectName}
          onError={onError}
          onSuccess={onSuccess}
          className="text-xs py-1"
        />
      </div>

      {/* Main Video Generation Button */}
    <button
      onClick={handleDownloadVideo}
        disabled={status === 'generating' || !selectedAvatar}
      className={getButtonClassName()}
      title={
          !selectedAvatar 
            ? 'Please select an avatar first'
            : status === 'generating' 
          ? 'Professional video generation in progress...' 
          : 'Create professional video with slide capture and AI avatar'
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
      
      {/* Progress Bar */}
      {status === 'generating' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Slide Image Download Button - Only show when job is completed */}
      {status === 'completed' && jobId && (
        <SlideImageDownloadButton
          jobId={jobId}
          className="text-xs py-1"
        />
      )}
    </div>
  );
};
