"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Cake, Radio, Briefcase, ChevronDown, ChevronRight, Flag, Volume2, Check, RotateCcw } from 'lucide-react';

// Custom Radio Wave Icon
const RadioWaveIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 256 256"
    className={className}
  >
    <path 
      fill="currentColor" 
      d="M56 96v64a8 8 0 0 1-16 0V96a8 8 0 0 1 16 0Zm32-72a8 8 0 0 0-8 8v192a8 8 0 0 0 16 0V32a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v128a8 8 0 0 0 16 0V64a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v64a8 8 0 0 0 16 0V96a8 8 0 0 0-8-8Zm40-16a8 8 0 0 0-8 8v96a8 8 0 0 0 16 0V80a8 8 0 0 0-8-8Z"
    />
  </svg>
);

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
}

export default function VoicePicker({ isOpen, onClose, onSelectVoice: _onSelectVoice }: VoicePickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [accentDropdownOpen, setAccentDropdownOpen] = useState(false);
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false);
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [stability, setStability] = useState(50);
  const [applyTo, setApplyTo] = useState<'block' | 'scene' | 'all'>('block');
  const [selectedAccents, setSelectedAccents] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  
  const accentRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);
  const toneRef = useRef<HTMLDivElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);

  // Accent options with country flags
  const accentOptions = [
    { id: 'american', flag: <AmericanFlag />, text: 'American English' },
    { id: 'british', flag: <BritishFlag />, text: 'British English' },
    { id: 'australian', flag: <AustralianFlag />, text: 'Australian English' },
    { id: 'indian', flag: <IndianFlag />, text: 'English (India)' },
    { id: 'south-african', flag: <SouthAfricanFlag />, text: 'English (South Africa)' }
  ];

  // Age options
  const ageOptions = [
    { id: 'adult', text: 'Adult' },
    { id: 'middle-aged', text: 'Middle-Aged' },
    { id: 'senior', text: 'Senior' },
    { id: 'young', text: 'Young' },
    { id: 'young-adult', text: 'Young Adult' }
  ];

  // Tone options
  const toneOptions = [
    { id: 'anxious', text: 'Anxious' },
    { id: 'calm', text: 'Calm' },
    { id: 'cheerful', text: 'Cheerful' },
    { id: 'cloned-voice', text: 'Cloned Voice' },
    { id: 'confident', text: 'Confident' },
    { id: 'conversational', text: 'Conversational' },
    { id: 'deep', text: 'Deep' },
    { id: 'delightful', text: 'Delightful' },
    { id: 'determined', text: 'Determined' },
    { id: 'educational', text: 'Educational' },
    { id: 'engaging', text: 'Engaging' },
    { id: 'fast', text: 'Fast' },
    { id: 'friendly', text: 'Friendly' },
    { id: 'gentle', text: 'Gentle' }
  ];

  // Scenario options
  const scenarioOptions = [
    { id: 'ad', text: 'Ad' },
    { id: 'any', text: 'Any' },
    { id: 'assistant', text: 'Assistant' },
    { id: 'chat', text: 'Chat' },
    { id: 'conversational', text: 'Conversational' },
    { id: 'customer-service', text: 'Customer Service' },
    { id: 'documentary', text: 'Documentary' },
    { id: 'e-learning', text: 'E-Learning' },
    { id: 'explainer', text: 'Explainer' },
    { id: 'how-to', text: 'How-to' }
  ];

  const toggleAccent = (accentId: string) => {
    setSelectedAccents(prev => 
      prev.includes(accentId) 
        ? prev.filter(id => id !== accentId)
        : [...prev, accentId]
    );
  };

  const toggleAge = (ageId: string) => {
    setSelectedAges(prev => 
      prev.includes(ageId) 
        ? prev.filter(id => id !== ageId)
        : [...prev, ageId]
    );
  };

  const toggleTone = (toneId: string) => {
    setSelectedTones(prev => 
      prev.includes(toneId) 
        ? prev.filter(id => id !== toneId)
        : [...prev, toneId]
    );
  };

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  // Reset functions
  const resetAccents = () => setSelectedAccents([]);
  const resetAges = () => setSelectedAges([]);
  const resetTones = () => setSelectedTones([]);
  const resetScenarios = () => setSelectedScenarios([]);
  
  // Reset all selections
  const resetAllSelections = () => {
    resetAccents();
    resetAges();
    resetTones();
    resetScenarios();
  };
  
  // Check if any selections exist
  const hasAnySelections = selectedAccents.length > 0 || selectedAges.length > 0 || selectedTones.length > 0 || selectedScenarios.length > 0;

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accentRef.current && !accentRef.current.contains(event.target as Node)) {
        setAccentDropdownOpen(false);
      }
      if (ageRef.current && !ageRef.current.contains(event.target as Node)) {
        setAgeDropdownOpen(false);
      }
      if (toneRef.current && !toneRef.current.contains(event.target as Node)) {
        setToneDropdownOpen(false);
      }
      if (scenarioRef.current && !scenarioRef.current.contains(event.target as Node)) {
        setScenarioDropdownOpen(false);
      }
    };

    if (accentDropdownOpen || ageDropdownOpen || toneDropdownOpen || scenarioDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accentDropdownOpen, ageDropdownOpen, toneDropdownOpen, scenarioDropdownOpen]);

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
          background: #000000;
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #000000;
          cursor: pointer;
          border: none;
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
      {/* Light background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white shadow-xl w-[1000px] max-w-[96vw] max-h-[92vh] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        
        {/* Row 1: Title */}
        <div className="p-6 pb-4">
          <h2 className="text-lg text-gray-900">Pick a voice</h2>
        </div>

        {/* Row 2: Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 3: Dropdown Buttons */}
        <div className="px-6 pb-4">
          <div className="flex gap-3 items-center justify-between">
            <div className="flex gap-3">
            {/* Accent Dropdown */}
            <div className="relative" ref={accentRef}>
              <button
                onClick={() => setAccentDropdownOpen(!accentDropdownOpen)}
                className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  accentDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedAccents.length > 0 ? `${selectedAccents.length} selected` : 'Accent'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Accent dropdown popup */}
              {accentDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {accentOptions.map((accent) => (
                    <div
                      key={accent.id}
                      onClick={() => toggleAccent(accent.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedAccents.includes(accent.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedAccents.includes(accent.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Country flag */}
                      <div className="flex-shrink-0">{accent.flag}</div>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{accent.text}</span>
                    </div>
                  ))}
                  

                </div>
              )}
            </div>

            {/* Age Dropdown */}
            <div className="relative" ref={ageRef}>
              <button
                onClick={() => setAgeDropdownOpen(!ageDropdownOpen)}
                className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  ageDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cake size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedAges.length > 0 ? `${selectedAges.length} selected` : 'Age'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Age dropdown popup */}
              {ageDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {ageOptions.map((age) => (
                    <div
                      key={age.id}
                      onClick={() => toggleAge(age.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedAges.includes(age.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedAges.includes(age.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{age.text}</span>
                    </div>
                  ))}
                  

                </div>
              )}
            </div>

            {/* Tone Dropdown */}
            <div className="relative" ref={toneRef}>
              <button
                onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  toneDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioWaveIcon size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedTones.length > 0 ? `${selectedTones.length} selected` : 'Tone'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Tone dropdown popup */}
              {toneDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 max-h-60 overflow-y-auto">
                  {toneOptions.map((tone) => (
                    <div
                      key={tone.id}
                      onClick={() => toggleTone(tone.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedTones.includes(tone.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedTones.includes(tone.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{tone.text}</span>
                    </div>
                  ))}
                  

                </div>
              )}
            </div>

            {/* Scenario Dropdown */}
            <div className="relative" ref={scenarioRef}>
              <button
                onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  scenarioDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedScenarios.length > 0 ? `${selectedScenarios.length} selected` : 'Scenario'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Scenario dropdown popup */}
              {scenarioDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {scenarioOptions.map((scenario) => (
                    <div
                      key={scenario.id}
                      onClick={() => toggleScenario(scenario.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedScenarios.includes(scenario.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedScenarios.includes(scenario.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{scenario.text}</span>
                    </div>
                  ))}
                  

                </div>
              )}
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
        <div className="px-6">
          <hr className="border-gray-200" />
        </div>

        {/* Content Container with proper flex structure */}
        <div className="flex-1 flex flex-col">
          {/* Row 5: Main Area Layout Headers - Fixed */}
          <div className="px-6 py-4 flex justify-between">
            {/* Left Zone */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">358 voices found</h3>
            </div>
            
            {/* Right Zone */}
            <div className="w-80">
              <h3 className="text-sm font-medium text-gray-900">Voice details</h3>
            </div>
          </div>

          {/* Main Content Area (Left and Right Panels) - With separate scrolling */}
          <div className="px-6 pb-6 flex gap-6 flex-1">
          {/* Left Panel - Voice List with its own scrolling */}
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {/* Create Custom Voice Row */}
            <div className="mb-3">
              <div 
                className="rounded-lg p-4 flex items-center justify-between cursor-pointer"
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.2)' 
                }}
              >
                <div className="flex items-center gap-3">
                  {/* White circle with radio wave icon */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-500">
                    <RadioWaveIcon size={20} className="text-blue-500" />
                  </div>
                  
                  {/* Text and badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium">Create a custom voice</span>
                    <span className="px-2 py-1 bg-blue-600 text-blue-200 text-xs font-medium rounded-full">
                      NEW
                    </span>
                  </div>
                </div>
                
                {/* Right chevron */}
                <ChevronRight size={20} className="text-blue-500" />
              </div>
            </div>



            {/* Voice Item Row - Copy 1 */}
            <div className="mb-4 group">
              <div className="rounded-lg p-4 flex items-center justify-between cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Radio wave icon / Play button */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:border group-hover:border-gray-300">
                    <RadioWaveIcon size={20} className="text-gray-600 group-hover:hidden" />
                    <div className="hidden group-hover:flex items-center justify-center w-6 h-6 bg-white rounded-full">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-900 font-medium">Ana rus</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full">
                        32 languages
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-gray-600">
                          <path fill="currentColor" fillRule="evenodd" d="M8.75 6.5a3.25 3.25 0 0 1 6.5 0v6a3.25 3.25 0 0 1-6.5 0zM12 4.75a1.75 1.75 0 0 0-1.75 1.75v6a1.75 1.75 0 1 0 3.5 0v-6A1.75 1.75 0 0 0 12 4.75m-5 7a.75.75 0 0 1 .75.75a4.25 4.25 0 0 0 8.5 0a.75.75 0 0 1 1.5 0a5.75 5.75 0 0 1-5 5.701v1.049H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-1.049a5.75 5.75 0 0 1-5-5.701a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
                        </svg>
                        <span>Cloned voice</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - visible on hover */}
                <div className="hidden group-hover:flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Item Row - Copy 2 */}
            <div className="mb-4 group">
              <div className="rounded-lg p-4 flex items-center justify-between cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Radio wave icon / Play button */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:border group-hover:border-gray-300">
                    <RadioWaveIcon size={20} className="text-gray-600 group-hover:hidden" />
                    <div className="hidden group-hover:flex items-center justify-center w-6 h-6 bg-white rounded-full">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-900 font-medium">Ana rus</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full">
                        32 languages
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-gray-600">
                          <path fill="currentColor" fillRule="evenodd" d="M8.75 6.5a3.25 3.25 0 0 1 6.5 0v6a3.25 3.25 0 0 1-6.5 0zM12 4.75a1.75 1.75 0 0 0-1.75 1.75v6a1.75 1.75 0 1 0 3.5 0v-6A1.75 1.75 0 0 0 12 4.75m-5 7a.75.75 0 0 1 .75.75a4.25 4.25 0 0 0 8.5 0a.75.75 0 0 1 1.5 0a5.75 5.75 0 0 1-5 5.701v1.049H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-1.049a5.75 5.75 0 0 1-5-5.701a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
                        </svg>
                        <span>Cloned voice</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - visible on hover */}
                <div className="hidden group-hover:flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Item Row - Copy 3 */}
            <div className="mb-4 group">
              <div className="rounded-lg p-4 flex items-center justify-between cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Radio wave icon / Play button */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:border group-hover:border-gray-300">
                    <RadioWaveIcon size={20} className="text-gray-600 group-hover:hidden" />
                    <div className="hidden group-hover:flex items-center justify-center w-6 h-6 bg-white rounded-full">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-900 font-medium">Ana rus</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full">
                        32 languages
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-gray-600">
                          <path fill="currentColor" fillRule="evenodd" d="M8.75 6.5a3.25 3.25 0 0 1 6.5 0v6a3.25 3.25 0 0 1-6.5 0zM12 4.75a1.75 1.75 0 0 0-1.75 1.75v6a1.75 1.75 0 1 0 3.5 0v-6A1.75 1.75 0 0 0 12 4.75m-5 7a.75.75 0 0 1 .75.75a4.25 4.25 0 0 0 8.5 0a.75.75 0 0 1 1.5 0a5.75 5.75 0 0 1-5 5.701v1.049H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-1.049a5.75 5.75 0 0 1-5-5.701a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
                        </svg>
                        <span>Cloned voice</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - visible on hover */}
                <div className="hidden group-hover:flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Item Row - Copy 4 */}
            <div className="mb-4 group">
              <div className="rounded-lg p-4 flex items-center justify-between cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Radio wave icon / Play button */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:border group-hover:border-gray-300">
                    <RadioWaveIcon size={20} className="text-gray-600 group-hover:hidden" />
                    <div className="hidden group-hover:flex items-center justify-center w-6 h-6 bg-white rounded-full">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-900 font-medium">Ana rus</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full">
                        32 languages
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-gray-600">
                          <path fill="currentColor" fillRule="evenodd" d="M8.75 6.5a3.25 3.25 0 0 1 6.5 0v6a3.25 3.25 0 0 1-6.5 0zM12 4.75a1.75 1.75 0 0 0-1.75 1.75v6a1.75 1.75 0 1 0 3.5 0v-6A1.75 1.75 0 0 0 12 4.75m-5 7a.75.75 0 0 1 .75.75a4.25 4.25 0 0 0 8.5 0a.75.75 0 0 1 1.5 0a5.75 5.75 0 0 1-5 5.701v1.049H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-1.049a5.75 5.75 0 0 1-5-5.701a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
                        </svg>
                        <span>Cloned voice</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - visible on hover */}
                <div className="hidden group-hover:flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Item Row - Copy 5 */}
            <div className="mb-4 group">
              <div className="rounded-lg p-4 flex items-center justify-between cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Radio wave icon / Play button */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:border group-hover:border-gray-300">
                    <RadioWaveIcon size={20} className="text-gray-600 group-hover:hidden" />
                    <div className="hidden group-hover:flex items-center justify-center w-6 h-6 bg-white rounded-full">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-900 font-medium">Ana rus</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full">
                        32 languages
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-gray-600">
                          <path fill="currentColor" fillRule="evenodd" d="M8.75 6.5a3.25 3.25 0 0 1 6.5 0v6a3.25 3.25 0 0 1-6.5 0zM12 4.75a1.75 1.75 0 0 0-1.75 1.75v6a1.75 1.75 0 1 0 3.5 0v-6A1.75 1.75 0 0 0 12 4.75m-5 7a.75.75 0 0 1 .75.75a4.25 4.25 0 0 0 8.5 0a.75.75 0 0 1 1.5 0a5.75 5.75 0 0 1-5 5.701v1.049H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-1.049a5.75 5.75 0 0 1-5-5.701a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
                        </svg>
                        <span>Cloned voice</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - visible on hover */}
                <div className="hidden group-hover:flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
          
          {/* Right Panel - Voice Details with its own scrolling */}
          <div className="w-80 bg-gray-50 border border-gray-200 rounded-lg p-3 self-start overflow-y-auto max-h-[400px]">
            {/* Row 1: Maya title */}
            <div className="mb-2">
              <h3 className="text-xl text-gray-900">Maya</h3>
            </div>
            
            {/* Row 2: USA flag + American English */}
            <div className="flex items-center gap-2 mb-3">
              <AmericanFlag size={16} />
              <span className="text-xs text-gray-700">American English</span>
            </div>
            
            {/* Row 3: Badges */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {['Adult', 'Confident', 'Educational', 'Friendly', 'Professional', 'Customer Service', 'E-Learning'].map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] rounded-full border border-gray-300"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Row 4: Horizontal line */}
            <div className="mb-3 -mx-3">
              <hr className="border-gray-300" />
            </div>
            
            {/* Row 5: Advanced settings */}
            <div className="mb-3">
              <h4 className="text-sm text-gray-900">Advanced settings</h4>
            </div>
            
            {/* Row 6: Speed */}
            <div className="mb-3">
              <label className="text-sm text-gray-700 mb-1 block">Speed</label>
              <input
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer range-slider"
                style={{
                  background: `linear-gradient(to right, #000000 0%, #000000 ${speed}%, #e5e7eb ${speed}%, #e5e7eb 100%)`
                }}
              />
            </div>
            
            {/* Row 7: Stability */}
            <div className="mb-6">
              <label className="text-sm text-gray-700 mb-1 block">Stability</label>
              <input
                type="range"
                min="0"
                max="100"
                value={stability}
                onChange={(e) => setStability(Number(e.target.value))}
                className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer range-slider"
                style={{
                  background: `linear-gradient(to right, #000000 0%, #000000 ${stability}%, #e5e7eb ${stability}%, #e5e7eb 100%)`
                }}
              />
            </div>
            
            {/* Row 8: Play Sample button */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              <Volume2 size={16} className="text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Play Sample</span>
            </button>
          </div>
        </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between rounded-b-xl">
          {/* Left side - Apply new voice to */}
          <div className="flex-1">
            <div className="mb-2">
              <span className="text-sm text-gray-700">Apply new voice to</span>
            </div>
            <div className="bg-gray-200 rounded-lg p-1 flex w-80">
              <button
                onClick={() => setApplyTo('block')}
                className={`px-6 py-1.5 text-sm rounded transition-colors ${
                  applyTo === 'block' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                This block only
              </button>
              <button
                onClick={() => setApplyTo('scene')}
                className={`px-6 py-1.5 text-sm rounded transition-colors ${
                  applyTo === 'scene' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                This scene only
              </button>
              <button
                onClick={() => setApplyTo('all')}
                className={`px-6 py-1.5 text-sm rounded transition-colors ${
                  applyTo === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All scenes
              </button>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle apply voice logic here
                onClose();
              }}
              className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Apply voice
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}