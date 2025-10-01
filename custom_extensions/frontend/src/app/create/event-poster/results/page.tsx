"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventPoster from "../components/EventPoster";
import { useLanguage } from '../../../../contexts/LanguageContext';

function EventPosterResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // State for event data
  const [eventData, setEventData] = useState({
    eventName: '',
    mainSpeaker: '',
    speakerDescription: '',
    date: '',
    topic: '',
    additionalSpeakers: '',
    ticketPrice: '',
    ticketType: '',
    freeAccessConditions: '',
    speakerImage: null as string | null
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session key from URL
    const sessionKey = searchParams?.get('sessionKey');
    
    if (!sessionKey) {
      console.error('No session key found in URL');
      router.push('/create/event-poster/questionnaire');
      return;
    }

    // Get data from localStorage using the session key
    const savedData = localStorage.getItem(sessionKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('🔍 [EVENT POSTER RESULTS] Raw savedData from localStorage:', savedData);
        console.log('🔍 [EVENT POSTER RESULTS] Parsed data type:', typeof parsedData);
        console.log('🔍 [EVENT POSTER RESULTS] Parsed data:', parsedData);
        
        // Ensure we have all the required fields with defaults
        const completeEventData = {
          eventName: parsedData.eventName || '',
          mainSpeaker: parsedData.mainSpeaker || '',
          speakerDescription: parsedData.speakerDescription || '',
          date: parsedData.date || '',
          topic: parsedData.topic || '',
          additionalSpeakers: parsedData.additionalSpeakers || '',
          ticketPrice: parsedData.ticketPrice || '',
          ticketType: parsedData.ticketType || '',
          freeAccessConditions: parsedData.freeAccessConditions || '',
          speakerImage: parsedData.speakerImage || null
        };
        
        console.log('🔍 [EVENT POSTER RESULTS] Complete event data:', completeEventData);
        setEventData(completeEventData);
        
        // Clean up localStorage after loading (with small delay to ensure data is used)
        setTimeout(() => {
          localStorage.removeItem(sessionKey);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to parse event data from localStorage:', error);
        router.push('/create/event-poster/questionnaire');
      }
    } else {
      console.error('No data found for session key:', sessionKey);
      router.push('/create/event-poster/questionnaire');
    }
    
    setIsLoading(false);
  }, [router, searchParams]);

  const handleBackToQuestionnaire = () => {
    router.push('/create/event-poster/questionnaire');
  };

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const handleSuccess = (message: string) => {
    console.log('✅ Poster download success:', message);
  };

  const handleError = (error: string) => {
    console.error('❌ Poster download error:', error);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAsProduct = async () => {
    setIsSaving(true);
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      
      // Use simple direct database insertion approach like audits
      const posterData = {
        eventName: eventData.eventName,
        mainSpeaker: eventData.mainSpeaker,
        speakerDescription: eventData.speakerDescription,
        date: eventData.date,
        topic: eventData.topic,
        additionalSpeakers: eventData.additionalSpeakers,
        ticketPrice: eventData.ticketPrice,
        ticketType: eventData.ticketType,
        freeAccessConditions: eventData.freeAccessConditions,
        speakerImage: eventData.speakerImage
      };

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      // Try to create a dedicated endpoint for event posters
      const response = await fetch(`${CUSTOM_BACKEND_URL}/event-poster/save`, {
        method: 'POST',
        headers,
        body: JSON.stringify(posterData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to save poster as product" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const savedProduct = await response.json();
      console.log('✅ Event poster saved as product:', savedProduct);
      
      // Show success message
      alert(t('interface.eventPosterForm.posterSavedSuccessfully', 'Event poster saved successfully! You can find it in your Projects page.'));
      
    } catch (error) {
      console.error('❌ Failed to save poster as product:', error);
      alert(t('interface.eventPosterForm.failedToSavePoster', 'Failed to save poster as product. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event poster...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-x-4">
            <button
              onClick={handleBackToQuestionnaire}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
{t('interface.eventPosterForm.editQuestionnaire', 'Edit Questionnaire')}
            </button>
            
                        <button
              onClick={handleBackToProjects}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              {t('interface.eventPosterForm.backToProjects', 'Back to Projects')}
            </button>

            <button
              onClick={handleSaveAsProduct}
              disabled={isSaving}
              className={`text-white font-medium flex items-center px-4 py-2 rounded-md transition-colors cursor-pointer ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSaving 
                ? t('interface.eventPosterForm.savingPoster', 'Saving...') 
                : t('interface.eventPosterForm.saveAsProduct', 'Save as Product')
              }
            </button>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 shadow-xl rounded-xl border border-gray-200">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('interface.eventPosterForm.eventPosterTitle', 'Event Poster')}</h1>
            <p className="text-gray-600">{t('interface.eventPosterForm.posterGeneratedSuccessfully', 'Your event poster has been generated successfully')}</p>
          </div>

          {/* Event Poster Component with integrated download functionality */}
          <div className="flex justify-center">
            <EventPoster
              eventName={eventData.eventName}
              mainSpeaker={eventData.mainSpeaker}
              speakerDescription={eventData.speakerDescription}
              date={eventData.date}
              topic={eventData.topic}
              additionalSpeakers={eventData.additionalSpeakers}
              ticketPrice={eventData.ticketPrice}
              ticketType={eventData.ticketType}
              freeAccessConditions={eventData.freeAccessConditions}
              speakerImageSrc={eventData.speakerImage || undefined}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EventPosterResults() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EventPosterResultsContent />
    </Suspense>
  );
}
