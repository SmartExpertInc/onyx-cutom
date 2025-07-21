import React from 'react';
import { TemplateBasedSlide, AnyTemplateProps } from '@/types/slideTemplates';
import { getTemplate } from './TemplateRegistry';

// Props for the template renderer
interface TemplateRendererProps {
  slide: TemplateBasedSlide;
  isEditable?: boolean;
  onSlideChange?: (updatedSlide: TemplateBasedSlide) => void;
  className?: string;
}

// Fallback component for unknown templates
const FallbackTemplate: React.FC<{ slideId: string; slideNumber: number; templateId: string }> = ({
  slideId,
  slideNumber,
  templateId,
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        background: '#FEF2F2',
        border: '2px dashed #F87171',
      }}
    >
      <div
        style={{
          fontSize: '2rem',
          color: '#DC2626',
          marginBottom: '1rem',
        }}
      >
        ⚠️
      </div>
      <h1
        style={{
          fontSize: '1.5rem',
          color: '#DC2626',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}
      >
        Unknown Template
      </h1>
      <p
        style={{
          color: '#7F1D1D',
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Template "{templateId}" was not found in the registry.
      </p>
      <div
        style={{
          fontSize: '0.9rem',
          color: '#7F1D1D',
          opacity: 0.7,
        }}
      >
        Slide {slideNumber} (ID: {slideId})
      </div>
    </div>
  );
};

// Main template renderer component
export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  slide,
  isEditable = false,
  onSlideChange,
  className,
}) => {
  const { slideId, slideNumber, templateId, props } = slide;

  // Get the template definition from the registry
  const template = getTemplate(templateId);

  // If template is not found, render fallback
  if (!template) {
    return (
      <div className={className}>
        <FallbackTemplate
          slideId={slideId}
          slideNumber={slideNumber}
          templateId={templateId}
        />
      </div>
    );
  }

  // Get the template component
  const TemplateComponent = template.component;

  // Enhanced props with editing capabilities
  const enhancedProps = isEditable
    ? {
        ...props,
        onPropsChange: (updatedProps: Partial<AnyTemplateProps>) => {
          if (onSlideChange) {
            const updatedSlide: TemplateBasedSlide = {
              ...slide,
              props: { ...props, ...updatedProps },
            };
            onSlideChange(updatedSlide);
          }
        },
      }
    : props;

  // Render the template component with error boundary
  try {
    return (
      <div className={className} data-slide-id={slideId} data-template-id={templateId}>
        <TemplateComponent {...enhancedProps} />
      </div>
    );
  } catch (error) {
    console.error(`Error rendering template "${templateId}":`, error);
    
    return (
      <div className={className}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            background: '#FEF2F2',
            border: '2px solid #F87171',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              color: '#DC2626',
              marginBottom: '1rem',
            }}
          >
            💥
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              color: '#DC2626',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}
          >
            Template Rendering Error
          </h1>
          <p
            style={{
              color: '#7F1D1D',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            An error occurred while rendering template "{templateId}".
          </p>
          <details
            style={{
              fontSize: '0.8rem',
              color: '#7F1D1D',
              maxWidth: '80%',
            }}
          >
            <summary>Error Details</summary>
            <pre style={{ marginTop: '0.5rem', overflow: 'auto' }}>
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
};

// Helper hook for template editing
export const useTemplateEditor = (
  slide: TemplateBasedSlide,
  onSlideChange?: (slide: TemplateBasedSlide) => void
) => {
  const updateProp = React.useCallback(
    (propPath: string, value: any) => {
      if (!onSlideChange) return;

      const updatedProps = { ...slide.props };
      const pathParts = propPath.split('.');
      
      // Simple prop path resolver for nested properties
      let current = updatedProps;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = value;

      const updatedSlide: TemplateBasedSlide = {
        ...slide,
        props: updatedProps,
      };

      onSlideChange(updatedSlide);
    },
    [slide, onSlideChange]
  );

  const getProp = React.useCallback(
    (propPath: string) => {
      const pathParts = propPath.split('.');
      let current = slide.props;
      
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      
      return current;
    },
    [slide.props]
  );

  return { updateProp, getProp };
};

export default TemplateRenderer; 