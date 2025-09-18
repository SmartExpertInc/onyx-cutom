"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventPoster from "../components/EventPoster";
import PosterDownloadButton from "../../../../components/PosterDownloadButton";

function EventPosterResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract data from URL parameters
  const eventName = searchParams?.get('eventName') || '';
  const mainSpeaker = searchParams?.get('mainSpeaker') || '';
  const speakerDescription = searchParams?.get('speakerDescription') || '';
  const date = searchParams?.get('date') || '';
  const topic = searchParams?.get('topic') || '';
  const additionalSpeakers = searchParams?.get('additionalSpeakers') || '';
  const ticketPrice = searchParams?.get('ticketPrice') || '';
  const ticketType = searchParams?.get('ticketType') || '';
  const freeAccessConditions = searchParams?.get('freeAccessConditions') || '';
  const hasCustomSpeakerImage = searchParams?.get('hasCustomSpeakerImage') === 'true';
  
  const [speakerImageSrc, setSpeakerImageSrc] = useState<string>('');

  useEffect(() => {
    if (hasCustomSpeakerImage) {
      const savedImage = localStorage.getItem('temp_speaker_image');
      if (savedImage) {
        setSpeakerImageSrc(savedImage);
        // Clean up localStorage
        localStorage.removeItem('temp_speaker_image');
      }
    }
  }, [hasCustomSpeakerImage]);

  const handleBackToQuestionnaire = () => {
    router.push('/create/event-poster/questionnaire');
  };

  const handleBackToProjects = () => {
    router.push('/projects');
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
              Edit Questionnaire
            </button>
            
            <button
              onClick={handleBackToProjects}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              Back to Projects
            </button>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 shadow-xl rounded-xl border border-gray-200">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Poster</h1>
                <p className="text-gray-600">Your event poster has been generated successfully</p>
              </div>

              {/* Download Button */}
              <div className="mb-8 flex justify-center">
                <PosterDownloadButton 
                  posterData={{
                    eventName,
                    mainSpeaker,
                    speakerDescription,
                    date,
                    topic,
                    additionalSpeakers,
                    ticketPrice,
                    ticketType,
                    freeAccessConditions,
                    speakerImageSrc
                  }}
                  projectName={eventName || 'event-poster'}
                />
              </div>

              {/* Event Poster Component */}
              <div className="flex justify-center">
                <EventPoster
                  eventName={eventName}
                  mainSpeaker={mainSpeaker}
                  speakerDescription={speakerDescription}
                  date={date}
                  topic={topic}
                  additionalSpeakers={additionalSpeakers}
                  ticketPrice={ticketPrice}
                  ticketType={ticketType}
                  freeAccessConditions={freeAccessConditions}
                  speakerImageSrc={speakerImageSrc}
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
          <p className="text-gray-600">Loading event poster results...</p>
        </div>
      </div>
    }>
      <EventPosterResultsContent />
    </Suspense>
  );
}
