'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { X } from 'lucide-react';

interface TrimVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIN_SELECTION_GAP = 0.05;

export default function TrimVideoModal({ isOpen, onClose }: TrimVideoModalProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 1,
  });
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);

  const updateFromClientX = useCallback((clientX: number, handle: 'start' | 'end') => {
    const rail = railRef.current;
    if (!rail) return;

    const rect = rail.getBoundingClientRect();
    if (rect.width === 0) return;

    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
    const percent = clamp((clientX - rect.left) / rect.width);

    setSelection((prev) => {
      if (handle === 'start') {
        const nextStart = Math.min(percent, prev.end - MIN_SELECTION_GAP);
        return {
          start: clamp(nextStart),
          end: prev.end,
        };
      }
      const nextEnd = Math.max(percent, prev.start + MIN_SELECTION_GAP);
      return {
        start: prev.start,
        end: clamp(nextEnd),
      };
    });
  }, []);

  useEffect(() => {
    if (!activeHandle) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      updateFromClientX(event.clientX, activeHandle);
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeHandle, updateFromClientX]);

  const handlePointerDown = useCallback(
    (handle: 'start' | 'end') => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setActiveHandle(handle);
      updateFromClientX(event.clientX, handle);
    },
    [updateFromClientX]
  );

  const startPercent = selection.start * 100;
  const endPercent = selection.end * 100;

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
              <div ref={railRef} className="relative h-[70px] w-full">
                <div className="absolute inset-0 flex h-full w-full overflow-hidden rounded-[6px] bg-white/40 gap-1">
                  {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-full rounded-[6px]"
                    style={{
                      backgroundColor: '#878787',
                    }}
                  />
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[6px]">
                  <div
                    className="absolute inset-y-0 bg-white/30"
                    style={{
                      left: `${startPercent}%`,
                      width: `${endPercent - startPercent}%`,
                      borderRadius: '6px',
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="absolute top-1/2 z-20 flex h-[70px] w-3 cursor-ew-resize items-center justify-center rounded-l-[6px] bg-[#0F58F9] shadow-sm transition-opacity"
                  style={{ left: `${startPercent}%`, transform: 'translateY(-50%)' }}
                  aria-label="Adjust trim start"
                  onPointerDown={handlePointerDown('start')}
                >
                  <span
                    style={{ width: '2px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
                  />
                </button>

                <button
                  type="button"
                  className="absolute top-1/2 z-20 flex h-[70px] w-3 cursor-ew-resize items-center justify-center rounded-r-[6px] bg-[#0F58F9] shadow-sm transition-opacity"
                  style={{ left: `${endPercent}%`, transform: 'translate(-100%, -50%)' }}
                  aria-label="Adjust trim end"
                  onPointerDown={handlePointerDown('end')}
                >
                  <span
                    style={{ width: '2px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
                  />
                </button>
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
                className="w-[75px] px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center justify-center"
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
                className="w-[75px] px-4 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

