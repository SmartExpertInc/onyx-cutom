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
    
    // Method 1: Look for specific voiceover text attributes
    const voiceoverElements = document.querySelectorAll('[data-voiceover-text], .voiceover-text, .slide-voiceover');
    console.log('🎬 [VIDEO_DOWNLOAD] Found voiceover elements:', voiceoverElements.length);
    
    voiceoverElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 1000) { // Sanity check for reasonable length
        // Clean the text - remove excessive whitespace and special characters
        const cleanText = text.replace(/\s+/g, ' ').trim();
        if (cleanText.length > 10) { // Only include substantial content
          voiceoverTexts.push(cleanText);
          console.log(`🎬 [VIDEO_DOWNLOAD] Voiceover ${index + 1}:`, cleanText.substring(0, 100) + '...');
        }
      }
    });

    // Method 2: If no voiceover elements found, try to extract from slide titles and content
    if (voiceoverTexts.length === 0) {
      console.log('🎬 [VIDEO_DOWNLOAD] No voiceover elements found, extracting from slide content...');
      
      // Look for slide titles and main content
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
             console.log(`🎬 [VIDEO_DOWNLOAD] Skipping problematic title: ${cleanTitle}`);
             return;
           }
           
           // Check if title contains non-English characters (like Russian)
           const hasNonEnglish = /[а-яё]/i.test(cleanTitle);
           if (hasNonEnglish) {
             console.log(`🎬 [VIDEO_DOWNLOAD] Skipping non-English title: ${cleanTitle}`);
             return;
           }
           
           voiceoverTexts.push(cleanTitle);
           console.log(`🎬 [VIDEO_DOWNLOAD] Slide title ${index + 1}:`, cleanTitle);
         }
       });
      
             // Extract from main content if we still don't have enough
       if (voiceoverTexts.length < 2) {
         slideContent.forEach((contentElement, index) => {
           const contentText = contentElement.textContent?.trim();
           if (contentText && contentText.length > 20 && contentText.length < 500) {
             // Clean and extract meaningful content
             const cleanContent = contentText
               .replace(/\s+/g, ' ')
               .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
               .trim();
             
             // Check if content contains non-English characters
             const hasNonEnglish = /[а-яё]/i.test(cleanContent);
             if (hasNonEnglish) {
               console.log(`🎬 [VIDEO_DOWNLOAD] Skipping non-English content: ${cleanContent.substring(0, 50)}...`);
               return;
             }
             
             if (cleanContent.length > 20) {
               voiceoverTexts.push(cleanContent);
               console.log(`🎬 [VIDEO_DOWNLOAD] Slide content ${index + 1}:`, cleanContent.substring(0, 100) + '...');
             }
           }
         });
       }
    }

         // Method 3: Fallback - create a simple default voiceover if nothing found
     if (voiceoverTexts.length === 0) {
       console.log('🎬 [VIDEO_DOWNLOAD] No content found, creating default voiceover...');
       voiceoverTexts.push("Welcome to this presentation. Today we will explore important topics and share valuable insights with you.");
     }

    // Final validation and cleaning
    const finalTexts = voiceoverTexts
      .filter(text => text && text.length > 5 && text.length < 1000)
      .map(text => text.replace(/\s+/g, ' ').trim())
      .slice(0, 5); // Limit to 5 slides maximum

    console.log('🎬 [VIDEO_DOWNLOAD] Final extracted voiceover texts:', finalTexts);
    return finalTexts;
  };

  // Function to monitor professional presentation progress (includes slide capture, avatar generation, and video merging)
  const monitorProfessionalPresentationProgress = async (jobId: string, onProgressUpdate: (progress: number) => void): Promise<string> => {
    console.log('🎬 [VIDEO_DOWNLOAD] Starting to monitor professional presentation progress for job:', jobId);
    
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
        console.log('🎬 [VIDEO_DOWNLOAD] Professional presentation status check response:', statusData);

        if (!statusData.success) {
          throw new Error(statusData.error || 'Status check failed');
        }

        const jobStatus = statusData.status;
        const jobProgress = statusData.progress || 0;
        const videoUrl = statusData.videoUrl;

        console.log('🎬 [VIDEO_DOWNLOAD] Professional presentation status:', jobStatus, 'Progress:', jobProgress + '%');
        
        // Update progress
        onProgressUpdate(jobProgress);

        if (jobStatus === 'completed' && videoUrl) {
          console.log('🎬 [VIDEO_DOWNLOAD] Professional presentation generation completed!');
          return videoUrl;
        }

        if (jobStatus === 'failed') {
          throw new Error(statusData.error || 'Professional presentation generation failed');
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        
      } catch (error) {
        console.error('🎬 [VIDEO_DOWNLOAD] Error checking professional presentation status:', error);
        throw error;
      }
    }

    throw new Error('Professional presentation generation timeout after 30 minutes');
  };

  // Function to monitor rendering progress (legacy - kept for backward compatibility)
  const monitorRenderingProgress = async (videoId: string, onProgressUpdate: (progress: number) => void): Promise<string> => {
    console.log('🎬 [VIDEO_DOWNLOAD] Starting to monitor rendering progress for video:', videoId);
    
    const maxWaitTime = 15 * 60 * 1000; // 15 minutes
    const checkInterval = 5000; // Check every 5 seconds
    const startTime = Date.now();
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    
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

        // Extract status and progress from the nested status object
        const videoStatus = statusData.status;
        const status = videoStatus.status || videoStatus;
        const progress = videoStatus.progress || statusData.progress || 0;
        const downloadUrl = videoStatus.downloadUrl || videoStatus.videoUrl || statusData.downloadUrl || statusData.videoUrl;

        console.log('🎬 [VIDEO_DOWNLOAD] Video status:', status, 'Progress:', progress + '%');
        
        // Use the actual progress value from the backend
        onProgressUpdate(progress);

        if (status === 'rendered' || status === 'ready') {
          console.log('🎬 [VIDEO_DOWNLOAD] Video rendering completed!');
          return downloadUrl || '';
        }

        if (status === 'failed' || status === 'error') {
          consecutiveErrors++;
          console.warn(`🎬 [VIDEO_DOWNLOAD] Video status is '${status}' (attempt ${consecutiveErrors}/${maxConsecutiveErrors})`);
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            throw new Error(`Video rendering failed after ${maxConsecutiveErrors} consecutive error statuses`);
          }
          
          // Continue monitoring even on error status (Elai sometimes reports error temporarily)
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          continue;
        }

        // Reset error counter on successful status
        consecutiveErrors = 0;

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
      console.log('🎬 [VIDEO_DOWNLOAD] Starting professional video generation process...');
      console.log('🎬 [VIDEO_DOWNLOAD] Environment check:');
      console.log('  - CUSTOM_BACKEND_URL:', CUSTOM_BACKEND_URL);
      console.log('  - NEXT_PUBLIC_CUSTOM_BACKEND_URL:', process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL);
      console.log('  - Window location:', window.location.href);
      
      setStatus('generating');
      setProgress(0);

      // Step 1: Extract voiceover text from slides
      console.log('🎬 [VIDEO_DOWNLOAD] Step 1: Extracting voiceover text from slides...');
      setProgress(10);
      
      const voiceoverTexts = await extractVoiceoverTexts();
      console.log('🎬 [VIDEO_DOWNLOAD] Extracted voiceover texts:', voiceoverTexts);
      
      if (!voiceoverTexts || voiceoverTexts.length === 0) {
        throw new Error('No voiceover text found in slides');
      }

      // Step 2: Get current slide URL for capture
      console.log('🎬 [VIDEO_DOWNLOAD] Step 2: Getting current slide URL...');
      setProgress(20);
      
      const slideUrl = window.location.href;
      console.log('🎬 [VIDEO_DOWNLOAD] Slide URL for capture:', slideUrl);

      // Step 3: Create professional presentation with slide capture and video merging
      console.log('🎬 [VIDEO_DOWNLOAD] Step 3: Creating professional presentation (slide capture + avatar + merging)...');
      setProgress(30);
      
      const createResponse = await fetch(`${CUSTOM_BACKEND_URL}/presentations`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        signal: AbortSignal.timeout(90000), // 90 second timeout for initial request
        body: JSON.stringify({
          slideUrl: slideUrl,
          voiceoverTexts: voiceoverTexts,
          // Remove hardcoded avatarCode to enable dynamic avatar selection
          duration: 30.0,
          layout: 'side_by_side', // side_by_side, picture_in_picture, split_screen
          quality: 'high',
          resolution: [1920, 1080],
          projectName: projectName || 'Professional Video Presentation'
        })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create professional presentation: ${createResponse.status} - ${errorText}`);
      }

      const createData = await createResponse.json();
      console.log('🎬 [VIDEO_DOWNLOAD] Professional presentation creation response:', createData);

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create professional presentation');
      }

      const presentationJobId = createData.jobId;
      console.log('🎬 [VIDEO_DOWNLOAD] Professional presentation job created with ID:', presentationJobId);

      // Step 4: Monitor professional presentation progress (includes slide capture, avatar generation, and video merging)
      console.log('🎬 [VIDEO_DOWNLOAD] Step 4: Monitoring professional presentation progress...');
      console.log('🎬 [VIDEO_DOWNLOAD] This includes: slide capture → avatar generation → video merging');
      setProgress(40);
      
      const videoUrl = await monitorProfessionalPresentationProgress(presentationJobId, (progressPercent) => {
        // Update progress from 40% to 90% based on processing progress
        const newProgress = 40 + (progressPercent * 0.5); // 40% to 90%
        setProgress(newProgress);
        console.log('🎬 [VIDEO_DOWNLOAD] Professional presentation progress:', progressPercent + '%');
      });

             // Step 5: Complete and Download
       console.log('🎬 [VIDEO_DOWNLOAD] Step 5: Professional video generation completed!');
       console.log('🎬 [VIDEO_DOWNLOAD] Final video includes: slide content + AI avatar + merged output');
       setProgress(95);
       console.log('🎬 [VIDEO_DOWNLOAD] Final video URL:', videoUrl);
       
       // Step 6: Automatically download the video to user's computer
       console.log('🎬 [VIDEO_DOWNLOAD] Step 6: Starting automatic download...');
       await downloadVideoToPC(videoUrl);
       
       setProgress(100);
       setStatus('completed');
       onSuccess?.(videoUrl);

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

   const downloadVideoToPC = async (videoUrl: string) => {
     try {
       console.log('💾 [DOWNLOAD] Starting download from URL:', videoUrl);
       
       // Construct the full download URL
       const fullUrl = videoUrl.startsWith('http') ? videoUrl : `${CUSTOM_BACKEND_URL}${videoUrl}`;
       console.log('💾 [DOWNLOAD] Full download URL:', fullUrl);
       
       // Fetch the video file
       console.log('💾 [DOWNLOAD] Fetching video file...');
       const response = await fetch(fullUrl, {
         method: 'GET',
         credentials: 'same-origin',
       });
       
       if (!response.ok) {
         throw new Error(`Download failed: ${response.status} ${response.statusText}`);
       }
       
       // Get the video blob
       console.log('💾 [DOWNLOAD] Converting to blob...');
       const blob = await response.blob();
       console.log('💾 [DOWNLOAD] Blob size:', blob.size, 'bytes');
       
       // Create download link
       const downloadUrl = window.URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = downloadUrl;
       
       // Generate filename with timestamp
       const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
       const filename = `professional-video-${projectName || 'presentation'}-${timestamp}.mp4`;
       link.download = filename;
       
       // Trigger download
       console.log('💾 [DOWNLOAD] Triggering download:', filename);
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
       // Clean up
       window.URL.revokeObjectURL(downloadUrl);
       
       console.log('💾 [DOWNLOAD] Download initiated successfully!');
       console.log('💾 [DOWNLOAD] File saved as:', filename);
       
     } catch (error) {
       console.error('💾 [DOWNLOAD] Download failed:', error);
       // Don't throw - let the video generation success still show
       console.log('💾 [DOWNLOAD] Video is still available at:', videoUrl);
     }
   };

   const getButtonText = () => {
    switch (status) {
      case 'generating':
        return `Creating Professional Video... ${progress}%`;
             case 'completed':
         return 'Video Generated & Downloaded!';
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
    <button
      onClick={handleDownloadVideo}
      disabled={status === 'generating'}
      className={getButtonClassName()}
      title={
        status === 'generating' 
          ? 'Professional video generation in progress...' 
          : 'Create professional video with slide capture and AI avatar'
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
  );
};
