"use client";

import { Calendar, ExternalLink, CreditCard, Bell, Users, Settings, Key, Home, HardDrive, FileText, ClipboardCheck, Upload, Trash2, FolderPlus, Search, Presentation, X, Database, Coins, Workflow, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddOnsModal from '@/components/AddOnsModal';
import TariffPlanModal from '@/components/ui/tariff-plan-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import useFeaturePermission from '@/hooks/useFeaturePermission';

// Sidebar component definition (exact copy from projects page)
const Sidebar = ({ currentTab, onFolderSelect, selectedFolderId, folders, folderProjects }) => {
  const { t } = useLanguage();
  const [folderSearch, setFolderSearch] = useState('');
  const { isEnabled: aiAuditEnabled } = useFeaturePermission('ai_audit_templates');
  const { isEnabled: deloitteBannerEnabled } = useFeaturePermission('deloitte_banner');
  const { isEnabled: offersTabEnabled } = useFeaturePermission('offers_tab');
  const { isEnabled: workspaceTabEnabled } = useFeaturePermission('workspace_tab');
  const { isEnabled: exportToLMSEnabled } = useFeaturePermission('export_to_lms');
  const { isEnabled: eventPostersEnabled } = useFeaturePermission('event_posters');

  // Get the 5 newest folders
  const getNewestFolders = (folders) => {
    return folders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  // Filter folders based on search
  const getFilteredFolders = (folders) => {
    if (!folderSearch.trim()) {
      return getNewestFolders(folders);
    }
    
    const searchTerm = folderSearch.toLowerCase();
    return folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm)
    );
  };

  const filteredFolders = getFilteredFolders(folders);
  const isSearching = folderSearch.trim().length > 0;

  return (
    <aside className="w-64 bg-white p-4 flex flex-col fixed h-full border-r border-gray-200 text-sm z-40">
      <div className="relative mb-6">
        {deloitteBannerEnabled ? (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-center shadow-sm">
            <svg height="35" viewBox="17.086 17.192 885.828 165.617" width="163" xmlns="http://www.w3.org/2000/svg">
              <path d="m855.963 159.337c0-12.962 10.524-23.478 23.479-23.478 12.962 0 23.472 10.516 23.472 23.478s-10.51 23.472-23.472 23.472c-12.955 0-23.479-10.51-23.479-23.472" fill="#86bc24" />
              <path d="m107.195 97.16c0-14.871-2.873-25.904-8.62-33.092-5.755-7.18-14.47-10.767-26.19-10.767h-12.465v90.938h9.538c13.016 0 22.554-3.86 28.628-11.604 6.066-7.73 9.11-19.558 9.11-35.475m44.456-1.55c0 27.093-7.282 47.97-21.848 62.623-14.565 14.66-35.04 21.99-61.434 21.99h-51.284v-162.343h54.865c25.448 0 45.095 6.665 58.94 19.987 13.839 13.329 20.761 32.568 20.761 57.745m142.058 84.61h40.808v-163.024h-40.808zm98.137-60.809c0 10.394 1.358 18.322 4.07 23.77 2.717 5.456 7.268 8.18 13.667 8.18 6.332 0 10.809-2.724 13.418-8.18 2.608-5.448 3.906-13.376 3.906-23.77 0-10.34-1.318-18.139-3.96-23.403-2.65-5.28-7.168-7.922-13.574-7.922-6.264 0-10.74 2.63-13.458 7.86-2.71 5.238-4.07 13.057-4.07 23.465m76.597 0c0 19.803-5.19 35.252-15.598 46.325-10.4 11.08-24.959 16.624-43.675 16.624-17.948 0-32.235-5.666-42.84-16.998-10.618-11.331-15.924-26.644-15.924-45.95 0-19.743 5.198-35.083 15.605-46.02 10.407-10.938 25-16.406 43.79-16.406 11.611 0 21.883 2.534 30.782 7.595 8.906 5.06 15.782 12.31 20.612 21.753 4.837 9.429 7.248 20.462 7.248 33.077m16.207 60.809h40.815v-121.094h-40.815zm-.002-135.742h40.816v-27.288h-40.816zm123.507 104.856c5.51 0 12.072-1.4 19.728-4.178v30.469c-5.503 2.418-10.734 4.15-15.707 5.176-4.972 1.04-10.808 1.556-17.486 1.556-13.703 0-23.58-3.444-29.647-10.32-6.04-6.874-9.069-17.431-9.069-31.677v-49.92h-14.294v-31.303h14.294v-30.925l41.128-7.153v38.077h26.04v31.305h-26.04v47.133c0 7.84 3.689 11.76 11.053 11.76m94.461 0c5.51 0 12.073-1.4 19.729-4.178v30.469c-5.496 2.418-10.734 4.15-15.707 5.176-4.98 1.04-10.794 1.556-17.486 1.556-13.702 0-23.58-3.444-29.634-10.32-6.052-6.874-9.082-17.431-9.082-31.677v-49.92h-14.3v-31.303h14.3v-31.393l41.12-6.685v38.077h26.054v31.305h-26.053v47.133c0 7.84 3.689 11.76 11.06 11.76m71.227-44.675c.557-6.63 2.453-11.488 5.686-14.592 3.248-3.098 7.256-4.647 12.052-4.647 5.231 0 9.389 1.739 12.473 5.244 3.104 3.485 4.721 8.153 4.85 13.995zm57.555-33.397c-9.702-9.51-23.465-14.273-41.27-14.273-18.717 0-33.12 5.469-43.215 16.406-10.088 10.938-15.135 26.63-15.135 47.08 0 19.802 5.455 35.074 16.338 45.794 10.89 10.72 26.182 16.087 45.876 16.087 9.457 0 17.596-.645 24.416-1.929 6.78-1.27 13.343-3.567 19.709-6.882l-6.271-27.29c-4.626 1.89-9.028 3.343-13.186 4.3-6.005 1.394-12.595 2.093-19.77 2.093-7.866 0-14.075-1.922-18.627-5.767-4.552-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.558-41.094m-625.583 33.397c.557-6.63 2.453-11.488 5.686-14.592 3.24-3.098 7.255-4.647 12.059-4.647 5.217 0 9.375 1.739 12.466 5.244 3.104 3.485 4.714 8.153 4.857 13.995zm57.561-33.397c-9.708-9.51-23.465-14.273-41.277-14.273-18.723 0-33.118 5.469-43.207 16.406-10.088 10.938-15.142 26.63-15.142 47.08 0 19.802 5.448 35.074 16.345 45.794 10.883 10.72 26.175 16.087 45.87 16.087 9.456 0 17.595-.645 24.415-1.929 6.78-1.27 13.343-3.567 19.715-6.882l-6.277-27.29c-4.627 1.89-9.029 3.343-13.18 4.3-6.018 1.394-12.601 2.093-19.776 2.093-7.86 0-14.075-1.922-18.627-5.767-4.559-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.552-41.094" fill="#0f0b0b" />
            </svg>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center">
            <span className="font-black text-black text-2xl">ContentBuilder</span>
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        <Link
          href="/projects"
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'products' && selectedFolderId === null ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => onFolderSelect(null)}
        >
          <Home size={18} />
          <span>{t('interface.products', 'Products')}</span>
        </Link>
        <Link
          href="/projects?tab=smart-drive"
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'smart-drive' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => onFolderSelect(null)}
        >
          <HardDrive size={18} />
          <span>{t('interface.smartDrive', 'Smart Drive')}</span>
        </Link>
        {offersTabEnabled && (
          <Link
            href="/projects?tab=offers"
            className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'offers' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => onFolderSelect(null)}
          >
            <FileText size={18} />
            <span>{t('interface.offers', 'Offers')}</span>
          </Link>
        )}
        {aiAuditEnabled && (
          <Link
            href="/projects?tab=audits"
            className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'audits' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => onFolderSelect(null)}
          >
            <ClipboardCheck size={18} />
            <span>{t('interface.audits', 'Audits')}</span>
          </Link>
        )}
        {workspaceTabEnabled && (
          <Link
            href="/projects?tab=workspace"
            className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'workspace' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => onFolderSelect(null)}
          >
            <Users size={18} />
            <span>{t('interface.workspace', 'Workspace')}</span>
          </Link>
        )}
        {exportToLMSEnabled && (
          <Link
            href="/projects?tab=export-lms"
            className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'export-lms' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => onFolderSelect(null)}
          >
            <Upload size={18} />
            <span>{t('interface.exportToLMS', 'Export to LMS')}</span>
          </Link>
        )}
      </nav>
      <div className="mt-4">
        <div className="flex justify-between items-center text-gray-500 font-semibold mb-2">
          <span>{isSearching ? t('interface.searchResults', 'Search Results') : t('interface.recentFolders', 'Recent Folders')}</span>
          <FolderPlus size={18} className="cursor-pointer hover:text-gray-800" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))} />
        </div>
        
        {/* Folder Search Bar */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('interface.searchFolders', 'Search folders...')}
            value={folderSearch}
            onChange={(e) => setFolderSearch(e.target.value)}
            className="w-full bg-gray-50 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-200 text-gray-700 placeholder-gray-500"
          />
        </div>

        {folders.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-center transition-shadow duration-200">
            <p className="mb-2 text-gray-700 leading-relaxed">{t('interface.organizeCourses', 'Organize your courses into folders, keep them structured and work more efficiently')}</p>
            <button className="inline-flex text-blue-600 items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 hover:underline" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('interface.createFirstFolder', 'Create First Folder')}
            </button>
          </div>
        ) : filteredFolders.length === 0 ? (
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-gray-500 text-xs">{t('interface.noFoldersFound', 'No folders found')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredFolders.map((folder) => (
              <div key={folder.id} className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all duration-200 border border-transparent hover:bg-gray-100 text-gray-800">
                <span className="text-sm">{folder.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1 mt-auto">
        {eventPostersEnabled && (
          <Link href="/create/event-poster/questionnaire" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Presentation size={18} />
            <span>{t('interface.eventPoster', 'Event Poster')}</span>
          </Link>
        )}
        <Link href="/projects?tab=trash" className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'trash' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}>
          <Trash2 size={18} />
          <span>{t('interface.trash', 'Trash')}</span>
        </Link>
      </nav>
    </aside>
  );
};

