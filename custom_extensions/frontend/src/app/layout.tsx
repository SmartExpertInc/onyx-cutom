// custom_extensions/frontend/src/app/layout.tsx
import './globals.css'; // Your global styles and Tailwind imports
import '../styles/inter.css'; // Inter font styles - ONLY INTER
import '../styles/lora.css'; // Lora font styles - LORA EVERYWHERE
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { MontFontLoader } from '../components/MontFontLoader';
import { AvatarDisplayManager } from '../components/AvatarDisplayManager';
import MixpanelProvider from './MixpanelProvider';

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
        {/* ONLY INTER FONT - No external fonts */}
        {/* Preload Inter font for better performance */}
        <link rel="preload" href="/fonts/Inter_18pt-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-app-gradient">
        <MontFontLoader />
        <LanguageProvider>
          <AvatarDisplayManager>
            <MixpanelProvider>
              {children}
            </MixpanelProvider>
          </AvatarDisplayManager>
        </LanguageProvider>
      </body>
    </html>
  );
}
