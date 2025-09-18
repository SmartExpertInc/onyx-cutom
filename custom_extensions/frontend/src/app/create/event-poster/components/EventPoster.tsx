"use client";

import React from "react";

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
  speakerImage?: string | null;
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
  freeAccessConditions,
  speakerImage
}: EventPosterProps) {
  // Parse date to separate day/month and year
  const dateParts = date.split('.');
  const dayMonth = dateParts.slice(0, 2).join('.');
  const year = dateParts.slice(2).join('.');

  return (
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

      {/* Speaker Photo - v1_8 - dynamic image */}
      <div
        className="absolute"
        style={{
          width: '519px',
          height: '713px',
          background: speakerImage 
            ? `url("${speakerImage}")` 
            : 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_8.png")',
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
            <div
              style={{
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Montserrat',
                fontWeight: '400',
                fontSize: '33px',
                textAlign: 'left',
                lineHeight: '1.2'
              }}
            >
              {eventName}:
            </div>

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
              <div
                style={{
                  color: 'rgba(235,235,235,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '600',
                  fontSize: '41px',
                  textAlign: 'left',
                  lineHeight: '1.2'
                }}
              >
                {mainSpeaker}
              </div>
              
              <div
                style={{
                  color: 'rgba(235,235,235,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '400',
                  fontSize: '20px',
                  textAlign: 'left',
                  lineHeight: '1.2'
                }}
              >
                {speakerDescription}
              </div>
            </div>

            {/* Date with border */}
            <div 
              style={{ 
                border: '3px solid #5416af',
                padding: '15px 20px',
                display: 'inline-block'
              }}
            >
              <div
                style={{
                  color: 'rgba(255,255,255,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '600',
                  fontSize: '58px',
                  textAlign: 'center',
                  lineHeight: '1'
                }}
              >
                {dayMonth}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,1)',
                  fontFamily: 'Montserrat',
                  fontWeight: '300',
                  fontSize: '52px',
                  textAlign: 'center',
                  lineHeight: '1',
                  marginTop: '5px'
                }}
              >
                {year}
              </div>
            </div>
          </div>
        </div>

        {/* Left content area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingRight: '50px' }}>
          {/* Topic */}
          <div
            style={{
              color: 'rgba(235,235,235,1)',
              fontFamily: 'Montserrat',
              fontWeight: '600',
              fontSize: '50px',
              textAlign: 'left',
              lineHeight: '1.2',
              maxWidth: '480px'
            }}
          >
            {topic}
          </div>

          {/* Additional Speakers */}
          <div
            style={{
              color: 'rgba(235,235,235,1)',
              fontFamily: 'Montserrat',
              fontWeight: '400',
              fontSize: '20px',
              textAlign: 'left',
              lineHeight: '1.2',
              maxWidth: '460px'
            }}
          >
            {additionalSpeakers}
          </div>
        </div>

        {/* Right area - empty space for speaker image */}
        <div></div>

        {/* Bottom section - spanning both columns */}
        <div className="col-span-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '50px' }}>
          {/* Ticket price section */}
          <div 
            style={{ 
              border: '2px solid #5416af',
              borderRadius: '40px',
              padding: '15px 20px',
              minWidth: '200px',
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
                fontWeight: '400',
                fontSize: '25px',
                textAlign: 'center'
              }}
            >
              Квиток
            </div>
            <div
              style={{
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Montserrat',
                fontWeight: '400',
                fontSize: '27px',
                textAlign: 'center',
                marginTop: '4px'
              }}
            >
              {ticketType}
            </div>
            <div
              style={{
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Montserrat',
                fontWeight: '900',
                fontSize: '41px',
                textAlign: 'center',
                marginTop: '2px'
              }}
            >
              {ticketPrice}
            </div>
          </div>

          {/* Free access conditions */}
          <div
            style={{
              color: 'rgba(235,235,235,1)',
              fontWeight: '400',
              fontSize: '37px',
              textAlign: 'center',
              lineHeight: '1.2',
              backgroundColor: '#5416af',
              borderRadius: '40px',
              padding: '20px 30px',
              boxShadow: '0 0 30px rgba(84,22,175,1), 0 0 60px rgba(84,22,175,0.5)',
              backdropFilter: 'blur(5px)',
              maxWidth: '700px',
              marginLeft: '30px'
            }}
          >
            {freeAccessConditions}
          </div>
        </div>
      </div>
    </div>
  );
}