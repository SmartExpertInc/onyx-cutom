"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import CreditsTab from './components/CreditsTab';
import AnalyticsTab from './components/AnalyticsTab';
import FeaturesTab from './components/FeaturesTab';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('credits');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, credits, analytics, and feature flags</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="mt-6">
          <CreditsTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <FeaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage; 