// custom_extensions/frontend/src/app/layout.tsx
import './globals.css'; // Your global styles and Tailwind imports
import '../styles/inter.css'; // Inter font styles - INTER for all UI
import '../styles/lora.css'; // Lora font styles - LORA for slides only
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { MontFontLoader } from '../components/MontFontLoader';
import { AvatarDisplayManager } from '../components/AvatarDisplayManager';
import MixpanelProvider from './MixpanelProvider';
import VerificationGate from '../components/VerificationGate';

export const metadata = {
  title: 'Content Builder AI',
  description: 'Create online course in just 30 minutes with the help of AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full font-sans">
      <head>
        {/* Public Sans and Sora fonts from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Sora:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Inter font for backward compatibility (overridden by Public Sans in globals.css) */}
        {/* Lora font for slides */}
      </head>
      <body className="h-full bg-app-gradient">
        <MontFontLoader />
        <LanguageProvider>
          <AvatarDisplayManager>
            <MixpanelProvider>
              <VerificationGate />
              {children}
            </MixpanelProvider>
          </AvatarDisplayManager>
        </LanguageProvider>
      </body>
    </html>
  );
}
