"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckSquare, Square, Presentation, Video, FileText, HelpCircle, TableOfContents } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Product } from '../types/lmsTypes';
import LMSExportButton from './LMSExportButton';
import LMSProductCard from './LMSProductCard';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface LMSProductSelectorProps {
  selectedProducts: Set<number>;
  onProductToggle: (productId: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

// Helper function to get product type display name (still needed for filter dropdown)
const getProductTypeDisplayName = (type: string | undefined): string => {
  if (!type) return "Unknown";
  
  switch (type) {
    case "Training Plan":
      return "Course Outline";
    case "Slide Deck":
      return "Presentation";
    case "Text Presentation":
      return "Onepager";
    default:
      return type;
  }
};

const LMSProductSelector: React.FC<LMSProductSelectorProps> = ({
  selectedProducts,
  onProductToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      console.log('🔍 LMS Export: Fetching products from:', `${CUSTOM_BACKEND_URL}/projects`);
      console.log('🔍 LMS Export: Request headers:', headers);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects`, {
        headers,
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        console.error('❌ LMS Export: Response not OK:', response.status, response.statusText);
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 LMS Export: Fetched products:', data);
      console.log('📦 LMS Export: Total products count:', data.length);
      
      // Log first product structure to understand the data format
      if (data.length > 0) {
        console.log('🔍 LMS Export: Sample product structure:', data[0]);
        console.log('🔍 LMS Export: Sample product keys:', Object.keys(data[0]));
      }
      
      // Log product types
      const productTypes = data.map((p: any) => ({
        id: p.id,
        name: p.microproduct_name || p.projectName || p.name || p.title,
        type: p.design_microproduct_type || p.designMicroproductType,
        created: p.created_at || p.createdAt,
        allFields: Object.keys(p)
      }));
      console.log('📋 LMS Export: Product types breakdown:', productTypes);
      
      // Check for different possible field names for product type
      const typeFields = data.map((p: any) => ({
        id: p.id,
        design_microproduct_type: p.design_microproduct_type,
        designMicroproductType: p.designMicroproductType,
        productType: p.productType,
        type: p.type,
        microproductType: p.microproductType
      }));
      console.log('🔍 LMS Export: Type field variations:', typeFields);
      
      // Log course outlines specifically using correct field names
      const courseOutlines = data.filter((p: any) => (p.design_microproduct_type || '').toLowerCase() === 'training plan');
      console.log('🎯 LMS Export: Found course outlines:', courseOutlines.length);
      console.log('🎯 LMS Export: Course outline details:', courseOutlines.map((p: any) => ({
        id: p.id,
        name: p.microproduct_name || p.projectName || p.name || p.title,
        type: p.design_microproduct_type || p.designMicroproductType
      })));

      setProducts(data);
    } catch (err) {
      console.error('❌ LMS Export: Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products to show only course outlines (Training Plan) and apply search/type filters
  // Use case-insensitive comparison like ProjectsTable does
  // Note: API returns design_microproduct_type, not designMicroproductType
  const courseOutlines = products.filter(product => {
    const productType = (product.design_microproduct_type || product.designMicroproductType || '').toLowerCase();
    const isTrainingPlan = productType === 'training plan';
    console.log(`🔍 LMS Export: Product ${product.id} type: "${product.design_microproduct_type || product.designMicroproductType}" -> "${productType}" -> isTrainingPlan: ${isTrainingPlan}`);
    return isTrainingPlan;
  });
  
  console.log('🔄 LMS Export: Filtering - Total products:', products.length);
  console.log('🔄 LMS Export: Filtering - Course outlines found:', courseOutlines.length);
  console.log('🔄 LMS Export: Filtering - Search term:', searchTerm);
  console.log('🔄 LMS Export: Filtering - Type filter:', typeFilter);
  
  const filteredProducts = courseOutlines.filter(product => {
    // Use same name priority as LMSProductCard: projectName as primary source
    const productName = product.projectName || product.title || product.microproduct_name || product.name || '';
    const matchesSearch = searchTerm === '' || productName.toLowerCase().includes(searchTerm.toLowerCase());
    const productType = product.design_microproduct_type || product.designMicroproductType || '';
    const matchesType = typeFilter === 'all' || productType.toLowerCase() === typeFilter.toLowerCase();
    
    console.log(`🔍 LMS Export: Product "${productName}" - Search match: ${matchesSearch}, Type match: ${matchesType}`);
    
    return matchesSearch && matchesType;
  });

  console.log('✅ LMS Export: Final filtered products:', filteredProducts.length);
  console.log('✅ LMS Export: Final filtered product details:', filteredProducts.map(p => ({
    id: p.id,
    name: p.name || p.title,
    type: p.designMicroproductType
  })));

  // Get unique product types for filter (only from course outlines)
  const productTypes = Array.from(new Set(courseOutlines.map(p => p.design_microproduct_type || p.designMicroproductType).filter(Boolean)));

  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.has(p.id));

  const handleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      // Deselect all filtered products
      filteredProducts.forEach(product => {
        if (selectedProducts.has(product.id)) {
          onProductToggle(product.id);
        }
      });
    } else {
      // Select all filtered products
      filteredProducts.forEach(product => {
        if (!selectedProducts.has(product.id)) {
          onProductToggle(product.id);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('interface.loading', 'Loading...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={fetchProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {t('actions.refresh', 'Refresh')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Search Controls with Export Button */}
        <div className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 z-10" />
            <Input
              variant="shadow"
              type="text"
              placeholder="Search course outlines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleSelectAllFiltered}
            className="flex items-center gap-3 px-4 py-2 rounded-full"
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              allFilteredSelected 
                ? 'bg-blue-600 border-blue-600' 
                : 'border-gray-400 bg-white'
            }`}>
              {allFilteredSelected && <CheckSquare size={10} className="text-white" />}
            </div>
            {allFilteredSelected ? 'Deselect All' : t('interface.selectAll', 'Select All')}
          </Button>

          <LMSExportButton selectedProducts={selectedProducts} />
        </div>

        {/* Subtitle on the left */}
        <div className="flex items-center -mt-2" style={{
          backgroundColor: 'white',
          borderColor: '#C5CAD1',
          background: `linear-gradient(to top right, white, white, #E8F0FE)`,
          borderWidth: '1px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <p className="text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            Choose which course outlines to export to Smart Expert LMS
          </p>
        </div>
      </div>

      {/* Course Outlines Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center">
            <TableOfContents size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-800 text-lg font-medium mb-2">
              {courseOutlines.length === 0
                ? t('interface.noCourseOutlines', 'No course outlines found')
                : searchTerm || typeFilter !== 'all'
                ? t('interface.noProductsFound', 'No course outlines match your criteria')
                : t('interface.noProductsAvailable', 'No course outlines available for export')}
            </p>
            {courseOutlines.length === 0 && (
              <p className="text-gray-600 text-sm">
                Create some course outlines first to export them to Smart Expert LMS.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <LMSProductCard
              key={product.id}
              product={product}
              isSelected={selectedProducts.has(product.id)}
              onToggleSelect={onProductToggle}
            />
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <strong>{selectedProducts.size}</strong> course outline{selectedProducts.size !== 1 ? 's' : ''} selected for export
            </p>
            <button
              onClick={onDeselectAll}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LMSProductSelector; 