"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';

interface User {
  onyx_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  needs_profile_completion?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, first_name: string, last_name: string) => Promise<User>;
  logout: () => void;
  updateProfile: (first_name: string, last_name: string) => Promise<User>;
  completeProfile: (onyx_user_id: string, first_name: string, last_name: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user data on mount
    const storedUser = localStorage.getItem('customUserData');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('customUserData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await fetch('/api/custom-projects-backend/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('customUserData', JSON.stringify(userData));
    return userData;
  };

  const register = async (email: string, password: string, first_name: string, last_name: string): Promise<User> => {
    const response = await fetch('/api/custom-projects-backend/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        email,
        password,
        first_name,
        last_name
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('customUserData', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      // First, try to logout from Onyx's system
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (error) {
      console.error('Error logging out from Onyx:', error);
    }
    
    // Clear custom user data
    setUser(null);
    localStorage.removeItem('customUserData');
    
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  const updateProfile = async (first_name: string, last_name: string): Promise<User> => {
    const response = await fetch('/api/custom-projects-backend/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ first_name, last_name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Profile update failed');
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('customUserData', JSON.stringify(userData));
    return userData;
  };

  const completeProfile = async (onyx_user_id: string, first_name: string, last_name: string): Promise<User> => {
    const response = await fetch('/api/custom-projects-backend/auth/complete-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ 
        onyx_user_id, 
        first_name, 
        last_name 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Profile completion failed');
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('customUserData', JSON.stringify(userData));
    return userData;
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    completeProfile,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 