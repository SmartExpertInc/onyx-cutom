// custom_extensions/frontend/src/services/VideoGenerationService.ts

import { 
  ElaiVideoRequest, 
  ElaiVideoResponse, 
  ElaiVideoStatus, 
  ElaiSlideData,
  VideoGenerationResponse,
  SlideDataForVideo,
  SelectedAvatar
} from '@/types/elaiTypes';
import { AvatarService } from './AvatarService';

export class VideoGenerationService {
  private static readonly ELAI_API_BASE = 'https://apis.elai.io/api/v1';
  private static readonly API_TOKEN = '5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e';
  private static readonly MAX_WAIT_TIME = 15 * 60 * 1000; // 15 minutes
  private static readonly POLL_INTERVAL = 30 * 1000; // 30 seconds
  
  /**
   * Generate video from slides with selected avatar
   */
  static async generateVideo(
    slides: SlideDataForVideo[], 
    selectedAvatar: SelectedAvatar,
    onProgress?: (progress: number, status: string) => void
  ): Promise<VideoGenerationResponse> {
    try {
      // Validate inputs
      const validation = this.validateInputs(slides, selectedAvatar);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Create Elai video
      const videoData = await this.createElaiVideo(slides, selectedAvatar);
      if (!videoData.success) {
        return videoData;
      }
      
      // Start rendering
      const renderSuccess = await this.renderVideo(videoData.videoId!);
      if (!renderSuccess) {
        return {
          success: false,
          error: 'Failed to start video rendering'
        };
      }
      
      // Monitor progress and wait for completion
      const completedVideo = await this.monitorVideoProgress(
        videoData.videoId!, 
        onProgress
      );
      
      if (!completedVideo.success) {
        return completedVideo;
      }
      
      return {
        success: true,
        videoId: videoData.videoId,
        downloadUrl: completedVideo.downloadUrl,
        progress: 100
      };
      
    } catch (error) {
      console.error('Video generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Create Elai video with slides
   */
  private static async createElaiVideo(
    slides: SlideDataForVideo[], 
    selectedAvatar: SelectedAvatar
  ): Promise<VideoGenerationResponse> {
    try {
      const elaiSlides: ElaiSlideData[] = slides.map((slide, index) => {
        const voice = AvatarService.getDefaultVoice(selectedAvatar.avatar);
        const voiceProvider = AvatarService.getVoiceProvider(voice);
        
        // COORDINATED MODE: Avatar positioned to match composition template expectations
        // Template requirements: 935x843 at position (925, 118) on 1920x1080 canvas
        const templateWidth = 935;
        const templateHeight = 843;
        const templateX = 925;
        const templateY = 118;
        const canvasWidth = 1920;
        const canvasHeight = 1080;
        
        // Calculate scale factors to fill template area
        const scaleX = templateWidth / canvasWidth;   // 935/1920 ≈ 0.487
        const scaleY = templateHeight / canvasHeight; // 843/1080 ≈ 0.781
        
        // Calculate positioning (Elai uses center-point positioning)
        const centerX = templateX + (templateWidth / 2);   // 925 + 467.5 = 1392.5
        const centerY = templateY + (templateHeight / 2);  // 118 + 421.5 = 539.5
        
        console.log('🎬 [FRONTEND_ELAI] Coordinated avatar parameters:', {
          templateArea: `${templateWidth}x${templateHeight} at (${templateX}, ${templateY})`,
          scaleFactors: { scaleX: scaleX.toFixed(3), scaleY: scaleY.toFixed(3) },
          centerPosition: { left: centerX.toFixed(1), top: centerY.toFixed(1) }
        });
        
        return {
          id: index + 1,
          status: "edited" as const,
          canvas: {
            objects: [{
              type: "avatar" as const,
              left: centerX,    // Positions avatar center in template area
              top: centerY,     // Positions avatar center in template area
              fill: "#4868FF",
              scaleX: scaleX,   // Scales to fill template width
              scaleY: scaleY,   // Scales to fill template height
              width: canvasWidth,
              height: canvasHeight,
              src: selectedAvatar.selectedVariant.canvas,
              avatarType: "transparent" as const,
              animation: {
                type: null,
                exitType: null
              }
            }],
            background: "#ffffff",
            version: "4.4.0" as const
          },
          avatar: {
            code: `${selectedAvatar.avatar.code}.${selectedAvatar.selectedVariant.code}`,
            name: selectedAvatar.avatar.name,
            gender: selectedAvatar.avatar.gender,
            canvas: selectedAvatar.selectedVariant.canvas
          },
          animation: "fade_in" as const,
          language: "English" as const,
          speech: slide.voiceoverText,
          voice: voice,
          voiceType: "text" as const,
          voiceProvider: voiceProvider
        };
      });
      
      const videoRequest: ElaiVideoRequest = {
        name: `Video Lesson - ${new Date().toISOString()}`,
        slides: elaiSlides,
        tags: ["video_lesson", "generated", "presentation"],
        public: false,
        data: {
          skipEmails: false,
          subtitlesEnabled: "false",
          format: "16_9",
          resolution: "FullHD"
        }
      };
      
      const response = await fetch(`${VideoGenerationService.ELAI_API_BASE}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VideoGenerationService.API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(videoRequest)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Video creation failed: ${response.status} - ${errorText}`);
      }
      
      const result: ElaiVideoResponse = await response.json();
      
      return {
        success: true,
        videoId: result._id
      };
      
    } catch (error) {
      console.error('Error creating Elai video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Start rendering the video
   */
  private static async renderVideo(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(`${VideoGenerationService.ELAI_API_BASE}/videos/render/${videoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VideoGenerationService.API_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error starting video render:', error);
      return false;
    }
  }
  
  /**
   * Monitor video rendering progress
   */
  private static async monitorVideoProgress(
    videoId: string,
    onProgress?: (progress: number, status: string) => void
  ): Promise<VideoGenerationResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < VideoGenerationService.MAX_WAIT_TIME) {
      try {
        const status = await this.checkVideoStatus(videoId);
        
        if (status.status === 'rendered' || status.status === 'ready') {
          const downloadUrl = status.videoUrl || status.url || status.playerData?.url;
          
          if (downloadUrl) {
            onProgress?.(100, 'completed');
            return {
              success: true,
              downloadUrl: downloadUrl,
              progress: 100
            };
          } else {
            return {
              success: false,
              error: 'Video rendered but no download URL found'
            };
          }
        } else if (status.status === 'failed' || status.status === 'error') {
          return {
            success: false,
            error: `Video generation failed: ${status.error || status.status}`
          };
        } else if (status.status === 'rendering' || status.status === 'queued' || status.status === 'validating') {
          const progress = status.progress || this.estimateProgress(status.status, startTime);
          onProgress?.(progress, status.status);
          
          await new Promise(resolve => setTimeout(resolve, VideoGenerationService.POLL_INTERVAL));
        } else {
          // Unknown status, continue monitoring
          await new Promise(resolve => setTimeout(resolve, VideoGenerationService.POLL_INTERVAL));
        }
        
      } catch (error) {
        console.error('Error checking video status:', error);
        await new Promise(resolve => setTimeout(resolve, VideoGenerationService.POLL_INTERVAL));
      }
    }
    
    return {
      success: false,
      error: 'Video generation timeout after 15 minutes'
    };
  }
  
  /**
   * Check video status from Elai API
   */
  private static async checkVideoStatus(videoId: string): Promise<ElaiVideoStatus> {
    const response = await fetch(`${VideoGenerationService.ELAI_API_BASE}/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${VideoGenerationService.API_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get video status: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Estimate progress based on status and elapsed time
   */
  private static estimateProgress(status: string, startTime: number): number {
    const elapsed = Date.now() - startTime;
    const elapsedMinutes = elapsed / (60 * 1000);
    
    switch (status) {
      case 'queued':
        return Math.min(10, elapsedMinutes * 5);
      case 'validating':
        return Math.min(30, 10 + elapsedMinutes * 10);
      case 'rendering':
        return Math.min(90, 30 + elapsedMinutes * 15);
      default:
        return 50;
    }
  }
  
  /**
   * Validate inputs before video generation
   */
  private static validateInputs(
    slides: SlideDataForVideo[], 
    selectedAvatar: SelectedAvatar
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!slides || slides.length === 0) {
      errors.push('No slides provided for video generation');
    }
    
    if (!selectedAvatar) {
      errors.push('No avatar selected for video generation');
    } else {
      const avatarValidation = AvatarService.validateAvatarForVideo(
        selectedAvatar.avatar, 
        selectedAvatar.selectedVariant.code
      );
      
      if (!avatarValidation.valid) {
        errors.push(avatarValidation.error!);
      }
    }
    
    // Validate each slide has voiceover text
    slides.forEach((slide, index) => {
      if (!slide.voiceoverText || slide.voiceoverText.trim().length === 0) {
        errors.push(`Slide ${index + 1} has no voiceover text`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Download video file from URL
   */
  static async downloadVideoFile(downloadUrl: string, filename?: string): Promise<boolean> {
    try {
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `video_lesson_${new Date().toISOString().split('T')[0]}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error downloading video:', error);
      return false;
    }
  }
}
