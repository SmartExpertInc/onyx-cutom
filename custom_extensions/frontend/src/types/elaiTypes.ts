// custom_extensions/frontend/src/types/elaiTypes.ts

// Avatar Types
export interface ElaiAvatarVariant {
  code: string;
  id: string;
  name: string;
  thumbnail: string;
  canvas: string;
  limit?: number;
  intro?: string;
  introPoster?: string;
  listeningAvatar?: {
    canvas: string;
    file: string;
    alpha_video_file: string;
  };
}

export interface ElaiAvatar {
  id: string;
  code: string;
  name: string;
  type: string | null;
  status: number;
  accountId: string;
  gender: 'male' | 'female';
  thumbnail: string;
  canvas: string;
  limit?: number;
  defaultVoice?: string;
  age?: number;
  ethnicity?: string;
  variants: ElaiAvatarVariant[];
  tilt?: {
    zoom: number;
    top: number;
    left: number;
  };
}

// Video Creation Types
export interface ElaiSlideData {
  id: number;
  status: "edited";
  canvas: {
    objects: Array<{
      type: "avatar";
      left: number;
      top: number;
      fill: string;
      scaleX: number;
      scaleY: number;
      width: number;
      height: number;
      src: string;
      avatarType: "transparent";
      animation: {
        type: null;
        exitType: null;
      };
    }>;
    background: string;
    version: "4.4.0";
  };
  avatar: {
    code: string;
    name: string;
    gender: 'male' | 'female';
    canvas: string;
  };
  animation: "fade_in";
  language: "English";
  speech: string;
  voice: string;
  voiceType: "text";
  voiceProvider: "azure" | "elevenlabs";
}

export interface ElaiVideoRequest {
  name: string;
  slides: ElaiSlideData[];
  tags: string[];
  public?: boolean;
  data?: {
    skipEmails?: boolean;
    subtitlesEnabled?: string;
    format?: string;
    musicUrl?: string;
    musicVolume?: number;
    resolution?: string;
  };
}

export interface ElaiVideoResponse {
  _id: string;
  name: string;
  slides: ElaiSlideData[];
  tags: string[];
  deleted: boolean;
  status: string;
  verified: boolean;
  public: boolean;
  userId: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

// Video Status Types
export interface ElaiVideoStatus {
  _id: string;
  status: 'draft' | 'rendering' | 'rendered' | 'ready' | 'failed' | 'error' | 'queued' | 'validating';
  videoUrl?: string;
  url?: string;
  playerData?: {
    url?: string;
  };
  progress?: number;
  error?: string;
}

// Service Response Types
export interface AvatarServiceResponse {
  success: boolean;
  data?: ElaiAvatar[];
  error?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoId?: string;
  downloadUrl?: string;
  error?: string;
  progress?: number;
}

// Frontend State Types
export interface SelectedAvatar {
  avatar: ElaiAvatar;
  selectedVariant: ElaiAvatarVariant;
}

export interface VideoGenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  error?: string;
  downloadUrl?: string;
}

// Slide Data for Video Generation
export interface SlideDataForVideo {
  id: number;
  imageUrl: string;
  voiceoverText: string;
  slideIndex: number;
}
