"use client";

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SmartDriveFrameProps {
  onSync?: () => void;
}

const SmartDriveFrame: React.FC<SmartDriveFrameProps> = ({ onSync }) => {
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncToOnyx = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/custom-smartdrive/import-new', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync files');
      }

      // Trigger UI refresh
      if (onSync) {
        onSync();
      }

      // Force iframe reload to reflect changes
      const iframe = document.getElementById('smartdrive-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert(t('smartdrive.syncError', 'Failed to sync files. Please try again.'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with sync button */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {t('smartdrive.browseFiles', 'Browse Smart Drive Files')}
        </h3>
        <button
          onClick={handleSyncToOnyx}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw 
            className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
          />
          {isSyncing 
            ? t('smartdrive.syncing', 'Syncing...') 
            : t('smartdrive.syncToOnyx', 'Sync to Onyx')
          }
        </button>
      </div>

      {/* SmartDrive iframe */}
      <div className="relative" style={{ height: '600px' }}>
        <iframe
          id="smartdrive-iframe"
          src="/smartdrive/"
          className="w-full h-full border-0"
          title={t('smartdrive.frameTitle', 'Smart Drive File Browser')}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />
        
        {/* Loading overlay */}
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">
              {t('smartdrive.loadingFrame', 'Loading Smart Drive...')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDriveFrame; 