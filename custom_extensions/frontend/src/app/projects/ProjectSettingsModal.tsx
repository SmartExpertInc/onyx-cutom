import React, { useState } from 'react';
import { Check, BookOpen, Zap, Award, Crown, BookText, Video, HelpCircle, FileText } from 'lucide-react';
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
  const [customRate, setCustomRate] = useState(0); // Initialize to 0, will be set by fetch
  const [saving, setSaving] = useState(false);
  const [advancedEnabled, setAdvancedEnabled] = useState(false); // Initialize to false, will be set by fetch
  const [perProductRates, setPerProductRates] = useState({
    presentation: 0, // Initialize to 0, will be set by fetch
    onePager: 0,
    quiz: 0,
    videoLesson: 0,
  });
  const [perProductCompletionTimes, setPerProductCompletionTimes] = useState({
    presentation: 8, // Default: 8 minutes for presentation
    onePager: 3,    // Default: 3 minutes for one-pager
    quiz: 6,        // Default: 6 minutes for quiz
    videoLesson: 4  // Default: 4 minutes for video-lesson
  });
  const { t } = useLanguage();
  const [dataLoaded, setDataLoaded] = useState(false); // Track if we've loaded backend data

  // Prefill from backend when modal opens
  React.useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch(`/api/custom-projects-backend/projects/view/${projectId}`, { cache: 'no-store', credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          const cr = typeof data.custom_rate === 'number' ? data.custom_rate : 200;
          const qt = data.quality_tier || currentTier || 'interactive';
          setCustomRate(cr);
          setSelectedTier(qt);
          if (data.is_advanced) {
            setAdvancedEnabled(true);
            const ar = data.advanced_rates || {};
            setPerProductRates({
              presentation: typeof ar.presentation === 'number' ? ar.presentation : cr,
              onePager: typeof ar.one_pager === 'number' ? ar.one_pager : cr,
              quiz: typeof ar.quiz === 'number' ? ar.quiz : cr,
              videoLesson: typeof ar.video_lesson === 'number' ? ar.video_lesson : cr,
            });
            // Load completion times if available
            const ct = data.completion_times || {};
            setPerProductCompletionTimes({
              presentation: typeof ct.presentation === 'number' ? ct.presentation : 8,
              onePager: typeof ct.one_pager === 'number' ? ct.one_pager : 3,
              quiz: typeof ct.quiz === 'number' ? ct.quiz : 6,
              videoLesson: typeof ct.video_lesson === 'number' ? ct.video_lesson : 4,
            });
          } else {
            setAdvancedEnabled(false);
            setPerProductRates({ presentation: cr, onePager: cr, quiz: cr, videoLesson: cr });
            // Set default completion times
            setPerProductCompletionTimes({
              presentation: 8,
              onePager: 3,
              quiz: 6,
              videoLesson: 4
            });
          }
          setDataLoaded(true);
        }
      } catch {}
    })();
  }, [open, projectId]);

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
  React.useEffect(() => {
    const selectedTierData = qualityTiers.find(tier => tier.id === selectedTier);
    if (selectedTierData) {
      setCustomRate(selectedTierData.defaultHours);
    }
  }, [selectedTier]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        quality_tier: selectedTier,
        custom_rate: customRate,
      };
      if (advancedEnabled) {
        payload.is_advanced = true;
        payload.advanced_rates = {
          presentation: perProductRates.presentation,
          one_pager: perProductRates.onePager,
          quiz: perProductRates.quiz,
          video_lesson: perProductRates.videoLesson,
        };
        payload.completion_times = {
          presentation: perProductCompletionTimes.presentation,
          one_pager: perProductCompletionTimes.onePager,
          quiz: perProductCompletionTimes.quiz,
          video_lesson: perProductCompletionTimes.videoLesson,
        };
      }
      const response = await fetch(`/api/custom-projects-backend/projects/${projectId}/tier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save project tier');
      }
      
      if (onTierChange) {
        onTierChange(selectedTier);
      }
      
      window.location.reload();
      
      onClose();
    } catch (error) {
      console.error('Error saving project settings:', error);
      alert(t('modals.projectSettings.failedToSave', 'Failed to save project tier setting'));
    } finally {
      setSaving(false);
    }
  };

  const selectedTierData = qualityTiers.find(tier => tier.id === selectedTier);

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

        {/* Loading Overlay */}
        {!dataLoaded && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
              <div className="text-gray-600">Loading project settings...</div>
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
                    <h4 className="font-semibold text-gray-700 text-sm text-left">{t('modals.folderSettings.tier', 'Tier')}</h4>
                  </div>
                  <div className="col-span-6">
                    <h4 className="font-semibold text-gray-700 text-sm text-left">{t('modals.folderSettings.contentExamples', 'Content Examples')}</h4>
                  </div>
                  <div className="col-span-3">
                    <h4 className="font-semibold text-gray-700 text-sm text-left flex items-center gap-2">
                      {t('modals.folderSettings.hoursRange', 'Hours Range')}
                      <label className="flex items-center gap-2 ml-2 text-xs">
                        <input type="checkbox" checked={advancedEnabled} onChange={() => {
                          const next = !advancedEnabled;
                          setAdvancedEnabled(next);
                          if (next) {
                            setPerProductRates({ presentation: customRate, onePager: customRate, quiz: customRate, videoLesson: customRate });
                          }
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
                      selectedTier === tier.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTier(tier.id)}
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
                              {selectedTier === tier.id && (
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
                                selectedTier === tier.id 
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
                        {selectedTier === tier.id ? (
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
                                {/* Rate Fields */}
                                <div className="space-y-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('modals.rates.title', 'Creation Rates')}</h4>
                                  {[
                                    { key: 'presentation', label: t('modals.rates.presentation', 'Presentation rate'), value: perProductRates.presentation, setter: (v:number)=>setPerProductRates(p=>({...p, presentation:v})), icon: <BookText size={14} className="text-gray-600" /> },
                                    { key: 'onePager', label: t('modals.rates.onePager', 'One‑pager rate'), value: perProductRates.onePager, setter: (v:number)=>setPerProductRates(p=>({...p, onePager:v})), icon: <FileText size={14} className="text-gray-600" /> },
                                    { key: 'quiz', label: t('modals.rates.quiz', 'Quiz rate'), value: perProductRates.quiz, setter: (v:number)=>setPerProductRates(p=>({...p, quiz:v})), icon: <HelpCircle size={14} className="text-gray-600" /> },
                                    { key: 'videoLesson', label: t('modals.rates.videoLesson', 'Video lesson rate'), value: perProductRates.videoLesson, setter: (v:number)=>setPerProductRates(p=>({...p, videoLesson:v})), icon: <Video size={14} className="text-gray-600" /> },
                                  ].map((cfg) => (
                                    <div key={cfg.key}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-700 flex items-center gap-1">
                                          {cfg.icon}
                                          {cfg.label}: <span className="font-semibold">{cfg.value}{t('modals.folderSettings.hours', 'h')}</span>
                                        </span>
                                      </div>
                                      <input type="range" min={tier.hoursRange.min} max={tier.hoursRange.max} value={cfg.value} onChange={(e)=>cfg.setter(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" />
                                    </div>
                                  ))}
                                </div>

                                {/* Completion Time Fields */}
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('modals.completionTimes.title', 'Completion Times')}</h4>
                                  {[
                                    { key: 'presentation', label: t('modals.completionTimes.presentation', 'Presentation time'), value: perProductCompletionTimes.presentation, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, presentation:v})), icon: <BookText size={14} className="text-gray-600" /> },
                                    { key: 'onePager', label: t('modals.completionTimes.onePager', 'One‑pager time'), value: perProductCompletionTimes.onePager, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, onePager:v})), icon: <FileText size={14} className="text-gray-600" /> },
                                    { key: 'quiz', label: t('modals.completionTimes.quiz', 'Quiz time'), value: perProductCompletionTimes.quiz, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, quiz:v})), icon: <HelpCircle size={14} className="text-gray-600" /> },
                                    { key: 'videoLesson', label: t('modals.completionTimes.videoLesson', 'Video lesson time'), value: perProductCompletionTimes.videoLesson, setter: (v:number)=>setPerProductCompletionTimes(p=>({...p, videoLesson:v})), icon: <Video size={14} className="text-gray-600" /> },
                                  ].map((cfg) => (
                                    <div key={cfg.key} className="flex items-center justify-between">
                                      <span className="text-xs text-gray-700 flex items-center gap-1">
                                        {cfg.icon}
                                        {cfg.label}:
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="number" 
                                          min="1" 
                                          max="60" 
                                          value={cfg.value} 
                                          onChange={(e)=>cfg.setter(parseInt(e.target.value) || 1)} 
                                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" 
                                        />
                                        <span className="text-xs text-gray-600">minutes</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Rate Information */}
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><span className="font-medium">{t('modals.folderSettings.example', 'Example')}:</span> 1{t('modals.folderSettings.hours', 'h')} = {customRate}{t('modals.folderSettings.hours', 'h')}</p>
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
};

export default ProjectSettingsModal; 