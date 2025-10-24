"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TrainingPlanTable from '@/components/TrainingPlanTable';
import { TrainingPlanData } from '@/types/trainingPlan';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { createPortal } from 'react-dom';
import { XCircle, AlertTriangle } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface PublicCourseData {
  projectId: number;
  projectName: string;
  mainTitle: string;
  sections: any[];
  language: string;
  isPublicView: boolean;
  sharedAt: string;
  expiresAt: string;
}

export default function PublicCourseViewerPage() {
  const params = useParams();
  const { t } = useLanguage();
  const shareToken = params?.share_token as string;

  const [courseData, setCourseData] = useState<PublicCourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Product viewing state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        console.log(`🔍 [PUBLIC COURSE VIEWER] Fetching course data for token: ${shareToken}`);
        
        if (!shareToken) {
          setError('Share token is required');
          setLoading(false);
          return;
        }
        
        const apiUrl = `${CUSTOM_BACKEND_URL}/public/course-outlines/${shareToken}`;
        
        console.log(`📡 [PUBLIC COURSE VIEWER] Making API request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        console.log(`📡 [PUBLIC COURSE VIEWER] API response status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Shared course outline not found or link is invalid');
          } else if (response.status === 410) {
            throw new Error('This shared course outline link has expired');
          } else {
            throw new Error(`Failed to load shared course outline: ${response.status}`);
          }
        }
        
        const data = await response.json();
        console.log(`📥 [PUBLIC COURSE VIEWER] Data received:`, data);
        
        setCourseData(data);
        console.log(`✅ [PUBLIC COURSE VIEWER] Course data loaded successfully`);
        
      } catch (err) {
        console.error(`❌ [PUBLIC COURSE VIEWER] Error loading course:`, err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchCourseData();
    } else {
      setError('Share token not found');
      setLoading(false);
    }
  }, [shareToken]);

  const handleProductClick = async (product: any) => {
    if (!product.id) return;
    
    setProductLoading(true);
    setProductError(null);
    
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/public/products/${product.id}?share_token=${shareToken}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load product: ${response.status}`);
      }
      
      const productData = await response.json();
      setSelectedProduct(productData);
    } catch (err) {
      console.error('Error loading product:', err);
      setProductError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setProductLoading(false);
    }
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    setProductError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course outline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-lg font-semibold mb-2">Unable to Load Course</h2>
            <p>{error}</p>
          </div>
          <p className="text-gray-600 text-sm">
            Please check the link or contact the person who shared it with you.
          </p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No course data available</p>
        </div>
      </div>
    );
  }

  // Convert the public course data to TrainingPlanData format
  const trainingPlanData: TrainingPlanData = {
    mainTitle: courseData.mainTitle,
    sections: courseData.sections,
    detectedLanguage: courseData.language,
    theme: 'cherry', // Default theme for public view
    isPublicView: true
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseData.mainTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Shared course outline • Expires {new Date(courseData.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Powered by ContentBuilder.ai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <TrainingPlanTable
            dataToDisplay={trainingPlanData}
            onTextChange={undefined} // No editing in public view
            onAutoSave={undefined} // No auto-save in public view
            allUserMicroproducts={[]} // No user products in public view
            parentProjectName={courseData.projectName}
            sourceChatSessionId={null}
            theme="cherry"
            projectId={courseData.projectId}
            projectCustomRate={null}
            projectQualityTier={null}
            projectIsAdvanced={null}
            projectAdvancedRates={null}
            columnVisibility={{
              knowledgeCheck: true,
              contentAvailability: true,
              informationSource: true,
              estCreationTime: true,
              estCompletionTime: true,
              qualityTier: false,
              quiz: true,
              onePager: true,
              videoPresentation: true,
              lessonPresentation: true,
            }}
            onProductClick={handleProductClick} // Add product click handler
            isPublicView={true} // Enable public view mode
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>This course outline is shared publicly. To create your own course outlines, visit ContentBuilder.ai</p>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={handleCloseProduct}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {productLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading product...</span>
                </div>
              ) : productError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                  <p className="text-red-600 mb-4">{productError}</p>
                  <button
                    onClick={handleCloseProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {JSON.stringify(selectedProduct.content, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
