'use client';

import { useState } from 'react';
import { X, Check, Star } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Starter',
      price: selectedPlan === 'monthly' ? 29 : 290,
      period: selectedPlan === 'monthly' ? 'month' : 'year',
      features: [
        'Up to 10 videos per month',
        'Basic templates',
        '720p quality',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: selectedPlan === 'monthly' ? 99 : 990,
      period: selectedPlan === 'monthly' ? 'month' : 'year',
      features: [
        'Up to 100 videos per month',
        'Premium templates',
        '1080p quality',
        'Priority support',
        'Custom branding',
        'Advanced analytics'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: selectedPlan === 'monthly' ? 299 : 2990,
      period: selectedPlan === 'monthly' ? 'month' : 'year',
      features: [
        'Unlimited videos',
        'All templates',
        '4K quality',
        '24/7 support',
        'Custom integrations',
        'Team collaboration',
        'API access'
      ],
      popular: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-blue-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
            <p className="text-blue-100 mt-1">Choose the perfect plan for your video creation needs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex bg-gray-100 min-h-[600px]">
          {/* Left Panel */}
          <div className="w-1/3 p-6 border-r border-gray-200">
            {/* Current Plan Container */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="text-xs text-gray-500 mb-1">You are currently on</div>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-xl font-bold text-black mb-1">Business</div>
                  <div className="text-xs text-gray-500">For professionals or small teams</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-black">$70</div>
                  <div className="text-xs text-gray-500">Billed annually at $840</div>
                </div>
              </div>
              
              {/* Seat Selection */}
              <div className="bg-gray-100 rounded-lg p-3 mt-4">
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 bg-white rounded-md text-sm font-medium text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors">
                    1 seat
                  </button>
                  <button className="flex-1 py-2 px-3 bg-gray-200 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-300 transition-colors">
                    2 seats
                  </button>
                  <button className="flex-1 py-2 px-3 bg-gray-200 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-300 transition-colors">
                    3 seats
                  </button>
                </div>
              </div>
            </div>

            {/* Current Plan Features */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Plan</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Unlimited minutes and videos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Up to 3 editors, unlimited viewers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">10 Custom Avatars + 2 Voices per editor</span>
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">i</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Management Buttons */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <button className="w-full bg-white text-gray-900 border border-gray-300 rounded-full py-2 px-4 text-sm font-medium hover:bg-gray-50 transition-colors mb-3">
                Manage
              </button>
              <div className="text-center text-xs text-gray-500 mb-3">or</div>
              <button className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors">
                Cancel subscription
              </button>
            </div>

            {/* Additional Features */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">170+ AI Avatars</span>
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">i</span>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Access to 70 avatar scenarios</span>
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">i</span>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Avatar conversation (limited)</span>
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">i</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-2/3 p-6">
            <div className="grid grid-cols-1 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative border rounded-lg p-6 bg-white ${
                    plan.popular
                      ? 'border-purple-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-colors`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">Perfect for {plan.name.toLowerCase()} users</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">${plan.price}</div>
                      <div className="text-gray-500 text-sm">/{plan.period}</div>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.popular ? 'Get Started' : 'Choose Plan'}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  All plans include a 14-day free trial. Cancel anytime.
                </p>
                <p className="text-xs text-gray-500">
                  Need a custom plan? <a href="#" className="text-purple-600 hover:underline">Contact us</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
