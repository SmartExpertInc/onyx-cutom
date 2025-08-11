'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Clock, Calculator, Check, BookOpen, Zap, Award, Crown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ModuleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  currentCustomRate?: number;
  currentQualityTier?: string;
  onSave: (
    customRate: number, 
    qualityTier: string, 
    advancedEnabled?: boolean, 
    advancedRates?: { presentation: number; onePager: number; quiz: number; videoLesson: number }
  ) => void;
  projectId?: number;
  sectionIndex?: number;
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

export default function ModuleSettingsModal({
  isOpen,
  onClose,
  moduleTitle,
  currentCustomRate,
  currentQualityTier,
  onSave,
  projectId,
  sectionIndex
}: ModuleSettingsModalProps) {
  const { t } = useLanguage();
  
  // Debug logging for props
  console.log('🔍 [MODULE_MODAL] Props received:', {
    isOpen,
    projectId,
    sectionIndex,
    currentCustomRate,
    moduleTitle
  });
  
  const [qualityTier, setQualityTier] = useState(currentQualityTier || 'interactive');
  const [customRate, setCustomRate] = useState(0); // Initialize to 0, will be set by fetch
  const [saving, setSaving] = useState(false);
  const [advancedEnabled, setAdvancedEnabled] = useState(false); // Initialize to false, will be set by fetch
  const [perProductRates, setPerProductRates] = useState({
    presentation: 0, // Initialize to 0, will be set by fetch
    onePager: 0,
    quiz: 0,
    videoLesson: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Track if we've loaded backend data

  // Debug logging when states change
  React.useEffect(() => {
    console.log('🔍 [MODULE_MODAL] State changed - customRate:', customRate);
  }, [customRate]);

  React.useEffect(() => {
    console.log('🔍 [MODULE_MODAL] State changed - perProductRates:', perProductRates);
  }, [perProductRates]);

  // Fetch effective rates from backend when modal opens
  React.useEffect(() => {
    if (!isOpen || !projectId) {
      console.log('🔍 [MODULE_MODAL] Skip fetch:', { isOpen, projectId });
      return;
    }
    
    console.log('🔍 [MODULE_MODAL] Starting fetch for:', { projectId, sectionIndex });
    
    const fetchEffectiveRates = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (sectionIndex !== undefined) params.set('section_index', sectionIndex.toString());
        
        const url = `/api/custom-projects-backend/projects/${projectId}/effective-rates?${params}`;
        console.log('🔍 [MODULE_MODAL] Fetching URL:', url);
        
        const response = await fetch(url, {
          credentials: 'same-origin'
        });
        
        console.log('🔍 [MODULE_MODAL] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [MODULE_MODAL] Backend response:', JSON.stringify(data, null, 2));
          
          // Set advanced enabled state
          console.log('🔍 [MODULE_MODAL] Setting advancedEnabled to:', data.is_advanced);
          setAdvancedEnabled(data.is_advanced);
          
          // Set per-product rates (convert backend naming to frontend naming)
          const newRates = {
            presentation: data.rates.presentation,
            onePager: data.rates.one_pager,
            quiz: data.rates.quiz,
            videoLesson: data.rates.video_lesson
          };
          console.log('🔍 [MODULE_MODAL] Setting perProductRates to:', JSON.stringify(newRates, null, 2));
          setPerProductRates(newRates);
          
          // Set single rate fallback
          console.log('🔍 [MODULE_MODAL] Setting customRate to:', data.fallback_single_rate);
          setCustomRate(data.fallback_single_rate);
          setDataLoaded(true); // Mark data as loaded
        } else {
          console.warn('🔍 [MODULE_MODAL] Failed to fetch effective rates for module, using defaults');
          console.log('🔍 [MODULE_MODAL] Fallback to currentCustomRate:', currentCustomRate);
          setAdvancedEnabled(false);
          setPerProductRates({
            presentation: currentCustomRate || 200,
            onePager: currentCustomRate || 200,
            quiz: currentCustomRate || 200,
            videoLesson: currentCustomRate || 200
          });
          setCustomRate(currentCustomRate || 200);
          setDataLoaded(true); // Mark data as loaded even if fetch fails
        }
      } catch (error) {
        console.error('🔍 [MODULE_MODAL] Error fetching effective rates for module:', error);
        setAdvancedEnabled(false);
        setPerProductRates({
          presentation: currentCustomRate || 200,
          onePager: currentCustomRate || 200,
          quiz: currentCustomRate || 200,
          videoLesson: currentCustomRate || 200
        });
        setCustomRate(currentCustomRate || 200);
        setDataLoaded(true); // Mark data as loaded even on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEffectiveRates();
  }, [isOpen, projectId, sectionIndex, currentCustomRate]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQualityTier(currentQualityTier || 'interactive');
      // Don't reset rates here - let the fetch effect handle it
    }
  }, [isOpen, currentQualityTier]);

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
      await onSave(customRate, qualityTier, advancedEnabled, perProductRates);
      onClose();
    } catch (error) {
      console.error('Error saving module settings:', error);
      alert(t('modals.moduleSettings.failedToSave', 'Failed to save module tier setting'));
    } finally {
      setSaving(false);
    }
  };

  const selectedTierData = qualityTiers.find(tier => tier.id === qualityTier);

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('modals.moduleSettings.title', 'Module Settings')}</h2>
          <p className="text-gray-600">{t('modals.moduleSettings.subtitle', 'Configure production quality for')} <span className="font-semibold text-blue-600">{moduleTitle}</span></p>
        </div>

        {/* Loading Overlay */}
        {!dataLoaded && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
              <div className="text-gray-600">Loading module settings...</div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="mb-6">
            
            {/* Table-like Layout */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-3">
                  <div className="col-span-3">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">{t('modals.moduleSettings.tier', 'Tier')}</h4>
                  </div>
                  <div className="col-span-6">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">{t('modals.moduleSettings.contentExamples', 'Content Examples')}</h4>
                  </div>
                  <div className="col-span-3">
                    <h4 className="font-semibold text-gray-700 text-sm text-left flex items-center gap-2">
                      {t('modals.moduleSettings.hoursRange', 'Hours Range')}
                      <label className="flex items-center gap-2 ml-2 text-xs">
                        <input type="checkbox" checked={advancedEnabled} onChange={()=>{
                          const next = !advancedEnabled; setAdvancedEnabled(next);
                          if (next) setPerProductRates({ presentation: customRate, onePager: customRate, quiz: customRate, videoLesson: customRate });
                        }} />
                        {t('modals.advanced', 'Advanced')}
                      </label>
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
                        </div>
                      </div>

                      {/* Content Examples Column */}
                      <div className="col-span-6">
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
                      <div className="col-span-3">
                        {qualityTier === tier.id ? (
                          <div className="space-y-3">
                            {!advancedEnabled && (
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
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                      background: `linear-gradient(to right, ${tier.color.replace('text-', '')} 0%, ${tier.color.replace('text-', '')} ${((customRate - tier.hoursRange.min) / (tier.hoursRange.max - tier.hoursRange.min)) * 100}%, #e5e7eb ${((customRate - tier.hoursRange.min) / (tier.hoursRange.max - tier.hoursRange.min)) * 100}%, #e5e7eb 100%)`
                                    }}
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{tier.hoursRange.min}{t('modals.folderSettings.hours', 'h')}</span>
                                    <span>{tier.hoursRange.max}{t('modals.folderSettings.hours', 'h')}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {advancedEnabled && (
                              <div className="space-y-4">
                                {[
                                  { key: 'presentation', label: t('modals.rates.presentation', 'Presentation rate'), value: perProductRates.presentation, setter: (v:number)=>setPerProductRates(p=>({...p, presentation:v})) },
                                  { key: 'onePager', label: t('modals.rates.onePager', 'One‑pager rate'), value: perProductRates.onePager, setter: (v:number)=>setPerProductRates(p=>({...p, onePager:v})) },
                                  { key: 'quiz', label: t('modals.rates.quiz', 'Quiz rate'), value: perProductRates.quiz, setter: (v:number)=>setPerProductRates(p=>({...p, quiz:v})) },
                                  { key: 'videoLesson', label: t('modals.rates.videoLesson', 'Video lesson rate'), value: perProductRates.videoLesson, setter: (v:number)=>setPerProductRates(p=>({...p, videoLesson:v})) },
                                ].map((cfg)=> (
                                  <div key={cfg.key}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-gray-700">{cfg.label}: <span className="font-semibold">{cfg.value}{t('modals.folderSettings.hours', 'h')}</span></span>
                                    </div>
                                    <input type="range" min={tier.hoursRange.min} max={tier.hoursRange.max} value={cfg.value} onChange={(e)=>cfg.setter(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Rate Information */}
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><span className="font-medium">{t('modals.moduleSettings.example', 'Example')}:</span> 1{t('modals.folderSettings.hours', 'h')} = {customRate}{t('modals.folderSettings.hours', 'h')}</p>
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

          {/* Module Info Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="text-sm text-blue-700">
              <Calculator className="inline mr-1" size={14} />
              {t('modals.moduleSettings.moduleQualityTier', 'Module quality tier set to')} <span className="font-semibold">{selectedTierData?.name}</span> ({customRate}{t('modals.folderSettings.hours', 'h')} {t('modals.moduleSettings.perCompletionHour', 'per completion hour')})
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
            {t('modals.moduleSettings.cancel', 'Cancel')}
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
                {t('modals.moduleSettings.saving', 'Saving...')}
              </div>
            ) : (
              t('modals.moduleSettings.saveChanges', 'Save Changes')
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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