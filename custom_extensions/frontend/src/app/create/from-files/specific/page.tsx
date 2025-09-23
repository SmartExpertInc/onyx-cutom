"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Search, FileText, Upload, Globe, Settings, Plus, FolderOpen, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SmartDriveFrame from '../../../../components/SmartDrive/SmartDriveFrame';
import SmartDriveBrowser from '../../../../components/SmartDrive/SmartDrive/SmartDriveBrowser';
import { Input } from '@/components/ui/input';
import { ConnectorCard } from '@/components/ui/connector-card';
import { Button } from '@/components/ui/button';
import { HeadTextCustom } from '@/components/ui/head-text-custom';

interface Connector {
  id: number;
  name: string;
  source: string;
  status: 'active' | 'paused' | 'error' | 'syncing' | 'unknown';
  last_sync_at?: string;
  total_docs_indexed: number;
  last_error?: string;
  access_type: string;
}

// Comprehensive connector icon mapping (same as SmartDrive tab)
const connectorIcons: Record<string, string> = {
  // Cloud Storage
  google_drive: '/GoogleDrive.png',
  dropbox: '/Dropbox.png',
  s3: '/S3.png',
  r2: '/r2.png',
  google_cloud_storage: '/GoogleCloudStorage.png',
  oci_storage: '/OCI.svg',
  sharepoint: '/Sharepoint.png',
  egnyte: '/Egnyte.png',
  // Communication & Messaging
  slack: '/Slack.png',
  discord: '/discord.png',
  teams: '/Teams.png',
  gmail: '/Gmail.png',
  zulip: '/Zulip.png',
  // Productivity & Collaboration
  notion: '/Notion.png',
  confluence: '/Confluence.svg',
  onedrive: '/OneDrive.png',
  google_site: '/GoogleSites.svg',
  slab: '/Slab.svg',
  // Development & Code
  github: '/Github.png',
  gitlab: '/Gitlab.png',
  // Project Management
  jira: '/Jira.svg',
  linear: '/Linear.svg',
  clickup: '/Clickup.png',
  asana: '/Asana.svg',
  // Customer Support
  zendesk: '/Zendesk.svg',
  freshdesk: '/Freshdesk.png',
  intercom: '/Intercom.svg',
  // Sales & CRM
  salesforce: '/Salesforce.png',
  hubspot: '/HubSpot.png',
  // Knowledge Management
  guru: '/Guru.svg',
  document360: '/Document360.svg',
  gitbook: '/Gitbook.svg',
  bookstack: '/BookStack.svg',
  // Data & Analytics
  airtable: '/Airtable.svg',
  // Media & Communication
  gong: '/Gong.png',
  fireflies: '/Fireflies.ai.svg',
  // Other
  web: '/Web.svg',
  file: '/File.svg',
  axero: '/Axero.svg',
  discourse: '/Discourse.svg',
  mediawiki: '/MediaWiki.svg',
  requesttracker: '/RequestTracker.svg',
  xenforo: '/XenForo.svg',
  wikipedia: '/Wikipedia.svg',
  productboard: '/Productboard.svg',
  highspot: '/Highspot.svg',
  loopio: '/Loopio.png',
  // Fallback for unknown connectors
  default: '/file.svg'
};

