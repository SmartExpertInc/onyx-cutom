"use client";

import React, { useState, useRef } from 'react';

interface PosterDownloadButtonProps {
  posterData: {
    eventName: string;
    mainSpeaker: string;
    speakerDescription: string;
    date: string;
    topic: string;
    additionalSpeakers: string;
    ticketPrice: string;
    ticketType: string;
    freeAccessConditions: string;
    speakerImageSrc?: string;
  };
  projectName?: string;
}

const PosterDownloadButton: React.FC<PosterDownloadButtonProps> = ({
  posterData,
  projectName = 'poster'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const handleDownloadPoster = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Starting client-side poster image generation...');
      
      // Wait for any pending images to load
      await waitForImagesToLoad();
      
      // Find the poster component in the DOM
      const posterElement = document.querySelector('[data-poster-component]') as HTMLElement;
      
      if (!posterElement) {
        throw new Error('Poster component not found in DOM. Make sure the EventPoster component is rendered.');
      }

      console.log('Found poster element:', posterElement);

      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Configure html2canvas for high-quality capture
      const canvas = await html2canvas(posterElement, {
        width: 1000,
        height: 1000,
        scale: 2, // Higher resolution
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded in the cloned document
          const clonedElement = clonedDoc.querySelector('[data-poster-component]');
          if (clonedElement) {
            // Force font loading and ensure proper styling
            clonedElement.style.fontFamily = 'Montserrat, sans-serif';
            clonedElement.style.width = '1000px';
            clonedElement.style.height = '1000px';
            
            // Ensure all background images are properly loaded in the clone
            const backgroundElements = clonedElement.querySelectorAll('[style*="background-image"]');
            backgroundElements.forEach((element) => {
              const style = element.getAttribute('style');
              if (style) {
                element.setAttribute('style', style);
              }
            });
          }
        }
      });

      console.log('Canvas generated:', canvas.width, 'x', canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Failed to convert canvas to blob');
          }
        }, 'image/png', 1.0);
      });

      console.log('Blob size:', blob.size, 'bytes');

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Generate timestamped filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `poster-${projectName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.png`;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Poster image downloaded successfully');
      
    } catch (error) {
      console.error('Error generating poster image:', error);
      alert(`Failed to generate poster image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to wait for images to load
  const waitForImagesToLoad = (): Promise<void> => {
    return new Promise((resolve) => {
      const posterElement = document.querySelector('[data-poster-component]');
      if (!posterElement) {
        resolve();
        return;
      }

      // Find all images and background images
      const imgElements = posterElement.querySelectorAll('img');
      const backgroundElements = posterElement.querySelectorAll('[style*="background-image"]');
      
      let loadedCount = 0;
      const totalImages = imgElements.length + backgroundElements.length;

      if (totalImages === 0) {
        // No images to wait for, but still wait a bit for fonts and rendering
        setTimeout(resolve, 300);
        return;
      }

      const checkComplete = () => {
        loadedCount++;
        if (loadedCount >= totalImages) {
          // Additional delay to ensure rendering is complete
          setTimeout(resolve, 500);
        }
      };

      // Wait for regular img elements
      imgElements.forEach((img) => {
        const imageElement = img as HTMLImageElement;
        if (imageElement.complete && imageElement.naturalWidth > 0) {
          checkComplete();
        } else {
          imageElement.onload = checkComplete;
          imageElement.onerror = checkComplete;
        }
      });

      // For background images, preload them to ensure they're ready
      backgroundElements.forEach((element) => {
        const style = element.getAttribute('style');
        if (style && style.includes('background-image')) {
          const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch) {
            const imageUrl = urlMatch[1];
            const img = new Image();
            img.onload = checkComplete;
            img.onerror = checkComplete;
            img.src = imageUrl;
          } else {
            checkComplete();
          }
        } else {
          checkComplete();
        }
      });
    });
  };

  return (
    <button
      onClick={handleDownloadPoster}
      disabled={isGenerating}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02]
        ${isGenerating 
          ? 'bg-blue-500 text-white cursor-not-allowed opacity-70' 
          : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-lg hover:shadow-xl'
        }
      `}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          Generating Poster...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Generate and Download Poster
        </>
      )}
    </button>
  );
};

export default PosterDownloadButton;
