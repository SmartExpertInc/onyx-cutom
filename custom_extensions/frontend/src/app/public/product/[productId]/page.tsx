"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../../../contexts/LanguageContext';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

// Dynamic imports for product display components
const SmartSlideDeckViewer = React.lazy(() => import('@/components/SmartSlideDeckViewer').then(mod => ({ default: mod.SmartSlideDeckViewer })));
const QuizDisplay = React.lazy(() => import('@/components/QuizDisplay'));
const TextPresentationDisplay = React.lazy(() => import('@/components/TextPresentationDisplay'));
const VideoLessonDisplay = React.lazy(() => import('@/components/VideoLessonDisplay'));
const VideoProductDisplay = React.lazy(() => import('@/components/VideoProductDisplay'));
const PdfLessonDisplay = React.lazy(() => import('@/components/PdfLessonDisplay'));

interface ProductData {
  id: number;
  name: string;
  type: string;
  component_name: string;
  content: any;
  isPublicView: boolean;
}

function PublicProductViewerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const productId = params?.productId as string;
  const shareToken = searchParams?.get('share_token');

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        console.log(`🔍 [PUBLIC PRODUCT VIEWER] Fetching product ${productId} with token: ${shareToken}`);
        
        if (!productId || !shareToken) {
          setError('Product ID and share token are required');
          setLoading(false);
          return;
        }
        
        const apiUrl = `${CUSTOM_BACKEND_URL}/public/products/${productId}?share_token=${shareToken}`;
        
        console.log(`📡 [PUBLIC PRODUCT VIEWER] Making API request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        console.log(`📡 [PUBLIC PRODUCT VIEWER] API response status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found or not accessible via this share link');
          } else if (response.status === 400) {
            throw new Error('Invalid request - share token required');
          } else {
            throw new Error(`Failed to load product: ${response.status}`);
          }
        }
        
        const data = await response.json();
        console.log(`📥 [PUBLIC PRODUCT VIEWER] Product data received:`, data);
        
        setProductData(data);
        console.log(`✅ [PUBLIC PRODUCT VIEWER] Product loaded successfully`);
        
      } catch (err) {
        console.error(`❌ [PUBLIC PRODUCT VIEWER] Error loading product:`, err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (productId && shareToken) {
      fetchProductData();
    } else {
      setError('Missing required parameters');
      setLoading(false);
    }
  }, [productId, shareToken]);

  const renderProductContent = () => {
    if (!productData) return null;

    const { component_name, content, name, type } = productData;

    // Determine which component to render based on component_name
    // All slide deck types use SmartSlideDeckViewer in read-only mode
    switch (component_name) {
      case 'SlideDeckDisplay':
      case 'EditorPage':
        return <SmartSlideDeckViewer deck={content} isEditable={false} />;
      
      case 'QuizDisplay':
        return <QuizDisplay dataToDisplay={content} isEditing={false} parentProjectName={name} />;
      
      case 'TextPresentationDisplay':
        return <TextPresentationDisplay dataToDisplay={content} isEditing={false} parentProjectName={name} />;
      
      case 'VideoLessonDisplay':
        return <VideoLessonDisplay dataToDisplay={content} isEditing={false} parentProjectName={name} />;
      
      case 'VideoProductDisplay':
        return <VideoProductDisplay dataToDisplay={content} isEditing={false} parentProjectName={name} />;
      
      case 'PdfLessonDisplay':
        return <PdfLessonDisplay dataToDisplay={content} isEditing={false} parentProjectName={name} />;
      
      default:
        return (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Product type "{type}" (component: {component_name}) is not supported for public viewing yet.
            </p>
            <pre className="text-left text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-lg font-semibold mb-2">Unable to Load Product</h2>
            <p>{error}</p>
          </div>
          <p className="text-gray-600 text-sm">
            Please check the link or contact the person who shared it with you.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No product data available</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="p-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Course
          </button>
        </div>

        {/* Product Content */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        }>
          {renderProductContent()}
        </Suspense>
      </div>
    </main>
  );
}

export default function PublicProductViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PublicProductViewerContent />
    </Suspense>
  );
}

