"use client";

import React, { FC, useEffect } from "react";
import { useFormikContext } from "formik";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Helper function to safely get error message
const getErrorMessage = (errors: any, name: string): string => {
  const error = errors[name];
  if (typeof error === 'string') {
    return error;
  }
  if (Array.isArray(error)) {
    return error.join(', ');
  }
  if (error && typeof error === 'object') {
    return Object.values(error).join(', ');
  }
  return '';
};

// Text Form Field Component (matches Onyx's TextFormField)
interface TextFormFieldProps {
  label: string;
  name: string;
  type?: "text" | "password" | "email";
  subtext?: string;
  optional?: boolean;
  isTextArea?: boolean;
  defaultHeight?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TextFormField: FC<TextFormFieldProps> = ({
  label,
  name,
  type = "text",
  subtext,
  optional = false,
  isTextArea = false,
  defaultHeight = "h-15",
  disabled = false,
  onChange
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const hasError = errors[name] && touched[name];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFieldValue(name, e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const InputComponent = isTextArea ? "textarea" : "input";

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {!optional && <span className="text-red-500 ml-1">*</span>}
      </label>
      <InputComponent
        type={type}
        name={name}
        value={values[name] || ""}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          hasError ? "border-red-500" : "border-gray-300"
        } ${isTextArea ? defaultHeight : ""} ${disabled ? "bg-gray-100" : ""}`}
        rows={isTextArea ? 4 : undefined}
      />
      {subtext && (
        <p className="text-sm text-gray-500 mt-1">{subtext}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors, name)}</p>
      )}
    </div>
  );
};

// Select Input Component (matches Onyx's SelectInput)
interface SelectOption {
  name: string;
  value: string;
  description?: string;
}

interface SelectInputProps {
  label: string;
  name: string;
  options: SelectOption[];
  optional?: boolean;
  description?: string;
}

export const SelectInput: FC<SelectInputProps> = ({
  label,
  name,
  options,
  optional = false,
  description
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const hasError = errors[name] && touched[name];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {!optional && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={name}
        value={values[name] || ""}
        onChange={(e) => setFieldValue(name, e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          hasError ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors, name)}</p>
      )}
    </div>
  );
};

// Number Input Component (matches Onyx's NumberInput)
interface NumberInputProps {
  label: string;
  name: string;
  optional?: boolean;
  description?: string;
  min?: number;
  max?: number;
}

export const NumberInput: FC<NumberInputProps> = ({
  label,
  name,
  optional = false,
  description,
  min,
  max
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const hasError = errors[name] && touched[name];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {!optional && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type="number"
        variant="shadow"
        name={name}
        value={values[name] || ""}
        onChange={(e) => setFieldValue(name, e.target.value)}
        min={min}
        max={max}
        className={`w-full px-3 py-2 ${
          hasError ? "border-red-500" : "border-gray-300"
        }`}
      />
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors, name)}</p>
      )}
    </div>
  );
};

// Boolean Form Field Component (matches Onyx's AdminBooleanFormField)
interface BooleanFormFieldProps {
  label: string;
  name: string;
  subtext?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BooleanFormField: FC<BooleanFormFieldProps> = ({
  label,
  name,
  subtext,
  disabled = false,
  onChange
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const hasError = errors[name] && touched[name];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, e.target.checked);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          name={name}
          checked={values[name] || false}
          onCheckedChange={(checked) => {
            setFieldValue(name, checked);
          }}
          disabled={disabled}
        />
        <label htmlFor={name} className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      </div>
      {subtext && (
        <p className="text-sm text-gray-500 mt-1 ml-6">{subtext}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 mt-1 ml-6">{getErrorMessage(errors, name)}</p>
      )}
    </div>
  );
};

// List Input Component (matches Onyx's ListInput)
interface ListInputProps {
  label: string;
  name: string;
  description?: string;
}

export const ListInput: FC<ListInputProps> = ({
  label,
  name,
  description
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const hasError = errors[name] && touched[name];
  const listValue = values[name] || "";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const items = text.split(',').map(item => item.trim()).filter(item => item);
    setFieldValue(name, items);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Textarea
        name={name}
        value={Array.isArray(listValue) ? listValue.join(', ') : listValue}
        onChange={handleChange}
        placeholder="Enter items separated by commas"
        className={`h-20 ${
          hasError ? "border-red-500" : ""
        }`}
        rows={3}
      />
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors, name)}</p>
      )}
    </div>
  );
};

// File Input Component (matches Onyx's FileInput)
interface FileInputProps {
  label: string;
  name: string;
  isZip?: boolean;
  optional?: boolean;
  description?: string;
}

export const FileInput: FC<FileInputProps> = ({
  label,
  name,
  isZip = false,
  optional = false,
  description
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const hasError = errors[name] && touched[name];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll store the file name. In a real implementation,
      // you'd want to handle file upload to the server
      setFieldValue(name, file.name);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {!optional && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="file"
        name={name}
        onChange={handleFileChange}
        accept={isZip ? ".zip" : undefined}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white hover:file:from-blue-700 hover:file:to-indigo-700 file:cursor-pointer file:min-h-[40px] ${
          hasError ? "border-red-500" : "border-gray-300"
        }`}
      />
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors, name)}</p>
      )}
    </div>
  );
};

