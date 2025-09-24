"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';

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
              } else if (packet.type === 'start') {
                console.log('🚀 LMS export started:', packet);
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
        exportData.results?.forEach((result: any) => {
          if (result.downloadLink) {
            console.log(`📥 Course "${result.courseTitle}" available at: ${result.downloadLink}`);
          }
        });
        if (userMessage) {
          // Simple styled toast; replace with your toast system if available
          const toast = document.createElement('div');
          toast.textContent = userMessage;
          toast.className = 'fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
          document.body.appendChild(toast);
          setTimeout(() => { toast.remove(); }, 7000);
        }
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