"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EventPoster from "../components/EventPoster";
import { useLanguage } from '../../../../contexts/LanguageContext';

function EventPosterResultsContent() {
  const router = useRouter();
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

  useEffect(() => {
    // Get data from localStorage
    const savedData = localStorage.getItem('eventPosterData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setEventData(parsedData);
        // Clean up localStorage after loading
        localStorage.removeItem('eventPosterData');
      } catch (error) {
        console.error('Failed to parse event data from localStorage:', error);
        // Fallback to empty data or redirect to questionnaire
        router.push('/create/event-poster/questionnaire');
      }
    } else {
      // No data found, redirect to questionnaire
      router.push('/create/event-poster/questionnaire');
    }
  }, [router]);

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
  return <EventPosterResultsContent />;
}
