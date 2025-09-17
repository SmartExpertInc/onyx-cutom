'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import Userback, { UserbackWidget } from '@userback/widget';

// Context type definition
interface UserbackContextType {
  userback: UserbackWidget | null;
  initUserback: (userData: {
    id: string;
    email: string;
  }) => Promise<void>;
}

// Create context with strict typing
const UserbackContext = createContext<UserbackContextType | undefined>(
  undefined
);

const token = "A-E3OEYDV2KB1UuBSE8yuXb3RQm";

// Provider props
interface UserbackProviderProps {
  children: ReactNode;
}

// UserbackProvider component
export const UserbackProvider: React.FC<UserbackProviderProps> = ({ children }) => {
  const [userback, setUserback] = useState<UserbackWidget | null>(null);

  const initUserback = useCallback(
    async (userData: { id: string; email: string }) => {
      try {
        const instance = await Userback(token, {
          user_data: {
            id: userData.id,
            info: {
              email: userData.email,
            },
          },
          autohide: false,
        });

        setUserback(instance);
        console.log('✅ Userback initialized for user:', userData);
      } catch (error) {
        console.error('❌ Failed to initialize Userback:', error);
      }
    },
    []
  );

  // Optional: pre-initialize without user info (anonymous session)
  useEffect(() => {
    const preInit = async () => {
      try {
        const instance = await Userback(token, { autohide: true });
        setUserback(instance);
      } catch (error) {
        console.error('❌ Failed to pre-initialize Userback:', error);
      }
    };
    preInit();
  }, []);

  return (
    <UserbackContext.Provider value={{ userback, initUserback }}>
      {children}
    </UserbackContext.Provider>
  );
};

// Custom hook for accessing Userback
export const useUserback = (): UserbackContextType => {
  const context = useContext(UserbackContext);
  if (!context) {
    throw new Error('useUserback must be used within a UserbackProvider');
  }
  return context;
};
