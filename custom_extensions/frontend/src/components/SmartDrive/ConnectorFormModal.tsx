"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ConnectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectorId: string;
  connectorName: string;
}

const ConnectorFormModal: React.FC<ConnectorFormModalProps> = ({
  isOpen,
  onClose,
  connectorId,
  connectorName
}) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  // Construct the iframe URL for the Onyx connector form
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const host = typeof window !== 'undefined' ? window.location.host : '';
  const mainDomain = `${protocol}//${host}`;
  const iframeUrl = `${mainDomain}/admin/connectors/${connectorId}?access_type=private&smart_drive=true&smart_drive_user_group=true&return_url=${encodeURIComponent(`${mainDomain}/projects`)}&embedded=true`;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F7F7F7]">
            <h2 className="text-lg font-semibold text-gray-900">
              Connect {connectorName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading connector form...</span>
              </div>
            </div>
          )}

          {/* Iframe Content */}
          <div className="relative h-[600px] overflow-hidden">
            <iframe
              src={iframeUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title={`${connectorName} Connector Setup`}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-[#F7F7F7]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectorFormModal; 