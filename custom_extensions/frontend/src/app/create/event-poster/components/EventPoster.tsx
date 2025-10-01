"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image, Loader, Edit3 } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface EventPosterProps {
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
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  style: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}

function EditableText({ value, onChange, style, multiline = false, placeholder }: EditableTextProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleClick = () => {
    setIsEditing(true);
    setTempValue(value);
    setTimeout(() => {
      inputRef.current?.focus();
      if (!multiline) {
        (inputRef.current as HTMLInputElement | null)?.select?.();
      }
    }, 0);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'inline-block', position: 'relative' }}
      onClick={!isEditing ? handleClick : undefined}
      title={!isEditing ? t('poster.clickToEdit', 'Click to edit') : undefined}
      className={!isEditing ? 'group cursor-pointer' : undefined}
    >
      {!isEditing ? (
        <div
          style={{
            ...style,
            transition: 'box-shadow 0.15s ease',
            boxShadow: 'none'
          }}
        >
          {value || placeholder}
          <Edit3
            size={16}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-70 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }}
          />
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0 }}>
          {multiline ? (
            <textarea
              ref={inputRef as any}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              style={{
                ...style,
                width: '100%',
                height: '100%',
                margin: 0,
                padding: style?.padding as any,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
                resize: 'none' as React.CSSProperties['resize']
              }}
              placeholder={placeholder}
            />
          ) : (
            <input
              ref={inputRef as any}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              style={{
                ...style,
                width: '100%',
                height: '100%',
                margin: 0,
                padding: style?.padding as any,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                boxSizing: 'border-box' as React.CSSProperties['boxSizing']
              }}
              placeholder={placeholder}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function EventPoster({
  eventName: initialEventName,
  mainSpeaker: initialMainSpeaker,
  speakerDescription: initialSpeakerDescription,
  date: initialDate,
  topic: initialTopic,
  additionalSpeakers: initialAdditionalSpeakers,
  ticketPrice: initialTicketPrice,
  ticketType: initialTicketType,
  freeAccessConditions: initialFreeAccessConditions,
  speakerImageSrc,
  onSuccess,
  onError
}: EventPosterProps) {
  const { t } = useLanguage();
  // State for editable fields
  const [eventName, setEventName] = useState(initialEventName);
  const [mainSpeaker, setMainSpeaker] = useState(initialMainSpeaker);
  const [speakerDescription, setSpeakerDescription] = useState(initialSpeakerDescription);
  const [date, setDate] = useState(initialDate);
  const [topic, setTopic] = useState(initialTopic);
  const [additionalSpeakers, setAdditionalSpeakers] = useState(initialAdditionalSpeakers);
  const [ticketPrice, setTicketPrice] = useState(initialTicketPrice);
  const [ticketType, setTicketType] = useState(initialTicketType);
  const [freeAccessConditions, setFreeAccessConditions] = useState(initialFreeAccessConditions);
  const [isGenerating, setIsGenerating] = useState(false);

  // Parse date to separate day/month and year
  const dateParts = date.split('.');
  const dayMonth = dateParts.slice(0, 2).join('.');
  const year = dateParts.slice(2).join('.');

  // Determine speaker image source
  const imageSrc = speakerImageSrc || "/custom-projects-ui/create/event-poster/figma-to-html/images/v1_8.png";

  // Helper to fetch image and convert to data URL for saving (ensures PDF/server sees proper image)
  const toDataUrl = async (src: string): Promise<string> => {
    // If already data URL, return
    if (src.startsWith('data:image/')) return src;
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  };

  const handleSavePoster = async () => {
    try {
      const dataUrl = await toDataUrl(imageSrc);
      const payload = {
        eventName,
        mainSpeaker,
        speakerDescription,
        date,
        topic,
        additionalSpeakers,
        ticketPrice,
        ticketType,
        freeAccessConditions,
        posterImageDataUrl: dataUrl,
      };
      const res = await fetch(`${CUSTOM_BACKEND_URL}/posters/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Failed to save poster');
      }
      const result = await res.json();
      onSuccess?.(result?.id ? `Saved (ID: ${result.id})` : 'Saved');
    } catch (e: any) {
      onError?.(e?.message || 'Failed to save poster');
    }
  };

  // Download functionality
  const handleDownloadPoster = async () => {
    const startTime = new Date();
    const sessionId = `poster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      setIsGenerating(true);
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Starting poster generation with current state`);
      
      // Prepare poster data payload with current state
      const posterPayload = {
        eventName,
        mainSpeaker,
        speakerDescription,
        date,
        topic,
        additionalSpeakers,
        ticketPrice,
        ticketType,
        freeAccessConditions,
        speakerImageSrc: imageSrc,
        format: 'poster',
        dimensions: { width: 1000, height: 1000 },
        sessionId,
        clientTimestamp: startTime.toISOString()
      };
      
      console.log(`📷 [POSTER_DOWNLOAD] [${sessionId}] Payload:`, posterPayload);

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
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {
            // Keep default error message
          }
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Received empty image file from server');
      }

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      let cleanProjectName = (eventName || 'poster').replace(/[^a-zA-Z0-9]+/g, '-');
      cleanProjectName = cleanProjectName.replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
      const filename = `poster-${cleanProjectName ? cleanProjectName + '-' : ''}${timestamp}.png`;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      onSuccess?.(`Poster image generated and downloaded: ${filename}`);
      
    } catch (error) {
      console.error(`📷 [POSTER_DOWNLOAD] [${sessionId}] Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      alert(`Failed to generate poster image: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSavePoster}
            className="inline-flex items-center px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
            disabled={isGenerating}
            title={t('poster.actions.saveTitle', 'Save poster to Products')}
          >
            {t('poster.actions.save', 'Save Poster')}
          </button>
          <button
            onClick={handleDownloadPoster}
            className="inline-flex items-center px-3 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50"
            disabled={isGenerating}
            title={isGenerating ? t('poster.actions.generatingTitle', 'Poster image generation in progress...') : t('poster.actions.generateTitle', 'Generate and download poster image')}
          >
            {isGenerating ? t('poster.actions.generating', 'Generating Poster...') : t('poster.actions.generate', 'Generate and Download Poster')}
          </button>
        </div>
      </div>

      {/* Editable Fields Info */}
      <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <Edit3 size={16} className="inline mr-2" />
        {t('poster.editHint', 'Click on any text in the poster to edit it. Press Enter to save, Escape to cancel.')}
      </div>

      {/* Poster */}
      <div 
        className="relative overflow-hidden mx-auto"
        style={{ 
          width: '1000px',
          height: '1000px',
          background: 'rgba(255,255,255,1)',
          fontFamily: 'Montserrat, sans-serif',
          boxSizing: 'border-box'
        }}
      >
      {/* Main background - v1_5 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_5.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
        }}
      />

      {/* Speaker Photo - Dynamic */}
      <div
        className="absolute"
        style={{
          width: '519px',
          height: '713px',
          background: `url("${imageSrc}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '329px',
          left: '525px',
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute"
        style={{
          width: '1000px',
          height: '455px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,1) 100%)',
          top: '552px',
          left: '1px',
        }}
      />

      {/* Main content grid layout */}
      <div className="relative z-10 h-full" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto 1fr auto', padding: '53px' }}>
        
        {/* Header section - spanning both columns */}
        <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '40px' }}>
          
          {/* First row: Event name and Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between'}}>
            {/* Event name */}
            <EditableText
              value={eventName}
              onChange={setEventName}
              placeholder={t('eventPosterForm.eventNamePlaceholder', 'Enter event name')}
              style={{
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Montserrat',
                fontWeight: '400',
                fontSize: '33px',
                textAlign: 'left',
                lineHeight: '1.2'
              }}
            />

            {/* Logo */}
            <div
              style={{
                width: '141px',
                height: '78px',
                background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_6.png")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
              }}
            />
          </div>

          {/* Second row: Speaker info and Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Speaker name and description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
              <EditableText
                value={mainSpeaker}
                onChange={setMainSpeaker}
                placeholder={t('eventPosterForm.mainSpeakerPlaceholder', 'Enter main speaker name')}
                style={{
                  color: 'rgba(235,235,235,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '600',
                  fontSize: '41px',
                  textAlign: 'left',
                  lineHeight: '1.2'
                }}
              />
              
              <EditableText
                value={speakerDescription}
                onChange={setSpeakerDescription}
                placeholder={t('eventPosterForm.speakerDescriptionPlaceholder', 'Enter speaker description')}
                multiline
                style={{
                  color: 'rgba(235,235,235,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '400',
                  fontSize: '18px',
                  textAlign: 'left',
                  lineHeight: '1.2'
                }}
              />
            </div>

            {/* Date with border */}
            <div 
              style={{ 
                border: '3px solid #5416af',
                padding: '15px 20px',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              <EditableText
                value={dayMonth}
                onChange={val => {
                  // Update only the dayMonth part, keep year unchanged
                  const newDate = val + (year ? '.' + year : '');
                  setDate(newDate);
                }}
                placeholder={t('poster.placeholders.dayMonth', 'DD.MM')}
                style={{
                  color: 'rgba(255,255,255,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '600',
                  fontSize: '58px',
                  textAlign: 'center',
                  lineHeight: '1',
                  background: 'transparent',
                  marginBottom: '0',
                }}
              />
              <EditableText
                value={year}
                onChange={val => {
                  // Update only the year part, keep dayMonth unchanged
                  const newDate = dayMonth + (val ? '.' + val : '');
                  setDate(newDate);
                }}
                placeholder={t('poster.placeholders.year', 'YYYY')}
                style={{
                  color: 'rgba(255,255,255,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '300',
                  fontSize: '52px',
                  textAlign: 'center',
                  lineHeight: '1',
                  background: 'transparent',
                  marginTop: '5px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Left content area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingRight: '50px', justifyContent: 'center', height: '100%' }}>
          {/* Topic */}
          <EditableText
            value={topic}
            onChange={setTopic}
            placeholder={t('eventPosterForm.topicPlaceholder', 'Enter topic/title')}
            multiline
            style={{
              color: 'rgba(235,235,235,1)',
              fontFamily: 'Montserrat',
              fontWeight: '600',
              fontSize: '50px',
              textAlign: 'left',
              lineHeight: '1.2',
              maxWidth: '480px'
            }}
          />

          {/* Additional Speakers */}
          <EditableText
            value={additionalSpeakers}
            onChange={setAdditionalSpeakers}
            placeholder={t('eventPosterForm.additionalSpeakersPlaceholder', 'Enter additional speakers')}
            multiline
            style={{
              color: 'rgba(235,235,235,1)',
              fontFamily: 'Montserrat',
              fontWeight: '400',
              fontSize: '20px',
              textAlign: 'left',
              lineHeight: '1.2',
              maxWidth: '460px'
            }}
          />
        </div>

        {/* Right area - empty space for speaker image */}
        <div></div>

        {/* Bottom section - spanning both columns */}
        <div className="col-span-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '50px' }}>
          {/* Ticket price section */}
          <div 
            style={{ 
              border: '2px solid #5416af',
              borderRadius: '30px',
              padding: '10px 14px',
              minWidth: '160px',
              lineHeight: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Montserrat',
                fontWeight: '600',
                fontSize: '25px',
                textAlign: 'center'
              }}
            >
              {t('poster.ticketLabel', 'Ticket')}
            </div>
            <EditableText
              value={ticketType}
              onChange={setTicketType}
              placeholder={t('poster.placeholders.ticketType', 'Type')}
              style={{
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Montserrat',
                fontWeight: '600',
                fontSize: '27px',
                textAlign: 'center',
                marginTop: '4px'
              }}
            />
            <EditableText
              value={ticketPrice}
              onChange={setTicketPrice}
              placeholder={t('poster.placeholders.ticketPrice', 'Price')}
              style={{
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Montserrat',
                fontWeight: '900',
                fontSize: '41px',
                textAlign: 'center',
                marginTop: '2px'
              }}
            />
          </div>

          {/* Free access conditions */}
          <div
            className="group"
            style={{
              borderRadius: '30px',
              marginLeft: '30px',
              maxWidth: '700px',
              boxShadow: '0 0 30px rgba(84,22,175,1), 0 0 60px rgba(84,22,175,0.5)',
              backdropFilter: 'blur(5px)',
              transition: 'background 0.2s',
              backgroundColor: '#5416af',
            }}
          >
            <EditableText
              value={freeAccessConditions}
              onChange={setFreeAccessConditions}
              placeholder={t('poster.placeholders.freeAccessConditions', 'Free Access Conditions')}
              multiline
              style={{
                color: 'rgba(235,235,235,1)',
                fontWeight: '600',
                fontSize: '34px',
                textAlign: 'center',
                lineHeight: '1.2',
                background: 'transparent',
                borderRadius: '30px',
                padding: '10px 16px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}