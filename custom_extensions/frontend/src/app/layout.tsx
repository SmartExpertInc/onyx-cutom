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
import { Public_Sans, Sora } from 'next/font/google';

const publicSans = Public_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-public-sans',
  display: 'swap',
});

const sora = Sora({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

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
    <html lang="en" className={`h-full font-sans ${publicSans.variable} ${sora.variable}`}>
      <head>
        {/* Inter font for UI, Lora font for slides */}
        {/* Preload Inter font for better performance */}
        <link rel="preload" href="/fonts/Inter_18pt-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
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
