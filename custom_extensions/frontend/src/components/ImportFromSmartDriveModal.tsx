"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import SmartDriveConnectors from "@/components/SmartDrive/SmartDriveConnectors";
import { trackImportFiles } from "@/lib/mixpanelClient";

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
}

export const ImportFromSmartDriveModal: React.FC<ImportFromSmartDriveModalProps> = ({
  isOpen,
  onClose,
  onImport,
  selectedFiles,
  mode = "upload",
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'smart-drive' | 'connectors'>('smart-drive');
  const [localSelectedFileObjects, setLocalSelectedFileObjects] = useState<any[]>([]);
  const [selectedFilePaths, setSelectedFilePaths] = useState<string[]>([]);
  const [selectedConnectorSources, setSelectedConnectorSources] = useState<string[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const selectedConnectorRecords = useMemo(() => {
    if (!isKnowledgeBaseMode) return [];
    const sourceSet = new Set(selectedConnectorSources);
    return connectors.filter((connector) => sourceSet.has(connector.source));
  }, [connectors, isKnowledgeBaseMode, selectedConnectorSources]);

  const selectedConnectorIds = useMemo(() => {
    if (!isKnowledgeBaseMode) return [];
    return selectedConnectorRecords.map((connector) => connector.id);
  }, [isKnowledgeBaseMode, selectedConnectorRecords]);

  const hasUploadSelection = useMemo(() => {
    const providedCount = Array.isArray(selectedFiles) ? selectedFiles.length : 0;
    return providedCount > 0 || localSelectedFileObjects.length > 0;
  }, [localSelectedFileObjects, selectedFiles]);

  const hasKnowledgeBaseSelection = useMemo(() => {
    return selectedFilePaths.length > 0 || selectedConnectorIds.length > 0;
  }, [selectedConnectorIds, selectedFilePaths]);

  const knowledgeBaseFiles = useMemo(() => {
    if (!isKnowledgeBaseMode) return [];
    if (localSelectedFileObjects.length > 0) {
      return localSelectedFileObjects.map((file) => ({
        id: file.id || file.path || file.name,
        name: file.name || (file.path ? file.path.split('/').pop() : '') || 'File',
        path: file.path || file.id || file.name,
      }));
    }

    return selectedFilePaths.map((path) => ({
      id: path,
      name: (path.split('/').pop() || path) || 'File',
      path,
    }));
  }, [isKnowledgeBaseMode, localSelectedFileObjects, selectedFilePaths]);

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
    if (!isOpen) {
      setLocalSelectedFileObjects([]);
      setSelectedFilePaths([]);
      setSelectedConnectorSources([]);
      setShowConfirmation(false);
      setActiveTab('smart-drive');
    }
  }, [isOpen]);

  useEffect(() => {
    if (showConfirmation && !hasKnowledgeBaseSelection) {
      setShowConfirmation(false);
    }
  }, [showConfirmation, hasKnowledgeBaseSelection]);

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

    if (hasConnectors) {
      const connectorSourcesForTracking: string[] = Array.from(
        new Set(selectedConnectorRecords.map((connector) => connector.source).filter(Boolean))
      );
      trackImportFiles('Connectors', connectorSourcesForTracking);
    } else if (hasFiles) {
      const fileExtensionsForTracking: string[] = Array.from(
        new Set(
          filesToImport
            .map((filePath) => {
              try {
                const name = (filePath.split('/').pop() || filePath).split('?')[0];
                const parts = name.split('.');
                return parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
              } catch {
                return undefined;
              }
            })
            .filter((ext): ext is string => !!ext)
        )
      );
      trackImportFiles('Files', fileExtensionsForTracking);
    }

    const combinedContext: any = { timestamp: Date.now() };
    const searchParams = new URLSearchParams();

    if (hasConnectors && hasFiles) {
      combinedContext.fromConnectors = true;
      combinedContext.connectorIds = selectedConnectorIds;
      combinedContext.connectorSources = selectedConnectorRecords.map((connector) => connector.source || 'unknown');
      combinedContext.selectedFiles = filesToImport;

      searchParams.set('fromConnectors', 'true');
      searchParams.set('connectorIds', selectedConnectorIds.join(','));
      searchParams.set('connectorSources', combinedContext.connectorSources.join(','));
      searchParams.set('selectedFiles', filesToImport.join(','));
    } else if (hasConnectors) {
      combinedContext.fromConnectors = true;
      combinedContext.connectorIds = selectedConnectorIds;
      combinedContext.connectorSources = selectedConnectorRecords.map((connector) => connector.source || 'unknown');

      searchParams.set('fromConnectors', 'true');
      searchParams.set('connectorIds', selectedConnectorIds.join(','));
      searchParams.set('connectorSources', combinedContext.connectorSources.join(','));
    } else if (hasFiles) {
      combinedContext.fromConnectors = true;
      combinedContext.selectedFiles = filesToImport;
      combinedContext.connectorIds = [];
      combinedContext.connectorSources = [];

      searchParams.set('fromConnectors', 'true');
      searchParams.set('selectedFiles', filesToImport.join(','));
    }

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
      if (!showConfirmation) {
        if (!hasKnowledgeBaseSelection) return;
        setShowConfirmation(true);
        return;
      }
      handleKnowledgeBaseImport();
      return;
    } else {
      handleUploadImport();
    }
  };

  const showImportButton = isKnowledgeBaseMode ? hasKnowledgeBaseSelection : hasUploadSelection;

  const selectedSourcesForChild = useMemo(() => {
    if (!isKnowledgeBaseMode) return undefined;
    return selectedConnectorSources;
  }, [isKnowledgeBaseMode, selectedConnectorSources]);

  const handleAddMore = () => {
    setShowConfirmation(false);
  };

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
          {showConfirmation
            ? t('interface.fromFiles.upload.addMoreOrContinue', 'Would you like to add more files or continue?')
            : activeTab === 'connectors' 
            ? t('interface.importFromSmartDrive.selectConnector', 'Select a connector') 
            : t('interface.importFromSmartDrive.selectFile', 'Select a file')}
        </h2>

        {/* SmartDrive Connectors Component */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {showConfirmation ? (
            <div className="space-y-6">
              {selectedConnectorRecords.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {t('interface.fromFiles.selectedConnectors', 'Selected connectors')}
                  </h3>
                  <div className="space-y-2">
                    {selectedConnectorRecords.map((connector) => (
                      <div
                        key={connector.id}
                        className="flex items-center justify-between text-sm text-gray-700 border border-gray-100 rounded-lg px-3 py-2 bg-white"
                      >
                        <span className="font-medium truncate mr-3">{connector.name}</span>
                        <span className="text-xs text-gray-500 uppercase">{connector.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {knowledgeBaseFiles.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {t('interface.fromFiles.selectedFiles', 'Selected files')}
                  </h3>
                  <div className="space-y-2">
                    {knowledgeBaseFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between text-sm text-gray-700 border border-gray-100 rounded-lg px-3 py-2 bg-white"
                      >
                        <span className="font-medium truncate mr-3" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[45%]" title={file.path}>
                          {file.path}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedConnectorRecords.length === 0 && knowledgeBaseFiles.length === 0 && (
                <div className="text-sm text-gray-500">
                  {t('interface.fromFiles.noSelections', 'No selections yet.')}
                </div>
              )}
            </div>
          ) : (
          <SmartDriveConnectors 
            mode="select" 
            onTabChange={handleTabChange} 
            hideStatsBar={true}
            onFileSelect={handleFileSelection}
              onConnectorSelectionChange={isKnowledgeBaseMode ? setSelectedConnectorSources : undefined}
              selectedConnectorSources={selectedSourcesForChild}
              selectionMode={isKnowledgeBaseMode ? 'connectors' : 'none'}
          />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          {showConfirmation ? (
            <>
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
              <button
                onClick={handleAddMore}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  color: '#0F58F9',
                  backgroundColor: 'white',
                  border: '1px solid #0F58F9',
                }}
              >
                {t('interface.fromFiles.upload.addMoreFiles', 'Add more files')}
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{
                  backgroundColor: '#0F58F9',
                }}
              >
                {t('interface.continue', 'Continue')}
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

