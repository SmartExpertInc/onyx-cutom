"use client";

import React from 'react';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyMore: () => void;
}

export default function InsufficientCreditsModal({ 
  isOpen, 
  onClose, 
  onBuyMore 
}: InsufficientCreditsModalProps) {
  if (!isOpen) return null;
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{t('insufficientCredits.title', 'Insufficient Credits')}</h3>
        </div>
        
        {/* Message */}
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">
          {t(
            'insufficientCredits.message',
            'You cannot create new products right now due to insufficient credits for this operation. Please purchase more credits to continue.'
          )}
        </p>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2"
          >
            {t('common.close', 'Close')}
          </Button>
          <Button 
            onClick={onBuyMore} 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {t('insufficientCredits.buyMore', 'Buy More')}
          </Button>
        </div>
      </div>
    </div>
  );
}
