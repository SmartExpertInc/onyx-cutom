"use client";

import React, { Suspense } from "react";
import { DocumentsProvider } from "../../../components/documents/DocumentsContext";
import CreateFromFilesContent from "./CreateFromFilesContent";
import { useLanguage } from "../../../contexts/LanguageContext";

function LoadingFallback() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('interface.fromFiles.loadingDocuments', 'Loading documents...')}</p>
      </div>
    </div>
  );
}

export default function CreateFromFilesPage() {
  return (
    <DocumentsProvider>
      <Suspense fallback={<LoadingFallback />}>
        <CreateFromFilesContent />
      </Suspense>
    </DocumentsProvider>
  );
} 