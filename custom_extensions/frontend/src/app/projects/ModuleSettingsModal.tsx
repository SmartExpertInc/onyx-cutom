"use client";

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Zap, Award, Crown } from 'lucide-react';

interface ModuleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  currentCustomRate?: number;
  currentQualityTier?: string;
  onSave: (customRate: number, qualityTier: string) => Promise<void>;
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
  onSave
}: ModuleSettingsModalProps) {
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
      console.error('Error saving module settings:', error);
      alert('Failed to save module tier setting');
    } finally {
      setSaving(false);
    }
  };

  const selectedTierData = qualityTiers.find(tier => tier.id === qualityTier);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Module Quality Settings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure quality tier for: <span className="font-medium">{moduleTitle}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Quality Tier Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Tier</h3>
            <div className="space-y-3">
              {qualityTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                    qualityTier === tier.id
                      ? `${tier.borderColor} ${tier.bgColor}`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setQualityTier(tier.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {tier.icon}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className={`font-semibold ${tier.color}`}>{tier.name}</h4>
                          <span className="text-sm text-gray-500">
                            ({tier.defaultHours}h default, {tier.hoursRange.min}-{tier.hoursRange.max}h range)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {tier.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          qualityTier === tier.id
                            ? `${tier.borderColor} bg-current`
                            : 'border-gray-300'
                        }`}>
                          {qualityTier === tier.id && (
                            <div className={`w-2 h-2 rounded-full bg-white m-0.5`} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Rate Slider */}
          {selectedTierData && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Custom Rate</h3>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{customRate}</span> hours per completion hour
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="range"
                  min={selectedTierData.hoursRange.min}
                  max={selectedTierData.hoursRange.max}
                  value={customRate}
                  onChange={(e) => setCustomRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{selectedTierData.hoursRange.min}h</span>
                  <span className="font-medium">Default: {selectedTierData.defaultHours}h</span>
                  <span>{selectedTierData.hoursRange.max}h</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 