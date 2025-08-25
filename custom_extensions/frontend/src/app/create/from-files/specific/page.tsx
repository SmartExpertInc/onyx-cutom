"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Search, FileText, Upload, Globe, Settings, Plus, FolderOpen, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SmartDriveFrame from '../../../../components/SmartDrive/SmartDriveFrame';

interface Connector {
  id: number;
  name: string;
  source: string;
  status: 'active' | 'paused' | 'error' | 'syncing';
  total_docs_indexed: number;
  access_type: string;
}

export default function CreateFromSpecificFilesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnectors, setSelectedConnectors] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Fetch user connectors on component mount
  useEffect(() => {
    const fetchConnectors = async () => {
      try {
        const response = await fetch('/api/custom-projects-backend/connectors', {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const data = await response.json();
          // Filter to only show private connectors (Smart Drive connectors)
          const privateConnectors = data.filter((connector: Connector) => 
            connector.access_type === 'private'
          );
          setConnectors(privateConnectors);
        }
      } catch (error) {
        console.error('Failed to fetch connectors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectors();
  }, []);

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
    // TODO: Implement backend functionality
    console.log('Creating content from selected connectors:', selectedConnectors);
    console.log('Selected files:', selectedFiles);
    // For now, just show an alert
    alert(t('interface.contentCreationNotImplemented', 'Content creation functionality will be implemented in the backend'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                    <h2 className="text-xl font-bold text-gray-900">Smart Drive Browser</h2>
                    <p className="text-sm text-gray-600 mt-1">Browse and select files from your cloud storage</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFileBrowser(!showFileBrowser)}
                  className="group p-2.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200 hover:shadow-md"
                  title={showFileBrowser ? "Hide Browser" : "Show Browser"}
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
                  <p className="text-sm text-gray-600 mt-1">Choose data sources to include in your content</p>
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
                    {searchTerm ? 'Try adjusting your search terms.' : 'Connect your first data source to get started.'}
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
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
                          {connector.status}
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
                  <h3 className="text-xl font-bold text-gray-900">Content Creation</h3>
                  <p className="text-sm text-purple-600">Transform your files into AI-powered content</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Selected Connectors</p>
                      <p className="text-xs text-gray-500">{selectedConnectors.length} connector{selectedConnectors.length !== 1 ? 's' : ''} selected</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedConnectors.length} {selectedConnectors.length === 1 ? 'connector' : 'connectors'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Selected Files</p>
                      <p className="text-xs text-gray-500">Files from Smart Drive</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Content Button */}
              <div className="mt-6">
                <button
                  onClick={handleCreateContent}
                  disabled={selectedConnectors.length === 0 && selectedFiles.length === 0}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                    selectedConnectors.length === 0 && selectedFiles.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    {t('interface.createContentFromSelected', 'Create Content from {count} Selected Source{s}')
                      .replace('{count}', (selectedConnectors.length + selectedFiles.length).toString())
                      .replace('{s}', (selectedConnectors.length + selectedFiles.length) !== 1 ? 's' : '')}
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