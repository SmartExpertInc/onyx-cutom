"use client";

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ConnectorFormProps, ConnectorFormField, ConnectorFormConfig } from './ConnectorFormTypes';
import { useLanguage } from '../../../contexts/LanguageContext';

interface BaseConnectorFormProps extends ConnectorFormProps {
  config: ConnectorFormConfig;
}

const BaseConnectorForm: React.FC<BaseConnectorFormProps> = ({
  config,
  onSuccess,
  onCancel,
  initialData = {}
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build validation schema from config
  const buildValidationSchema = (fields: ConnectorFormField[]) => {
    const schema: any = {};
    
    fields.forEach(field => {
      let fieldSchema: any = Yup.string();
      
      if (field.required) {
        fieldSchema = fieldSchema.required(t('validation.required', 'This field is required'));
      }
      
      if (field.validation) {
        if (field.validation.min !== undefined) {
          fieldSchema = fieldSchema.min(field.validation.min, field.validation.message);
        }
        if (field.validation.max !== undefined) {
          fieldSchema = fieldSchema.max(field.validation.max, field.validation.message);
        }
        if (field.validation.pattern) {
          fieldSchema = fieldSchema.matches(new RegExp(field.validation.pattern), field.validation.message);
        }
      }
      
      if (field.type === 'number') {
        fieldSchema = Yup.number();
        if (field.required) {
          fieldSchema = fieldSchema.required(t('validation.required', 'This field is required'));
        }
      }
      
      if (field.type === 'boolean') {
        fieldSchema = Yup.boolean();
      }
      
      schema[field.name] = fieldSchema;
    });
    
    return Yup.object().shape(schema);
  };

  const validationSchema = config.validationSchema || buildValidationSchema(config.fields);

  // Build initial values
  const buildInitialValues = (fields: ConnectorFormField[]) => {
    const values: any = {};
    fields.forEach(field => {
      values[field.name] = initialData[field.name] || field.defaultValue || 
        (field.type === 'boolean' ? false : 
         field.type === 'multiselect' ? [] : '');
    });
    return values;
  };

  const initialValues = buildInitialValues(config.fields);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(config.submitEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...values,
          connector_id: config.connectorId,
          access_type: 'private',
          smart_drive: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to create connector');
      }

      const result = await response.json();
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the connector');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const renderField = (field: ConnectorFormField, values: any) => {
    // Check conditional visibility
    if (field.conditional) {
      const { field: conditionField, value, operator } = field.conditional;
      const fieldValue = values[conditionField];
      
      let shouldShow = false;
      switch (operator) {
        case 'equals':
          shouldShow = fieldValue === value;
          break;
        case 'not_equals':
          shouldShow = fieldValue !== value;
          break;
        case 'contains':
          shouldShow = fieldValue && fieldValue.includes(value);
          break;
        case 'exists':
          shouldShow = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
          break;
      }
      
      if (!shouldShow) return null;
    }

    const commonProps = {
      name: field.name,
      placeholder: field.placeholder,
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Field
            as="textarea"
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-vertical`}
          />
        );

      case 'select':
        return (
          <Field as="select" {...commonProps}>
            <option value="">{t('actions.selectOption', 'Select an option')}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <Field
                  type="checkbox"
                  name={field.name}
                  value={option.value}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <Field
            type="number"
            {...commonProps}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <Field
              type="checkbox"
              name={field.name}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );

      case 'password':
        return (
          <Field
            type="password"
            {...commonProps}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) {
                // Handle file upload logic here
                console.log('File selected:', file);
              }
            }}
            className={commonProps.className}
          />
        );

      default:
        return (
          <Field
            type="text"
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('actions.connectTo', 'Connect to {connector}').replace('{connector}', config.connectorName)}
        </h2>
        <p className="text-gray-600">
          {t('actions.configureConnector', 'Configure your {connector} connection').replace('{connector}', config.connectorName)}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isValid }) => (
          <Form className="space-y-6">
            {config.sections ? (
              // Render with sections
              config.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                  {section.description && (
                    <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                  )}
                  <div className="space-y-4">
                    {section.fields.map(fieldName => {
                      const field = config.fields.find(f => f.name === fieldName);
                      if (!field) return null;
                      
                      return (
                        <div key={field.name} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {renderField(field, values)}
                          <ErrorMessage
                            name={field.name}
                            component="p"
                            className="text-red-600 text-sm"
                          />
                          {field.description && (
                            <p className="text-gray-500 text-xs">{field.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              // Render without sections
              <div className="space-y-4">
                {config.fields.map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field, values)}
                    <ErrorMessage
                      name={field.name}
                      component="p"
                      className="text-red-600 text-sm"
                    />
                    {field.description && (
                      <p className="text-gray-500 text-xs">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('actions.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('actions.creating', 'Creating...')}
                  </span>
                ) : (
                  t('actions.createConnector', 'Create Connector')
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BaseConnectorForm; 