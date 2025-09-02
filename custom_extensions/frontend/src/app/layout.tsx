// custom_extensions/frontend/src/app/layout.tsx
import './globals.css'; // Your global styles and Tailwind imports
import '../styles/inter.css'; // Inter font styles - ONLY INTER
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { MontFontLoader } from '../components/MontFontLoader';

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
      </head>
      <body className="h-full bg-app-gradient">
        <MontFontLoader />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
