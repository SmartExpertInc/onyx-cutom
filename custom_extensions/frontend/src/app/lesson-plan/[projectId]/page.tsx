"use client";

import React from 'react';
import { LessonPlanClient } from './LessonPlanClient';

interface LessonPlanPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function LessonPlanPage({ params }: LessonPlanPageProps) {
  const { projectId } = await params;
  
  return <LessonPlanClient projectId={projectId} />;
} 