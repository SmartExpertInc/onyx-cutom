"use client";

import React, { useState } from 'react';

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

  const handleDownloadPoster = async () => {
    setIsGenerating(true);
    
    try {
      // Extract poster data (same as slide system extracts slide data)
      const posterPayload = {
        eventName: posterData.eventName,
        mainSpeaker: posterData.mainSpeaker,
        speakerDescription: posterData.speakerDescription,
        date: posterData.date,
        topic: posterData.topic,
        additionalSpeakers: posterData.additionalSpeakers,
        ticketPrice: posterData.ticketPrice,
        ticketType: posterData.ticketType,
        freeAccessConditions: posterData.freeAccessConditions,
        speakerImageSrc: posterData.speakerImageSrc,
      };

      console.log('Generating poster image with data:', posterPayload);

      // API call (following slide system pattern)
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const response = await fetch(`${CUSTOM_BACKEND_URL}/poster-image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(posterPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Process download (exact same as slide system)
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes');

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
      alert('Failed to generate poster image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
