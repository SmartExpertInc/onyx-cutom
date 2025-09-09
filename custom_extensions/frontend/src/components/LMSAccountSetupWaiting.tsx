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
    // Create the LMS setup page using the actual HTML from the workspace owner response
    const lmsSetupContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="google" content="notranslate">
    <meta name="robots" content="noindex, nofollow"/>
    <meta name="csrf-token" content="5zb89YK8oksDpSUp3xwqifzzdvBG8NsMvpQsPgoT">
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,700" rel="stylesheet">
    <title>Smart Expert LMS - Workspace Setup</title>
    <link rel="stylesheet" href="https://dev.smartexpert.net/build/assets/20250902/main2.css" />
    
    <style>
        body { 
            font-family: 'Roboto', Arial, sans-serif; 
            margin: 0; 
            padding: 40px 20px; 
            background: #f5f5f5; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .setup-container { 
            max-width: 600px; 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
        }
        .logo {
            margin-bottom: 30px;
            color: #2563eb;
            font-size: 24px;
            font-weight: bold;
        }
        h1 { 
            color: #2563eb; 
            margin-bottom: 20px; 
            font-size: 28px;
        }
        .info-box { 
            background: #e0f2fe; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #2563eb; 
            text-align: left;
        }
        .form-group { 
            margin: 20px 0; 
            text-align: left;
        }
        label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 600; 
            color: #374151; 
        }
        input, select { 
            width: 100%; 
            padding: 12px 16px; 
            border: 2px solid #e5e7eb; 
            border-radius: 8px; 
            font-size: 16px;
            transition: border-color 0.2s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .btn { 
            background: #2563eb; 
            color: white; 
            padding: 14px 28px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px; 
            font-weight: 600;
            margin: 10px 5px;
            transition: all 0.2s;
        }
        .btn:hover { 
            background: #1d4ed8; 
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-secondary { 
            background: #6b7280; 
        }
        .btn-secondary:hover { 
            background: #4b5563; 
        }
        .success-message {
            background: #d1fae5;
            color: #065f46;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
            display: none;
        }
        .demo-note {
            margin-top: 30px;
            padding: 15px;
            background: #fef3c7;
            border-radius: 8px;
            color: #92400e;
            font-size: 14px;
            border-left: 4px solid #f59e0b;
        }
    </style>
</head>
<body>
    <div class="setup-container">
        <div class="logo">Smart Expert LMS</div>
        <h1>Welcome to Your Workspace</h1>
        
        <div class="info-box">
            <strong>🚀 Setup Your LMS Account</strong><br>
            Complete the form below to create your Smart Expert LMS workspace and start exporting your educational content.
        </div>
        
        <form id="setupForm">
            <div class="form-group">
                <label for="email">📧 Email Address *</label>
                <input type="email" id="email" name="email" required placeholder="Enter your email address" value="mykolavolyn3ts@gmail.com">
            </div>
            
            <div class="form-group">
                <label for="password">🔒 Password *</label>
                <input type="password" id="password" name="password" required placeholder="Create a secure password">
            </div>
            
            <div class="form-group">
                <label for="company">🏢 Workspace Name *</label>
                <input type="text" id="company" name="company" required placeholder="Enter your workspace name" value="Default Workspace">
            </div>
            
            <div class="form-group">
                <label for="role">👤 Your Role</label>
                <select id="role" name="role">
                    <option value="workspace_owner">Workspace Owner</option>
                    <option value="admin">Administrator</option>
                    <option value="teacher">Teacher/Instructor</option>
                    <option value="author">Content Author</option>
                    <option value="manager">Manager</option>
                </select>
            </div>
            
            <div style="margin-top: 30px;">
                <button type="submit" class="btn">🎯 Create LMS Workspace</button>
                <button type="button" class="btn btn-secondary" onclick="window.close()">❌ Cancel</button>
            </div>
        </form>
        
        <div id="successMessage" class="success-message">
            <strong>✅ Success!</strong> Your LMS workspace has been created successfully. You can now close this tab and return to the export page.
        </div>
        
        <div class="demo-note">
            <strong>ℹ️ Demo Mode:</strong> This is a demonstration of the Smart Expert LMS workspace setup. In production, this would connect to the actual LMS API and create a real workspace for content export.
        </div>
    </div>
    
    <script>
        // Simulate the Smart Expert LMS environment
        window.defaultLocale = 'en';
        window.usersCount = 1;
        window.currentUser = {
            "id": 12784,
            "email": "mykolavolyn3ts@gmail.com",
            "name": "Mykola Volynets",
            "full_name": "Mykola Volynets",
            "locale": "uk",
            "workspace": {
                "id": 37,
                "name": "Default",
                "owner_id": 12784,
                "status": false
            }
        };
        
        document.getElementById('setupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hide form and show success message
            document.getElementById('setupForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
            // Auto-close after 3 seconds
            setTimeout(function() {
                window.close();
            }, 3000);
        });
        
        // Auto-fill form with demo data
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('email').value = 'mykolavolyn3ts@gmail.com';
            document.getElementById('company').value = 'Default Workspace';
            document.getElementById('role').value = 'workspace_owner';
        });
    </script>
</body>
</html>`;

    // Create and open the setup page in a new tab
    const blob = new Blob([lmsSetupContent], { type: 'text/html' });
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
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px] bg-white rounded-lg border border-gray-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t('interface.lmsSetupWaiting', 'Setting up your account...')}
      </h2>
      <p className="text-gray-600 text-center max-w-md">
        A new tab has opened with the Smart Expert LMS setup page. Please complete your account creation there and return here to continue.
      </p>
      <div className="mt-4 text-sm text-gray-500">
        This page will automatically continue in a few seconds...
      </div>
    </div>
  );
};

export default LMSAccountSetupWaiting; 