import React, { useState } from 'react';
import { Check, BookOpen, Zap, Award, Crown } from 'lucide-react';

interface FolderSettingsModalProps {
  open: boolean;
  onClose: () => void;
  folderName: string;
  folderId: number;
  currentTier?: string;
  onTierChange?: (tier: string) => void;
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

const FolderSettingsModal: React.FC<FolderSettingsModalProps> = ({ 
  open, 
  onClose, 
  folderName, 
  folderId,
  currentTier = 'interactive',
  onTierChange 
}) => {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [customRate, setCustomRate] = useState<number>(200); // Default to interactive tier
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
      hoursRange: { min: 50, max: 200 },
      defaultHours: 120
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

  // Update custom rate when tier changes
  React.useEffect(() => {
    const selectedTierData = qualityTiers.find(tier => tier.id === selectedTier);
    if (selectedTierData) {
      setCustomRate(selectedTierData.defaultHours);
    }
  }, [selectedTier]);

  if (!open) {
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
      const response = await fetch(`/api/custom-projects-backend/projects/folders/${folderId}/tier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ 
          quality_tier: selectedTier,
          custom_rate: customRate 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save folder tier');
      }
      
      if (onTierChange) {
        onTierChange(selectedTier);
      }
      
      // Refresh the page to update folder colors
      window.location.reload();
      
      onClose();
    } catch (error) {
      console.error('Error saving folder settings:', error);
      alert('Failed to save folder tier setting');
    } finally {
      setSaving(false);
    }
  };

  const selectedTierData = qualityTiers.find(tier => tier.id === selectedTier);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] p-6 relative mx-4 flex flex-col">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10" 
          onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header - Fixed */}
        <div className="mb-4 text-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Folder Settings</h2>
          <p className="text-gray-600">Configure production quality for <span className="font-semibold text-blue-600">{folderName}</span></p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Quality Tiers</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {qualityTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[140px] ${
                    selectedTier === tier.id
                      ? `${tier.borderColor} ${tier.bgColor} shadow-md`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  {selectedTier === tier.id && (
                    <div className={`absolute -top-2 -right-2 w-6 h-6 ${tier.bgColor} border-2 ${tier.borderColor} rounded-full flex items-center justify-center`}>
                      <Check size={14} className={tier.color} />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${tier.bgColor}`}>
                      {tier.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${tier.color} truncate`}>{tier.name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                          {tier.hoursRange.min}-{tier.hoursRange.max}h
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 break-words whitespace-normal leading-relaxed italic text-left">{tier.description}</p>
                      <ul className="space-y-1">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="text-xs text-gray-500 flex items-start gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="break-words">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedTierData && (
            <div className={`mb-6 p-4 rounded-lg ${selectedTierData.bgColor} border ${selectedTierData.borderColor}`}>
              <div className="flex items-center gap-2 mb-3">
                {selectedTierData.icon}
                <h4 className={`font-semibold ${selectedTierData.color}`}>Selected: {selectedTierData.name}</h4>
              </div>
              <p className="text-sm text-gray-700 mb-4">{selectedTierData.description}</p>
              
              {/* Custom Rate Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Custom Creation Rate: <span className="font-bold text-blue-600">{customRate}h</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    Range: {selectedTierData.hoursRange.min}-{selectedTierData.hoursRange.max}h
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={selectedTierData.hoursRange.min}
                    max={selectedTierData.hoursRange.max}
                    value={customRate}
                    onChange={(e) => setCustomRate(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${selectedTierData.color.replace('text-', '')} 0%, ${selectedTierData.color.replace('text-', '')} ${((customRate - selectedTierData.hoursRange.min) / (selectedTierData.hoursRange.max - selectedTierData.hoursRange.min)) * 100}%, #e5e7eb ${((customRate - selectedTierData.hoursRange.min) / (selectedTierData.hoursRange.max - selectedTierData.hoursRange.min)) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{selectedTierData.hoursRange.min}h</span>
                    <span>{selectedTierData.hoursRange.max}h</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This rate determines how many creation hours are calculated for each minute of completion time.
                  <br />
                  <span className="font-medium">Example:</span> A 10-minute lesson will require {(10 * customRate / 60).toFixed(1)}h of creation time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Features Included:</h5>
                  <ul className="space-y-1">
                    {selectedTierData.features.map((feature, index) => (
                      <li key={index} className="text-gray-600 flex items-start gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Rate Information:</h5>
                  <div className="space-y-1 text-gray-600">
                    <p><span className="font-medium">Default Rate:</span> {selectedTierData.defaultHours}h</p>
                    <p><span className="font-medium">Current Rate:</span> {customRate}h</p>
                    <p><span className="font-medium">Ratio:</span> 1:{customRate} (completion:creation)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
      `}</style>
    </div>
  );
};

export default FolderSettingsModal; 