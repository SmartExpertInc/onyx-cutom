import React, { useState } from 'react';
import { Check, BookOpen, Zap, Award, Crown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProjectSettingsModalProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  projectId: number;
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

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ 
  open, 
  onClose, 
  projectName, 
  projectId,
  currentTier = 'interactive',
  onTierChange 
}) => {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [customRate, setCustomRate] = useState<number>(200); // Default to interactive tier
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const qualityTiers: QualityTier[] = [
    {
      id: 'basic',
      name: t('modals.folderSettings.basic', 'Basic'),
      description: t('modals.folderSettings.basicDescription', 'Simple e-learning content with essential features for straightforward training needs'),
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
      name: t('modals.folderSettings.interactive', 'Interactive'),
      description: t('modals.folderSettings.interactiveDescription', 'Engaging content with interactive elements for better learner engagement and retention'),
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
      name: t('modals.folderSettings.advanced', 'Advanced'),
      description: t('modals.folderSettings.advancedDescription', 'Sophisticated learning experiences with personalized content and advanced interactivity'),
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
      name: t('modals.folderSettings.immersive', 'Immersive'),
      description: t('modals.folderSettings.immersiveDescription', 'Premium learning experiences with cutting-edge technology for maximum engagement'),
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
      const response = await fetch(`/api/custom-projects-backend/projects/${projectId}/tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality_tier: selectedTier,
          custom_rate: customRate
        })
      });

      if (response.ok) {
        if (onTierChange) {
          onTierChange(selectedTier);
        }
        onClose();
      } else {
        console.error('Failed to update project tier');
      }
    } catch (error) {
      console.error('Error updating project tier:', error);
    } finally {
      setSaving(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('modals.projectSettings.title', 'Course Settings')}</h2>
          <p className="text-gray-600">{t('modals.projectSettings.subtitle', 'Configure production quality for')} <span className="font-semibold text-blue-600">{projectName}</span></p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modals.folderSettings.features', 'Features')}</h3>
              <div className="space-y-4">
                {qualityTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedTier === tier.id
                        ? `${tier.borderColor} ${tier.bgColor}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${tier.bgColor}`}>
                        {tier.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${tier.color}`}>{tier.name}</h4>
                          {selectedTier === tier.id && (
                            <Check size={16} className="text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {tier.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modals.folderSettings.hoursRange', 'Hours Range')}</h3>
              <div className="space-y-4">
                {qualityTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-lg border-2 ${
                      selectedTier === tier.id
                        ? `${tier.borderColor} ${tier.bgColor}`
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${tier.bgColor}`}>
                          {tier.icon}
                        </div>
                        <span className={`font-semibold ${tier.color}`}>{tier.name}</span>
                      </div>
                      {selectedTier === tier.id && (
                        <Check size={16} className="text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {tier.hoursRange.min}-{tier.hoursRange.max}h
                      </div>
                      {selectedTier === tier.id && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{t('modals.folderSettings.customRate', 'Custom Rate')}:</span>
                          <input
                            type="number"
                            value={customRate}
                            onChange={(e) => setCustomRate(parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={tier.hoursRange.min}
                            max={tier.hoursRange.max}
                          />
                          <span className="text-xs text-gray-500">h</span>
                        </div>
                      )}
                    </div>
                    {selectedTier === tier.id && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium">{t('modals.folderSettings.example', 'Example')}:</span> 1h = {customRate}h</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
            {t('modals.folderSettings.cancel', 'Cancel')}
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
                {t('modals.folderSettings.saving', 'Saving...')}
              </div>
            ) : (
              t('modals.folderSettings.saveChanges', 'Save Changes')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal; 