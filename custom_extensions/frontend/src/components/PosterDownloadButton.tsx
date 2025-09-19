"use client";

import React, { useState } from 'react';
import { Image, Loader } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface PosterDownloadButtonProps {
  eventName?: string;
  mainSpeaker?: string;
  speakerDescription?: string;
  date?: string;
  topic?: string;
  additionalSpeakers?: string;
  ticketPrice?: string;
  ticketType?: string;
  freeAccessConditions?: string;
  speakerImageSrc?: string;
  projectName?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  className?: string;
}

const PosterDownloadButton: React.FC<PosterDownloadButtonProps> = ({
  eventName,
  mainSpeaker,
  speakerDescription,
  date,
  topic,
  additionalSpeakers,
  ticketPrice,
  ticketType,
  freeAccessConditions,
  speakerImageSrc,
  projectName = 'event-poster',
  onError,
  onSuccess,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPoster = async () => {
    try {
      setIsGenerating(true);
      console.log('📷 [POSTER_DOWNLOAD] Starting server-side poster image generation...');

      // Prepare poster data payload (mirrors slide system data extraction)
      const posterPayload = {
        eventName: eventName || '',
        mainSpeaker: mainSpeaker || '',
        speakerDescription: speakerDescription || '',
        date: date || '',
        topic: topic || '',
        additionalSpeakers: additionalSpeakers || '',
        ticketPrice: ticketPrice || '',
        ticketType: ticketType || '',
        freeAccessConditions: freeAccessConditions || '',
        speakerImageSrc: speakerImageSrc || '',
        // Additional metadata
        format: 'poster',
        dimensions: { width: 1000, height: 1000 }
      };

      console.log('📷 [POSTER_DOWNLOAD] Sending poster data to server:', {
        ...posterPayload,
        speakerImageSrc: speakerImageSrc ? `[base64 data: ${speakerImageSrc.substring(0, 50)}...]` : 'none'
      });

      // Validate required fields
      const requiredFields = ['eventName', 'mainSpeaker', 'date', 'topic'];
      const missingFields = requiredFields.filter(field => !posterPayload[field as keyof typeof posterPayload]);
      
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        console.error('📷 [POSTER_DOWNLOAD]', errorMsg);
        onError?.(errorMsg);
        return;
      }

      // Server-side generation request (same pattern as slide system)
      const response = await fetch(`${CUSTOM_BACKEND_URL}/poster-image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posterPayload),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            // Keep default error message
          }
        }
        throw new Error(errorMessage);
      }

      // Handle file download (identical to slide system)
      console.log('📷 [POSTER_DOWNLOAD] Converting response to blob...');
      const blob = await response.blob();
      console.log('📷 [POSTER_DOWNLOAD] Received image blob, size:', blob.size, 'bytes');

      if (blob.size === 0) {
        throw new Error('Received empty image file from server');
      }

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Generate descriptive filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const cleanProjectName = (projectName || eventName || 'poster').replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `poster-${cleanProjectName}-${timestamp}.png`;
      link.download = filename;

      // Trigger automatic download
      console.log('📷 [POSTER_DOWNLOAD] Triggering download:', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('📷 [POSTER_DOWNLOAD] Poster image downloaded successfully:', filename);
      onSuccess?.(`Poster image generated and downloaded: ${filename}`);
      
    } catch (error) {
      console.error('📷 [POSTER_DOWNLOAD] Error generating poster image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      alert(`Failed to generate poster image: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    return isGenerating ? 'Generating Poster...' : 'Generate and Download Poster';
  };

  const getButtonIcon = () => {
    return isGenerating ? <Loader size={16} className="mr-2 animate-spin" /> : <Image size={16} className="mr-2" />;
  };

  const getButtonClassName = () => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    if (isGenerating) {
      return `${baseClasses} bg-blue-500 text-white cursor-not-allowed focus:ring-blue-500 disabled:opacity-60 ${className}`;
    } else {
      return `${baseClasses} bg-green-600 hover:bg-green-700 text-white cursor-pointer focus:ring-green-500 ${className}`;
    }
  };

  return (
    <button
      onClick={handleDownloadPoster}
      disabled={isGenerating}
      className={getButtonClassName()}
      title={
        isGenerating 
          ? 'Poster image generation in progress...' 
          : 'Generate and download poster image (server-side processing)'
      }
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
  );
};

export default PosterDownloadButton;
