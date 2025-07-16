'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Clock, Calculator, Check, BookOpen, Zap, Award, Crown } from 'lucide-react';

interface LessonSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  currentCustomRate?: number;
  currentQualityTier?: string;
  completionTime: string;
  onSave: (customRate: number, qualityTier: string) => void;
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
  lessonTitle,
  currentCustomRate,
  currentQualityTier,
  completionTime,
  onSave
}: LessonSettingsModalProps) {
  const [qualityTier, setQualityTier] = useState(currentQualityTier || 'interactive');
  const [customRate, setCustomRate] = useState(currentCustomRate || 200);
  const [saving, setSaving] = useState(false);

  const qualityTiers: QualityTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Simple e-learning content with essential features for straightforward training needs',
      icon: <BookOpen size={20} className="text-green-500" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: ['Slides', 'Text', 'Simple Tests', 'Non-interactive SCORM'],
      hoursRange: { min: 10, max: 200 },
      defaultHours: 100
    },
    {
      id: 'interactive',
      name: 'Interactive',
      description: 'Engaging content with interactive elements for better learner engagement and retention',
      icon: <Zap size={20} className="text-orange-500" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: ['Animations', 'Clickable Blocks', 'Voiceover', 'Interactive SCORM', 'Mobile Support'],
      hoursRange: { min: 100, max: 250 },
      defaultHours: 200
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'Sophisticated learning experiences with personalized content and advanced interactivity',
      icon: <Award size={20} className="text-purple-500" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: ['Scenarios', 'Simulations', 'Gamification', 'Adaptation to Roles', 'Multilingualism'],
      hoursRange: { min: 200, max: 400 },
      defaultHours: 300
    },
    {
      id: 'immersive',
      name: 'Immersive',
      description: 'Premium learning experiences with cutting-edge technology for maximum engagement',
      icon: <Crown size={20} className="text-blue-500" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Videos with Actors', 'VR/AR', 'LMS-Integration', 'Personalized Courses and Simulations'],
      hoursRange: { min: 400, max: 1000 },
      defaultHours: 700
    }
  ];

  // Reset modal state when opened with new data
  useEffect(() => {
    if (isOpen) {
      setQualityTier(currentQualityTier || 'interactive');
      setCustomRate(currentCustomRate || 200);
    }
  }, [isOpen, currentQualityTier, currentCustomRate]);

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
      await onSave(customRate, qualityTier);
      onClose();
    } catch (error) {
      console.error('Error saving lesson settings:', error);
      alert('Failed to save lesson tier setting');
    } finally {
      setSaving(false);
    }
  };

  // Calculate creation time preview
  const completionTimeMinutes = parseInt(completionTime.replace('m', ''));
  const creationHours = Math.round((completionTimeMinutes / 60.0) * customRate);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Settings</h2>
          <p className="text-gray-600">Configure production quality for <span className="font-semibold text-blue-600">{lessonTitle}</span></p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="mb-6">
            
            {/* Table-like Layout */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-3">
                  <div className="col-span-3">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">Tier</h4>
                  </div>
                  <div className="col-span-6">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">Content Examples</h4>
                  </div>
                  <div className="col-span-3">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">Hours Range</h4>
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
                            {/* Slider */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {customRate}h
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
                                  <span>{tier.hoursRange.min}h</span>
                                  <span>{tier.hoursRange.max}h</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Rate Information */}
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><span className="font-medium">Example:</span> 1h = {customRate}h</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {tier.hoursRange.min}-{tier.hoursRange.max}h
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

          {/* Creation Time Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-blue-600" size={20} />
              <h3 className="font-semibold text-blue-900">Creation Time Preview</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Completion Time:</span>
                <span className="ml-2 font-medium text-gray-900">{completionTime}</span>
              </div>
              <div>
                <span className="text-gray-600">Creation Hours:</span>
                <span className="ml-2 font-medium text-blue-600">{creationHours}h</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-700">
              <Calculator className="inline mr-1" size={12} />
              Calculation: {completionTimeMinutes} minutes × {customRate} = {creationHours} hours
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
            Cancel
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
                Saving...
              </div>
            ) : (
              'Save Changes'
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