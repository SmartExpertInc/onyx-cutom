"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useAvatarDisplay } from '@/components/AvatarDisplayManager';
import { useLanguage } from '@/contexts/LanguageContext';

// Custom Flag Icons
const AmericanFlag = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36">
    <path fill="#B22334" d="M35.445 7C34.752 5.809 33.477 5 32 5H18v2h17.445zM0 25h36v2H0zm18-8h18v2H18zm0-4h18v2H18zM0 21h36v2H0zm4 10h28c1.477 0 2.752-.809 3.445-2H.555c.693 1.191 1.968 2 3.445 2zM18 9h18v2H18z"/>
    <path fill="#EEE" d="M.068 27.679c.017.093.036.186.059.277c.026.101.058.198.092.296c.089.259.197.509.333.743L.555 29h34.89l.002-.004a4.22 4.22 0 0 0 .332-.741a3.75 3.75 0 0 0 .152-.576c.041-.22.069-.446.069-.679H0c0 .233.028.458.068.679zM0 23h36v2H0zm0-4v2h36v-2H18zm18-4h18v2H18zm0-4h18v2H18zM0 9zm.555-2l-.003.005L.555 7zM.128 8.044c.025-.102.06-.199.092-.297a3.78 3.78 0 0 0-.092.297zM18 9h18c0-.233-.028-.459-.069-.68a3.606 3.606 0 0 0-.153-.576A4.21 4.21 0 0 0 35.445 7H18v2z"/>
    <path fill="#3C3B6E" d="M18 5H4a4 4 0 0 0-4 4v10h18V5z"/>
    <path fill="#FFF" d="m2.001 7.726l.618.449l-.236.725L3 8.452l.618.448l-.236-.725L4 7.726h-.764L3 7l-.235.726zm2 2l.618.449l-.236.725l.617-.448l.618.448l-.236-.725L6 9.726h-.764L5 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 9l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 9l-.235.726zm-8 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L5 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9 13l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13 13l-.235.726zm-6-6l.618.449l-.236.725L7 8.452l.618.448l-.236-.725L8 7.726h-.764L7 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 7l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 7l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 11l-.235.726zM6.383 12.9L7 12.452l.618.448l-.236-.725l.618-.449h-.764L7 11l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 11l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 11l-.235.726zm-12 4l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3 15l-.235.726zM6.383 16.9L7 16.452l.618.448l-.236-.725l.618-.449h-.764L7 15l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11 15l-.235.726zm4 0l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15 15l-.235.726z"/>
  </svg>
);

const BritishFlag = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64">
    <path fill="#2e3192" d="M38 54h16c1.977 0 3.657-.446 5.052-1.223L38 40.219V54zm25.66-7.79c.228-1.017.344-2.094.344-3.211v-5h-14.11l13.762 8.211M.35 17.759A14.635 14.635 0 0 0 0 21v5h14.164L.35 17.759zM26 10H10c-1.963 0-3.632.44-5.021 1.206L26 23.746V10zM5.043 52.826C6.419 53.57 8.066 54 10 54h16V40.324L5.043 52.826zM0 38v5c0 1.151.122 2.26.363 3.303L14.282 38H0zm59.115-26.745C57.709 10.457 56.006 10 54 10H38v13.851l21.115-12.596zM64 26v-5c0-1.094-.113-2.149-.332-3.147L50.012 26H64z"/>
    <path fill="#e6e7e8" d="m50.012 26l13.656-8.147c-.626-2.864-2.15-5.235-4.553-6.598L38 23.851V10h-2v18h28v-2H50.012zM0 36v2h14.282L.363 46.303c.661 2.855 2.231 5.199 4.68 6.523L26 40.324V54h2V36H0zm64 0H36v18h2V40.219l21.052 12.559c2.421-1.348 3.964-3.706 4.604-6.566L49.894 38H64v-2zM26 10v13.746L4.979 11.206C2.549 12.546.996 14.9.349 17.759L14.164 26H0v2h28V10h-2z"/>
    <path fill="#be1e2d" d="M36 28V10h-8v18H0v8h28v18h8V36h28v-8z"/>
    <path fill="#be1e2d" d="M21.938 26L1.888 14.031c-.431.64-.777 1.344-1.063 2.094L17.372 26h4.563M63.09 48.09L46.277 38h-4.656l20.313 12.219a9.866 9.866 0 0 0 1.156-2.125m-2.371-35.703L37.969 26l4.619.003L62.219 14.25c-.438-.797-.9-1.311-1.5-1.859M1.813 49.875a8.996 8.996 0 0 0 1.609 1.844L26.063 38H21.5L1.813 49.875z"/>
  </svg>
);

const AustralianFlag = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36">
    <path fill="#00247D" d="M32 5H4c-.205 0-.407.015-.604.045l-.004 1.754l-2.73-.004A3.984 3.984 0 0 0 0 9v18a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z"/>
    <path fill="#FFF" d="m9 26.023l-1.222 1.129l.121-1.66l-1.645-.251l1.373-.94l-.829-1.443l1.591.488L9 21.797l.612 1.549l1.591-.488l-.83 1.443l1.374.94l-1.645.251l.121 1.66zM27.95 9.562l-.799.738l.079-1.086l-1.077-.164l.899-.615l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.615l-1.076.164l.079 1.086zm-4 6l-.799.739l.079-1.086l-1.077-.164l.899-.616l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.616l-1.076.164l.079 1.086zm9-2l-.799.739l.079-1.086l-1.077-.164l.899-.616l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.616l-1.076.164l.079 1.086zm-5 14l-.799.739l.079-1.086l-1.077-.164l.899-.616l-.542-.944l1.04.319l.4-1.013l.401 1.013l1.041-.319l-.543.944l.898.616l-1.076.164l.079 1.086zM31 16l.294.596l.657.095l-.475.463l.112.655L31 17.5l-.588.309l.112-.655l-.475-.463l.657-.095z"/>
    <path fill="#00247D" d="M19 18V5H4c-.32 0-.604.045-.604.045l-.004 1.754l-2.73-.004S.62 6.854.535 7A3.988 3.988 0 0 0 0 9v9h19z"/>
    <path fill="#EEE" d="M19 5h-2.331L12 8.269V5H7v2.569L3.396 5.045a3.942 3.942 0 0 0-1.672.665L6.426 9H4.69L.967 6.391a4.15 4.15 0 0 0-.305.404L3.813 9H0v5h3.885L0 16.766V18h3.332L7 15.432V18h5v-3.269L16.668 18H19v-2.029L16.185 14H19V9h-2.814L19 7.029V5z"/>
    <path fill="#CF1B2B" d="M11 5H8v5H0v3h8v5h3v-5h8v-3h-8z"/>
    <path fill="#CF1B2B" d="M19 5h-1.461L12 8.879V9h1.571L19 5.198zm-17.276.71a4.052 4.052 0 0 0-.757.681L4.69 9h1.735L1.724 5.71zM6.437 14L.734 18h1.727L7 14.822V14zM19 17.802v-1.22L15.313 14H13.57z"/>
  </svg>
);

