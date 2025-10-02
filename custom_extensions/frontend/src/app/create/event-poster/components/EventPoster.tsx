"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image, Loader, Edit3, Save } from 'lucide-react';
import { useLanguage } from "../../../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";

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
  // Props for saved poster functionality
  projectId?: string; // Project ID for auto-save
}

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  style: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
  isTitle?: boolean;
  onAutoSave?: () => void; // Add auto-save callback
  debouncedAutoSave?: (immediate?: boolean) => void; // Add debounced auto-save
}

function EditableText({ value, onChange, style, multiline = false, placeholder, isTitle = false, onAutoSave }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Check if this is a large font field (like date)
  const isLargeFont = style && (style.fontSize === '58px' || style.fontSize === '52px');

  const handleClick = () => {
    setIsEditing(true);
    setTempValue(value);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleSave = () => {
    // Get the current value directly from the DOM element (same as audits)
    const currentValue = inputRef.current?.value || tempValue;
    console.log('🔄 [EVENT_POSTER_EDIT] Saving value directly from DOM:', currentValue);
    onChange(currentValue);
    setIsEditing(false);
    // Trigger auto-save immediately (same as audits)
    if (onAutoSave) {
      console.log('🔄 [EVENT_POSTER_AUTO_SAVE] Triggering auto-save immediately');
      onAutoSave();
    }
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

  if (isEditing) {
    const Component = multiline ? 'textarea' : 'input';
    // For large font fields (like date), set fixed height and font size for input
    const inputStyle: React.CSSProperties = {
      ...style,
      background: 'transparent',
      border: '2px solid #5416af',
      outline: 'none',
      resize: multiline ? 'none' : undefined,
      minHeight: multiline ? (isTitle ? '260px' : '100px') : undefined,
      height: isLargeFont ? style.fontSize : undefined,
      fontSize: style.fontSize,
      padding: isLargeFont ? '0 8px' : undefined,
      lineHeight: style.lineHeight || '1.2',
      boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
      width: '100%',
      textAlign: style.textAlign || 'left',
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      color: style.color,
      borderRadius: '4px',
    };
    return (
              <Component
          ref={inputRef as any}
          value={tempValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setTempValue(newValue);
            // Save on every keystroke - real-time auto-save
            console.log('⌨️ [EVENT_POSTER_EDIT] Keystroke detected, saving:', newValue);
            onChange(newValue);
            // Trigger auto-save immediately on every change
            if (onAutoSave) {
              console.log('🔄 [EVENT_POSTER_AUTO_SAVE] Triggering auto-save on keystroke');
              onAutoSave();
            }
          }}
          onBlur={() => {
            // Get the current value directly from the DOM element (same as audits)
            const currentValue = inputRef.current?.value || tempValue;
            console.log('👋 [EVENT_POSTER_EDIT] Focus lost - ensuring final save:', currentValue);
            onChange(currentValue);
            setIsEditing(false);
            // Trigger auto-save immediately (same as audits)
            if (onAutoSave) {
              console.log('🔄 [EVENT_POSTER_AUTO_SAVE] Triggering auto-save on blur');
              onAutoSave();
            }
          }}
          onKeyDown={(e) => {
            // Save on Enter or Escape
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
          }}
          style={inputStyle}
          placeholder={placeholder}
          autoFocus
        />
    );
  }

  const hoverPadding = isLargeFont ? 'p-4 -m-4' : 'p-2 -m-2';
  
  return (
    <div
      onClick={handleClick}
      style={{
        ...style,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      className={`hover:bg-white hover:bg-opacity-70 hover:shadow-lg rounded-lg ${hoverPadding} group`}
      title="Click to edit"
    >
      {value || placeholder}
      <Edit3 
        size={isLargeFont ? 20 : 16} 
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-70 transition-opacity" 
        style={{ color: 'rgba(255,255,255,0.7)' }}
      />
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
  onError,
  projectId
}: EventPosterProps) {
  const { t } = useLanguage();
  const router = useRouter();
  
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

  // Click outside handler to stop editing (same as audits)
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Check if any field is being edited
      const editingInputs = document.querySelectorAll('input, textarea');
      let editingElement: HTMLInputElement | HTMLTextAreaElement | null = null;

      editingInputs.forEach((input) => {
        if (input === document.activeElement || input.matches(':focus')) {
          editingElement = input as HTMLInputElement | HTMLTextAreaElement;
        }
      });

      if (editingElement) {
        // Check if click is outside any editing input
        const target = event.target as HTMLElement;
        if (!target.closest('input, textarea')) {
          console.log('🖱️ [EVENT_POSTER_EDIT] Clicked outside - forcing blur to save value');
          // Force blur on the editing element to trigger auto-save
          (editingElement as HTMLInputElement | HTMLTextAreaElement).blur();
        }
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  // Auto-save functionality (same pattern as course outlines)
  const handleAutoSave = async () => {
    if (!projectId) {
      console.log('🔄 [EVENT_POSTER_AUTO_SAVE] No project ID, skipping auto-save');
      return;
    }

    console.log('🔄 [EVENT_POSTER_AUTO_SAVE] Starting auto-save for project:', projectId);

    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
      
      // Prepare the payload with current state (same format as course outlines)
      // Use current state values at the time of auto-save
      const eventData = {
        eventName,
        mainSpeaker,
        speakerDescription,
        date,
        topic,
        additionalSpeakers,
        ticketPrice,
        ticketType,
        freeAccessConditions,
        speakerImageSrc: imageSrc // Use speakerImageSrc to match the prop name
      };

      const payload = { 
        microProductContent: eventData 
      };

      console.log('🔄 [EVENT_POSTER_AUTO_SAVE] Sending payload with current values:', payload);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/event-poster/update/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('🔄 [EVENT_POSTER_AUTO_SAVE] Failed:', response.status);
        return; // Silent fail for auto-save
      }

      const data = await response.json();
      console.log('✅ [EVENT_POSTER_AUTO_SAVE] Success:', data);

    } catch (error) {
      console.error('🔄 [EVENT_POSTER_AUTO_SAVE] Error:', error);
      // Silent fail for auto-save - don't show error to user
    }
  };

  // Parse date to separate day/month and year - with safety check
  const safeDateValue = date || '';
  const dateParts = safeDateValue.split('.');
  const dayMonth = dateParts.slice(0, 2).join('.');
  const year = dateParts.slice(2).join('.');

  // Determine speaker image source
  const imageSrc = speakerImageSrc || "/custom-projects-ui/create/event-poster/figma-to-html/images/v1_8.png";

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
      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="download"
          onClick={handleDownloadPoster}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full transition-colors ${
            isGenerating
              ? 'bg-blue-500 text-white cursor-not-allowed focus:ring-blue-500 disabled:opacity-60'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer focus:ring-blue-500'
          }`}
          title={isGenerating ? t('interface.eventPosterForm.posterGenerationInProgress', 'Poster image generation in progress...') : t('interface.eventPosterForm.generateAndDownloadPosterTooltip', 'Generate and download poster image')}
        >
          {isGenerating ? <Loader size={16} className="animate-spin" /> : <Image size={16} />}
          {isGenerating ? `${t('interface.eventPosterForm.generatingPoster', 'Generating Poster...')}` : `${t('interface.eventPosterForm.generateAndDownloadPoster', 'Generate and Download Poster')}`}
        </Button>
      </div>

      {/* Editable Fields Info */}
      <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <Edit3 size={16} className="inline mr-2" />
        {t('interface.eventPosterForm.editInstructions', 'Click on any text in the poster to edit it. Press Enter to save, Escape to cancel.')}
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
              placeholder="Event Name"
              onAutoSave={handleAutoSave}
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
                placeholder="Main Speaker Name"
                onAutoSave={handleAutoSave}
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
                placeholder="Speaker Description"
                multiline
                onAutoSave={handleAutoSave}
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
                onChange={(newDayMonth) => {
                  const newFullDate = year ? `${newDayMonth}.${year}` : newDayMonth;
                  setDate(newFullDate);
                }}
                placeholder="DD.MM"
                onAutoSave={handleAutoSave}
                style={{
                  color: 'rgba(235,235,235,1)',
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
                onChange={(newYear) => {
                  const newFullDate = dayMonth ? `${dayMonth}.${newYear}` : newYear;
                  setDate(newFullDate);
                }}
                placeholder="YYYY"
                onAutoSave={handleAutoSave}
                style={{
                  color: 'rgba(235,235,235,1)',
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
            placeholder="Event Topic"
            multiline
            isTitle={true}
            onAutoSave={handleAutoSave}
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
            placeholder="Additional Speakers"
            multiline
            onAutoSave={handleAutoSave}
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
              Квиток
            </div>
            <EditableText
              value={ticketType}
              onChange={setTicketType}
              placeholder="Type"
              onAutoSave={handleAutoSave}
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
              placeholder="Price"
              onAutoSave={handleAutoSave}
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
              maxWidth: '1400px',
              boxShadow: '0 0 30px rgba(84,22,175,1), 0 0 60px rgba(84,22,175,0.5)',
              backdropFilter: 'blur(5px)',
              transition: 'background 0.2s',
              backgroundColor: '#5416af',
            }}
          >
            <EditableText
              value={freeAccessConditions}
              onChange={setFreeAccessConditions}
              placeholder="Free Access Conditions"
              multiline
              onAutoSave={handleAutoSave}
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