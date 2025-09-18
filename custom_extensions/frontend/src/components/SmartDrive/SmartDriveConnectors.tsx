"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

import Image from 'next/image';
import { ChevronDown, Upload, Settings, X, ArrowLeft } from 'lucide-react';
import SmartDriveFrame from './SmartDriveFrame';
import ConnectorFormFactory from './connector-forms/ConnectorFormFactory';
import ConnectorManagementPage from './connector-management/ConnectorManagementPage';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface ConnectorConfig {
  id: string;
  name: string;
  logoPath: string;
  category: string;
  oauthSupported?: boolean;
}

interface UserConnector {
  id: number; // This is the cc_pair_id (not connector_id) for management API calls
  name: string;
  source: string;
  status: 'active' | 'paused' | 'error' | 'syncing';
  last_sync_at?: string;
  total_docs_indexed: number;
  last_error?: string;
  access_type: string;
}

interface SmartDriveConnectorsProps {
  className?: string;
}

// Helper function to determine actual connector status (based on Onyx's logic)
const getActualConnectorStatus = (connectorStatus: any): string => {
  // Use the same logic as Onyx's CCPairIndexingStatusTable
  if (!connectorStatus) return 'unknown';
  
  if (connectorStatus.last_finished_status !== null) {
    return connectorStatus.cc_pair_status || 'unknown';
  } else if (connectorStatus.last_status === "not_started") {
    return "SCHEDULED";
  } else {
    return "INITIAL_INDEXING";
  }
};

