"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Settings, Power, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UserConnector {
  id: number;
  name: string;
  source: string;
  status: 'active' | 'paused' | 'error' | 'syncing';
  last_sync_at?: string;
  total_docs_indexed: number;
  last_error?: string;
}

const ConnectorsPage: React.FC = () => {
  const [connectors, setConnectors] = useState<UserConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConnectors = async () => {
    try {
      setLoading(true);
      
      // Get connectors and credential pairs
      const [connectorsResponse, ccPairsResponse] = await Promise.all([
        fetch('/api/manage/admin/connector', { credentials: 'same-origin' }),
        fetch('/api/manage/admin/cc-pair', { credentials: 'same-origin' })
      ]);

      if (connectorsResponse.ok && ccPairsResponse.ok) {
        const allConnectors = await connectorsResponse.json();
        const allCCPairs = await ccPairsResponse.json();
        
        // Filter to only show private connectors created through Smart Drive
        const smartDriveConnectors = allConnectors.filter((connector: any) => {
          // Find associated CC pairs for this connector
          const associatedCCPairs = allCCPairs.filter((pair: any) => 
            pair.connector.id === connector.id && pair.access_type === 'private'
          );
          
          return associatedCCPairs.length > 0 && 
                 (connector.name?.toLowerCase().includes('smart') || 
                  associatedCCPairs.some((pair: any) => 
                    pair.user_groups?.some((group: any) => 
                      group.name?.includes('smart_drive_user_')
                    )
                  )
                 );
        });
        
        // Map to our interface
        const userConnectors = smartDriveConnectors.map((connector: any) => {
          const ccPair = allCCPairs.find((pair: any) => 
            pair.connector.id === connector.id && pair.access_type === 'private'
          );
          
          return {
            id: connector.id,
            name: connector.name,
            source: connector.source,
            status: ccPair?.status || 'unknown',
            last_sync_at: ccPair?.last_time_synced,
            total_docs_indexed: ccPair?.documents_indexed || 0,
            last_error: ccPair?.last_index_attempt?.error_msg,
          };
        });
        
        setConnectors(userConnectors);
      } else {
        console.error('Failed to load connectors or CC pairs');
        setConnectors([]);
      }
    } catch (err) {
      console.error('Error loading connectors:', err);
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnectors();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✓';
      case 'paused': return '⏸';
      case 'error': return '⚠';
      case 'syncing': return '⟳';
      default: return '?';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const connectorSources = [
    { id: 'google_drive', name: 'Google Drive', icon: '📁' },
    { id: 'dropbox', name: 'Dropbox', icon: '📦' },
    { id: 'slack', name: 'Slack', icon: '💬' },
    { id: 'notion', name: 'Notion', icon: '📝' },
    { id: 'confluence', name: 'Confluence', icon: '🌐' },
    { id: 'github', name: 'GitHub', icon: '⚡' },
    { id: 'gmail', name: 'Gmail', icon: '📧' },
    { id: 'sharepoint', name: 'SharePoint', icon: '🗃️' },
    { id: 'linear', name: 'Linear', icon: '📊' },
    { id: 'jira', name: 'Jira', icon: '🎯' },
    { id: 'salesforce', name: 'Salesforce', icon: '🏢' },
    { id: 'hubspot', name: 'HubSpot', icon: '🚀' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/projects?tab=smart-drive" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Connectors</h1>
            <p className="text-gray-600">Manage your personal data source connections</p>
          </div>
        </div>

        {/* Add Connector Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Connector</h2>
          <p className="text-gray-600 mb-4">
            Connect your personal data sources using Onyx's native connector system. 
            All connectors you create will be private to your account.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {connectorSources.map((source) => (
                             <a
                 key={source.id}
                                         href={`/admin/connectors/${source.id}?access_type=private&smart_drive=true&smart_drive_user_group=true&return_url=${encodeURIComponent('/projects/smart-drive/connectors')}`}
                 className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
               >
                <span className="text-2xl">{source.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{source.name}</div>
                  <div className="text-xs text-gray-500">Private connector</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </a>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Tip:</strong> After creating a connector, you'll be redirected back here to manage it.
              All connectors will be private to your account and won't be visible to other users.
            </p>
          </div>
        </div>

        {/* Existing Connectors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Connectors</h2>
              <button
                onClick={loadConnectors}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your connectors...</p>
            </div>
          ) : connectors.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connectors Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first connector to start importing data from your favorite services.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {connectors.map((connector) => (
                <div key={connector.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{connector.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{connector.source}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-sm font-medium ${getStatusColor(connector.status)}`}>
                            {getStatusIcon(connector.status)} {connector.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {connector.total_docs_indexed} documents indexed
                          </span>
                          <span className="text-sm text-gray-500">
                            Last sync: {formatDate(connector.last_sync_at)}
                          </span>
                        </div>
                        {connector.last_error && (
                          <p className="text-sm text-red-600 mt-1">Error: {connector.last_error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/connector/${connector.id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Configure"
                      >
                        <Settings className="w-4 h-4" />
                      </a>
                      <button
                        onClick={async () => {
                          // Trigger sync via Onyx's existing API
                          try {
                            const response = await fetch(`/api/manage/admin/connector/${connector.id}/index`, {
                              method: 'POST',
                              credentials: 'same-origin',
                            });
                            if (response.ok) {
                              await loadConnectors(); // Refresh list
                            }
                          } catch (error) {
                            console.error('Sync error:', error);
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Sync Now"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">About Private Connectors</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• All connectors you create are private to your account</li>
            <li>• Use the full Onyx connector system with OAuth support</li>
            <li>• Documents indexed are only accessible to you</li>
            <li>• Sync schedules and configurations work just like admin connectors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectorsPage; 