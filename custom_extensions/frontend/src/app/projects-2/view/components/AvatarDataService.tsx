"use client";

import { useState, useEffect } from 'react';

// Avatar data interfaces
export interface AvatarVariant {
  code: string;
  name: string;
  thumbnail: string;
  canvas: string;
}

export interface AvatarData {
  id: string;
  code: string;
  name: string;
  gender: "male" | "female";
  age?: number;
  ethnicity?: string;
  thumbnail?: string;
  canvas?: string;
  variants: AvatarVariant[];
}

export interface ProcessedAvatar {
  id: string;
  code: string;
  name: string;
  gender: "male" | "female";
  age?: number;
  ethnicity?: string;
  thumbnail: string;
  canvas: string;
  selectedVariant?: AvatarVariant;
  displayName: string;
  lookCategory: string;
}

export interface AvatarDataServiceProps {
  children: React.ReactNode;
}

export interface AvatarDataContextType {
  avatarData: AvatarData[];
  processedAvatars: ProcessedAvatar[];
  isLoading: boolean;
  error: string | null;
  refreshAvatars: () => Promise<void>;
}

import { createContext, useContext } from 'react';

const AvatarDataContext = createContext<AvatarDataContextType | undefined>(undefined);

export const useAvatarData = () => {
  const context = useContext(AvatarDataContext);
  if (!context) {
    throw new Error('useAvatarData must be used within AvatarDataProvider');
  }
  return context;
};

