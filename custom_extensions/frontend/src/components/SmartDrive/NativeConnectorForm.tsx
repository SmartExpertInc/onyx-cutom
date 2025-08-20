"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, AlertCircle, CheckCircle, Upload, Plus, Trash2 } from 'lucide-react';

// Import local connector configurations
import { getConnectorConfig, ConnectorConfig, ConnectorField } from '../../lib/connector-configs';

interface NativeConnectorFormProps {
  isOpen: boolean;
  onClose: () => void;
  connectorId: string;
  connectorName: string;
}

const NativeConnectorForm: React.FC<NativeConnectorFormProps> = ({
  isOpen,
  onClose,
  connectorId,
  connectorName
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentCredential, setCurrentCredential] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  // Get connector configuration
  const config = getConnectorConfig(connectorId);

  useEffect(() => {
    if (isOpen && config) {
      // Initialize form data
      const initialValues: Record<string, any> = {
        name: `Smart Drive ${connectorName}`,
        access_type: 'private',
        groups: []
      };

      // Initialize fields with defaults
      [...(config.values || []), ...(config.advanced_values || [])].forEach((field: ConnectorField) => {
        if (field.default !== undefined) {
          initialValues[field.name] = field.default;
        } else if (field.type === 'list') {
          initialValues[field.name] = [];
        } else if (field.type === 'select') {
          initialValues[field.name] = null;
        } else if (field.type === 'checkbox') {
          initialValues[field.name] = false;
        }
      });

      setFormData(initialValues);
      setErrors({});
      setSuccess(false);
      setShowAdvanced(false);
      
      // Initialize active tabs
      const tabDefaults: Record<string, string> = {};
      config.values?.forEach((field: ConnectorField) => {
        if (field.type === 'tab' && field.defaultTab) {
          tabDefaults[field.name] = field.defaultTab;
        }
      });
      setActiveTabs(tabDefaults);
    }
  }, [isOpen, connectorId, config, connectorName]);

  // Load existing credentials for this connector type
  useEffect(() => {
    if (isOpen && connectorId) {
      loadCredentials();
    }
  }, [isOpen, connectorId]);

  const loadCredentials = async () => {
    try {
      const response = await fetch(`/api/manage/admin/credential?source=${connectorId}`, {
        credentials: 'same-origin'
      });
      if (response.ok) {
        const credentials = await response.json();
        if (credentials.length > 0) {
          setCurrentCredential(credentials[0]);
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = async () => {
    if (!config) return false;

    const newErrors: Record<string, string> = {};

    // Validate required fields
    [...(config.values || []), ...(config.advanced_values || [])].forEach((field: ConnectorField) => {
      if (!field.required) return;
      
      const value = formData[field.name];
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Validate connector name
    if (!formData.name?.trim()) {
      newErrors.name = 'Connector name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) return;

    setIsSubmitting(true);
    
    try {
      // Transform data according to connector-specific transforms
      const transformedData = { ...formData };
      
      // Apply field-specific transforms
      [...(config?.values || []), ...(config?.advanced_values || [])].forEach((field: ConnectorField) => {
        if (field.transform && transformedData[field.name]) {
          transformedData[field.name] = field.transform(transformedData[field.name]);
        }
      });

      // Submit to Onyx's connector creation endpoint
      const response = await fetch('/api/manage/admin/connector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: transformedData.name,
          source: connectorId,
          input_type: 'load_state',
          connector_specific_config: transformedData,
          refresh_freq: config?.overrideDefaultFreq || 30 * 60, // 30 minutes default
          prune_freq: 30 * 24 * 60 * 60, // 30 days default
          indexing_start: null,
          access_type: 'private',
          groups: transformedData.groups || []
        })
      });

      if (response.ok) {
        const connector = await response.json();
        
        // Create connector-credential pair if we have a credential
        if (currentCredential) {
          await fetch('/api/manage/admin/connector-credential-pair', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              connector_id: connector.id,
              credential_id: currentCredential.id,
              access_type: 'private'
            })
          });
        }

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

  const renderField = (field: ConnectorField, isAdvanced: boolean = false) => {
    if (field.hidden) return null;
    
    // Check visibility condition
    if (field.visibleCondition && !field.visibleCondition(formData, currentCredential)) {
      return null;
    }

    const fieldName = field.name;
    const fieldValue = formData[fieldName];
    const fieldError = errors[fieldName];
    
    // Handle disabled state
    const isDisabled = typeof field.disabled === 'function' 
      ? field.disabled(formData, currentCredential)
      : field.disabled || false;

    switch (field.type) {
      case 'text':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            <input
              type="text"
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            <textarea
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            <select
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldName} className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={fieldValue || false}
                onChange={(e) => handleInputChange(fieldName, e.target.checked)}
                disabled={isDisabled}
                className="mr-3 mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                )}
              </div>
            </label>
            {fieldError && (
              <p className="text-red-500 text-xs mt-1 ml-7">{fieldError}</p>
            )}
          </div>
        );

      case 'list':
        const listValue = Array.isArray(fieldValue) ? fieldValue : [''];
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            {listValue.map((value: string, index: number) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newArray = [...listValue];
                    newArray[index] = e.target.value;
                    handleInputChange(fieldName, newArray.filter(v => v.trim()));
                  }}
                  placeholder={field.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {index === listValue.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleInputChange(fieldName, [...listValue, ''])}
                    className="ml-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                {listValue.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = listValue.filter((_, i) => i !== index);
                      handleInputChange(fieldName, newArray);
                    }}
                    className="ml-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            <input
              type="number"
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );

      case 'tab':
        const activeTab = activeTabs[fieldName] || field.tabs?.[0]?.value;
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              {field.tabs?.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTabs(prev => ({ ...prev, [fieldName]: tab.value }))}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.value
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {field.tabs?.map((tab) => (
              <div key={tab.value} className={activeTab === tab.value ? 'block' : 'hidden'}>
                {tab.fields.map((tabField) => {
                  if (tabField.type === 'string_tab') {
                    return (
                      <div key={tabField.name} className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{tabField.description}</p>
                      </div>
                    );
                  }
                  return renderField(tabField, isAdvanced);
                })}
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor={`file-${fieldName}`} className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">Upload files</span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <input
                  id={`file-${fieldName}`}
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleInputChange(fieldName, files);
                  }}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Support for ZIP files and individual documents</p>
            </div>
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !config) return null;

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connector Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a name for this connector"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                {config.description && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">{config.description}</p>
                  </div>
                )}

                {/* Main Fields */}
                {config.values?.map(field => renderField(field))}

                {/* Advanced Options */}
                {config.advanced_values && config.advanced_values.length > 0 && (
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                      Advanced Options
                    </button>
                    
                    {showAdvanced && (
                      <div className="mt-4 space-y-4">
                        {config.advanced_values.map(field => renderField(field, true))}
                      </div>
                    )}
                  </div>
                )}

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

export default NativeConnectorForm; 