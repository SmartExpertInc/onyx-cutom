"use client";

import React from "react";
import { DocumentsProvider } from "../../../../components/documents/DocumentsContext";
import CreateFromFolderContent from "./CreateFromFolderContent";

interface CreateFromFolderPageProps {
  params: {
    id: string;
  };
}

export default function CreateFromFolderPage({ params }: CreateFromFolderPageProps) {
  return (
    <DocumentsProvider>
      <CreateFromFolderContent folderId={parseInt(params.id)} />
    </DocumentsProvider>
  );
} 