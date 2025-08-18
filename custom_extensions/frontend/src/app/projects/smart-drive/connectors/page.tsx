"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Settings, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface Connector {
  id: number;
  name: string;
  source: string;
  status: 'active' | 'paused' | 'error' | 'syncing';
  last_sync?: string;
  total_docs?: number;
  created_at: string;
}

interface ConnectorFormData {
  name: string;
  source: string;
  config: Record<string, any>;
}

const ConnectorsPage: React.FC = () => {
  const router = useRouter();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [syncingConnectors, setSyncingConnectors] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<ConnectorFormData>({
    name: '',
    source: '',
    config: {}
  });

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/connectors/', {
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setConnectors(data);
      } else {
        console.error('Failed to load connectors:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading connectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectorId: number) => {
    setSyncingConnectors(prev => new Set(prev).add(connectorId));

    try {
      const response = await fetch(`/api/custom-projects-backend/smartdrive/connectors/${connectorId}/sync`, {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        // Refresh connectors list to show updated status
        await loadConnectors();
      } else {
        console.error('Sync failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error syncing connector:', error);
    } finally {
      setSyncingConnectors(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectorId);
        return newSet;
      });
    }
  };

  const handleDelete = async (connectorId: number) => {
    if (!confirm('Are you sure you want to delete this connector?')) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-projects-backend/smartdrive/connectors/${connectorId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (response.ok) {
        await loadConnectors();
      } else {
        console.error('Delete failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting connector:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'syncing':
        return 'text-blue-600 bg-blue-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading connectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/projects?tab=smart-drive')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Smart Drive</span>
              </button>
              <div className="ml-4 pl-4 border-l border-gray-300">
                <h1 className="text-2xl font-bold text-gray-900">My Connectors</h1>
                <p className="text-sm text-gray-600">Manage your personal data source connections</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ name: '', source: '', config: {} });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Connector
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connectors.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No connectors configured</h3>
            <p className="text-gray-600 mb-6">
              Connect your personal data sources to automatically sync content with Onyx
            </p>
            <button
              onClick={() => {
                setFormData({ name: '', source: '', config: {} });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Your First Connector
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectors.map((connector) => (
              <div key={connector.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{connector.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{connector.source}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(connector.status)}`}>
                    {getStatusIcon(connector.status)}
                    {connector.status}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Documents:</span>
                    <span className="font-medium">{connector.total_docs || 0}</span>
                  </div>
                  {connector.last_sync && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last sync:</span>
                      <span className="font-medium">
                        {new Date(connector.last_sync).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(connector.id)}
                    disabled={syncingConnectors.has(connector.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingConnectors.has(connector.id) ? 'animate-spin' : ''}`} />
                    {syncingConnectors.has(connector.id) ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button
                    onClick={() => setEditingConnector(connector)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(connector.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Connector Modal */}
      {(showAddModal || editingConnector) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingConnector ? 'Edit Connector' : 'Add New Connector'}
            </h2>
            <p className="text-gray-600 mb-6">
              Configure your personal data source connection. All documents will be private to your account.
            </p>
            
            {/* Simple form - in a real implementation, this would be more sophisticated */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Personal Drive"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a connector type...</option>
                  
                  {/* Popular Cloud Storage */}
                  <optgroup label="📁 Cloud Storage">
                    <option value="google_drive">Google Drive</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="sharepoint">SharePoint</option>
                    <option value="s3">Amazon S3</option>
                    <option value="google_cloud_storage">Google Cloud Storage</option>
                    <option value="r2">Cloudflare R2</option>
                    <option value="oci_storage">Oracle Cloud Storage</option>
                    <option value="egnyte">Egnyte</option>
                  </optgroup>

                  {/* Communication & Collaboration */}
                  <optgroup label="💬 Communication">
                    <option value="slack">Slack</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="discord">Discord</option>
                    <option value="gmail">Gmail</option>
                    <option value="zulip">Zulip</option>
                  </optgroup>

                  {/* Documentation & Knowledge */}
                  <optgroup label="📚 Documentation">
                    <option value="confluence">Confluence</option>
                    <option value="notion">Notion</option>
                    <option value="gitbook">GitBook</option>
                    <option value="slab">Slab</option>
                    <option value="bookstack">BookStack</option>
                    <option value="guru">Guru</option>
                    <option value="document360">Document360</option>
                    <option value="mediawiki">MediaWiki</option>
                    <option value="wikipedia">Wikipedia</option>
                  </optgroup>

                  {/* Development & Code */}
                  <optgroup label="⚡ Development">
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                    <option value="linear">Linear</option>
                    <option value="jira">Jira</option>
                    <option value="asana">Asana</option>
                    <option value="clickup">ClickUp</option>
                  </optgroup>

                  {/* CRM & Sales */}
                  <optgroup label="🏢 Business & CRM">
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="gong">Gong</option>
                    <option value="loopio">Loopio</option>
                    <option value="productboard">Productboard</option>
                    <option value="airtable">Airtable</option>
                    <option value="highspot">Highspot</option>
                  </optgroup>

                  {/* Support & Forums */}
                  <optgroup label="🎧 Support & Forums">
                    <option value="zendesk">Zendesk</option>
                    <option value="freshdesk">Freshdesk</option>
                    <option value="discourse">Discourse</option>
                    <option value="xenforo">XenForo</option>
                    <option value="axero">Axero</option>
                  </optgroup>

                  {/* Other */}
                  <optgroup label="🌐 Other">
                    <option value="web">Web Scraping</option>
                    <option value="file">Local Files</option>
                    <option value="google_sites">Google Sites</option>
                    <option value="fireflies">Fireflies</option>
                    <option value="requesttracker">Request Tracker</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingConnector(null);
                  setFormData({ name: '', source: '', config: {} });
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Saving connector:', formData);
                    
                    const response = await fetch('/api/custom-projects-backend/smartdrive/connectors/', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'same-origin',
                      body: JSON.stringify(formData),
                    });

                    if (response.ok) {
                      const newConnector = await response.json();
                      console.log('Connector created successfully:', newConnector);
                      
                      // Refresh the connectors list
                      await loadConnectors();
                      
                      // Close modal and reset form
                      setShowAddModal(false);
                      setEditingConnector(null);
                      setFormData({ name: '', source: '', config: {} });
                    } else {
                      const errorData = await response.json();
                      console.error('Failed to create connector:', errorData);
                      alert(`Failed to create connector: ${errorData.detail || 'Unknown error'}`);
                    }
                  } catch (error) {
                    console.error('Error creating connector:', error);
                    alert('Failed to create connector. Please try again.');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!formData.name || !formData.source}
              >
                {editingConnector ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectorsPage; 