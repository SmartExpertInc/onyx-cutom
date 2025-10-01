"use client";

import React, { useState } from 'react';
import EventPoster from '../app/create/event-poster/components/EventPoster';

interface EventPosterViewProps {
  dataToDisplay: any;
  isEditing: boolean;
  onTextChange?: (updatedData: any) => void;
  parentProjectName?: string;
}

export const EventPosterView: React.FC<EventPosterViewProps> = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  parentProjectName
}) => {
  const [posterData, setPosterData] = useState(dataToDisplay || {});

  // Handle changes from the EventPoster component
  const handlePosterChange = (field: string, value: string) => {
    const updatedData = {
      ...posterData,
      [field]: value
    };
    setPosterData(updatedData);
    
    // Notify parent component about changes
    if (onTextChange) {
      onTextChange(updatedData);
    }
  };

  // Extract poster data from saved content
  const eventName = posterData.eventName || '';
  const mainSpeaker = posterData.mainSpeaker || '';
  const speakerDescription = posterData.speakerDescription || '';
  const date = posterData.date || '';
  const topic = posterData.topic || '';
  const additionalSpeakers = posterData.additionalSpeakers || '';
  const ticketPrice = posterData.ticketPrice || '';
  const ticketType = posterData.ticketType || '';
  const freeAccessConditions = posterData.freeAccessConditions || '';
  const speakerImage = posterData.speakerImage || null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {eventName || 'Event Poster'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Edit your event poster by clicking on any text' : 'View your saved event poster'}
        </p>
      </div>

      {/* Event Poster Display */}
      <div className="flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
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
            speakerImageSrc={speakerImage}
            onSuccess={(message) => console.log('Poster action success:', message)}
            onError={(error) => console.error('Poster action error:', error)}
          />
        </div>
      </div>

      {/* Instructions for editing */}
      {isEditing && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Editing Mode:</strong> Click on any text element in the poster above to edit it directly. 
                Changes will be saved automatically when you finish editing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 