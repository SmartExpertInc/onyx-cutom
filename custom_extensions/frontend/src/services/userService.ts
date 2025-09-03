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
    
    // Check for user info in cookies or other storage
    // This is where you'd integrate with your actual auth system
  }
  
  // Fallback to hardcoded value (should be replaced with actual auth)
  const fallbackUserId = "current_user_123";
  console.log('🔍 [USER SERVICE] Using fallback user ID:', fallbackUserId);
  console.warn('⚠️ [USER SERVICE] Using hardcoded fallback user ID. This should be replaced with actual auth integration.');
  
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
      
      return {
        id: userId,
        email: userData.email,
        name: userData.name || userData.display_name
      };
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