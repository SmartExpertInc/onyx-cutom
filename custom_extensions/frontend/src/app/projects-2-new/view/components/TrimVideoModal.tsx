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
        className="relative flex flex-col w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] shadow-xl"
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

        <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 px-10">
          <div
            className="w-[800px] max-w-full rounded-lg border border-dashed border-[#B0B0B0] bg-white/40 aspect-video flex items-center justify-center text-sm text-[#878787]"
          >
            Video preview placeholder
          </div>

          <div
            className="relative w-[950px] max-w-full h-[50px] rounded-md bg-white/60 border border-[#E0E0E0]"
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: '-12px', width: '12px', height: '58px', backgroundColor: '#0F58F9', borderRadius: '6px' }}
            >
              <div
                style={{ width: '2px', height: '14px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ right: '-12px', width: '12px', height: '58px', backgroundColor: '#0F58F9', borderRadius: '6px' }}
            >
              <div
                style={{ width: '2px', height: '14px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
              />
            </div>
          </div>
        </div>

        <div
          className="w-full px-6 py-4"
          style={{ borderTop: '1px solid #E0E0E0' }}
        />
      </div>
    </div>
  );
}

