"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

interface CustomConnectorFormProps {
  isOpen: boolean;
  onClose: () => void;
  connectorId: string;
  connectorName: string;
}

interface ConnectorConfig {
  name: string;
  type: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  default?: string | number | boolean;
}

// Connector configurations - you can expand this based on your needs
const connectorConfigs: Record<string, ConnectorConfig[]> = {
  google_drive: [
    {
      name: 'folder_paths',
      type: 'text_array',
      description: 'Specify 0 or more folder paths to index. Leave blank to index everything.',
      placeholder: '/folder/subfolder',
      required: false
    },
    {
      name: 'include_shared',
      type: 'boolean',
      description: 'Include shared files and folders',
      default: true
    }
  ],
  slack: [
    {
      name: 'workspace',
      type: 'text',
      description: 'Slack workspace name',
      placeholder: 'your-workspace',
      required: true
    },
    {
      name: 'channels',
      type: 'text_array',
      description: 'Specify channels to index (leave blank for all)',
      placeholder: '#general',
      required: false
    }
  ],
  notion: [
    {
      name: 'root_page_id',
      type: 'text',
      description: 'Root page ID to start indexing from',
      placeholder: 'abc123...',
      required: false
    }
  ],
  // Add more connector configs as needed
};

const CustomConnectorForm: React.FC<CustomConnectorFormProps> = ({
  isOpen,
  onClose,
  connectorId,
  connectorName
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    name: `Smart Drive ${connectorName}`,
    access_type: 'private',
    groups: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const config = connectorConfigs[connectorId] || [];

  useEffect(() => {
    if (isOpen) {
      // Initialize form data with defaults
      const initialData = { ...formData };
      config.forEach(field => {
        if (field.default !== undefined) {
          initialData[field.name] = field.default;
        }
      });
      setFormData(initialData);
      setErrors({});
      setSuccess(false);
    }
  }, [isOpen, connectorId]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Connector name is required';
    }

    config.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.name} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Submit to the Smart Drive connector creation API
      const response = await fetch('/api/custom-projects-backend/smartdrive/connectors/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          source: connectorId,
          connector_specific_config: formData,
          name: formData.name,
          access_type: 'private',
          groups: formData.groups
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.detail || 'Failed to create connector' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: ConnectorConfig) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
            )}
          </div>
        );

      case 'text_array':
        const arrayValue = formData[field.name] || [''];
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            {arrayValue.map((value: string, index: number) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newArray = [...arrayValue];
                    newArray[index] = e.target.value;
                    handleInputChange(field.name, newArray.filter(v => v.trim()));
                  }}
                  placeholder={field.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {index === arrayValue.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleInputChange(field.name, [...arrayValue, ''])}
                    className="ml-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.name} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData[field.name] || false}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mt-1 ml-6">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#F7F7F7]">
            <h2 className="text-xl font-semibold text-gray-900">
              Connect {connectorName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[500px]">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Connector Created Successfully!
                </h3>
                <p className="text-gray-600">
                  Your {connectorName} connector has been set up and will start syncing shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Connector Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Connector Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a name for this connector"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Dynamic Fields */}
                {config.map(renderField)}

                {/* Submit Error */}
                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> This connector will be private to your account and automatically configured for Smart Drive integration.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-[#F7F7F7]">
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Connector'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomConnectorForm; 