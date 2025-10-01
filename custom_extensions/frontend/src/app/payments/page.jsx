"use client";

import { Calendar, ExternalLink, CreditCard, Bell, Users, Settings, Key } from 'lucide-react';
import { useState } from 'react';
import ManageAddonsModal from './ManageAddonsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  const [isAddonsModalOpen, setIsAddonsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing and subscription</h1>

        {/* Navigation Tabs */}
        
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Workspace Subscription */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Workspace subscription</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                Your workspace is currently subscribed to the <span className="font-semibold text-gray-900">Plus Monthly</span> plan.
              </p>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span className="text-sm">Renews on October 16th, 2025</span>
              </div>
            </div>
          </div>

          {/* Current Plan Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-md border border-blue-200">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">Plus</div>
              <div className="text-xl font-semibold text-blue-700 mb-6">Monthly</div>
              <Button className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
                Switch to annual and save 20%
              </Button>
            </div>
          </div>
        </div>

        {/* Upgrade to Pro */}
        <div className="mb-8">
          <Button variant="outline" className="w-full bg-white border-2 border-gray-200 rounded-full px-6 py-4 text-gray-700 font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md">
            Upgrade to Pro
          </Button>
        </div>

        {/* Manage Subscription Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage subscription</h2>
            <p className="text-gray-600">
              You can get invoices, update your payment method, and adjust your subscription in Stripe
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-gray-700 font-medium hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
              <span>Manage subscription in Stripe</span>
              <ExternalLink size={18} />
            </Button>
            <Button variant="outline" className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-red-600 font-medium hover:border-red-300 hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md">
              Cancel subscription
            </Button>
          </div>
        </div>
          </div>
      </div>

      <ManageAddonsModal
        isOpen={isAddonsModalOpen}
        onClose={() => setIsAddonsModalOpen(false)}
      />
    </div>
  );
}
