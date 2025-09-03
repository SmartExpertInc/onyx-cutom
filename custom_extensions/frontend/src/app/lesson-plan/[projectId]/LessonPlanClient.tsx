"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LessonPlanView } from '../../../components/LessonPlanView';
import { LessonPlanData } from '../../../types/projectSpecificTypes';
import { RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';

interface LessonPlanClientProps {
  projectId: string;
}

export function LessonPlanClient({ projectId }: LessonPlanClientProps) {
  const router = useRouter();
  const [lessonPlanData, setLessonPlanData] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentOutlineId, setParentOutlineId] = useState<number | null>(null);

  // Fetch lesson plan data
  useEffect(() => {
    const fetchLessonPlanData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/custom/projects/view/${projectId}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch lesson plan data');
        }

        const data = await response.json();
        
        if (data.lesson_plan_data) {
          setLessonPlanData(data.lesson_plan_data);
          setParentOutlineId(data.parent_outline_id);
        } else {
          setError('No lesson plan data found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchLessonPlanData();
    }
  }, [projectId]);

  // Handle refresh (regenerate lesson plan)
  const handleRefresh = async () => {
    if (!parentOutlineId) {
      setError('Cannot refresh: No parent outline ID found');
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      // First, delete the current lesson plan
      const deleteResponse = await fetch(`/api/custom/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete old lesson plan');
      }

      // Get parent outline data to regenerate
      const outlineResponse = await fetch(`/api/custom/projects/view/${parentOutlineId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!outlineResponse.ok) {
        throw new Error('Failed to fetch parent outline data');
      }

      const outlineData = await outlineResponse.json();
      
      // Generate new lesson plan
      const generateResponse = await fetch('/api/custom/lesson-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlineProjectId: parentOutlineId,
          lessonTitle: lessonPlanData?.lessonTitle || 'Lesson Plan',
          moduleName: 'Module', // You might want to extract this from the outline
          lessonNumber: 1,
          recommendedProducts: ['lesson', 'quiz', 'one-pager', 'video-lesson']
        })
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate new lesson plan');
      }

      const result = await generateResponse.json();
      
      if (result.success) {
        // Redirect to the new lesson plan
        router.push(`/lesson-plan/${result.project_id}`);
      } else {
        throw new Error(result.message || 'Lesson plan generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh lesson plan');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading lesson plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Lesson Plan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!lessonPlanData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No lesson plan data available</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Lesson Plan</h1>
                <p className="text-sm text-gray-500">{lessonPlanData.lessonTitle}</p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Lesson Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonPlanView lessonPlanData={lessonPlanData} />
      </div>
    </div>
  );
} 