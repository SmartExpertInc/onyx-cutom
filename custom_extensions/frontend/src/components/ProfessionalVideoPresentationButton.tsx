"use client";

// Professional Video Presentation Button Component
// This component creates professional video presentations by combining slide capture with avatar videos

import React, { useState } from 'react';
import { Video, Loader, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import AvatarSelector, { Avatar, AvatarVariant } from './AvatarSelector';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface ProfessionalVideoPresentationButtonProps {
  projectName?: string;
  onSuccess?: (downloadUrl: string) => void;
  onError?: (error: string) => void;
}

const ProfessionalVideoPresentationButton: React.FC<ProfessionalVideoPresentationButtonProps> = ({
  projectName = 'Professional Video Presentation',
  onSuccess,
  onError
}) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<AvatarVariant | undefined>(undefined);

  // Function to extract actual slide data from current project
  const extractSlideData = async (): Promise<{ slides: any[], theme: string, voiceoverTexts: string[] }> => {
    console.log('🎬 [PROFESSIONAL_VIDEO] Extracting slide data from current project...');
    
    try {
      // Try to get slide data from the global window object (if SmartSlideDeckViewer exposed it)
      const slideViewerData = (window as any).currentSlideData;
      if (slideViewerData?.deck?.slides) {
        console.log('🎬 [PROFESSIONAL_VIDEO] Found slide data in window object:', slideViewerData.deck.slides.length, 'slides');
        
        // Extract voiceover texts from slides
        const voiceoverTexts = slideViewerData.deck.slides
          .map((slide: any) => slide.voiceoverText || slide.props?.voiceoverText)
          .filter((text: string) => text && text.trim().length > 0);
        
        console.log('🎬 [PROFESSIONAL_VIDEO] Extracted voiceover texts:', voiceoverTexts);
        
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
        console.log('🎬 [PROFESSIONAL_VIDEO] Extracted project ID from URL:', projectId);
        
        // Fetch project data from API
        const response = await fetch(`/api/custom/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          console.log('🎬 [PROFESSIONAL_VIDEO] Fetched project data:', projectData);
          
          if (projectData.details?.slides) {
            // Extract voiceover texts from slides
            const voiceoverTexts = projectData.details.slides
              .map((slide: any) => slide.voiceoverText || slide.props?.voiceoverText)
              .filter((text: string) => text && text.trim().length > 0);
            
            console.log('🎬 [PROFESSIONAL_VIDEO] Extracted voiceover texts:', voiceoverTexts);
            
            return {
              slides: projectData.details.slides,
              theme: projectData.details.theme || 'dark-purple',
              voiceoverTexts: voiceoverTexts
            };
          }
        }
      }

      console.log('🎬 [PROFESSIONAL_VIDEO] Could not extract slide data');
      return { slides: [], theme: 'dark-purple', voiceoverTexts: [] };
      
    } catch (error) {
      console.error('🎬 [PROFESSIONAL_VIDEO] Error extracting slide data:', error);
      return { slides: [], theme: 'dark-purple', voiceoverTexts: [] };
    }
  };

  const handleAvatarSelect = (avatar: Avatar, variant?: AvatarVariant) => {
    setSelectedAvatar(avatar);
    setSelectedVariant(variant || undefined);
    console.log('🎬 [PROFESSIONAL_VIDEO] Avatar selected:', {
      avatar: avatar.name,
      variant: variant?.name,
      code: variant ? `${avatar.code}.${variant.code}` : avatar.code
    });
  };

  const handleCreatePresentation = async () => {
    if (!selectedAvatar) {
      onError?.('Please select an avatar first');
      return;
    }

    try {
      setStatus('generating');
      setProgress(0);

      console.log('🎬 [PROFESSIONAL_VIDEO] Starting professional video generation with selected avatar:', {
        avatar: selectedAvatar.name,
        variant: selectedVariant?.name,
        avatarCode: selectedVariant ? `${selectedAvatar.code}.${selectedVariant.code}` : selectedAvatar.code
      });

      // Extract slide data
      const slideData = await extractSlideData();
      
      if (!slideData.slides || slideData.slides.length === 0) {
        const errorMsg = 'No slide data found. Please make sure you have a slide open.';
        console.error('🎬 [PROFESSIONAL_VIDEO]', errorMsg);
        onError?.(errorMsg);
        return;
      }

      console.log('🎬 [PROFESSIONAL_VIDEO] Slide data extracted successfully');
      console.log('🎬 [PROFESSIONAL_VIDEO] Slides count:', slideData.slides.length);
      console.log('🎬 [PROFESSIONAL_VIDEO] Theme:', slideData.theme);

      // Create the request payload
      const requestPayload = {
        projectName: projectName,
        voiceoverTexts: slideData.voiceoverTexts.length > 0 ? slideData.voiceoverTexts : [
          "Welcome to this professional presentation. We'll be exploring key concepts and insights that will help you understand the material better."
        ],  // Use actual voiceover texts or fallback
        slidesData: slideData.slides,  // Add the extracted slide data
        theme: slideData.theme,  // Use the extracted theme
        avatarCode: selectedVariant ? `${selectedAvatar.code}.${selectedVariant.code}` : selectedAvatar.code,
        avatarData: selectedVariant ? { ...selectedAvatar, selectedVariant } : selectedAvatar,  // Send avatar data with complete variant information
        useAvatarMask: true,
        layout: 'picture_in_picture',
        duration: 30.0,
        quality: 'high',
        resolution: [1920, 1080]
      };

      console.log('🎬 [PROFESSIONAL_VIDEO] Request payload:', requestPayload);

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
      console.log('🎬 [PROFESSIONAL_VIDEO] Presentation job created:', newJobId);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${newJobId}`, {
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
            
            console.log('🎬 [PROFESSIONAL_VIDEO] Job progress:', currentProgress);

            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              setStatus('completed');
              setProgress(100);
              console.log('🎬 [PROFESSIONAL_VIDEO] Video generation completed');
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              setStatus('error');
              throw new Error(statusData.error || 'Video generation failed');
            }
          } else {
            throw new Error(statusData.error || 'Status check failed');
          }
        } catch (error) {
          console.error('🎬 [PROFESSIONAL_VIDEO] Status check error:', error);
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
      console.error('🎬 [PROFESSIONAL_VIDEO] Video generation failed:', error);
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMsg);
    }
  };

  const handleDownloadVideo = async () => {
    if (!jobId) return;
    
    try {
      console.log('🎬 [PROFESSIONAL_VIDEO] Downloading video for job:', jobId);
      
      const downloadResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${jobId}/video`, {
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
      
      console.log('🎬 [PROFESSIONAL_VIDEO] Video downloaded successfully');
      onSuccess?.(url);
      
    } catch (error) {
      console.error('🎬 [PROFESSIONAL_VIDEO] Download failed:', error);
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
        return `${baseClasses} text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 disabled:opacity-60`;
      case 'completed':
        return `${baseClasses} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`;
      case 'error':
        return `${baseClasses} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      default:
        return `${baseClasses} text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500`;
    }
  };

  return (
    <div className="space-y-4">
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

      {/* Main Video Generation Button */}
      <button
        onClick={status === 'completed' ? handleDownloadVideo : handleCreatePresentation}
        disabled={status === 'generating' || (!selectedAvatar && status !== 'completed')}
        className={getButtonClassName()}
        title={
          !selectedAvatar && status !== 'completed'
            ? 'Please select an avatar first'
            : status === 'generating' 
              ? 'Professional video generation in progress...' 
              : status === 'completed'
                ? 'Download the generated video'
                : 'Create professional video with slide capture and AI avatar'
        }
      >
        {status === 'completed' ? <Download size={16} className="mr-2" /> : getButtonIcon()}
        {getButtonText()}
      </button>
      
      {/* Progress Bar */}
      {status === 'generating' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Status Messages */}
      {status === 'completed' && (
        <div className="text-sm text-green-600">
          ✅ Professional video presentation created successfully! Click the button above to download.
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-sm text-red-600">
          ❌ Failed to create professional video presentation. Please try again.
        </div>
      )}
    </div>
  );
};

export default ProfessionalVideoPresentationButton;