export default function BillingPage() {
  const [isAddonsModalOpen, setIsAddonsModalOpen] = useState(false);
  const [isTariffPlanModalOpen, setIsTariffPlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [billingInfo, setBillingInfo] = useState({ plan: 'starter', status: 'inactive', interval: null, priceId: null, subscriptionId: null });
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderProjects, setFolderProjects] = useState({});
  const { t } = useLanguage();
  const currentTab = 'payments';

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const res = await fetch('/api/custom-projects-backend/billing/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setBillingInfo(data);
        }
      } catch (e) {
        console.error('Failed to load billing info', e);
      }
    };
    loadBilling();
  }, []);

  const purchasedItems = [
    {
      type: 'connectors',
      name: '5 Connectors',
      amount: '5 connectors',
      price: 25,
      priceNote: 'per month',
      purchaseDate: '2025-09-10'
    },
    {
      type: 'storage',
      name: '5 GB Storage',
      amount: '5 GB storage',
      price: 150,
      priceNote: 'per month',
      purchaseDate: '2025-09-01'
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'connectors':
        return <Workflow className="w-6 h-6" />;
      case 'storage':
        return <Server className="w-6 h-6" />;
      default:
        return null;
    }
  };
  
  // Plan configuration with colors and styling - easily manageable
  const planConfig = {
    starter: {
      name: 'Starter',
      type: 'Free',
      price: '$0',
      bgGradient: 'from-slate-700 via-slate-800 to-slate-900',
      textColor: 'text-white',
      buttonTextColor: 'text-white',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonShadow: 'shadow-blue-600/30',
      isCurrent: true,
      credits: t('tariffPlan.plans.starter.credits', '200 (one-time on registration)'),
      storage: t('tariffPlan.plans.starter.storage', '1 GB'),
      support: t('tariffPlan.plans.starter.support', 'Email up to 48 hours'),
      connectors: 'None',
      collaboration: 'None',
      features: [
        t('tariffPlan.plans.starter.credits', '200 (one-time on registration)'),
        t('tariffPlan.plans.starter.storage', '1 GB'),
        t('tariffPlan.plans.starter.support', 'Email up to 48 hours'),
        'No connectors',
        'No collaboration'
      ]
    },
    pro: {
      name: 'Pro',
      type: 'Monthly',
      price: '$30',
      bgGradient: 'from-blue-400 via-blue-500 to-blue-600',
      textColor: 'text-white',
      buttonTextColor: 'text-white',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonShadow: 'shadow-blue-600/30',
      isCurrent: false,
      credits: t('tariffPlan.plans.pro.credits', '600 / month'),
      storage: t('tariffPlan.plans.pro.storage', '5 GB'),
      support: t('tariffPlan.plans.pro.support', 'Email up to 24 hours'),
      connectors: '2',
      collaboration: '1 (up to 3 participants)',
      features: [
        t('tariffPlan.plans.pro.features.0', '600 credits per month'),
        t('tariffPlan.plans.pro.features.1', '5 GB storage'),
        t('tariffPlan.plans.pro.support', 'Email up to 24 hours'),
        t('tariffPlan.plans.pro.features.3', '2 platform connectors'),
        t('tariffPlan.plans.pro.features.4', 'Team collaboration (up to 3)')
      ]
    },
    business: {
      name: 'Business',
      type: 'Monthly',
      price: '$90',
      bgGradient: 'from-blue-500 via-blue-600 to-blue-700',
      textColor: 'text-white',
      buttonTextColor: 'text-blue-700',
      buttonColor: 'bg-blue-300 hover:bg-blue-400',
      buttonShadow: 'shadow-blue-300/30',
      isCurrent: false,
      credits: t('tariffPlan.plans.business.credits', '2,000 / month'),
      storage: t('tariffPlan.plans.business.storage', '10 GB'),
      support: t('tariffPlan.plans.business.support', 'Priority support'),
      connectors: '5',
      collaboration: t('tariffPlan.plans.business.collaboration', '3 (up to 10 participants)'),
      features: [
        t('tariffPlan.plans.business.features.0', '2,000 credits per month'),
        t('tariffPlan.plans.business.features.1', '10 GB storage'),
        t('tariffPlan.plans.business.features.2', 'Priority support'),
        t('tariffPlan.plans.business.features.3', '5 platform connectors'),
        t('tariffPlan.plans.business.features.4', 'Team collaboration (up to 10)')
      ]
    },
    enterprise: {
      name: 'Enterprise',
      type: 'Custom',
      price: 'Custom',
      bgGradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
      textColor: 'text-white',
      buttonTextColor: 'text-indigo-800',
      buttonColor: 'bg-indigo-400 hover:bg-indigo-500',
      buttonShadow: 'shadow-indigo-400/30',
      isCurrent: false,
      credits: t('tariffPlan.plans.enterprise.credits', '10,000+ / month (flexible)'),
      storage: t('tariffPlan.plans.enterprise.storage', '50 GB + pay-as-you-go'),
      support: t('tariffPlan.plans.enterprise.support', 'Dedicated manager'),
      connectors: t('tariffPlan.plans.enterprise.connectors', 'All'),
      collaboration: t('tariffPlan.plans.enterprise.collaboration', 'Unlimited'),
      features: [
        t('tariffPlan.plans.enterprise.features.0', 'Custom credit allocation'),
        t('tariffPlan.plans.enterprise.features.1', 'Unlimited storage'),
        t('tariffPlan.plans.enterprise.features.2', 'Dedicated account manager'),
        t('tariffPlan.plans.enterprise.features.3', 'All platform connectors'),
        t('tariffPlan.plans.enterprise.features.4', 'Unlimited team collaboration'),
        t('tariffPlan.plans.enterprise.features.5', 'Custom features & integrations')
      ]
    }
  };

  // Current plan (dynamically determined by isCurrent property)
  const currentPlan = (() => {
    const key = (billingInfo.plan || 'starter').toLowerCase();
    if (key.includes('business')) return planConfig.business;
    if (key.includes('pro')) return planConfig.pro;
    if (key.includes('enterprise')) return planConfig.enterprise;
    return planConfig.starter;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 w-full">
      <Sidebar currentTab={currentTab} onFolderSelect={setSelectedFolderId} selectedFolderId={selectedFolderId} folders={folders} folderProjects={folderProjects} />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-slate-900">{t('interface.billingAndSubscription', 'Billing and subscription')}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Current Plan Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Current Plan</span>
                </div>

                <h2 className="text-5xl font-bold mb-2">{currentPlan.name}</h2>
                <p className="text-2xl text-blue-100 mb-8">{currentPlan.type}</p>

                <button 
                  onClick={() => setIsTariffPlanModalOpen(true)}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 rounded-lg transition-colors mb-8"
                >
                  {currentPlan.type === 'Free' ? 'Upgrade Plan' : 'Switch to annual and save 20%'}
                </button>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200 mb-4">
                    What's Included
                  </h3>
                  <ul className="space-y-3">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-blue-50">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Your Add-ons */}
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Your Add-ons
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {purchasedItems.map((item, index) => (
                      <div key={index} className="flex flex-col flex-1 min-w-0 bg-blue-50 backdrop-blur-sm text-blue-700 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3 px-6 py-4">
                          {getIcon(item.type)}
                          <span className="font-medium text-base">{item.name}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setItemToCancel(item);
                            setIsCancelModalOpen(true);
                          }}
                          className="bg-red-50 border border-red-300 text-sm text-red-600 font-medium py-1 px-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 mx-4 my-2"
                        >
                          <X className="w-5 h-5" />
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Manage Subscription */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage subscription</h2>
                <p className="text-gray-600 mb-6">
                  You can get invoices, update your payment method, and adjust your subscription in Stripe
                </p>

                <button 
                  disabled={!billingInfo.subscriptionId || portalLoading}
                  onClick={async () => {
                    try {
                      setPortalLoading(true);
                      const res = await fetch('/api/custom-projects-backend/billing/portal', { method: 'POST', credentials: 'same-origin' });
                      if (!res.ok) throw new Error('Failed to create portal session');
                      const data = await res.json();
                      if (data?.url) window.location.href = data.url;
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setPortalLoading(false);
                    }
                  }}
                  className={`w-full bg-white border ${billingInfo.subscriptionId ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'} font-medium py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center gap-2`}
                >
                  {portalLoading ? 'Opening...' : 'Manage subscription in Stripe'}
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => {
                    setItemToCancel({ type: 'subscription', name: currentPlan.name, amount: 'Full subscription' });
                    setIsCancelModalOpen(true);
                  }}
                  className="w-full bg-white border border-red-300 text-red-600 font-medium py-3 px-4 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddOnsModal
        isOpen={isAddonsModalOpen}
        onClose={() => setIsAddonsModalOpen(false)}
      />

      <TariffPlanModal
        open={isTariffPlanModalOpen}
        onOpenChange={setIsTariffPlanModalOpen}
      />

      {/* Cancel Subscription Confirmation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCancelModalOpen(false);
          setItemToCancel(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              Cancel {itemToCancel?.type === 'subscription' ? 'Subscription' : 'Add-on'}
            </DialogTitle>
          </DialogHeader>
          
          {itemToCancel && (
            <>
              {/* Item Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {getIcon(itemToCancel.type)}
                  <span className="font-medium text-gray-900">{itemToCancel.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {itemToCancel.type === 'subscription' ? (
                    <>
                      <p>Current Plan: {currentPlan.name}</p>
                      <p>Price: {currentPlan.price}</p>
                    </>
                  ) : (
                    <>
                      <p>Amount: {itemToCancel.amount}</p>
                      <p>Price: ${itemToCancel.price}/month</p>
                      <p>Purchased: {itemToCancel.purchaseDate}</p>
                    </>
                  )}
                </div>
              </div>
              
              <DialogDescription>
                Are you sure you want to cancel this {itemToCancel.type === 'subscription' ? 'subscription' : 'add-on'}? This action will:
              </DialogDescription>
              
              <ul className="space-y-2 text-sm text-gray-600">
                {itemToCancel.type === 'subscription' ? (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      End your current plan immediately
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Remove access to premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      You can reactivate anytime
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Remove {itemToCancel.name} subscription from your account
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Stop billing for this add-on
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      You can re-add it anytime
                    </li>
                  </>
                )}
              </ul>
            </>
          )}
          
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelModalOpen(false);
                setItemToCancel(null);
              }}
              className="flex-1"
            >
              Keep {itemToCancel?.type === 'subscription' ? 'Subscription' : 'Add-on'}
            </Button>
            <Button
              variant="download"
              disabled={cancelLoading}
              onClick={async () => {
                if (itemToCancel?.type !== 'subscription') return;
                try {
                  setCancelLoading(true);
                  const res = await fetch('/api/custom-projects-backend/billing/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ subscriptionId: billingInfo.subscriptionId })
                  });
                  if (!res.ok) throw new Error('Cancel failed');
                  setIsCancelModalOpen(false);
                  setItemToCancel(null);
                  // Refresh billing info
                  const refreshed = await fetch('/api/custom-projects-backend/billing/me', { credentials: 'same-origin' });
                  if (refreshed.ok) setBillingInfo(await refreshed.json());
                } catch (e) {
                  console.error(e);
                } finally {
                  setCancelLoading(false);
                }
              }}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500"
            >
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
