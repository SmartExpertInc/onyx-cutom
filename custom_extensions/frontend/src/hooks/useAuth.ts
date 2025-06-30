import { useState, useEffect } from 'react';

// Utility function to check authentication
const checkAuthentication = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/custom-projects-backend/projects/folders');
    if (res.status === 401) {
      return false; // User is not authenticated
    }
    return true; // User is authenticated
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false; // Assume not authenticated on error
  }
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await checkAuthentication();
      if (!authenticated) {
        // Redirect to login page with current URL as next parameter
        const currentUrl = window.location.pathname + window.location.search;
        window.location.href = `/auth/login?next=${encodeURIComponent(currentUrl)}`;
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};

// Utility function to handle API calls with authentication
export const authenticatedFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    // User is not authenticated, redirect to login
    const currentUrl = window.location.pathname + window.location.search;
    window.location.href = `/auth/login?next=${encodeURIComponent(currentUrl)}`;
    throw new Error('Authentication required');
  }
  return res;
}; 