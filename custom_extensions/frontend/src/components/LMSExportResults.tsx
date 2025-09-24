"use client";

import React from 'react';
import { Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LMSExportResult {
  courseTitle: string;
  downloadLink: string | null;
  error?: string;
  structure?: any;
}

interface LMSExportResultsProps {
  results: LMSExportResult[];
  onClose: () => void;
}

const LMSExportResults: React.FC<LMSExportResultsProps> = ({ results, onClose }) => {
  const { t } = useLanguage();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openDownloadLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            LMS Export Results
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {result.downloadLink ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertCircle className="text-red-600" size={20} />
                )}
                <h3 className="font-medium text-gray-900">{result.courseTitle}</h3>
              </div>

              {result.downloadLink ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {t('interface.lmsExportSuccess', 'Course structure exported successfully')}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDownloadLink(result.downloadLink!)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Download size={16} />
                      {t('interface.downloadCourseStructure', 'Download Course Structure')}
                    </button>
                    <button
                      onClick={() => copyToClipboard(result.downloadLink!)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Copy size={16} />
                      {t('interface.copyLink', 'Copy Link')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  {t('interface.exportFailed', 'Export failed')}: {result.error || 'Unknown error'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {t('interface.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LMSExportResults; 