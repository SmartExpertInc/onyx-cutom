"use client";

import React from "react";
import Image from "next/image";

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
}

export default function EventPoster({
  eventName,
  mainSpeaker,
  speakerDescription,
  date,
  topic,
  additionalSpeakers,
  ticketPrice,
  ticketType,
  freeAccessConditions
}: EventPosterProps) {
  return (
    <div className="w-[1000px] h-[1000px] bg-black relative overflow-hidden mx-auto" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/custom-projects-ui/create/event-poster/background.jpg"
          alt="Background"
          width={1000}
          height={1000}
          className="object-cover"
          priority
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Section */}
        <div className="flex justify-between items-start p-8 pt-12">
          {/* Left Side - Main Title */}
          <div className="flex-1">
            <h1 className="text-white mb-8 leading-tight" style={{ fontSize: '34px', fontWeight: '400', textTransform: 'uppercase' }}>
              {eventName}:
            </h1>
          </div>
          
          {/* Right Side - Logo and Date */}
          <div className="text-right">
            <div className="text-white mb-4" style={{ fontSize: '34px', fontWeight: '400', textTransform: 'uppercase' }}>
              <div>FUTURE</div>
              <div>BUSINESS</div>
              <div>CLUB</div>
            </div>
            <div className="bg-purple-600 text-white px-6 py-3 rounded-lg" style={{ fontSize: '52px', fontWeight: '300' }}>
              {date}
            </div>
          </div>
        </div>
        
        {/* Middle Section */}
        <div className="flex-1 flex items-center px-8 py-12">
          <div className="flex w-full">
            {/* Left Side - Speaker Info and Topic */}
            <div className="flex-1 pr-8">
              {/* Main Speaker Name */}
              <h2 className="text-white mb-6" style={{ fontSize: '42px', fontWeight: '600' }}>
                {mainSpeaker}
              </h2>
              
              {/* Speaker Description */}
              <p className="text-white mb-8 leading-relaxed max-w-2xl" style={{ fontSize: '20px', fontWeight: '400' }}>
                {speakerDescription}
              </p>
              
              {/* Event Topic */}
              <h3 className="text-white mb-6" style={{ fontSize: '50px', fontWeight: '600' }}>
                {topic}
              </h3>
              
              {/* Additional Speakers */}
              <p className="text-white" style={{ fontSize: '20px', fontWeight: '400' }}>
                {additionalSpeakers}
              </p>
            </div>
            
            {/* Right Side - Speaker Photo */}
            <div className="w-[1000px] h-[1000px] relative">
              <Image
                src="/custom-projects-ui/create/event-poster/person.png"
                alt={mainSpeaker}
                width={1000}
                height={1000}
                className="object-cover rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Ticket Information */}
        <div className="px-8 pb-12">
          <div className="flex justify-between items-center">
            {/* Left - Ticket Price */}
            <div className="bg-gray-800 border-2 border-gray-600 text-white px-8 py-4 rounded-lg">
              <span style={{ fontSize: '25px', fontWeight: '400' }}>Ticket </span>
              <span style={{ fontSize: '40px', fontWeight: '900' }}>{ticketPrice.replace('Ticket ', '')}</span>
            </div>
            
            {/* Right - Free Access */}
            <div className="bg-purple-600 text-white px-8 py-4 rounded-lg" style={{ fontSize: '38px', fontWeight: '400' }}>
              {freeAccessConditions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
