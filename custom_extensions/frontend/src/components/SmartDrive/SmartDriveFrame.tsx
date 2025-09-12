"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartDriveFrameProps {
  className?: string;
  onFilesSelected?: (files: string[]) => void;
  selectedFiles?: string[];
}

const SmartDriveFrame: React.FC<SmartDriveFrameProps> = ({ 
  className = '', 
  onFilesSelected,
  selectedFiles = []
}) => {
  const [syncing, setSyncing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState<string | null>(null);
  const [autoSyncCount, setAutoSyncCount] = useState(0);
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<string[]>(selectedFiles);

  // Initialize SmartDrive session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await fetch('/api/custom-projects-backend/smartdrive/session', {
          method: 'POST',
          credentials: 'same-origin',
        });
        if (response.ok) {
          const data = await response.json();
          setHasCredentials(data.has_credentials || false);
          if (!data.has_credentials) {
            console.log('No credentials detected, showing auth options');
          }
        }
      } catch (error) {
        console.error('Failed to initialize SmartDrive session:', error);
        setHasCredentials(false);
      }
    };

    initializeSession();
  }, []);

  // Update internal state when selectedFiles prop changes
  useEffect(() => {
    setInternalSelectedFiles(selectedFiles);
  }, [selectedFiles]);

  // Set up postMessage event listener for iframe communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Enhanced debug logging
      console.log('[SmartDriveFrame DEBUG] Message received:', {
        origin: event.origin,
        hostname: window.location.hostname,
        originMatch: event.origin.includes(window.location.hostname),
        type: event.data?.type,
        dataKeys: event.data?.data ? Object.keys(event.data.data) : 'no data',
        timestamp: new Date().toISOString()
      });

      // Verify origin for security
      if (!event.origin.includes(window.location.hostname)) {
        console.log('[SmartDriveFrame DEBUG] Message rejected - origin mismatch');
        return;
      }

      const { type, data } = event.data;
      console.log('[SmartDriveFrame DEBUG] Processing message type:', type, 'with data:', data);

      switch (type) {
        case 'fileSelectionUpdate':
          // New format: receives complete list of selected files
          if (data && Array.isArray(data.selectedFiles)) {
            console.log('[SmartDriveFrame DEBUG] File selection update:', {
              previousCount: internalSelectedFiles.length,
              newCount: data.selectedFiles.length,
              files: data.selectedFiles,
              lastAction: data.lastAction,
              lastFile: data.lastFile,
              clickCount: data.clickCount
            });
            setInternalSelectedFiles(data.selectedFiles);
          } else {
            console.log('[SmartDriveFrame DEBUG] Invalid file selection data:', data);
          }
          break;
          
        // Legacy support for individual select/deselect actions
        case 'select':
          if (data && data.filePath) {
            console.log('[SmartDriveFrame DEBUG] Legacy select:', data.filePath);
            setInternalSelectedFiles(prev => {
              const updated = [...prev, data.filePath];
              return Array.from(new Set(updated)); // Remove duplicates
            });
          }
          break;
          
        case 'deselect':
          if (data && data.filePath) {
            console.log('[SmartDriveFrame DEBUG] Legacy deselect:', data.filePath);
            setInternalSelectedFiles(prev => prev.filter(path => path !== data.filePath));
          }
          break;
          
        case 'clear':
          console.log('[SmartDriveFrame DEBUG] Clear selection');
          setInternalSelectedFiles([]);
          break;
          
        default:
          console.log('[SmartDriveFrame DEBUG] Unknown message type:', type, 'Full event:', event.data);
      }
    };

    console.log('[SmartDriveFrame DEBUG] Message listener setup complete');
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [internalSelectedFiles]);

  // Notify parent component when file selection changes
  useEffect(() => {
    console.log('[SmartDriveFrame DEBUG] Internal files changed:', {
      fileCount: internalSelectedFiles.length,
      files: internalSelectedFiles,
      hasCallback: !!onFilesSelected
    });
    
    if (onFilesSelected) {
      console.log('[SmartDriveFrame DEBUG] Calling parent callback with:', internalSelectedFiles);
      onFilesSelected(internalSelectedFiles);
      console.log('[SmartDriveFrame DEBUG] Parent callback completed');
    } else {
      console.log('[SmartDriveFrame DEBUG] No parent callback provided');
    }
  }, [internalSelectedFiles, onFilesSelected]);

  // Auto-sync functionality with page visibility detection
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const isPageVisible = () => {
      return typeof document !== 'undefined' && !document.hidden;
    };

    if (autoSyncEnabled && hasCredentials && isPageVisible()) {
      intervalId = setInterval(async () => {
        // Only auto-sync if page is visible, not currently syncing manually, and conditions are met
        if (isPageVisible() && !isLoading && syncStatus !== 'syncing') {
          await performAutoSync();
        }
      }, 3000); // Every 3 seconds
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && intervalId) {
        // Page became hidden, clear interval
        clearInterval(intervalId);
        intervalId = null;
      } else if (!document.hidden && autoSyncEnabled && hasCredentials && !intervalId) {
        // Page became visible, restart interval
        intervalId = setInterval(async () => {
          if (isPageVisible() && !isLoading && syncStatus !== 'syncing') {
            await performAutoSync();
          }
        }, 3000);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup interval and event listener
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [autoSyncEnabled, hasCredentials, isLoading, syncStatus]);

  const checkCredentials = async () => {
    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/session', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await response.json();
      setHasCredentials(data.has_credentials || false);
      if (!data.has_credentials) {
        setShowCredentials(true);
      }
    } catch (error) {
      console.error('Failed to check credentials:', error);
      setHasCredentials(false);
    }
  };

  // NEW: Nextcloud Login Flow v2 - Much more user-friendly!
  const handleNextcloudAuth = async () => {
    try {
      setIsAuthenticating(true);
      
      // Ask user for their Nextcloud server URL
      const serverUrl = prompt(
        'Enter your Nextcloud server URL (must be HTTPS):\n\nUse the default URL below (proxied through this server) or your direct HTTPS Nextcloud URL:', 
        `https://${window.location.host}/smartdrive`
      );
      
      if (!serverUrl) {
        setIsAuthenticating(false);
        return;
      }

      // Check for mixed content issues
      if (window.location.protocol === 'https:' && serverUrl.startsWith('http:')) {
        alert(
          'Security Error: Cannot connect to HTTP Nextcloud server from HTTPS page.\n\n' +
          'Please use an HTTPS URL (e.g., https://your-server) or access this page over HTTP.'
        );
        setIsAuthenticating(false);
        return;
      }

      // Step 1: Initialize Login Flow v2
      const initResponse = await fetch(`${serverUrl}/index.php/login/v2`, {
        method: 'POST',
      });

      if (!initResponse.ok) {
        throw new Error(`Failed to initialize login flow: ${initResponse.statusText}`);
      }

      const { poll, login } = await initResponse.json();
      
      // Step 2: Open Nextcloud login in new window
      const authWindow = window.open(
        login,
        'nextcloud-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (!authWindow) {
        alert('Please allow pop-ups for this site and try again.');
        setIsAuthenticating(false);
        return;
      }

      // Step 3: Poll for completion
      const pollForCredentials = async () => {
        try {
          const pollResponse = await fetch(poll.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `token=${encodeURIComponent(poll.token)}`
          });

          if (pollResponse.status === 404) {
            // Still waiting for user to complete auth
            setTimeout(pollForCredentials, 1000); // Poll every second
            return;
          }

          if (pollResponse.ok) {
            // Success! Got credentials
            const credentials = await pollResponse.json();
            console.log('Received Nextcloud credentials:', {
              server: credentials.server,
              loginName: credentials.loginName,
              hasPassword: !!credentials.appPassword
            });

            // Close the auth window
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }

            // Store the credentials
            await saveCredentials({
              nextcloud_username: credentials.loginName,
              nextcloud_password: credentials.appPassword,
              nextcloud_base_url: credentials.server
            });

            setHasCredentials(true);
            setIsAuthenticating(false);
            alert('Successfully connected to Nextcloud! 🎉');
            
          } else {
            throw new Error(`Polling failed: ${pollResponse.statusText}`);
          }
        } catch (error) {
          console.error('Polling error:', error);
          setTimeout(pollForCredentials, 2000); // Retry in 2 seconds
        }
      };

      // Start polling
      setTimeout(pollForCredentials, 1000);

      // Monitor if user closes auth window manually
      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkClosed);
          setIsAuthenticating(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Nextcloud authentication error:', error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsAuthenticating(false);
    }
  };

  const saveCredentials = async (credentials: any) => {
    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save credentials');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  };

  // Legacy manual credentials setup (fallback)
  const handleSetCredentials = async () => {
    // This becomes a fallback option
    setShowCredentials(true);
  };

  const handleSyncToOnyx = async () => {
    if (!hasCredentials) {
      alert('Please connect your Nextcloud account first!');
      return;
    }

    try {
      setIsLoading(true);
      setSyncStatus('syncing');
      
      const response = await fetch('/api/custom-projects-backend/smartdrive/import-new', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const result = await response.json();
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString());
        setIframeKey(prev => prev + 1); // Refresh iframe
        alert(`Successfully synced ${result.imported_count || 0} files!`);
      } else {
        const errorData = await response.json();
        setSyncStatus('error');
        if (errorData.detail?.includes('credentials')) {
          setHasCredentials(false);
          alert('Please reconnect your Nextcloud account!');
        } else {
          alert(`Sync failed: ${errorData.detail || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      alert('Failed to sync files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-sync function (completely silent, no iframe refresh)
  const performAutoSync = async () => {
    if (!hasCredentials) {
      return;
    }

    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/import-new', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.imported_count > 0) {
          // Only update UI counters if files were actually imported
          // DO NOT refresh iframe - keep it silent for auto-sync
          setLastAutoSyncTime(new Date().toLocaleTimeString());
          setAutoSyncCount(prev => prev + result.imported_count);
        }
      } else {
        const errorData = await response.json();
        if (errorData.detail?.includes('credentials')) {
          setHasCredentials(false);
          setAutoSyncEnabled(false); // Disable auto-sync if credentials invalid
        }
      }
    } catch (error) {
      console.error('Auto-sync error:', error);
      // Don't show alerts for auto-sync errors, just log them
    }
  };

  const getSyncButtonText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Sync to Onyx';
      case 'error':
        return 'Sync failed - retry';
      default:
        return 'Sync to Onyx';
    }
  };

  const getSyncButtonIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getSyncButtonClass = () => {
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ";
    switch (syncStatus) {
      case 'success':
        return baseClass + "bg-green-100 text-green-700 border border-green-300";
      case 'error':
        return baseClass + "bg-red-100 text-red-700 border border-red-300";
      default:
        return baseClass + "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed";
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>

      {/* File Selection Status */}
      {internalSelectedFiles.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {internalSelectedFiles.length} file{internalSelectedFiles.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Files will be combined with connector data for content generation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Iframe Container */}
      <div className="relative" style={{ height: '600px' }}>
        <iframe
          key={iframeKey}
          src={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/smartdrive/apps/files/files${onFilesSelected ? '?fileSelection=true&freshApp=true' : ''}` : '/smartdrive/apps/files/files'}
          className="w-full h-full border-0"
          title="Smart Drive File Browser"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          onLoad={() => {
            console.log('SmartDrive iframe loaded with file selection:', !!onFilesSelected);
          }}
          onError={(e) => {
            console.error('SmartDrive iframe error:', e);
          }}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-700 font-medium">Syncing files...</span>
            </div>
          </div>
        )}
      </div>



      {/* Credentials Setup Modal */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Manual Nextcloud Setup</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Manual Setup Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>If the automatic connection didn't work, you can manually create a Nextcloud App Password:</p>
                    <p className="mt-1">
                      <strong>1.</strong> Go to Nextcloud → Personal Settings → Security → "App passwords"<br/>
                      <strong>2.</strong> Create new app password named "Onyx Smart Drive"<br/>
                      <strong>3.</strong> Copy the generated password and enter it below
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setShowCredentials(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel - Try Automatic Connection Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDriveFrame; 