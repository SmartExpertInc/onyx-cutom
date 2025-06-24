// custom_extensions/frontend/src/app/projects/view/[projectId]/page.tsx
"use client";

import React from 'react';
import EditorPage from '@/components/EditorPage';

type ProjectViewParams = {
  projectId: string;
};

export default function ProjectInstanceViewPage() {
  return <EditorPage />;
}