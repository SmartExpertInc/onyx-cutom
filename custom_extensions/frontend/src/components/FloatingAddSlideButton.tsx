import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, X } from 'lucide-react';
import { getAllTemplates, getTemplate } from './templates/registry';
import { ComponentBasedSlide } from '@/types/slideTemplates';

interface FloatingAddSlideButtonProps {
  /** Callback when a new slide is added */
  onAddSlide: (newSlide: ComponentBasedSlide) => void;
  
  /** Whether the button should be disabled (e.g., during saving) */
  disabled?: boolean;
  
  /** Current slide count for numbering */
  currentSlideCount: number;
}

export const FloatingAddSlideButton: React.FC<FloatingAddSlideButtonProps> = ({
  onAddSlide,
  disabled = false,
  currentSlideCount
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all available templates
  const templates = getAllTemplates();

  const handleAddSlide = (templateId: string) => {
    const template = getTemplate(templateId);
    if (!template) return;

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: currentSlideCount + 1,
      templateId: templateId,
      props: {
        ...template.defaultProps,
        title: template.defaultProps.title || `Slide ${currentSlideCount + 1}`
      },
      metadata: {
        createdAt: new Date().toISOString(),
        templateName: template.name
      }
    };

    onAddSlide(newSlide);
    setIsDropdownOpen(false);
  };

  return (
    <div className="floating-add-slide-container" ref={dropdownRef}>
      {/* Main Floating Button */}
      <button
        className={`floating-add-button ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        title={disabled ? "Saving..." : "Add new slide"}
        aria-label="Add new slide"
      >
        {disabled ? (
          <div className="loading-spinner" />
        ) : (
          <Plus size={20} />
        )}
      </button>

      {/* Template Dropdown */}
      {isDropdownOpen && (
        <div className="template-dropdown">
          <div className="dropdown-header">
            <h3>Choose Template</h3>
            <button
              className="close-button"
              onClick={() => setIsDropdownOpen(false)}
              aria-label="Close dropdown"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="template-list">
            {templates.map((template) => (
              <button
                key={template.id}
                className="template-option"
                onClick={() => handleAddSlide(template.id)}
              >
                <span className="template-icon">{template.icon}</span>
                <div className="template-info">
                  <span className="template-name">{template.name}</span>
                  <span className="template-description">{template.description}</span>
                </div>
                <ChevronDown size={16} className="template-arrow" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingAddSlideButton; 