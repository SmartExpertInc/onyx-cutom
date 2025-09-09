"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckSquare, Square, Presentation, Video, FileText, HelpCircle, TableOfContents } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Product } from '../types/lmsTypes';
import LMSExportButton from './LMSExportButton';

interface LMSProductSelectorProps {
  selectedProducts: Set<number>;
  onProductToggle: (productId: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

// Helper function to get product type icon
const getProductTypeIcon = (type: string): React.ReactElement => {
  const iconSize = 20;
  const iconClass = "text-gray-600";

  switch (type) {
    case "Training Plan":
      return <TableOfContents size={iconSize} className={iconClass} />;
    case "Quiz":
      return <HelpCircle size={iconSize} className={iconClass} />;
    case "Slide Deck":
      return <Presentation size={iconSize} className={iconClass} />;
    case "Video Lesson Presentation":
      return <Video size={iconSize} className={iconClass} />;
    case "Text Presentation":
      return <FileText size={iconSize} className={iconClass} />;
    default:
      return <FileText size={iconSize} className={iconClass} />;
  }
};

// Helper function to get product type display name
const getProductTypeDisplayName = (type: string): string => {
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

// Helper function to get tier color
const getTierColor = (tier?: string): string => {
  switch (tier) {
    case 'basic':
      return '#22c55e'; // green-500
    case 'interactive':
      return '#f97316'; // orange-500
    case 'advanced':
      return '#a855f7'; // purple-500
    case 'immersive':
      return '#3b82f6'; // blue-500
    default:
      return '#f97316'; // orange-500 (interactive as default)
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

      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects`, {
        headers,
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search and type
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
    const matchesType = typeFilter === 'all' || product.designMicroproductType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Get unique product types for filter
  const productTypes = Array.from(new Set(products.map(p => p.designMicroproductType)));

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('interface.lmsSelectProducts', 'Select products to export')}
        </h2>
        
        <LMSExportButton selectedProducts={selectedProducts} />
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {productTypes.map(type => (
            <option key={type} value={type}>
              {getProductTypeDisplayName(type)}
            </option>
          ))}
        </select>

        <button
          onClick={handleSelectAllFiltered}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {allFilteredSelected ? <CheckSquare size={16} /> : <Square size={16} />}
          {allFilteredSelected ? 'Deselect All' : t('interface.selectAll', 'Select All')}
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' 
              ? 'No products found matching your criteria' 
              : 'No products available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedProducts.has(product.id)
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onProductToggle(product.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {selectedProducts.has(product.id) ? (
                    <CheckSquare size={20} className="text-blue-600" />
                  ) : (
                    <Square size={20} className="text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getProductTypeIcon(product.designMicroproductType)}
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {getProductTypeDisplayName(product.designMicroproductType)}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 truncate mb-2" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getTierColor(product.quality_tier) }}
                      />
                      <span className="text-xs text-gray-500 capitalize">
                        {product.quality_tier || 'interactive'}
                      </span>
                    </div>
                    
                    <span className="text-xs text-gray-400">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <strong>{selectedProducts.size}</strong> product{selectedProducts.size !== 1 ? 's' : ''} selected for export
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