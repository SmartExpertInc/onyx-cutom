"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Search, FileText, Upload, Globe, Settings, Plus, FolderOpen, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SmartDriveFrame from '../../../../components/SmartDrive/SmartDriveFrame';

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
    name: 'Slack - Team Communications',
    source: 'slack',
    status: 'active',
    total_docs_indexed: 2341,
    access_type: 'private'
  },
  {
    id: 5,
    name: 'GitHub - Code Repository',
    source: 'github',
    status: 'active',
    total_docs_indexed: 445,
    access_type: 'private'
  },
  {
    id: 6,
    name: 'Confluence - Knowledge Base',
    source: 'confluence',
    status: 'paused',
    total_docs_indexed: 678,
    access_type: 'private'
  },
  {
    id: 7,
    name: 'SharePoint - Company Documents',
    source: 'sharepoint',
    status: 'error',
    total_docs_indexed: 0,
    access_type: 'private'
  },
  {
    id: 8,
    name: 'HubSpot - CRM Data',
    source: 'hubspot',
    status: 'active',
    total_docs_indexed: 567,
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
      const response = await fetch('/api/manage/admin/connector/status', {
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter to only show private connectors (Smart Drive connectors)
        const privateConnectors = data
          .filter((connector: any) => connector.access_type === 'private')
          .map((connector: any) => ({
            id: connector.cc_pair_id,
            name: connector.name || `Connector ${connector.cc_pair_id}`,
            source: connector.connector.source,
            status: connector.connector.status || 'unknown',
            last_sync_at: connector.last_sync_at,
            total_docs_indexed: connector.total_docs_indexed || 0,
            last_error: connector.last_error,
            access_type: connector.access_type
          }));
        setConnectors(privateConnectors);
      } else {
        console.error('Failed to fetch connectors:', response.status);
        // Fallback to mock data if API fails
        setConnectors(mockConnectors);
      }
    } catch (error) {
      console.error('Failed to fetch connectors:', error);
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
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('interface.loadingConnectors', 'Loading connectors...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] min-h-screen font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/create/from-files"
            className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            {t('interface.fromFiles.backToCreateFromFiles', 'Back to Create from Files')}
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('interface.fromFiles.createFromSpecificFiles', 'Create from Specific Files')}
        </h1>
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
                  className="group p-2.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200 hover:shadow-md"
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
                <input
                  type="text"
                  placeholder={t('interface.searchConnectors', 'Search connectors...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
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
                filteredConnectors.map((connector) => (
                  <div
                    key={connector.id}
                    className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer ${
                      selectedConnectors.includes(connector.id)
                        ? 'border-blue-300 shadow-lg bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleConnectorToggle(connector.id)}
                  >
                    {/* Selection Indicator */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedConnectors.includes(connector.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {selectedConnectors.includes(connector.id) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>

                    {/* Connector Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                      <Image
                        src={getConnectorIcon(connector.source)}
                        alt={`${connector.name} logo`}
                        width={32}
                        height={32}
                        className="object-contain w-8 h-8"
                        priority={false}
                        unoptimized={true}
                      />
                    </div>

                    {/* Connector Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{connector.name}</h3>
                        <p className="text-sm text-gray-500">{connector.source}</p>
                      </div>

                      {/* Status and Stats */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(connector.status)}`}>
                          <span className="mr-1">{getStatusIcon(connector.status)}</span>
                          {t(`interface.connectorStatusLabels.${connector.status}`, connector.status)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {connector.total_docs_indexed} {t('interface.docs', 'docs')}
                        </span>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Content Creation Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
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
                    <p className="text-sm font-semibold text-gray-900">
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
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedFiles.length} {selectedFiles.length === 1 ? t('interface.file', 'file') : t('interface.filePlural', 'files')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Content Button */}
              <div className="mt-6">
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
                      ? t('interface.createContentFromConnectors', 'Create Content from {count} Selected Connector{s}')
                          .replace('{count}', selectedConnectors.length.toString())
                          .replace('{s}', selectedConnectors.length !== 1 ? 's' : '')
                      : t('interface.selectConnectorsToContinue', 'Select Connectors to Continue')
                    }
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 