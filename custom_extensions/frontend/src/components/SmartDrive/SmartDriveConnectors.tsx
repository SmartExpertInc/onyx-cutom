"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import Image from 'next/image';
import { ChevronDown, Upload, Settings, X, ArrowLeft, HardDrive, Link2, FolderPlus, Search, ArrowDownUp, Check, LayoutGrid, List, Workflow, Plus, FileText, Image as ImageIcon, Video, SlidersHorizontal, ListMinus, FileStack } from 'lucide-react';
import SmartDriveFrame from './SmartDriveFrame';
import SmartDriveBrowser from './SmartDrive/SmartDriveBrowser';
import ManageAddonsModal from '../AddOnsModal';
import ConnectorFormFactory from './connector-forms/ConnectorFormFactory';
import ConnectorManagementPage from './connector-management/ConnectorManagementPage';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { timeEvent, trackConnectConnector } from '@/lib/mixpanelClient';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { EmptySmartDrive } from '../EmptySmartDrive';
import { EmptyConnectors } from '../EmptyConnectors';
import { KnowledgeBaseProduct } from '@/lib/knowledgeBaseSelection';
import MyProductsModalContent, { ModalProduct } from './MyProductsModalContent';

interface ConnectorConfig {
  id: string;
  name: string;
  logoPath: string;
  category: string;
  oauthSupported?: boolean;
}

export type SmartDriveItem = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number | null;
  modified?: string | null;
  mime_type?: string | null;
  etag?: string | null;
};

type UploadProgress = {
  filename: string;
  progress: number; // 0-100
};

type IndexingState = Record<string, { status: 'pending' | 'done' | 'unknown'; etaPct: number; onyxFileId?: number | string; startedAtMs?: number; durationMs?: number }>;

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

type TabKey = 'smart-drive' | 'connectors' | 'my-products';
const MY_PRODUCTS_TAB: TabKey = 'my-products';

interface SmartDriveConnectorsProps {
  className?: string;
  mode?: 'full' | 'select'; // 'select' mode hides upload/folder creation buttons
  onFileSelect?: (files: any[]) => void; // Callback when files are selected
  onTabChange?: (tab: TabKey) => void; // Callback when tab changes
  hideStatsBar?: boolean; // Hide the "Available files/connectors" bar
  onConnectorSelectionChange?: (selectedSources: string[]) => void; // Callback when connector selection changes (select mode only)
  selectedConnectorSources?: string[]; // Controlled list of selected connector sources
  selectionMode?: 'none' | 'connectors'; // Enable connector selection instead of connect/disconnect flow
  enableMyProductsTab?: boolean;
  onProductSelectionChange?: (products: KnowledgeBaseProduct[]) => void;
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

const SmartDriveConnectors: React.FC<SmartDriveConnectorsProps> = ({
  className = '',
  mode = 'full',
  onFileSelect,
  onTabChange,
  hideStatsBar = false,
  onConnectorSelectionChange,
  selectedConnectorSources,
  selectionMode = 'none',
  enableMyProductsTab = false,
  onProductSelectionChange,
}) => {
  console.log('[POPUP_DEBUG] SmartDriveConnectors component rendering');
  
  const { t } = useLanguage();
  const isSelectMode = mode === 'select';
  const [showFrame, setShowFrame] = useState(false);
  const [userConnectors, setUserConnectors] = useState<UserConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState<null | { type: 'connectors' | 'storage'; message: string }>(null);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<{id: string, name: string} | null>(null);
  const [showManagementPage, setShowManagementPage] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<number | null>(null);
  const [isManagementOpening, setIsManagementOpening] = useState(false);
  const [showAllConnectors, setShowAllConnectors] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const [isConnectorFailed, setIsConnectorFailed] = useState(false);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [connectorVisibility, setConnectorVisibility] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabKey>(() => (
    enableMyProductsTab ? MY_PRODUCTS_TAB : 'smart-drive'
  ));
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [hasFiles, setHasFiles] = useState(false);
  const [selectedConnectorSourcesState, setSelectedConnectorSourcesState] = useState<string[]>(selectedConnectorSources || []);
  const allowConnectorSelection = selectionMode === 'connectors';
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const getConnectorsBySource = useCallback((source: string) => {
    return userConnectors.filter(connector => connector.source === source);
  }, [userConnectors]);

  useEffect(() => {
    if (allowConnectorSelection && Array.isArray(selectedConnectorSources)) {
      setSelectedConnectorSourcesState(selectedConnectorSources);
    }
  }, [allowConnectorSelection, selectedConnectorSources]);

  useEffect(() => {
    if (enableMyProductsTab && activeTab === 'smart-drive') {
      setActiveTab(MY_PRODUCTS_TAB);
    }
  }, [enableMyProductsTab, activeTab]);


  // Notify parent when tab changes
  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);
  const handleProductsSelectionChange = useCallback(
    (ids: number[], products: ModalProduct[]) => {
      setSelectedProductIds(ids);
      if (!onProductSelectionChange) return;
      const mappedProducts: KnowledgeBaseProduct[] = products.map((product) => ({
        id: product.id,
        title: product.title,
        type: product.type,
      }));
      onProductSelectionChange(mappedProducts);
    },
    [onProductSelectionChange]
  );
  
