"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SmartDriveFrameProps {
  className?: string;
}

const SmartDriveFrame: React.FC<SmartDriveFrameProps> = ({ className = '' }) => {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [autoSyncCount, setAutoSyncCount] = useState(0);

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
        }
      } catch (error) {
        console.error('Failed to initialize SmartDrive session:', error);
        setHasCredentials(false);
      }
    };

    initializeSession();
  }, []);

  // Auto-sync functionality
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const isPageVisible = () => {
      return typeof document !== 'undefined' && !document.hidden;
    };

    if (hasCredentials && isPageVisible()) {
      intervalId = setInterval(async () => {
        if (isPageVisible() && !isLoading && syncStatus !== 'syncing') {
          await performAutoSync();
        }
      }, 3000); // Every 3 seconds
    }

    const handleVisibilityChange = () => {
      if (document.hidden && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      } else if (!document.hidden && hasCredentials && !intervalId) {
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

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [hasCredentials, isLoading, syncStatus]);

  const performAutoSync = async () => {
    try {
      setIsLoading(true);
      setSyncStatus('syncing');
      
      const response = await fetch('/api/custom-projects-backend/smartdrive/sync', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString());
        if (data.synced_files && data.synced_files.length > 0) {
          setAutoSyncCount(prev => prev + data.synced_files.length);
        }
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return 'Auto-sync active';
    }
  };

  if (!hasCredentials) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Drive Not Connected</h3>
          <p className="text-gray-600 mb-4">
            Please connect your Nextcloud account to use Smart Drive file browsing.
          </p>
          <button
            onClick={() => window.location.href = '/projects/smart-drive/connectors'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Connect Smart Drive
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
            {lastSyncTime && (
              <p className="text-xs text-gray-600">Last sync: {lastSyncTime}</p>
            )}
          </div>
        </div>
        {autoSyncCount > 0 && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{autoSyncCount} files synced</p>
            <p className="text-xs text-gray-600">Auto-sync every 3s</p>
          </div>
        )}
      </div>

      {/* Iframe Container */}
      <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg" style={{ height: '600px' }}>
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
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center backdrop-blur-sm">
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg px-6 py-4">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-700 font-medium">Syncing files...</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Files uploaded here are automatically synced to your Onyx knowledge base</span>
        </div>
      </div>
    </div>
  );
};

export default SmartDriveFrame; 