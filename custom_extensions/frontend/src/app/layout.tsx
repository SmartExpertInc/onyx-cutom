// custom_extensions/frontend/src/app/layout.tsx
import './globals.css'; // Your global styles and Tailwind imports
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&family=Martian+Mono:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
        <link
  href="https://fonts.googleapis.com/css2?family=Martel+Sans:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
        <link href="https://fonts.cdnfonts.com/css/mont" rel="stylesheet"></link>
        {/* Preload Mont fonts for better performance */}
        {/* <link rel="preload" href="/fonts/fonnts.com-Mont_Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/fonnts.com-Mont_Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" /> */}


        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
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
