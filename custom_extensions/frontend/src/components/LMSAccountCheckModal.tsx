"use client";

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LMSAccountStatus } from '../types/lmsTypes';

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

  if (!isOpen) return null;

  const persistChoice = (value: 'yes' | 'no-success' | 'no-failed') => {
    try {
      localStorage.setItem('lmsAccountChoice', value);
    } catch {}
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
        // Success toast
        const toast = document.createElement('div');
        toast.textContent = t('interface.lmsAccountCreated', 'SmartExpert account for your email is created successfully! Password is sent to the email');
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
            <button
              onClick={handleYes}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('interface.lmsAccountYes', 'Yes, I have an account')}
            </button>
            
            <button
              onClick={handleNo}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {t('interface.lmsAccountNo', 'No, I need to create one')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSAccountCheckModal; 