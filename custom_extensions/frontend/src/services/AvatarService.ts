// custom_extensions/frontend/src/services/AvatarService.ts

import { ElaiAvatar, AvatarServiceResponse } from '@/types/elaiTypes';

export class AvatarService {
  private static readonly API_BASE = 'https://apis.elai.io/api/v1';
  private static readonly API_TOKEN = '5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e';
  
  /**
   * Fetch all available avatars from Elai API
   */
  static async fetchAvatars(): Promise<AvatarServiceResponse> {
    try {
      const response = await fetch(`${AvatarService.API_BASE}/avatars`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${AvatarService.API_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.status} - ${response.statusText}`);
      }
      
      const avatars: ElaiAvatar[] = await response.json();
      
      return {
        success: true,
        data: avatars
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
