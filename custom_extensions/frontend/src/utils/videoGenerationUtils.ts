// custom_extensions/frontend/src/utils/videoGenerationUtils.ts

import { Avatar, AvatarVariant } from '../components/AvatarSelector';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

export interface VideoGenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  jobId: string | null;
  errorMessage?: string;
}

export interface SlideData {
  slides: any[];
  theme: string;
  voiceoverTexts: string[];
}

// Function to extract actual slide data from current project
export const extractSlideData = async (): Promise<SlideData> => {
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

export const startVideoGeneration = async (
  projectName: string,
  selectedAvatar: Avatar,
  selectedVariant: AvatarVariant | undefined,
  onProgress: (progress: number) => void,
  onStatusChange: (status: VideoGenerationState['status']) => void,
  onError: (error: string) => void,
  onJobCreated: (jobId: string) => void,
  onSuccess: (jobId: string) => void
): Promise<void> => {
  try {
    onStatusChange('generating');
    onProgress(0);

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
      onError(errorMsg);
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
    console.log('🎬 [VIDEO_DOWNLOAD] Presentation job created:', newJobId);

    // Notify that job was created
    onJobCreated(newJobId);

    // Start polling for completion
    pollForCompletion(newJobId, onProgress, onStatusChange, onError, onSuccess);

  } catch (error) {
    console.error('🎬 [VIDEO_DOWNLOAD] Video generation failed:', error);
    onStatusChange('error');
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    onError(errorMsg);
  }
};

const pollForCompletion = async (
  jobId: string,
  onProgress: (progress: number) => void,
  onStatusChange: (status: VideoGenerationState['status']) => void,
  onError: (error: string) => void,
  onSuccess: (jobId: string) => void
) => {
  const pollInterval = setInterval(async () => {
    try {
      const statusResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${jobId}`, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        const currentProgress = statusData.progress || 0;
        onProgress(currentProgress);
        
        console.log('🎬 [VIDEO_DOWNLOAD] Job progress:', currentProgress);
        
        if (statusData.status === 'completed') {
          clearInterval(pollInterval);
          onStatusChange('completed');
          onProgress(100);
          console.log('🎬 [VIDEO_DOWNLOAD] Video generation completed');
          onSuccess(jobId);
        } else if (statusData.status === 'failed') {
          clearInterval(pollInterval);
          onStatusChange('error');
          throw new Error(statusData.error || 'Video generation failed');
        }
      } else {
        throw new Error(statusData.error || 'Status check failed');
      }
    } catch (error) {
      console.error('🎬 [VIDEO_DOWNLOAD] Status check error:', error);
      clearInterval(pollInterval);
      onStatusChange('error');
      onError(error instanceof Error ? error.message : 'Status check failed');
    }
  }, 2000);

  // Set a timeout to stop polling after 10 minutes
  setTimeout(() => {
    clearInterval(pollInterval);
    onStatusChange('error');
    onError('Video generation timed out after 10 minutes. This may indicate a backend issue. Please check the status manually.');
  }, 600000);
};

export const downloadVideo = async (jobId: string): Promise<string> => {
  try {
    console.log('🎬 [VIDEO_DOWNLOAD] Downloading video for job:', jobId);
    
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
    
    console.log('🎬 [VIDEO_DOWNLOAD] Video downloaded successfully');
    return url;
     
   } catch (error) {
    console.error('🎬 [VIDEO_DOWNLOAD] Download failed:', error);
    throw error;
   }
};
