"use client";

import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LMSAccountStatus } from '../types/lmsTypes';

interface LMSAccountSetupWaitingProps {
  onSetupComplete: (status: LMSAccountStatus) => void;
}

const LMSAccountSetupWaiting: React.FC<LMSAccountSetupWaitingProps> = ({
  onSetupComplete,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    // Open setup page in new tab
    const setupContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Smart Expert LMS Setup</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #2563eb; }
          .setup-form { background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .form-group { margin: 15px 0; text-align: left; }
          label { display: block; margin-bottom: 5px; font-weight: bold; }
          input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          button { background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Smart Expert LMS</h1>
          <p>Create your account to start exporting your content to the LMS platform.</p>
          
          <div class="setup-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Create a password">
            </div>
            <div class="form-group">
              <label for="company">Company Name</label>
              <input type="text" id="company" placeholder="Enter your company name">
            </div>
            <button onclick="alert('Account created successfully! You can now close this tab.')">
              Create Account
            </button>
          </div>
          
          <p><small>This is a demo setup page. In production, this would be the actual LMS registration process.</small></p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([setupContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    // Simulate setup completion after delay
    const timer = setTimeout(() => {
      onSetupComplete('setup-complete');
      URL.revokeObjectURL(url);
    }, 3000);

    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };
  }, [onSetupComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t('interface.lmsSetupWaiting', 'Setting up your account...')}
      </h2>
      <p className="text-gray-600 text-center max-w-md">
        A new tab has opened with the LMS setup page. Please complete your account creation there.
      </p>
    </div>
  );
};

export default LMSAccountSetupWaiting; 