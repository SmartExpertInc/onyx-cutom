"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartDriveFrameProps {
  className?: string;
}

const SmartDriveFrame: React.FC<SmartDriveFrameProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(true);
  const [credentialsForm, setCredentialsForm] = useState({
    nextcloud_username: '',
    nextcloud_password: '',
    nextcloud_base_url: 'http://nc1.contentbuilder.ai:8080'
  });

  // Initialize SmartDrive session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await fetch('/api/custom-projects-backend/smartdrive/session', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('Failed to initialize SmartDrive session:', response.statusText);
        }
      } catch (error) {
        console.error('Error initializing SmartDrive session:', error);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    checkCredentials();
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
    }
  };

  const handleSetCredentials = async () => {
    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(credentialsForm)
      });

      if (response.ok) {
        setHasCredentials(true);
        setShowCredentials(false);
        alert('Nextcloud credentials saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save credentials: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('Failed to save credentials. Please try again.');
    }
  };

  const handleSyncToOnyx = async () => {
    if (!hasCredentials) {
      alert('Please set up your Nextcloud credentials first!');
      setShowCredentials(true);
      return;
    }

    setIsLoading(true);
    setSyncStatus('syncing');

    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/import-new', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString());
        
        // Refresh iframe to show updated state
        setIframeKey(prev => prev + 1);
        
        // Reset status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
        
        console.log('Sync completed:', result);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
        console.error('Sync failed:', response.statusText);
      }
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      console.error('Error syncing to Onyx:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!hasCredentials) {
      alert('Please set up your Nextcloud credentials first!');
      setShowCredentials(true);
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('/api/custom-projects-backend/smartdrive/import-new', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        alert('Successfully synced files from Smart Drive!');
      } else {
        const errorData = await response.json();
        if (errorData.detail?.includes('credentials')) {
          setShowCredentials(true);
          alert('Please set up your Nextcloud credentials first!');
        } else {
          alert(`Sync failed: ${errorData.detail || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync files. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getSyncButtonText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced!';
      case 'error':
        return 'Sync Failed';
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
        <button
          onClick={handleSyncToOnyx}
          disabled={isLoading}
          className={getSyncButtonClass()}
        >
          {getSyncButtonIcon()}
          {getSyncButtonText()}
        </button>
      </div>

      {/* Iframe Container */}
      <div className="relative" style={{ height: '600px' }}>
        <iframe
          key={iframeKey}
          src={`${window.location.protocol}//${window.location.host}/smartdrive/`}
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Setup Nextcloud Credentials</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide your individual Nextcloud account credentials:
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nextcloud Username
                </label>
                <input
                  type="text"
                  value={credentialsForm.nextcloud_username}
                  onChange={(e) => setCredentialsForm(prev => ({
                    ...prev,
                    nextcloud_username: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your-username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nextcloud Password
                </label>
                <input
                  type="password"
                  value={credentialsForm.nextcloud_password}
                  onChange={(e) => setCredentialsForm(prev => ({
                    ...prev,
                    nextcloud_password: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your-password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nextcloud URL
                </label>
                <input
                  type="text"
                  value={credentialsForm.nextcloud_base_url}
                  onChange={(e) => setCredentialsForm(prev => ({
                    ...prev,
                    nextcloud_base_url: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCredentials(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSetCredentials}
                disabled={!credentialsForm.nextcloud_username || !credentialsForm.nextcloud_password}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDriveFrame; 