"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ExternalLink, Upload, Settings } from 'lucide-react';
import SmartDriveFrame from './SmartDriveFrame';
import ConnectorFormModal from './ConnectorFormModal';

interface ConnectorConfig {
  id: string;
  name: string;
  logoPath: string;
  category: string;
  oauthSupported?: boolean;
}

interface UserConnector {
  id: number;
  name: string;
  source: string;
  status: 'active' | 'paused' | 'error' | 'syncing';
  last_sync_at?: string;
  total_docs_indexed: number;
  last_error?: string;
}

interface SmartDriveConnectorsProps {
  className?: string;
}

const SmartDriveConnectors: React.FC<SmartDriveConnectorsProps> = ({ className = '' }) => {
  const [showFrame, setShowFrame] = useState(false);
  const [userConnectors, setUserConnectors] = useState<UserConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<{id: string, name: string} | null>(null);

  // Define all available connectors organized by category
  const connectorCategories = {
    'Cloud Storage': [
      {
        id: 'browse_uploaded',
        name: 'Browse Uploaded',
        logoPath: '/file.svg',
        category: 'Cloud Storage'
      },
      {
        id: 'google_drive',
        name: 'Google Drive',
        logoPath: '/GoogleDrive.png',
        category: 'Cloud Storage',
        oauthSupported: true
      },
      {
        id: 'dropbox',
        name: 'Dropbox',
        logoPath: '/Dropbox.png',
        category: 'Cloud Storage'
      },
      {
        id: 's3',
        name: 'Amazon S3',
        logoPath: '/S3.png',
        category: 'Cloud Storage'
      },
      {
        id: 'r2',
        name: 'Cloudflare R2',
        logoPath: '/r2.png',
        category: 'Cloud Storage'
      },
      {
        id: 'google_cloud_storage',
        name: 'Google Cloud Storage',
        logoPath: '/GoogleCloudStorage.png',
        category: 'Cloud Storage'
      },
      {
        id: 'oci_storage',
        name: 'Oracle Cloud Storage',
        logoPath: '/OCI.svg',
        category: 'Cloud Storage'
      },
      {
        id: 'sharepoint',
        name: 'SharePoint',
        logoPath: '/Sharepoint.png',
        category: 'Cloud Storage'
      },
      {
        id: 'egnyte',
        name: 'Egnyte',
        logoPath: '/Egnyte.png',
        category: 'Cloud Storage'
      }
    ],
    'Communication & Messaging': [
      {
        id: 'slack',
        name: 'Slack',
        logoPath: '/Slack.png',
        category: 'Communication & Messaging',
        oauthSupported: true
      },
      {
        id: 'discord',
        name: 'Discord',
        logoPath: '/discord.png',
        category: 'Communication & Messaging'
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        logoPath: '/Teams.png',
        category: 'Communication & Messaging'
      },
      {
        id: 'gmail',
        name: 'Gmail',
        logoPath: '/Gmail.png',
        category: 'Communication & Messaging'
      },
      {
        id: 'zulip',
        name: 'Zulip',
        logoPath: '/Zulip.png',
        category: 'Communication & Messaging'
      },
      {
        id: 'discourse',
        name: 'Discourse',
        logoPath: '/Discourse.png',
        category: 'Communication & Messaging'
      },
      {
        id: 'gong',
        name: 'Gong',
        logoPath: '/Gong.png',
        category: 'Communication & Messaging'
      },
      {
        id: 'fireflies',
        name: 'Fireflies',
        logoPath: '/Fireflies.png',
        category: 'Communication & Messaging'
      }
    ],
    'Documentation & Knowledge': [
      {
        id: 'notion',
        name: 'Notion',
        logoPath: '/Notion.png',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'confluence',
        name: 'Confluence',
        logoPath: '/Confluence.svg',
        category: 'Documentation & Knowledge',
        oauthSupported: true
      },
      {
        id: 'gitbook',
        name: 'GitBook',
        logoPath: '/GitBookDark.png',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'axero',
        name: 'Axero',
        logoPath: '/Axero.jpeg',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'wikipedia',
        name: 'Wikipedia',
        logoPath: '/Wikipedia.png',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'mediawiki',
        name: 'MediaWiki',
        logoPath: '/MediaWiki.svg',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'bookstack',
        name: 'BookStack',
        logoPath: '/GitBookLight.png',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'guru',
        name: 'Guru',
        logoPath: '/Guru.svg',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'slab',
        name: 'Slab',
        logoPath: '/SlabLogo.png',
        category: 'Documentation & Knowledge'
      },
      {
        id: 'document360',
        name: 'Document360',
        logoPath: '/Document360.png',
        category: 'Documentation & Knowledge'
      }
    ],
    'Project Management': [
      {
        id: 'asana',
        name: 'Asana',
        logoPath: '/Asana.png',
        category: 'Project Management'
      },
      {
        id: 'jira',
        name: 'Jira',
        logoPath: '/Jira.svg',
        category: 'Project Management'
      },
      {
        id: 'clickup',
        name: 'ClickUp',
        logoPath: '/Clickup.svg',
        category: 'Project Management'
      },
      {
        id: 'linear',
        name: 'Linear',
        logoPath: '/Linear.png',
        category: 'Project Management'
      },
      {
        id: 'productboard',
        name: 'Productboard',
        logoPath: '/Productboard.png',
        category: 'Project Management'
      }
    ],
    'Code Repositories': [
      {
        id: 'github',
        name: 'GitHub',
        logoPath: '/Github.png',
        category: 'Code Repositories'
      },
      {
        id: 'gitlab',
        name: 'GitLab',
        logoPath: '/Gitlab.png',
        category: 'Code Repositories'
      }
    ],
    'Customer Support': [
      {
        id: 'zendesk',
        name: 'Zendesk',
        logoPath: '/Zendesk.svg',
        category: 'Customer Support'
      },
      {
        id: 'freshdesk',
        name: 'Freshdesk',
        logoPath: '/Freshdesk.png',
        category: 'Customer Support'
      }
    ],
    'CRM & Sales': [
      {
        id: 'salesforce',
        name: 'Salesforce',
        logoPath: '/Salesforce.png',
        category: 'CRM & Sales'
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        logoPath: '/HubSpot.png',
        category: 'CRM & Sales'
      },
      {
        id: 'highspot',
        name: 'Highspot',
        logoPath: '/Highspot.png',
        category: 'CRM & Sales'
      }
    ],
    'Databases & Tools': [
      {
        id: 'airtable',
        name: 'Airtable',
        logoPath: '/Airtable.svg',
        category: 'Databases & Tools'
      }
    ],
    'Web & Content': [
      {
        id: 'google_sites',
        name: 'Google Sites',
        logoPath: '/GoogleSites.png',
        category: 'Web & Content'
      },
      {
        id: 'xenforo',
        name: 'XenForo',
        logoPath: '/Xenforo.svg',
        category: 'Web & Content'
      },
      {
        id: 'web',
        name: 'Web Scraper',
        logoPath: '/web.svg',
        category: 'Web & Content'
      },
      {
        id: 'file',
        name: 'File Upload',
        logoPath: '/file.svg',
        category: 'Web & Content'
      }
    ],
    'Specialized Tools': [
      {
        id: 'loopio',
        name: 'Loopio',
        logoPath: '/Loopio.png',
        category: 'Specialized Tools'
      }
    ]
  };

  // Load user's existing connectors
  const loadUserConnectors = async () => {
    try {
      setLoading(true);
      
      const [connectorsResponse, ccPairsResponse] = await Promise.all([
        fetch('/api/manage/admin/connector', { credentials: 'same-origin' }),
        fetch('/api/manage/admin/connector-credential-pair', { credentials: 'same-origin' })
      ]);

      if (connectorsResponse.ok && ccPairsResponse.ok) {
        const allConnectors = await connectorsResponse.json();
        const allCCPairs = await ccPairsResponse.json();
        
        console.log('All connectors:', allConnectors);
        console.log('All CC pairs:', allCCPairs);
        
        // Filter to show all private connectors (including newly created ones)
        const smartDriveConnectors = allConnectors.filter((connector: any) => {
          const associatedCCPairs = allCCPairs.filter((pair: any) => 
            pair.connector.id === connector.id && pair.access_type === 'private'
          );
          
          // Show all private connectors, not just those with "smart" in the name
          return associatedCCPairs.length > 0;
        });
        
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
        
        console.log('Found user connectors:', userConnectors);
        setUserConnectors(userConnectors);
      }
    } catch (error) {
      console.error('Error loading user connectors:', error);
      setUserConnectors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserConnectors();
  }, []);

  const handleBrowseClick = () => {
    setShowFrame(true);
  };

  const handleCloseBrowser = () => {
    setShowFrame(false);
  };

  const handleConnectClick = (connectorId: string, connectorName: string) => {
    setSelectedConnector({ id: connectorId, name: connectorName });
    setShowConnectorModal(true);
  };

  const handleCloseConnectorModal = () => {
    setShowConnectorModal(false);
    setSelectedConnector(null);
    // Refresh connectors after modal closes to show newly created ones
    loadUserConnectors();
  };

  const getConnectorsBySource = (source: string) => {
    return userConnectors.filter(connector => connector.source === source);
  };

  const getCreateUrl = (connectorId: string) => {
    if (connectorId === 'browse_uploaded') return '#';
    // Use absolute URL to ensure it goes to the main domain, not the custom-projects-ui path
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const host = typeof window !== 'undefined' ? window.location.host : '';
    const mainDomain = `${protocol}//${host}`;
    return `${mainDomain}/admin/connectors/${connectorId}?access_type=private&smart_drive=true&smart_drive_user_group=true&return_url=${encodeURIComponent(`${mainDomain}/projects`)}`;
  };

  const getManageUrl = (connectorId: string) => {
    // Use absolute URL to ensure it goes to the main domain, not the custom-projects-ui path
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const host = typeof window !== 'undefined' ? window.location.host : '';
    const mainDomain = `${protocol}//${host}`;
    return `${mainDomain}/admin/connectors?source=${connectorId}&access_type=private`;
  };

  if (showFrame) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Smart Drive Browser</h2>
          <button
            onClick={handleCloseBrowser}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Close Browser
          </button>
        </div>
        <SmartDriveFrame />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Connectors</h2>
          <p className="text-gray-600">Connect your data sources to import content into your Smart Drive</p>
        </div>
        <button
          onClick={loadUserConnectors}
          disabled={loading}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {Object.entries(connectorCategories).map(([categoryName, connectors]) => (
        <div key={categoryName} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
            {categoryName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {connectors.map((connector) => {
              const userConnectorsForSource = getConnectorsBySource(connector.id);
              const hasConnectors = userConnectorsForSource.length > 0;
              const hasMultipleConnectors = userConnectorsForSource.length > 1;

              return (
                <div
                  key={connector.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                    connector.id === 'browse_uploaded' ? 'cursor-pointer' : ''
                  }`}
                  onClick={connector.id === 'browse_uploaded' ? handleBrowseClick : undefined}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <Image
                        src={connector.logoPath}
                        alt={`${connector.name} logo`}
                        width={32}
                        height={32}
                        className="object-contain w-8 h-8"
                        priority={false}
                        unoptimized={true}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {connector.name}
                      </h3>
                      <p className="text-xs text-gray-500">{connector.category}</p>
                    </div>
                  </div>



                  <div className="flex gap-2">
                    {connector.id === 'browse_uploaded' ? (
                      <button
                        onClick={handleBrowseClick}
                        className="flex-1 text-xs font-medium px-3 py-2 rounded-md transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Browse
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnectClick(connector.id, connector.name)}
                        className="flex-1 text-xs font-medium px-3 py-2 rounded-md transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Connect
                      </button>
                    )}

                    {hasConnectors && (
                      <div className="relative">
                        {hasMultipleConnectors ? (
                          <div className="relative group">
                            <button className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                              Manage
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
                              {userConnectorsForSource.map((userConnector) => (
                                <Link
                                  key={userConnector.id}
                                  href={`${typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : ''}/admin/connectors/${userConnector.id}`}
                                  className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                  {userConnector.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={getManageUrl(connector.id)}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            Manage
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {hasConnectors && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{userConnectorsForSource.length} connector{userConnectorsForSource.length !== 1 ? 's' : ''}</span>
                        {userConnectorsForSource.some(c => c.status === 'active') && (
                          <span className="text-green-600">● Active</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h4>
          <p className="text-xs text-gray-600">Total user connectors found: {userConnectors.length}</p>
          <p className="text-xs text-gray-600">Loading state: {loading ? 'true' : 'false'}</p>
          {userConnectors.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Connectors:</p>
              {userConnectors.map(connector => (
                <div key={connector.id} className="text-xs text-gray-500 ml-2">
                  • {connector.name} ({connector.source}) - Status: {connector.status}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connector Form Modal */}
      {selectedConnector && (
        <ConnectorFormModal
          isOpen={showConnectorModal}
          onClose={handleCloseConnectorModal}
          connectorId={selectedConnector.id}
          connectorName={selectedConnector.name}
        />
      )}
    </div>
  );
};

export default SmartDriveConnectors; 