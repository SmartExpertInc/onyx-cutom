'use client';

import { X } from 'lucide-react';

interface TrimVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrimVideoModal({ isOpen, onClose }: TrimVideoModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      <div
        className="relative flex flex-col items-center justify-center w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] shadow-xl"
        style={{
          borderRadius: '12px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors z-10 cursor-pointer"
          type="button"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="w-full h-full" />
      </div>
    </div>
  );
}

