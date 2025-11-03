"use client";

import React from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { X, Check, Star, InfoIcon, Sparkles, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ContactSalesModal from './contact-sales-modal';

interface PlanComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlanFeatureItem {
  type: 'feature' | 'categoryHeader';
  value?: string | boolean;
  categoryName?: string;
}

const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('yearly');
  const [teamSeats, setTeamSeats] = React.useState(2);
  const [isContactSalesOpen, setIsContactSalesOpen] = React.useState(false);

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
    },
    {
      category: 'Media',
      features: [
        { name: '720p HD Videos', starter: true, creator: true, team: true, enterprise: true },
        { name: '1080p Full HD Videos', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Video Translation', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Translation processing speed', starter: true, creator: true, team: true, enterprise: true },
        { name: 'Translation - Global Language Suite', starter: true, creator: true, team: true, enterprise: true },
      ]
    }
  ];

  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-blue-600" />
      ) : (
        <span className="text-[#4D4D4D] text-lg">-</span>
      );
    }
    return <span className="text-sm text-[#171718] font-medium">{value}</span>;
  };

  const getPlanFeatures = (planId: string): PlanFeatureItem[] => {
    const allFeatures: PlanFeatureItem[] = [];
    featureData.forEach((category) => {
      // Add category header placeholder
      allFeatures.push({ 
        type: 'categoryHeader', 
        categoryName: category.category 
      });
      
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
        allFeatures.push({ type: 'feature', value });
      });
    });
    return allFeatures;
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[1550px] max-w-[1650px] xl:max-w-[1650px] xl:w-[98vw] w-[95vw] rounded-2xl p-0 max-h-[90vh] min-w-[980px] bg-white/80 backdrop-blur-sm overflow-hidden" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-7 h-7 xl:w-8 xl:h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 10px;
              border-radius: 50px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 5px;
              margin: 10px 0;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #A5A5A5;
              border-radius: 5px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background:rgb(135, 135, 135);
            }

            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #A5A5A5 #f1f5f9;
              scroll-behavior: smooth;
              border-radius: 50px;
            }
          `}</style>
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
          <div className="px-8 pb-8 relative">
            <div className="grid gap-4 items-start relative z-[15]" style={{ gridTemplateColumns: '250px repeat(4, minmax(0, 1fr))' }}>
              {/* Empty space for feature labels column */}
              <div></div>
              
              {/* Plan Cards */}
              {planCards.map((plan) => {
                const features = getPlanFeatures(plan.id);
                return (
                  <div key={plan.id} className="relative h-full min-w-0">
                    {/* Most Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-5 left-0 right-0 z-20 bg-blue-600 text-white py-1.5 rounded-t-xl text-xs font-medium flex items-center justify-center gap-1">
                        Most Popular
                        <Sparkles className="w-3 h-3 fill-white" />
                      </div>
                    )}

                    {/* Plan Card */}
                    <div className={`h-full flex flex-col w-full ${
                      plan.popular ? 'border-2 border-blue-500 rounded-b-xl shadow-lg' : 'border border-gray-200 rounded-xl shadow-md'
                    } !bg-white/80 !backdrop-blur-sm overflow-hidden`}>
                      {/* Card Content */}
                      <div className="py-6 px-3 pb-4">
                        <h3 className="text-xl font-bold text-[#171718] mb-3">{plan.name}</h3>
                        
                        {/* Price and Seats */}
                        <div className="mb-2 min-h-[25px]">
                          <div className="flex flex-nowrap items-center gap-2 mb-1">
                            <div className="flex items-baseline gap-1 flex-shrink-0">
                              <span className="text-3xl font-bold text-[#171718] whitespace-nowrap">{plan.price}</span>
                              {plan.priceUnit && <span className="text-xs font-normal text-gray-500 whitespace-nowrap">{plan.priceUnit}</span>}
                            </div>
                            
                            {plan.hasSeats && (
                              <div className="flex items-center gap-0 flex-shrink-0 border border-[#E0E0E0] rounded-md">
                                <button 
                                  onClick={() => setTeamSeats(Math.max(2, teamSeats - 1))}
                                  className="w-6 h-6 border-r border-[#E0E0E0] rounded-l-md flex items-center justify-center hover:bg-gray-50 flex-shrink-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 py-1 bg-white text-[#4D4D4D] text-xs font-medium whitespace-nowrap">{teamSeats} seats</span>
                                <button 
                                  onClick={() => setTeamSeats(teamSeats + 1)}
                                  className="w-6 h-6 border-l border-[#E0E0E0] rounded-r-md flex items-center justify-center hover:bg-gray-50 flex-shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-[#A5A5A5] mb-3 min-h-[40px]">{plan.billing}</p>
                        
                        <div className="flex items-center gap-2 mb-4 min-h-[47px]">
                          <div className="flex-1">
                            <span className="text-base font-bold text-[#4D4D4D]">{plan.credits}</span>
                            <span className="text-xs text-[#A5A5A5]"> / {plan.perCredits}</span>
                          </div>
                          <InfoIcon className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={() => {
                            if (plan.isEnterprise) {
                              onOpenChange(false);
                              setIsContactSalesOpen(true);
                            }
                          }}
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
                        <div className="pt-3">
                          {features.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center text-xs justify-center px-8 border-b border-[#A5A5A5] last:border-b-0 first:border-t-0 text-[#4D4D4D] ${
                                item.type === 'categoryHeader' ? 'h-[48px]' : 'h-[48px]'
                              }`}
                            >
                              {item.type === 'categoryHeader' ? (
                                <div className="h-full w-full"></div>
                              ) : (
                                renderCell(item.value!)
                              )}
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
            <div className="relative -mt-[790px] pointer-events-none z-0">
              {featureData.map((category, categoryIndex) => {
                const categoryHeight = 48 + category.features.length * 48; // Header (48px) + features
                return (
                  <div key={categoryIndex} className="relative group">
                    {/* Blue Background for This Category Only - Shows on Hover */}
                    <div 
                      className="absolute left-[-32px] right-[-32px] top-0 bg-transparent group-hover:bg-blue-100 transition-colors duration-200 z-[5]" 
                      style={{ height: `${categoryHeight}px` }}
                    ></div>
                    
                    <div className="grid gap-4 relative z-10" style={{ gridTemplateColumns: '250px repeat(4, minmax(0, 1fr))' }}>
                      <div className="pr-4 pointer-events-auto cursor-pointer">
                        {/* Category Header */}
                        <div className="h-[48px]">
                          <h4 className="text-base py-2 font-bold text-[#171718]">{category.category}</h4>
                        </div>
                        
                        {/* Feature Names */}
                        {category.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center h-[48px] border-b border-[#A5A5A5]">
                            <span className="text-xs text-[#4D4D4D] font-regular">{feature.name}</span>
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
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Contact Sales Modal */}
    <ContactSalesModal 
      open={isContactSalesOpen} 
      onOpenChange={setIsContactSalesOpen}
    />
  </>
  );
};

export default PlanComparisonModal;
