"use client";

import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Star, Users, Database, Zap, Shield, Clock, CreditCard, ArrowLeft, Coins, X, Server, ShieldUser, MessagesSquare, Workflow } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
                          <span className="text-lg text-gray-500 font-normal">
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
                        
                        if (!['Pro', 'Business', 'Enterprise'].includes(selectedPlan.name)) {
                          throw new Error('Plan not supported');
                        }
                        
                        const res = await fetch('/api/custom-projects-backend/billing/checkout', { 
                          method: 'POST', 
                          credentials: 'same-origin',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            planName: `${selectedPlan.name.toLowerCase()}_${billingCycle === 'yearly' ? 'yearly' : 'monthly'}`,
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
      <DialogContent className="max-w-7xl w-[90vw] h-[90vh] overflow-y-auto p-0 rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="min-h-full">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-16">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">{t('tariffPlan.chooseYourPlan', 'Choose your plan')}</h1>
                
                {/* Billing Toggle */}
                <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg border border-gray-200 mt-8">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      billingCycle === 'monthly'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {t('tariffPlan.billMonthly', 'Bill Monthly')}
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      billingCycle === 'yearly'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {t('tariffPlan.billYearly', 'Bill Yearly')}
                  </button>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-7">
                {plans.map((plan) => (
                    <div key={plan.id} className="relative">
                      <div
                        className={`bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                          plan.popular 
                          ? 'border-blue-600' 
                          : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-0 right-0 z-10">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-t-3xl text-sm font-bold shadow-lg text-center">
                              {t('tariffPlan.mostPopular', 'Most Popular')}
                            </div>
                          </div>
                        )}
                    
                    {/* Card Header */}
                    <div className={`p-8 rounded-t-3xl ${
                    plan.name.includes('Free') 
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : plan.name.includes('Enterprise')
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700'
                        : 'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`}>
                      <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                      <div className="text-white">
                        <span className="text-4xl font-bold">
                          {getPrice(plan)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-lg opacity-80">
                            / {billingCycle === 'monthly' ? t('tariffPlan.month', 'Month') : t('tariffPlan.year', 'Year')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-8">
                      <div className="space-y-4 mb-8">
                        <div className="flex items-start">
                          <Coins className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">{t('tariffPlan.credits', 'Credits')}</div>
                            <div className="text-sm text-gray-600">{plan.credits}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Server className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">{t('tariffPlan.storage', 'Storage')}</div>
                            <div className="text-sm text-gray-600">{plan.storage}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <MessagesSquare className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">{t('tariffPlan.support', 'Support')}</div>
                            <div className="text-sm text-gray-600">{plan.support}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Workflow className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">{t('tariffPlan.connectors', 'Connectors')}</div>
                            <div className="text-sm text-gray-600">{plan.connectors}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Users className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">{t('tariffPlan.collaboration', 'Collaboration')}</div>
                            <div className="text-sm text-gray-600">{plan.collaboration}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (plan.id === 'starter' || plan.id === currentPlanId) return;
                          if (plan.id === 'enterprise' || plan.name.includes('Enterprise')) {
                            window.open('https://calendly.com/k-torhonska-smartexpert/30min', '_blank');
                            return;
                          }
                          handlePurchasePlan(plan);
                        }}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                          plan.id === currentPlanId
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl'
                            : plan.name.includes('Enterprise')
                            ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 hover:from-indigo-200 hover:to-indigo-300'
                            : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300'
                        }`}
                        disabled={plan.id === currentPlanId}
                      >
                        {plan.id === currentPlanId
                          ? t('tariffPlan.current', 'Current')
                          : plan.name.includes('Enterprise')
                          ? t('tariffPlan.contactSales', 'Contact Sales')
                          : t('tariffPlan.purchasePlan', 'Purchase Plan')}
                      </button>
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
