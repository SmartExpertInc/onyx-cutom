"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Search, FileText, Upload } from 'lucide-react';
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
    // For now, just show an alert
    alert(t('interface.contentCreationNotImplemented', 'Content creation functionality will be implemented in the backend'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('interface.loadingConnectors', 'Loading connectors...')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/create/from-files"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} />
{t('interface.fromFiles.backToCreateFromFiles', 'Back to Create from Files')}
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('interface.fromFiles.createFromSpecificFiles', 'Create from Specific Files')}
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Connector Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={20} />
{t('interface.selectConnectors', 'Select Connectors')}
                </h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
{selectedConnectors.length === connectors.length ? t('interface.deselectAll', 'Deselect All') : t('interface.selectAll', 'Select All')}
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
placeholder={t('interface.searchConnectors', 'Search connectors...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Connectors List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredConnectors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
{searchTerm ? t('interface.noConnectorsFound', 'No connectors found matching your search.') : t('interface.noConnectorsAvailable', 'No connectors available.')}
                  </div>
                ) : (
                  filteredConnectors.map((connector) => (
                    <div
                      key={connector.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedConnectors.includes(connector.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleConnectorToggle(connector.id)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedConnectors.includes(connector.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedConnectors.includes(connector.id) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{connector.name}</h3>
                        <p className="text-sm text-gray-500">{connector.source}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          connector.status === 'active' ? 'bg-green-100 text-green-800' :
                          connector.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                          connector.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {connector.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {connector.total_docs_indexed} {t('interface.docs', 'docs')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create Content Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleCreateContent}
                disabled={selectedConnectors.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedConnectors.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
{t('interface.createContentFromSelected', 'Create Content from {count} Selected Connector{s}')
                  .replace('{count}', selectedConnectors.length.toString())
                  .replace('{s}', selectedConnectors.length !== 1 ? 's' : '')}
              </button>
            </div>
          </div>

          {/* Right Column - Smart Drive Browser */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t('interface.fileBrowser', 'File Browser')}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
{t('interface.browseAndSelectFiles', 'Browse and select files from your Smart Drive to include in your content creation.')}
              </p>
              <SmartDriveFrame />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 