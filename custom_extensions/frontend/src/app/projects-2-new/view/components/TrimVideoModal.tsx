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
        className="relative flex flex-col w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] shadow-xl overflow-y-auto"
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

        <div className="flex-1 w-full flex flex-col justify-center gap-10 px-10 py-4">
          <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-6">
            <div
              className="w-full max-w-[900px] mx-auto rounded-lg border border-dashed border-[#B0B0B0] bg-white/40 aspect-video flex items-center justify-center text-sm text-[#878787]"
            >
              Video preview placeholder
            </div>

            <div className="relative w-full">
              <div
                className="flex h-[70px] w-full gap-1 bg-transparent"
                style={{
                  borderRadius: '6px',
                  border: '1px solid #E0E0E0',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                }}
              >
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-full rounded-[4px]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
                      border: '1px solid #E0E0E0',
                    }}
                  />
                ))}
              </div>

              <div
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: '0px',
                  width: '12px',
                  height: '70px',
                  backgroundColor: '#0F58F9',
                  borderRadius: '6px 0px 0px 6px',
                }}
              >
                <div
                  style={{ width: '2px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  right: '0px',
                  width: '12px',
                  height: '70px',
                  backgroundColor: '#0F58F9',
                  borderRadius: '0px 6px 6px 0px',
                }}
              >
                <div
                  style={{ width: '2px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full px-10"
          style={{ borderTop: '1px solid #E0E0E0', paddingTop: '20px', paddingBottom: '20px' }}
        >
          <div className="w-full max-w-[1100px] mx-auto flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-sm font-medium" style={{ color: '#171718' }}>
                Trimmed video length
              </div>
              <div className="text-xs" style={{ color: '#878787' }}>
                00:19:95
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-[80px] px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center justify-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#171718',
                  border: '1px solid #171718',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-[80px] px-4 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                style={{
                  backgroundColor: '#0F58F9',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.8333 1.16667L3.91333 9.08667M8.14667 8.15333L11.8333 11.8333M3.91333 3.91333L6.5 6.5M4.5 2.5C4.5 3.60457 3.60457 4.5 2.5 4.5C1.39543 4.5 0.5 3.60457 0.5 2.5C0.5 1.39543 1.39543 0.5 2.5 0.5C3.60457 0.5 4.5 1.39543 4.5 2.5ZM4.5 10.5C4.5 11.6046 3.60457 12.5 2.5 12.5C1.39543 12.5 0.5 11.6046 0.5 10.5C0.5 9.39543 1.39543 8.5 2.5 8.5C3.60457 8.5 4.5 9.39543 4.5 10.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Trim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

