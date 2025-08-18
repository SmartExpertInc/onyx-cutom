'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function TestPreviewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-4 text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">PDF Preview Test</h1>
        <p className="text-gray-600 mb-4">
          This is a test page to verify that the PDF preview routing is working correctly.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            <strong>Project ID:</strong> {projectId}
          </p>
          <p className="text-sm text-gray-700">
            <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
} 