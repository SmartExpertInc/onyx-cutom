"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { KnowledgeBaseSelection, KnowledgeBaseConnector } from "@/lib/knowledgeBaseSelection";

interface ImportFromUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (urls: string[]) => void;
  mode?: "upload" | "knowledgeBase";
  onKnowledgeBaseConfirm?: (payload: {
    selection: KnowledgeBaseSelection;
    connectorSources: string[];
    connectorIds: number[];
  }) => void;
}

export const ImportFromUrlModal: React.FC<ImportFromUrlModalProps> = ({
  isOpen,
  onClose,
  onImport,
  mode = "upload",
  onKnowledgeBaseConfirm,
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [urls, setUrls] = useState(['']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Reset URLs when modal is opened
  useEffect(() => {
    if (isOpen) {
      setUrls(['']);
      setIsProcessing(false);
      setProcessingStatus("");
      setError(null);
    }
  }, [isOpen]);

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
    setError(null);
  };

  const createWebConnector = async (url: string): Promise<{ connector: any; connectorId: number } | null> => {
    try {
      // Parse the URL to extract the base URL
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      
      // Step 1: Create the connector using the Onyx connector creation endpoint
      const connectorResponse = await fetch('/api/manage/admin/connector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Web - ${urlObj.hostname}`,
          source: 'web',
          input_type: 'load_state',
          access_type: 'private',
          connector_specific_config: {
            base_url: baseUrl,
            web_connector_type: 'single',
          },
          refresh_freq: 3600,
          prune_freq: 86400,
          indexing_start: null,
        }),
      });

      if (!connectorResponse.ok) {
        const errorData = await connectorResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed to create connector: ${connectorResponse.statusText}`);
      }

      const connectorData = await connectorResponse.json();
      const connectorId = connectorData.id;

      if (!connectorId) {
        throw new Error('Failed to get connector ID from response');
      }

      // Step 2: Create a mock credential for the web connector (web connectors don't need real credentials)
      const credentialResponse = await fetch('/api/manage/credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential_json: {},
          admin_public: false,
          curator_public: false,
          name: `Web Credential - ${urlObj.hostname}`,
          source: 'web',
        }),
      });

      if (!credentialResponse.ok) {
        // If credential creation fails, try to clean up the connector
        try {
          await fetch(`/api/manage/admin/connector/${connectorId}`, { method: 'DELETE' });
        } catch {}
        
        const errorData = await credentialResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed to create credential: ${credentialResponse.statusText}`);
      }

      const credentialData = await credentialResponse.json();
      const credentialId = credentialData.id;

      // Step 3: Link the connector and credential
      const linkResponse = await fetch(`/api/manage/connector/${connectorId}/credential/${credentialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Web - ${urlObj.hostname}`,
          access_type: 'private',
          groups: [],
          auto_sync_options: {
            enabled: true,
            frequency: 3600,
          },
        }),
      });

      if (!linkResponse.ok) {
        // If linking fails, try to clean up both connector and credential
        try {
          await fetch(`/api/manage/admin/connector/${connectorId}`, { method: 'DELETE' });
          await fetch(`/api/manage/credential/${credentialId}`, { method: 'DELETE' });
        } catch {}
        
        const errorData = await linkResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed to link connector: ${linkResponse.statusText}`);
      }

      return {
        connector: connectorData,
        connectorId: connectorId,
      };
    } catch (error) {
      console.error('Error creating web connector:', error);
      throw error;
    }
  };

  const checkIndexingStatus = async (connectorId: number): Promise<{
    isComplete: boolean;
    status: string | null;
    docsIndexed: number;
    inProgress: boolean;
    errorMsg?: string;
  }> => {
    try {
      const response = await fetch('/api/manage/admin/connector/indexing-status');
      if (!response.ok) {
        throw new Error('Failed to check indexing status');
      }

      const statuses = await response.json();
      const connectorStatus = statuses.find((status: any) => status.connector.id === connectorId);

      if (!connectorStatus) {
        // Connector not found in status yet, still initializing
        return {
          isComplete: false,
          status: 'initializing',
          docsIndexed: 0,
          inProgress: true,
        };
      }

      const lastStatus = connectorStatus.last_status;
      const inProgress = connectorStatus.in_progress || false;
      const docsIndexed = connectorStatus.docs_indexed || 0;

      // Check if indexing is complete
      const isComplete = lastStatus === 'success' && !inProgress && docsIndexed > 0;
      
      // Check for errors
      const hasError = lastStatus === 'failed' || lastStatus === 'error';
      const errorMsg = hasError ? connectorStatus.error_msg : undefined;

      return {
        isComplete,
        status: lastStatus,
        docsIndexed,
        inProgress,
        errorMsg,
      };
    } catch (error) {
      console.error('Error checking indexing status:', error);
      return {
        isComplete: false,
        status: 'unknown',
        docsIndexed: 0,
        inProgress: true,
      };
    }
  };

  const waitForIndexing = async (connectorId: number, maxWaitTime = 300000): Promise<void> => {
    const startTime = Date.now();
    const pollInterval = 3000; // 3 seconds
    let lastDocsCount = 0;

    while (Date.now() - startTime < maxWaitTime) {
      const statusInfo = await checkIndexingStatus(connectorId);
      
      // Update status message based on progress
      if (statusInfo.status === 'initializing' || statusInfo.status === 'not_started') {
        setProcessingStatus(t('interface.importFromUrl.initializing', 'Initializing indexing...'));
      } else if (statusInfo.inProgress) {
        if (statusInfo.docsIndexed > 0) {
          setProcessingStatus(
            t('interface.importFromUrl.indexingProgress', `Indexing in progress... ${statusInfo.docsIndexed} documents indexed.`)
          );
        } else {
          setProcessingStatus(t('interface.importFromUrl.indexing', 'Indexing URL... This may take a moment.'));
        }
        lastDocsCount = statusInfo.docsIndexed;
      }

      // Check for completion
      if (statusInfo.isComplete) {
        setProcessingStatus(
          t('interface.importFromUrl.indexingComplete', `Indexing complete! ${statusInfo.docsIndexed} documents indexed.`)
        );
        return;
      }

      // Check for errors
      if (statusInfo.status === 'failed' || statusInfo.status === 'error') {
        throw new Error(
          statusInfo.errorMsg || 'Indexing failed - please check the connector status manually'
        );
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Timeout - but check if we indexed anything
    if (lastDocsCount > 0) {
      console.warn(`Indexing timeout reached, but ${lastDocsCount} documents were indexed`);
      setProcessingStatus(
        t('interface.importFromUrl.partialSuccess', `Indexing still in progress (${lastDocsCount} documents indexed). You can proceed, but more content may be indexed later.`)
      );
      // Give user a moment to read the message
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }

    throw new Error('Indexing timeout - please check the connector status manually');
  };

  const handleImport = async () => {
    // Filter out empty URLs
    const validUrls = urls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      setError(t('interface.importFromUrl.noUrls', 'Please enter at least one URL'));
      return;
    }

    // Validate URLs
    const invalidUrls = validUrls.filter(url => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      setError(t('interface.importFromUrl.invalidUrls', 'Please enter valid URLs (e.g., https://example.com)'));
      return;
    }
    
    if (mode === "knowledgeBase" && onKnowledgeBaseConfirm) {
      setIsProcessing(true);
      setError(null);

      try {
        const createdConnectors: KnowledgeBaseConnector[] = [];
        
        for (let i = 0; i < validUrls.length; i++) {
          const url = validUrls[i];
          const urlNumber = i + 1;
          const totalUrls = validUrls.length;
          
          setProcessingStatus(
            t('interface.importFromUrl.creatingConnector', `Creating connector for URL ${urlNumber} of ${totalUrls}...`)
          );

          const result = await createWebConnector(url);
          if (result) {
            createdConnectors.push({
              id: result.connectorId,
              source: 'web',
              name: result.connector.name,
            });

            // Wait for indexing to complete
            setProcessingStatus(
              t('interface.importFromUrl.indexingUrl', `Indexing URL ${urlNumber} of ${totalUrls}...`)
            );
            await waitForIndexing(result.connectorId);
          }
        }

        if (createdConnectors.length > 0) {
          const selection: KnowledgeBaseSelection = {
            filePaths: [],
            connectors: createdConnectors,
          };

          const connectorIds = createdConnectors.map(c => c.id);
          const connectorSources = createdConnectors.map(c => c.source);

          onKnowledgeBaseConfirm({
            selection,
            connectorSources,
            connectorIds,
          });
        }

        setIsProcessing(false);
        onClose();
      } catch (error: any) {
        console.error('Error processing URLs:', error);
        setError(error.message || t('interface.importFromUrl.error', 'Failed to process URLs. Please try again.'));
        setIsProcessing(false);
      }
    } else {
      // Legacy upload mode (fallback)
    if (onImport) {
      onImport(validUrls);
    }
    
    // Create placeholder files for URLs
    const urlFiles = validUrls.map((url) => {
      try {
        const urlObj = new URL(url);
        const fileName = urlObj.hostname + urlObj.pathname;
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: fileName,
          extension: '.url',
            url: url,
        };
      } catch (error) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: url,
          extension: '.url',
          url: url,
        };
      }
    });
    
    localStorage.setItem('uploadedFiles', JSON.stringify(urlFiles));
    
    if (typeof window !== 'undefined') {
      (window as any).pendingUploadFiles = urlFiles.map(file => ({
        name: file.name + file.extension,
        size: 0,
        type: 'text/uri-list',
        lastModified: Date.now(),
        url: file.url,
      }));
    }
    
    onClose();
    router.push('/create/from-files-new/upload');
    }
  };

  const handleCancel = () => {
    setUrls(['']); // Reset URLs
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
      }}
      onClick={isProcessing ? undefined : handleCancel}
    >
      <div 
        className="rounded-xl p-6 w-full max-w-lg"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
          boxShadow: '4px 4px 8px 0px #0000000D',
          border: '1px solid #E0E0E0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-[#171718] mb-1">
          {t('interface.importFromUrl.title', 'Import from URL')}
        </h2>

        {/* Description */}
        <p className="text-sm text-[#878787] mb-6">
          {isProcessing
            ? t('interface.importFromUrl.processingDescription', 'Please wait while we process and index your URLs...')
            : t('interface.importFromUrl.description', 'This will extract the text from the webpage you enter.')}
        </p>

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800">{processingStatus}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* URL inputs */}
        {!isProcessing && (
          <>
        <div className="space-y-3 mb-6">
          {urls.map((url, index) => (
            <div key={index}>
              <label className="block text-md font-semibolld text-[#171718] mb-2">
                {t('interface.importFromUrl.urlLabel', 'URL')}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder={t('interface.importFromUrl.urlPlaceholder', 'https://example.com/')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-[#5D5D7980] text-[#09090B]"
                style={{
                  backgroundColor: '#FFFFFF',
                }}
                    disabled={isProcessing}
              />
            </div>
          ))}
        </div>

        {/* Add another URL button */}
        <button
          onClick={handleAddUrl}
              className="text-xs text-[#498FFF] mb-6 flex items-center gap-2 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.99961 2.09961C7.38621 2.09961 7.69961 2.41301 7.69961 2.79961V6.29961H11.1996C11.5862 6.29961 11.8996 6.61301 11.8996 6.99961C11.8996 7.38621 11.5862 7.69961 11.1996 7.69961H7.69961V11.1996C7.69961 11.5862 7.38621 11.8996 6.99961 11.8996C6.61301 11.8996 6.29961 11.5862 6.29961 11.1996V7.69961H2.79961C2.41301 7.69961 2.09961 7.38621 2.09961 6.99961C2.09961 6.61301 2.41301 6.29961 2.79961 6.29961L6.29961 6.29961V2.79961C6.29961 2.41301 6.61301 2.09961 6.99961 2.09961Z" fill="#498FFF"/>
          </svg>
          {t('interface.importFromUrl.addAnotherUrl', 'Add another URL')}
        </button>
          </>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          {!isProcessing && (
            <>
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              color: '#0F58F9',
              backgroundColor: 'white',
              border: '1px solid #0F58F9',
            }}
                disabled={isProcessing}
          >
            {t('interface.importFromUrl.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleImport}
                className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#0F58F9',
            }}
                disabled={isProcessing}
          >
            {t('interface.importFromUrl.import', 'Import')}
          </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

