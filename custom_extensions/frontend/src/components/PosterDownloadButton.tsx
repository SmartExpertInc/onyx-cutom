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
    const startTime = new Date();
    const sessionId = `poster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      setIsGenerating(true);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] ========== STARTING POSTER GENERATION PROCESS ==========`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Timestamp: ${startTime.toISOString()}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] User Agent: ${navigator.userAgent}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Window Size: ${window.innerWidth}x${window.innerHeight}`);
      
      // Log component state transfer
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === COMPONENT STATE EXTRACTION ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Raw Props Received:`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - eventName: "${eventName}" (${typeof eventName}, length: ${(eventName || '').length})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - mainSpeaker: "${mainSpeaker}" (${typeof mainSpeaker}, length: ${(mainSpeaker || '').length})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - speakerDescription: "${(speakerDescription || '').substring(0, 100)}..." (${typeof speakerDescription}, length: ${(speakerDescription || '').length})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - date: "${date}" (${typeof date})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - topic: "${(topic || '').substring(0, 50)}..." (${typeof topic}, length: ${(topic || '').length})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - additionalSpeakers: "${(additionalSpeakers || '').substring(0, 50)}..." (${typeof additionalSpeakers}, length: ${(additionalSpeakers || '').length})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - ticketPrice: "${ticketPrice}" (${typeof ticketPrice})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - ticketType: "${ticketType}" (${typeof ticketType})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - freeAccessConditions: "${(freeAccessConditions || '').substring(0, 50)}..." (${typeof freeAccessConditions}, length: ${(freeAccessConditions || '').length})`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - speakerImageSrc: ${speakerImageSrc ? `[base64 data: ${speakerImageSrc.substring(0, 50)}... (total length: ${speakerImageSrc.length})]` : 'null/empty'}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - projectName: "${projectName}" (${typeof projectName})`);

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
        dimensions: { width: 1000, height: 1000 },
        sessionId: sessionId,
        clientTimestamp: startTime.toISOString()
      };
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === PAYLOAD PREPARATION ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Payload size estimate: ${JSON.stringify(posterPayload).length} characters`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Target dimensions: ${posterPayload.dimensions.width}x${posterPayload.dimensions.height}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Format: ${posterPayload.format}`);

      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === DATA VALIDATION ===`);

      // Validate required fields
      const requiredFields = ['eventName', 'mainSpeaker', 'date', 'topic'];
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Checking required fields: ${requiredFields.join(', ')}`);
      
      const fieldValidation = requiredFields.map(field => {
        const value = posterPayload[field as keyof typeof posterPayload];
        const isValid = Boolean(value && value.toString().trim());
        console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - ${field}: ${isValid ? '✅ VALID' : '❌ INVALID'} (value: "${value}")`);
        return { field, value, isValid };
      });
      
      const missingFields = fieldValidation.filter(f => !f.isValid).map(f => f.field);
      
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] VALIDATION FAILED: ${errorMsg}`);
        onError?.(errorMsg);
        return;
      }
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] ✅ All required fields validated successfully`);

      // Server-side generation request (same pattern as slide system)
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === SERVER REQUEST ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Backend URL: ${CUSTOM_BACKEND_URL}/poster-image/generate`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Request method: POST`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Content-Type: application/json`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Credentials: same-origin`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Request body size: ${JSON.stringify(posterPayload).length} bytes`);
      
      const requestStartTime = new Date();
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Sending request at: ${requestStartTime.toISOString()}`);
      
      const response = await fetch(`${CUSTOM_BACKEND_URL}/poster-image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posterPayload),
        credentials: 'same-origin',
      });
      
      const requestEndTime = new Date();
      const requestDuration = requestEndTime.getTime() - requestStartTime.getTime();
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === SERVER RESPONSE ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Response received at: ${requestEndTime.toISOString()}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Request duration: ${requestDuration}ms`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Response status: ${response.status} ${response.statusText}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Response headers:`);
      response.headers.forEach((value, key) => {
        console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - ${key}: ${value}`);
      });

      if (!response.ok) {
        console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] ❌ SERVER ERROR DETECTED`);
        console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Status: ${response.status} ${response.statusText}`);
        
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Error response JSON:`, errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Failed to parse error JSON, trying text...`);
          // If response is not JSON, use text
          try {
            const errorText = await response.text();
            console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Error response text:`, errorText);
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Failed to parse error text:`, e2);
            // Keep default error message
          }
        }
        console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Final error message: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Handle file download (identical to slide system)
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === FILE PROCESSING ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Converting response to blob...`);
      
      const blobStartTime = new Date();
      const blob = await response.blob();
      const blobEndTime = new Date();
      const blobDuration = blobEndTime.getTime() - blobStartTime.getTime();
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Blob conversion completed in ${blobDuration}ms`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Blob properties:`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - size: ${blob.size} bytes`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - type: ${blob.type}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - size category: ${blob.size < 1000 ? 'VERY_SMALL' : blob.size < 10000 ? 'SMALL' : blob.size < 100000 ? 'MEDIUM' : 'LARGE'}`);

      if (blob.size === 0) {
        console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] ❌ CRITICAL ERROR: Received empty image file from server`);
        throw new Error('Received empty image file from server');
      }
      
      if (blob.size < 1000) {
        console.warn(`📷 [POSTER_DOWNLOAD] [${sessionId}] ⚠️ WARNING: Blob size is very small (${blob.size} bytes), may indicate generation failure`);
      }

      // Create download link
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === DOWNLOAD PREPARATION ===`);
      
      const downloadUrl = window.URL.createObjectURL(blob);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Object URL created: ${downloadUrl.substring(0, 50)}...`);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Download link element created`);

      // Generate descriptive filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const cleanProjectName = (projectName || eventName || 'poster').replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `poster-${cleanProjectName}-${timestamp}.png`;
      link.download = filename;
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Filename generation:`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - timestamp: ${timestamp}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - cleanProjectName: ${cleanProjectName}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}]   - final filename: ${filename}`);

      // Trigger automatic download
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === DOWNLOAD TRIGGER ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Adding link to DOM...`);
      document.body.appendChild(link);
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Triggering click event...`);
      link.click();
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Removing link from DOM...`);
      document.body.removeChild(link);

      // Cleanup
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Revoking object URL...`);
      window.URL.revokeObjectURL(downloadUrl);
      
      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === PROCESS COMPLETED SUCCESSFULLY ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] End time: ${endTime.toISOString()}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Total duration: ${totalDuration}ms`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Final filename: ${filename}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Final blob size: ${blob.size} bytes`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Success callback triggered`);
      
      onSuccess?.(`Poster image generated and downloaded: ${filename}`);
      
    } catch (error) {
      const errorTime = new Date();
      const errorDuration = errorTime.getTime() - startTime.getTime();
      
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] === PROCESS FAILED ===`);
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Error time: ${errorTime.toISOString()}`);
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Duration before error: ${errorDuration}ms`);
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Error type: ${error?.constructor?.name || 'Unknown'}`);
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Error message:`, error);
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Final error message: ${errorMessage}`);
      
      onError?.(errorMessage);
      alert(`Failed to generate poster image: ${errorMessage}`);
    } finally {
      const finalTime = new Date();
      const finalDuration = finalTime.getTime() - startTime.getTime();
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] === CLEANUP COMPLETED ===`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Final cleanup time: ${finalTime.toISOString()}`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Total process duration: ${finalDuration}ms`);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Setting isGenerating to false`);
      
      setIsGenerating(false);
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] ========== POSTER GENERATION PROCESS ENDED ==========`);
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
