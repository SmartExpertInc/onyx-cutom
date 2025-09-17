"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Search, FileText, Upload, Globe, Settings, Plus, FolderOpen, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SmartDriveFrame from '../../../../components/SmartDrive/SmartDriveFrame';
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

// Connector icon mapping based on source
const connectorIcons: Record<string, string> = {
  google_drive: '/GoogleDrive.png',
  dropbox: '/Dropbox.png',
  notion: '/Notion.png',
  slack: '/Slack.png',
  github: '/Github.png',
  confluence: '/Confluence.svg',
  sharepoint: '/Sharepoint.png',
  onedrive: '/OneDrive.png',
  s3: '/S3.png',
  gmail: '/Gmail.png',
  teams: '/Teams.png',
  zendesk: '/Zendesk.svg',
  salesforce: '/Salesforce.png',
  hubspot: '/HubSpot.png',
  jira: '/Jira.svg',
  gitlab: '/Gitlab.png',
  discord: '/discord.png',
  airtable: '/Airtable.svg',
  // Fallback for unknown connectors
  default: '/file.svg'
};

// Mock connector data for demonstration
const mockConnectors: Connector[] = [
  {
    id: 1,
    name: 'Google Drive - Personal',
    source: 'google_drive',
    status: 'active',
    total_docs_indexed: 1247,
    access_type: 'private'
  },
  {
    id: 2,
    name: 'Dropbox - Work Files',
    source: 'dropbox',
    status: 'active',
    total_docs_indexed: 892,
    access_type: 'private'
  },
  {
    id: 3,
    name: 'Notion - Documentation',
    source: 'notion',
    status: 'syncing',
    total_docs_indexed: 156,
    access_type: 'private'
  },
  {
    id: 4,
    name: 'Salesforce - CRM Data',
    source: 'salesforce',
    status: 'active',
    total_docs_indexed: 823,
    access_type: 'private'
  }
];

export default function CreateFromSpecificFilesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnectors, setSelectedConnectors] = useState<number[]>([]);
  const [connectorSelectionValid, setConnectorSelectionValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFileBrowser, setShowFileBrowser] = useState(true); // Changed to true to open by default
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Load connectors from the backend API
  const loadConnectors = async () => {
    try {
      setLoading(true);
      // For now, always use mock data
      setConnectors(mockConnectors);
    } catch (error) {
      console.error('Failed to load connectors:', error);
      // Fallback to mock data
      setConnectors(mockConnectors);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user connectors on component mount
  useEffect(() => {
    loadConnectors();
  }, []);

  // Validate connector selection
  useEffect(() => {
    setConnectorSelectionValid(selectedConnectors.length > 0);
  }, [selectedConnectors]);

  const handleConnectorToggle = (connectorId: number) => {
    setSelectedConnectors(prev => 
      prev.includes(connectorId) 
        ? prev.filter(id => id !== connectorId)
        : [...prev, connectorId]
    );
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
    if (selectedConnectors.length === 0) {
      return;
    }

    // Construct connector context
    const connectorContext = {
      fromConnectors: true,
      connectorIds: selectedConnectors,
      connectorSources: selectedConnectors.map(id => {
        const connector = connectors.find(c => c.id === id);
        return connector?.source || 'unknown';
      }),
      timestamp: Date.now() // Add timestamp for data freshness validation
    };

    // Store in sessionStorage for the generate page
    sessionStorage.setItem('connectorContext', JSON.stringify(connectorContext));

    // Redirect to generate page with connector information
    const searchParams = new URLSearchParams();
    searchParams.set('fromConnectors', 'true');
    searchParams.set('connectorIds', selectedConnectors.join(','));
    searchParams.set('connectorSources', connectorContext.connectorSources.join(','));
    
    router.push(`/create/generate?${searchParams.toString()}`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('interface.loadingConnectors', 'Loading connectors...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
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
        />
        <div className="w-24"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="space-y-8">
          {/* Smart Drive Browser Section */}
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('interface.smartDriveBrowser', 'Smart Drive Browser')}</h2>
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
                  <SmartDriveFrame />
                </div>
              )}
            </div>
          </div>

          {/* Connector Selection Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('interface.selectConnectors', 'Select Connectors')}</h3>
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
                      'google_drive': { from: 'green-300', to: 'emerald-200' },      // Green for Google Drive
                      'dropbox': { from: 'blue-300', to: 'indigo-200' },            // Blue for Dropbox
                      'notion': { from: 'purple-300', to: 'pink-200' },             // Purple for Notion
                      'salesforce': { from: 'cyan-300', to: 'blue-200' },           // Cyan for Salesforce
                      'slack': { from: 'violet-300', to: 'purple-200' },            // Violet for Slack
                      'github': { from: 'gray-300', to: 'slate-200' },              // Gray for GitHub
                      'confluence': { from: 'orange-300', to: 'amber-200' },        // Orange for Confluence
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

                  const connectorGradient = getConnectorGradient(connector.source);
                  
                  return (
                    <ConnectorCard
                      key={connector.id}
                      title={connector.name}
                      value={connector.source}
                      iconSrc={getConnectorIcon(connector.source)}
                      gradientColors={connectorGradient}
                      textColor="gray-900"
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

          {/* Content Creation Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-white to-purple-100 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('interface.contentCreation', 'Content Creation')}</h3>
                  <p className="text-sm text-purple-600">{t('interface.transformFilesToContent', 'Transform your files into AI-powered content')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('interface.selectedConnectors', 'Selected Connectors')}</p>
                      <p className="text-xs text-gray-500">
                        {selectedConnectors.length} {t('interface.connector', 'connector')}{selectedConnectors.length !== 1 ? 's' : ''} {t('interface.selected', 'selected')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      {selectedConnectors.length} {selectedConnectors.length === 1 ? t('interface.connector', 'connector') : t('interface.connectorPlural', 'connectors')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('interface.selectedFiles', 'Selected Files')}</p>
                      <p className="text-xs text-gray-500">{t('interface.filesFromSmartDrive', 'Files from Smart Drive')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {selectedFiles.length} {selectedFiles.length === 1 ? t('interface.file', 'file') : t('interface.filePlural', 'files')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Content Button */}
              <div className="mt-6">
                <div className="flex justify-center">
                  <Button
                    variant="create"
                    onClick={handleCreateContent}
                    disabled={!connectorSelectionValid}
                    className={`w-3/5 ${
                      !connectorSelectionValid
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      {connectorSelectionValid 
                        ? t('interface.createContentFromConnectors', 'Create Content from {count} Selected Connector{s}')
                            .replace('{count}', selectedConnectors.length.toString())
                            .replace('{s}', selectedConnectors.length !== 1 ? 's' : '')
                        : t('interface.selectConnectorsToContinue', 'Select Connectors to Continue')
                      }
                    </div>
                  </Button>
                </div>
              </div>Button
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 