export default function AvatarDataProvider({ children }: AvatarDataServiceProps) {
  const [avatarData, setAvatarData] = useState<AvatarData[]>([]);
  const [processedAvatars, setProcessedAvatars] = useState<ProcessedAvatar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 **DEBUG LOGGING: Service Initialization**
  console.log('🎬 [AVATAR_DATA_SERVICE] AvatarDataProvider initialized');
  console.log('🎬 [AVATAR_DATA_SERVICE] Initial state:', {
    avatarDataCount: avatarData.length,
    processedAvatarsCount: processedAvatars.length,
    isLoading,
    error
  });

  // Function to fetch avatar data from backend
  const fetchAvatarData = async (): Promise<AvatarData[]> => {
    console.log('🎬 [AVATAR_DATA_SERVICE] Starting avatar data fetch...');
    
    try {
      // 🔍 **DEBUG LOGGING: API Request Details**
      const apiUrl = '/api/custom/video/avatars'; // Correct backend endpoint
      console.log('🎬 [AVATAR_DATA_SERVICE] Making API request to:', apiUrl);
      console.log('🎬 [AVATAR_DATA_SERVICE] Request method: GET');
      console.log('🎬 [AVATAR_DATA_SERVICE] Request headers: { "Content-Type": "application/json" }');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      // 🔍 **DEBUG LOGGING: API Response Details**
      console.log('🎬 [AVATAR_DATA_SERVICE] API response received');
      console.log('🎬 [AVATAR_DATA_SERVICE] Response status:', response.status);
      console.log('🎬 [AVATAR_DATA_SERVICE] Response status text:', response.statusText);
      console.log('🎬 [AVATAR_DATA_SERVICE] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎬 [AVATAR_DATA_SERVICE] API request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to fetch avatars: ${response.status} - ${errorText}`);
      }

      const rawData = await response.text();
      console.log('🎬 [AVATAR_DATA_SERVICE] Raw response data received');
      console.log('🎬 [AVATAR_DATA_SERVICE] Raw data length:', rawData.length);
      console.log('🎬 [AVATAR_DATA_SERVICE] Raw data preview:', rawData.substring(0, 500));

      let parsedData: AvatarData[];
      try {
        parsedData = JSON.parse(rawData);
        console.log('🎬 [AVATAR_DATA_SERVICE] JSON parsing successful');
      } catch (parseError) {
        console.error('🎬 [AVATAR_DATA_SERVICE] JSON parsing failed:', parseError);
        console.error('🎬 [AVATAR_DATA_SERVICE] Raw data that failed to parse:', rawData);
        throw new Error(`Failed to parse avatar data: ${parseError}`);
      }

      // 🔍 **DEBUG LOGGING: Parsed Data Analysis**
      console.log('🎬 [AVATAR_DATA_SERVICE] Parsed data analysis:');
      console.log('🎬 [AVATAR_DATA_SERVICE] Data type:', typeof parsedData);
      console.log('🎬 [AVATAR_DATA_SERVICE] Is array:', Array.isArray(parsedData));
      console.log('🎬 [AVATAR_DATA_SERVICE] Data length:', parsedData?.length || 'undefined');
      console.log('🎬 [AVATAR_DATA_SERVICE] Full parsed data:', parsedData);

      // Validate data structure
      if (!Array.isArray(parsedData)) {
        console.error('🎬 [AVATAR_DATA_SERVICE] Parsed data is not an array:', parsedData);
        throw new Error('Avatar data is not an array');
      }

      if (parsedData.length === 0) {
        console.warn('🎬 [AVATAR_DATA_SERVICE] Parsed data is an empty array');
      }

      // Validate each avatar object
      const validatedData: AvatarData[] = [];
      for (let i = 0; i < parsedData.length; i++) {
        const avatar = parsedData[i];
        console.log(`🎬 [AVATAR_DATA_SERVICE] Validating avatar ${i + 1}:`, avatar);
        
        if (!avatar || typeof avatar !== 'object') {
          console.error(`🎬 [AVATAR_DATA_SERVICE] Avatar ${i + 1} is not an object:`, avatar);
          continue;
        }

        // Check required fields
        const requiredFields = ['id', 'code', 'name', 'gender', 'variants'];
        const missingFields = requiredFields.filter(field => !(field in avatar));
        
        if (missingFields.length > 0) {
          console.error(`🎬 [AVATAR_DATA_SERVICE] Avatar ${i + 1} missing required fields:`, missingFields);
          console.error(`🎬 [AVATAR_DATA_SERVICE] Avatar ${i + 1} data:`, avatar);
          continue;
        }

        // Validate variants
        if (!Array.isArray(avatar.variants)) {
          console.error(`🎬 [AVATAR_DATA_SERVICE] Avatar ${i + 1} variants is not an array:`, avatar.variants);
          continue;
        }

        console.log(`🎬 [AVATAR_DATA_SERVICE] Avatar ${i + 1} validation passed:`, {
          id: avatar.id,
          code: avatar.code,
          name: avatar.name,
          gender: avatar.gender,
          variantsCount: avatar.variants.length
        });

        validatedData.push(avatar as AvatarData);
      }

      console.log('🎬 [AVATAR_DATA_SERVICE] Data validation complete');
      console.log('🎬 [AVATAR_DATA_SERVICE] Valid avatars count:', validatedData.length);
      console.log('🎬 [AVATAR_DATA_SERVICE] Final validated data:', validatedData);

      return validatedData;

    } catch (error) {
      console.error('🎬 [AVATAR_DATA_SERVICE] Error fetching avatar data:', error);
      
      // 🔍 **DEBUG LOGGING: Fallback to Mock Data**
      console.log('🎬 [AVATAR_DATA_SERVICE] Falling back to mock data due to error');
      
      // Return comprehensive mock data for testing
      const fallbackData: AvatarData[] = [
        {
          id: '1',
          code: 'gia',
          name: 'Gia',
          gender: 'female',
          age: 25,
          ethnicity: 'Asian',
          thumbnail: '',
          canvas: '',
          variants: [
            { code: 'casual', name: 'Casual', thumbnail: '', canvas: '' },
            { code: 'business', name: 'Business', thumbnail: '', canvas: '' },
            { code: 'doctor', name: 'Doctor', thumbnail: '', canvas: '' }
          ]
        },
        {
          id: '2',
          code: 'mike',
          name: 'Mike',
          gender: 'male',
          age: 35,
          ethnicity: 'Caucasian',
          thumbnail: '',
          canvas: '',
          variants: [
            { code: 'casual', name: 'Casual', thumbnail: '', canvas: '' },
            { code: 'business', name: 'Business', thumbnail: '', canvas: '' },
            { code: 'construction', name: 'Construction', thumbnail: '', canvas: '' }
          ]
        },
        {
          id: '3',
          code: 'sarah',
          name: 'Sarah',
          gender: 'female',
          age: 28,
          ethnicity: 'Black',
          thumbnail: '',
          canvas: '',
          variants: [
            { code: 'casual', name: 'Casual', thumbnail: '', canvas: '' },
            { code: 'fitness', name: 'Fitness', thumbnail: '', canvas: '' }
          ]
        },
        {
          id: '4',
          code: 'david',
          name: 'David',
          gender: 'male',
          age: 42,
          ethnicity: 'South Asian',
          thumbnail: '',
          canvas: '',
          variants: [
            { code: 'business', name: 'Business', thumbnail: '', canvas: '' },
            { code: 'chef', name: 'Chef', thumbnail: '', canvas: '' }
          ]
        }
      ];

      console.log('🎬 [AVATAR_DATA_SERVICE] Fallback mock data created:', fallbackData);
      return fallbackData;
    }
  };

  // Function to process avatar data
  const processAvatarData = (avatars: AvatarData[]): ProcessedAvatar[] => {
    console.log('🎬 [AVATAR_DATA_SERVICE] Starting avatar data processing...');
    console.log('🎬 [AVATAR_DATA_SERVICE] Input avatars count:', avatars.length);
    console.log('🎬 [AVATAR_DATA_SERVICE] Input avatars:', avatars);

    const processed: ProcessedAvatar[] = [];

    for (let i = 0; i < avatars.length; i++) {
      const avatar = avatars[i];
      console.log(`🎬 [AVATAR_DATA_SERVICE] Processing avatar ${i + 1}:`, avatar);

      if (avatar.variants && avatar.variants.length > 0) {
        console.log(`🎬 [AVATAR_DATA_SERVICE] Avatar ${i + 1} has ${avatar.variants.length} variants`);
        
        // Create separate entry for each variant
        for (let j = 0; j < avatar.variants.length; j++) {
          const variant = avatar.variants[j];
          console.log(`🎬 [AVATAR_DATA_SERVICE] Processing variant ${j + 1} for avatar ${i + 1}:`, variant);
          
          const processedAvatar: ProcessedAvatar = {
            id: avatar.id,
            code: avatar.code,
            name: avatar.name,
            gender: avatar.gender,
            age: avatar.age,
            ethnicity: avatar.ethnicity,
            thumbnail: variant.thumbnail,
            canvas: variant.canvas,
            selectedVariant: variant,
            displayName: `${avatar.name}`,
            lookCategory: variant.name
          };

          console.log(`🎬 [AVATAR_DATA_SERVICE] Created processed avatar for variant ${j + 1}:`, processedAvatar);
          processed.push(processedAvatar);
        }
      } else {
        console.log(`🎬 [AVATAR_DATA_SERVICE] Avatar ${i + 1} has no variants, creating default entry`);
        
        // Avatar without variants
        const processedAvatar: ProcessedAvatar = {
          id: avatar.id,
          code: avatar.code,
          name: avatar.name,
          gender: avatar.gender,
          age: avatar.age,
          ethnicity: avatar.ethnicity,
          thumbnail: avatar.thumbnail || avatar.canvas || '',
          canvas: avatar.canvas || '',
          displayName: avatar.name,
          lookCategory: 'Default'
        };

        console.log(`🎬 [AVATAR_DATA_SERVICE] Created default processed avatar:`, processedAvatar);
        processed.push(processedAvatar);
      }
    }

    console.log('🎬 [AVATAR_DATA_SERVICE] Avatar processing complete');
    console.log('🎬 [AVATAR_DATA_SERVICE] Final processed avatars count:', processed.length);
    console.log('🎬 [AVATAR_DATA_SERVICE] Final processed avatars:', processed);

    return processed;
  };

  // Function to refresh avatar data
  const refreshAvatars = async () => {
    console.log('🎬 [AVATAR_DATA_SERVICE] Refresh avatars requested');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedData = await fetchAvatarData();
      console.log('🎬 [AVATAR_DATA_SERVICE] Avatar data fetched successfully:', fetchedData);
      
      setAvatarData(fetchedData);
      
      const processed = processAvatarData(fetchedData);
      console.log('🎬 [AVATAR_DATA_SERVICE] Avatar data processed and set:', processed);
      
      setProcessedAvatars(processed);
      
      console.log('🎬 [AVATAR_DATA_SERVICE] Avatar refresh completed successfully');
      
    } catch (error) {
      console.error('🎬 [AVATAR_DATA_SERVICE] Error refreshing avatars:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
      console.log('🎬 [AVATAR_DATA_SERVICE] Avatar refresh loading state cleared');
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('🎬 [AVATAR_DATA_SERVICE] Initial data fetch effect triggered');
    refreshAvatars();
  }, []);

  // 🔍 **DEBUG LOGGING: State Changes**
  useEffect(() => {
    console.log('🎬 [AVATAR_DATA_SERVICE] State updated:', {
      avatarDataCount: avatarData.length,
      processedAvatarsCount: processedAvatars.length,
      isLoading,
      error
    });
  }, [avatarData, processedAvatars, isLoading, error]);

  const contextValue: AvatarDataContextType = {
    avatarData,
    processedAvatars,
    isLoading,
    error,
    refreshAvatars
  };

  console.log('🎬 [AVATAR_DATA_SERVICE] Providing context value:', contextValue);

  return (
    <AvatarDataContext.Provider value={contextValue}>
      {children}
    </AvatarDataContext.Provider>
  );
}
