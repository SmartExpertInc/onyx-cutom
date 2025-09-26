"use client";

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LMSAccountStatus } from '../types/lmsTypes';
import { Button } from './ui/button';

interface LMSAccountCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountStatus: (status: LMSAccountStatus) => void;
}

const LMSAccountCheckModal: React.FC<LMSAccountCheckModalProps> = ({
  isOpen,
  onClose,
  onAccountStatus,
}) => {
  const { t } = useLanguage();

  console.log('[LMS Modal] Render called with isOpen:', isOpen);

  if (!isOpen) return null;

  console.log('[LMS Modal] Modal will render');

  const persistChoice = (value: 'yes' | 'no-success' | 'no-failed') => {
    // Save choice to backend for per-account consistency across devices
    console.log('[LMS Modal] Persisting choice to backend:', value);
    try {
      fetch('/api/custom-projects-backend/lms/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ choice: value })
      }).catch((error) => {
        console.error('[LMS Modal] Failed to persist choice to backend:', error);
      });
    } catch (error) {
      console.error('[LMS Modal] Error calling backend to persist choice:', error);
    }
  };

  const handleYes = () => {
    persistChoice('yes');
    onAccountStatus('has-account');
    onClose();
  };

  const handleNo = async () => {
    try {
      const resp = await fetch('/api/custom-projects-backend/lms/create-workspace-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({})
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        persistChoice('no-success');
        if (data?.redirectUrl) {
          try { window.open(data.redirectUrl, '_blank'); } catch {}
        }
        const email = data?.email || '';
        const toast = document.createElement('div');
        toast.textContent = t('interface.lmsAccountCreated', `SmartExpert account for the ${email} is created successfully! Password is sent to the email`);
        toast.className = 'fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 6000);
        onAccountStatus('setup-complete');
        onClose();
      } else {
        persistChoice('no-failed');
        // Error message and keep user in modal
        const toast = document.createElement('div');
        toast.textContent = t('interface.lmsAccountCreateError', 'Something is wrong, please try again in a moment');
        toast.className = 'fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 6000);
      }
    } catch (e) {
      persistChoice('no-failed');
      const toast = document.createElement('div');
      toast.textContent = t('interface.lmsAccountCreateError', 'Something is wrong, please try again in a moment');
      toast.className = 'fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
      document.body.appendChild(toast);
      setTimeout(() => { toast.remove(); }, 6000);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50" data-modal-portal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('interface.lmsAccountQuestion', 'Do you have an account on Smart Expert LMS?')}
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="download"
              onClick={handleYes}
              className="flex-1 px-4 py-2 rounded-full"
            >
              {t('interface.lmsAccountYes', 'Yes, I have an account')}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNo}
              className="flex-1 px-4 py-2 rounded-full"
            >
              {t('interface.lmsAccountNo', 'No, I need to create one')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSAccountCheckModal; 