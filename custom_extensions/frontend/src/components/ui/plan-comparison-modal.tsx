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
      billing: `Minimum 2 seats, $${teamSeats * 37 * 12} Billed annually`,
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
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[95vw] max-w-[95vw] rounded-2xl p-0 max-h-[90vh] bg-white overflow-hidden" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-7 h-7 xl:w-8 xl:h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header Section - Sticky */}
          <div className="top-0 z-10 bg-white border-b border-gray-200 p-8 pb-6">
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

            {/* Plan Cards - Grid with aligned columns matching table below */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
              {/* Empty first column to align with feature names column */}
              <div className="col-span-1"></div>
              
              {planCards.map((plan) => (
                <div key={plan.id} className="relative col-span-1">
                  {/* Most Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-6 left-0 right-0 z-10 bg-blue-600 text-white py-1.5 rounded-t-md text-xs font-medium flex items-center justify-center gap-1 shadow-md">
                      Most Popular
                      <Sparkles className="w-3 h-3 fill-white" />
                    </div>
                  )}

                  {/* Plan Card */}
                  <div className={`border-t border-l border-r bg-white ${
                    plan.popular ? 'border-blue-500' : 'border-gray-200 rounded-t-2xl'
                  } overflow-hidden shadow-sm`}>
                    {/* Card Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-[#171718] mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-[#171718] mb-1">
                        {plan.price}
                        {plan.priceUnit && <span className="text-sm font-normal text-gray-500">{plan.priceUnit}</span>}
                      </div>
                      
                      {plan.hasSeats && (
                        <div className="flex items-center gap-2 mb-2">
                          <button 
                            onClick={() => setTeamSeats(Math.max(2, teamSeats - 1))}
                            className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-1 bg-gray-100 rounded text-sm">{teamSeats} seats</span>
                          <button 
                            onClick={() => setTeamSeats(teamSeats + 1)}
                            className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mb-3">{plan.billing}</p>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
                        <span>{plan.credits}</span>
                        <InfoIcon className="w-3 h-3 text-gray-400" />
                      </div>

                      {/* CTA Button */}
                      <button
                        className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all ${
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

          {/* Feature Comparison Table */}
          <div className="p-8 pt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {featureData.map((category, categoryIndex) => (
                    <React.Fragment key={categoryIndex}>
                      {/* Category Header Row */}
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 font-bold text-[#171718] bg-gray-50 border-y border-gray-200 text-left"
                        >
                          {category.category}
                        </td>
                      </tr>
                      {/* Feature Rows */}
                      {category.features.map((feature, featureIndex) => (
                        <tr key={featureIndex} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 text-sm text-[#4D4D4D] font-medium" style={{ width: '20%' }}>{feature.name}</td>
                          <td className="p-4 text-center" style={{ width: '20%' }}>
                            {renderCell(feature.starter)}
                          </td>
                          <td className="p-4 text-center" style={{ width: '20%' }}>
                            {renderCell(feature.creator)}
                          </td>
                          <td className="p-4 text-center" style={{ width: '20%' }}>
                            {renderCell(feature.team)}
                          </td>
                          <td className="p-4 text-center" style={{ width: '20%' }}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanComparisonModal;
