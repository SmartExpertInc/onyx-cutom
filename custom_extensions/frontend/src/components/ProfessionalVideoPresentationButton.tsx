// Professional Video Presentation Button Component
// This component creates professional video presentations by combining slide capture with avatar videos

import React, { useState } from 'react';
import { Video, Loader, CheckCircle, AlertTriangle, Download } from 'lucide-react';

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

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Function to extract voiceover texts from slides
  const extractVoiceoverTexts = async (): Promise<string[]> => {
    console.log('🎬 [PROFESSIONAL_VIDEO] Extracting voiceover texts from DOM...');
    
    const voiceoverElements = document.querySelectorAll('[data-voiceover], .voiceover-text, [class*="voiceover"]');
    console.log('🎬 [PROFESSIONAL_VIDEO] Found voiceover elements:', voiceoverElements.length);
    
    if (voiceoverElements.length > 0) {
      const texts: string[] = [];
      voiceoverElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 10) {
          texts.push(text);
          console.log(`🎬 [PROFESSIONAL_VIDEO] Voiceover ${index + 1}:`, text.substring(0, 100) + '...');
        }
      });
      return texts;
    }
    
    // Fallback: extract from slide titles and content
    console.log('🎬 [PROFESSIONAL_VIDEO] No voiceover elements found, extracting from slide content...');
    const slideTitles = document.querySelectorAll('h1, h2, h3, .slide-title, [class*="title"]');
    const texts: string[] = [];
    
    slideTitles.forEach((titleElement, index) => {
      const title = titleElement.textContent?.trim();
      if (title && title.length > 10) {
        // Filter out problematic titles
        if (!title.toLowerCase().includes('voiceover') && 
            !title.toLowerCase().includes('presentation themes') &&
            !/[\u0400-\u04FF]/.test(title)) { // Filter out Cyrillic characters
          texts.push(title);
          console.log(`🎬 [PROFESSIONAL_VIDEO] Slide title ${index + 1}:`, title);
        } else {
          console.log(`🎬 [PROFESSIONAL_VIDEO] Skipping problematic title:`, title);
        }
      }
    });
    
    console.log('🎬 [PROFESSIONAL_VIDEO] Final extracted voiceover texts:', texts);
    return texts;
  };

  // Function to get current slide URL
  const getCurrentSlideUrl = (): string => {
    // Return the current page URL for slide capture
    return window.location.href;
  };

  // Function to monitor presentation progress
  const monitorPresentationProgress = async (
    jobId: string, 
    onProgressUpdate: (progress: number) => void
  ): Promise<string> => {
    console.log('🎬 [PROFESSIONAL_VIDEO] Starting to monitor presentation progress for job:', jobId);
    
    const maxWaitTime = 30 * 60 * 1000; // 30 minutes for professional processing
    const checkInterval = 10000; // Check every 10 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const statusResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations/${jobId}`, {
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
        console.log('🎬 [PROFESSIONAL_VIDEO] Status check response:', statusData);

        if (!statusData.success) {
          throw new Error(statusData.error || 'Status check failed');
        }

        const jobStatus = statusData.status;
        const jobProgress = statusData.progress || 0;
        const videoUrl = statusData.videoUrl;

        console.log('🎬 [PROFESSIONAL_VIDEO] Job status:', jobStatus, 'Progress:', jobProgress + '%');
        
        // Update progress
        onProgressUpdate(jobProgress);

        if (jobStatus === 'completed' && videoUrl) {
          console.log('🎬 [PROFESSIONAL_VIDEO] Presentation generation completed!');
          return videoUrl;
        }

        if (jobStatus === 'failed') {
          throw new Error(statusData.error || 'Presentation generation failed');
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        
      } catch (error) {
        console.error('🎬 [PROFESSIONAL_VIDEO] Error checking presentation status:', error);
        throw error;
      }
    }

    throw new Error('Presentation generation timeout after 30 minutes');
  };

  const handleCreatePresentation = async () => {
    try {
      console.log('🎬 [PROFESSIONAL_VIDEO] Starting professional video presentation generation...');
      
      setStatus('generating');
      setProgress(0);

      // Step 1: Extract voiceover text from slides
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 1: Extracting voiceover text from slides...');
      setProgress(10);
      
      const voiceoverTexts = await extractVoiceoverTexts();
      console.log('🎬 [PROFESSIONAL_VIDEO] Extracted voiceover texts:', voiceoverTexts);
      
      if (!voiceoverTexts || voiceoverTexts.length === 0) {
        throw new Error('No voiceover text found in slides');
      }

      // Step 2: Get current slide URL
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 2: Getting current slide URL...');
      setProgress(20);
      
      const slideUrl = getCurrentSlideUrl();
      console.log('🎬 [PROFESSIONAL_VIDEO] Slide URL:', slideUrl);

      // Step 3: Create professional presentation
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 3: Creating professional presentation...');
      setProgress(30);
      
      const createResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          slideUrl: slideUrl,
          voiceoverTexts: voiceoverTexts,
          // avatarCode removed - will auto-select available avatar
          duration: 30.0,
          layout: 'side_by_side', // side_by_side, picture_in_picture, split_screen
          quality: 'high',
          resolution: [1920, 1080],
          projectName: projectName
        })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create presentation: ${createResponse.status} - ${errorText}`);
      }

      const createData = await createResponse.json();
      console.log('🎬 [PROFESSIONAL_VIDEO] Presentation creation response:', createData);

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create presentation');
      }

      const presentationJobId = createData.jobId;
      setJobId(presentationJobId);
      console.log('🎬 [PROFESSIONAL_VIDEO] Presentation job created with ID:', presentationJobId);

      // Step 4: Monitor presentation progress
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 4: Monitoring presentation progress...');
      setProgress(40);
      
      const videoUrl = await monitorPresentationProgress(presentationJobId, (progressPercent) => {
        // Update progress from 40% to 90% based on processing progress
        const newProgress = 40 + (progressPercent * 0.5); // 40% to 90%
        setProgress(newProgress);
        console.log('🎬 [PROFESSIONAL_VIDEO] Processing progress:', progressPercent + '%');
      });

      // Step 5: Complete
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 5: Professional presentation generation completed!');
      setProgress(100);
      setStatus('completed');
      console.log('🎬 [PROFESSIONAL_VIDEO] Final video URL:', videoUrl);
      onSuccess?.(videoUrl);

    } catch (error) {
      console.error('🎬 [PROFESSIONAL_VIDEO] Professional presentation generation failed with error:', error);
      
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('🎬 [PROFESSIONAL_VIDEO] Calling onError with message:', errorMessage);
      onError?.(errorMessage);
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
      <button
        onClick={status === 'completed' ? handleDownloadVideo : handleCreatePresentation}
        disabled={status === 'generating'}
        className={getButtonClassName()}
      >
        {status === 'completed' ? <Download size={16} className="mr-2" /> : getButtonIcon()}
        {getButtonText()}
      </button>
      
      {status === 'generating' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
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