export default function CreateFromSpecificFilesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnectors, setSelectedConnectors] = useState<number[]>([]);
  const [connectorSelectionValid, setConnectorSelectionValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFileBrowser, setShowFileBrowser] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Load connectors from the backend API
  const loadConnectors = async () => {
    try {
      setLoading(true);
      
      // Fetch real connector data from the API
      const response = await fetch('/api/manage/admin/connector/status', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connectors: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('[CreateFromSpecificFiles DEBUG] Raw connector data from API:', data);
      
      // Filter only private connectors (created via Smart Drive) - using SmartDrive tab structure
      const privateConnectors = data
        .filter((connectorStatus: any) => connectorStatus.access_type === 'private')
        .map((connectorStatus: any) => ({
          id: connectorStatus.cc_pair_id, // IMPORTANT: Use cc_pair_id like SmartDrive tab
          name: connectorStatus.name || `Connector ${connectorStatus.cc_pair_id}`,
          source: connectorStatus.connector.source, // IMPORTANT: Nested source like SmartDrive tab
          status: connectorStatus.connector.status || 'unknown',
          last_sync_at: connectorStatus.last_sync_at,
          total_docs_indexed: connectorStatus.total_docs_indexed || 0,
          last_error: connectorStatus.last_error,
          access_type: connectorStatus.access_type
        }));
      
      console.log('[CreateFromSpecificFiles DEBUG] Filtered private connectors:', privateConnectors);
      
      setConnectors(privateConnectors);
    } catch (error) {
      console.error('Failed to load connectors:', error);
      // Set empty array on error instead of falling back to mock data
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user connectors on component mount
  useEffect(() => {
    loadConnectors();
  }, []);

  // Validate connector and file selection - allow connectors OR files OR both
  useEffect(() => {
    setConnectorSelectionValid(selectedConnectors.length > 0 || selectedFiles.length > 0);
  }, [selectedConnectors, selectedFiles]);

  // Handle file selection from SmartDrive iframe
  const handleFilesSelected = (files: string[]) => {
    console.log('[CreateFromSpecificFiles DEBUG] handleFilesSelected called with:', {
      fileCount: files.length,
      files: files,
      previousSelectedFiles: selectedFiles.length,
      timestamp: new Date().toISOString()
    });
    
    setSelectedFiles(files);
    
    console.log('[CreateFromSpecificFiles DEBUG] selectedFiles state updated');
  };

  const handleConnectorToggle = (connectorId: number) => {
    console.log('[CreateFromSpecificFiles DEBUG] Toggling connector:', connectorId);
    console.log('[CreateFromSpecificFiles DEBUG] Available connectors:', connectors.map(c => ({ id: c.id, name: c.name, source: c.source })));
    
    setSelectedConnectors(prev => {
      const isSelected = prev.includes(connectorId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== connectorId)
        : [...prev, connectorId];
      
      console.log('[CreateFromSpecificFiles DEBUG] Connector selection changed:', {
        connectorId,
        wasSelected: isSelected,
        previousSelection: prev,
        newSelection
      });
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedConnectors.length === connectors.length) {
      setSelectedConnectors([]);
    } else {
      setSelectedConnectors(connectors.map(c => c.id));
    }
  };

  const filteredConnectors = connectors.filter(connector =>
    connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connector.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContent = () => {
    // DEBUG: Log current state
    console.log('[CreateFromSpecificFiles DEBUG] handleCreateContent called with:', {
      selectedConnectors,
      selectedFiles,
      connectorsData: connectors.map(c => ({ id: c.id, name: c.name, source: c.source })),
      hasConnectors: selectedConnectors.length > 0,
      hasFiles: selectedFiles.length > 0
    });

    // Require at least one selection (connectors OR files OR both)
    if (selectedConnectors.length === 0 && selectedFiles.length === 0) {
      console.log('[CreateFromSpecificFiles DEBUG] No selection - returning');
      return;
    }

    // Determine the generation mode
    const hasConnectors = selectedConnectors.length > 0;
    const hasFiles = selectedFiles.length > 0;

    console.log('[CreateFromSpecificFiles DEBUG] Generation mode:', { hasConnectors, hasFiles });

    // Construct flexible context based on what's selected
    const combinedContext: any = {
      timestamp: Date.now()
    };

    const searchParams = new URLSearchParams();

    if (hasConnectors && hasFiles) {
      // Both connectors and files selected
      console.log('[CreateFromSpecificFiles DEBUG] Processing both connectors and files');
      combinedContext.fromConnectors = true;
      combinedContext.connectorIds = selectedConnectors;
      
      // Debug connector mapping
      console.log('[CreateFromSpecificFiles DEBUG] Mapping connectors:', selectedConnectors);
      combinedContext.connectorSources = selectedConnectors.map(id => {
        const connector = connectors.find(c => c.id === id);
        console.log(`[CreateFromSpecificFiles DEBUG] Mapping ID ${id}:`, connector ? { id: connector.id, source: connector.source } : 'NOT FOUND');
        return connector?.source || 'unknown';
      });
      console.log('[CreateFromSpecificFiles DEBUG] Final connector sources:', combinedContext.connectorSources);
      
      combinedContext.selectedFiles = selectedFiles;
      
      searchParams.set('fromConnectors', 'true');
      searchParams.set('connectorIds', selectedConnectors.join(','));
      searchParams.set('connectorSources', combinedContext.connectorSources.join(','));
      searchParams.set('selectedFiles', selectedFiles.join(','));
    } else if (hasConnectors) {
      // Only connectors selected
      console.log('[CreateFromSpecificFiles DEBUG] Processing connectors only');
      combinedContext.fromConnectors = true;
      combinedContext.connectorIds = selectedConnectors;
      
      // Debug connector mapping
      console.log('[CreateFromSpecificFiles DEBUG] Mapping connectors:', selectedConnectors);
      combinedContext.connectorSources = selectedConnectors.map(id => {
        const connector = connectors.find(c => c.id === id);
        console.log(`[CreateFromSpecificFiles DEBUG] Mapping ID ${id}:`, connector ? { id: connector.id, source: connector.source } : 'NOT FOUND');
        return connector?.source || 'unknown';
      });
      console.log('[CreateFromSpecificFiles DEBUG] Final connector sources:', combinedContext.connectorSources);
      
      searchParams.set('fromConnectors', 'true');
      searchParams.set('connectorIds', selectedConnectors.join(','));
      searchParams.set('connectorSources', combinedContext.connectorSources.join(','));
    } else if (hasFiles) {
      // Only files selected (from SmartDrive)
      combinedContext.fromConnectors = true; // Still use connector flow since files come from SmartDrive
      combinedContext.selectedFiles = selectedFiles;
      combinedContext.connectorIds = []; // Empty connector list
      combinedContext.connectorSources = [];
      
      searchParams.set('fromConnectors', 'true');
      searchParams.set('selectedFiles', selectedFiles.join(','));
    }

    // Store in sessionStorage for the generate page
    console.log('[CreateFromSpecificFiles DEBUG] Final combinedContext:', combinedContext);
    console.log('[CreateFromSpecificFiles DEBUG] Final URL params:', searchParams.toString());
    
    sessionStorage.setItem('combinedContext', JSON.stringify(combinedContext));
    
    const finalUrl = `/create/generate?${searchParams.toString()}`;
    console.log('[CreateFromSpecificFiles DEBUG] Redirecting to:', finalUrl);
    
    router.push(finalUrl);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'syncing': return '🟡';
      case 'error': return '🔴';
      case 'paused': return '⏸️';
      case 'unknown': return '❓';
      default: return '❓';
    }
  };

  const getConnectorIcon = (source: string) => {
    return connectorIcons[source] || connectorIcons.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#00BBFF66]/40 to-[#00BBFF66]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('interface.loadingConnectors', 'Loading connectors...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#00BBFF66]/40 to-[#00BBFF66]/10 min-h-screen font-sans">
      {/* Header */}
      <header className="relative flex items-center justify-center p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="absolute left-8 top-1/2 -mt-10  transform -translate-y-1/2 flex items-center gap-4">
          <Button
            variant="back"
          >
            <Link
              href="/create"
              className="group flex items-center gap-3 px-4 py-2.5"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              {t('interface.back', 'Back')}
            </Link>
          </Button>
        </div>
        <HeadTextCustom
          text={t('interface.fromFiles.createFromSpecificFiles', 'Create from Specific Files')}
          textSize="text-2xl sm:text-3xl"
          className="text-center"
        />
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="space-y-8">
          {/* Smart Drive Browser Section */}
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Upload className="w-10 h-10 text-blue-600" />
                <div>
                    <h2 className="text-xl font-bold text-blue-600">{t('interface.smartDriveBrowser', 'Smart Drive Browser')}</h2>
                    <p className="text-sm text-gray-600 mt-1">{t('interface.browseAndSelectFiles', 'Browse and select files from your cloud storage')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFileBrowser(!showFileBrowser)}
                  className={`group p-2.5 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    showFileBrowser 
                      ? 'bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                  title={showFileBrowser ? t('interface.hideBrowser', 'Hide Browser') : t('interface.showBrowser', 'Show Browser')}
                >
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
              
              {showFileBrowser && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {process.env.NEXT_PUBLIC_SMARTDRIVE_NATIVE_UI_ENABLED === 'true' ? (
                    <SmartDriveBrowser mode="select" onFilesSelected={handleFilesSelected} />
                  ) : (
                    <SmartDriveFrame 
                      onFilesSelected={handleFilesSelected}
                      selectedFiles={selectedFiles}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Connector Selection Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center"> */}
                  <Settings className="w-10 h-10 text-blue-600" />
                {/* </div> */}
                <div>
                  <h3 className="text-xl font-bold text-blue-600">{t('interface.selectConnectors', 'Select Connectors')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('interface.chooseDataSources', 'Choose data sources to include in your content')}</p>
                </div>
              </div>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {selectedConnectors.length === connectors.length ? t('interface.deselectAll', 'Deselect All') : t('interface.selectAll', 'Select All')}
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  variant="shadow"
                  type="text"
                  placeholder={t('interface.searchConnectors', 'Search connectors...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                />
              </div>
            </div>

            {/* Connectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredConnectors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">
                    {searchTerm ? t('interface.noConnectorsFound', 'No connectors found matching your search.') : t('interface.noConnectorsAvailable', 'No connectors available.')}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm ? t('interface.tryAdjustingSearch', 'Try adjusting your search terms.') : t('interface.connectFirstDataSource', 'Connect your first data source to get started.')}
                  </p>
                </div>
              ) : (
                filteredConnectors.map((connector, index) => {
                  // Different gradient colors for different connectors
                  const getConnectorGradient = (source: string) => {
                    // Map specific connector sources to specific gradients for consistency
                    const connectorGradients: Record<string, { from: string; to: string }> = {
                      'google_drive': { from: 'orange-300', to: 'amber-200' },      // orange for Google Drive
                      'dropbox': { from: 'blue-300', to: 'indigo-200' },            // Blue for Dropbox
                      'notion': { from: 'purple-300', to: 'pink-200' },             // Purple for Notion
                      'salesforce': { from: 'cyan-300', to: 'blue-200' },           // Cyan for Salesforce
                      'slack': { from: 'violet-300', to: 'purple-200' },            // Violet for Slack
                      'github': { from: 'gray-300', to: 'slate-200' },              // Gray for GitHub
                      'confluence': { from: 'green-300', to: 'emerald-200' },        // Orange for Confluence
                      'sharepoint': { from: 'teal-300', to: 'cyan-200' },           // Teal for SharePoint
                      'onedrive': { from: 'indigo-300', to: 'blue-200' },           // Indigo for OneDrive
                      'box': { from: 'yellow-300', to: 'orange-200' },              // Yellow for Box
                      'gmail': { from: 'red-300', to: 'rose-200' },                 // Red for Gmail
                      'outlook': { from: 'pink-300', to: 'rose-200' }               // Pink for Outlook
                    };
                    
                    // Return specific gradient for known connectors, or fallback to index-based selection
                    return connectorGradients[source] || {
                      from: ['blue-300', 'purple-300', 'green-300', 'orange-300', 'red-300', 'teal-300'][source.length % 6],
                      to: ['indigo-200', 'pink-200', 'emerald-200', 'amber-200', 'rose-200', 'cyan-200'][source.length % 6]
                    };
                  };

                  const getTextColorFromGradient = (gradientColors: { from: string; to: string }) => {
                    // Map gradient colors to their darker text equivalents
                    const colorMap: Record<string, string> = {
                      'orange-300': 'orange-700',
                      'blue-300': 'blue-700',
                      'purple-300': 'purple-700',
                      'cyan-300': 'cyan-700',
                      'violet-300': 'violet-700',
                      'gray-300': 'gray-700',
                      'green-300': 'green-700',
                      'teal-300': 'teal-700',
                      'indigo-300': 'indigo-700',
                      'yellow-300': 'yellow-700',
                      'red-300': 'red-700',
                      'pink-300': 'pink-700'
                    };
                    return colorMap[gradientColors.from] || 'gray-700';
                  };

                  const connectorGradient = getConnectorGradient(connector.source);
                  const textColor = getTextColorFromGradient(connectorGradient);
                  
                  return (
                    <ConnectorCard
                      key={connector.id}
                      title={connector.name}
                      value={connector.source}
                      iconSrc={getConnectorIcon(connector.source)}
                      gradientColors={connectorGradient}
                      textColor={textColor}
                      iconColor="gray-600"
                      selectable={true}
                      isSelected={selectedConnectors.includes(connector.id)}
                      onSelect={() => handleConnectorToggle(connector.id)}
                      showHoverEffect={true}
                      hoverGradientColors={{ from: 'blue-500', to: 'purple-500' }}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Create Content Button */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
              <button
                onClick={handleCreateContent}
                disabled={!connectorSelectionValid}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                  !connectorSelectionValid
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  {connectorSelectionValid 
                    ? selectedConnectors.length > 0 && selectedFiles.length > 0
                      ? t('interface.createContentFromConnectors', 'Create Content from {count} Connector{s} & {fileCount} File{s}')
                          .replace('{count}', selectedConnectors.length.toString())
                          .replace('{s}', selectedConnectors.length !== 1 ? 's' : '')
                          .replace('{fileCount}', selectedFiles.length.toString())
                          .replace('{s}', selectedFiles.length !== 1 ? 's' : '')
                      : selectedConnectors.length > 0 
                        ? t('interface.createContentFromConnectorsOnly', 'Create Content from {count} Connector{s}')
                        .replace('{count}', selectedConnectors.length.toString())
                        .replace('{s}', selectedConnectors.length !== 1 ? 's' : '')
                        : t('interface.createContentFromFilesOnly', 'Create Content from {count} File{s}')
                            .replace('{count}', selectedFiles.length.toString())
                            .replace('{s}', selectedFiles.length !== 1 ? 's' : '')
                    : t('interface.selectConnectorsOrFilesToContinue', 'Select Connectors or Files to Continue')
                  }
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 