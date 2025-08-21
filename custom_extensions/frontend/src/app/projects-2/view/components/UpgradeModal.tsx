'use client';

import { useState } from 'react';
import { X, Check, Star } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedSeats, setSelectedSeats] = useState<number>(1);

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
      <div className="relative bg-white shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto z-10" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="flex items-center justify-end p-2 bg-blue-600 text-white">
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
          <div className="w-1/3 p-4">
            <div className="bg-white rounded-lg p-4">
              {/* Current Plan Info */}
              <div className="text-xs text-gray-500 mb-3">You are currently on</div>
              <div className="mb-1">
                <div className="text-2xl text-black mb-1">Business</div>
                <div className="text-xs text-gray-500 mb-2">For professionals or small teams</div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-semibold text-black">$70</div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Billed annually</div>
                    <div className="text-xs text-gray-500">at $840</div>
                  </div>
                </div>
              </div>
              
              {/* Seat Selection */}
              <div className="bg-gray-100 rounded-full p-1 mt-4 mb-6 w-full">
                <div className="flex justify-between">
                  <button 
                    onClick={() => setSelectedSeats(1)}
                    className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                      selectedSeats === 1 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-black'
                    }`}
                  >
                    1 seat
                  </button>
                  <button 
                    onClick={() => setSelectedSeats(2)}
                    className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                      selectedSeats === 2 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-black'
                    }`}
                  >
                    2 seats
                  </button>
                  <button 
                    onClick={() => setSelectedSeats(3)}
                    className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                      selectedSeats === 3 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-black'
                    }`}
                  >
                    3 seats
                  </button>
                </div>
              </div>

              {/* Current Plan Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Unlimited minutes and videos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Up to 3 editors, unlimited viewers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                                      <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">10 Custom Avatars + 2 Voices per editor</span>
                      <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium">i</span>
                      </div>
                    </div>
                </li>
              </ul>

              {/* Management Buttons */}
              <button className="w-full bg-white text-gray-900 border border-gray-300 rounded-full py-2 px-4 text-sm font-medium hover:bg-gray-50 transition-colors mb-3">
                Manage
              </button>
              <div className="text-center text-xs text-gray-500 mb-3">or</div>
              <button className="w-full bg-transparent text-black rounded-full py-2 px-4 text-sm font-medium hover:bg-gray-100 transition-colors mb-6">
                Cancel subscription
              </button>

              {/* Additional Features */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">170+ AI Avatars</span>
                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-medium">i</span>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Access to 70 avatar scenarios</span>
                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-medium">i</span>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Avatar conversation (limited)</span>
                    <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-medium">i</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-2/3 p-4">
            {/* Empty right panel */}
          </div>
        </div>
      </div>
    </div>
  );
}