const SmartDriveConnectors: React.FC<SmartDriveConnectorsProps> = ({ className = '' }) => {
  console.log('[POPUP_DEBUG] SmartDriveConnectors component rendering');
  
  const { t } = useLanguage();
  const [showFrame, setShowFrame] = useState(false);
  const [userConnectors, setUserConnectors] = useState<UserConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<{id: string, name: string} | null>(null);
  const [showManagementPage, setShowManagementPage] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<number | null>(null);
  const [isManagementOpening, setIsManagementOpening] = useState(false);
  const [showAllConnectors, setShowAllConnectors] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  
  console.log('[POPUP_DEBUG] Component state - showManagementPage:', showManagementPage, 'selectedConnectorId:', selectedConnectorId, 'isManagementOpening:', isManagementOpening);

  // Define all available connectors organized by category
  const connectorCategories = {
    'Cloud Storage': [
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
  const loadUserConnectors = useCallback(async () => {
    console.log('[POPUP_DEBUG] loadUserConnectors called, isLoadingRef.current:', isLoadingRef.current);
    
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log('[POPUP_DEBUG] Already loading, skipping...');
      return;
    }
    
    try {
      console.log('[POPUP_DEBUG] Starting to load connectors...');
      isLoadingRef.current = true;
      setLoading(true);
      
              const connectorsResponse = await fetch('/api/manage/admin/connector/status', { 
          credentials: 'same-origin' 
        });

      if (connectorsResponse.ok) {
        const allConnectorStatuses = await connectorsResponse.json();
        
        console.log('All connector statuses:', allConnectorStatuses);
        
        // Debug: Show status fields for the first connector
        if (allConnectorStatuses.length > 0) {
          const firstConnector = allConnectorStatuses[0];
          console.log('Status fields in first connector:', {
            cc_pair_status: firstConnector.cc_pair_status,
            last_status: firstConnector.last_status,
            last_finished_status: firstConnector.last_finished_status,
            computed_status: getActualConnectorStatus(firstConnector),
            available_fields: Object.keys(firstConnector)
          });
        }
        
        // Filter to show connectors that have private access (Smart Drive connectors)
        const smartDriveConnectors = allConnectorStatuses.filter((connectorStatus: any) => {
          return connectorStatus.access_type === 'private';
        });
        
        const userConnectors = smartDriveConnectors.map((connectorStatus: any) => ({
          id: connectorStatus.cc_pair_id, // IMPORTANT: Use cc_pair_id (not connector.id) for management API
          name: connectorStatus.name || `Connector ${connectorStatus.cc_pair_id}`,
          source: connectorStatus.connector.source,
          status: connectorStatus.connector.status || 'unknown', // Use simple status from connector
          last_sync_at: connectorStatus.last_sync_at,
          total_docs_indexed: connectorStatus.total_docs_indexed || 0,
          last_error: connectorStatus.last_error,
          access_type: connectorStatus.access_type || 'unknown',
        }));
        
        console.log('Found user Smart Drive connectors:', userConnectors);
        setUserConnectors(userConnectors);
      }
    } catch (error) {
      console.error('[POPUP_DEBUG] Error loading user connectors:', error);
      setUserConnectors([]);
    } finally {
      console.log('[POPUP_DEBUG] Loading finished');
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // useCallback dependency array

  useEffect(() => {
    console.log('[POPUP_DEBUG] useEffect triggered - loading connectors');
    loadUserConnectors();
    
    // Set up periodic refresh to update connector statuses (including removing fully deleted ones)
    const refreshInterval = setInterval(() => {
      console.log('[POPUP_DEBUG] Periodic refresh of connectors...');
      loadUserConnectors();
    }, 10000); // Refresh every 10 seconds
    
    return () => {
      console.log('[POPUP_DEBUG] Cleaning up refresh interval');
      clearInterval(refreshInterval);
    };
  }, []); // Remove loadUserConnectors from dependencies to prevent multiple calls

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

  const handleConnectorSubmit = async (formData: any) => {
    try {
      const response = await fetch("/api/custom-projects-backend/smartdrive/connectors/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Connector created successfully:", result);

      // Close the modal and refresh the connector list
      setShowConnectorModal(false);
      setSelectedConnector(null);
      loadUserConnectors();
    } catch (error) {
      console.error("Error creating connector:", error);
      // You might want to show an error message to the user here
    }
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
        {/* Enhanced Header with Better UX */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCloseBrowser}
                className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                Back to Connectors
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Smart Drive Browser</h2>
                <p className="text-sm text-gray-600 mt-1">Browse and manage your cloud files</p>
              </div>
            </div>
            
            {/* Close Button - More Prominent */}
            <button
              onClick={handleCloseBrowser}
              className="group p-2.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-200 hover:shadow-md"
              title="Close Browser"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
        
        <SmartDriveFrame />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`} onClick={() => setOpenDropdownId(null)}>
      {/* Smart Drive Browser Section */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <SmartDriveFrame />
        </div>
      </div>

             {/* Popular Connectors Section */}
       <div className="mb-8">
         <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-semibold text-gray-900">{t('interface.popularConnectors', 'Popular Connectors')}</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {['google_drive', 'slack', 'notion', 'github'].map((connectorId) => {
             const connector = Object.values(connectorCategories).flat().find(c => c.id === connectorId);
             if (!connector) return null;
             
             const userConnectorsForSource = getConnectorsBySource(connector.id);
             const hasConnectors = userConnectorsForSource.length > 0;

             return (
               <Card
                 key={connector.id}
                 className="group relative overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105"
                 style={{
                   backgroundColor: 'white',
                   borderColor: '#e2e8f0',
                   background: 'white',
                   borderWidth: '1px',
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                 }}
                 onClick={() => handleConnectClick(connector.id, connector.name)}
               >
                <div className="absolute -top-20 -left-22 w-100 h-100 bg-blue-50/50 rounded-full border-indigo-100/80" />
                <div className="absolute -top-12 -left-12 w-70 h-70 bg-blue-100/30 rounded-full border-indigo-100/80" />
                 <CardContent className="p-6 relative z-10">
                   <div className="flex items-center gap-4 mb-4">
                       <Image
                         src={connector.logoPath}
                         alt={`${connector.name} logo`}
                         width={32}
                         height={32}
                         className="object-contain w-8 h-8"
                         priority={false}
                         unoptimized={true}
                       />
                     <div className="flex-1 min-w-0">
                       <h3 className="text-lg font-semibold text-blue-600 truncate">
                         {connector.name}
                       </h3>
                     </div>
                   </div>

                   <div className="flex gap-2">
                     <Button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleConnectClick(connector.id, connector.name);
                       }}
                       variant="download"
                       className="flex-1 rounded-full"
                     >
                       {t('interface.connect', 'Connect')}
                     </Button>

                   {hasConnectors && (
                     <div className="relative">
                       {userConnectorsForSource.length > 1 ? (
                         <div className="relative group">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setOpenDropdownId(connector.id);
                             }}
                             className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                           >
                             {t('interface.manage', 'Manage')}
                             <ChevronDown className="w-3 h-3" />
                           </button>
                           <div className={`absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ${
                             openDropdownId === connector.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                           }`}>
                             {userConnectorsForSource.map((userConnector) => (
                               <button
                                 key={userConnector.id}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   console.log('Popular dropdown manage button clicked for connector:', userConnector.id);
                                   setOpenDropdownId(null); // Close dropdown
                                   if (!showManagementPage && !isManagementOpening) {
                                     console.log('Opening management page from popular dropdown for connector ID:', userConnector.id);
                                     setIsManagementOpening(true);
                                     setSelectedConnectorId(userConnector.id);
                                     setShowManagementPage(true);
                                     setTimeout(() => {
                                       setIsManagementOpening(false);
                                     }, 500);
                                   }
                                 }}
                                 className="block w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                               >
                                 {userConnector.name}
                               </button>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <Button
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             console.log('Single manage button clicked for connector:', userConnectorsForSource[0].id);
                             if (!showManagementPage && !isManagementOpening) {
                               console.log('Opening management page from single button for connector ID:', userConnectorsForSource[0].id);
                               setIsManagementOpening(true);
                               setSelectedConnectorId(userConnectorsForSource[0].id);
                               setShowManagementPage(true);
                               setTimeout(() => {
                                 setIsManagementOpening(false);
                               }, 500);
                             }
                           }}
                           className="px-4 py-2.5"
                         >
                           {t('interface.manage', 'Manage')}
                         </Button>
                       )}
                     </div>
                   )}
                 </div>

                 {hasConnectors && userConnectorsForSource.some(c => c.status === 'active') && (
                   <div className="mt-4 pt-4 border-t border-gray-100">
                     <div className="flex items-center justify-between text-sm text-gray-900">
                       <span className="text-green-600 font-medium">● {t('interface.active', 'Active')}</span>
                     </div>
                   </div>
                 )}
                 </CardContent>
               </Card>
             );
           })}
         </div>
       </div>

       {/* All Connectors Section */}
       <div className="mb-8">
         <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-semibold text-gray-900">{t('interface.allConnectors', 'All Connectors')}</h3>
           <button
             onClick={() => setShowAllConnectors(!showAllConnectors)}
             className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
           >
             {showAllConnectors ? t('interface.hideAll', 'Hide All') : t('interface.showAll', 'Show All')}
             <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAllConnectors ? 'rotate-180' : ''}`} />
           </button>
         </div>
       </div>

      {/* All Connectors Grid - Expandable */}
      {showAllConnectors && (
        <>
          {Object.entries(connectorCategories).map(([categoryName, connectors]) => (
            <div key={categoryName} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                {categoryName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {connectors.map((connector) => {
                  const userConnectorsForSource = getConnectorsBySource(connector.id);
                  const hasConnectors = userConnectorsForSource.length > 0;
                  const hasMultipleConnectors = userConnectorsForSource.length > 1;

                  return (
                    <Card
                      key={connector.id}
                      className="group relative overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105"
                      style={{
                        backgroundColor: 'white',
                        borderColor: '#e2e8f0',
                        background: 'white',
                        borderWidth: '1px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                      onClick={() => handleConnectClick(connector.id, connector.name)}
                    >
                      <div className="absolute -top-20 -left-22 w-100 h-100 bg-blue-50/50 rounded-full border-indigo-100/80" />
                      <div className="absolute -top-12 -left-12 w-70 h-70 bg-blue-100/30 rounded-full border-indigo-100/80" />
                      <CardContent className="p-6 z-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Image
                              src={connector.logoPath}
                              alt={`${connector.name} logo`}
                              width={32}
                              height={32}
                              className="object-contain w-8 h-8"
                              priority={false}
                              unoptimized={true}
                            />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-blue-600 truncate">
                              {connector.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnectClick(connector.id, connector.name);
                            }}
                            variant="download"
                            className="flex-1 rounded-full"
                          >
                            {t('interface.connect', 'Connect')}
                          </Button>

                        {hasConnectors && (
                          <div className="relative">
                            {hasMultipleConnectors ? (
                              <div className="relative group">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(connector.id);
                                  }}
                                  className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  {t('interface.manage', 'Manage')}
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                <div className={`absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ${
                                  openDropdownId === connector.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                                }`}>
                                  {userConnectorsForSource.map((userConnector) => (
                                    <button
                                      key={userConnector.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Dropdown manage button clicked for connector:', userConnector.id);
                                        setOpenDropdownId(null); // Close dropdown
                                        if (!showManagementPage && !isManagementOpening) {
                                          console.log('Opening management page from dropdown for connector ID:', userConnector.id);
                                          setIsManagementOpening(true);
                                          setSelectedConnectorId(userConnector.id);
                                          setShowManagementPage(true);
                                          setTimeout(() => {
                                            setIsManagementOpening(false);
                                          }, 500);
                                        }
                                      }}
                                      className="block w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      {userConnector.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Single manage button clicked for connector:', userConnectorsForSource[0].id);
                                  if (!showManagementPage && !isManagementOpening) {
                                    console.log('Opening management page from single button for connector ID:', userConnectorsForSource[0].id);
                                    setIsManagementOpening(true);
                                    setSelectedConnectorId(userConnectorsForSource[0].id);
                                    setShowManagementPage(true);
                                    setTimeout(() => {
                                      setIsManagementOpening(false);
                                    }, 500);
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-2"
                              >
                                {t('interface.manage', 'Manage')}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {hasConnectors && userConnectorsForSource.some(c => c.status === 'active') && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-900">
                            <span className="text-green-600">● {t('interface.active', 'Active')}</span>
                          </div>
                        </div>
                      )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

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
                  • {connector.name} ({connector.source}) - Status: {connector.status} - Access: {connector.access_type}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connector Creation Modal */}
      {showConnectorModal && selectedConnector && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('interface.connect', 'Connect')} {selectedConnector.name}
                </h2>
                <button
                  onClick={() => {
                    setShowConnectorModal(false);
                    setSelectedConnector(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ConnectorFormFactory
                connectorId={selectedConnector.id}
                onSubmit={handleConnectorSubmit}
                onCancel={() => {
                  setShowConnectorModal(false);
                  setSelectedConnector(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Connector Management Page */}
      {showManagementPage && selectedConnectorId && (
        <ConnectorManagementPage
          ccPairId={selectedConnectorId}
          onClose={() => {
            setShowManagementPage(false);
            setSelectedConnectorId(null);
            setIsManagementOpening(false);
          }}
          onConnectorDeleted={() => {
            loadUserConnectors();
          }}
        />
      )}
    </div>
  );
};

export default SmartDriveConnectors; 