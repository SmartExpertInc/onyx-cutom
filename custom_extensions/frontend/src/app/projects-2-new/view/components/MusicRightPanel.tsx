"use client";

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MusicRightPanelProps {
  isMusicEnabled: boolean;
  setIsMusicEnabled: (enabled: boolean) => void;
  showMusicDropdown: boolean;
  setShowMusicDropdown: (show: boolean) => void;
  selectedMusic: string;
  setSelectedMusic: (music: string) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  isPlayEverywhereEnabled: boolean;
  setIsPlayEverywhereEnabled: (enabled: boolean) => void;
  onReplaceMusic?: () => void;
}

export default function MusicRightPanel({
  isMusicEnabled,
  setIsMusicEnabled,
  showMusicDropdown,
  setShowMusicDropdown,
  selectedMusic,
  setSelectedMusic,
  musicVolume,
  setMusicVolume,
  isPlayEverywhereEnabled,
  setIsPlayEverywhereEnabled,
  onReplaceMusic,
}: MusicRightPanelProps) {
  const { t } = useLanguage();
  const musicDropdownRef = useRef<HTMLDivElement>(null);
  const musicOptions = [
    {
      value: 'East London',
      label: 'East London',
    },
    {
      value: 'Ambient Flow',
      label: 'Ambient Flow',
    },
    {
      value: 'Minimal Beat',
      label: 'Minimal Beat',
    },
  ];
  const selectedMusicOption = musicOptions.find((option) => option.value === selectedMusic);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (musicDropdownRef.current && !musicDropdownRef.current.contains(target)) {
        setShowMusicDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowMusicDropdown]);

  return (
    <div className="space-y-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium" style={{ color: '#171718' }}>
          {t('panels.musicRightPanel.music', 'Music')}
        </h3>
        <button
          onClick={() => setIsMusicEnabled(!isMusicEnabled)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          style={{ backgroundColor: isMusicEnabled ? '#0F58F9' : '#E0E0E0' }}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              isMusicEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div
        ref={musicDropdownRef}
        className={`relative ${!isMusicEnabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="relative">
          <button
            onClick={() => setShowMusicDropdown(!showMusicDropdown)}
            disabled={!isMusicEnabled}
            className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E0E0E0' }}
          >
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.00033 11.9987C8.00033 13.4715 6.80642 14.6654 5.33366 14.6654C3.8609 14.6654 2.66699 13.4715 2.66699 11.9987C2.66699 10.5259 3.8609 9.33203 5.33366 9.33203C6.80642 9.33203 8.00033 10.5259 8.00033 11.9987ZM8.00033 11.9987V1.33203L12.667 3.9987"
                  stroke="#848485"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ color: '#878787' }}>{selectedMusicOption?.label ?? selectedMusic}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${showMusicDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="#848485"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMusicDropdown && isMusicEnabled && (
            <div
              className="absolute left-0 right-0 top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10"
              style={{ borderColor: '#E0E0E0' }}
            >
              {musicOptions.map((option) => (
              <button
                  key={option.value}
                onClick={() => {
                    setSelectedMusic(option.value);
                  setShowMusicDropdown(false);
                }}
                className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.00033 11.9987C8.00033 13.4715 6.80642 14.6654 5.33366 14.6654C3.8609 14.6654 2.66699 13.4715 2.66699 11.9987C2.66699 10.5259 3.8609 9.33203 5.33366 9.33203C6.80642 9.33203 8.00033 10.5259 8.00033 11.9987ZM8.00033 11.9987V1.33203L12.667 3.9987"
                      stroke="#848485"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                    <span style={{ color: '#878787' }}>{option.label}</span>
                </div>
                  {selectedMusic === option.value && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3346 4L6.0013 11.3333L2.66797 8"
                      stroke="#0F58F9"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (onReplaceMusic) {
              onReplaceMusic();
            }
          }}
          disabled={!isMusicEnabled}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#E0E0E0' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.67737 2.00631 11.2874 2.66082 12.4933 3.82667L14 5.33333M14 5.33333V2M14 5.33333H10.6667M14 8C14 9.5913 13.3679 11.1174 12.2426 12.2426C11.1174 13.3679 9.5913 14 8 14C6.32263 13.9937 4.71265 13.3392 3.50667 12.1733L2 10.6667M2 10.6667H5.33333M2 10.6667V14"
              stroke="#878787"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: '#878787' }}>{t('panels.musicRightPanel.replaceMusic', 'Replace music')}</span>
        </button>

        
      </div>

      <div className={`space-y-2 mt-6 mb-4 ${!isMusicEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#878787' }}>
            {t('panels.musicRightPanel.volume', 'Volume')}
          </span>
          <span className="text-xs" style={{ color: '#878787' }}>
            {musicVolume}%
          </span>
        </div>

        <div className="relative w-full flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            disabled={!isMusicEnabled}
            onChange={(event) => {
              const value = Number(event.target.value);
              setMusicVolume(value);
              const percentage = `${value}%`;
              event.target.style.background = `linear-gradient(to right, #1058F9 0%, #1058F9 ${percentage}, #18181B33 ${percentage}, #18181B33 100%)`;
            }}
            className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
            title={`${t('panels.musicRightPanel.volume', 'Volume')}: ${musicVolume}%`}
            style={{
              background: `linear-gradient(to right, #1058F9 0%, #1058F9 ${musicVolume}%, #18181B33 ${musicVolume}%, #18181B33 100%)`,
            }}
          />
          <style jsx>{`
            input[type='range']::-webkit-slider-thumb {
              appearance: none;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: white;
              cursor: pointer;
              border: 1px solid #18181B80;
            }

            input[type='range']::-moz-range-thumb {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: white;
              cursor: pointer;
              border: 1px solid #18181B80;
            }

            input[type='range']:focus {
              outline: none;
            }

            input[type='range']:focus::-webkit-slider-thumb {
              box-shadow: 0 0 0 2px rgba(16, 88, 249, 0.2);
            }

            input[type='range']:focus::-moz-range-thumb {
              box-shadow: 0 0 0 2px rgba(16, 88, 249, 0.2);
            }
          `}</style>
        </div>

        <div className="flex items-center justify-between pt-3">
          <h3
            className="text-sm font-medium text-right leading-snug max-w-[130px]"
            style={{ color: '#171718' }}
          >
            {t('panels.musicRightPanel.playEverywhere', 'Play everywhere')}
          </h3>
          <button
            onClick={() => setIsPlayEverywhereEnabled(!isPlayEverywhereEnabled)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            style={{ backgroundColor: isPlayEverywhereEnabled ? '#0F58F9' : '#E0E0E0' }}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isPlayEverywhereEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}


