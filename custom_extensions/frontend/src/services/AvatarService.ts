// custom_extensions/frontend/src/services/AvatarService.ts

import { ElaiAvatar, AvatarServiceResponse } from '@/types/elaiTypes';

export class AvatarService {
  private static readonly CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
  
  /**
   * Fetch all available avatars from backend API
   */
  static async fetchAvatars(): Promise<AvatarServiceResponse> {
    try {
      // Call backend endpoint instead of direct Elai API
      const response = await fetch(`${AvatarService.CUSTOM_BACKEND_URL}/video/avatars`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch avatars');
      }
      
      return {
        success: true,
        data: result.avatars || []
      };
    } catch (error) {
      console.error('Error fetching avatars:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get avatars that support extended duration (5 minutes)
   */
  static getExtendedDurationAvatars(avatars: ElaiAvatar[]): ElaiAvatar[] {
    return avatars.filter(avatar => 
      avatar.limit === 300 || 
      avatar.variants.some(variant => variant.limit === 300)
    );
  }
  
  /**
   * Filter avatars by variant type
   */
  static filterAvatarsByVariant(avatars: ElaiAvatar[], variantCode: string): ElaiAvatar[] {
    return avatars.filter(avatar => 
      avatar.variants.some(variant => variant.code === variantCode)
    );
  }
  
  /**
   * Get available variant codes from all avatars
   */
  static getAvailableVariantCodes(avatars: ElaiAvatar[]): string[] {
    const variantCodes = new Set<string>();
    
    avatars.forEach(avatar => {
      avatar.variants.forEach(variant => {
        variantCodes.add(variant.code);
      });
    });
    
    return Array.from(variantCodes).sort();
  }
  
  /**
   * Get default voice for an avatar
   */
  static getDefaultVoice(avatar: ElaiAvatar): string {
    if (avatar.defaultVoice) {
      return avatar.defaultVoice;
    }
    
    // Fallback to Azure voices based on gender
    return avatar.gender === 'female' ? 'en-US-AriaNeural' : 'en-US-GuyNeural';
  }
  
  /**
   * Get voice provider based on voice string
   */
  static getVoiceProvider(voice: string): 'azure' | 'elevenlabs' {
    return voice.startsWith('elevenlabs') ? 'elevenlabs' : 'azure';
  }
  
  /**
   * Validate avatar selection for video generation
   */
  static validateAvatarForVideo(avatar: ElaiAvatar, selectedVariant?: string): { valid: boolean; error?: string } {
    // Check if avatar has variants
    if (avatar.variants.length === 0) {
      return { valid: false, error: 'Avatar has no variants available' };
    }
    
    // If variant is specified, check if it exists
    if (selectedVariant) {
      const variant = avatar.variants.find(v => v.code === selectedVariant);
      if (!variant) {
        return { valid: false, error: `Variant '${selectedVariant}' not found for avatar '${avatar.name}'` };
      }
    }
    
    return { valid: true };
  }
}
