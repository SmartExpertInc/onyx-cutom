"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function AuditPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/projects"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Projects
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Audit</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the Audit Page
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              This is where you can add your custom audit content and functionality.
            </p>
            
            {/* Placeholder Content */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">
                Add your custom audit content here. This page is ready for you to implement 
                your specific audit features, forms, or workflows.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