// Tabs Component (matches Onyx's TabsField)
interface TabField {
  value: string;
  label: string;
  fields: any[];
}

interface TabsFieldProps {
  label: string;
  name: string;
  tabs: TabField[];
  description?: string;
}

export const TabsField: FC<TabsFieldProps> = ({
  label,
  name,
  tabs,
  description
}) => {
  const { values, setFieldValue } = useFormikContext<any>();
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.value || "");

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setFieldValue(name, newTab);
    
    // Clear values from other tabs but preserve defaults
    tabs.forEach((tab) => {
      if (tab.value !== newTab) {
        tab.fields.forEach((field) => {
          if (values[field.name] !== field.default) {
            setFieldValue(field.name, field.default);
          }
        });
      }
    });
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case "text":
        return (
          <TextFormField
            key={field.name}
            label={field.label}
            name={field.name}
            subtext={field.description}
            optional={field.optional}
            isTextArea={field.isTextArea}
          />
        );
      case "checkbox":
        return (
          <BooleanFormField
            key={field.name}
            label={field.label}
            name={field.name}
            subtext={field.description}
          />
        );
      case "select":
        return (
          <SelectInput
            key={field.name}
            label={field.label}
            name={field.name}
            options={field.options || []}
            description={field.description}
            optional={field.optional}
          />
        );
      case "number":
        return (
          <NumberInput
            key={field.name}
            label={field.label}
            name={field.name}
            description={field.description}
            optional={field.optional}
          />
        );
      case "list":
        return (
          <ListInput
            key={field.name}
            label={field.label}
            name={field.name}
            description={field.description}
          />
        );
      case "string_tab":
        return (
          <div key={field.name} className="text-center text-sm text-gray-600 py-4">
            {field.description}
          </div>
        );
      default:
        return <div key={field.name}>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 mb-3">{description}</p>
      )}
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.value
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className={activeTab === tab.value ? "block" : "hidden"}
        >
          {tab.fields.map((field) => renderField(field))}
        </div>
      ))}
    </div>
  );
};

// Advanced Options Toggle Component (matches Onyx's AdvancedOptionsToggle)
interface AdvancedOptionsToggleProps {
  showAdvancedOptions: boolean;
  setShowAdvancedOptions: (show: boolean) => void;
}

export const AdvancedOptionsToggle: FC<AdvancedOptionsToggleProps> = ({
  showAdvancedOptions,
  setShowAdvancedOptions
}) => {
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        <span className="mr-2">
          {showAdvancedOptions ? "▼" : "▶"}
        </span>
        {showAdvancedOptions 
          ? "Hide Advanced Options"
          : "Show Advanced Options"
        }
      </button>
    </div>
  );
}; 