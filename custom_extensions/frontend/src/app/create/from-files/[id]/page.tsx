"use client";

import React from "react";
import { DocumentsProvider } from "../../../../components/documents/DocumentsContext";
import CreateFromFolderContent from "./CreateFromFolderContent";

interface CreateFromFolderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreateFromFolderPage({ params }: CreateFromFolderPageProps) {
  const resolvedParams = await params;
  
  return (
    <DocumentsProvider>
      <CreateFromFolderContent folderId={parseInt(resolvedParams.id)} />
    </DocumentsProvider>
  );
} 