import { NextRequest, NextResponse } from 'next/server';

// 🔍 **DEBUG LOGGING: API Route Handler**
console.log('🎬 [AVATARS_API] Avatar API route handler loaded');

export async function GET(request: NextRequest) {
  console.log('🎬 [AVATARS_API] GET request received for avatars');
  console.log('🎬 [AVATARS_API] Request URL:', request.url);
  console.log('🎬 [AVATARS_API] Request method:', request.method);
  console.log('🎬 [AVATARS_API] Request headers:', Object.fromEntries(request.headers.entries()));

  try {
    // 🔍 **DEBUG LOGGING: Mock Data Creation**
    console.log('🎬 [AVATARS_API] Creating mock avatar data...');
    
    const mockAvatarData = [
      {
        id: '1',
        code: 'gia',
        name: 'Gia',
        gender: 'female',
        age: 25,
        ethnicity: 'Asian',
        thumbnail: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=Gia',
        canvas: 'https://via.placeholder.com/1080x1080/FF6B6B/FFFFFF?text=Gia+Canvas',
        variants: [
          {
            code: 'casual',
            name: 'Casual',
            thumbnail: 'https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=Gia+Casual',
            canvas: 'https://via.placeholder.com/1080x1080/4ECDC4/FFFFFF?text=Gia+Casual+Canvas'
          },
          {
            code: 'business',
            name: 'Business',
            thumbnail: 'https://via.placeholder.com/150x150/45B7D1/FFFFFF?text=Gia+Business',
            canvas: 'https://via.placeholder.com/1080x1080/45B7D1/FFFFFF?text=Gia+Business+Canvas'
          },
          {
            code: 'doctor',
            name: 'Doctor',
            thumbnail: 'https://via.placeholder.com/150x150/96CEB4/FFFFFF?text=Gia+Doctor',
            canvas: 'https://via.placeholder.com/1080x1080/96CEB4/FFFFFF?text=Gia+Doctor+Canvas'
          }
        ]
      },
      {
        id: '2',
        code: 'mike',
        name: 'Mike',
        gender: 'male',
        age: 35,
        ethnicity: 'Caucasian',
        thumbnail: 'https://via.placeholder.com/150x150/FFEAA7/000000?text=Mike',
        canvas: 'https://via.placeholder.com/1080x1080/FFEAA7/000000?text=Mike+Canvas',
        variants: [
          {
            code: 'casual',
            name: 'Casual',
            thumbnail: 'https://via.placeholder.com/150x150/DDA0DD/000000?text=Mike+Casual',
            canvas: 'https://via.placeholder.com/1080x1080/DDA0DD/000000?text=Mike+Casual+Canvas'
          },
          {
            code: 'business',
            name: 'Business',
            thumbnail: 'https://via.placeholder.com/150x150/98D8C8/000000?text=Mike+Business',
            canvas: 'https://via.placeholder.com/1080x1080/98D8C8/000000?text=Mike+Business+Canvas'
          },
          {
            code: 'construction',
            name: 'Construction',
            thumbnail: 'https://via.placeholder.com/150x150/F7DC6F/000000?text=Mike+Construction',
            canvas: 'https://via.placeholder.com/1080x1080/F7DC6F/000000?text=Mike+Construction+Canvas'
          }
        ]
      },
      {
        id: '3',
        code: 'sarah',
        name: 'Sarah',
        gender: 'female',
        age: 28,
        ethnicity: 'Black',
        thumbnail: 'https://via.placeholder.com/150x150/BB8FCE/FFFFFF?text=Sarah',
        canvas: 'https://via.placeholder.com/1080x1080/BB8FCE/FFFFFF?text=Sarah+Canvas',
        variants: [
          {
            code: 'casual',
            name: 'Casual',
            thumbnail: 'https://via.placeholder.com/150x150/85C1E9/FFFFFF?text=Sarah+Casual',
            canvas: 'https://via.placeholder.com/1080x1080/85C1E9/FFFFFF?text=Sarah+Casual+Canvas'
          },
          {
            code: 'fitness',
            name: 'Fitness',
            thumbnail: 'https://via.placeholder.com/150x150/F8C471/FFFFFF?text=Sarah+Fitness',
            canvas: 'https://via.placeholder.com/1080x1080/F8C471/FFFFFF?text=Sarah+Fitness+Canvas'
          }
        ]
      },
      {
        id: '4',
        code: 'david',
        name: 'David',
        gender: 'male',
        age: 42,
        ethnicity: 'South Asian',
        thumbnail: 'https://via.placeholder.com/150x150/82E0AA/000000?text=David',
        canvas: 'https://via.placeholder.com/1080x1080/82E0AA/000000?text=David+Canvas',
        variants: [
          {
            code: 'business',
            name: 'Business',
            thumbnail: 'https://via.placeholder.com/150x150/F1948A/000000?text=David+Business',
            canvas: 'https://via.placeholder.com/1080x1080/F1948A/000000?text=David+Business+Canvas'
          },
          {
            code: 'chef',
            name: 'Chef',
            thumbnail: 'https://via.placeholder.com/150x150/85C1E9/000000?text=David+Chef',
            canvas: 'https://via.placeholder.com/1080x1080/85C1E9/000000?text=David+Chef+Canvas'
          }
        ]
      }
    ];

    console.log('🎬 [AVATARS_API] Mock avatar data created successfully');
    console.log('🎬 [AVATARS_API] Total avatars:', mockAvatarData.length);
    console.log('🎬 [AVATARS_API] Avatar details:');
    
    mockAvatarData.forEach((avatar, index) => {
      console.log(`🎬 [AVATARS_API] Avatar ${index + 1}:`, {
        id: avatar.id,
        code: avatar.code,
        name: avatar.name,
        gender: avatar.gender,
        age: avatar.age,
        ethnicity: avatar.ethnicity,
        variantsCount: avatar.variants.length
      });
    });

    // 🔍 **DEBUG LOGGING: Response Preparation**
    console.log('🎬 [AVATARS_API] Preparing response...');
    console.log('🎬 [AVATARS_API] Response data to be sent:', mockAvatarData);
    
    // Add artificial delay to simulate real API
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('🎬 [AVATARS_API] Sending successful response');
    
    return NextResponse.json(mockAvatarData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Debug-Info': 'Mock avatar data for testing'
      }
    });

  } catch (error) {
    console.error('🎬 [AVATARS_API] Error in avatar API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch avatars',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Info': 'Error occurred while fetching avatars'
        }
      }
    );
  }
}
