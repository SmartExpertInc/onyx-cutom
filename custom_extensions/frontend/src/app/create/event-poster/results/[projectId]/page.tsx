"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import EventPoster from "../../components/EventPoster";
import { useLanguage } from '../../../../../contexts/LanguageContext';

export default function EventPosterProjectResults() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const projectId = params?.projectId as string;

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventPosterData = async () => {
      try {
        console.log(`🔍 [EVENT_POSTER_FETCH] Starting data fetch for project ID: ${projectId}`);
        
        if (!projectId) {
          console.error('❌ [EVENT_POSTER_FETCH] Project ID is required');
          setError('Project ID is required');
          setIsLoading(false);
          return;
        }
        
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
        const apiUrl = `${CUSTOM_BACKEND_URL}/event-poster/${projectId}`;
        
        console.log(`📡 [EVENT_POSTER_FETCH] Making API request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        console.log(`📡 [EVENT_POSTER_FETCH] API response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [EVENT_POSTER_FETCH] API request failed: ${response.status} - ${errorText}`);
          throw new Error(`Failed to fetch event poster data: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`📥 [EVENT_POSTER_FETCH] Data received from API:`, data);
        
        // Set the event data from the API response
        if (data.eventData) {
          setEventData(data.eventData);
        } else {
          console.error('❌ [EVENT_POSTER_FETCH] No eventData in response');
          setError('No event poster data found');
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error(`❌ [EVENT_POSTER_FETCH] Error:`, error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchEventPosterData();
  }, [projectId]);

  const handleBackToQuestionnaire = () => {
    router.push('/create/event-poster/questionnaire');
  };

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const handleSuccess = (message: string) => {
    console.log('✅ Poster action success:', message);
  };

  const handleError = (error: string) => {
    console.error('❌ Poster action error:', error);
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

  // Show error state
  if (error) {
    return (
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Event Poster</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToProjects}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Back to Projects
          </button>
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
              {t('interface.common.back', 'Back')}
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
              projectId={projectId}
              hideSaveButton={true}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 