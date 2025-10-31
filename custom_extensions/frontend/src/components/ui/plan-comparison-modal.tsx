"use client";

import React from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { X, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlanComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Trigger animation when modal opens
  React.useEffect(() => {
    if (open) {
      setIsAnimating(true);
    }
  }, [open]);

  const plans = [
    { id: 'starter', name: 'Free', popular: false },
    { id: 'creator', name: 'Creator', label: '1+', popular: false },
    { id: 'team', name: 'Team', label: '2+', popular: true },
    { id: 'enterprise', name: 'Enterprise', label: 'Custom', popular: false },
  ];

  interface Feature {
    name: string;
    starter: string | boolean;
    creator: string | boolean;
    team: string | boolean;
    enterprise: string | boolean;
  }

  interface FeatureCategory {
    category: string;
    features: Feature[];
  }

  const featureData: FeatureCategory[] = [
    {
      category: 'Stock Music',
      features: [
        { name: 'Stock Music', starter: true, creator: true, team: true, enterprise: true },
      ]
    },
    {
      category: 'Workspace & Collaboration',
      features: [
        { name: 'User seats', starter: '1', creator: '1+', team: '2+', enterprise: 'Custom' },
        { name: 'Comments', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Draft collaboration', starter: false, creator: true, team: true, enterprise: true },
      ]
    },
    {
      category: 'Features',
      features: [
        { name: '75+ Languages', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Standard Voices (300+)', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Premium Voices (100+)', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Transitions', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Animations', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Share Video', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Import PPT & PDF', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Voiceover Upload', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Auto Captions/Subtitles', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Public API', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Automatic Translation', starter: false, creator: false, team: true, enterprise: true },
        { name: 'URL-to-Video', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Custom Fonts Upload', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Custom Music Upload', starter: false, creator: false, team: true, enterprise: true },
        { name: 'SCORM Export', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Brand Kit', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Voice Clone', starter: false, creator: false, team: '10', enterprise: 'Custom' },
        { name: 'Watermark removal', starter: false, creator: false, team: true, enterprise: true },
      ]
    },
    {
      category: 'Support & Resources',
      features: [
        { name: 'Live chat support', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Priority support', starter: false, creator: false, team: true, enterprise: true },
        { name: 'Customer Success Manager', starter: false, creator: false, team: false, enterprise: true },
      ]
    }
  ];

  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-blue-600 mx-auto" />
      ) : (
        <span className="text-gray-300 mx-auto">-</span>
      );
    }
    return <span className="text-sm text-[#171718] font-medium">{value}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className={`bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} />
      <DialogContent className={`sm:max-w-[95vw] max-w-[95vw] rounded-2xl p-0 max-h-[95vh] bg-white overflow-hidden transition-all duration-300 ${
        isAnimating 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-4'
      }`} hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[95vh]">
          <h2 className="text-3xl font-bold text-[#171718] mb-8 text-center">
            Feature Comparison
          </h2>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-bold text-[#171718] border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className={`p-4 text-center font-bold text-[#171718] border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 ${
                        plan.popular ? 'border-l-4 border-r-4 border-t-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {plan.label && (
                          <span className="text-lg font-bold">{plan.label}</span>
                        )}
                        {!plan.label && (
                          <span className="text-lg font-bold">{plan.name}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureData.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    {/* Category Header Row */}
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 font-bold text-[#171718] bg-gray-50 border-y border-gray-200"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {/* Feature Rows */}
                    {category.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 text-sm text-[#4D4D4D]">{feature.name}</td>
                        <td className={`p-4 text-center`}>
                          {renderCell(feature.starter)}
                        </td>
                        <td className={`p-4 text-center`}>
                          {renderCell(feature.creator)}
                        </td>
                        <td className={`p-4 text-center border-l-4 border-r-4 border-blue-500 bg-blue-50/30`}>
                          {renderCell(feature.team)}
                        </td>
                        <td className={`p-4 text-center`}>
                          {renderCell(feature.enterprise)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanComparisonModal;

