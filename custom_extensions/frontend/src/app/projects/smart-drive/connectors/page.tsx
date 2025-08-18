"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Settings, 
  Check, 
  X,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface Connector {
  id: number;
  name: string;
  provider: string;
  status: 'active' | 'error' | 'syncing' | 'inactive';
  lastSync?: string;
  documentsCount: number;
  config: Record<string, any>;
  created_at: string;
}

interface ConnectorProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiresOAuth: boolean;
  configFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

const ConnectorsPage: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [providers, setProviders] = useState<ConnectorProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadConnectors();
    loadProviders();
  }, []);

  const loadConnectors = async () => {
    try {
      const response = await fetch('/api/custom-smartdrive/connectors/', {
        credentials: 'same-origin',
      });
      if (response.ok) {
        const data = await response.json();
        setConnectors(data);
      } else {
        throw new Error('Failed to load connectors');
      }
    } catch (err) {
      setError(t('connectors.loadError', 'Failed to load connectors'));
      console.error('Load connectors error:', err);
    }
  };

  const loadProviders = async () => {
    try {
      // Get actual connector types from Onyx
      const response = await fetch('/api/custom-projects-backend/smartdrive/connector-types', {
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        const connectorTypes = await response.json();
        
        // Convert to our expected format
        const providerList: ConnectorProvider[] = Object.entries(connectorTypes).map(([id, info]: [string, any]) => ({
          id,
          name: info.display_name || id.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: `Connect to ${info.display_name || id}`,
          icon: getProviderIcon(id),
          requiresOAuth: info.oauth_required || false,
          configFields: getProviderConfigFields(id)
        }));
        
        setProviders(providerList);
      } else {
        throw new Error('Failed to load connector types');
      }
    } catch (err) {
      console.error('Load providers error:', err);
      // Fallback to basic providers if API fails
      setProviders([
        {
          id: 'google_drive',
          name: 'Google Drive',
          description: 'Sync files from your Google Drive',
          icon: '📁',
          requiresOAuth: true,
          configFields: []
        },
        {
          id: 'notion',
          name: 'Notion',
          description: 'Import pages and databases from Notion',
          icon: '📝',
          requiresOAuth: true,
          configFields: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (providerId: string): string => {
    const icons: Record<string, string> = {
      'google_drive': '📁',
      'notion': '📝',
      'dropbox': '📦',
      'sharepoint': '🏢',
      'slack': '💬',
      'confluence': '📚',
      'github': '🐙',
      'gitlab': '🦊',
      'jira': '🎫',
      'linear': '📐',
      'asana': '✅',
      'trello': '📋'
    };
    return icons[providerId] || '🔗';
  };

  const getProviderConfigFields = (providerId: string): Array<any> => {
    const configs: Record<string, Array<any>> = {
      'sharepoint': [
        { key: 'site_url', label: 'Site URL', type: 'url', required: true }
      ],
      'confluence': [
        { key: 'confluence_url', label: 'Confluence URL', type: 'url', required: true }
      ],
      'jira': [
        { key: 'jira_url', label: 'Jira URL', type: 'url', required: true }
      ]
    };
    return configs[providerId] || [];
  };

  const handleCreateConnector = async (provider: ConnectorProvider, config: Record<string, any>) => {
    try {
      const response = await fetch('/api/custom-smartdrive/connectors/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ provider: provider.id, config }),
      });

      if (response.ok) {
        await loadConnectors();
        setShowAddModal(false);
      } else {
        throw new Error('Failed to create connector');
      }
    } catch (err) {
      setError(t('connectors.createError', 'Failed to create connector'));
      console.error('Create connector error:', err);
    }
  };

  const handleUpdateConnector = async (connector: Connector, config: Record<string, any>) => {
    try {
      const response = await fetch(`/api/custom-smartdrive/connectors/${connector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        await loadConnectors();
        setEditingConnector(null);
      } else {
        throw new Error('Failed to update connector');
      }
    } catch (err) {
      setError(t('connectors.updateError', 'Failed to update connector'));
      console.error('Update connector error:', err);
    }
  };

  const handleDeleteConnector = async (connectorId: number) => {
    if (!confirm(t('connectors.deleteConfirm', 'Are you sure you want to delete this connector?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-smartdrive/connectors/${connectorId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (response.ok) {
        await loadConnectors();
      } else {
        throw new Error('Failed to delete connector');
      }
    } catch (err) {
      setError(t('connectors.deleteError', 'Failed to delete connector'));
      console.error('Delete connector error:', err);
    }
  };

  const handleSyncConnector = async (connectorId: number) => {
    setSyncingIds(prev => new Set([...prev, connectorId]));
    try {
      const response = await fetch(`/api/custom-smartdrive/connectors/${connectorId}/sync`, {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        await loadConnectors();
      } else {
        throw new Error('Failed to sync connector');
      }
    } catch (err) {
      setError(t('connectors.syncError', 'Failed to sync connector'));
      console.error('Sync connector error:', err);
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectorId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: Connector['status']) => {
    switch (status) {
      case 'active':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'inactive':
        return <X className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Connector['status']) => {
    switch (status) {
      case 'active':
        return t('connectors.statusActive', 'Active');
      case 'error':
        return t('connectors.statusError', 'Error');
      case 'syncing':
        return t('connectors.statusSyncing', 'Syncing');
      case 'inactive':
        return t('connectors.statusInactive', 'Inactive');
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('connectors.loading', 'Loading connectors...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/projects?tab=smart-drive"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                {t('connectors.backToSmartDrive', 'Back to Smart Drive')}
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {t('connectors.title', 'My Connectors')}
              </h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('connectors.addConnector', 'Add Connector')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {connectors.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('connectors.noConnectors', 'No connectors configured')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('connectors.noConnectorsDesc', 'Connect your favorite platforms to automatically sync content to Onyx.')}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('connectors.addFirstConnector', 'Add Your First Connector')}
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {providers.find(p => p.id === connector.provider)?.icon || '🔗'}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {connector.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(connector.status)}
                          <span>{getStatusText(connector.status)}</span>
                        </div>
                        <span>
                          {t('connectors.documentsCount', '{count} documents').replace('{count}', connector.documentsCount.toString())}
                        </span>
                        {connector.lastSync && (
                          <span>
                            {t('connectors.lastSync', 'Last sync: {date}').replace('{date}', new Date(connector.lastSync).toLocaleDateString())}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSyncConnector(connector.id)}
                      disabled={syncingIds.has(connector.id)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncingIds.has(connector.id) ? 'animate-spin' : ''}`} />
                      {syncingIds.has(connector.id)
                        ? t('connectors.syncing', 'Syncing...')
                        : t('connectors.syncNow', 'Sync Now')
                      }
                    </button>
                    <button
                      onClick={() => setEditingConnector(connector)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                      {t('connectors.edit', 'Edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteConnector(connector.id)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('connectors.delete', 'Delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Connector Modal */}
      {showAddModal && (
        <ConnectorModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          providers={providers}
          onSave={handleCreateConnector}
          title={t('connectors.addConnector', 'Add Connector')}
        />
      )}

      {/* Edit Connector Modal */}
      {editingConnector && (
        <ConnectorModal
          isOpen={!!editingConnector}
          onClose={() => setEditingConnector(null)}
          providers={providers}
          connector={editingConnector}
          onSave={(provider, config) => handleUpdateConnector(editingConnector, config)}
          title={t('connectors.editConnector', 'Edit Connector')}
        />
      )}
    </div>
  );
};

// Connector Modal Component
interface ConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ConnectorProvider[];
  connector?: Connector;
  onSave: (provider: ConnectorProvider, config: Record<string, any>) => void;
  title: string;
}

const ConnectorModal: React.FC<ConnectorModalProps> = ({
  isOpen,
  onClose,
  providers,
  connector,
  onSave,
  title,
}) => {
  const { t } = useLanguage();
  const [selectedProvider, setSelectedProvider] = useState<ConnectorProvider | null>(
    connector ? providers.find(p => p.id === connector.provider) || null : null
  );
  const [config, setConfig] = useState<Record<string, any>>(connector?.config || {});
  const [name, setName] = useState(connector?.name || '');

  const handleSave = () => {
    if (!selectedProvider || !name.trim()) return;

    const finalConfig = { ...config, name: name.trim() };
    onSave(selectedProvider, finalConfig);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!connector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('connectors.selectProvider', 'Select Provider')}
              </label>
              <div className="grid gap-2">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProvider?.id === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{provider.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{provider.name}</p>
                        <p className="text-sm text-gray-600">{provider.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedProvider && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('connectors.connectorName', 'Connector Name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`My ${selectedProvider.name} Connection`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedProvider.requiresOAuth ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {t('connectors.oauthRequired', 'OAuth Required')}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    {t('connectors.oauthDesc', 'This connector requires OAuth authentication. After creating the connector, you will need to authorize access.')}
                  </p>
                  <p className="text-xs text-blue-600">
                    {t('connectors.oauthNote', 'Note: OAuth authorization will be initiated after the connector is created.')}
                  </p>
                </div>
              ) : (
                selectedProvider.configFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{t('connectors.selectOption', 'Select an option')}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('connectors.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedProvider || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connector ? t('connectors.update', 'Update') : t('connectors.create', 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectorsPage; 