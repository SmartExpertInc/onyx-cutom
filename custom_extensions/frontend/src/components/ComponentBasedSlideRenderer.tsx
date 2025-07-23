// custom_extensions/frontend/src/components/ComponentBasedSlideRenderer.tsx

import React from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { getTemplate } from './templates/registry';

interface ComponentBasedSlideRendererProps {
  slide: ComponentBasedSlide;
  isEditable?: boolean;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  onTemplateChange?: (slideId: string, newTemplateId: string) => void;
}

export const ComponentBasedSlideRenderer: React.FC<ComponentBasedSlideRendererProps> = ({
  slide,
  isEditable = false,
  onSlideUpdate,
  onTemplateChange
}) => {
  const template = getTemplate(slide.templateId);

  // Handle template prop updates
  const handlePropsUpdate = (newProps: any) => {
    if (onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        props: { ...slide.props, ...newProps },
        metadata: {
          ...slide.metadata,
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  };

  // Fallback for unknown templates
  if (!template) {
    return (
      <div style={{
        width: '100%',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        padding: '40px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 600, color: '#6c757d', marginBottom: '16px' }}>
          Template Not Found
        </div>
        <div style={{ fontSize: '16px', color: '#6c757d', textAlign: 'center' }}>
          Template ID: <code>{slide.templateId}</code>
        </div>
        <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '16px' }}>
          Slide ID: {slide.slideId}
        </div>
        {isEditable && onTemplateChange && (
          <button 
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => onTemplateChange(slide.slideId, 'content-slide')}
          >
            Switch to Default Template
          </button>
        )}
      </div>
    );
  }

  // Render the template component with props
  const TemplateComponent = template.component;
  const templateProps = {
    ...slide.props,
    slideId: slide.slideId,
    isEditable,
    onUpdate: handlePropsUpdate
  };

  return (
    <div className={`slide-${slide.slideId} template-${slide.templateId}`}>
      <TemplateComponent {...templateProps} />
    </div>
  );
};

// Utility component for rendering multiple slides
interface ComponentBasedSlideDeckRendererProps {
  slides: ComponentBasedSlide[];
  selectedSlideId?: string;
  isEditable?: boolean;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  onTemplateChange?: (slideId: string, newTemplateId: string) => void;
}

export const ComponentBasedSlideDeckRenderer: React.FC<ComponentBasedSlideDeckRendererProps> = ({
  slides,
  selectedSlideId,
  isEditable = false,
  onSlideUpdate,
  onTemplateChange
}) => {
  // Safety check for slides array
  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        No slides to display
      </div>
    );
  }

  return (
    <div className="component-based-slide-deck">
      {slides.map((slide) => (
        <div 
          key={slide.slideId}
          className={`slide-container ${selectedSlideId === slide.slideId ? 'active' : ''}`}
          style={{
            display: selectedSlideId ? (selectedSlideId === slide.slideId ? 'block' : 'none') : 'block',
            marginBottom: selectedSlideId ? 0 : '40px'
          }}
        >
          <ComponentBasedSlideRenderer
            slide={slide}
            isEditable={isEditable}
            onSlideUpdate={onSlideUpdate}
            onTemplateChange={onTemplateChange}
          />
        </div>
      ))}
    </div>
  );
};

export default ComponentBasedSlideRenderer; 