// components/SlideAddButton.tsx
// Fixed-position slide adding button with template selection

import React, { useState, useRef, useEffect } from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getAllTemplates, getTemplate } from './templates/registry';

interface SlideAddButtonProps {
  /** Current slide count for numbering */
  currentSlideCount: number;
  /** Callback when a new slide is added */
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
  /** Whether the button should be visible */
  isVisible?: boolean;
  /** Positioning props - if not provided, uses default fixed positioning */
  position?: 'fixed' | 'absolute' | 'relative';
  left?: string | number;
  top?: string | number;
  transform?: string;
  /** Custom container styles */
  containerStyle?: React.CSSProperties;
}

export const SlideAddButton: React.FC<SlideAddButtonProps> = ({
  currentSlideCount,
  onAddSlide,
  isVisible = true,
  position = 'fixed',
  left = '20px',
  top = '50%',
  transform = 'translateY(-50%)',
  containerStyle = {}
}) => {
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get available templates
  const availableTemplates = getAllTemplates();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add new slide with template selection
  const handleAddSlide = (templateId: string) => {
    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: currentSlideCount + 1,
      templateId: templateId,
      props: {
        ...template.defaultProps,
        title: template.defaultProps.title || `Slide ${currentSlideCount + 1}`,
        content: template.defaultProps.content || 'Add your content here...'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    console.log('🔍 SlideAddButton: Creating new slide:', {
      templateId,
      template,
      newSlide
    });

    onAddSlide(newSlide);
    setShowTemplateDropdown(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      ref={dropdownRef}
      style={{
        position,
        left,
        top,
        transform,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...containerStyle
      }}
    >
      {/* Main Add Button */}
      <button
        onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.2s ease',
          marginBottom: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Add new slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Template Dropdown */}
      {showTemplateDropdown && (
        <div
          style={{
            position: 'absolute',
            left: '70px',
            top: '0',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            padding: '8px 0',
            minWidth: '280px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1001
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Choose Template
            </h3>
            <button
              onClick={() => setShowTemplateDropdown(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#6b7280'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Template List */}
          <div style={{ padding: '8px 0' }}>
            {availableTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleAddSlide(template.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '20px' }}>{template.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '2px'
                  }}>
                    {template.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.3'
                  }}>
                    {template.description}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9ca3af' }}>
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideAddButton; 