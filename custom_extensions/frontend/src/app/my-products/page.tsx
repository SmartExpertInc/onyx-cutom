"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderPlus,
  Plus,
  FileText,
  Bell,
  Coins
} from 'lucide-react';
import { UserDropdown } from '../../components/UserDropdown';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import TariffPlanModal from '@/components/ui/tariff-plan-modal';
import AddOnsModal from '../../components/AddOnsModal';
import RegistrationSurveyModal from "../../components/ui/registration-survey-modal";
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
}

// Authentication check function
const checkAuthentication = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/me', {
      credentials: 'same-origin',
    });
    if (!response.ok) {
      return null;
    }
    const userData = await response.json();

    return {
      id: userData.id,
      email: userData.email,
    };
  } catch (error) {
    console.error('Authentication check failed:', error);
    return null;
  }
};

// Check if user completed the questionnaire
const checkQuestionnaireCompletion = async (userId: string): Promise<boolean> => {
  try {
    const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
    const response = await fetch(`${CUSTOM_BACKEND_URL}/questionnaires/${userId}/completion`, { credentials: 'same-origin' });
    const data = await response.json();
    return !!data.completed;
  } catch (error) {
    console.error('Questionnaire check failed:', error);
    return true; // Default to true to avoid blocking access on error
  }
};

// Helper function to redirect to main app's auth endpoint
const redirectToMainAuth = (path: string) => {
  // Get the current domain and protocol
  const protocol = window.location.protocol;
  const host = window.location.host;
  const mainAppUrl = `${protocol}//${host}${path}`;
  window.location.href = mainAppUrl;
};

