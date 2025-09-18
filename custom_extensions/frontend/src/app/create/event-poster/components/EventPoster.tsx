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
      {/* Background Layer 1 - v1_3 */}
      <div
        className="absolute"
        style={{
          width: '1000px',
          height: '1000px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_3.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '0px',
          left: '0px',
          overflow: 'hidden'
        }}
      />

      {/* Background Layer 2 - v1_4 */}
      <div
        className="absolute"
        style={{
          width: '1000px',
          height: '1000px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_4.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '7px',
          left: '1px',
          overflow: 'hidden'
        }}
      />


      {/* Decorative Element - v1_6 */}
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
          overflow: 'hidden'
        }}
      />

      {/* Decorative Element - v1_7 */}
      <div
        className="absolute"
        style={{
          width: '208px',
          height: '128px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_7.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '184px',
          left: '743px',
          overflow: 'hidden'
        }}
      />

      {/* Speaker Photo - v1_8 */}
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
          overflow: 'hidden'
        }}
      />

      {/* Main Speaker Name - v1_9 */}
      <span
        className="absolute"
        style={{
          width: '429px',
          color: 'rgba(235,235,235,1)',
          top: '164px',
          left: '52px',
          fontFamily: 'Montserrat',
          fontWeight: '600',
          fontSize: '41px',
          textAlign: 'left'
        }}
      >
        {mainSpeaker}
      </span>

      {/* Bottom Background - v1_10 */}
      <div
        className="absolute"
        style={{
          width: '1000px',
          height: '455px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_10.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '552px',
          left: '1px',
          overflow: 'hidden'
        }}
      />

      {/* Ticket Background - v1_11 */}
      <div
        className="absolute"
        style={{
          width: '769px',
          height: '193px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_11.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '793px',
          left: '217px',
          overflow: 'hidden'
        }}
      />

      {/* Free Access Background - v1_12 */}
      <div
        className="absolute"
        style={{
          width: '687px',
          height: '116px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_12.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '832px',
          left: '259px',
          overflow: 'hidden'
        }}
      />

      {/* Ticket Price Background - v1_13 */}
      <div
        className="absolute"
        style={{
          width: '189px',
          height: '111px',
          background: 'url("/custom-projects-ui/create/event-poster/figma-to-html/images/v1_13.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          top: '833px',
          left: '53px',
          overflow: 'hidden'
        }}
      />

      {/* Ticket Type - v1_14 */}
      <span
        className="absolute"
        style={{
          width: '122px',
          color: 'rgba(235,235,235,1)',
          top: '863px',
          left: '87px',
          fontFamily: 'Montserrat',
          fontWeight: '400',
          fontSize: '27px',
          textAlign: 'left'
        }}
      >
        {ticketType}
      </span>

      {/* Ticket Label - v1_15 */}
      <span
        className="absolute"
        style={{
          width: '92px',
          color: 'rgba(235,235,235,1)',
          top: '837px',
          left: '99px',
          fontFamily: 'Montserrat',
          fontWeight: '400',
          fontSize: '25px',
          textAlign: 'left'
        }}
      >
        {ticketLabel}
      </span>

      {/* Ticket Price - v1_16 */}
      <span
        className="absolute"
        style={{
          width: '107px',
          color: 'rgba(235,235,235,1)',
          top: '891px',
          left: '92px',
          fontFamily: 'Montserrat',
          fontWeight: '900',
          fontSize: '41px',
          textAlign: 'left'
        }}
      >
        {ticketPriceValue}
      </span>

      {/* Free Access Conditions - v1_17 */}
      <span
        className="absolute"
        style={{
          width: '510px',
          color: 'rgba(235,235,235,1)',
          top: '846px',
          left: '337px',
          fontFamily: 'Roboto',
          fontWeight: '400',
          fontSize: '37px',
          textAlign: 'left'
        }}
      >
        {freeAccessConditions}
      </span>

      {/* Date Day/Month - v1_18 */}
      <span
        className="absolute"
        style={{
          width: '169px',
          color: 'rgba(255,255,255,1)',
          top: '191px',
          left: '762px',
          fontFamily: 'Montserrat',
          fontWeight: '600',
          fontSize: '58px',
          textAlign: 'left'
        }}
      >
        {dayMonth}
      </span>

      {/* Date Year - v1_19 */}
      <span
        className="absolute"
        style={{
          width: '123px',
          color: 'rgba(255,255,255,1)',
          top: '248px',
          left: '785px',
          fontFamily: 'Montserrat',
          fontWeight: '300',
          fontSize: '52px',
          textAlign: 'left'
        }}
      >
        {year}
      </span>

      {/* Event Topic - v1_20 */}
      <span
        className="absolute"
        style={{
          width: '480px',
          color: 'rgba(235,235,235,1)',
          top: '380px',
          left: '53px',
          fontFamily: 'Montserrat',
          fontWeight: '600',
          fontSize: '50px',
          textAlign: 'left'
        }}
      >
        {topic}
      </span>

      {/* Additional Speakers - v1_21 */}
      <span
        className="absolute"
        style={{
          width: '460px',
          color: 'rgba(235,235,235,1)',
          top: '685px',
          left: '53px',
          fontFamily: 'Montserrat',
          fontWeight: '400',
          fontSize: '20px',
          textAlign: 'left'
        }}
      >
        {additionalSpeakers}
      </span>

      {/* Speaker Description - v1_22 */}
      <span
        className="absolute"
        style={{
          width: '645px',
          color: 'rgba(235,235,235,1)',
          top: '233px',
          left: '52px',
          fontFamily: 'Montserrat',
          fontWeight: '400',
          fontSize: '20px',
          textAlign: 'left'
        }}
      >
        {speakerDescription}
      </span>

      {/* Event Name - v1_23 */}
      <span
        className="absolute"
        style={{
          width: '515px',
          color: 'rgba(235,235,235,1)',
          top: '58px',
          left: '53px',
          fontFamily: 'Montserrat',
          fontWeight: '400',
          fontSize: '33px',
          textAlign: 'left'
        }}
      >
        {eventName}:
      </span>
    </div>
  );
}
