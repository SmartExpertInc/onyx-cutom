// custom_extensions/frontend/src/app/layout.tsx
import './globals.css'; // Your global styles and Tailwind imports
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';

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
      <body className="h-full bg-app-gradient">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
