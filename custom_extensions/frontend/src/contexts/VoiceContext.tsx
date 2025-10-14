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
    console.log('🎤 [VOICE_CONTEXT] ========== VOICE CONTEXT INITIALIZATION ==========');
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice) {
      try {
        const voice = JSON.parse(savedVoice);
        console.log('🎤 [VOICE_CONTEXT] Loading saved voice from localStorage:', {
          character: voice.character,
          voiceId: voice.voice,
          provider: voice.voiceProvider,
          locale: voice.locale
        });
        setSelectedVoiceState(voice);
        console.log('🎤 [VOICE_CONTEXT] ✅ Voice loaded successfully from localStorage');
      } catch (error) {
        console.error('🎤 [VOICE_CONTEXT] ❌ Failed to parse saved voice:', error);
        localStorage.removeItem('selectedVoice');
        console.log('🎤 [VOICE_CONTEXT] Removed corrupted voice data from localStorage');
      }
    } else {
      console.log('🎤 [VOICE_CONTEXT] No saved voice found in localStorage');
    }
    console.log('🎤 [VOICE_CONTEXT] ========== VOICE CONTEXT INITIALIZATION COMPLETED ==========');
  }, []);

  // Save to localStorage when voice changes
  const setSelectedVoice = (voice: ElaiVoice | null) => {
    console.log('🎤 [VOICE_CONTEXT] ========== VOICE STATE UPDATE ==========');
    if (voice) {
      console.log('🎤 [VOICE_CONTEXT] Setting new voice:', {
        character: voice.character,
        voiceId: voice.voice,
        provider: voice.voiceProvider,
        locale: voice.locale,
        premium: voice.premium
      });
    } else {
      console.log('🎤 [VOICE_CONTEXT] Clearing voice selection');
    }
    
    setSelectedVoiceState(voice);
    
    if (voice) {
      localStorage.setItem('selectedVoice', JSON.stringify(voice));
      console.log('🎤 [VOICE_CONTEXT] ✅ Voice saved to localStorage');
    } else {
      localStorage.removeItem('selectedVoice');
      console.log('🎤 [VOICE_CONTEXT] ✅ Voice cleared from localStorage');
    }
    console.log('🎤 [VOICE_CONTEXT] ========== VOICE STATE UPDATE COMPLETED ==========');
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

