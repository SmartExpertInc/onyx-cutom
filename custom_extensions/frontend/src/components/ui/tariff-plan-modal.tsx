"use client";

import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Star, Users, Database, Zap, Shield, Clock, CreditCard, ArrowLeft, Coins, X, Server, ShieldUser, MessagesSquare, Workflow, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

const CoinsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="27" height="27" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
  <mask id="mask0_600_36680" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
  <path d="M0.125 0.125002H24.875V24.875H0.125V0.125002Z" fill="white"/>
  </mask>
  <g mask="url(#mask0_600_36680)">
  <path d="M23.6333 14.0775C24.0136 14.9767 24.224 15.9652 24.224 17.0028C24.224 21.1534 20.8592 24.5181 16.7087 24.5181C12.5581 24.5181 9.19336 21.1534 9.19336 17.0028C9.19336 12.8522 12.5581 9.48752 16.7087 9.48752C19.2187 9.48752 21.4414 10.7181 22.8063 12.6088" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M22.4712 16.9973C22.4712 20.1801 19.8911 22.7603 16.7083 22.7603C13.5255 22.7603 10.9453 20.1801 10.9453 16.9973C10.9453 13.8145 13.5255 11.2344 16.7083 11.2344C19.8911 11.2344 22.4712 13.8145 22.4712 16.9973Z" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.6133 16.3238V14.288C15.6133 14.0153 15.8342 13.7944 16.1068 13.7944H17.3105C17.5831 13.7944 17.8041 14.0153 17.8041 14.288V19.7101C17.8041 19.9827 17.5831 20.2036 17.3105 20.2036H16.1068C15.8342 20.2036 15.6133 19.9827 15.6133 19.7101V18.0157" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.24219 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.73438 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.23047 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.7207 22.9871V24.5181" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M5.74414 19.9784V21.5093" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.23828 19.9784V21.5093" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3.33984 16.9754V18.5063" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M5.83203 16.9754V18.5063" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.32617 16.9754V18.5063" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.24219 13.9725V15.5034" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.73438 13.9725V15.5034" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.23047 13.9725V15.5034" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.84375 10.9735V12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M7.33594 10.9735V12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.83008 10.9735V12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16.4774 9.49658H1.91264C1.784 9.49658 1.67969 9.39231 1.67969 9.26373V6.72608C1.67969 6.5974 1.784 6.49313 1.91264 6.49313H16.4774C16.606 6.49313 16.7103 6.5974 16.7103 6.72608V9.26373C16.7103 9.39231 16.606 9.49658 16.4774 9.49658Z" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.24219 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.73438 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.23047 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.7207 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M14.2148 7.96571V9.49658" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.8739 6.49756H1.30912C1.18049 6.49756 1.07617 6.39329 1.07617 6.26466V3.72701C1.07617 3.59833 1.18049 3.49411 1.30912 3.49411H15.8739C16.0025 3.49411 16.1067 3.59833 16.1067 3.72701V6.26466C16.1067 6.39329 16.0025 6.49756 15.8739 6.49756Z" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3.63867 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.13477 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.625 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.1211 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13.6152 4.96664V6.49756" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.53405 0.491178H18.2781C18.4067 0.491178 18.5111 0.595447 18.5111 0.724079V3.26173C18.5111 3.39036 18.4067 3.49463 18.2781 3.49463H3.71337C3.58474 3.49463 3.48047 3.39036 3.48047 3.26173V0.724079C3.48047 0.595447 3.58474 0.491178 3.71337 0.491178H4.84215" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6.04688 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.53711 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M11.0312 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M13.5273 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16.0176 1.96375V3.49463" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3.41064 18.5058C3.282 18.5058 3.17773 18.6101 3.17773 18.7387V21.2764C3.17773 21.4051 3.282 21.5093 3.41064 21.5093" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M2.5122 9.50094C2.38357 9.50094 2.2793 9.60516 2.2793 9.7338V12.2714C2.2793 12.4001 2.38357 12.5044 2.5122 12.5044" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M10.6888 12.5H1.91259C1.78396 12.5 1.67969 12.6042 1.67969 12.7329V15.2705C1.67969 15.3991 1.78396 15.5034 1.91259 15.5034H9.34353" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9.34287 15.5028H1.01029C0.881613 15.5028 0.777344 15.6072 0.777344 15.7358V18.2734C0.777344 18.4021 0.881613 18.5063 1.01029 18.5063H9.34573" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M10.6995 21.5146H1.91259C1.78396 21.5146 1.67969 21.6189 1.67969 21.7475V24.2851C1.67969 24.4138 1.78396 24.5181 1.91259 24.5181H16.4773" stroke="#0F58F9" strokeWidth="0.703124" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
  </svg>
);

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  credits: string;
  connectors: string;
  support: string;
  lmsExport: string;
  slides: string;
  storage: string;
  collaboration: string;
  popular?: boolean;
  features: string[];
}

