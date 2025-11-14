"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import SmartDriveConnectors from "@/components/SmartDrive/SmartDriveConnectors";
import {
  KnowledgeBaseConnector,
  KnowledgeBaseSelection,
  buildKnowledgeBaseContext,
} from "@/lib/knowledgeBaseSelection";

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

interface ImportFromSmartDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: () => void;
  selectedFiles?: any[]; // Files selected from SmartDrive
  mode?: "upload" | "knowledgeBase";
  selectedKnowledgeBaseFilePaths?: string[];
  selectedConnectorSources?: string[];
  onKnowledgeBaseConfirm?: (payload: {
    selection: KnowledgeBaseSelection;
    connectorSources: string[];
    connectorIds: number[];
  }) => void;
}

export const ImportFromSmartDriveModal: React.FC<ImportFromSmartDriveModalProps> = ({
  isOpen,
  onClose,
  onImport,
  selectedFiles,
  mode = "upload",
  selectedKnowledgeBaseFilePaths,
  selectedConnectorSources: externalConnectorSources,
  onKnowledgeBaseConfirm,
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'smart-drive' | 'connectors'>('smart-drive');
  const [localSelectedFileObjects, setLocalSelectedFileObjects] = useState<any[]>([]);
  const [selectedFilePaths, setSelectedFilePaths] = useState<string[]>([]);
  const [selectedConnectorSources, setSelectedConnectorSources] = useState<string[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);

  const isKnowledgeBaseMode = mode === "knowledgeBase";

  const handleFileSelection = useCallback((files: any[]) => {
    setLocalSelectedFileObjects(files);
    if (mode === "knowledgeBase") {
      const paths = files
        .map((file) => {
          if (typeof file === "string") return file;
          if (file?.path) return file.path;
          if (file?.id && typeof file.id === "string") return file.id;
          return undefined;
        })
        .filter((value): value is string => typeof value === "string" && value.length > 0);
      setSelectedFilePaths(paths);
    }
  }, [mode]);

  const handleTabChange = useCallback((tab: 'smart-drive' | 'connectors') => {
    setActiveTab(tab);
  }, []);

  const hasUploadSelection = useMemo(() => {
    const providedCount = Array.isArray(selectedFiles) ? selectedFiles.length : 0;
    return providedCount > 0 || localSelectedFileObjects.length > 0;
  }, [localSelectedFileObjects, selectedFiles]);

  const selectedConnectorIds = useMemo(() => {
    if (!isKnowledgeBaseMode) return [];
    return connectors
      .filter((connector) => selectedConnectorSources.includes(connector.source))
      .map((connector) => connector.id);
  }, [connectors, isKnowledgeBaseMode, selectedConnectorSources]);

  const hasKnowledgeBaseSelection = useMemo(() => {
    return selectedFilePaths.length > 0 || selectedConnectorIds.length > 0;
  }, [selectedConnectorIds, selectedFilePaths]);

  const loadConnectors = useCallback(async () => {
    if (!isKnowledgeBaseMode || !isOpen) return;
    try {
      const response = await fetch('/api/manage/admin/connector/status', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connectors: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const privateConnectors = data
        .filter((connectorStatus: any) => connectorStatus.access_type === 'private')
        .map((connectorStatus: any) => ({
          id: connectorStatus.cc_pair_id,
          name: connectorStatus.name || `Connector ${connectorStatus.cc_pair_id}`,
          source: connectorStatus.connector.source,
          status: connectorStatus.connector.status || 'unknown',
          last_sync_at: connectorStatus.last_sync_at,
          total_docs_indexed: connectorStatus.total_docs_indexed || 0,
          last_error: connectorStatus.last_error,
          access_type: connectorStatus.access_type,
        }));

      setConnectors(privateConnectors);
    } catch (error) {
      console.error('Failed to load connectors:', error);
      setConnectors([]);
    }
  }, [isKnowledgeBaseMode, isOpen]);

  useEffect(() => {
    if (isKnowledgeBaseMode) {
      loadConnectors();
    }
  }, [isKnowledgeBaseMode, loadConnectors]);

  useEffect(() => {
    if (isKnowledgeBaseMode && Array.isArray(selectedKnowledgeBaseFilePaths)) {
      setSelectedFilePaths(selectedKnowledgeBaseFilePaths);
      setLocalSelectedFileObjects(
        selectedKnowledgeBaseFilePaths.map((path) => ({
          path,
          id: path,
          name: path.split("/").pop() || path,
        }))
      );
    }
  }, [isKnowledgeBaseMode, selectedKnowledgeBaseFilePaths]);

  useEffect(() => {
    if (isKnowledgeBaseMode && Array.isArray(externalConnectorSources)) {
      setSelectedConnectorSources(externalConnectorSources);
    }
  }, [externalConnectorSources, isKnowledgeBaseMode]);

  useEffect(() => {
    if (!isOpen) {
      setLocalSelectedFileObjects([]);
      setSelectedFilePaths([]);
      setSelectedConnectorSources([]);
      setActiveTab('smart-drive');
    }
  }, [isOpen]);

  const handleKnowledgeBaseImport = () => {
    if (!hasKnowledgeBaseSelection) {
      onClose();
      return;
    }

    const filesToImport = selectedFilePaths;
    const hasFiles = filesToImport.length > 0;
    const hasConnectors = selectedConnectorIds.length > 0;

    if (!hasFiles && !hasConnectors) {
      onClose();
      return;
    }

    const selectedConnectorRecords = connectors.filter((connector) =>
      selectedConnectorIds.includes(connector.id)
    );

    const selection: KnowledgeBaseSelection = {
      filePaths: filesToImport,
      connectors: selectedConnectorRecords.map(
        (connector): KnowledgeBaseConnector => ({
          id: connector.id,
          name: connector.name,
          source: connector.source,
        })
      ),
    };

    if (onKnowledgeBaseConfirm) {
      onKnowledgeBaseConfirm({
        selection,
        connectorSources: selectedConnectorRecords.map((connector) => connector.source || "unknown"),
        connectorIds: selectedConnectorIds,
      });
      onImport?.();
      onClose();
      return;
    }

    const { combinedContext, searchParams, connectorSources } = buildKnowledgeBaseContext(selection);
    
    try {
      sessionStorage.setItem('combinedContext', JSON.stringify(combinedContext));
    } catch (error) {
      console.error('[ImportFromSmartDriveModal] Failed to store combinedContext:', error);
    }

    const finalUrl = `/create/generate?${searchParams.toString()}`;

    try {
      router.push(finalUrl);
    } catch (error) {
      console.error('[ImportFromSmartDriveModal] router.push failed:', error);
      if (typeof window !== 'undefined') {
        window.location.href = finalUrl;
      }
    } finally {
      onImport?.();
      onClose();
    }
  };

  const handleUploadImport = () => {
    // Call the optional onImport callback if provided
    if (onImport) {
      onImport();
    }
    
    // Get selected files from SmartDrive
    const filesToImport = selectedFiles || localSelectedFileObjects;
    
    if (filesToImport.length === 0) {
      console.log('No files selected from Smart Drive');
      onClose();
      return;
    }
    
    // Create placeholder files for SmartDrive files
    const smartDriveFiles = filesToImport.map((file) => {
      const nameParts = file.name ? file.name.split('.') : ['SmartDrive File'];
      const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '.smartdrive';
      const name = nameParts.join('.');
      
      return {
        id: file.id || Math.random().toString(36).substr(2, 9),
        name: name,
        extension: extension,
        smartDriveFile: true,
        originalFile: file,
      };
    });
    
    // Store SmartDrive files metadata in localStorage
    localStorage.setItem('uploadedFiles', JSON.stringify(smartDriveFiles));
    
    // Store the actual SmartDrive file data in a temporary location
    if (typeof window !== 'undefined') {
      (window as any).pendingUploadFiles = smartDriveFiles.map(file => ({
        name: file.name + file.extension,
        size: file.originalFile?.size || 0,
        type: file.originalFile?.type || 'application/octet-stream',
        lastModified: Date.now(),
        smartDriveFile: true,
        originalFile: file.originalFile,
      }));
    }
    
    onClose();
    
    // Navigate to upload page
    router.push('/create/from-files-new/upload');
  };

  const handleImport = () => {
    if (isKnowledgeBaseMode) {
      handleKnowledgeBaseImport();
    } else {
      handleUploadImport();
    }
  };

  const showImportButton = isKnowledgeBaseMode ? hasKnowledgeBaseSelection : hasUploadSelection;

  const selectedSourcesForChild = useMemo(() => {
    if (!isKnowledgeBaseMode) return undefined;
    return selectedConnectorSources;
  }, [isKnowledgeBaseMode, selectedConnectorSources]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
      }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg p-6 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
          boxShadow: '4px 4px 8px 0px #0000000D',
          border: '1px solid #E0E0E0',
          width: '95vw',
          height: '95vh',
          maxHeight: '95vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">
          {activeTab === 'connectors' 
            ? t('interface.importFromSmartDrive.selectConnector', 'Select a connector') 
            : t('interface.importFromSmartDrive.selectFile', 'Select a file')}
        </h2>

        {/* SmartDrive Connectors Component */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <SmartDriveConnectors 
            mode="select" 
            onTabChange={handleTabChange} 
            hideStatsBar={true}
            onFileSelect={handleFileSelection}
            onConnectorSelectionChange={isKnowledgeBaseMode ? setSelectedConnectorSources : undefined}
            selectedConnectorSources={selectedSourcesForChild}
            selectionMode={isKnowledgeBaseMode ? 'connectors' : 'none'}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              color: '#0F58F9',
              backgroundColor: 'white',
              border: '1px solid #0F58F9',
            }}
          >
            {t('interface.importFromSmartDrive.cancel', 'Cancel')}
          </button>
          {showImportButton && (
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{
                backgroundColor: '#0F58F9',
              }}
            >
              {t('interface.importFromSmartDrive.import', 'Import')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

