"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, Settings, Upload } from 'lucide-react';
import SmartDriveFrame from './SmartDriveFrame';

interface SmartDriveCardsProps {
  className?: string;
}

const SmartDriveCards: React.FC<SmartDriveCardsProps> = ({ className = '' }) => {
  const [showFrame, setShowFrame] = useState(false);

  const handleBrowseUploadedClick = () => {
    setShowFrame(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Browse Uploaded Card */}
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleBrowseUploadedClick}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Browse Uploaded</h3>
              <p className="text-sm text-gray-600">Access your uploaded files</p>
            </div>
          </div>
          <p className="text-gray-700">
            Browse and manage files you've uploaded to your Smart Drive. Select files to import into your projects.
          </p>
        </div>

        {/* Connectors Card */}
        <Link href="/projects/smart-drive/connectors">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Connectors</h3>
                <p className="text-sm text-gray-600">Manage your data sources</p>
              </div>
            </div>
            <p className="text-gray-700">
              Connect and manage external data sources like Google Drive, Dropbox, and other cloud services.
            </p>
          </div>
        </Link>

        {/* Smart Drive Info Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Drive</h3>
              <p className="text-sm text-purple-600">Powered by Nextcloud</p>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            Your personal cloud storage integrated with Onyx's knowledge base. Upload, organize, and seamlessly import files into your AI projects.
          </p>
        </div>
      </div>

      {/* SmartDrive Frame - Rendered below cards when Browse Uploaded is clicked */}
      {showFrame && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Smart Drive Browser</h2>
            <button
              onClick={() => setShowFrame(false)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Hide Browser
            </button>
          </div>
          <SmartDriveFrame />
        </div>
      )}
    </div>
  );
};

export default SmartDriveCards; 