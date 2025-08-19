"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartDriveFrameProps {
  className?: string;
}

const SmartDriveFrame: React.FC<SmartDriveFrameProps> = ({ className = '' }) => {
  const [syncing, setSyncing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false); // Fixed: start with false
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
            // Show auth button immediately if no credentials
            console.log('No credentials detected, showing auth options');
          }
        }
      } catch (error) {
        console.error('Failed to initialize SmartDrive session:', error);
        setHasCredentials(false); // Assume no credentials on error
      }
    };

    initializeSession();
  }, []);

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
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Drive Browser</h3>
          <p className="text-sm text-gray-600">
            Browse your files and sync new content to Onyx
            {lastSyncTime && <span className="ml-2">• Last sync: {lastSyncTime}</span>}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {!hasCredentials ? (
            <>
              <button
                onClick={handleNextcloudAuth}
                disabled={isAuthenticating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                {isAuthenticating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                    Connect Nextcloud Account
                  </>
                )}
              </button>
              <button
                onClick={handleSetCredentials}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                Manual Setup
              </button>
            </>
          ) : (
            <>
              {getSyncButtonText() === 'Sync to Onyx' ? (
                <button
                  onClick={handleSyncToOnyx}
                  disabled={isLoading}
                  className={getSyncButtonClass()}
                >
                  {getSyncButtonIcon()}
                  {getSyncButtonText()}
                </button>
              ) : (
                <div className="px-4 py-2 bg-gray-100 rounded border">
                  {getSyncButtonIcon()}
                  {getSyncButtonText()}
                </div>
              )}
              <button
                onClick={() => setHasCredentials(false)}
                className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>

      {/* Iframe Container */}
      <div className="relative" style={{ height: '600px' }}>
        <iframe
          key={iframeKey}
          src={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/smartdrive/` : '/smartdrive/'}
          className="w-full h-full border-0"
          title="Smart Drive File Browser"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          onLoad={() => {
            console.log('SmartDrive iframe loaded');
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

      {/* Footer Info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Files uploaded here are automatically available in your Onyx knowledge base. 
          Use "Sync to Onyx" to import new or updated files.
        </p>
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