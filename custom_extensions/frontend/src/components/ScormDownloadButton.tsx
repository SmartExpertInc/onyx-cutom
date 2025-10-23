"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from './ui/toast';

interface ScormDownloadButtonProps {
  courseOutlineId: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ScormDownloadButton: React.FC<ScormDownloadButtonProps> = ({ courseOutlineId, label, className, style }) => {
  const { addToast, updateToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    const toastId = addToast({ type: 'loading', title: 'Preparing SCORM Package', description: 'Building SCORM 2004 package...', duration: 0 });
    
    try {
      const res = await fetch('/api/custom-projects-backend/lms/export/scorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseOutlineId })
      });
      
      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`);
      }
      
      if (!res.body) {
        throw new Error('Response body is null');
      }
      
      // Process streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let zipBytes: Uint8Array[] = [];
      let filename = `course_${courseOutlineId}_scorm2004.zip`;
      let isProcessingJSON = true;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (isProcessingJSON) {
          // Decode and look for JSON messages
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'progress') {
                // Update toast with progress message
                updateToast(toastId, { 
                  type: 'loading', 
                  title: 'Building SCORM Package', 
                  description: data.message, 
                  duration: 0 
                });
              } else if (data.type === 'complete') {
                // Got the completion message with filename
                filename = data.filename || filename;
                updateToast(toastId, { 
                  type: 'loading', 
                  title: 'Downloading...', 
                  description: 'Preparing download', 
                  duration: 0 
                });
                // Switch to binary mode - rest is ZIP data
                isProcessingJSON = false;
                break;
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Export failed');
              }
            } catch (e) {
              // If not valid JSON and not error, might be start of binary data
              if (buffer.length > 100) {
                isProcessingJSON = false;
                // Add the non-JSON data as binary
                zipBytes.push(value);
                break;
              }
            }
          }
        } else {
          // Collecting ZIP bytes
          zipBytes.push(value);
        }
      }
      
      // Create blob from collected ZIP bytes
      const blob = new Blob(zipBytes as BlobPart[], { type: 'application/zip' });
      
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      updateToast(toastId, { type: 'success', title: 'SCORM Ready', description: 'Download started.', duration: 5000 });
    } catch (e: any) {
      updateToast(toastId, { type: 'error', title: 'Export Failed', description: e?.message || 'Unexpected error', duration: 7000 });
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
      {label || (isExporting ? 'Exporting…' : 'Download SCORM 2004')}
    </button>
  );
};

export default ScormDownloadButton; 