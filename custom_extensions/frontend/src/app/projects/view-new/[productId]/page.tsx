// custom_extensions/frontend/src/app/projects/view-new/[productId]/page.tsx
"use client";

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, FolderOpen, Sparkles } from 'lucide-react';

type ProductViewNewParams = {
  productId: string;
};

export default function ProductViewNewPage() {
  const params = useParams<ProductViewNewParams>();
  const productId = params?.productId;
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) window.history.back();
      else router.push('/projects');
    }
  }, [router]);

  return (
    <main 
      className="p-4 md:p-8 min-h-screen font-inter"
      style={{
        background: `linear-gradient(110.08deg, rgba(0, 187, 255, 0.2) 19.59%, rgba(0, 187, 255, 0.05) 80.4%), #FFFFFF`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-x-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-white rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{
                color: '#0F58F9',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em'
              }}
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 9L1 5L5 1" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <button
              onClick={() => { if (typeof window !== 'undefined') window.location.href = '/projects'; }}
              className="flex items-center gap-2 bg-white rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{
                color: '#0F58F9',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em'
              }}
            >
              <FolderOpen size={14} style={{ color: '#0F58F9' }} />
              Open Products
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Smart Edit button for Course Outline */}
            <button
              onClick={() => {}}
              className="flex items-center gap-2 rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none"
              style={{
                backgroundColor: '#8B5CF6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em'
              }}
              title="Smart edit with AI"
            >
              <Sparkles size={14} style={{ color: 'white' }} /> Smart Edit
            </button>

            {/* Download PDF button for Course Outline */}
            <button
              onClick={() => {}}
              className="flex items-center gap-2 bg-white rounded px-[15px] py-[5px] pr-[20px] transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none disabled:opacity-60"
              style={{
                backgroundColor: '#0F58F9',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '140%',
                letterSpacing: '0.05em'
              }}
              title="Download content as PDF"
            >
              <Download size={14} style={{ color: 'white' }} /> Download PDF
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-dashed p-8 text-gray-500 bg-white">
          <div className="text-sm text-gray-600 mb-2">Product ID: <span className="font-mono">{String(productId)}</span></div>
          This is the new projects view page for Course Outline products. Replace this placeholder with the intended UI.
        </div>
      </div>
    </main>
  );
}


