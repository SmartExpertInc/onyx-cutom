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
      className="px-3 py-1 text-xs font-medium text-white bg-[#0F58F9] rounded-md shadow-md hover:bg-[#0C47C7] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F58F9]"
    >
      Animate
    </button>
  );

  return typeof window !== 'undefined' ? createPortal(button, document.body) : button;
}

