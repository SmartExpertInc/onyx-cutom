"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ElaiVoice {
  character: string;
  voice: string;
  voiceProvider: string;
  locale?: string;
  icon?: string;
  tags?: string[];
  premium?: boolean;
  name?: string;
  url?: string;
}

interface VoiceContextType {
  selectedVoice: ElaiVoice | null;
  setSelectedVoice: (voice: ElaiVoice | null) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [selectedVoice, setSelectedVoiceState] = useState<ElaiVoice | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice) {
      try {
        const voice = JSON.parse(savedVoice);
        setSelectedVoiceState(voice);
        console.log('🎤 [VOICE_CONTEXT] Loaded voice from localStorage:', voice.character);
      } catch (error) {
        console.error('🎤 [VOICE_CONTEXT] Error loading voice from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage when voice changes
  const setSelectedVoice = (voice: ElaiVoice | null) => {
    setSelectedVoiceState(voice);
    if (voice) {
      localStorage.setItem('selectedVoice', JSON.stringify(voice));
      console.log('🎤 [VOICE_CONTEXT] Voice saved to localStorage:', voice.character);
    } else {
      localStorage.removeItem('selectedVoice');
      console.log('🎤 [VOICE_CONTEXT] Voice cleared from localStorage');
    }
  };

  return (
    <VoiceContext.Provider value={{ selectedVoice, setSelectedVoice }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

