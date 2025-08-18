"use client";

import React from 'react';
import Link from 'next/link';
import { FolderOpen, Settings, Cloud, HardDrive } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SmartDriveCardsProps {
  onBrowseClick: () => void;
}

const SmartDriveCards: React.FC<SmartDriveCardsProps> = ({ onBrowseClick }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Browse Uploaded Card */}
      <div
        onClick={onBrowseClick}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('smartdrive.browseUploaded', 'Browse Uploaded')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('smartdrive.browseUploadedDesc', 'View and manage your Smart Drive files')}
            </p>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          {t('smartdrive.browseUploadedHelp', 'Access your personal Nextcloud files and sync them to Onyx for content creation.')}
        </p>
      </div>

      {/* Connectors Card */}
      <Link
        href="/projects/smart-drive/connectors"
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group block"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <Settings className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('smartdrive.connectors', 'Connectors')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('smartdrive.connectorsDesc', 'Manage your data sources')}
            </p>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          {t('smartdrive.connectorsHelp', 'Connect Google Drive, Notion, and other platforms to automatically sync your content.')}
        </p>
      </Link>

      {/* Smart Drive Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Cloud className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('smartdrive.smartDrive', 'Smart Drive')}
            </h3>
            <p className="text-sm text-purple-600">
              {t('smartdrive.infoDesc', 'Your unified content hub')}
            </p>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          {t('smartdrive.infoHelp', 'Smart Drive integrates your personal Nextcloud with external connectors, giving you centralized access to all your content sources.')}
        </p>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <HardDrive className="h-3 w-3" />
          <span>{t('smartdrive.poweredBy', 'Powered by Nextcloud & Onyx')}</span>
        </div>
      </div>
    </div>
  );
};

export default SmartDriveCards; 