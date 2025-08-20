import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoGenerationTask {
  slide_id: string;
  video_id: string;
  status: 'pending' | 'rendering' | 'done' | 'failed';
  created_at: string;
  avatar_code: string;
  voice: string;
  download_url?: string;
}

interface VideoGenerationProgress {
  project_id: string;
  total_tasks: number;
  completed: number;
  rendering: number;
  failed: number;
  tasks: VideoGenerationTask[];
}

interface VideoLessonGeneratorProps {
  projectId: string;
  slides: any[];
  onVideoGenerated?: (videoPath: string) => void;
}

const AVATAR_OPTIONS = [
  { code: 'gia.1', name: 'Gia (Female)', gender: 'female' },
  { code: 'anna.1', name: 'Anna (Female)', gender: 'female' },
  { code: 'lisa.1', name: 'Lisa (Female)', gender: 'female' },
  { code: 'john.1', name: 'John (Male)', gender: 'male' },
  { code: 'mike.1', name: 'Mike (Male)', gender: 'male' },
  { code: 'david.1', name: 'David (Male)', gender: 'male' },
];

const VOICE_OPTIONS = [
  { code: 'en-US-JennyNeural', name: 'Jenny (US English)', language: 'en' },
  { code: 'en-US-GuyNeural', name: 'Guy (US English)', language: 'en' },
  { code: 'en-GB-SoniaNeural', name: 'Sonia (UK English)', language: 'en' },
  { code: 'en-GB-RyanNeural', name: 'Ryan (UK English)', language: 'en' },
  { code: 'es-ES-ElviraNeural', name: 'Elvira (Spanish)', language: 'es' },
  { code: 'fr-FR-DeniseNeural', name: 'Denise (French)', language: 'fr' },
  { code: 'de-DE-KatjaNeural', name: 'Katja (German)', language: 'de' },
];

export const VideoLessonGenerator: React.FC<VideoLessonGeneratorProps> = ({
  projectId,
  slides,
  onVideoGenerated
}) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [progress, setProgress] = useState<VideoGenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Configuration state
  const [selectedAvatar, setSelectedAvatar] = useState('gia.1');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [backgroundColor, setBackgroundColor] = useState('#00FF00');
  const [selectedSlides, setSelectedSlides] = useState<string[]>([]);
  const [avatarScale, setAvatarScale] = useState(0.8);

  // Polling for progress updates
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with all slides selected
    setSelectedSlides(slides.map(slide => slide.slideId));
    
    // Load existing progress
    loadProgress();
  }, [projectId]);

  useEffect(() => {
    // Start polling if there are tasks in progress
    if (progress && (progress.rendering > 0 || progress.completed < progress.total_tasks)) {
      if (!pollingInterval) {
        const interval = setInterval(loadProgress, 5000); // Poll every 5 seconds
        setPollingInterval(interval);
      }
    } else {
      // Stop polling if all tasks are complete
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [progress]);

  const loadProgress = async () => {
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const response = await fetch(`${CUSTOM_BACKEND_URL}/video-lesson/progress/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const generateAvatarVideos = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const response = await fetch(`${CUSTOM_BACKEND_URL}/video-lesson/generate-avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          slide_id: selectedSlides.length === 1 ? selectedSlides[0] : null, // If single slide selected
          avatar_code: selectedAvatar,
          voice: selectedVoice,
          background_color: backgroundColor,
          language: 'en',
          video_format: 'mp4',
          resolution: '1920x1080'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        // Load progress immediately
        await loadProgress();
      } else {
        setError(data.message || 'Failed to start video generation');
      }
    } catch (error) {
      setError('Network error occurred while generating videos');
      console.error('Video generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const composeVideo = async () => {
    setIsComposing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/custom/video-lesson/compose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          slide_ids: selectedSlides,
          avatar_scale: avatarScale,
          output_format: 'mp4'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        if (onVideoGenerated && data.video_path) {
          onVideoGenerated(data.video_path);
        }
      } else {
        setError(data.message || 'Failed to compose video');
      }
    } catch (error) {
      setError('Network error occurred while composing video');
      console.error('Video composition error:', error);
    } finally {
      setIsComposing(false);
    }
  };

  const downloadVideo = async () => {
    try {
      const response = await fetch(`/api/custom/video-lesson/download/${projectId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_lesson_${projectId}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download video');
      }
    } catch (error) {
      setError('Network error occurred while downloading video');
      console.error('Download error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'failed':
        return <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'rendering':
        return <svg className="h-4 w-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>;
      default:
        return <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      case 'rendering':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Rendering</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Pending</span>;
    }
  };

  const completionPercentage = progress 
    ? progress.total_tasks > 0 
      ? Math.round((progress.completed / progress.total_tasks) * 100) 
      : 0
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video Lesson Generator
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Generate AI avatar videos for your slides and compose them into a complete video lesson
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar</label>
              <select 
                id="avatar"
                value={selectedAvatar} 
                onChange={(e) => setSelectedAvatar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {AVATAR_OPTIONS.map((avatar) => (
                  <option key={avatar.code} value={avatar.code}>
                    {avatar.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="voice" className="block text-sm font-medium text-gray-700">Voice</label>
              <select 
                id="voice"
                value={selectedVoice} 
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.code} value={voice.code}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">Background Color</label>
              <input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-full border border-gray-300 rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="avatarScale" className="block text-sm font-medium text-gray-700">Avatar Scale</label>
              <input
                id="avatarScale"
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={avatarScale}
                onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{avatarScale}</span>
            </div>
          </div>

          {/* Slide Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Slides ({selectedSlides.length} of {slides.length})</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
              {slides.map((slide) => (
                <label key={slide.slideId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSlides.includes(slide.slideId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSlides([...selectedSlides, slide.slideId]);
                      } else {
                        setSelectedSlides(selectedSlides.filter(id => id !== slide.slideId));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm truncate">
                    Slide {slide.slideNumber}: {slide.slideTitle}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={generateAvatarVideos}
              disabled={isGenerating || selectedSlides.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              Generate Avatar Videos
            </button>

            <button
              onClick={composeVideo}
              disabled={isComposing || !progress || progress.completed === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isComposing ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              Compose Final Video
            </button>

            <button
              onClick={downloadVideo}
              disabled={!progress || progress.completed === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {progress && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Generation Progress</h3>
            <p className="text-sm text-gray-600 mt-1">
              {progress.completed} of {progress.total_tasks} videos completed
            </p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">{progress.rendering}</div>
                <div className="text-sm text-gray-500">Rendering</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{progress.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{progress.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Individual Tasks</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {progress.tasks.map((task) => (
                  <div key={task.video_id} className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm">
                        Slide {slides.find(s => s.slideId === task.slide_id)?.slideNumber || '?'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      {task.download_url && (
                        <button
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                          onClick={() => window.open(task.download_url, '_blank')}
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
