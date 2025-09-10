"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LMSExportButtonProps {
  selectedProducts: Set<number>;
  onExportComplete?: (data?: any) => void;
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
      console.log('🎓 Starting LMS export for course outlines:', Array.from(selectedProducts));

      const response = await fetch('/api/custom-projects-backend/lms/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts)
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const exportData = await response.json();

      if (exportData.success) {
        setExportStatus('success');
        console.log('✅ Export completed:', exportData.results);
        exportData.results.forEach((result: any) => {
          if (result.downloadLink) {
            console.log(`📥 Course "${result.courseTitle}" available at: ${result.downloadLink}`);
          }
        });
        onExportComplete?.(exportData);
      } else {
        throw new Error('Export completed with errors');
      }
    } catch (error) {
      console.error('❌ LMS export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setExportStatus('idle');
      }, 5000);
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
  );
};

export default LMSExportButton; 