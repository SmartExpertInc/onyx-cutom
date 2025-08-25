import React, { useState } from 'react';
import { Code, Loader, ExternalLink } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface HtmlPreviewButtonProps {
  projectName?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  className?: string;
}

const HtmlPreviewButton: React.FC<HtmlPreviewButtonProps> = ({
  projectName,
  onError,
  onSuccess,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to extract actual slide data from current project
  const extractSlideData = async (): Promise<{ slides: any[], theme: string }> => {
    console.log('🔍 [HTML_PREVIEW] Extracting slide data from current project...');
    
    try {
      // Try to get slide data from the global window object (if SmartSlideDeckViewer exposed it)
      const slideViewerData = (window as any).currentSlideData;
      if (slideViewerData?.deck?.slides) {
        console.log('🔍 [HTML_PREVIEW] Found slide data in window object:', slideViewerData.deck.slides.length, 'slides');
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
        console.log('🔍 [HTML_PREVIEW] Extracted project ID from URL:', projectId);
        
        // Fetch project data from API
        const response = await fetch(`/api/custom/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          console.log('🔍 [HTML_PREVIEW] Fetched project data:', projectData);
          
          if (projectData.details?.slides) {
            return {
              slides: projectData.details.slides,
              theme: projectData.details.theme || 'dark-purple'
            };
          }
        }
      }

      console.log('🔍 [HTML_PREVIEW] Could not extract slide data');
      return { slides: [], theme: 'dark-purple' };
      
    } catch (error) {
      console.error('🔍 [HTML_PREVIEW] Error extracting slide data:', error);
      return { slides: [], theme: 'dark-purple' };
    }
  };

  const handlePreviewHtml = async () => {
    try {
      setIsGenerating(true);
      console.log('🔍 [HTML_PREVIEW] Starting HTML preview generation...');

      // Extract slide data
      const slideData = await extractSlideData();
      
      if (!slideData.slides || slideData.slides.length === 0) {
        const errorMsg = 'No slide data found. Please make sure you have a slide open.';
        console.error('🔍 [HTML_PREVIEW]', errorMsg);
        onError?.(errorMsg);
        return;
      }

      console.log('🔍 [HTML_PREVIEW] Slide data extracted successfully');
      console.log('🔍 [HTML_PREVIEW] Slides count:', slideData.slides.length);
      console.log('🔍 [HTML_PREVIEW] Theme:', slideData.theme);

      // Prepare request payload
      const requestPayload = {
        slides: slideData.slides,
        theme: slideData.theme
      };

      console.log('🔍 [HTML_PREVIEW] Request payload:', requestPayload);

      // Call the HTML preview endpoint
      const response = await fetch(`${CUSTOM_BACKEND_URL}/slide-html/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTML preview failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate HTML preview');
      }

      console.log('🔍 [HTML_PREVIEW] HTML preview generated successfully');
      console.log('🔍 [HTML_PREVIEW] Template ID:', result.template_id);
      console.log('🔍 [HTML_PREVIEW] Theme:', result.theme);
      console.log('🔍 [HTML_PREVIEW] HTML length:', result.html.length);

      // Create a new window/tab with the HTML content
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(result.html);
        newWindow.document.close();
        
        console.log('🔍 [HTML_PREVIEW] HTML preview opened in new window');
        onSuccess?.(`HTML preview opened in new window for template: ${result.template_id}`);
      } else {
        throw new Error('Failed to open new window (popup blocked)');
      }

    } catch (error) {
      console.error('🔍 [HTML_PREVIEW] HTML preview failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    return isGenerating ? 'Generating HTML Preview...' : '🔍 Preview HTML';
  };

  const getButtonIcon = () => {
    return isGenerating ? <Loader size={16} className="mr-2 animate-spin" /> : <Code size={16} className="mr-2" />;
  };

  const getButtonClassName = () => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center transition-colors";
    
    if (isGenerating) {
      return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-60 ${className}`;
    } else {
      return `${baseClasses} text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 ${className}`;
    }
  };

  return (
    <button
      onClick={handlePreviewHtml}
      disabled={isGenerating}
      className={getButtonClassName()}
      title={
        isGenerating 
          ? 'HTML preview generation in progress...' 
          : 'Preview static HTML of current slide (debugging)'
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
  );
};

export default HtmlPreviewButton;
