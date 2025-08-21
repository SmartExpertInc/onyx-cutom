// Professional Video Presentation Button Component
// This component creates professional video presentations by combining slide capture with avatar videos

import React, { useState, useEffect } from 'react';
import { Video, Loader, CheckCircle, AlertTriangle, Download, Eye } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface ProfessionalVideoPresentationButtonProps {
  projectName?: string;
  onError?: (error: string) => void;
  onSuccess?: (jobId: string, videoUrl: string) => void;
  onProgress?: (progress: number, status: string) => void;
}

interface PresentationJob {
  jobId: string;
  status: string;
  progress: number;
  error?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  completedAt?: string;
}

export const ProfessionalVideoPresentationButton: React.FC<ProfessionalVideoPresentationButtonProps> = ({
  projectName,
  onError,
  onSuccess,
  onProgress
}) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<PresentationJob | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Function to extract voiceover text from slides
  const extractVoiceoverTexts = async (): Promise<string[]> => {
    console.log('🎬 [PROFESSIONAL_VIDEO] Extracting voiceover texts from DOM...');
    
    const voiceoverTexts: string[] = [];
    
    // Method 1: Look for specific voiceover text attributes
    const voiceoverElements = document.querySelectorAll('[data-voiceover-text], .voiceover-text, .slide-voiceover');
    console.log('🎬 [PROFESSIONAL_VIDEO] Found voiceover elements:', voiceoverElements.length);
    
    voiceoverElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 1000) {
        const cleanText = text.replace(/\s+/g, ' ').trim();
        if (cleanText.length > 10) {
          voiceoverTexts.push(cleanText);
          console.log(`🎬 [PROFESSIONAL_VIDEO] Voiceover ${index + 1}:`, cleanText.substring(0, 100) + '...');
        }
      }
    });

    // Method 2: If no voiceover elements found, try to extract from slide titles and content
    if (voiceoverTexts.length === 0) {
      console.log('🎬 [PROFESSIONAL_VIDEO] No voiceover elements found, extracting from slide content...');
      
      const slideTitles = document.querySelectorAll('h1, h2, h3, .slide-title, [data-slide-title]');
      const slideContent = document.querySelectorAll('.slide-content, .real-slide, [data-slide-id]');
      
      // Extract from titles first
      slideTitles.forEach((titleElement, index) => {
        const titleText = titleElement.textContent?.trim();
        if (titleText && titleText.length > 5 && titleText.length < 200) {
          const cleanTitle = titleText.replace(/\s+/g, ' ').trim();
          
          // Filter out problematic titles
          const lowerTitle = cleanTitle.toLowerCase();
          if (lowerTitle === 'voiceover' || 
              lowerTitle === 'presentation themes' ||
              lowerTitle === 'themes' ||
              lowerTitle === 'slide' ||
              lowerTitle === 'title') {
            console.log(`🎬 [PROFESSIONAL_VIDEO] Skipping problematic title: ${cleanTitle}`);
            return;
          }
          
          // Check if title contains non-English characters
          const hasNonEnglish = /[а-яё]/i.test(cleanTitle);
          if (hasNonEnglish) {
            console.log(`🎬 [PROFESSIONAL_VIDEO] Skipping non-English title: ${cleanTitle}`);
            return;
          }
          
          voiceoverTexts.push(cleanTitle);
          console.log(`🎬 [PROFESSIONAL_VIDEO] Slide title ${index + 1}:`, cleanTitle);
        }
      });
      
      // Extract from main content if we still don't have enough
      if (voiceoverTexts.length < 2) {
        slideContent.forEach((contentElement, index) => {
          const contentText = contentElement.textContent?.trim();
          if (contentText && contentText.length > 20 && contentText.length < 500) {
            const cleanContent = contentText
              .replace(/\s+/g, ' ')
              .replace(/[^\w\s.,!?-]/g, '')
              .trim();
            
            // Check if content contains non-English characters
            const hasNonEnglish = /[а-яё]/i.test(cleanContent);
            if (hasNonEnglish) {
              console.log(`🎬 [PROFESSIONAL_VIDEO] Skipping non-English content: ${cleanContent.substring(0, 50)}...`);
              return;
            }
            
            if (cleanContent.length > 20) {
              voiceoverTexts.push(cleanContent);
              console.log(`🎬 [PROFESSIONAL_VIDEO] Slide content ${index + 1}:`, cleanContent.substring(0, 100) + '...');
            }
          }
        });
      }
    }

    // Method 3: Fallback - create a simple default voiceover if nothing found
    if (voiceoverTexts.length === 0) {
      console.log('🎬 [PROFESSIONAL_VIDEO] No content found, creating default voiceover...');
      voiceoverTexts.push("Welcome to this presentation. Today we will explore important topics and share valuable insights with you.");
    }

    // Final validation and cleaning
    const finalTexts = voiceoverTexts
      .filter(text => text && text.length > 5 && text.length < 1000)
      .map(text => text.replace(/\s+/g, ' ').trim())
      .slice(0, 5); // Limit to 5 slides maximum

    console.log('🎬 [PROFESSIONAL_VIDEO] Final extracted voiceover texts:', finalTexts);
    return finalTexts;
  };

  // Function to get current slide URL
  const getCurrentSlideUrl = (): string => {
    // Get the current page URL
    const currentUrl = window.location.href;
    console.log('🎬 [PROFESSIONAL_VIDEO] Current slide URL:', currentUrl);
    return currentUrl;
  };

  // Function to monitor presentation job progress
  const monitorPresentationProgress = async (jobId: string): Promise<string> => {
    console.log('🎬 [PROFESSIONAL_VIDEO] Starting to monitor presentation progress for job:', jobId);
    
    const maxWaitTime = 20 * 60 * 1000; // 20 minutes
    const checkInterval = 5000; // Check every 5 seconds
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

        const job: PresentationJob = statusData;
        setCurrentJob(job);
        
        // Update progress
        setProgress(job.progress);
        onProgress?.(job.progress, job.status);

        console.log('🎬 [PROFESSIONAL_VIDEO] Presentation status:', job.status, 'Progress:', job.progress + '%');

        if (job.status === 'completed') {
          console.log('🎬 [PROFESSIONAL_VIDEO] Presentation completed!');
          return job.videoUrl || '';
        }

        if (job.status === 'failed') {
          throw new Error(job.error || 'Presentation generation failed');
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        
      } catch (error) {
        console.error('🎬 [PROFESSIONAL_VIDEO] Error checking presentation status:', error);
        throw error;
      }
    }

    throw new Error('Presentation generation timeout after 20 minutes');
  };

  const handleCreatePresentation = async () => {
    try {
      console.log('🎬 [PROFESSIONAL_VIDEO] Starting professional video presentation generation...');
      console.log('🎬 [PROFESSIONAL_VIDEO] Environment check:');
      console.log('  - CUSTOM_BACKEND_URL:', CUSTOM_BACKEND_URL);
      console.log('  - Window location:', window.location.href);
      
      setStatus('generating');
      setProgress(0);
      setCurrentJob(null);

      // Step 1: Extract voiceover text from slides
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 1: Extracting voiceover text from slides...');
      setProgress(5);
      
      const voiceoverTexts = await extractVoiceoverTexts();
      console.log('🎬 [PROFESSIONAL_VIDEO] Extracted voiceover texts:', voiceoverTexts);
      
      if (!voiceoverTexts || voiceoverTexts.length === 0) {
        throw new Error('No voiceover text found in slides');
      }

      // Step 2: Get current slide URL
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 2: Getting current slide URL...');
      setProgress(10);
      
      const slideUrl = getCurrentSlideUrl();

      // Step 3: Create professional presentation
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 3: Creating professional presentation...');
      setProgress(15);
      
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
          avatarCode: 'gia.casual', // Use default avatar
          duration: 30.0, // 30 seconds per slide
          layout: 'side_by_side', // Professional side-by-side layout
          quality: 'high', // High quality output
          resolution: [1920, 1080], // Full HD
          projectName: projectName || 'Professional Presentation'
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

      const jobId = createData.jobId;
      console.log('🎬 [PROFESSIONAL_VIDEO] Presentation created with job ID:', jobId);

      // Step 4: Monitor presentation progress
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 4: Monitoring presentation progress...');
      setProgress(20);
      
      const videoUrl = await monitorPresentationProgress(jobId);

      // Step 5: Complete
      console.log('🎬 [PROFESSIONAL_VIDEO] Step 5: Professional presentation completed!');
      setProgress(100);
      setStatus('completed');
      console.log('🎬 [PROFESSIONAL_VIDEO] Final video URL:', videoUrl);
      onSuccess?.(jobId, videoUrl);

    } catch (error) {
      console.error('🎬 [PROFESSIONAL_VIDEO] Professional presentation generation failed with error:', error);
      console.error('🎬 [PROFESSIONAL_VIDEO] Error type:', typeof error);
      console.error('🎬 [PROFESSIONAL_VIDEO] Error constructor:', error?.constructor?.name);
      console.error('🎬 [PROFESSIONAL_VIDEO] Error stack:', (error as Error)?.stack);
      
      if (error instanceof Error) {
        console.error('🎬 [PROFESSIONAL_VIDEO] Error message:', error.message);
        console.error('🎬 [PROFESSIONAL_VIDEO] Error name:', error.name);
      }
      
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('🎬 [PROFESSIONAL_VIDEO] Calling onError with message:', errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleDownloadVideo = () => {
    if (currentJob?.videoUrl) {
      const downloadUrl = `${CUSTOM_BACKEND_URL}${currentJob.videoUrl}`;
      console.log('🎬 [PROFESSIONAL_VIDEO] Downloading video from:', downloadUrl);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `professional_presentation_${currentJob.jobId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreviewVideo = () => {
    if (currentJob?.videoUrl) {
      const videoUrl = `${CUSTOM_BACKEND_URL}${currentJob.videoUrl}`;
      console.log('🎬 [PROFESSIONAL_VIDEO] Previewing video:', videoUrl);
      
      // Open video in new tab
      window.open(videoUrl, '_blank');
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'generating':
        return `Creating Professional Video... ${Math.round(progress)}%`;
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
        return `${baseClasses} text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Button */}
      <button
        onClick={handleCreatePresentation}
        disabled={status === 'generating'}
        className={getButtonClassName()}
        title={
          status === 'generating' 
            ? 'Professional video generation in progress...' 
            : 'Create professional video presentation with slide capture and AI avatar'
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
          ></div>
        </div>
      )}

      {/* Action Buttons (when completed) */}
      {status === 'completed' && currentJob && (
        <div className="flex space-x-2">
          <button
            onClick={handlePreviewVideo}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md flex items-center transition-colors"
            title="Preview the generated video"
          >
            <Eye size={14} className="mr-1" />
            Preview
          </button>
          
          <button
            onClick={handleDownloadVideo}
            className="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 hover:bg-green-200 rounded-md flex items-center transition-colors"
            title="Download the generated video"
          >
            <Download size={14} className="mr-1" />
            Download
          </button>
        </div>
      )}

      {/* Job Details */}
      {currentJob && (
        <div className="text-xs text-gray-600 space-y-1">
          <div>Job ID: {currentJob.jobId}</div>
          <div>Status: {currentJob.status}</div>
          {currentJob.createdAt && (
            <div>Created: {new Date(currentJob.createdAt).toLocaleString()}</div>
          )}
          {currentJob.completedAt && (
            <div>Completed: {new Date(currentJob.completedAt).toLocaleString()}</div>
          )}
        </div>
      )}
    </div>
  );
};
