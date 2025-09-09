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

  const handleYes = () => {
    onAccountStatus('has-account');
    onClose();
  };

  const handleNo = () => {
    onAccountStatus('no-account');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-modal-portal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
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