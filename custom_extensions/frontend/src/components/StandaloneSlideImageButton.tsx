"use client";

import React, { useState } from 'react';
import { Image, Loader } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface StandaloneSlideImageButtonProps {
  projectName?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  className?: string;
}

const StandaloneSlideImageButton: React.FC<StandaloneSlideImageButtonProps> = ({
  projectName,
  onError,
  onSuccess,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to extract actual slide data from current project
  const extractSlideData = async (): Promise<{ slides: any[], theme: string }> => {
    console.log('📷 [SLIDE_IMAGE] Extracting slide data from current project...');
    
    try {
      // Try to get slide data from the global window object (if SmartSlideDeckViewer exposed it)
      const slideViewerData = (window as any).currentSlideData;
      if (slideViewerData?.deck?.slides) {
        console.log('📷 [SLIDE_IMAGE] Found slide data in window object:', slideViewerData.deck.slides.length, 'slides');
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
        console.log('📷 [SLIDE_IMAGE] Extracted project ID from URL:', projectId);
        
        // Fetch project data from API
        const response = await fetch(`/api/custom/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          console.log('📷 [SLIDE_IMAGE] Fetched project data:', projectData);
          
          if (projectData.details?.slides) {
            return {
              slides: projectData.details.slides,
              theme: projectData.details.theme || 'dark-purple'
            };
          }
        }
      }

      console.log('📷 [SLIDE_IMAGE] Could not extract slide data');
      return { slides: [], theme: 'dark-purple' };
      
    } catch (error) {
      console.error('📷 [SLIDE_IMAGE] Error extracting slide data:', error);
      return { slides: [], theme: 'dark-purple' };
    }
  };

  const handleGenerateSlideImage = async () => {
    try {
      setIsGenerating(true);
      console.log('📷 [SLIDE_IMAGE] Starting standalone slide image generation...');

      // Extract slide data
      const slideData = await extractSlideData();
      
      if (!slideData.slides || slideData.slides.length === 0) {
        const errorMsg = 'No slide data found. Please make sure you have a slide open.';
        console.error('📷 [SLIDE_IMAGE]', errorMsg);
        onError?.(errorMsg);
        return;
      }

      console.log('📷 [SLIDE_IMAGE] Slide data extracted successfully');
      console.log('📷 [SLIDE_IMAGE] Slides count:', slideData.slides.length);
      console.log('📷 [SLIDE_IMAGE] Theme:', slideData.theme);

      // Prepare request payload
      const requestPayload = {
        slides: slideData.slides,
        theme: slideData.theme
      };

      console.log('📷 [SLIDE_IMAGE] Request payload:', requestPayload);

      // Call the standalone slide image generation endpoint
      const response = await fetch(`${CUSTOM_BACKEND_URL}/slide-image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Slide image generation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Get the image blob
      console.log('📷 [SLIDE_IMAGE] Converting to blob...');
      const blob = await response.blob();
      console.log('📷 [SLIDE_IMAGE] Blob size:', blob.size, 'bytes');

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `slide-image-${projectName || 'presentation'}-${timestamp}.png`;
      link.download = filename;

      // Trigger download
      console.log('📷 [SLIDE_IMAGE] Triggering download:', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);

      console.log('📷 [SLIDE_IMAGE] Slide image download initiated successfully!');
      console.log('📷 [SLIDE_IMAGE] File saved as:', filename);

      onSuccess?.(`Slide image generated and downloaded: ${filename}`);

    } catch (error) {
      console.error('📷 [SLIDE_IMAGE] Slide image generation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    return isGenerating ? 'Generating Slide Image...' : '📷 Generate Slide Image';
  };

  const getButtonIcon = () => {
    return isGenerating ? <Loader size={16} className="mr-2 animate-spin" /> : <Image size={16} className="mr-2" />;
  };

  const getButtonClassName = () => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center transition-colors";
    
    if (isGenerating) {
      return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-60 ${className}`;
    } else {
      return `${baseClasses} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 ${className}`;
    }
  };

  return (
    <button
      onClick={handleGenerateSlideImage}
      disabled={isGenerating}
      className={getButtonClassName()}
      title={
        isGenerating 
          ? 'Slide image generation in progress...' 
          : 'Generate slide image from current slide (no video generation)'
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
  );
};

export default StandaloneSlideImageButton;
