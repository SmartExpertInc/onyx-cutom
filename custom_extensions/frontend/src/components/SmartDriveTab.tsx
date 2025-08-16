"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Folder,
  Upload,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SmartDriveTabProps {
  currentUser?: {
    email: string;
    password?: string;
    display_name?: string;
  };
}

interface SmartDriveAccess {
  success: boolean;
  iframe_url: string;
  username: string;
  user_exists: boolean;
  nextcloud_url: string;
}

const SmartDriveTab: React.FC<SmartDriveTabProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [smartDriveUrl, setSmartDriveUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    email: currentUser?.email || '',
    password: '',
    display_name: currentUser?.display_name || ''
  });
  const [showCredentialsForm, setShowCredentialsForm] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check if user is already connected
  useEffect(() => {
    const savedCredentials = localStorage.getItem('smartdrive_credentials');
    if (savedCredentials && currentUser?.email) {
      try {
        const parsed = JSON.parse(savedCredentials);
        if (parsed.email === currentUser.email) {
          setCredentials(parsed);
          setShowCredentialsForm(false);
          connectToSmartDrive(parsed);
        }
      } catch (e) {
        console.error('Error parsing saved credentials:', e);
      }
    }
  }, [currentUser]);

  const connectToSmartDrive = async (creds = credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: creds.email,
          password: creds.password,
          display_name: creds.display_name
        }),
      });

      const data: SmartDriveAccess = await response.json();

      if (response.ok && data.success) {
        setSmartDriveUrl(data.nextcloud_url);
        setIsConnected(true);
        setShowCredentialsForm(false);
        
        // Save credentials securely (in production, use better storage)
        localStorage.setItem('smartdrive_credentials', JSON.stringify(creds));
        
        // Show success message
        if (!data.user_exists) {
          console.log('New SmartDrive account created successfully!');
        } else {
          console.log('Connected to existing SmartDrive account');
        }
      } else {
        setError(data.error || 'Failed to connect to SmartDrive');
      }
    } catch (err) {
      console.error('SmartDrive connection error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError('Please provide both email and password');
      return;
    }
    connectToSmartDrive();
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSmartDriveUrl('');
    setShowCredentialsForm(true);
    localStorage.removeItem('smartdrive_credentials');
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/health', {
        credentials: 'same-origin',
      });
      const data = await response.json();
      return data.healthy;
    } catch {
      return false;
    }
  };

  if (!isConnected && showCredentialsForm) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Cloud className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('smartdrive.welcome', 'Welcome to SmartDrive')}
          </h2>
          <p className="text-gray-600">
            {t('smartdrive.description', 'Access your cloud files seamlessly integrated with your content creation workflow')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smartdrive.email', 'Email Address')}
              </label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('smartdrive.emailPlaceholder', 'your@email.com')}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smartdrive.password', 'Password')}
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('smartdrive.passwordPlaceholder', 'Your secure password')}
                required
              />
            </div>

            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smartdrive.displayName', 'Display Name')} <span className="text-gray-400">({t('smartdrive.optional', 'optional')})</span>
              </label>
              <input
                type="text"
                id="display_name"
                value={credentials.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('smartdrive.displayNamePlaceholder', 'Your Name')}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('smartdrive.connecting', 'Connecting...')}
                </>
              ) : (
                <>
                  <Cloud className="h-5 w-5" />
                  {t('smartdrive.connectButton', 'Connect to SmartDrive')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">
                  {t('smartdrive.autoSetup', 'Automatic Setup')}
                </p>
                <p>
                  {t('smartdrive.autoSetupDescription', 'If you don\'t have a SmartDrive account yet, one will be created automatically using your platform credentials.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && smartDriveUrl) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('smartdrive.title', 'SmartDrive')}
            </h2>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {t('smartdrive.connected', 'Connected')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title={t('smartdrive.refresh', 'Refresh')}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('smartdrive.disconnect', 'Disconnect')}
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={smartDriveUrl}
            className="w-full h-full border-0"
            title="SmartDrive - Nextcloud"
            allow="autoplay; microphone; camera; clipboard-read; clipboard-write; window-management; self; encrypted-media; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{t('smartdrive.loading', 'Loading SmartDrive...')}</p>
      </div>
    </div>
  );
};

export default SmartDriveTab; 