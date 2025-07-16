'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Clock, Calculator } from 'lucide-react';

interface LessonSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  currentCustomRate?: number;
  currentQualityTier?: string;
  completionTime: string;
  onSave: (customRate: number, qualityTier: string) => void;
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

  // Reset modal state when opened with new values
  useEffect(() => {
    if (isOpen) {
      setQualityTier(currentQualityTier || 'interactive');
      setCustomRate(currentCustomRate || 200);
    }
  }, [isOpen, currentQualityTier, currentCustomRate]);

  const handleSave = () => {
    onSave(customRate, qualityTier);
    onClose();
  };

  // Quality tier options with their base values and ranges
  const qualityTiers = [
    { id: 'basic', label: 'Basic', baseValue: 100, range: [10, 200], description: 'Simple content creation' },
    { id: 'interactive', label: 'Interactive', baseValue: 200, range: [100, 250], description: 'Engaging interactive content' },
    { id: 'advanced', label: 'Advanced', baseValue: 300, range: [200, 400], description: 'Complex detailed content' },
    { id: 'immersive', label: 'Immersive', baseValue: 700, range: [400, 1000], description: 'Highly immersive experience' }
  ];

  const selectedTier = qualityTiers.find(tier => tier.id === qualityTier) || qualityTiers[1];

  // Calculate preview values
  const completionTimeMinutes = completionTime ? parseInt(completionTime.replace('m', '')) || 0 : 0;
  const previewCreationHours = completionTimeMinutes > 0 ? Math.round((completionTimeMinutes / 60.0) * customRate) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Lesson Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lesson Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Lesson Details</h3>
            <p className="text-sm text-gray-600 mb-2">{lessonTitle}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Completion Time: {completionTime || '5m'}</span>
            </div>
          </div>

          {/* Quality Tier Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quality Tier</h3>
            <div className="space-y-2">
              {qualityTiers.map((tier) => (
                <label
                  key={tier.id}
                  className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    qualityTier === tier.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="qualityTier"
                    value={tier.id}
                    checked={qualityTier === tier.id}
                    onChange={(e) => {
                      setQualityTier(e.target.value);
                      setCustomRate(tier.baseValue);
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{tier.label}</div>
                      <div className="text-sm text-gray-600">{tier.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{tier.baseValue}h</div>
                      <div className="text-xs text-gray-500">base rate</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Rate Slider */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Custom Rate</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Creation Hours per Content Hour</span>
                <span className="font-medium text-gray-900">{customRate}</span>
              </div>
              
              <input
                type="range"
                min={selectedTier.range[0]}
                max={selectedTier.range[1]}
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    ((customRate - selectedTier.range[0]) / (selectedTier.range[1] - selectedTier.range[0])) * 100
                  }%, #e5e7eb ${
                    ((customRate - selectedTier.range[0]) / (selectedTier.range[1] - selectedTier.range[0])) * 100
                  }%, #e5e7eb 100%)`
                }}
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{selectedTier.range[0]}</span>
                <span>{selectedTier.range[1]}</span>
              </div>
            </div>
          </div>

          {/* Preview Calculation */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-blue-900">Calculation Preview</h3>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>Completion Time: {completionTimeMinutes} minutes</div>
              <div>Custom Rate: {customRate} hours per content hour</div>
              <div className="font-medium border-t border-blue-200 pt-2 mt-2">
                Creation Hours: {previewCreationHours} hours
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
} 