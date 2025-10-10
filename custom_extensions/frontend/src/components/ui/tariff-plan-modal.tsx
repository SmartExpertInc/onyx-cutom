"use client";

import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Star, Users, Database, Zap, Shield, Clock, CreditCard, ArrowLeft, Coins, X, Server, ShieldUser, MessagesSquare, Workflow } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const mapPlan = (planRaw?: string): 'starter' | 'pro' | 'business' | 'enterprise' => {
    const p = (planRaw || 'starter').toLowerCase();
    if (p.includes('business')) return 'business';
    if (p.includes('pro')) return 'pro';
    if (p.includes('enterprise')) return 'enterprise';
    return 'starter';
  };

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
        <DialogContent className="max-w-4xl w-[85vw] h-[85vh] overflow-y-auto p-0 bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[1280px] w-[90vw] rounded-xl p-0 max-h-[90vh] min-w-[830px] overflow-y-auto overflow-x-hidden p-0 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-md" hideCloseIcon>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-[#71717A]" />
        </button>
        
        <div className="h-[90%] min-h-[700px]">
          <div className="container mx-auto px-10 py-7">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-14">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg width="15" height="19" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.8866 11.7423L9.84952 10.4211C10.111 9.67575 10.052 8.84327 9.67315 8.13678L11.344 6.64409C12.2619 7.2167 13.4851 7.10494 14.2829 6.307C15.2117 5.37826 15.2117 3.87235 14.2829 2.94357C13.3541 2.01479 11.8481 2.01479 10.9194 2.94357C10.1878 3.67523 10.0329 4.76459 10.4537 5.64832L8.78271 7.14124C7.98282 6.58766 6.96245 6.49089 6.08558 6.85206L4.15864 4.20036C4.84987 3.29285 4.78169 1.99171 3.95258 1.16251C3.0484 0.258329 1.58241 0.258329 0.678174 1.16251C-0.226058 2.06674 -0.226058 3.53278 0.678174 4.43697C1.32743 5.08623 2.26606 5.26917 3.07856 4.98626L5.00573 7.6382C4.05407 8.75444 4.10479 10.4324 5.15998 11.4876C5.18025 11.5079 5.20109 11.5268 5.22198 11.5464L3.3549 14.8234C2.57889 14.6399 1.72871 14.8502 1.12351 15.4555C0.194727 16.3843 0.194727 17.8903 1.12351 18.819C2.05229 19.7478 3.55825 19.7478 4.48698 18.819C5.40606 17.9 5.41515 16.4162 4.5152 15.4852L6.38214 12.2086C7.31967 12.4778 8.36792 12.2552 9.12138 11.541L11.1604 12.8632C11.0302 13.4677 11.1994 14.1239 11.6693 14.5937C12.4053 15.3297 13.5983 15.3297 14.3342 14.5937C15.0702 13.8579 15.0702 12.6647 14.3342 11.9288C13.667 11.2618 12.6239 11.1995 11.8866 11.7423ZM1.92925 16.6091C1.88401 16.6603 1.84142 16.7088 1.79965 16.7505C1.7476 16.8025 1.67647 16.8659 1.58821 16.8931C1.47735 16.9274 1.36407 16.8972 1.27724 16.8104C1.05019 16.5834 1.13702 16.1539 1.47925 15.8118C1.82158 15.4694 2.25093 15.3826 2.47807 15.6097C2.56486 15.6964 2.59497 15.8098 2.56072 15.9207C2.5335 16.0089 2.47013 16.0803 2.41812 16.1321C2.37635 16.1738 2.32791 16.2164 2.27658 16.2616C2.21734 16.3138 2.15597 16.3677 2.09554 16.428C2.03516 16.4884 1.98135 16.5498 1.92925 16.6091ZM11.2752 3.2996C11.6174 2.95737 12.0468 2.87044 12.2739 3.09754C12.3606 3.18427 12.3908 3.2976 12.3565 3.40856C12.3293 3.49686 12.2659 3.56814 12.2139 3.62009C12.1723 3.66172 12.1238 3.7043 12.0724 3.7495C12.0132 3.8017 11.9519 3.85556 11.8914 3.91593C11.8309 3.97641 11.7771 4.03783 11.7249 4.09711C11.6798 4.14831 11.6371 4.19689 11.5955 4.23857C11.5435 4.29057 11.4722 4.35394 11.3839 4.38121C11.273 4.41542 11.1597 4.3853 11.073 4.29847C10.8461 4.07137 10.9329 3.64179 11.2752 3.2996ZM1.46265 2.28542C1.4185 2.33537 1.37706 2.38257 1.33666 2.42316C1.28609 2.47373 1.21672 2.53535 1.13069 2.56204C1.02274 2.59525 0.912451 2.56599 0.827904 2.48158C0.606853 2.26048 0.691543 1.84232 1.02478 1.50917C1.35798 1.17593 1.77596 1.09134 1.9971 1.31243C2.0816 1.39693 2.11105 1.50727 2.0776 1.61518C2.05091 1.70115 1.98939 1.77052 1.93877 1.821C1.89814 1.86163 1.85094 1.90317 1.80098 1.94699C1.74327 1.99771 1.68351 2.05023 1.62475 2.10904C1.5659 2.1679 1.51332 2.22775 1.46265 2.28542ZM5.5851 7.89522C5.99394 7.48633 6.50674 7.38261 6.77804 7.65385C6.88176 7.75762 6.91778 7.89289 6.87691 8.02544C6.84417 8.13097 6.76857 8.21599 6.70643 8.27818C6.65662 8.32799 6.59867 8.37867 6.53738 8.43272C6.46668 8.49509 6.39341 8.55937 6.32119 8.63155C6.24896 8.70382 6.18464 8.77704 6.1224 8.84789C6.06835 8.90912 6.01749 8.96707 5.96773 9.01679C5.90559 9.07912 5.82057 9.15458 5.71504 9.18722C5.58258 9.22809 5.44726 9.19216 5.3434 9.0884C5.0723 8.81691 5.17626 8.30411 5.5851 7.89522ZM12.2053 12.9549C12.164 12.9961 12.1075 13.0464 12.0377 13.0679C11.9498 13.095 11.8602 13.0712 11.7913 13.0024C11.6113 12.8225 11.6801 12.4822 11.9514 12.211C12.2225 11.9398 12.5627 11.871 12.7427 12.0511C12.8114 12.1197 12.8353 12.2095 12.8082 12.2975C12.7866 12.3675 12.7364 12.4238 12.6952 12.465C12.6622 12.4979 12.6238 12.5317 12.5832 12.5675C12.5363 12.6087 12.4876 12.6516 12.4398 12.6994C12.3919 12.7472 12.3491 12.7958 12.308 12.8429C12.272 12.8836 12.2383 12.9219 12.2053 12.9549Z" fill="#0F58F9"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-600 font-public-sans">ContentBuilder</span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-[#434343] mb-5 font-sora">{t('tariffPlan.chooseYourPlan', "Choose the plan that's right for you")}</h1>
                <p className="text-blue-700 font-normal text-xs mb-2 font-public-sans"><span className="font-sora font-bold">Save 15%</span> on yearly plan!</p>
                {/* Billing Toggle */}
                <div className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 mt-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 rounded-full text-sm font-public-sans font-semibold transition-all duration-300 ${
                      billingCycle === 'monthly'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-[#A1A1AA] hover:text-blue-600'
                    }`}
                  >
                    {t('tariffPlan.billMonthly', 'Monthly')}
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-5 py-2 rounded-full text-sm font-public-sans font-semibold transition-all duration-300 ${
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
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5">
                {plans.map((plan) => (
                    <div key={plan.id} className="relative flex flex-col">
                      <div
                        className={`bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl flex flex-col h-full ${
                          plan.popular 
                          ? 'border-blue-600 border-2 bg-blue-50/30' 
                          : 'border-gray-200 border-2 hover:border-blue-300'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-5 left-0 right-0 z-10">
                            <div className="bg-blue-600 text-white px-4 py-1 rounded-t-lg text-sm font-semibold font-public-sans text-center flex items-center justify-center gap-2">
                              {t('tariffPlan.mostPopular', 'Most Popular')}
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_308_22585)">
                                <path d="M6.49994 16.0005C6.34193 16.0013 6.18743 15.9539 6.0571 15.8645C5.92676 15.7752 5.8268 15.6482 5.77057 15.5005L4.52557 12.263C4.50035 12.1978 4.46178 12.1385 4.41232 12.0891C4.36286 12.0396 4.30362 12.0011 4.23838 11.9758L0.999941 10.7299C0.852423 10.6733 0.725541 10.5733 0.63604 10.443C0.546538 10.3128 0.498626 10.1585 0.498626 10.0005C0.498626 9.84251 0.546538 9.68822 0.63604 9.558C0.725541 9.42778 0.852423 9.32777 0.999941 9.27115L4.23744 8.02615C4.30268 8.00093 4.36193 7.96236 4.41138 7.9129C4.46084 7.86345 4.49941 7.8042 4.52463 7.73896L5.77057 4.50052C5.82718 4.35301 5.9272 4.22612 6.05742 4.13662C6.18764 4.04712 6.34193 3.99921 6.49994 3.99921C6.65795 3.99921 6.81225 4.04712 6.94246 4.13662C7.07268 4.22612 7.1727 4.35301 7.22932 4.50052L8.47432 7.73802C8.49953 7.80326 8.5381 7.86251 8.58756 7.91197C8.63702 7.96142 8.69627 8 8.7615 8.02521L11.9803 9.26365C12.1338 9.32055 12.266 9.42339 12.359 9.55815C12.452 9.69291 12.5012 9.85305 12.4999 10.0168C12.4976 10.172 12.4486 10.323 12.3595 10.4501C12.2703 10.5773 12.1451 10.6747 11.9999 10.7299L8.76244 11.9749C8.6972 12.0001 8.63795 12.0387 8.5885 12.0881C8.53904 12.1376 8.50047 12.1968 8.47525 12.2621L7.22932 15.5005C7.17308 15.6482 7.07312 15.7752 6.94279 15.8645C6.81245 15.9539 6.65796 16.0013 6.49994 16.0005Z" fill="white"/>
                                <path d="M2.74994 5.50052C2.6573 5.50052 2.56684 5.47245 2.49047 5.42001C2.4141 5.36757 2.35541 5.29323 2.32213 5.20677L1.79525 3.83677C1.78383 3.80681 1.76621 3.7796 1.74354 3.75693C1.72086 3.73426 1.69365 3.71663 1.66369 3.70521L0.293691 3.17834C0.207247 3.14505 0.132915 3.08635 0.0804885 3.00998C0.0280618 2.93362 0 2.84316 0 2.75052C0 2.65789 0.0280618 2.56743 0.0804885 2.49106C0.132915 2.4147 0.207247 2.356 0.293691 2.32271L1.66369 1.79584C1.69362 1.78437 1.72081 1.76672 1.74347 1.74406C1.76614 1.72139 1.78378 1.69421 1.79525 1.66427L2.31744 0.306461C2.34689 0.226525 2.39757 0.156124 2.46402 0.102827C2.53048 0.0495292 2.6102 0.0153496 2.69463 0.00396142C2.79599 -0.00836038 2.89856 0.0135079 2.98608 0.0660987C3.0736 0.118689 3.14105 0.198992 3.17775 0.294274L3.70463 1.66427C3.7161 1.69421 3.73374 1.72139 3.75641 1.74406C3.77908 1.76672 3.80626 1.78437 3.83619 1.79584L5.20619 2.32271C5.29263 2.356 5.36697 2.4147 5.41939 2.49106C5.47182 2.56743 5.49988 2.65789 5.49988 2.75052C5.49988 2.84316 5.47182 2.93362 5.41939 3.00998C5.36697 3.08635 5.29263 3.14505 5.20619 3.17834L3.83619 3.70521C3.80623 3.71663 3.77902 3.73426 3.75635 3.75693C3.73367 3.7796 3.71605 3.80681 3.70463 3.83677L3.17775 5.20677C3.14447 5.29323 3.08578 5.36757 3.00941 5.42001C2.93304 5.47245 2.84258 5.50052 2.74994 5.50052Z" fill="white"/>
                                <path d="M12.4999 8.00052C12.3989 8.00049 12.3002 7.96984 12.2169 7.9126C12.1336 7.85536 12.0696 7.77423 12.0334 7.6799L11.3196 5.82459C11.3071 5.79189 11.2878 5.7622 11.263 5.73744C11.2383 5.71268 11.2086 5.69339 11.1759 5.68084L9.32057 4.96709C9.22631 4.93077 9.14526 4.86675 9.0881 4.78347C9.03094 4.70018 9.00034 4.60154 9.00034 4.50052C9.00034 4.39951 9.03094 4.30087 9.0881 4.21758C9.14526 4.1343 9.22631 4.07028 9.32057 4.03396L11.1759 3.32021C11.2086 3.30766 11.2383 3.28837 11.263 3.26361C11.2878 3.23884 11.3071 3.20915 11.3196 3.17646L12.0281 1.33427C12.0604 1.24716 12.1158 1.17044 12.1882 1.11228C12.2607 1.05411 12.3476 1.01668 12.4396 1.00396C12.5502 0.990572 12.6621 1.01451 12.7576 1.07197C12.8531 1.12944 12.9266 1.21713 12.9665 1.32115L13.6803 3.17646C13.6928 3.20915 13.7121 3.23884 13.7369 3.26361C13.7616 3.28837 13.7913 3.30766 13.824 3.32021L15.6793 4.03396C15.7736 4.07028 15.8546 4.1343 15.9118 4.21758C15.9689 4.30087 15.9995 4.39951 15.9995 4.50052C15.9995 4.60154 15.9689 4.70018 15.9118 4.78347C15.8546 4.86675 15.7736 4.93077 15.6793 4.96709L13.824 5.68084C13.7913 5.69339 13.7616 5.71268 13.7369 5.73744C13.7121 5.7622 13.6928 5.79189 13.6803 5.82459L12.9665 7.6799C12.9302 7.77423 12.8663 7.85536 12.783 7.9126C12.6997 7.96984 12.601 8.00049 12.4999 8.00052Z" fill="white"/>
                                </g>
                                <defs>
                                <clipPath id="clip0_308_22585">
                                <rect width="16" height="16" fill="white"/>
                                </clipPath>
                                </defs>
                              </svg>
                            </div>
                          </div>
                        )}
                    
                    {/* Card Header */}
                    <div className="p-5 pt-6">
                      <h3 className="text-xl font-bold text-[#0D001B] font-public-sans mb-1">{plan.name}</h3>
                      <p className="text-sm text-[#0D001B] font-public-sans mb-4">Best for personal use</p>
                      <div className="text-gray-900">
                        <span className="text-3xl font-public-sans font-bold">
                          {getPrice(plan)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-xs font-public-sans text-[#0D001B] font-normal">
                            / {billingCycle === 'monthly' ? t('tariffPlan.month', 'month') : t('tariffPlan.year', 'year')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-4 pb-3 pt-3 flex flex-col flex-grow">
                    <button
                        onClick={() => plan.id !== 'starter' && plan.id !== currentPlanId && handlePurchasePlan(plan)}
                        className={`w-full py-2 rounded-sm font-public-sans font-semibold text-base transition-all duration-300 ${
                          plan.id === currentPlanId
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : plan.name.includes('Enterprise')
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={plan.id === currentPlanId}
                      >
                        {plan.id === currentPlanId
                          ? t('tariffPlan.current', 'Current')
                          : plan.name.includes('Enterprise')
                          ? t('tariffPlan.contactSales', 'Contact Sales')
                          : t('tariffPlan.getStarted', 'Get started')}
                      </button>
                      <h4 className="text-base font-medium font-public-sans text-[#434343] pt-9 mb-4">
                        {plan.id === 'starter' ? 'What you get:' : 
                         plan.id === 'pro' ? 'All free features, plus:' :
                         plan.id === 'business' ? 'All starter features, plus:' :
                         'All business features, plus:'}
                      </h4>
                      <div className="space-y-4 mb-8 font-public-sans flex-grow">
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-blue-600 mr-3 font-medium flex-shrink-0" />
                          <span className="text-sm font-normal text-[#71717A]">
                            <span className="font-semibold">{t('tariffPlan.credits', 'Credits')}</span>: {plan.credits}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                          <span className="text-sm font-normal text-[#71717A]">
                            <span className="font-semibold">{t('tariffPlan.storage', 'Storage')}</span>: {plan.storage}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                          <span className="text-sm font-normal text-[#71717A]">
                             <span className="font-semibold">{t('tariffPlan.support', 'Support')}</span>: {plan.support}
                          </span>
                        </div>

                        {plan.connectors !== '-' && (
                          <div className="flex items-center">
                            <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                            <span className="text-sm font-normal text-[#71717A]">
                              <span className="font-semibold">{t('tariffPlan.connectors', 'Connectors')}</span>: {plan.connectors}
                            </span>
                          </div>
                        )}

                        {plan.collaboration !== '-' && (
                          <div className="flex items-center">
                            <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                            <span className="text-sm font-normal text-[#71717A]">
                              <span className="font-semibold">{t('tariffPlan.collaboration', 'Collaboration')}</span>: {plan.collaboration}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TariffPlanModal;
