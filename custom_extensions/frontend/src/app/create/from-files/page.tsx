"use client";

import React from "react";
import { DocumentsProvider } from "../../../components/documents/DocumentsContext";
import CreateFromFilesContent from "./CreateFromFilesContent";

export default function CreateFromFilesPage() {
  return (
    <DocumentsProvider>
      <CreateFromFilesContent />
    </DocumentsProvider>
  );
} 