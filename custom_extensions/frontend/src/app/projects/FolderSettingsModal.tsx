import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Award } from 'lucide-react';

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
  completionRate: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
}

const FolderSettingsModal: React.FC<FolderSettingsModalProps> = ({ 
  open, 
  onClose, 
  folderName, 
  folderId,
  currentTier = 'medium',
  onTierChange 
}) => {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [saving, setSaving] = useState(false);

  const qualityTiers: QualityTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Basic minimal package',
      completionRate: '1:120',
      icon: <Star size={20} className="text-yellow-500" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      features: ['Basic video lessons', 'Standard quality', 'Essential content']
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Good quality of product, live video lessons',
      completionRate: '1:200',
      icon: <Zap size={20} className="text-orange-500" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      features: ['Live video lessons', 'Enhanced quality', 'Interactive content']
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'Professional quality, deeply animated video lessons',
      completionRate: '1:320',
      icon: <Award size={20} className="text-purple-500" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: ['Deeply animated lessons', 'Professional quality', 'Advanced features']
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'The best product quality, movie-like video lessons',
      completionRate: '1:450',
      icon: <Crown size={20} className="text-blue-500" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Movie-like lessons', 'Premium quality', 'All features included']
    }
  ];

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
        body: JSON.stringify({ quality_tier: selectedTier })
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-8 relative mx-4">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" 
          onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Folder Settings</h2>
          <p className="text-gray-600">Configure production quality for <span className="font-semibold text-blue-600">{folderName}</span></p>
        </div>

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
                          {tier.completionRate}
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
            <div className="flex items-center gap-2 mb-2">
              {selectedTierData.icon}
              <h4 className={`font-semibold ${selectedTierData.color}`}>Selected: {selectedTierData.name}</h4>
            </div>
            <p className="text-sm text-gray-700 mb-2">{selectedTierData.description}</p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Completion to Creation Rate:</span> {selectedTierData.completionRate}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
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
    </div>
  );
};

export default FolderSettingsModal; 