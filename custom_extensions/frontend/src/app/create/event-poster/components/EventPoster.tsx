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
  // Parse date to separate day/month and year
  const dateParts = date.split('.');
  const dayMonth = dateParts.slice(0, 2).join('.');
  const year = dateParts.slice(2).join('.');

  // Parse ticket price to separate label and price
  const ticketPriceParts = ticketPrice.split(' ');
  const ticketLabel = ticketPriceParts[0];
  const ticketPriceValue = ticketPriceParts.slice(1).join(' ');

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
      {/* Main background - v1_5 without left positioning */}
      <div
        className="absolute inset-0"
        style={{
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_5.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
        }}
      />

      {/* Logo - v1_6 - keeping as absolute */}
      <div
        className="absolute"
        style={{
          width: '141px',
          height: '78px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_6.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '79px',
          left: '776px',
        }}
      />

      {/* Speaker Photo - v1_8 - keeping */}
      <div
        className="absolute"
        style={{
          width: '519px',
          height: '713px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_8.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '329px',
          left: '525px',
        }}
      />

      {/* Bottom gradient - v1_10 - keeping or replacing with CSS gradient */}
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

      {/* Content structure using normal flow */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header section */}
        <div className="flex justify-between items-start" style={{ marginTop: '58px', marginLeft: '53px', marginRight: '53px' }}>
          <div className="flex-1" style={{ maxWidth: '515px' }}>
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
          </div>
          
          {/* Date section with CSS border instead of v1_7 */}
          <div 
            className="text-right" 
            style={{ 
              marginTop: '133px', 
              marginRight: '54px',
              border: '3px solid rgba(255,255,255,0.8)',
              borderRadius: '15px',
              padding: '15px 20px',
              background: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <div
              style={{
                color: 'rgba(255,255,255,1)',
                fontFamily: 'Montserrat',
                fontWeight: '600',
                fontSize: '58px',
                textAlign: 'left',
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
                textAlign: 'left',
                lineHeight: '1',
                marginTop: '9px',
                marginLeft: '23px'
              }}
            >
              {year}
            </div>
          </div>
        </div>

        {/* Speaker section */}
        <div style={{ marginTop: '47px', marginLeft: '52px' }}>
          <div
            style={{
              width: '429px',
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
              width: '645px',
              color: 'rgba(235,235,235,1)',
              fontFamily: 'Montserrat',
              fontWeight: '400',
              fontSize: '20px',
              textAlign: 'left',
              lineHeight: '1.2',
              marginTop: '28px'
            }}
          >
            {speakerDescription}
          </div>
        </div>

        {/* Topic section */}
        <div style={{ marginTop: '127px', marginLeft: '53px' }}>
          <div
            style={{
              width: '480px',
              color: 'rgba(235,235,235,1)',
              fontFamily: 'Montserrat',
              fontWeight: '600',
              fontSize: '50px',
              textAlign: 'left',
              lineHeight: '1.2'
            }}
          >
            {topic}
          </div>
        </div>

        {/* Additional speakers section */}
        <div style={{ marginTop: '255px', marginLeft: '53px' }}>
          <div
            style={{
              width: '460px',
              color: 'rgba(235,235,235,1)',
              fontFamily: 'Montserrat',
              fontWeight: '400',
              fontSize: '20px',
              textAlign: 'left',
              lineHeight: '1.2'
            }}
          >
            {additionalSpeakers}
          </div>
        </div>

        {/* Bottom section with ticket info */}
        <div className="flex items-center justify-between mt-auto" style={{ marginBottom: '56px', marginLeft: '53px', marginRight: '53px' }}>
          {/* Ticket price section with CSS border instead of v1_13 */}
          <div 
            className="flex flex-col" 
            style={{ 
              width: '189px',
              border: '2px solid rgba(235,235,235,0.6)',
              borderRadius: '12px',
              padding: '15px',
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(3px)'
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
              {ticketLabel}
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
              {ticketPriceValue}
            </div>
          </div>

          {/* Free access conditions with CSS styling instead of v1_11 and v1_12 */}
          <div 
            className="flex-1" 
            style={{ 
              marginLeft: '95px', 
              marginTop: '13px',
            }}
          >
            <div
              style={{
                width: '510px',
                color: 'rgba(235,235,235,1)',
                fontFamily: 'Roboto',
                fontWeight: '400',
                fontSize: '37px',
                textAlign: 'center',
                lineHeight: '1.2',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '25px',
                padding: '20px 30px',
                boxShadow: '0 0 30px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.1)',
                backdropFilter: 'blur(5px)'
              }}
            >
              {freeAccessConditions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}