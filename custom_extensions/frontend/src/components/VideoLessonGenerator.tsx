import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Download, Video, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

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
      const response = await fetch(`/api/custom/video-lesson/progress/${projectId}`);
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
      const response = await fetch('/api/custom/video-lesson/generate-avatar', {
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rendering':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'rendering':
        return <Badge variant="secondary" className="bg-blue-500">Rendering</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const completionPercentage = progress 
    ? progress.total_tasks > 0 
      ? Math.round((progress.completed / progress.total_tasks) * 100) 
      : 0
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Lesson Generator
          </CardTitle>
          <CardDescription>
            Generate AI avatar videos for your slides and compose them into a complete video lesson
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                <SelectTrigger>
                  <SelectValue placeholder="Select avatar" />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_OPTIONS.map((avatar) => (
                    <SelectItem key={avatar.code} value={avatar.code}>
                      {avatar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.code} value={voice.code}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarScale">Avatar Scale</Label>
              <Input
                id="avatarScale"
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={avatarScale}
                onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
              />
              <span className="text-sm text-gray-500">{avatarScale}</span>
            </div>
          </div>

          {/* Slide Selection */}
          <div className="space-y-2">
            <Label>Select Slides ({selectedSlides.length} of {slides.length})</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
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
                    className="rounded"
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
            <Button
              onClick={generateAvatarVideos}
              disabled={isGenerating || selectedSlides.length === 0}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Generate Avatar Videos
            </Button>

            <Button
              onClick={composeVideo}
              disabled={isComposing || !progress || progress.completed === 0}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isComposing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              Compose Final Video
            </Button>

            <Button
              onClick={downloadVideo}
              disabled={!progress || progress.completed === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
            <CardDescription>
              {progress.completed} of {progress.total_tasks} videos completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="w-full" />
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
              <Label>Individual Tasks</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {progress.tasks.map((task) => (
                  <div key={task.video_id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm">
                        Slide {slides.find(s => s.slideId === task.slide_id)?.slideNumber || '?'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      {task.download_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(task.download_url, '_blank')}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
