"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from './ui/toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScormDownloadButtonProps {
  courseOutlineId: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ScormDownloadButton: React.FC<ScormDownloadButtonProps> = ({ courseOutlineId, label, className, style }) => {
  const { addToast, updateToast } = useToast();
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    const toastId = addToast({ type: 'loading', title: t('scormDownload.preparing', 'Preparing SCORM Package'), description: t('scormDownload.building', 'Building SCORM 2004 package...'), duration: 0 });
    try {
      const res = await fetch('/api/custom-projects-backend/lms/export/scorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseOutlineId })
      });
      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename=([^;]+)/i);
      const filename = match ? decodeURIComponent(match[1].replace(/\"/g, '')) : `course_${courseOutlineId}_scorm2004.zip`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      updateToast(toastId, { type: 'success', title: t('scormDownload.ready', 'SCORM Ready'), description: t('scormDownload.downloadStarted', 'Download started.'), duration: 5000 });
    } catch (e: any) {
      updateToast(toastId, { type: 'error', title: t('scormDownload.exportFailed', 'Export Failed'), description: e?.message || t('scormDownload.unexpectedError', 'Unexpected error'), duration: 7000 });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isExporting}
      className={`flex items-center gap-2 rounded transition-all duration-200 hover:shadow-lg focus:outline-none disabled:opacity-60 ${className || 'px-[15px] py-[5px] pr-[20px]'}`}
      style={style}
    >
      {isExporting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Download size={18} />}
      {label || (isExporting ? t('scormDownload.exporting', 'Exporting…') : t('scormDownload.downloadScorm', 'Download SCORM 2004'))}
    </button>
  );
};

export default ScormDownloadButton; 