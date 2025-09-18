"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventPoster from "../components/EventPoster";

interface EventData {
  eventName: string;
  mainSpeaker: string;
  speakerDescription: string;
  date: string;
  topic: string;
  additionalSpeakers: string;
  ticketPrice: string;
  ticketType: string;
  freeAccessConditions: string;
  speakerImage: string | null;
}

function EventPosterResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const sessionId = searchParams?.get('sessionId');
        
        if (!sessionId) {
          setError('No session data found');
          setLoading(false);
          return;
        }

        const response = await fetch(`/custom-projects-ui/api/event-poster/session/${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          setEventData(data);
        } else {
          setError('Failed to load event data');
        }
      } catch (err) {
        setError('An error occurred while loading data');
        console.error('Error fetching event data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [searchParams]);

  const handleBackToQuestionnaire = () => {
    router.push('/custom-projects-ui/create/event-poster/questionnaire');
  };

  const handleBackToProjects = () => {
    router.push('/custom-projects-ui/projects');
  };

  if (loading) {
    return (
      <main className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event poster...</p>
        </div>
      </main>
    );
  }

  if (error || !eventData) {
    return (
      <main className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error || 'Failed to load event data'}</p>
          <button
            onClick={handleBackToQuestionnaire}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Questionnaire
          </button>
        </div>
      </main>
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

          {/* Event Poster Component */}
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
              speakerImage={eventData.speakerImage}
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
