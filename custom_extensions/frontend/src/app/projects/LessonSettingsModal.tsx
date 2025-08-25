'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Clock, Calculator, Check, BookOpen, Zap, Award, Crown, BookText, Video, HelpCircle, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LessonSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomRate?: number;
  currentQualityTier?: string;
  completionTime: string;
  onSave: (
    customRate: number, 
    qualityTier: string, 
    advancedEnabled?: boolean, 
    advancedRates?: { presentation: number; onePager: number; quiz: number; videoLesson: number },
    completionTimes?: { presentation: number; onePager: number; quiz: number; videoLesson: number }
  ) => void;
  currentAdvancedEnabled?: boolean;
  currentAdvancedRates?: { presentation?: number; onePager?: number; quiz?: number; videoLesson?: number };
  currentEffectiveCustomRate?: number;
  projectId?: number;
  sectionIndex?: number;
  lessonIndex?: number;
}

interface QualityTier {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  hoursRange: { min: number; max: number };
  defaultHours: number;
}

export default function LessonSettingsModal({
  isOpen,
  onClose,
  currentCustomRate,
  currentQualityTier,
  completionTime,
  onSave,
  currentAdvancedEnabled,
  currentAdvancedRates,
  currentEffectiveCustomRate,
  projectId,
  sectionIndex,
  lessonIndex
}: LessonSettingsModalProps) {
  const { t } = useLanguage();
  const effectiveRate = currentEffectiveCustomRate ?? currentCustomRate ?? 200;
  
  // Debug logging for props
  console.log('🔍 [LESSON_MODAL] Props received:', {
    isOpen,
    projectId,
    sectionIndex,
    lessonIndex,
    currentCustomRate,
    currentAdvancedEnabled,
    currentAdvancedRates,
    currentEffectiveCustomRate,
    effectiveRate
  });
  
  const [qualityTier, setQualityTier] = useState(currentQualityTier || 'interactive');
  const [customRate, setCustomRate] = useState(0); // Initialize to 0, will be set by fetch
  const [saving, setSaving] = useState(false);
  const [advancedEnabled, setAdvancedEnabled] = useState(false); // Initialize to false, will be set by fetch
  const [advancedTierOpen, setAdvancedTierOpen] = useState<string | null>(null); // Track which tier has advanced settings open
  const [globalAdvancedOpen, setGlobalAdvancedOpen] = useState(false); // Track if any advanced settings are open
  const [perProductRates, setPerProductRates] = useState({
    presentation: 0, // Initialize to 0, will be set by fetch
    onePager: 0,
    quiz: 0,
    videoLesson: 0
  });
  const [perProductCompletionTimes, setPerProductCompletionTimes] = useState({
    presentation: 8, // Default: 8 minutes for presentation
    onePager: 3,    // Default: 3 minutes for one-pager
    quiz: 6,        // Default: 6 minutes for quiz
    videoLesson: 4  // Default: 4 minutes for video-lesson
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Track if we've loaded backend data

  // Debug logging when states change
  React.useEffect(() => {
    console.log('🔍 [LESSON_MODAL] State changed - customRate:', customRate);
  }, [customRate]);

  React.useEffect(() => {
    console.log('🔍 [LESSON_MODAL] State changed - perProductRates:', perProductRates);
  }, [perProductRates]);

  React.useEffect(() => {
    console.log('🔍 [LESSON_MODAL] State changed - advancedEnabled:', advancedEnabled);
  }, [advancedEnabled]);

  React.useEffect(() => {
    console.log('🔍 [LESSON_MODAL] State changed - dataLoaded:', dataLoaded);
  }, [dataLoaded]);

  const qualityTiers: QualityTier[] = [
    {
      id: 'basic',
      name: t('modals.folderSettings.basic', 'Basic'),
      description: t('modals.folderSettings.basicDescription', 'Simple e-learning content with essential features for straightforward training needs'),
      icon: <BookOpen size={20} className="text-green-500" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        t('modals.folderSettings.slides', 'Slides'),
        t('modals.folderSettings.text', 'Text'),
        t('modals.folderSettings.simpleTests', 'Simple Tests'),
        t('modals.folderSettings.nonInteractiveScorm', 'Non-interactive SCORM')
      ],
      hoursRange: { min: 10, max: 200 },
      defaultHours: 100
    },
    {
      id: 'interactive',
      name: t('modals.folderSettings.interactive', 'Interactive'),
      description: t('modals.folderSettings.interactiveDescription', 'Engaging content with interactive elements for better learner engagement and retention'),
      icon: <Zap size={20} className="text-orange-500" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: [
        t('modals.folderSettings.animations', 'Animations'),
        t('modals.folderSettings.clickableBlocks', 'Clickable Blocks'),
        t('modals.folderSettings.voiceover', 'Voiceover'),
        t('modals.folderSettings.interactiveScorm', 'Interactive SCORM'),
        t('modals.folderSettings.mobileSupport', 'Mobile Support')
      ],
      hoursRange: { min: 100, max: 250 },
      defaultHours: 200
    },
    {
      id: 'advanced',
      name: t('modals.folderSettings.advanced', 'Advanced'),
      description: t('modals.folderSettings.advancedDescription', 'Sophisticated learning experiences with personalized content and advanced interactivity'),
      icon: <Award size={20} className="text-purple-500" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        t('modals.folderSettings.scenarios', 'Scenarios'),
        t('modals.folderSettings.simulations', 'Simulations'),
        t('modals.folderSettings.gamification', 'Gamification'),
        t('modals.folderSettings.adaptationToRoles', 'Adaptation to Roles'),
        t('modals.folderSettings.multilingualism', 'Multilingualism')
      ],
      hoursRange: { min: 200, max: 400 },
      defaultHours: 300
    },
    {
      id: 'immersive',
      name: t('modals.folderSettings.immersive', 'Immersive'),
      description: t('modals.folderSettings.immersiveDescription', 'Premium learning experiences with cutting-edge technology for maximum engagement'),
      icon: <Crown size={20} className="text-blue-500" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        t('modals.folderSettings.videosWithActors', 'Videos with Actors'),
        t('modals.folderSettings.vrAr', 'VR/AR'),
        t('modals.folderSettings.lmsIntegration', 'LMS-Integration'),
        t('modals.folderSettings.personalizedCourses', 'Personalized Courses and Simulations')
      ],
      hoursRange: { min: 400, max: 1000 },
      defaultHours: 700
    }
  ];

  // Fetch effective rates from backend when modal opens
  React.useEffect(() => {
    if (!isOpen || !projectId) {
      console.log('🔍 [LESSON_MODAL] Skip fetch:', { isOpen, projectId });
      return;
    }
    
    console.log('🔍 [LESSON_MODAL] Starting fetch for:', { projectId, sectionIndex, lessonIndex });
    
    const fetchEffectiveRates = async () => {
      // Test if the endpoint exists first
      try {
        const testResponse = await fetch('/api/custom-projects-backend/projects', { credentials: 'same-origin' });
        console.log('🔍 [LESSON_MODAL] Backend connectivity test status:', testResponse.status);
      } catch (e) {
        console.log('🔍 [LESSON_MODAL] Backend connectivity test error:', e);
      }
      
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (sectionIndex !== undefined) params.set('section_index', sectionIndex.toString());
        if (lessonIndex !== undefined) params.set('lesson_index', lessonIndex.toString());
        
        const url = `/api/custom-projects-backend/projects/${projectId}/effective-rates?${params}`;
        console.log('🔍 [LESSON_MODAL] Fetching URL:', url);
        
        const response = await fetch(url, {
          credentials: 'same-origin'
        });
        
        console.log('🔍 [LESSON_MODAL] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [LESSON_MODAL] Backend response:', JSON.stringify(data, null, 2));
          
          // Set advanced enabled state
          console.log('🔍 [LESSON_MODAL] Setting advancedEnabled to:', data.is_advanced);
          setAdvancedEnabled(data.is_advanced);
          
          // Set per-product rates (convert backend naming to frontend naming)
          const newRates = {
            presentation: data.rates.presentation,
            onePager: data.rates.one_pager,
            quiz: data.rates.quiz,
            videoLesson: data.rates.video_lesson
          };
          console.log('🔍 [LESSON_MODAL] Setting perProductRates to:', JSON.stringify(newRates, null, 2));
          setPerProductRates(newRates);
          
          // Set completion times if available
          if (data.completion_times) {
            const newCompletionTimes = {
              presentation: data.completion_times.presentation || 8,
              onePager: data.completion_times.one_pager || 3,
              quiz: data.completion_times.quiz || 6,
              videoLesson: data.completion_times.video_lesson || 4
            };
            console.log('🔍 [LESSON_MODAL] Setting perProductCompletionTimes to:', JSON.stringify(newCompletionTimes, null, 2));
            setPerProductCompletionTimes(newCompletionTimes);
          }
          
          // Set single rate fallback
          console.log('🔍 [LESSON_MODAL] Setting customRate to:', data.fallback_single_rate);
          setCustomRate(data.fallback_single_rate);
          setDataLoaded(true); // Mark data as loaded
        } else {
          console.warn('🔍 [LESSON_MODAL] Failed to fetch effective rates, using props');
          console.log('🔍 [LESSON_MODAL] Fallback props:', { 
            currentAdvancedEnabled, 
            currentAdvancedRates, 
            effectiveRate, 
            currentCustomRate 
          });
          // Fallback to props if endpoint fails
          setAdvancedEnabled(!!currentAdvancedEnabled);
          // Use current effective values instead of 200h default
          setPerProductRates({
            presentation: currentAdvancedRates?.presentation ?? effectiveRate,
            onePager: currentAdvancedRates?.onePager ?? effectiveRate,
            quiz: currentAdvancedRates?.quiz ?? effectiveRate,
            videoLesson: currentAdvancedRates?.videoLesson ?? effectiveRate
          });
          // Set default completion times for fallback
          setPerProductCompletionTimes({
            presentation: 8,
            onePager: 3,
            quiz: 6,
            videoLesson: 4
          });
          setCustomRate(currentCustomRate || effectiveRate);
          setDataLoaded(true); // Mark data as loaded even on fallback
        }
      } catch (error) {
        console.error('🔍 [LESSON_MODAL] Error fetching effective rates:', error);
        // Fallback to props if fetch fails
        setAdvancedEnabled(!!currentAdvancedEnabled);
        // Use current effective values instead of 200h default
        setPerProductRates({
          presentation: currentAdvancedRates?.presentation ?? effectiveRate,
          onePager: currentAdvancedRates?.onePager ?? effectiveRate,
          quiz: currentAdvancedRates?.quiz ?? effectiveRate,
          videoLesson: currentAdvancedRates?.videoLesson ?? effectiveRate
        });
        // Set default completion times for fallback
        setPerProductCompletionTimes({
          presentation: 8,
          onePager: 3,
          quiz: 6,
          videoLesson: 4
        });
        setCustomRate(currentCustomRate || effectiveRate);
        setDataLoaded(true); // Mark data as loaded even on fallback
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEffectiveRates();
  }, [isOpen, projectId, sectionIndex, lessonIndex, currentAdvancedEnabled, currentAdvancedRates, effectiveRate, currentCustomRate]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQualityTier(currentQualityTier || 'interactive');
      // Don't reset rates here - let the fetch effect handle it
    }
  }, [isOpen, currentQualityTier]);

  // Update custom rate when tier changes
  useEffect(() => {
    const selectedTierData = qualityTiers.find(tier => tier.id === qualityTier);
    if (selectedTierData && !currentCustomRate) {
      setCustomRate(selectedTierData.defaultHours);
    }
  }, [qualityTier, currentCustomRate]);

  if (!isOpen) {
    if (typeof window !== 'undefined') (window as any).__modalOpen = false;
    return null;
  }

  if (typeof window !== 'undefined') (window as any).__modalOpen = true;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (typeof window !== 'undefined') (window as any).__modalOpen = false;
      onClose();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave(customRate, qualityTier, advancedEnabled, perProductRates, perProductCompletionTimes);
      onClose();
    } catch (error) {
      console.error('Error saving lesson settings:', error);
      alert(t('modals.lessonSettings.failedToSave', 'Failed to save lesson tier setting'));
    } finally {
      setSaving(false);
    }
  };

  // Calculate creation time preview
  const completionTimeMinutes = parseInt(completionTime.replace('m', ''));
  const creationHours = Math.round((completionTimeMinutes / 60.0) * customRate);
  const selectedTierData = qualityTiers.find(tier => tier.id === qualityTier);
  const lessonTitle = 'Lesson Title'; // Placeholder, replace with actual lesson title if available

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] p-6 relative mx-4 flex flex-col">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10" 
          onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header - Fixed */}
        <div className="mb-6 text-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('modals.lessonSettings.title', 'Lesson Settings')}</h2>
          <p className="text-gray-600">{t('modals.lessonSettings.lessonTitle', 'Lesson Title')}</p>
        </div>

        {/* Loading Overlay */}
        {!dataLoaded && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
              <div className="text-gray-600">Loading settings...</div>
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="mb-6">
            
            {/* Table-like Layout */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-3">
                  <div className="col-span-3">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">{t('modals.lessonSettings.tier', 'Tier')}</h4>
                  </div>
                  <div className="col-span-3">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">{t('modals.folderSettings.contentExamples', 'Content Examples')}</h4>
                  </div>
                  <div className="col-span-6">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">
                      {t('modals.folderSettings.hoursRange', 'Hours Range')}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200">
                {qualityTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                      qualityTier === tier.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setQualityTier(tier.id)}
                  >
                    <div className="grid grid-cols-12 gap-4 px-6 py-4">
                      {/* Tier Column */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tier.bgColor}`}>
                            {tier.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${tier.color} truncate`}>{tier.name}</h4>
                              {qualityTier === tier.id && (
                                <Check size={16} className={`${tier.color}`} />
                              )}
                            </div>
                          </div>
                          {/* Gear icon for advanced settings */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const isCurrentlyOpen = advancedTierOpen === tier.id;
                              const willOpen = !isCurrentlyOpen;
                              setAdvancedTierOpen(willOpen ? tier.id : null);
                              setGlobalAdvancedOpen(willOpen);
                              
                              // CRITICAL FIX: Actually enable/disable advanced mode
                              if (willOpen && !advancedEnabled) {
                                setAdvancedEnabled(true);
                                console.log('🔍 [LESSON_MODAL] Gear clicked - enabling advanced mode');
                                // If not already advanced, initialize sliders to current effective rate
                                if (perProductRates.presentation === 0) {
                                  const fallbackRate = customRate || effectiveRate;
                                  setPerProductRates({
                                    presentation: fallbackRate,
                                    onePager: fallbackRate,
                                    quiz: fallbackRate,
                                    videoLesson: fallbackRate
                                  });
                                  console.log('🔍 [LESSON_MODAL] Initialized advanced rates to:', fallbackRate);
                                }
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              advancedEnabled || globalAdvancedOpen
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                            }`}
                            title="Advanced Settings"
                          >
                            <Settings size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Content Examples Column */}
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-1">
                          {tier.features.map((feature, index) => (
                            <span
                              key={index}
                              className={`inline-block px-2 py-1 text-xs rounded-full ${
                                qualityTier === tier.id 
                                  ? `${tier.bgColor} ${tier.color} border ${tier.borderColor}`
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Hours Range Column */}
                      <div className="col-span-6">
                        {qualityTier === tier.id ? (
                          <div className="space-y-3">
                            {advancedTierOpen !== tier.id && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {customRate}{t('modals.folderSettings.hours', 'h')}
                                  </span>
                                </div>
                                <div className="relative">
                                  <input
                                    type="range"
                                    min={tier.hoursRange.min}
                                    max={tier.hoursRange.max}
                                    value={customRate}
                                    onChange={(e) => setCustomRate(parseInt(e.target.value))}
                                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                    style={{
                                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((customRate - tier.hoursRange.min) / (tier.hoursRange.max - tier.hoursRange.min)) * 100}%, #e5e7eb ${((customRate - tier.hoursRange.min) / (tier.hoursRange.max - tier.hoursRange.min)) * 100}%, #e5e7eb 100%)`
                                    }}
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded">{tier.hoursRange.min}{t('modals.folderSettings.hours', 'h')}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded">{tier.hoursRange.max}{t('modals.folderSettings.hours', 'h')}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {advancedTierOpen === tier.id && (
                              <div className="space-y-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                {/* Two Column Layout: Creation Rates | Completion Times */}
                                <div className="grid grid-cols-3 gap-6">
                                  
                                  {/* Left Column: Creation Rates (2/3 width) */}
                                  <div className="col-span-2 space-y-3">
                                    <div className="flex items-center gap-2 pb-2">
                                      <Calculator size={16} className="text-blue-600" />
                                      <h4 className="text-sm font-semibold text-blue-800">Creation Rates</h4>
                                      <span className="text-xs text-blue-500">(hours per completion hour)</span>
                                    </div>
                                    {[
                                      { key: 'presentation', label: t('modals.rates.presentation', 'Presentation'), value: perProductRates.presentation, setter: (v:number)=>setPerProductRates(p=>({...p, presentation:v})), icon: <BookText size={14} className="text-blue-600" /> },
                                      { key: 'onePager', label: t('modals.rates.onePager', 'One‑pager'), value: perProductRates.onePager, setter: (v:number)=>setPerProductRates(p=>({...p, onePager:v})), icon: <FileText size={14} className="text-blue-600" /> },
                                      { key: 'quiz', label: t('modals.rates.quiz', 'Quiz'), value: perProductRates.quiz, setter: (v:number)=>setPerProductRates(p=>({...p, quiz:v})), icon: <HelpCircle size={14} className="text-blue-600" /> },
                                      { key: 'videoLesson', label: t('modals.rates.videoLesson', 'Video lesson'), value: perProductRates.videoLesson, setter: (v:number)=>setPerProductRates(p=>({...p, videoLesson:v})), icon: <Video size={14} className="text-blue-600" /> },
                                    ].map((cfg)=> (
                                      <div key={cfg.key} className="bg-white rounded-md p-3 border border-blue-100 h-20 flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-700 flex items-center gap-2">
                                            {cfg.icon}
                                            {cfg.label}
                                          </span>
                                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                            {cfg.value}h
                                          </span>
                                        </div>
                                        <div className="mt-2">
                                          <input
                                            type="range"
                                            min={tier.hoursRange.min}
                                            max={tier.hoursRange.max}
                                            value={cfg.value}
                                            onChange={(e)=>cfg.setter(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                            style={{
                                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((cfg.value - tier.hoursRange.min) / (tier.hoursRange.max - tier.hoursRange.min)) * 100}%, #e5e7eb ${((cfg.value - tier.hoursRange.min) / (tier.hoursRange.max - tier.hoursRange.min)) * 100}%, #e5e7eb 100%)`
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Right Column: Completion Times (1/3 width) */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 pb-2">
                                      <Clock size={16} className="text-green-600" />
                                      <h4 className="text-sm font-semibold text-green-800">Completion Time</h4>
                                    </div>
                                    {[
                                      { key: 'presentation', label: t('modals.completionTimes.presentation', 'Presentation'), value: perProductCompletionTimes.presentation, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, presentation:v})), icon: <BookText size={14} className="text-green-600" /> },
                                      { key: 'onePager', label: t('modals.completionTimes.onePager', 'One‑pager'), value: perProductCompletionTimes.onePager, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, onePager:v})), icon: <FileText size={14} className="text-green-600" /> },
                                      { key: 'quiz', label: t('modals.completionTimes.quiz', 'Quiz'), value: perProductCompletionTimes.quiz, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, quiz:v})), icon: <HelpCircle size={14} className="text-green-600" /> },
                                      { key: 'videoLesson', label: t('modals.completionTimes.videoLesson', 'Video lesson'), value: perProductCompletionTimes.videoLesson, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, videoLesson:v})), icon: <Video size={14} className="text-green-600" /> },
                                    ].map((cfg)=> (
                                      <div key={cfg.key} className="bg-white rounded-md p-3 border border-green-100 h-20 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2">
                                          {cfg.icon}
                                          <span className="text-xs text-gray-600 truncate">{cfg.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={cfg.value}
                                            onChange={(e)=>cfg.setter(parseInt(e.target.value) || 1)}
                                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-medium text-black"
                                          />
                                          <span className="text-xs text-gray-500">min</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Rate Information */}
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><span className="font-medium">{t('modals.lessonSettings.example', 'Example')}:</span> 1{t('modals.folderSettings.hours', 'h')} = {customRate}{t('modals.folderSettings.hours', 'h')}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {tier.hoursRange.min}-{tier.hoursRange.max}{t('modals.folderSettings.hours', 'h')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Info Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="text-sm text-blue-700">
              <Calculator className="inline mr-1" size={14} />
              {t('modals.lessonSettings.lessonQualityTier', 'Lesson quality tier set to')} <span className="font-semibold">{selectedTierData?.name}</span> ({customRate}{t('modals.folderSettings.hours', 'h')} {t('modals.lessonSettings.perCompletionHour', 'per completion hour')})
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}
            disabled={saving}
          >
            {t('modals.lessonSettings.cancel', 'Cancel')}
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('modals.lessonSettings.saving', 'Saving...')}
              </div>
            ) : (
              t('modals.lessonSettings.saveChanges', 'Save Changes')
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 3px 8px rgba(59, 130, 246, 0.4), 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 3px 8px rgba(59, 130, 246, 0.4), 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0,0,0,0.1);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
