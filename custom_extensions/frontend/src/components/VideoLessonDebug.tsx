import React, { useState } from 'react';
import { useParams } from 'next/navigation';

interface VideoLessonDebugProps {
  projectId: string;
  slides: any[];
}

export const VideoLessonDebug: React.FC<VideoLessonDebugProps> = ({
  projectId,
  slides
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGenerateAvatar = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const response = await fetch(`${CUSTOM_BACKEND_URL}/video-lesson/generate-avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          slide_id: slides[0]?.slideId || null,
          avatar_code: 'gia.1',
          voice: 'en-US-JennyNeural',
          background_color: '#00FF00',
          language: 'en',
          video_format: 'mp4',
          resolution: '1920x1080'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(`Error ${response.status}: ${data.detail || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testProgress = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const response = await fetch(`${CUSTOM_BACKEND_URL}/video-lesson/progress/${projectId}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(`Error ${response.status}: ${data.detail || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Video Lesson Debug</h3>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-yellow-700">
          <strong>Project ID:</strong> {projectId}
        </p>
        <p className="text-sm text-yellow-700">
          <strong>Slides:</strong> {slides.length}
        </p>
        <p className="text-sm text-yellow-700">
          <strong>First Slide ID:</strong> {slides[0]?.slideId || 'None'}
        </p>
      </div>

      <div className="space-x-2">
        <button
          onClick={testGenerateAvatar}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Generate Avatar'}
        </button>
        
        <button
          onClick={testProgress}
          disabled={isLoading}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Progress'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-sm font-medium">Error:</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm font-medium">Result:</p>
          <pre className="text-green-700 text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