const IndianFlag = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64">
    <path fill="#e6e7e8" d="M0 24h64v14H0z"/>
    <path fill="#f93" d="M54 9H10C3.373 9 0 13.925 0 20v4h64v-4c0-6.075-3.373-11-10-11z"/>
    <path fill="#128807" d="M0 42c0 6.075 3.373 11 10 11h44c6.627 0 10-4.925 10-11v-4H0v4"/>
    <g fill="#010088" fillRule="evenodd">
      <path d="M32.31 24.583a6.458 6.458 0 1 1-6.458 6.448a6.459 6.459 0 0 1 6.458-6.448m-4.305 2.795c.111.126.131.261.057.374a.263.263 0 0 1-.137.112a.29.29 0 0 1-.267-.034a5.485 5.485 0 0 0-.457.786c.151.099.201.223.151.36a.287.287 0 0 1-.363.168c-.072.144-.231.752-.233.88a.284.284 0 0 1 .168.101a.268.268 0 0 1 .064.188c-.019.188-.135.268-.312.275c-.028.181-.025.787.003.906c.188.02.287.102.303.245c.022.154-.052.254-.232.324c.054.297.131.589.232.875a.336.336 0 0 1 .215.007c.067.029.12.079.148.148c.025.054.03.11.017.169a.289.289 0 0 1-.161.202c.134.278.282.54.457.786c.156-.077.292-.059.384.051a.255.255 0 0 1 .065.164a.277.277 0 0 1-.104.236c.2.234.413.448.645.645c.131-.115.267-.133.384-.051c.053.037.09.086.107.146a.297.297 0 0 1-.042.252c.253.174.514.324.787.454c.106-.149.227-.199.358-.149a.3.3 0 0 1 .142.107c.05.08.057.168.028.262c.288.102.578.18.878.233c.059-.169.161-.248.297-.238c.063.005.12.024.17.067c.07.064.103.145.097.245c.308.022.609.024.908 0c.022-.193.099-.29.254-.312a.264.264 0 0 1 .17.034a.287.287 0 0 1 .142.204c.302-.056.595-.133.878-.234c-.025-.189.021-.302.148-.361a.3.3 0 0 1 .147-.023c.052.004.099.02.137.054c.037.031.068.069.104.108a5.5 5.5 0 0 0 .782-.451c-.102-.16-.042-.313.041-.381a.287.287 0 0 1 .408.035c.231-.198.448-.413.642-.644c-.113-.129-.135-.265-.052-.382a.256.256 0 0 1 .145-.108a.291.291 0 0 1 .255.039c.175-.252.327-.513.457-.787c-.146-.098-.199-.213-.155-.344a.267.267 0 0 1 .1-.145a.306.306 0 0 1 .27-.04c.065-.141.227-.735.236-.879a.295.295 0 0 1-.176-.104a.258.258 0 0 1-.061-.198a.267.267 0 0 1 .074-.169a.292.292 0 0 1 .236-.09a5.518 5.518 0 0 0 0-.909c-.191-.019-.282-.093-.307-.244a.257.257 0 0 1 .024-.168a.29.29 0 0 1 .209-.153a5.328 5.328 0 0 0-.233-.878c-.185.031-.299-.019-.36-.147a.284.284 0 0 1 .143-.379a5.316 5.316 0 0 0-.457-.787c-.161.077-.292.059-.384-.051a.257.257 0 0 1-.064-.168a.282.282 0 0 1 .104-.231a5.934 5.934 0 0 0-.643-.645c-.138.118-.272.133-.386.051a.264.264 0 0 1-.107-.146a.287.287 0 0 1 .042-.249a5.51 5.51 0 0 0-.787-.457c-.103.148-.219.197-.35.153a.29.29 0 0 1-.145-.104a.3.3 0 0 1-.034-.269a5.192 5.192 0 0 0-.878-.233c-.057.162-.16.246-.293.238a.282.282 0 0 1-.17-.064a.288.288 0 0 1-.101-.248a5.293 5.293 0 0 0-.908.001c-.021.18-.099.283-.232.305a.272.272 0 0 1-.177-.022a.287.287 0 0 1-.156-.211a5.601 5.601 0 0 0-.879.235c.032.177-.018.293-.14.356c-.053.027-.109.038-.171.027a.271.271 0 0 1-.213-.163c-.171.064-.715.379-.787.458c.074.148.057.279-.045.373a.287.287 0 0 1-.411-.032a5.827 5.827 0 0 0-.643.643"/>
    </g>
  </svg>
);

const SouthAfricanFlag = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36">
    <path fill="#DE3830" d="M32 5H6.5L19 13.5h17V9a4 4 0 0 0-4-4z"/>
    <path fill="#002395" d="M6.5 31H32a4 4 0 0 0 4-4v-4.5H19L6.5 31z"/>
    <path fill="#141414" d="M0 11v14l10.5-7z"/>
    <path fill="#FFB611" d="M0 9v2l10.5 7L0 25v2l13.5-9z"/>
    <path fill="#007A4D" d="M3.541 5.028A4 4 0 0 0 0 9l13.5 9L0 27a4 4 0 0 0 3.541 3.972L18.5 20.5H36v-5H18.5L3.541 5.028z"/>
    <path fill="#EEE" d="M6.5 5H4c-.156 0-.308.011-.459.028L18.5 15.5H36v-2H19L6.5 5zM3.541 30.972c.151.017.303.028.459.028h2.5L19 22.5h17v-2H18.5L3.541 30.972z"/>
  </svg>
);

