"use client";

import React, { useState } from "react";
import SmartDriveConnectors from "@/components/SmartDrive/SmartDriveConnectors";

interface ImportFromSmartDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

export const ImportFromSmartDriveModal: React.FC<ImportFromSmartDriveModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'smart-drive' | 'connectors'>('smart-drive');

  if (!isOpen) return null;

  const handleImport = () => {
    onImport();
    onClose();
  };

  const handleTabChange = (tab: 'smart-drive' | 'connectors') => {
    setActiveTab(tab);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backdropFilter: 'blur(14.699999809265137px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg p-6 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.7) 100%)',
          boxShadow: '4px 4px 8px 0px #0000000D',
          border: '1px solid #E0E0E0',
          width: '95vw',
          height: '95vh',
          maxHeight: '95vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">
          {activeTab === 'connectors' ? 'Select a connector' : 'Select a file'}
        </h2>

        {/* SmartDrive Connectors Component */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <SmartDriveConnectors mode="select" onTabChange={handleTabChange} hideStatsBar={true} />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              color: '#0F58F9',
              backgroundColor: 'white',
              border: '1px solid #0F58F9',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{
              backgroundColor: '#0F58F9',
            }}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

