"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Upload, Settings } from 'lucide-react';
import SmartDriveFrame from './SmartDriveFrame';

// Import connector icons from the main Onyx icon library
import {
  GoogleDriveIcon,
  DropboxIcon,
  SlackIcon,
  NotionIcon,
  ColorDiscordIcon,
  GitbookIcon,
  ZendeskIcon,
  AsanaIcon,
  S3Icon,
  AirtableIcon,
  ConfluenceIcon,
  JiraIcon,
  GithubIcon,
  GitlabIcon,
  GmailIcon,
  SharepointIcon,
  TeamsIcon,
  SalesforceIcon,
  DiscourseIcon,
  AxeroIcon,
  WikipediaIcon,
  MediaWikiIcon,
  ClickupIcon,
  R2Icon,
  GoogleStorageIcon,
  OCIStorageIcon,
  XenforoIcon,
  FreshdeskIcon,
  FirefliesIcon,
  EgnyteIcon,
  HighspotIcon,
  GuruIcon,
  LinearIcon,
  HubSpotIcon,
  Document360Icon,
  GoogleSitesIcon,
  ZulipIcon,
  ProductboardIcon,
  SlabIcon,
  LoopioIcon,
  BookstackIcon,
  GlobeIcon2,
  FileIcon2,
  GongIcon
} from '../../../../../web/src/components/icons/icons';

