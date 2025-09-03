/**
 * User Service for Custom Extensions
 * Handles user identification and authentication for workspace features
 */

export interface CurrentUser {
  id: string;
  email?: string;
  name?: string;
}

/**
 * Get the current user ID for API calls and workspace operations
 * This is a synchronous function that tries various sources
 */
export const getCurrentUserId = (): string => {
  // In development, try to get from sessionStorage first
  if (process.env.NODE_ENV === 'development') {
    const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") : null;
    if (devUserId) {
      console.log('🔍 [USER SERVICE] Using dev user ID from sessionStorage:', devUserId);
      return devUserId;
    }
  }
  
  // Try to get from other sources (cookies, localStorage, etc.)
  if (typeof window !== "undefined") {
    // Check for user ID in localStorage
    const storedUserId = localStorage.getItem("onyx_user_id");
    if (storedUserId) {
      console.log('🔍 [USER SERVICE] Using user ID from localStorage:', storedUserId);
      return storedUserId;
    }
    
    // Try to get from cached user data
    const cachedUser = localStorage.getItem("current_user_cache");
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        if (userData.id || userData.email) {
          const userId = userData.id || userData.email;
          console.log('🔍 [USER SERVICE] Using user ID from cache:', userId);
          return userId;
        }
      } catch (e) {
        console.warn('⚠️ [USER SERVICE] Failed to parse cached user data');
      }
    }
  }
  
  // Fallback to hardcoded value (should be replaced with actual auth)
  const fallbackUserId = "current_user_123";
  console.log('🔍 [USER SERVICE] Using fallback user ID:', fallbackUserId);
  console.warn('⚠️ [USER SERVICE] Using hardcoded fallback user ID. This should be replaced with actual auth integration.');
  console.warn('💡 [USER SERVICE] To test with different users, use: setTestUser("your-email@example.com")');
  
  return fallbackUserId;
};

/**
 * Get current user information from the backend
 */
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    const response = await fetch('/api/me', {
      credentials: 'same-origin',
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('🔍 [USER SERVICE] Got user data from /api/me:', userData);
      
      // Extract user ID from the response
      const userId = userData.id || userData.email || getCurrentUserId();
      
      const currentUser = {
        id: userId,
        email: userData.email,
        name: userData.name || userData.display_name
      };
      
      // Cache user data for future synchronous access
      if (typeof window !== "undefined") {
        localStorage.setItem("current_user_cache", JSON.stringify(currentUser));
        localStorage.setItem("onyx_user_id", userId);
        console.log('💾 [USER SERVICE] Cached user data for synchronous access');
      }
      
      return currentUser;
    } else {
      console.warn('⚠️ [USER SERVICE] Failed to get user from /api/me, using fallback');
      return {
        id: getCurrentUserId()
      };
    }
  } catch (error) {
    console.error('❌ [USER SERVICE] Error getting current user:', error);
    return {
      id: getCurrentUserId()
    };
  }
};

/**
 * Initialize user data on page load
 * Call this early in your app lifecycle
 */
export const initializeUser = async (): Promise<void> => {
  console.log('🚀 [USER SERVICE] Initializing user data...');
  try {
    const user = await getCurrentUser();
    if (user) {
      console.log('✅ [USER SERVICE] User initialized:', user.id);
    }
  } catch (error) {
    console.error('❌ [USER SERVICE] Failed to initialize user:', error);
  }
};

/**
 * Set the development user ID (for testing purposes)
 */
export const setDevUserId = (userId: string): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("dev_user_id", userId);
    console.log('🔧 [USER SERVICE] Set dev user ID:', userId);
  }
};

/**
 * Clear the development user ID
 */
export const clearDevUserId = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("dev_user_id");
    console.log('🔧 [USER SERVICE] Cleared dev user ID');
  }
}; 