  // Handle file selection from SmartDriveBrowser
  const handleFilesSelected = useCallback((filePaths: string[]) => {
    setSelectedFiles(filePaths);
    if (onFileSelect) {
      // Convert paths to file objects with necessary info
      const fileObjects = filePaths.map(path => ({
        path,
        name: path.split('/').pop() || path,
        id: path,
      }));
      onFileSelect(fileObjects);
    }
  }, [onFileSelect]);

  const toggleConnectorSelection = useCallback((sourceId: string) => {
    if (!allowConnectorSelection) return;
    const availableConnectors = getConnectorsBySource(sourceId);
    if (availableConnectors.length === 0) return;

    setSelectedConnectorSourcesState(prev => {
      const exists = prev.includes(sourceId);
      const updated = exists ? prev.filter(id => id !== sourceId) : [...prev, sourceId];
      onConnectorSelectionChange?.(updated);
      return updated;
    });
  }, [allowConnectorSelection, getConnectorsBySource, onConnectorSelectionChange]);
  
  // Handle files loaded callback from SmartDriveBrowser
  const handleFilesLoaded = useCallback((filesExist: boolean) => {
    setHasFiles(filesExist);
  }, []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window === 'undefined') return 'grid';
    const saved = localStorage.getItem('smartDriveViewMode');
    if (saved === 'grid' || saved === 'list') {
      return saved;
    }
    return 'grid';
  });
  
  // Additional state for search and file operations
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [mkdirOpen, setMkdirOpen] = useState(false);
  const [mkdirName, setMkdirName] = useState('');
  const uploadInput = useRef<HTMLInputElement>(null);
  
  // SmartDrive browser state
  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [items, setItems] = useState<SmartDriveItem[]>([]);
  const [smartDriveLoading, setSmartDriveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<UploadProgress[]>([]);
  const [indexing, setIndexing] = useState<IndexingState>({});
  
  // Placeholder objects for filter functionality
  const contentTypeFilterLabels: Record<string, string> = {
    all: 'All',
    documents: 'Documents',
    images: 'Images',
    videos: 'Videos'
  };
  const contentTypeFilterKeys = Object.keys(contentTypeFilterLabels);
  const contentTypeFilterIcons: Record<string, React.ComponentType<any>> = {
    all: ListMinus,
    documents: FileText,
    images: ImageIcon,
    videos: Video
  };
  
  // SmartDrive browser functions
  const fetchList = useCallback(async (path: string) => {
    setSmartDriveLoading(true);
    setError(null);
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`List failed: ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data.files) ? data.files : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
      setItems([]);
    } finally {
      setSmartDriveLoading(false);
    }
  }, [CUSTOM_BACKEND_URL]);

  const createFolder = async () => {
    const name = mkdirName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/mkdir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name}` })
      });
      if (!res.ok) throw new Error(await res.text());
      setMkdirOpen(false);
      setMkdirName('');
      await fetchList(currentPath);
    } catch (e) {
      alert('Failed to create folder');
    } finally {
      setBusy(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    console.log('[SmartDrive] Starting upload:', { filesCount: files.length, currentPath, fileNames: files.map(f => f.name) });
    
    const progress: UploadProgress[] = files.map(f => ({ filename: f.name, progress: 0 }));
    setUploading(progress);
    setBusy(true);
    try {
      const form = new FormData();
      for (const f of files) form.append('files', f);
      const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/upload?path=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
      
      if (!res.ok && res.status !== 207) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      await fetchList(currentPath);
    } catch (e) {
      console.error('[SmartDrive] Upload error:', e);
      alert('Upload failed');
    } finally {
      setUploading([]);
      setBusy(false);
    }
  };

  const onUploadClick = () => uploadInput.current?.click();
  
  const onUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    if (uploadInput.current) uploadInput.current.value = '';
  };

  // Drag and drop handlers
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    await uploadFiles(Array.from(e.dataTransfer.files));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
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

  // Feature-gated connector ids (must match ids above)
  const GATED_CONNECTOR_IDS = useMemo(() => (
    [
      's3', 'r2', 'google_cloud_storage', 'oci_storage', 'sharepoint',
      'teams', 'discourse', 'gong', 'axero', 'mediawiki',
      'bookstack', 'guru', 'slab', 'linear', 'highspot', 'loopio'
    ]
  ), []);

  // Load feature flags for gated connectors
  useEffect(() => {
    const abort = new AbortController();
    const loadFlags = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        const entries = await Promise.all(
          GATED_CONNECTOR_IDS.map(async (id: string) => {
            try {
              const res = await fetch(`${base}/features/check/connector_${id}`, { credentials: 'same-origin', signal: abort.signal });
              if (!res.ok) return [id, false] as const;
              const json = await res.json();
              return [id, Boolean(json?.is_enabled)] as const;
            } catch {
              return [id, false] as const;
            }
          })
        );
        setConnectorVisibility(Object.fromEntries(entries));
      } catch {
        // ignore
      }
    };
    loadFlags();
    return () => abort.abort();
  }, [GATED_CONNECTOR_IDS]);

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

  // Fetch entitlements
  const fetchEntitlements = useCallback(async () => {
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const response = await fetch(`${CUSTOM_BACKEND_URL}/entitlements/me`, {
        credentials: 'same-origin',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[ENTITLEMENTS] Fetched data:', data);
        setEntitlements(data);
      } else {
        console.error('[ENTITLEMENTS] Failed to fetch:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[ENTITLEMENTS] Error fetching entitlements:', error);
    }
  }, []);

  useEffect(() => {
    console.log('[POPUP_DEBUG] useEffect triggered - loading connectors');
    loadUserConnectors();
    fetchEntitlements();
    
    // Set up periodic refresh to update connector statuses and entitlements
    const refreshInterval = setInterval(() => {
      console.log('[POPUP_DEBUG] Periodic refresh of connectors and entitlements...');
      loadUserConnectors();
      fetchEntitlements();
    }, 10000); // Refresh every 10 seconds
    
    return () => {
      console.log('[POPUP_DEBUG] Cleaning up refresh interval');
      clearInterval(refreshInterval);
    };
  }, []); // Remove loadUserConnectors from dependencies to prevent multiple calls

  // SmartDrive browser effect - load files when smart-drive tab is active
  useEffect(() => {
    if (activeTab === 'smart-drive') {
      fetchList(currentPath);
    }
  }, [activeTab, currentPath, fetchList]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('smartDriveViewMode', viewMode);
  }, [viewMode]);

  const handleBrowseClick = () => {
    setShowFrame(true);
  };

  const handleCloseBrowser = () => {
    setShowFrame(false);
  };

  const handleConnectClick = (connectorId: string, connectorName: string) => {
    setIsConnectorFailed(false);
    try {
      timeEvent("Connect Connector");
    } catch (error) {
      console.warn("Failed to track event:", error);
    }
    // Enforce connectors entitlement before opening modal
    const connectorsUsed = entitlements?.connectors_used ?? 0;
    const connectorsLimit = entitlements?.connectors_limit ?? 0;
    if (connectorsLimit && connectorsUsed >= connectorsLimit) {
      setShowQuotaModal({
        type: 'connectors',
        message: `You have reached your connector limit (${connectorsUsed}/${connectorsLimit}).`
      });
      return;
    }
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
    // Enforce connectors entitlement on submit as well (double-check)
    const connectorsUsed = entitlements?.connectors_used ?? 0;
    const connectorsLimit = entitlements?.connectors_limit ?? 0;
    if (connectorsLimit && connectorsUsed >= connectorsLimit) {
      setShowConnectorModal(false);
      setShowQuotaModal({
        type: 'connectors',
        message: `You have reached your connector limit (${connectorsUsed}/${connectorsLimit}).`
      });
      return;
    }
    const connector = Object.values(connectorCategories).flat().find(c => c.id === formData.connector_id);
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
      if (connector) {
        try {
          await trackConnectConnector("Completed", connector.id, connector.name);
        } catch (trackError) {
          console.warn("Failed to track connector completion:", trackError);
        }
      }

      // Close the modal and refresh the connector list
      setShowConnectorModal(false);
      setSelectedConnector(null);
      loadUserConnectors();
    } catch (error) {
      if (connector) {
        setIsConnectorFailed(true);
        try {
          await trackConnectConnector("Failed", connector.id, connector.name);
        } catch (trackError) {
          console.warn("Failed to track connector failure:", trackError);
        }
      }
      console.error("Error creating connector:", error);
      // You might want to show an error message to the user here
    }
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
        <div className="bg-white">
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
        
        {process.env.NEXT_PUBLIC_SMARTDRIVE_IFRAME_ENABLED === 'true' ? (
          <SmartDriveFrame />
        ) : (
          <SmartDriveBrowser 
            mode={isSelectMode ? "select" : "manage"} 
            viewMode={viewMode} 
            contentTypeFilter={contentTypeFilter} 
            searchQuery={search} 
            sortBy={sortBy} 
            sortOrder={sortOrder}
            onFilesSelected={isSelectMode ? handleFilesSelected : undefined}
            onFilesLoaded={handleFilesLoaded}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isSelectMode ? 'pt-4' : ''} ${className}`} onClick={() => setOpenDropdownId(null)}>
      {/* Tabs */}
      <div className="flex justify-between gap-4 mb-2">
          <div className="flex">
            <button
              onClick={() => setActiveTab('smart-drive')}
              className={`flex-1 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative whitespace-nowrap ${
                activeTab === 'smart-drive' 
                  ? 'text-[#719AF5]' 
                  : 'text-[#8D8D95] hover:text-gray-700'
              }`}
            >
              <HardDrive size={16} strokeWidth={1.5} />
              Smart drive
              {activeTab === 'smart-drive' ? (
                <div className="absolute bottom-0 left-0 right-0 border-2 border-[#719AF5] rounded-full"></div>
              ) : (<div className="absolute bottom-0 left-0 right-0 border border-[#B8B8BC] rounded-full"></div>)}
            </button>
            <button
              onClick={() => setActiveTab('connectors')}
              className={`flex-1 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative whitespace-nowrap ${
                activeTab === 'connectors' 
                  ? 'text-[#719AF5]' 
                  : 'text-[#8D8D95] hover:text-gray-700'
              }`}
            >
              <Workflow size={16} strokeWidth={1.5} />
              Connectors
              {activeTab === 'connectors' ? (
                <div className="absolute bottom-0 left-0 right-0 border-2 border-[#719AF5] rounded-full"></div>
              ) : (<div className="absolute bottom-0 left-0 right-0 border border-[#B8B8BC] rounded-full"></div>)}
            </button>
            {enableMyProductsTab && (
              <button
                onClick={() => setActiveTab(MY_PRODUCTS_TAB)}
                className={`flex-1 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative whitespace-nowrap ${
                  activeTab === MY_PRODUCTS_TAB
                    ? 'text-[#719AF5]'
                    : 'text-[#8D8D95] hover:text-gray-700'
                }`}
              >
                <FileStack size={16} strokeWidth={1.5} />
                My products
                {activeTab === MY_PRODUCTS_TAB ? (
                  <div className="absolute bottom-0 left-0 right-0 border-2 border-[#719AF5] rounded-full"></div>
                ) : (<div className="absolute bottom-0 left-0 right-0 border border-[#B8B8BC] rounded-full"></div>)}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            
              {activeTab !== MY_PRODUCTS_TAB && (
              <div className="flex items-center gap-2">
                {activeTab === 'smart-drive' && !isSelectMode && (
                  <Button variant="outline" onClick={onUploadClick} disabled={busy} className="rounded-md text-[#878787] bg-white border border-[#878787] cursor-pointer hover:bg-gray-50 h-9">
                    <Upload className="w-4 h-4 mr-2"/>Upload
                  </Button>
                )}
                  <input ref={uploadInput} type="file" multiple className="hidden" onChange={onUploadChange} />
                {activeTab === 'smart-drive' && !isSelectMode && ( 
                  <Button variant="outline" onClick={()=>{ setMkdirOpen(true); setMkdirName(''); }} disabled={busy} className="rounded-md bg-white border text-[#878787] border-[#878787] cursor-pointer hover:bg-gray-50 h-9">
                    <FolderPlus className="w-4 h-4 mr-2"/>Add Folder
                  </Button>
                )}
                <div className={`relative ${activeTab === 'connectors' ? 'w-45 pt-3' : 'w-70'} h-9`}>
                  <Search className={`absolute left-3 top-1/2 transform ${activeTab === 'connectors' ? 'mt-3' : 'mt-0'} -translate-y-1/2 text-[#71717A] z-10`} size={16} />
                  <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-10 placeholder:text-[#71717A] placeholder:text-sm" />
                </div>
              </div>
              )}
            
            {activeTab === 'smart-drive' && (<div 
              className="flex items-center mt-1 px-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer h-9"
              onClick={() => {
                setSortBy('created');
                // Toggle between newest first (desc) and oldest first (asc)
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              }}
              title={`Sort by creation date: ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}
            >
              <ArrowDownUp size={16} className="text-[#71717A]" />
            </div>)}
            {activeTab === 'smart-drive' && (<div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    type="button"
                    variant="sort" 
                    className="flex bg-white border border-gray-200 items-center gap-2 px-5 text-sm font-semibold h-9"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.1328 9.03369C11.1811 9.03369 12.0569 9.77835 12.2568 10.7681L12.3438 11.1997L12.2568 11.6313C12.0569 12.6211 11.1812 13.3667 10.1328 13.3667C9.08455 13.3666 8.20964 12.621 8.00977 11.6313L7.92188 11.1997L8.00977 10.7681C8.20972 9.77847 9.08462 9.03382 10.1328 9.03369ZM10.1328 9.1001C8.97322 9.10024 8.03334 10.0401 8.0332 11.1997C8.0332 12.3594 8.97312 13.3002 10.1328 13.3003C11.2926 13.3003 12.2334 12.3595 12.2334 11.1997C12.2333 10.04 11.2925 9.1001 10.1328 9.1001ZM1.59961 11.1665H7.4707L7.80566 11.1997L7.4707 11.2329H1.59961C1.58129 11.2328 1.56641 11.2181 1.56641 11.1997C1.56655 11.1815 1.58138 11.1666 1.59961 11.1665ZM12.7959 11.1665H14.3994C14.4177 11.1665 14.4325 11.1815 14.4326 11.1997C14.4326 11.2181 14.4178 11.2329 14.3994 11.2329H12.7959L12.46 11.1997L12.7959 11.1665ZM5.86621 2.6333C6.91458 2.6333 7.79034 3.37885 7.99023 4.36865L8.07617 4.79932L7.99023 5.23193C7.79027 6.22164 6.91452 6.96631 5.86621 6.96631C4.81796 6.96622 3.94211 6.22162 3.74219 5.23193L3.65527 4.79932L3.74219 4.36865C3.94207 3.37891 4.81792 2.63339 5.86621 2.6333ZM5.86621 2.69971C4.7065 2.69981 3.7666 3.64056 3.7666 4.80029C3.76678 5.95988 4.70661 6.8998 5.86621 6.8999C7.0259 6.8999 7.96662 5.95994 7.9668 4.80029C7.9668 3.64049 7.02601 2.69971 5.86621 2.69971ZM1.59961 4.76709H3.2041L3.53906 4.79932L3.2041 4.8335H1.59961C1.58137 4.83343 1.56658 4.81851 1.56641 4.80029C1.56641 4.78193 1.58126 4.76716 1.59961 4.76709ZM8.5293 4.76709H14.3994C14.4178 4.76709 14.4326 4.78191 14.4326 4.80029C14.4324 4.81852 14.4177 4.8335 14.3994 4.8335H8.5293L8.19238 4.79932L8.5293 4.76709Z" fill="#09090B" stroke="#18181B"/>
                    </svg>
                    {contentTypeFilterLabels[contentTypeFilter] || contentTypeFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white rounded-lg shadow-lg border border-[#E4E4E7]">
                  <DropdownMenuLabel className="px-3 py-2 border-b border-[#E4E4E7] bg-white">
                    <p className="font-semibold text-sm text-gray-900">
                      {t("interface.filterBy", "Filter by")}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-[#E4E4E7] text-[#E4E4E7] bg-[#E4E4E7]" />
                  {contentTypeFilterKeys.map((filterKey) => {
                    const Icon = contentTypeFilterIcons[filterKey];
                    const isSelected = contentTypeFilter === filterKey;
                    const filterLabel = contentTypeFilterLabels[filterKey];
                    return (
                      <DropdownMenuItem
                        key={filterKey}
                        onClick={() => setContentTypeFilter(filterKey)}
                        className={`flex items-center justify-between px-2 py-2 text-sm transition-colors bg-white ${
                          isSelected 
                            ? "!bg-[#CCDBFC] text-[#0F58F9] font-medium" 
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`flex items-center gap-3 ${isSelected ? "text-[#0F58F9]" : "text-gray-900"}`}>
                          <Icon 
                            size={16} 
                            stroke={isSelected ? "#3366FF" : "#09090B"}
                            className={isSelected ? "text-[#3366FF]" : "text-gray-900"} 
                            strokeWidth={1.5}
                          />
                          <span className={isSelected ? "text-[#3366FF]" : "text-gray-900"}>{filterLabel}</span>
                        </div>
                        {isSelected && (
                          <Check size={16} className="text-[#3366FF]" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-full p-2 w-9 h-9 flex items-center justify-center ${viewMode === "grid" ? "bg-[#ffffff] text-[#719AF5] border border-[#719AF5] shadow-lg" : "bg-gray-100 text-gray-500"}`}
                >
                  <LayoutGrid strokeWidth={1} className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-full p-2 w-9 h-9 flex items-center justify-center ${viewMode === "list" ? "bg-[#ffffff] text-[#719AF5] border border-[#719AF5] shadow-lg" : "bg-gray-100 text-gray-500"}`}
                >
                  <List strokeWidth={1.5} className="w-6 h-6" />
                </button>
              </div>
            </div>)}
          </div>
        </div>

      {/* Quota Exceeded Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quota Exceeded</h3>
            <p className="text-sm text-gray-700 mb-6">{showQuotaModal.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowQuotaModal(null)}>Close</Button>
              <Button onClick={() => { setShowQuotaModal(null); setShowAddonsModal(true); }} className="text-gray-900">Buy More</Button>
            </div>
          </div>
        </div>
      )}
      {/* Smart Drive Tab Content */}
      {activeTab === 'smart-drive' && (
        <div className={isSelectMode ? 'mt-6' : ''}>
          {/* Usage Progress Bars */}
          {entitlements && !hideStatsBar && (
            <div className="bg-white py-5 mb-3">
              <div className="space-y-4">
                {/* Storage Progress */}
                <div>
                  <div className="space-y-3">
                    {/* Available files, progress bar, and button layout */}
                    <div className="flex items-center justify-between">
                      {/* Available files text on the left */}
                      <div className="text-black font-semibold text-xl">Available files</div>
                      
                      {/* Progress bar section on the right */}
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          {/* Top labels */}
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[#4D4D4D] font-medium text-[11px]">Storage used</span>
                            <span className="text-[#4D4D4D] text-[11px]">
                              {entitlements.storage_used_gb} GB of {entitlements.storage_gb} GB
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className='h-full rounded-full transition-all duration-300 bg-[#719AF5]'
                              style={{
                                width: `${Math.min(
                                  (entitlements.storage_used_gb / entitlements.storage_gb) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          
                          {/* Bottom labels */}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[#878787] text-[11px]">
                              {Math.round((entitlements.storage_used_gb / entitlements.storage_gb) * 100)}% used
                            </span>
                            <span className="text-[#878787] text-[11px]">
                              {entitlements.storage_gb - entitlements.storage_used_gb} GB free
                            </span>
                          </div>
                        </div>
                        
                        {/* Buy more storage button */}
                        {!isSelectMode && (
                          <Button className="bg-[#719AF5] hover:bg-[#5a8ae8] cursor-pointer text-white flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium" onClick={() => setShowAddonsModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Buy more storage
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload progress */}
          {uploading.length > 0 && (
            <div className="space-y-2 mb-4">
              {uploading.map(u => (
                <div key={u.filename} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
                  <div className="w-48 truncate text-sm text-slate-600">{u.filename}</div>
                  <Progress value={u.progress} className="w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Smart Drive Browser Section */}
          <div className="mb-8">
          <div className={`bg-white mb-6 ${isSelectMode ? 'p-4 rounded-lg' : ''}`} onDrop={onDrop} onDragOver={onDragOver}>
            {smartDriveLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : items.length === 0 && !error && isSelectMode ? (
              <EmptySmartDrive />
            ) : process.env.NEXT_PUBLIC_SMARTDRIVE_IFRAME_ENABLED === 'true' ? (
              <SmartDriveFrame />
            ) : (
              <SmartDriveBrowser 
                mode={isSelectMode ? "select" : "manage"} 
                viewMode={viewMode} 
                contentTypeFilter={contentTypeFilter} 
                searchQuery={search} 
                sortBy={sortBy} 
                sortOrder={sortOrder}
                onFilesSelected={isSelectMode ? handleFilesSelected : undefined}
                onFilesLoaded={handleFilesLoaded}
              />
            )}
          </div>
        </div>
        </div>
      )}

      {/* Connectors Tab Content */}
      {activeTab === 'connectors' && (
        <div className={isSelectMode ? 'mt-6' : ''}>
          {/* Usage Stats Header */}
          {entitlements && !hideStatsBar && (
            <div className="bg-white py-4 mb-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Available connectors</h3>
                <div className="flex items-center gap-2">
                  <div className="w-[125px] bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className='h-full rounded-full transition-all duration-300 bg-[#719AF5]'
                      style={{
                        width: `${Math.min(
                          (entitlements.connectors_used / entitlements.connectors_limit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[#797979] pr-4 text-xs">
                    {entitlements.connectors_used}/{entitlements.connectors_limit} used
                  </span>
                  {!isSelectMode && (
                    <Button 
                      className="bg-[#719AF5] px-4 py-3 cursor-pointer text-white rounded-full" 
                      size="sm" 
                      onClick={() => setShowAddonsModal(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Buy more connectors
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show loading or empty state */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : userConnectors.length === 0 && isSelectMode ? (
            <EmptyConnectors />
          ) : (
            <>
              {/* My Connectors Section - Only show connectors that are connected */}
              {(() => {
                const allConnectors = Object.values(connectorCategories).flat();
                const connectedConnectors = allConnectors.filter(connector => {
                  const userConnectorsForSource = getConnectorsBySource(connector.id);
                  return userConnectorsForSource.length > 0;
                });

            // Filter connected connectors by search query
            const filteredConnectedConnectors = connectedConnectors.filter(connector => {
              if (!search.trim()) return true;
              return connector.name.toLowerCase().includes(search.toLowerCase());
            });

            if (filteredConnectedConnectors.length > 0) {
              return (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-regular font-semibold text-[#565656]">My connectors <span className='text-[#797979] text-xs font-regular'>({filteredConnectedConnectors.length})</span></h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredConnectedConnectors.map((connector) => {
                      const userConnectorsForSource = getConnectorsBySource(connector.id);
                      const hasConnectors = true; // We know it has connectors
                      const isActive = true;
                      const isSourceSelected = allowConnectorSelection ? selectedConnectorSourcesState.includes(connector.id) : isActive;
                      const accountCount = userConnectorsForSource.length;

                      return (
                        <div key={connector.id} className="relative">
                          <Card
                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                            style={{
                              backgroundColor: 'white',
                              borderColor: '#e2e8f0',
                              borderWidth: '1px'
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-left flex-col mb-3">
                                <Image
                                  src={connector.logoPath}
                                  alt={`${connector.name} logo`}
                                  width={40}
                                  height={40}
                                  className="object-contain w-10 h-10"
                                  priority={false}
                                  unoptimized={true}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {connector.name}
                                  </h3>
                                  <div className="flex items-center pt-2 gap-2 mt-1">
                                    <span className="text-xs text-gray-600">
                                      {accountCount} Account{accountCount !== 1 ? 's' : ''}
                                    </span>
                                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full pb-2 border-t border-[#E0E0E0]"></div>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    if (userConnectorsForSource.length === 1) {
                                      console.log('Opening management page from view integration for connector ID:', userConnectorsForSource[0].id);
                                      setSelectedConnectorId(userConnectorsForSource[0].id);
                                      setShowManagementPage(true);
                                    } else {
                                      setOpenDropdownId(connector.id);
                                    }
                                  }}
                                  className="text-xs px-2 py-1 bg-white font-medium rounded-sm shadow-sm border border-[#0F58F9] text-[#0F58F9] hover:bg-blue-50"
                                >
                                  View Integration
                                </button>

                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={isSourceSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      if (allowConnectorSelection) {
                                        toggleConnectorSelection(connector.id);
                                      } else {
                                        handleConnectClick(connector.id, connector.name);
                                      }
                                    }}
                                  />
                                  <span className={`slider round ${isSourceSelected ? 'checked' : ''}`}></span>
                                </label>
                              </div>

                              {/* Dropdown for multiple connectors */}
                              {userConnectorsForSource.length > 1 && (
                                <div className={`absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ${
                                  openDropdownId === connector.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                                }`}>
                                  {userConnectorsForSource.map((userConnector) => (
                                    <button
                                      key={userConnector.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdownId(null);
                                        setSelectedConnectorId(userConnector.id);
                                        setShowManagementPage(true);
                                      }}
                                      className="block w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      {userConnector.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Available Connectors Section - Organized by Category */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-regular font-semibold text-[#565656]">More connectors <span className='text-[#797979] text-xs font-regular'>({(() => {
                const allConnectors = Object.values(connectorCategories).flat();
                const availableConnectors = allConnectors.filter(connector => {
                  const userConnectorsForSource = getConnectorsBySource(connector.id);
                  return userConnectorsForSource.length === 0;
                });
                // Apply search filter to count
                const filteredAvailableConnectors = availableConnectors.filter(connector => {
                  if (!search.trim()) return true;
                  return connector.name.toLowerCase().includes(search.toLowerCase());
                });
                return filteredAvailableConnectors.length;
              })()})</span></h3>
            </div>

            {Object.entries(connectorCategories).map(([categoryName, connectors]) => {
              // Filter out connectors that are already connected
              const availableConnectors = connectors.filter(connector => {
                const userConnectorsForSource = getConnectorsBySource(connector.id);
                return userConnectorsForSource.length === 0;
              });

              // Apply search filter to available connectors
              const filteredAvailableConnectors = availableConnectors.filter(connector => {
                if (!search.trim()) return true;
                return connector.name.toLowerCase().includes(search.toLowerCase());
              });

              // Only show category if there are available connectors after filtering
              if (filteredAvailableConnectors.length === 0) return null;

              return (
                <div key={categoryName} className="space-y-4 mb-8">
                  <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-3">
                    {categoryName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAvailableConnectors
                  .filter((connector) => !GATED_CONNECTOR_IDS.includes(connector.id) || connectorVisibility[connector.id])
                  .map((connector) => {
                      return (
                        <div key={connector.id} className="relative">
                          <Card
                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                            style={{
                              backgroundColor: 'white',
                              borderColor: '#e2e8f0',
                              borderWidth: '1px'
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-left flex-col gap-1 mb-3">
                                <Image
                                  src={connector.logoPath}
                                  alt={`${connector.name} logo`}
                                  width={40}
                                  height={40}
                                  className="object-contain w-10 h-10"
                                  priority={false}
                                  unoptimized={true}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {connector.name}
                                  </h3>
                                  <div className="flex items-center h-5 pt-2 gap-2 mt-1">
                                  </div>
                                </div>
                              </div>
                              <div className="w-full pb-2 border-t border-[#E0E0E0]"></div>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    handleConnectClick(connector.id, connector.name);
                                  }}
                                  className="text-xs px-2 py-1 bg-white font-medium rounded-sm shadow-sm border border-gray-200 text-[#878787] hover:bg-gray-50"
                                >
                                  View Integration
                                </button>

                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={false}
                                    onChange={(e) => {
                                      handleConnectClick(connector.id, connector.name);
                                    }}
                                  />
                                  <span className={`slider round`}></span>
                                </label>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
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

      {enableMyProductsTab && (activeTab as TabKey) === MY_PRODUCTS_TAB && (
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
            <MyProductsModalContent onSelectionChange={handleProductsSelectionChange} />
            {selectedProductIds.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">
                Select products to import into your knowledge base.
              </p>
            )}
          </div>
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
                    if (!isConnectorFailed) {
                      try {
                        trackConnectConnector("Clicked", selectedConnector.id, selectedConnector.name);
                      } catch (error) {
                        console.warn("Failed to track connector click:", error);
                      }
                    }
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
                  if (!isConnectorFailed) {
                    try {
                      trackConnectConnector("Clicked", selectedConnector.id, selectedConnector.name);
                    } catch (error) {
                      console.warn("Failed to track connector click:", error);
                    }
                  }
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
      {/* Add-ons Modal */}
      <ManageAddonsModal isOpen={showAddonsModal} onClose={() => setShowAddonsModal(false)} />

      {/* Create Folder Dialog */}
      <Dialog open={mkdirOpen} onOpenChange={setMkdirOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder in the current directory.</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <Input value={mkdirName} onChange={(e) => setMkdirName(e.target.value)} placeholder="Folder name" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMkdirOpen(false)}>Cancel</Button>
            <Button onClick={createFolder} variant="download" className="rounded-full" disabled={!mkdirName.trim() || busy}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SmartDriveConnectors; 