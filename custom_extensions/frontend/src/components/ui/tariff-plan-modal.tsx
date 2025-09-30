"use client";

import React, { useState } from 'react';
import { Check, ArrowRight, Star, Users, Database, Zap, Shield, Clock, CreditCard, ArrowLeft, Coins, X, Server, ShieldUser, MessagesSquare, Workflow } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter (Free)',
    price: 0,
    credits: '200 (one-time on registration)',
    support: 'Email up to 48 hours',
    storage: '1 GB',
    connectors: '-',
    collaboration: '-',
    lmsExport: 'Only SmartExpert',
    slides: 'max 20',
    features: [
      '200 credits on registration',
      '1 GB storage',
      'Basic email support',
      'No connectors',
      'No collaboration'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 30,
    yearlyPrice: 25,
    credits: '600 / month',
    support: 'Email up to 24 hours',
    storage: '5 GB',
    connectors: '2',
    collaboration: '1 (up to 3 participants)',
    lmsExport: 'Only SmartExpert',
    slides: '20+',
    features: [
      '600 credits per month',
      '5 GB storage',
      'Priority email support (24h)',
      '2 platform connectors',
      'Team collaboration (up to 3)'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 90,
    yearlyPrice: 75,
    credits: '2,000 / month',
    support: 'Priority support',
    storage: '10 GB',
    connectors: '5',
    collaboration: '3 (up to 10 participants)',
    lmsExport: 'Only SmartExpert',
    slides: '20+',
    popular: true,
    features: [
      '2,000 credits per month',
      '10 GB storage',
      'Priority support',
      '5 platform connectors',
      'Team collaboration (up to 10)'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    credits: '10,000+ / month (flexible)',
    support: 'Dedicated manager',
    storage: '50 GB + pay-as-you-go',
    connectors: 'All',
    collaboration: 'Unlimited',
    lmsExport: 'SmartExpert + custom',
    slides: '20+',
    features: [
      'Custom credit allocation',
      'Unlimited storage',
      'Dedicated account manager',
      'All platform connectors',
      'Unlimited team collaboration',
      'Custom features & integrations'
    ]
  }
];

interface TariffPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TariffPlanModal: React.FC<TariffPlanModalProps> = ({ open, onOpenChange }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
                  Back to plans
                </button>

                {/* Payment Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Purchase</h1>
                  <p className="text-xl text-gray-600">Subscribe to {selectedPlan.name}</p>
                </div>

                {/* Plan Summary */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h3>
                      <p className="text-gray-600">
                        {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} subscription
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {getPrice(selectedPlan)}
                        {selectedPlan.price > 0 && (
                          <span className="text-lg text-gray-500 font-normal">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">What's included:</h4>
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

                {/* Payment Form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">Payment Information</h3>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="bg-gray-50 rounded-xl p-4 mt-8 mb-8">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700 font-medium">SSL Encrypted</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700 font-medium">Instant Access</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700 font-medium">Cancel Anytime</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || selectedPlan.name.includes('Enterprise')}
                    className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                      isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : selectedPlan.name.includes('Enterprise')
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-2xl'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Processing Payment...
                      </>
                    ) : selectedPlan.name.includes('Enterprise') ? (
                      'Contact Sales'
                    ) : (
                      <>
                        Subscribe to {selectedPlan.name}
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Your subscription will be activated immediately after payment confirmation
                  </p>
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
      <DialogContent className="max-w-7xl w-[90vw] h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="min-h-full">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-16">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">Choose your plan</h1>
                
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
                    Bill Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      billingCycle === 'yearly'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    Bill Yearly
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
                              Most Popular
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
                            / {billingCycle === 'monthly' ? 'Month' : 'Year'}
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
                            <div className="font-semibold text-gray-900">Credits</div>
                            <div className="text-sm text-gray-600">{plan.credits}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Server className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">Storage</div>
                            <div className="text-sm text-gray-600">{plan.storage}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <MessagesSquare className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">Support</div>
                            <div className="text-sm text-gray-600">{plan.support}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Workflow className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">Connectors</div>
                            <div className="text-sm text-gray-600">{plan.connectors}</div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Users className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">Collaboration</div>
                            <div className="text-sm text-gray-600">{plan.collaboration}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => plan.id !== 'starter' && handlePurchasePlan(plan)}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                          plan.id === 'starter'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl'
                            : plan.name.includes('Enterprise')
                            ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 hover:from-indigo-200 hover:to-indigo-300'
                            : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300'
                        }`}
                        disabled={plan.id === 'starter'}
                      >
                        {plan.id === 'starter' 
                          ? 'Current' 
                          : plan.name.includes('Enterprise') 
                          ? 'Contact Sales' 
                          : 'Purchase Plan'}
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
