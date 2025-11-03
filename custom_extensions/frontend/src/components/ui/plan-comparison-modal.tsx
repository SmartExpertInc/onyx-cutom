"use client";

import React from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { X, Check, Star, InfoIcon, Sparkles, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlanComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('yearly');
  const [teamSeats, setTeamSeats] = React.useState(2);

  const planCards = [
    {
      id: 'starter',
      name: 'Free',
      price: '$0',
      billing: 'No commitment',
      credits: '200 Credits',
      perCredits: 'one-time on registration',
      popular: false,
      current: true,
    },
    {
      id: 'creator',
      name: 'Creator',
      price: '$25',
      priceUnit: '/month',
      billing: '$300 Billed annually',
      credits: '600 Credits',
      perCredits: 'month',
      popular: false,
      current: false,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$37',
      priceUnit: '/seat/month',
      billing: `Minimum 2 seats, $${teamSeats * 37 * 12} Billed annually`,
      credits: '2000 Credits',
      perCredits: 'month',
      popular: true,
      current: false,
      hasSeats: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: "Let's talk",
      billing: 'Custom plans',
      credits: '10,000+ Credits',
      perCredits: 'month',
      popular: false,
      current: false,
      isEnterprise: true,
    },
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
      category: 'Limits',
      features: [
        { name: 'SmartDrive', starter: '500 MB', creator: '10 GB', team: '50 GB', enterprise: '200 GB+' },
        { name: 'Avatars', starter: '10', creator: '20', team: 'All', enterprise: 'All' },
        { name: 'Number of slides (presentations/videos)', starter: 'Max 20', creator: '20+', team: '20+', enterprise: '20+' },
      ]
    },
    {
      category: 'Video Creation',
      features: [
        { name: '720p HD Videos', starter: true, creator: true, team: true, enterprise: true },
        { name: '1080p Full HD Videos', starter: false, creator: true, team: true, enterprise: true },
        { name: 'Video Translation', starter: false, creator: true, team: true, enterprise: true },
        { name: 'Translation processing speed', starter: false, creator: true, team: true, enterprise: true },
        { name: 'Translation - Global Language Suite', starter: false, creator: 'All', team: 'All', enterprise: 'All' },
      ]
    }
  ];

  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-blue-600" />
      ) : (
        <span className="text-gray-300 text-xl">-</span>
      );
    }
    return <span className="text-sm text-[#171718] font-medium">{value}</span>;
  };

  const getPlanFeatures = (planId: string) => {
    const allFeatures: { value: string | boolean }[] = [];
    featureData.forEach((category) => {
      category.features.forEach((feature) => {
        let value;
        switch (planId) {
          case 'starter':
            value = feature.starter;
            break;
          case 'creator':
            value = feature.creator;
            break;
          case 'team':
            value = feature.team;
            break;
          case 'enterprise':
            value = feature.enterprise;
            break;
          default:
            value = false;
        }
        allFeatures.push({ value });
      });
    });
    return allFeatures;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[95vw] max-w-[95vw] rounded-2xl p-0 max-h-[90vh] bg-white/80 backdrop-blur-sm overflow-hidden" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-7 h-7 xl:w-8 xl:h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header Section - Sticky */}
          <div className="top-0 z-10 bg-none p-8 pb-0">
            <h2 className="text-xl font-bold text-[#4D4D4D] mb-2 text-center sora-font">
              Plans that fit your scale
            </h2>
            <p className="text-center text-blue-600 text-sm mb-4">
              <span className="font-bold">Save 15%</span> on yearly plan!
            </p>
            
            {/* Billing Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-full border border-gray-200 p-1 bg-gray-50">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#A5A5A5]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#A5A5A5]'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

          </div>

          {/* Plan Cards with Features Inside and Labels on Left */}
          <div className="px-8 pb-8">
            <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '250px repeat(4, 1fr)' }}>
              {/* Empty space for feature labels column */}
              <div></div>
              
              {/* Plan Cards */}
              {planCards.map((plan) => {
                const features = getPlanFeatures(plan.id);
                return (
                  <div key={plan.id} className="relative h-full">
                    {/* Most Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-0 right-0 z-10 bg-blue-600 text-white py-1.5 rounded-t-xl text-xs font-medium flex items-center justify-center gap-1">
                        Most Popular
                        <Sparkles className="w-3 h-3 fill-white" />
                      </div>
                    )}

                    {/* Plan Card */}
                    <div className={`h-full flex flex-col ${
                      plan.popular ? 'border-2 border-blue-500 rounded-xl shadow-lg' : 'border border-gray-200 rounded-xl shadow-md'
                    } bg-white overflow-hidden`}>
                      {/* Card Content */}
                      <div className="p-6 pb-4">
                        <h3 className="text-xl font-bold text-[#171718] mb-3">{plan.name}</h3>
                        
                        {/* Price and Seats */}
                        <div className="mb-2 min-h-[60px]">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-[#171718]">{plan.price}</span>
                              {plan.priceUnit && <span className="text-sm font-normal text-gray-500">{plan.priceUnit}</span>}
                            </div>
                            
                            {plan.hasSeats && (
                              <div className="flex items-center gap-0">
                                <button 
                                  onClick={() => setTeamSeats(Math.max(2, teamSeats - 1))}
                                  className="w-6 h-6 border border-[#E0E0E0] rounded-l-md flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 py-1 bg-white border border-[#E0E0E0] text-[#4D4D4D] text-xs font-medium">{teamSeats} seats</span>
                                <button 
                                  onClick={() => setTeamSeats(teamSeats + 1)}
                                  className="w-6 h-6 border border-[#E0E0E0] rounded-r-md flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-[#A5A5A5] mb-3 min-h-[20px]">{plan.billing}</p>
                        
                        <div className="flex items-center gap-2 mb-4 min-h-[32px]">
                          <div className="flex-1">
                            <span className="text-base font-bold text-[#4D4D4D]">{plan.credits}</span>
                            <span className="text-xs text-[#A5A5A5]"> / {plan.perCredits}</span>
                          </div>
                          <InfoIcon className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* CTA Button */}
                        <button
                          className={`w-full py-3 rounded-full text-sm font-semibold transition-all mb-4 ${
                            plan.current
                              ? 'bg-gray-200 text-gray-500'
                              : plan.isEnterprise
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {plan.current ? 'Current' : plan.isEnterprise ? 'Contact Sales' : 'Upgrade'}
                        </button>

                        {/* Feature List Inside Card */}
                        <div className="border-t border-gray-200 pt-4">
                          {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-center h-[48px] border-b border-gray-100 last:border-b-0">
                              {renderCell(feature.value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Labels Positioned on Left - Aligned with Card Features */}
            <div className="relative -mt-[452px] pointer-events-none">
              <div className="grid gap-4" style={{ gridTemplateColumns: '250px repeat(4, 1fr)' }}>
                <div className="pr-4 pointer-events-auto">
                  {featureData.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      {/* Category Header */}
                      <div className="py-3 mb-3 border-b-2 border-gray-200">
                        <h4 className="text-base font-bold text-[#171718]">{category.category}</h4>
                      </div>
                      
                      {/* Feature Names */}
                      {category.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center h-[48px] border-b border-gray-100">
                          <span className="text-sm text-[#4D4D4D] font-medium">{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* Empty columns to maintain grid structure */}
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanComparisonModal;