interface TariffPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TariffPlanModal: React.FC<TariffPlanModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<'starter' | 'pro' | 'business' | 'enterprise'>('starter');
  const [lastLoadedPlanId, setLastLoadedPlanId] = useState<'starter' | 'pro' | 'business' | 'enterprise'>('starter');
  const [modalHeight, setModalHeight] = useState(0);
  const [teamSeats, setTeamSeats] = useState(2);
  const [creditQuantities, setCreditQuantities] = useState<Record<string, number>>({
    small: 1,
    medium: 1,
    large: 1,
    enterprise: 1
  });
  const modalRef = React.useRef<HTMLDivElement>(null);
  const mapPlan = (planRaw?: string): 'starter' | 'pro' | 'business' | 'enterprise' => {
    const p = (planRaw || 'starter').toLowerCase();
    if (p.includes('business')) return 'business';
    if (p.includes('pro')) return 'pro';
    if (p.includes('enterprise')) return 'enterprise';
    return 'starter';
  };

  useEffect(() => {
    if (modalRef.current) {
      const height = modalRef.current.offsetHeight;
      setModalHeight(height);
    }
  }, [open, billingCycle]);

  useEffect(() => {
    const loadCurrentPlan = async () => {
      try {
        const res = await fetch('/api/custom-projects-backend/billing/me', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        const mapped = mapPlan(data?.plan);
        setLastLoadedPlanId(mapped);
        setCurrentPlanId(prev => (prev !== mapped ? mapped : prev));
      } catch {}
    };
    if (open) loadCurrentPlan();
  }, [open]);

  // Utility after returning from Stripe to force-refresh once (no flicker elsewhere)
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (params.has('session_id')) {
      (async () => {
        try {
          const res = await fetch('/api/custom-projects-backend/billing/me?refresh=1', { credentials: 'same-origin' });
          if (res.ok) {
            const data = await res.json();
            const mapped = mapPlan(data?.plan);
            setLastLoadedPlanId(mapped);
            setCurrentPlanId(mapped);
          }
        } catch {}
      })();
    }
  }, []);

  const creditAddOns = [
    {
      id: 'small',
      name: t('addOns.packages.credits.small.name', 'Small'),
      description: t('addOns.packages.credits.small.description', 'Perfect for individual users getting started with basic credit needs.'),
      amount: t('addOns.packages.credits.small.amount', '100 credits'),
      price: 20,
      priceNote: 'per month',
    },
    {
      id: 'medium',
      name: t('addOns.packages.credits.medium.name', 'Medium'),
      description: t('addOns.packages.credits.medium.description', 'Great for growing teams with moderate usage requirements.'),
      amount: t('addOns.packages.credits.medium.amount', '300 credits'),
      price: 50,
      priceNote: 'per month',
    },
    {
      id: 'large',
      name: t('addOns.packages.credits.large.name', 'Large'),
      description: t('addOns.packages.credits.large.description', 'Ideal for businesses with high-volume processing demands.'),
      amount: t('addOns.packages.credits.large.amount', '1,000 credits'),
      price: 150,
      priceNote: 'per month',
    },
    {
      id: 'enterprise',
      name: t('addOns.packages.credits.enterprise.name', 'Enterprise'),
      description: t('addOns.packages.credits.enterprise.description', 'Custom solutions tailored to your organization\'s specific needs.'),
      amount: t('addOns.packages.credits.enterprise.amount', 'Custom credit allocation'),
      price: 'Custom' as any,
      isEnterprise: true,
    },
  ];

  const plans: Plan[] = [
    {
      id: 'starter',
      name: t('tariffPlan.plans.starter.name', 'Starter (Free)'),
      price: 0,
      credits: t('tariffPlan.plans.starter.credits', '200 (one-time on registration)'),
      support: t('tariffPlan.plans.starter.support', 'Email up to 48 hours'),
      storage: t('tariffPlan.plans.starter.storage', '1 GB'),
      connectors: '-',
      collaboration: '-',
      lmsExport: t('tariffPlan.plans.starter.lmsExport', 'Only SmartExpert'),
      slides: t('tariffPlan.plans.starter.slides', 'max 20'),
      features: [
        t('tariffPlan.plans.starter.features.0', '200 credits on registration'),
        t('tariffPlan.plans.starter.features.1', '1 GB storage'),
        t('tariffPlan.plans.starter.features.2', 'Basic email support'),
        t('tariffPlan.plans.starter.features.3', 'No connectors'),
        t('tariffPlan.plans.starter.features.4', 'No collaboration')
      ]
    },
    {
      id: 'pro',
      name: t('tariffPlan.plans.pro.name', 'Pro'),
      price: 30,
      yearlyPrice: 25,
      credits: t('tariffPlan.plans.pro.credits', '600 / month'),
      support: t('tariffPlan.plans.pro.support', 'Email up to 24 hours'),
      storage: t('tariffPlan.plans.pro.storage', '5 GB'),
      connectors: '2',
      collaboration: t('tariffPlan.plans.pro.collaboration', '1 (up to 3 participants)'),
      lmsExport: t('tariffPlan.plans.pro.lmsExport', 'Only SmartExpert'),
      slides: '20+',
      features: [
        t('tariffPlan.plans.pro.features.0', '600 credits per month'),
        t('tariffPlan.plans.pro.features.1', '5 GB storage'),
        t('tariffPlan.plans.pro.features.2', 'Priority email support (24h)'),
        t('tariffPlan.plans.pro.features.3', '2 platform connectors'),
        t('tariffPlan.plans.pro.features.4', 'Team collaboration (up to 3)')
      ]
    },
    {
      id: 'business',
      name: t('tariffPlan.plans.business.name', 'Business'),
      price: 90,
      yearlyPrice: 75,
      credits: t('tariffPlan.plans.business.credits', '2,000 / month'),
      support: t('tariffPlan.plans.business.support', 'Priority support'),
      storage: t('tariffPlan.plans.business.storage', '10 GB'),
      connectors: '5',
      collaboration: t('tariffPlan.plans.business.collaboration', '3 (up to 10 participants)'),
      lmsExport: t('tariffPlan.plans.business.lmsExport', 'Only SmartExpert'),
      slides: '20+',
      popular: true,
      features: [
        t('tariffPlan.plans.business.features.0', '2,000 credits per month'),
        t('tariffPlan.plans.business.features.1', '10 GB storage'),
        t('tariffPlan.plans.business.features.2', 'Priority support'),
        t('tariffPlan.plans.business.features.3', '5 platform connectors'),
        t('tariffPlan.plans.business.features.4', 'Team collaboration (up to 10)')
      ]
    },
    {
      id: 'enterprise',
      name: t('tariffPlan.plans.enterprise.name', 'Enterprise'),
      price: 0,
      credits: t('tariffPlan.plans.enterprise.credits', '10,000+ / month (flexible)'),
      support: t('tariffPlan.plans.enterprise.support', 'Dedicated manager'),
      storage: t('tariffPlan.plans.enterprise.storage', '50 GB + pay-as-you-go'),
      connectors: t('tariffPlan.plans.enterprise.connectors', 'All'),
      collaboration: t('tariffPlan.plans.enterprise.collaboration', 'Unlimited'),
      lmsExport: t('tariffPlan.plans.enterprise.lmsExport', 'SmartExpert + custom'),
      slides: '20+',
      features: [
        t('tariffPlan.plans.enterprise.features.0', 'Custom credit allocation'),
        t('tariffPlan.plans.enterprise.features.1', 'Unlimited storage'),
        t('tariffPlan.plans.enterprise.features.2', 'Dedicated account manager'),
        t('tariffPlan.plans.enterprise.features.3', 'All platform connectors'),
        t('tariffPlan.plans.enterprise.features.4', 'Unlimited team collaboration'),
        t('tariffPlan.plans.enterprise.features.5', 'Custom features & integrations')
      ]
    }
  ];

  const handlePurchasePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Successfully subscribed to ${selectedPlan?.name} plan!`);
      setShowPayment(false);
      setSelectedPlan(null);
    }, 2000);
  };

  const getPrice = (plan: Plan) => {
    if (plan.price === 0) return plan.name.includes('Enterprise') ? 'Custom' : '$0';
    if (billingCycle === 'yearly' && plan.yearlyPrice) {
      return `$${plan.yearlyPrice}`;
    }
    return `$${plan.price}`;
  };

  if (showPayment && selectedPlan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-[85vw] h-[80vh] overflow-y-auto p-0 bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <div className="min-h-full">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {t('tariffPlan.backToPlans', 'Back to plans')}
                </button>

                {/* Payment Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('tariffPlan.completeYourPurchase', 'Complete Your Purchase')}</h1>
                  <p className="text-xl text-gray-600">{t('tariffPlan.subscribeTo', 'Subscribe to')} {selectedPlan.name}</p>
                </div>

                {/* Plan Summary */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h3>
                      <p className="text-gray-600">
                        {billingCycle === 'monthly' ? t('tariffPlan.monthly', 'Monthly') : t('tariffPlan.yearly', 'Yearly')} {t('tariffPlan.subscription', 'subscription')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {getPrice(selectedPlan)}
                        {selectedPlan.price > 0 && (
                          <span className="text-xs text-[#0D001B] font-normal">
                            /{billingCycle === 'monthly' ? t('tariffPlan.month', 'month') : t('tariffPlan.year', 'year')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{t('tariffPlan.whatsIncluded', "What's included:")}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stripe Portal CTA */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('tariffPlan.checkoutInStripe', 'Checkout in Stripe')}</h3>
                  <p className="text-gray-600 mb-6">{t('tariffPlan.redirectToStripe', 'You will be redirected to Stripe to complete your purchase and manage billing.')}</p>
                  <button
                    disabled={portalLoading || selectedPlan.name.includes('Enterprise')}
                    onClick={async () => {
                      try {
                        setPortalLoading(true);
                        
                        // Map plan to Stripe price ID
                        const priceIdMap: Record<string, string> = {
                          'pro': billingCycle === 'yearly' ? 'price_1SEBUCH2U2KQUmUhkym5Q9TS' : 'price_1SEBM4H2U2KQUmUhkn6A7Hlm',
                          'business': billingCycle === 'yearly' ? 'price_1SEBUoH2U2KQUmUhMktbhCsm' : 'price_1SEBTeH2U2KQUmUhi02e1uC9'
                        };
                        
                        const priceId = priceIdMap[selectedPlan.id];
                        if (!priceId) {
                          throw new Error('Price ID not configured for this plan');
                        }
                        
                        const res = await fetch('/api/custom-projects-backend/billing/checkout', { 
                          method: 'POST', 
                          credentials: 'same-origin',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            priceId: priceId,
                            planName: selectedPlan.name 
                          })
                        });
                        if (!res.ok) throw new Error('Failed to create checkout session');
                        const data = await res.json();
                        if (data?.url) window.location.href = data.url;
                      } catch (e) {
                        console.error(e);
                        alert('Failed to start checkout. Please try again.');
                      } finally {
                        setPortalLoading(false);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                      portalLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : selectedPlan.name.includes('Enterprise')
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-2xl'
                    }`}
                  >
                    {portalLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        {t('tariffPlan.openingStripe', 'Opening Stripe...')}
                      </>
                    ) : (
                      <>
                        {t('tariffPlan.continueInStripe', 'Continue in Stripe')}
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[1180px] max-w-[1080px] xl:max-w-[1280px] xl:w-[90vw] w-[85vw] rounded-2xl p-0 max-h-[93vh] min-w-[830px] bg-white" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-7 h-7 xl:w-8 xl:h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 xl:w-6 xl:h-6 text-[#71717A]" />
        </button>
        
        <ScrollArea className="h-[93vh] max-h-[750px] w-full">
          <div ref={modalRef} className="h-[93vh] min-h-[600px] max-h-[750px]">
          <div className="container mx-auto px-6 py-4 xl:py-5 xl:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-6 xl:mb-8">
                <div className="flex items-center justify-center mb-2 xl:mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-7 h-7 xl:w-8 xl:h-8 flex items-center justify-center">
                      <svg width="15" height="19" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.8866 11.7423L9.84952 10.4211C10.111 9.67575 10.052 8.84327 9.67315 8.13678L11.344 6.64409C12.2619 7.2167 13.4851 7.10494 14.2829 6.307C15.2117 5.37826 15.2117 3.87235 14.2829 2.94357C13.3541 2.01479 11.8481 2.01479 10.9194 2.94357C10.1878 3.67523 10.0329 4.76459 10.4537 5.64832L8.78271 7.14124C7.98282 6.58766 6.96245 6.49089 6.08558 6.85206L4.15864 4.20036C4.84987 3.29285 4.78169 1.99171 3.95258 1.16251C3.0484 0.258329 1.58241 0.258329 0.678174 1.16251C-0.226058 2.06674 -0.226058 3.53278 0.678174 4.43697C1.32743 5.08623 2.26606 5.26917 3.07856 4.98626L5.00573 7.6382C4.05407 8.75444 4.10479 10.4324 5.15998 11.4876C5.18025 11.5079 5.20109 11.5268 5.22198 11.5464L3.3549 14.8234C2.57889 14.6399 1.72871 14.8502 1.12351 15.4555C0.194727 16.3843 0.194727 17.8903 1.12351 18.819C2.05229 19.7478 3.55825 19.7478 4.48698 18.819C5.40606 17.9 5.41515 16.4162 4.5152 15.4852L6.38214 12.2086C7.31967 12.4778 8.36792 12.2552 9.12138 11.541L11.1604 12.8632C11.0302 13.4677 11.1994 14.1239 11.6693 14.5937C12.4053 15.3297 13.5983 15.3297 14.3342 14.5937C15.0702 13.8579 15.0702 12.6647 14.3342 11.9288C13.667 11.2618 12.6239 11.1995 11.8866 11.7423ZM1.92925 16.6091C1.88401 16.6603 1.84142 16.7088 1.79965 16.7505C1.7476 16.8025 1.67647 16.8659 1.58821 16.8931C1.47735 16.9274 1.36407 16.8972 1.27724 16.8104C1.05019 16.5834 1.13702 16.1539 1.47925 15.8118C1.82158 15.4694 2.25093 15.3826 2.47807 15.6097C2.56486 15.6964 2.59497 15.8098 2.56072 15.9207C2.5335 16.0089 2.47013 16.0803 2.41812 16.1321C2.37635 16.1738 2.32791 16.2164 2.27658 16.2616C2.21734 16.3138 2.15597 16.3677 2.09554 16.428C2.03516 16.4884 1.98135 16.5498 1.92925 16.6091ZM11.2752 3.2996C11.6174 2.95737 12.0468 2.87044 12.2739 3.09754C12.3606 3.18427 12.3908 3.2976 12.3565 3.40856C12.3293 3.49686 12.2659 3.56814 12.2139 3.62009C12.1723 3.66172 12.1238 3.7043 12.0724 3.7495C12.0132 3.8017 11.9519 3.85556 11.8914 3.91593C11.8309 3.97641 11.7771 4.03783 11.7249 4.09711C11.6798 4.14831 11.6371 4.19689 11.5955 4.23857C11.5435 4.29057 11.4722 4.35394 11.3839 4.38121C11.273 4.41542 11.1597 4.3853 11.073 4.29847C10.8461 4.07137 10.9329 3.64179 11.2752 3.2996ZM1.46265 2.28542C1.4185 2.33537 1.37706 2.38257 1.33666 2.42316C1.28609 2.47373 1.21672 2.53535 1.13069 2.56204C1.02274 2.59525 0.912451 2.56599 0.827904 2.48158C0.606853 2.26048 0.691543 1.84232 1.02478 1.50917C1.35798 1.17593 1.77596 1.09134 1.9971 1.31243C2.0816 1.39693 2.11105 1.50727 2.0776 1.61518C2.05091 1.70115 1.98939 1.77052 1.93877 1.821C1.89814 1.86163 1.85094 1.90317 1.80098 1.94699C1.74327 1.99771 1.68351 2.05023 1.62475 2.10904C1.5659 2.1679 1.51332 2.22775 1.46265 2.28542ZM5.5851 7.89522C5.99394 7.48633 6.50674 7.38261 6.77804 7.65385C6.88176 7.75762 6.91778 7.89289 6.87691 8.02544C6.84417 8.13097 6.76857 8.21599 6.70643 8.27818C6.65662 8.32799 6.59867 8.37867 6.53738 8.43272C6.46668 8.49509 6.39341 8.55937 6.32119 8.63155C6.24896 8.70382 6.18464 8.77704 6.1224 8.84789C6.06835 8.90912 6.01749 8.96707 5.96773 9.01679C5.90559 9.07912 5.82057 9.15458 5.71504 9.18722C5.58258 9.22809 5.44726 9.19216 5.3434 9.0884C5.0723 8.81691 5.17626 8.30411 5.5851 7.89522ZM12.2053 12.9549C12.164 12.9961 12.1075 13.0464 12.0377 13.0679C11.9498 13.095 11.8602 13.0712 11.7913 13.0024C11.6113 12.8225 11.6801 12.4822 11.9514 12.211C12.2225 11.9398 12.5627 11.871 12.7427 12.0511C12.8114 12.1197 12.8353 12.2095 12.8082 12.2975C12.7866 12.3675 12.7364 12.4238 12.6952 12.465C12.6622 12.4979 12.6238 12.5317 12.5832 12.5675C12.5363 12.6087 12.4876 12.6516 12.4398 12.6994C12.3919 12.7472 12.3491 12.7958 12.308 12.8429C12.272 12.8836 12.2383 12.9219 12.2053 12.9549Z" fill="#0F58F9"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-600 font-public-sans">ContentBuilder</span>
                  </div>
                </div>
                <h1 className="text-xl xl:text-2xl font-bold text-[#434343] mb-2 xl:mb-3 sora-font">{t('tariffPlan.customizeYourSubscription', "Customize your subscription")}</h1>
                <p className="text-blue-700 font-normal text-xs mb-1 font-public-sans">{t('tariffPlan.saveOnYearly', 'Save 15% on yearly plan!')}</p>
                {/* Billing Toggle */}
                <div className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 mt-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded-full text-xs xl:text-sm font-public-sans font-normal transition-all duration-300 ${
                      billingCycle === 'monthly'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-[#A1A1AA] hover:text-blue-600'
                    }`}
                  >
                    {t('tariffPlan.billMonthly', 'Monthly')}
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-1.5 rounded-full text-xs xl:text-sm font-public-sans font-normal transition-all duration-300 ${
                      billingCycle === 'yearly'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-[#A1A1AA] hover:text-blue-600'
                    }`}
                  >
                    {t('tariffPlan.billYearly', 'Yearly')}
                  </button>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="relative flex flex-col">
                      <div
                        className={`rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex flex-col h-full overflow-hidden bg-white ${
                          plan.popular 
                          ? 'border-blue-500' 
                          : 'border-gray-200'
                        }`}
                      >
                        {plan.popular && (
                          <div className="bg-blue-600 text-white px-3 py-1.5 text-xs xl:text-sm font-medium font-public-sans text-center flex items-center justify-center gap-1.5">
                            {t('tariffPlan.mostPopular', 'Most Popular')}
                            <Star className="w-3 h-3 fill-white" />
                          </div>
                        )}
                    
                    {/* Card Header */}
                    <div className={`p-4 ${plan.popular ? 'bg-blue-600' : 'bg-white'}`}>
                      <h3 className={`text-lg xl:text-xl font-bold font-public-sans mb-2 ${plan.popular ? 'text-white' : 'text-[#0D001B]'}`}>
                        {plan.name}
                      </h3>
                      <div className={plan.popular ? 'text-white' : 'text-gray-900'}>
                        {plan.id === 'enterprise' ? (
                          <>
                            <div className="text-3xl xl:text-4xl font-public-sans font-bold">
                              Let's talk
                            </div>
                            <p className="text-xs mt-1 opacity-80">Custom plans</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span className="text-3xl xl:text-4xl font-public-sans font-bold">
                                {getPrice(plan)}
                              </span>
                              {plan.price > 0 && plan.id !== 'business' && (
                                <span className="text-sm font-public-sans font-normal">
                                  /{billingCycle === 'monthly' ? t('tariffPlan.month', 'month') : t('tariffPlan.month', 'month')}
                                </span>
                              )}
                              {plan.id === 'business' && (
                                <>
                                  <span className="text-sm font-public-sans font-normal">/seat/month</span>
                                  <div className="ml-2 flex items-center gap-1 bg-white/20 rounded px-2 py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTeamSeats(Math.max(2, teamSeats - 1));
                                      }}
                                      className="w-5 h-5 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="text-sm font-medium min-w-[40px] text-center">{teamSeats} seats</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTeamSeats(teamSeats + 1);
                                      }}
                                      className="w-5 h-5 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                            {plan.price === 0 && plan.id === 'starter' && (
                              <p className="text-xs mt-1 opacity-80">No commitment</p>
                            )}
                            {plan.price > 0 && plan.id !== 'business' && billingCycle === 'yearly' && plan.yearlyPrice && (
                              <p className="text-xs mt-1 opacity-80">${plan.yearlyPrice} Billed annually</p>
                            )}
                            {plan.id === 'business' && (
                              <p className="text-xs mt-1 opacity-80">
                                Minimum 2 seats, ${billingCycle === 'yearly' ? (plan.yearlyPrice || 0) * teamSeats : plan.price * teamSeats * 12} Billed annually
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className={`px-4 pb-4 pt-3 flex flex-col flex-grow bg-white`}>
                      {/* Credits Info */}
                      <div className="mb-4">
                        <div className="flex items-center text-sm font-normal text-gray-900">
                          <span className="font-medium">{plan.credits} Credits</span>
                          <span className="ml-1 text-gray-600">
                            {plan.id === 'starter' ? ' / one-time on registration' : ' /month'}
                          </span>
                          <div className="ml-1 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs cursor-help">
                            i
                          </div>
                        </div>
                      </div>

                      {/* Section Title */}
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        {plan.id === 'enterprise' 
                          ? t('tariffPlan.allTeamFeaturesPlus', 'All Team features, plus:')
                          : t('tariffPlan.ourPlanIncludes', `Our ${plan.name} plan includes:`)}
                      </h4>

                      {/* Features List */}
                      <div className="space-y-2.5 mb-4 font-public-sans flex-grow">
                        <div className="flex items-start">
                          <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                          <span className="text-xs text-gray-900 leading-relaxed">
                            <span className="font-semibold">Storage:</span> {plan.storage}
                          </span>
                        </div>
                        
                        <div className="flex items-start">
                          <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                          <span className="text-xs text-gray-900 leading-relaxed">
                            <span className="font-semibold">Connectors:</span> {plan.connectors}
                          </span>
                        </div>

                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 text-blue-600" />
                            <span className="text-xs text-gray-900 leading-relaxed">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => plan.id !== 'starter' && plan.id !== currentPlanId && handlePurchasePlan(plan)}
                        className={`w-full py-2.5 rounded-lg font-public-sans font-semibold text-sm transition-all duration-300 ${
                          plan.id === currentPlanId
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : plan.name.includes('Enterprise')
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        }`}
                        disabled={plan.id === currentPlanId}
                      >
                        {plan.id === currentPlanId
                          ? t('tariffPlan.current', 'Current')
                          : plan.name.includes('Enterprise')
                          ? t('tariffPlan.contactSales', 'Contact Sales')
                          : t('tariffPlan.upgrade', 'Upgrade')}
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Credit Add-Ons Section */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold text-[#434343] mb-1 text-center">
                  {t('addOns.creditAddOns', 'Credit Add-Ons')}
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  {t('addOns.creditAddOnsDescription', 'Need more credits? Purchase additional credit packages')}
                </p>
                
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
                  {creditAddOns.map((addOn) => (
                    <div key={addOn.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CoinsIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[#434343] mb-1">{addOn.name}</h3>
                          <p className="text-[10px] text-[#949CA8] leading-tight">{addOn.description}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-[#71717A] font-semibold mb-2">
                          <span>{addOn.amount}</span>
                        </div>
                        <div className="text-3xl pb-2 font-bold text-gray-900">
                          {typeof addOn.price === 'number' ? `$${addOn.price}` : addOn.price}
                          {addOn.priceNote === 'per month' && (
                            <span className="text-xs font-normal text-[#0D001B]">/month</span>
                          )}
                        </div>
                        
                        {!addOn.isEnterprise && (
                          <div className="flex border border-[#E0E0E0] rounded-sm py-0.5 px-1 mb-3 items-center gap-2">
                            <button
                              onClick={() => setCreditQuantities(prev => ({
                                ...prev,
                                [addOn.id]: Math.max(1, prev[addOn.id] - 1)
                              }))}
                              className="h-5 w-5 bg-[#CCDBFC] rounded hover:bg-[#C0CEED] text-sm text-[#0F58F9] flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <div className="flex-1 text-center text-sm text-[#71717A]">
                              {creditQuantities[addOn.id]}
                            </div>
                            <button
                              onClick={() => setCreditQuantities(prev => ({
                                ...prev,
                                [addOn.id]: prev[addOn.id] + 1
                              }))}
                              className="h-5 w-5 bg-[#CCDBFC] rounded hover:bg-[#C0CEED] text-sm text-[#0F58F9] flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        
                        {addOn.isEnterprise && (
                          <div className="h-8 mb-3"></div>
                        )}
                        
                        <button
                          className={`w-full py-2 rounded-full font-medium text-sm transition-all ${
                            addOn.isEnterprise 
                              ? 'bg-[#CCDBFC] text-[#0F58F9] hover:bg-[#C2D1F0]' 
                              : 'bg-[#0F58F9] text-white hover:bg-blue-700'
                          }`}
                        >
                          {addOn.isEnterprise 
                            ? t('addOns.contactSales', 'Contact Sales') 
                            : t('addOns.buyNow', 'Buy now')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* See Full Comparison Link */}
              <div className="text-center mt-6 mb-2">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1 transition-colors">
                  {t('tariffPlan.seeFullComparison', 'See Full Comparison')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          </div>
        </ScrollArea>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default TariffPlanModal;