interface ConnectorConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
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

  // Define all available connectors
  const availableConnectors: ConnectorConfig[] = [
    {
      id: 'browse_uploaded',
      name: 'Browse Uploaded',
      description: 'Access your uploaded files and documents',
      icon: Upload,
      category: 'Storage'
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Connect to your Google Drive account',
      icon: GoogleDriveIcon,
      category: 'Storage',
      oauthSupported: true
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Connect to your Dropbox account',
      icon: DropboxIcon,
      category: 'Storage'
    },
    {
      id: 's3',
      name: 'Amazon S3',
      description: 'Connect to Amazon S3 storage',
      icon: S3Icon,
      category: 'Storage'
    },
    {
      id: 'r2',
      name: 'Cloudflare R2',
      description: 'Connect to Cloudflare R2 storage',
      icon: R2Icon,
      category: 'Storage'
    },
    {
      id: 'google_cloud_storage',
      name: 'Google Cloud Storage',
      description: 'Connect to Google Cloud Storage',
      icon: GoogleStorageIcon,
      category: 'Storage'
    },
    {
      id: 'oci_storage',
      name: 'Oracle Cloud Storage',
      description: 'Connect to Oracle Cloud Storage',
      icon: OCIStorageIcon,
      category: 'Storage'
    },
    {
      id: 'sharepoint',
      name: 'SharePoint',
      description: 'Connect to Microsoft SharePoint',
      icon: SharepointIcon,
      category: 'Storage'
    },
    {
      id: 'egnyte',
      name: 'Egnyte',
      description: 'Connect to Egnyte file sharing',
      icon: EgnyteIcon,
      category: 'Storage'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect to your Slack workspace',
      icon: SlackIcon,
      category: 'Messaging',
      oauthSupported: true
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Connect to your Discord server',
      icon: ColorDiscordIcon,
      category: 'Messaging'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Connect to Microsoft Teams',
      icon: TeamsIcon,
      category: 'Messaging'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect to your Gmail account',
      icon: GmailIcon,
      category: 'Messaging'
    },
    {
      id: 'zulip',
      name: 'Zulip',
      description: 'Connect to Zulip chat',
      icon: ZulipIcon,
      category: 'Messaging'
    },
    {
      id: 'discourse',
      name: 'Discourse',
      description: 'Connect to Discourse forum',
      icon: DiscourseIcon,
      category: 'Messaging'
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Connect to your Notion workspace',
      icon: NotionIcon,
      category: 'Wiki'
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: 'Connect to Atlassian Confluence',
      icon: ConfluenceIcon,
      category: 'Wiki',
      oauthSupported: true
    },
    {
      id: 'gitbook',
      name: 'GitBook',
      description: 'Connect to GitBook documentation',
      icon: GitbookIcon,
      category: 'Wiki'
    },
    {
      id: 'axero',
      name: 'Axero',
      description: 'Connect to Axero knowledge base',
      icon: AxeroIcon,
      category: 'Wiki'
    },
    {
      id: 'wikipedia',
      name: 'Wikipedia',
      description: 'Connect to Wikipedia articles',
      icon: WikipediaIcon,
      category: 'Wiki'
    },
    {
      id: 'mediawiki',
      name: 'MediaWiki',
      description: 'Connect to MediaWiki sites',
      icon: MediaWikiIcon,
      category: 'Wiki'
    },
    {
      id: 'bookstack',
      name: 'BookStack',
      description: 'Connect to BookStack documentation',
      icon: BookstackIcon,
      category: 'Wiki'
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Connect to your Asana workspace',
      icon: AsanaIcon,
      category: 'Project Management'
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Connect to Atlassian Jira',
      icon: JiraIcon,
      category: 'Project Management'
    },
    {
      id: 'clickup',
      name: 'ClickUp',
      description: 'Connect to ClickUp workspace',
      icon: ClickupIcon,
      category: 'Project Management'
    },
    {
      id: 'linear',
      name: 'Linear',
      description: 'Connect to Linear project management',
      icon: LinearIcon,
      category: 'Project Management'
    },
    {
      id: 'productboard',
      name: 'Productboard',
      description: 'Connect to Productboard',
      icon: ProductboardIcon,
      category: 'Project Management'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect to GitHub repositories',
      icon: GithubIcon,
      category: 'Code Repository'
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Connect to GitLab repositories',
      icon: GitlabIcon,
      category: 'Code Repository'
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect to Zendesk support',
      icon: ZendeskIcon,
      category: 'Customer Support'
    },
    {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect to Freshdesk support',
      icon: FreshdeskIcon,
      category: 'Customer Support'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Connect to Salesforce CRM',
      icon: SalesforceIcon,
      category: 'CRM'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Connect to HubSpot CRM',
      icon: HubSpotIcon,
      category: 'CRM'
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Connect to Airtable databases',
      icon: AirtableIcon,
      category: 'Database'
    },
    {
      id: 'gong',
      name: 'Gong',
      description: 'Connect to Gong call recordings',
      icon: GongIcon,
      category: 'Communication'
    },
    {
      id: 'fireflies',
      name: 'Fireflies',
      description: 'Connect to Fireflies meeting recordings',
      icon: FirefliesIcon,
      category: 'Communication'
    },
    {
      id: 'highspot',
      name: 'Highspot',
      description: 'Connect to Highspot sales enablement',
      icon: HighspotIcon,
      category: 'Sales'
    },
    {
      id: 'guru',
      name: 'Guru',
      description: 'Connect to Guru knowledge base',
      icon: GuruIcon,
      category: 'Knowledge Management'
    },
    {
      id: 'slab',
      name: 'Slab',
      description: 'Connect to Slab documentation',
      icon: SlabIcon,
      category: 'Documentation'
    },
    {
      id: 'document360',
      name: 'Document360',
      description: 'Connect to Document360 knowledge base',
      icon: Document360Icon,
      category: 'Documentation'
    },
    {
      id: 'google_sites',
      name: 'Google Sites',
      description: 'Connect to Google Sites',
      icon: GoogleSitesIcon,
      category: 'Website'
    },
    {
      id: 'xenforo',
      name: 'XenForo',
      description: 'Connect to XenForo forum',
      icon: XenforoIcon,
      category: 'Forum'
    },
    {
      id: 'loopio',
      name: 'Loopio',
      description: 'Connect to Loopio RFP responses',
      icon: LoopioIcon,
      category: 'RFP Management'
    },
    {
      id: 'web',
      name: 'Web Scraper',
      description: 'Scrape content from websites',
      icon: GlobeIcon2,
      category: 'Web'
    },
    {
      id: 'file',
      name: 'File Upload',
      description: 'Upload files directly',
      icon: FileIcon2,
      category: 'File'
    }
  ];

  // Load user's existing connectors
  useEffect(() => {
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
          
          // Filter to only show private connectors created through Smart Drive
          const smartDriveConnectors = allConnectors.filter((connector: any) => {
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
          
          setUserConnectors(userConnectors);
        }
      } catch (error) {
        console.error('Error loading user connectors:', error);
        setUserConnectors([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserConnectors();
  }, []);

  const handleBrowseClick = () => {
    setShowFrame(true);
  };

  const handleCloseBrowser = () => {
    setShowFrame(false);
  };

  const getConnectorsBySource = (source: string) => {
    return userConnectors.filter(connector => connector.source === source);
  };

  const getCreateUrl = (connectorId: string) => {
    if (connectorId === 'browse_uploaded') return '#';
    return `/admin/connectors/${connectorId}?access_type=private&smart_drive=true&smart_drive_user_group=true&return_url=${encodeURIComponent('/projects')}`;
  };

  const getManageUrl = (connectorId: string) => {
    return `/admin/connectors?source=${connectorId}&access_type=private`;
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
    <div className={`space-y-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Connectors</h2>
        <p className="text-gray-600">Connect your data sources to import content into your Smart Drive</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availableConnectors.map((connector) => {
          const IconComponent = connector.icon;
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
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {connector.name}
                  </h3>
                  <p className="text-xs text-gray-500">{connector.category}</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                {connector.description}
              </p>

              <div className="flex gap-2">
                <Link
                  href={getCreateUrl(connector.id)}
                  className={`flex-1 text-xs font-medium px-3 py-2 rounded-md transition-colors ${
                    connector.id === 'browse_uploaded'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  onClick={(e) => {
                    if (connector.id === 'browse_uploaded') {
                      e.preventDefault();
                      handleBrowseClick();
                    }
                  }}
                >
                  {connector.id === 'browse_uploaded' ? 'Browse' : 'Create'}
                </Link>

                {hasConnectors && (
                  <div className="relative">
                    {hasMultipleConnectors ? (
                      <div className="relative">
                        <button className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                          Manage
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
                          {userConnectorsForSource.map((userConnector) => (
                            <Link
                              key={userConnector.id}
                              href={`/admin/connectors/${userConnector.id}`}
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
  );
};

export default SmartDriveConnectors; 