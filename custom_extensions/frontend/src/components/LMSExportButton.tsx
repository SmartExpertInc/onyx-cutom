"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LMSExportButtonProps {
  selectedProducts: Set<number>;
  onExportComplete?: () => void;
}

const LMSExportButton: React.FC<LMSExportButtonProps> = ({
  selectedProducts,
  onExportComplete,
}) => {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const hasSelectedProducts = selectedProducts.size > 0;

  const handleExport = async () => {
    if (!hasSelectedProducts || isExporting) return;

    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would make an API call to export the course outlines
      console.log('Exporting course outlines:', Array.from(selectedProducts));
      
      setExportStatus('success');
      onExportComplete?.();
      
      // Reset status after a delay
      setTimeout(() => {
        setExportStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      
      // Reset status after a delay
      setTimeout(() => {
        setExportStatus('idle');
      }, 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonText = () => {
    if (isExporting) {
      return t('interface.lmsExporting', 'Exporting...');
    }
    if (exportStatus === 'success') {
      return 'Export Successful!';
    }
    if (exportStatus === 'error') {
      return 'Export Failed';
    }
    return t('interface.lmsExport', 'Export to LMS');
  };

  const getButtonClass = () => {
    const baseClass = "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200";
    
    if (!hasSelectedProducts) {
      return `${baseClass} bg-gray-200 text-gray-500 cursor-not-allowed`;
    }
    
    if (exportStatus === 'success') {
      return `${baseClass} bg-green-600 text-white`;
    }
    
    if (exportStatus === 'error') {
      return `${baseClass} bg-red-600 text-white`;
    }
    
    if (isExporting) {
      return `${baseClass} bg-blue-500 text-white cursor-wait`;
    }
    
    return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 active:scale-95`;
  };

  return (
    <div className="flex flex-col items-center gap-2 min-h-[80px]">
      <button
        onClick={handleExport}
        disabled={!hasSelectedProducts || isExporting}
        className={getButtonClass()}
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <Upload size={18} />
        )}
        {getButtonText()}
      </button>
      
      <div className="h-5 flex items-center">
        {hasSelectedProducts && (
          <p className="text-sm text-gray-600 text-center">
            {selectedProducts.size} course outline{selectedProducts.size !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
};

export default LMSExportButton; 