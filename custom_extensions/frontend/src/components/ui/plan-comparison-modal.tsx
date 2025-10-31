"use client";

import React from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { X, Check, Star, InfoIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlanComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('yearly');

  // Trigger animation when modal opens
  React.useEffect(() => {
    if (open) {
      setIsAnimating(true);
    }
  }, [open]);

  const planCards = [
    {
      id: 'starter',
      name: 'Free',
      price: '$0',
      billing: 'No commitment',
      credits: '200 Credits /one-time on registration',
      popular: false,
      current: true,
    },
    {
      id: 'creator',
      name: 'Creator',
      price: '$25',
      priceUnit: '/month',
      billing: '$300 Billed annually',
      credits: '600 Credits /month',
      popular: false,
      current: false,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$37',
      priceUnit: '/seat/month',
      billing: 'Minimum 2 seats, $888 Billed annually',
      credits: '2000 Credits /month',
      popular: true,
      current: false,
      hasSeats: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: "Let's talk",
      billing: 'Custom plans',
      credits: '10,000+ Credits /month',
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
        <Check className="w-5 h-5 text-blue-600 mx-auto" />
      ) : (
        <span className="text-gray-300 mx-auto text-xl">-</span>
      );
    }
    return <span className="text-sm text-[#171718] font-medium">{value}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className={`bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} />
      <DialogContent className={`sm:max-w-[95vw] max-w-[95vw] rounded-2xl p-0 max-h-[90vh] bg-white overflow-hidden transition-all duration-300 my-auto ${
        isAnimating 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-4'
      }`} hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-7 h-7 xl:w-8 xl:h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header Section */}
          <div className="p-8 pb-6 bg-white sticky top-0 z-10">
            <h2 className="text-3xl font-bold text-[#171718] mb-2 text-center">
              Plans that fit your scale
            </h2>
            <p className="text-center text-blue-600 text-sm mb-4">
              Save 15% on yearly plan!
            </p>
            
            {/* Billing Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-full border border-gray-200 p-1 bg-gray-50">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {planCards.map((plan) => (
                <div key={plan.id} className="relative">
                  {/* Most Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                      Most Popular
                      <Sparkles className="w-3 h-3 fill-white" />
                    </div>
                  )}

                  {/* Plan Card */}
                  <div className={`rounded-xl border overflow-hidden bg-white ${
                    plan.popular ? 'border-blue-500' : 'border-gray-200'
                  }`}>
                    {/* Card Header - Blue bg for popular plan */}
                    {plan.popular ? (
                      <div className="bg-blue-600 text-white p-4">
                        <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                        <div className="text-2xl font-bold mb-1">
                          {plan.price}
                          {plan.priceUnit && <span className="text-sm font-normal">{plan.priceUnit}</span>}
                        </div>
                        {plan.hasSeats && (
                          <div className="flex items-center gap-2 mb-2">
                            <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white">-</button>
                            <span className="px-3 py-1 bg-white/20 rounded text-sm">2 seats</span>
                            <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white">+</button>
                          </div>
                        )}
                        <p className="text-xs opacity-90">{plan.billing}</p>
                      </div>
                    ) : (
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-[#171718] mb-2">{plan.name}</h3>
                        <div className="text-2xl font-bold text-[#171718] mb-1">
                          {plan.price}
                          {plan.priceUnit && <span className="text-sm font-normal">{plan.priceUnit}</span>}
                        </div>
                        <p className="text-xs text-gray-500">{plan.billing}</p>
                      </div>
                    )}

                    {/* Card Body */}
                    <div className="p-4 pt-3">
                      <div className={`flex items-center gap-1 text-xs mb-3 ${plan.popular ? 'text-white' : 'text-gray-600'}`}>
                        <span className={plan.popular ? 'text-white' : 'text-[#171718]'}>{plan.credits}</span>
                        <InfoIcon className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-gray-400'}`} />
                      </div>

                      {/* CTA Button */}
                      <button
                        className={`w-full py-2 rounded-full text-sm font-semibold transition-all ${
                          plan.current
                            ? 'bg-gray-200 text-gray-500'
                            : plan.isEnterprise
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {plan.current ? 'Current' : plan.isEnterprise ? 'Contact Sales' : 'Upgrade'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="px-8 pb-8">
            <table className="w-full border-collapse">
              <tbody>
                {featureData.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    {/* Category Header Row */}
                    <tr>
                      <td
                        colSpan={5}
                        className={`p-4 font-bold text-[#171718] border-y border-gray-200 ${
                          categoryIndex === 0 ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        {category.category}
                      </td>
                    </tr>
                    {/* Feature Rows */}
                    {category.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} className="border-b border-gray-100">
                        <td className="p-4 text-sm text-[#4D4D4D] w-1/3">{feature.name}</td>
                        <td className="p-4 text-center w-1/6 bg-white">
                          {renderCell(feature.starter)}
                        </td>
                        <td className="p-4 text-center w-1/6 bg-gray-50">
                          {renderCell(feature.creator)}
                        </td>
                        <td className="p-4 text-center w-1/6 bg-white">
                          {renderCell(feature.team)}
                        </td>
                        <td className="p-4 text-center w-1/6 bg-gray-50">
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
