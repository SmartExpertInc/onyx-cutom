"use client";

import React from 'react';
import { createPortal } from 'react-dom';

interface AnimateButtonProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClick?: () => void;
}

export default function AnimateButton({ isVisible, position, onClick }: AnimateButtonProps) {
  if (!isVisible) {
    return null;
  }

  const button = (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -120%)',
        zIndex: 9999,
      }}
      className="flex items-center gap-1.5 px-1.5 py-3 text-xs font-medium text-[#4D4D4D] bg-white border border-[#E0E0E0] rounded-md shadow-sm hover:bg-[#F7F7F8] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D4D4D]/40"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g clipPath="url(#clip0_2114_29178)">
          <path
            d="M1 13.8125H7.88103"
            stroke="#4D4D4D"
            strokeWidth="1.18639"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.627 13.8125H14.9997"
            stroke="#4D4D4D"
            strokeWidth="1.18639"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.06822 14.9978C9.72344 14.9978 10.2546 14.4666 10.2546 13.8114C10.2546 13.1562 9.72344 12.625 9.06822 12.625C8.413 12.625 7.88184 13.1562 7.88184 13.8114C7.88184 14.4666 8.413 14.9978 9.06822 14.9978Z"
            stroke="#4D4D4D"
            strokeWidth="1.18639"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.9993 8.11831C14.9993 9.42876 13.937 10.4911 12.6266 10.4911H3.37277C2.06232 10.4911 1 9.42876 1 8.11831V3.37277C1 2.06232 2.06232 1 3.37277 1H12.6266C13.937 1 14.9993 2.06232 14.9993 3.37277V8.11831Z"
            stroke="#4D4D4D"
            strokeWidth="1.18639"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.37305 5.74498C4.6835 5.74498 5.74582 6.8073 5.74582 8.11775C5.74582 6.15209 7.33931 4.55859 9.30497 4.55859H10.2541"
            stroke="#4D4D4D"
            strokeWidth="1.18639"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.4403 5.74777C12.0955 5.74777 12.6267 5.21661 12.6267 4.56139C12.6267 3.90616 12.0955 3.375 11.4403 3.375C10.7851 3.375 10.2539 3.90616 10.2539 4.56139C10.2539 5.21661 10.7851 5.74777 11.4403 5.74777Z"
            stroke="#4D4D4D"
            strokeWidth="1.18639"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_2114_29178">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
      Animate
    </button>
  );

  return typeof window !== 'undefined' ? createPortal(button, document.body) : button;
}