const Header = ({ onTariffModalOpen, onAddOnsModalOpen }: { onTariffModalOpen: () => void; onAddOnsModalOpen: () => void;}) => {
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { t } = useLanguage();

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Fetch user credits on component mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/credits/me`, {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const credits = await response.json();
          setUserCredits(credits.credits_balance);
        }
      } catch (error) {
        console.error('Failed to fetch user credits:', error);
        // Keep userCredits as null to show loading state
      }
    };

    fetchUserCredits();
  }, []);

  return (
    <header className="flex items-center justify-between p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
      <h1 className="text-3xl font-semibold text-gray-900">My products</h1>
      <div className="flex items-center gap-4">
        <Button variant="download" className="bg-[#D8FDF9] hover:bg-[#CEF2EF]/90 text-[#06A294] flex items-center gap-2 rounded-md font-bold public-sans text-xs" onClick={onTariffModalOpen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <g clip-path="url(#clip0_308_17348)">
          <path d="M12.3176 11.7968C11.8825 11.9633 11.6458 12.2012 11.4774 12.6356C11.3107 12.2012 11.0724 11.9649 10.6372 11.7968C11.0724 11.6303 11.3091 11.394 11.4774 10.9579C11.6442 11.3924 11.8825 11.6287 12.3176 11.7968ZM11.5382 4.99568C11.9153 3.5935 12.4306 3.07794 13.8366 2.70096C12.4322 2.3245 11.9158 1.81001 11.5382 0.40625C11.1611 1.80843 10.6458 2.32399 9.23981 2.70096C10.6442 3.07743 11.1606 3.59192 11.5382 4.99568ZM11.9486 7.88981C11.9486 7.7577 11.8798 7.5982 11.6872 7.5445C10.1118 7.10467 9.12471 6.60253 8.38772 5.86735C7.65079 5.13161 7.14678 4.14608 6.70788 2.57315C6.65409 2.38089 6.49433 2.31215 6.36201 2.31215C6.22969 2.31215 6.06993 2.38089 6.01615 2.57315C5.57561 4.14608 5.07266 5.13155 4.33631 5.86735C3.5983 6.60418 2.61227 7.1063 1.03681 7.5445C0.844242 7.5982 0.775391 7.75771 0.775391 7.88981C0.775391 8.02192 0.844242 8.18143 1.03681 8.23513C2.61227 8.67496 3.59932 9.1771 4.33631 9.91227C5.07431 10.6491 5.57725 11.6335 6.01615 13.2065C6.06994 13.3987 6.2297 13.4675 6.36201 13.4675C6.49434 13.4675 6.6541 13.3987 6.70788 13.2065C7.14842 11.6335 7.65137 10.6481 8.38772 9.91227C9.12573 9.17545 10.1118 8.67332 11.6872 8.23513C11.8798 8.18142 11.9486 8.02192 11.9486 7.88981Z" fill="#06A294"/>
          </g>
          <defs>
          <clipPath id="clip0_308_17348">
          <rect width="14.6939" height="14.6939" fill="white" transform="translate(0.775391 0.407227)"/>
          </clipPath>
          </defs>
        </svg>
            {t("interface.getUnlimitedAI", "Get Unlimited AI")}</Button>
        <button 
          onClick={onAddOnsModalOpen}
          className="flex items-center gap-2 bg-[#F7E0FC] hover:bg-[#EBD5F0]/90 text-sm font-bold text-[#8808A2] px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
        >
          <Coins strokeWidth={1.5} size={16} className="font-normal text-[#8808A2]" />
          {userCredits !== null ? `${userCredits} ${t('interface.courseOutline.credits', 'Credits')}` : t('interface.loading', 'Loading...')}
        </button>
        <Bell size={20} className="text-gray-600 cursor-pointer" />
        <LanguageDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

// --- Main component ---
const MyProductsPageInner: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentUser, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isQuestionnaireCompleted, setQuestionnaireCompleted] = useState<boolean | null>(null);
  const [tariffModalOpen, setTariffModalOpen] = useState(false);
  const [addOnsModalOpen, setAddOnsModalOpen] = useState(false);

  // Check questionnaire completion on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = sessionStorage.getItem('questionnaireCompleted') === 'true';
      setQuestionnaireCompleted(completed);
    }
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await checkAuthentication();
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          // Check questionnaire completion
          const completed = await checkQuestionnaireCompletion(user.id);
          setQuestionnaireCompleted(completed);
        } else {
          setIsAuthenticated(false);
          // Redirect to main app's login page
          redirectToMainAuth('/auth/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        // Redirect to main app's login page
        redirectToMainAuth('/auth/login');
      }
    };

    checkAuth();
  }, []);

  const handleSurveyComplete = async (answers: any) => {
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const payload = {
        user_id: currentUser?.id,
        answers: answers,
        completed_at: new Date().toISOString()
      };
      const res = await fetch(`${CUSTOM_BACKEND_URL}/questionnaires/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('questionnaireCompleted', 'true');
        }
        setQuestionnaireCompleted(true);
        console.log('Survey answers saved successfully');
      } else {
        console.error('Failed to save survey answers:', await res.text());
      }
    } catch (err) {
      console.error('Error sending survey answers:', err);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('interface.loading', 'Loading...')}</span>
      </div>
    );
  }

  // Show authentication error
  if (isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('interface.authenticationRequired', 'Authentication Required')}</h2>
          <p className="text-gray-600 mb-4">{t('interface.pleaseLogin', 'Please log in to access this page.')}</p>
          <Button onClick={() => redirectToMainAuth('/auth/login')}>
            {t('interface.login', 'Login')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onTariffModalOpen={() => setTariffModalOpen(true)} onAddOnsModalOpen={() => setAddOnsModalOpen(true)}/>
      <main className="p-8">
        {!isQuestionnaireCompleted ? (
          <RegistrationSurveyModal onComplete={handleSurveyComplete} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-900">My products</h2>
                <Button
                  onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}
                  className="flex items-center gap-2"
                >
                  <FolderPlus size={16} />
                  Add folder
                </Button>
              </div>
            </div>
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FileText className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                My Products
              </h3>
              <p className="text-gray-600 mb-4">
                This page will show your created products with folder organization.
              </p>
              <Button onClick={() => router.push('/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </div>
          </div>
        )}
      </main>
      <TariffPlanModal
        open={tariffModalOpen}
        onOpenChange={setTariffModalOpen}
      />
      <AddOnsModal
        isOpen={addOnsModalOpen}
        onClose={() => setAddOnsModalOpen(false)}
      />
    </div>
  );
};

// --- Wrapper component for Suspense ---
const MyProductsPage: React.FC = () => {
  return (
    <MyProductsPageInner />
  );
};

export default MyProductsPage;