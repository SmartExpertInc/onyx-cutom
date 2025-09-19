"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { useToast } from './ui/toast';
import { Product } from '../types/lmsTypes';

interface LMSExportButtonProps {
  selectedProducts: Set<number>;
  products: Product[];
  onExportComplete?: (data?: any) => void;
}

const LMSExportButton: React.FC<LMSExportButtonProps> = ({
  selectedProducts,
  products,
  onExportComplete,
}) => {
  const { t } = useLanguage();
  const { addToast, updateToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const hasSelectedProducts = selectedProducts.size > 0;
  
  // Get selected course names
  const getSelectedCourseNames = () => {
    return products
      .filter(product => selectedProducts.has(product.id))
      .map(product => product.name || product.title || product.projectName || `Course ${product.id}`)
      .join(', ');
  };

  // Get course names for display (truncated if too long)
  const getDisplayCourseNames = (maxLength = 80) => {
    const names = getSelectedCourseNames();
    if (names.length <= maxLength) {
      return names;
    }
    return names.substring(0, maxLength) + '...';
  };

  const handleExport = async () => {
    if (!hasSelectedProducts || isExporting) return;

    setIsExporting(true);
    setExportStatus('idle');

    // Show initial export toast
    const displayCourseNames = getDisplayCourseNames(60);
    const toastId = addToast({
      type: 'loading',
      title: 'Exporting Courses',
      description: selectedProducts.size <= 3 
        ? `Starting export of: ${displayCourseNames}...`
        : `Starting export of ${selectedProducts.size} courses: ${displayCourseNames}...`,
      duration: 0, // Don't auto-dismiss loading toast
    });

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

      // Handle streaming JSON lines
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffered = '';
      let finalPayload: any = null;
      let userMessage: string | undefined;

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffered += chunk;

          const lines = buffered.split('\n');
          buffered = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue; // keep-alive whitespace
            try {
              const packet = JSON.parse(trimmed);
              if (packet.type === 'progress') {
                console.log('📦 LMS export progress:', packet.message || packet);
                // Update toast with progress
                updateToast(toastId, {
                  description: packet.message || `Processing course export...`,
                });
              } else if (packet.type === 'start') {
                console.log('🚀 LMS export started:', packet);
                updateToast(toastId, {
                  description: `Export in progress...`,
                });
              } else if (packet.type === 'done') {
                finalPayload = packet.payload;
                userMessage = packet.userMessage;
              }
            } catch (e) {
              console.warn('⚠️ Failed to parse export stream packet:', e, line);
            }
          }
        }
      }

      const exportData = finalPayload || (await response.json());

      if (exportData?.success) {
      setExportStatus('success');
        console.log('✅ Export completed:', exportData.results);
        
        // Update toast to success
        const successDisplayNames = getDisplayCourseNames(70);
        updateToast(toastId, {
          type: 'success',
          title: 'Export Successful!',
          description: userMessage || `Successfully exported: ${successDisplayNames}`,
          duration: 7000,
        });

        exportData.results?.forEach((result: any) => {
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
      
      // Update toast to error
      updateToast(toastId, {
        type: 'error',
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred during export',
        duration: 8000,
      });
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

  const getButtonVariant = () => {
    if (!hasSelectedProducts) {
      return "secondary";
    }
    
    if (exportStatus === 'success') {
      return "default";
    }
    
    if (exportStatus === 'error') {
      return "destructive";
    }
    
    return "default";
  };

  const getButtonClassName = () => {
    if (exportStatus === 'success') {
      return "bg-green-600 hover:bg-green-700 text-white";
    }
    
    if (exportStatus === 'error') {
      return "bg-red-600 hover:bg-red-600 text-white";
    }
    
    if (isExporting) {
      return "bg-blue-500 hover:bg-blue-500 text-white cursor-wait";
    }
    
    return "bg-blue-600 hover:bg-blue-700 text-white";
  };

  return (
    <Button
      onClick={handleExport}
      disabled={!hasSelectedProducts || isExporting}
      variant={getButtonVariant()}
      className={`flex items-center gap-2 px-6 py-3 rounded-full ${getButtonClassName()}`}
    >
      {isExporting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
      ) : (
        <Upload size={18} />
      )}
      {getButtonText()}
    </Button>
  );
};

export default LMSExportButton; 