interface Voice {
  id: string;
  name: string;
  accent?: string;
  age?: string;
  tone?: string;
  scenario?: string;
}

interface VoicePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoice?: (voice: Voice) => void;
  showReady?: boolean;
}

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
  gender?: 'male' | 'female';
}

export default function VoicePicker({ isOpen, onClose, onSelectVoice: _onSelectVoice, showReady = true }: VoicePickerProps) {
  const { t } = useLanguage();
  const { selectedVoice: globalSelectedVoice, setSelectedVoice: setGlobalSelectedVoice } = useVoice();
  const { defaultAvatar } = useAvatarDisplay();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [speed, setSpeed] = useState(50);
  const [stability, setStability] = useState(50);
  const [applyTo, setApplyTo] = useState<'scene' | 'all'>('scene');
  const [voices, setVoices] = useState<ElaiVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempSelectedVoice, setTempSelectedVoice] = useState<ElaiVoice | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize temporary selection from global selection when modal opens
  useEffect(() => {
    if (isOpen && globalSelectedVoice) {
      console.log('🎤 [VOICE_PICKER] Modal opened with existing global voice selection:', {
        character: globalSelectedVoice.character,
        voiceId: globalSelectedVoice.voice,
        provider: globalSelectedVoice.voiceProvider,
        locale: globalSelectedVoice.locale
      });
      setTempSelectedVoice(globalSelectedVoice);
    } else if (isOpen) {
      console.log('🎤 [VOICE_PICKER] Modal opened without existing voice selection');
    }
  }, [isOpen, globalSelectedVoice]);

  // Fetch voices from backend API
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        
        console.log('🎤 [VOICE_PICKER] ========== VOICE FETCH STARTED ==========');
        console.log('🎤 [VOICE_PICKER] Fetching voices from backend API...');
        console.log('🎤 [VOICE_PICKER] API Endpoint: ' + `${CUSTOM_BACKEND_URL}/video/voices`);
        
        setLoading(true);
        const response = await fetch(`${CUSTOM_BACKEND_URL}/video/voices`, {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        console.log('🎤 [VOICE_PICKER] API Response Status:', response.status);
        
        if (!response.ok) {
          console.error('🎤 [VOICE_PICKER] Failed to fetch voices:', response.status);
          throw new Error(`Failed to fetch voices: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch voices');
        }
        
        const data = result.voices || [];
        console.log('🎤 [VOICE_PICKER] API Response received');
        console.log('🎤 [VOICE_PICKER] Language groups count:', data.length);
        
        // Flatten the nested structure (array of language groups with male/female arrays)
        const allVoices: ElaiVoice[] = [];
        let maleCount = 0;
        let femaleCount = 0;
        
        data.forEach((languageGroup: any) => {
          if (languageGroup.male && Array.isArray(languageGroup.male)) {
            allVoices.push(
              ...languageGroup.male.map((voice: ElaiVoice) => ({
                ...voice,
                gender: voice.gender || 'male'
              }))
            );
            maleCount += languageGroup.male.length;
          }
          if (languageGroup.female && Array.isArray(languageGroup.female)) {
            allVoices.push(
              ...languageGroup.female.map((voice: ElaiVoice) => ({
                ...voice,
                gender: voice.gender || 'female'
              }))
            );
            femaleCount += languageGroup.female.length;
          }
        });

        console.log('🎤 [VOICE_PICKER] Voices extracted:');
        console.log('🎤 [VOICE_PICKER] - Total voices:', allVoices.length);
        console.log('🎤 [VOICE_PICKER] - Male voices:', maleCount);
        console.log('🎤 [VOICE_PICKER] - Female voices:', femaleCount);
        console.log('🎤 [VOICE_PICKER] - Azure voices:', allVoices.filter(v => v.voiceProvider === 'azure').length);
        console.log('🎤 [VOICE_PICKER] - ElevenLabs voices:', allVoices.filter(v => v.voiceProvider === 'elevenlabs').length);
        console.log('🎤 [VOICE_PICKER] - Premium voices:', allVoices.filter(v => v.premium).length);
        console.log('🎤 [VOICE_PICKER] ========== VOICE FETCH COMPLETED ==========');
        if (defaultAvatar?.avatar?.gender) {
          console.log('🎤 [VOICE_PICKER] Preferred avatar gender detected:', defaultAvatar.avatar.gender);
        }

        setVoices(allVoices);
      } catch (error) {
        console.error('🎤 [VOICE_PICKER] ❌ Error fetching voices:', error);
        console.error('🎤 [VOICE_PICKER] Error details:', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchVoices();
    }
  }, [isOpen, defaultAvatar?.avatar?.gender]);

  const sortedVoices = useMemo(() => {
    if (!voices.length) return voices;
    const preferredGender = defaultAvatar?.avatar?.gender;
    if (!preferredGender) return voices;

    const preferred: ElaiVoice[] = [];
    const others: ElaiVoice[] = [];

    voices.forEach((voice) => {
      if (voice.gender === preferredGender) {
        preferred.push(voice);
      } else {
        others.push(voice);
      }
    });

    console.log('🎤 [VOICE_PICKER] Voice list sorted based on avatar gender:', preferredGender, {
      preferredCount: preferred.length,
      otherCount: others.length
    });

    return [...preferred, ...others];
  }, [voices, defaultAvatar?.avatar?.gender]);

  // Handle voice preview playback
  const handlePlayVoice = (e: React.MouseEvent, voice: ElaiVoice) => {
    e.stopPropagation(); // Prevent voice selection when clicking play button
    
    console.log('🎤 [VOICE_PICKER] Play button clicked for voice:', {
      character: voice.character,
      voiceId: voice.voice,
      provider: voice.voiceProvider,
      hasUrl: !!voice.url
    });
    
    // If clicking the same voice that's playing, stop it
    if (playingVoice === voice.voice) {
      console.log('🎤 [VOICE_PICKER] Stopping currently playing voice');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoice(null);
      return;
    }
    
    // Stop any currently playing audio
    if (audioRef.current) {
      console.log('🎤 [VOICE_PICKER] Stopping previous audio');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Play the new voice preview
    if (voice.url) {
      console.log('🎤 [VOICE_PICKER] Starting audio playback from URL:', voice.url.substring(0, 50) + '...');
      const audio = new Audio(voice.url);
      audioRef.current = audio;
      
      audio.play().catch((error) => {
        console.error('🎤 [VOICE_PICKER] ❌ Error playing audio:', error);
        setPlayingVoice(null);
      });
      
      setPlayingVoice(voice.voice);
      console.log('🎤 [VOICE_PICKER] ✅ Audio playback started successfully');
      
      // Reset playing state when audio ends
      audio.onended = () => {
        console.log('🎤 [VOICE_PICKER] Audio playback ended');
        setPlayingVoice(null);
      };
    } else {
      console.warn('🎤 [VOICE_PICKER] ⚠️ No audio URL available for voice:', voice.character);
    }
  };


  // Cleanup audio when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setPlayingVoice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Custom CSS for range sliders */}
      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: 2px solid #E0E0E0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: 2px solid #E0E0E0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider::-webkit-slider-track {
          appearance: none;
          background: transparent;
        }
        
        .range-slider::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurry background overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white shadow-xl w-[1000px] max-w-[96vw] max-h-[85vh] flex flex-col px-7 py-3 gap-3 z-10"
        style={{ borderRadius: '12px' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 w-6 h-6 bg-white rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity z-20"
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '0px 10px 10px 0px #0000001A, 0px 4px 4px 0px #0000000D, 0px 1px 0px 0px #0000000D'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 14L14 2" stroke="#878787" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 2L14 14" stroke="#878787" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Row 1: Title */}
        <div>
          <h2 className="text-base font-medium text-gray-900">{t('voicePicker.title', 'Pick a voice')}</h2>
        </div>

        {/* Row 2: Search Bar */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 10.5L8.11111 8.11111M9.38889 4.94444C9.38889 7.39904 7.39904 9.38889 4.94444 9.38889C2.48985 9.38889 0.5 7.39904 0.5 4.94444C0.5 2.48985 2.48985 0.5 4.94444 0.5C7.39904 0.5 9.38889 2.48985 9.38889 4.94444Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('voicePicker.searchPlaceholder', 'Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#878787]"
              style={{ 
                boxShadow: '0px 1px 2px 0px #0000000D',
                color: '#171718'
              }}
            />
          </div>
        </div>

        {/* Main content area with voices count and bordered container */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          {/* Voices count text above container */}
        <div>
            <span className="text-xs text-[#878787] leading-none block">
                {loading ? t('voicePicker.loadingVoices', 'Loading voices...') : `${voices.filter(voice => 
                  voice.character.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (voice.name && voice.name.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length + ((t('voicePicker.mockVoiceName', 'Sarah - Conversational').toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') ? 1 : 0)} ${t('voicePicker.voicesFound', 'voices found')}`}
                  </span>
                </div>
                      
        {/* Content Container with proper flex structure */}
          <div className="flex-1 flex flex-col min-h-0 border border-[#E0E0E0] rounded-lg">
          {/* Main Content Area (Left and Right Panels) - With separate scrolling */}
          <div className="flex flex-1 min-h-0">
          {/* Left Panel - Voice List with its own scrolling */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Create Custom Voice Row */}
            <div className="mb-3">
              <div 
                className="rounded-lg px-2 py-1 flex items-center justify-between cursor-pointer bg-white border"
                style={{ 
                  borderColor: '#0F58F9' 
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Custom voice icon */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.1094 22.4531C15.25 22.4531 14.5469 21.75 14.5469 20.8125V9.64062C14.5469 8.70312 15.25 8 16.1094 8C17.0469 8 17.75 8.70312 17.75 9.64062V20.8125C17.75 21.6719 16.9688 22.4531 16.1094 22.4531Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.1094 40.5C15.25 40.5 14.5469 39.7969 14.5469 38.8594V25.8125C14.5469 24.9531 15.25 24.25 16.1094 24.25C17.0469 24.25 17.75 24.9531 17.75 25.8125V38.9375C17.75 39.7969 16.9688 40.5 16.1094 40.5Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.875 34.7188C9.9375 34.7188 9.23438 34.0156 9.23438 33.0781V15.4219C9.23438 14.4844 9.9375 13.7812 10.875 13.7812C11.7344 13.7812 12.4375 14.4844 12.4375 15.4219V33.0781C12.4375 34.0156 11.7344 34.7188 10.875 34.7188Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.64062 30.5C4.70312 30.5 4 29.7969 4 28.9375V19.5625C4 18.7031 4.70312 18 5.64062 18C6.5 18 7.20312 18.7031 7.20312 19.5625V28.9375C7.20312 29.7969 6.5 30.5 5.64062 30.5Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M31.8906 28.4688C31.0312 28.4688 30.25 27.7656 30.25 26.9062V21.6719C30.25 20.7344 30.9531 20.0312 31.8906 20.0312C32.75 20.0312 33.4531 20.7344 33.4531 21.6719V26.8281C33.4531 27.7656 32.75 28.4688 31.8906 28.4688Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.6562 19.9531C25.7188 19.9531 25.0156 19.1719 25.0156 18.3125V15.0312C25.0156 14.0938 25.7188 13.3906 26.6562 13.3906C27.5156 13.3906 28.2188 14.0938 28.2188 15.0312V18.3125C28.2188 19.1719 27.5156 19.9531 26.6562 19.9531Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.6562 35.1094C25.7188 35.1094 25.0156 34.4062 25.0156 33.4688V22.6875C25.0156 21.8281 25.7188 21.125 26.6562 21.125C27.5156 21.125 28.2188 21.8281 28.2188 22.6875V33.4688C28.2188 34.3281 27.5156 35.1094 26.6562 35.1094Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.3438 33.1562C20.4844 33.1562 19.7812 32.375 19.7812 31.5156V16.9844C19.7812 16.125 20.4844 15.3438 21.3438 15.3438C22.2812 15.3438 22.9844 16.125 22.9844 16.9844V31.5156C22.9844 32.4531 22.2812 33.1562 21.3438 33.1562Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M37.125 39.5625C36.2656 39.5625 35.5625 38.8594 35.5625 38V10.5C35.5625 9.64062 36.2656 8.9375 37.125 8.9375C38.0625 8.9375 38.7656 9.64062 38.7656 10.5V38C38.7656 38.8594 38.0625 39.5625 37.125 39.5625Z" fill="#0F58F9"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M42.3594 34.7188C41.5 34.7188 40.7969 34.0156 40.7969 33.0781V15.4219C40.7969 14.4844 41.5 13.7812 42.3594 13.7812C43.2969 13.7812 44 14.4844 44 15.4219V33.0781C44 34.0156 43.2969 34.7188 42.3594 34.7188Z" fill="#0F58F9"/>
                  </svg>
                      
                      {/* Text */}
                  <span className="font-medium text-sm" style={{ color: '#0F58F9' }}>{t('voicePicker.createCustomVoice', 'Create a custom voice')}</span>
                    </div>
                  
                {/* Right chevron */}
                <ChevronRight size={16} style={{ color: '#0F58F9' }} />
                </div>
            </div>

            {/* Mock voice item */}
            {(t('voicePicker.mockVoiceName', 'Sarah - Conversational').toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && (
            <div className="mb-3 group">
              <div 
                className="rounded-lg px-2 py-1 flex items-center justify-between cursor-pointer border border-[#E0E0E0] bg-white transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0px 14px 24px 0px #0E1F3514, 0px 6px 12px 0px #0E1F351F, 0px 3px 6px 0px #0E1F3514';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                  <div className="flex items-center gap-3">
                  {/* Voice icon */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:hidden">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.1094 22.4531C15.25 22.4531 14.5469 21.75 14.5469 20.8125V9.64062C14.5469 8.70312 15.25 8 16.1094 8C17.0469 8 17.75 8.70312 17.75 9.64062V20.8125C17.75 21.6719 16.9688 22.4531 16.1094 22.4531Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.1094 40.5C15.25 40.5 14.5469 39.7969 14.5469 38.8594V25.8125C14.5469 24.9531 15.25 24.25 16.1094 24.25C17.0469 24.25 17.75 24.9531 17.75 25.8125V38.9375C17.75 39.7969 16.9688 40.5 16.1094 40.5Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.875 34.7188C9.9375 34.7188 9.23438 34.0156 9.23438 33.0781V15.4219C9.23438 14.4844 9.9375 13.7812 10.875 13.7812C11.7344 13.7812 12.4375 14.4844 12.4375 15.4219V33.0781C12.4375 34.0156 11.7344 34.7188 10.875 34.7188Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.64062 30.5C4.70312 30.5 4 29.7969 4 28.9375V19.5625C4 18.7031 4.70312 18 5.64062 18C6.5 18 7.20312 18.7031 7.20312 19.5625V28.9375C7.20312 29.7969 6.5 30.5 5.64062 30.5Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M31.8906 28.4688C31.0312 28.4688 30.25 27.7656 30.25 26.9062V21.6719C30.25 20.7344 30.9531 20.0312 31.8906 20.0312C32.75 20.0312 33.4531 20.7344 33.4531 21.6719V26.8281C33.4531 27.7656 32.75 28.4688 31.8906 28.4688Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.6562 19.9531C25.7188 19.9531 25.0156 19.1719 25.0156 18.3125V15.0312C25.0156 14.0938 25.7188 13.3906 26.6562 13.3906C27.5156 13.3906 28.2188 14.0938 28.2188 15.0312V18.3125C28.2188 19.1719 27.5156 19.9531 26.6562 19.9531Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.6562 35.1094C25.7188 35.1094 25.0156 34.4062 25.0156 33.4688V22.6875C25.0156 21.8281 25.7188 21.125 26.6562 21.125C27.5156 21.125 28.2188 21.8281 28.2188 22.6875V33.4688C28.2188 34.3281 27.5156 35.1094 26.6562 35.1094Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.3438 33.1562C20.4844 33.1562 19.7812 32.375 19.7812 31.5156V16.9844C19.7812 16.125 20.4844 15.3438 21.3438 15.3438C22.2812 15.3438 22.9844 16.125 22.9844 16.9844V31.5156C22.9844 32.4531 22.2812 33.1562 21.3438 33.1562Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M37.125 39.5625C36.2656 39.5625 35.5625 38.8594 35.5625 38V10.5C35.5625 9.64062 36.2656 8.9375 37.125 8.9375C38.0625 8.9375 38.7656 9.64062 38.7656 10.5V38C38.7656 38.8594 38.0625 39.5625 37.125 39.5625Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M42.3594 34.7188C41.5 34.7188 40.7969 34.0156 40.7969 33.0781V15.4219C40.7969 14.4844 41.5 13.7812 42.3594 13.7812C43.2969 13.7812 44 14.4844 44 15.4219V33.0781C44 34.0156 43.2969 34.7188 42.3594 34.7188Z" fill="#E0E0E0"/>
                  </svg>
                  {/* Play button - visible on hover */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden group-hover:block">
                    <circle cx="24" cy="24" r="19.5" fill="white" stroke="#4D4D4D"/>
                    <path d="M31.75 23.3612C32.4167 23.7461 32.4167 24.7084 31.75 25.0933L20.5 31.5885C19.8333 31.9734 19 31.4922 19 30.7224L19 17.7321C19 16.9623 19.8333 16.4811 20.5 16.866L31.75 23.3612Z" fill="#4D4D4D"/>
                  </svg>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-900 text-sm font-medium">{t('voicePicker.mockVoiceName', 'Sarah - Conversational')}</span>
                    <div className="flex gap-2 flex-wrap">
                      {/* 32 languages badge - no SVG */}
                      <span className="px-2.5 py-0.5 text-[11px] rounded-full leading-none inline-flex items-center" style={{ backgroundColor: '#E0E0E0', color: '#171718' }}>
                        {t('voicePicker.badge32Languages', '32 languages')}
                      </span>
                      
                      {/* Custom voice badge */}
                      <span className="px-2.5 py-0.5 text-[11px] rounded-full flex items-center gap-2 leading-none" style={{ backgroundColor: '#CCDBFC', color: '#171718' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.0837 5.83073V6.9974C11.0837 8.08036 10.6535 9.11897 9.88768 9.88475C9.1219 10.6505 8.08329 11.0807 7.00033 11.0807M7.00033 11.0807C5.91736 11.0807 4.87875 10.6505 4.11297 9.88475C3.3472 9.11897 2.91699 8.08036 2.91699 6.9974V5.83073M7.00033 11.0807V12.8307M7.00033 1.16406C6.5362 1.16406 6.09108 1.34844 5.76289 1.67663C5.4347 2.00481 5.25033 2.44993 5.25033 2.91406V6.9974C5.25033 7.46152 5.4347 7.90664 5.76289 8.23483C6.09108 8.56302 6.5362 8.7474 7.00033 8.7474C7.46445 8.7474 7.90957 8.56302 8.23776 8.23483C8.56595 7.90664 8.75033 7.46152 8.75033 6.9974V2.91406C8.75033 2.44993 8.56595 2.00481 8.23776 1.67663C7.90957 1.34844 7.46445 1.16406 7.00033 1.16406Z" stroke="#171718" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t('voicePicker.badgeCustomVoice', 'Custom voice')}
                      </span>
                      
                      {/* Best fit for avatar badge */}
                      <span className="px-2.5 py-0.5 text-[11px] rounded-full flex items-center gap-2 leading-none" style={{ backgroundColor: '#CAFCF7', color: '#171718' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.00033 1.16406L8.80283 4.81573L12.8337 5.4049L9.91699 8.24573L10.6053 12.2591L7.00033 10.3632L3.39533 12.2591L4.08366 8.24573L1.16699 5.4049L5.19783 4.81573L7.00033 1.16406Z" stroke="#171718" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t('voicePicker.badgeBestFitAvatar', 'Best fit for avatar')}
                  </span>
                      
                      {/* Previously used badge */}
                      <span className="px-2.5 py-0.5 text-[11px] rounded-full flex items-center gap-2 leading-none" style={{ backgroundColor: '#FEE7C8', color: '#171718' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.75 7C1.75 5.60761 2.30312 4.27226 3.28769 3.28769C4.27226 2.30312 5.60761 1.75 7 1.75C8.46769 1.75552 9.87643 2.32821 10.9317 3.34833L12.25 4.66667M12.25 4.66667V1.75M12.25 4.66667H9.33333M12.25 7C12.25 8.39239 11.6969 9.72774 10.7123 10.7123C9.72774 11.6969 8.39239 12.25 7 12.25C5.53231 12.2445 4.12357 11.6718 3.06833 10.6517L1.75 9.33333M1.75 9.33333H4.66667M1.75 9.33333V12.25" stroke="#171718" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t('voicePicker.badgePreviouslyUsed', 'Previously used')}
                  </span>
                </div>
                      </div>
                    </div>
                </div>
            </div>
            </div>
            
            {/* Reset Button */}
            {hasAnySelections && (
              <button
                onClick={resetAllSelections}
                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Reset all</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Row 4: Horizontal Line */}
        <div>
          <hr className="border-gray-200" />
        </div>

        {/* Content Container with proper flex structure */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Row 5: Main Area Layout Headers - Fixed */}
          <div className="px-6 py-4 flex justify-between">
            {/* Left Zone */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {loading ? 'Loading voices...' : `${voices.length} voices found`}
              </h3>
            </div>
            
            {/* Right Zone */}
            <div className="w-80">
              <h3 className="text-sm font-medium text-gray-900">Voice details</h3>
            </div>
          </div>

          {/* Main Content Area (Left and Right Panels) - With separate scrolling */}
          <div className="px-6 flex gap-6 flex-1 min-h-0">
          {/* Left Panel - Voice List with its own scrolling */}
          <div className="flex-1 overflow-y-auto">
            {/* Create Custom Voice Row */}
            <div className="mb-3">
              <div 
                className={`rounded-lg p-4 flex items-center justify-between ${showReady ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                style={{ 
                  backgroundColor: '#EFF7FE' 
                }}
                title={showReady ? 'Soon' : undefined}
                onClick={(e) => {
                  if (showReady) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {/* White circle with radio wave icon */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border" style={{ borderColor: '#2C71F5' }}>
                    <RadioWaveIcon size={20} className="text-[#2C71F5]" />
                  </div>
                  
                  {/* Text and badge */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base" style={{ color: '#2C71F5' }}>Create a custom voice</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#2C71F5', color: '#FFFFFF' }}>
                      NEW
                    </span>
                  </div>
                </div>
                
                {/* Right chevron */}
                <ChevronRight size={20} style={{ color: '#2C71F5' }} />
              </div>
            </div>



            {/* Dynamically rendered voice items from Elai API */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">{t('voicePicker.loadingVoices', 'Loading voices...')}</div>
            ) : sortedVoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('voicePicker.noVoicesFound', 'No voices found')}</div>
            ) : (() => {
              const filteredVoices = sortedVoices.filter(voice => 
                voice.character.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (voice.name && voice.name.toLowerCase().includes(searchTerm.toLowerCase()))
              );
              
              return filteredVoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">{t('voicePicker.noResultsFound', 'No results found')}</div>
              ) : (
                filteredVoices.map((voice, index) => (
                 <div 
                   key={voice.voice || index} 
                   className="mb-3 group"
                   onClick={() => {
                     console.log('🎤 [VOICE_PICKER] Voice item clicked:', {
                       character: voice.character,
                       voiceId: voice.voice,
                       provider: voice.voiceProvider,
                       locale: voice.locale,
                       premium: voice.premium
                     });
                     setTempSelectedVoice(voice);
                   }}
                 >
                  <div 
                    className={`rounded-lg px-2 py-1 flex items-center justify-between cursor-pointer border transition-all ${
                    tempSelectedVoice?.voice === voice.voice 
                        ? 'border-[#E0E0E0] bg-white' 
                        : 'border-[#E0E0E0] bg-white'
                    }`}
                    style={tempSelectedVoice?.voice === voice.voice ? {
                      backgroundColor: '#E0E0E0',
                      boxShadow: '0px 14px 24px 0px #0E1F3514, 0px 6px 12px 0px #0E1F351F, 0px 3px 6px 0px #0E1F3514'
                    } : undefined}
                    onMouseEnter={(e) => {
                      if (tempSelectedVoice?.voice !== voice.voice) {
                        e.currentTarget.style.boxShadow = '0px 14px 24px 0px #0E1F3514, 0px 6px 12px 0px #0E1F351F, 0px 3px 6px 0px #0E1F3514';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tempSelectedVoice?.voice !== voice.voice) {
                        e.currentTarget.style.boxShadow = '';
                      }
                    }}
                  >
                <div className="flex items-center gap-3">
                  {/* Voice icon / Play button */}
                  {/* Voice icon - hidden on hover and when selected */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" 
                    className={tempSelectedVoice?.voice === voice.voice ? 'hidden' : 'group-hover:hidden'}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.1094 22.4531C15.25 22.4531 14.5469 21.75 14.5469 20.8125V9.64062C14.5469 8.70312 15.25 8 16.1094 8C17.0469 8 17.75 8.70312 17.75 9.64062V20.8125C17.75 21.6719 16.9688 22.4531 16.1094 22.4531Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.1094 40.5C15.25 40.5 14.5469 39.7969 14.5469 38.8594V25.8125C14.5469 24.9531 15.25 24.25 16.1094 24.25C17.0469 24.25 17.75 24.9531 17.75 25.8125V38.9375C17.75 39.7969 16.9688 40.5 16.1094 40.5Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.875 34.7188C9.9375 34.7188 9.23438 34.0156 9.23438 33.0781V15.4219C9.23438 14.4844 9.9375 13.7812 10.875 13.7812C11.7344 13.7812 12.4375 14.4844 12.4375 15.4219V33.0781C12.4375 34.0156 11.7344 34.7188 10.875 34.7188Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.64062 30.5C4.70312 30.5 4 29.7969 4 28.9375V19.5625C4 18.7031 4.70312 18 5.64062 18C6.5 18 7.20312 18.7031 7.20312 19.5625V28.9375C7.20312 29.7969 6.5 30.5 5.64062 30.5Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M31.8906 28.4688C31.0312 28.4688 30.25 27.7656 30.25 26.9062V21.6719C30.25 20.7344 30.9531 20.0312 31.8906 20.0312C32.75 20.0312 33.4531 20.7344 33.4531 21.6719V26.8281C33.4531 27.7656 32.75 28.4688 31.8906 28.4688Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.6562 19.9531C25.7188 19.9531 25.0156 19.1719 25.0156 18.3125V15.0312C25.0156 14.0938 25.7188 13.3906 26.6562 13.3906C27.5156 13.3906 28.2188 14.0938 28.2188 15.0312V18.3125C28.2188 19.1719 27.5156 19.9531 26.6562 19.9531Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.6562 35.1094C25.7188 35.1094 25.0156 34.4062 25.0156 33.4688V22.6875C25.0156 21.8281 25.7188 21.125 26.6562 21.125C27.5156 21.125 28.2188 21.8281 28.2188 22.6875V33.4688C28.2188 34.3281 27.5156 35.1094 26.6562 35.1094Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.3438 33.1562C20.4844 33.1562 19.7812 32.375 19.7812 31.5156V16.9844C19.7812 16.125 20.4844 15.3438 21.3438 15.3438C22.2812 15.3438 22.9844 16.125 22.9844 16.9844V31.5156C22.9844 32.4531 22.2812 33.1562 21.3438 33.1562Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M37.125 39.5625C36.2656 39.5625 35.5625 38.8594 35.5625 38V10.5C35.5625 9.64062 36.2656 8.9375 37.125 8.9375C38.0625 8.9375 38.7656 9.64062 38.7656 10.5V38C38.7656 38.8594 38.0625 39.5625 37.125 39.5625Z" fill="#E0E0E0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M42.3594 34.7188C41.5 34.7188 40.7969 34.0156 40.7969 33.0781V15.4219C40.7969 14.4844 41.5 13.7812 42.3594 13.7812C43.2969 13.7812 44 14.4844 44 15.4219V33.0781C44 34.0156 43.2969 34.7188 42.3594 34.7188Z" fill="#E0E0E0"/>
                  </svg>
                  {/* Play button - visible on hover and when selected */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" 
                    className={tempSelectedVoice?.voice === voice.voice ? 'block' : 'hidden group-hover:block'}
                    onClick={(e) => handlePlayVoice(e, voice)}>
                    <circle cx="24" cy="24" r="19.5" fill="white" stroke="#4D4D4D"/>
                    <path d="M31.75 23.3612C32.4167 23.7461 32.4167 24.7084 31.75 25.0933L20.5 31.5885C19.8333 31.9734 19 31.4922 19 30.7224L19 17.7321C19 16.9623 19.8333 16.4811 20.5 16.866L31.75 23.3612Z" fill="#4D4D4D"/>
                  </svg>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-1.5">
                        <span className="text-gray-900 text-sm font-medium">{voice.character}</span>
                          {voice.premium && (
                          <div className="flex gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[11px] rounded-full flex items-center gap-2 leading-none" style={{ backgroundColor: '#FCF6E6', color: '#171718' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" style={{ color: '#171718' }}>
                          <path fill="currentColor" fillRule="evenodd" d="M8.75 6.5a3.25 3.25 0 0 1 6.5 0v6a3.25 3.25 0 0 1-6.5 0zM12 4.75a1.75 1.75 0 0 0-1.75 1.75v6a1.75 1.75 0 1 0 3.5 0v-6A1.75 1.75 0 0 0 12 4.75m-5 7a.75.75 0 0 1 .75.75a4.25 4.25 0 0 0 8.5 0a.75.75 0 0 1 1.5 0a5.75 5.75 0 0 1-5 5.701v1.049H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-1.049a5.75 5.75 0 0 1-5-5.701a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
                        </svg>
                              <span>{t('voicePicker.premium', 'Premium')}</span>
                      </span>
                          </div>
                          )}
                    </div>
                </div>
              </div>
            </div>
              ))
              );
            })()}

          </div>
          
          {/* Vertical Divider */}
          <div className="w-px bg-[#E0E0E0]"></div>
          
          {/* Right Panel Container */}
          <div className="flex flex-col gap-2 p-4" style={{ width: '260px' }}>
            {/* Voice Details Label */}
            <div>
              <span className="text-xs leading-none block" style={{ color: '#878787' }}>{t('voicePicker.voiceDetails', 'Voice details')}</span>
            </div>
            
            {/* Right Panel - Voice Details Card with scrolling */}
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-3">
            {tempSelectedVoice ? (
              <>
                {/* Row 1: Voice name title */}
            <div className="mb-2">
                  <h3 className="text-base font-medium" style={{ color: '#171718' }}>{tempSelectedVoice.character}</h3>
            </div>
            
                {/* Row 2: Flag + locale */}
                {tempSelectedVoice.name && (
            <div className="flex items-center gap-2 mb-2">
                    {tempSelectedVoice.icon === 'us' && <AmericanFlag size={16} />}
                    {tempSelectedVoice.icon === 'gb' && <BritishFlag size={16} />}
                    {tempSelectedVoice.icon === 'au' && <AustralianFlag size={16} />}
                    <span className="text-xs" style={{ color: '#878787' }}>{tempSelectedVoice.name}</span>
            </div>
                )}
            
            {/* Row 3: Badges */}
                {tempSelectedVoice.tags && tempSelectedVoice.tags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                      {tempSelectedVoice.tags.map((tag, index) => (
                  <span
                          key={index}
                    className="px-2.5 py-0.5 bg-white text-[11px] rounded-full leading-none inline-flex items-center"
                    style={{ color: '#878787', borderWidth: '1px', borderStyle: 'solid', borderColor: '#878787' }}
                  >
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-xs text-gray-500">
                {t('voicePicker.selectVoiceToViewDetails', 'Select a voice to view details')}
              </div>
            )}
            
            {/* Advanced settings */}
            <div className="my-4">
              <h4 className="text-xs" style={{ color: '#878787' }}>{t('voicePicker.advancedSettings', 'Advanced settings')}</h4>
            </div>
            
            {/* Speed */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs" style={{ color: '#4D4D4D' }}>{t('voicePicker.speed', 'Speed')}</label>
                <span className="text-xs" style={{ color: '#4D4D4D' }}>{speed}</span>
            </div>
              <input
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer range-slider"
                style={{
                  background: `linear-gradient(to right, #1058F9 0%, #1058F9 ${speed}%, #E0E0E0 ${speed}%, #E0E0E0 100%)`
                }}
              />
            </div>
            
            {/* Play Sample button */}
            {tempSelectedVoice && (
              <button 
                onClick={(e) => handlePlayVoice(e, tempSelectedVoice)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white rounded-md hover:bg-gray-50 transition-colors"
                style={{ 
                  border: '1px solid #E6E6E6',
                  boxShadow: '0px 1px 2px 0px #0000000D',
                  color: '#4D4D4D'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.06533 4.93417C9.61212 5.48112 9.91929 6.22285 9.91929 6.99625C9.91929 7.76965 9.61212 8.51138 9.06533 9.05833M11.1245 2.875C12.2181 3.96891 12.8324 5.45238 12.8324 6.99917C12.8324 8.54596 12.2181 10.0294 11.1245 11.1233M6.41699 2.91583L3.50033 5.24917H1.16699V8.74917H3.50033L6.41699 11.0825V2.91583Z" stroke="#4D4D4D" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs">
                  {playingVoice === tempSelectedVoice.voice ? t('voicePicker.stopSample', 'Stop Sample') : t('voicePicker.playSample', 'Play Sample')}
                </span>
            </button>
            )}
            </div>
          </div>
          </div>
          </div>
          </div>
          </div>
        </div>
        </div>

        {/* Footer */}
        <div className="bg-white flex items-center justify-between rounded-b-xl">
          {/* Left side - Apply new voice to */}
          <div className="flex-1">
            <div className="rounded-lg px-1 py-1 flex gap-1" style={{ backgroundColor: '#F4F4F5', width: '250px' }}>
              <button
                onClick={() => setApplyTo('scene')}
                className={`flex-1 py-1 text-xs rounded transition-colors ${
                  applyTo === 'scene' 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-300'
                }`}
                style={{ color: applyTo === 'scene' ? '#171718' : '#878787' }}
              >
                {t('voicePicker.thisSceneOnly', 'This scene only')}
              </button>
              <button
                onClick={() => setApplyTo('all')}
                className={`flex-1 py-1 text-xs rounded transition-colors ${
                  applyTo === 'all' 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-300'
                }`}
                style={{ color: applyTo === 'all' ? '#171718' : '#878787' }}
              >
                {t('voicePicker.allScenes', 'All scenes')}
              </button>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-white rounded-md hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #719AF5', color: '#719AF5' }}
            >
              {t('voicePicker.cancel', 'Cancel')}
            </button>
            <button
              onClick={() => {
                 if (tempSelectedVoice) {
                   console.log('🎤 [VOICE_PICKER] ========== APPLY VOICE STARTED ==========');
                   console.log('🎤 [VOICE_PICKER] Applying voice to global context:', {
                     character: tempSelectedVoice.character,
                     voiceId: tempSelectedVoice.voice,
                     provider: tempSelectedVoice.voiceProvider,
                     locale: tempSelectedVoice.locale,
                     premium: tempSelectedVoice.premium,
                     tags: tempSelectedVoice.tags
                   });
                   
                   setGlobalSelectedVoice(tempSelectedVoice);
                   
                   console.log('🎤 [VOICE_PICKER] ✅ Voice successfully applied to global context');
                   console.log('🎤 [VOICE_PICKER] ========== APPLY VOICE COMPLETED ==========');
                 } else {
                   console.warn('🎤 [VOICE_PICKER] ⚠️ No voice selected to apply');
                 }
                onClose();
              }}
              className="px-3 py-1.5 text-xs text-white rounded-md hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#0F58F9' }}
               disabled={!tempSelectedVoice}
            >
              {t('voicePicker.apply', 'Apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}