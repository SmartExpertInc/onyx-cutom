"use client";

import React, { FC, useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { onyxConnectorConfigs, ConnectorConfig } from "./OnyxConnectorConfigs";
import {
  TextFormField,
  SelectInput,
  NumberInput,
  BooleanFormField,
  ListInput,
  FileInput,
  TabsField,
  AdvancedOptionsToggle,
} from "./OnyxFormComponents";

export interface OnyxFormRendererProps {
  connectorId: string;
  currentCredential?: any;
}

const OnyxFormRenderer: FC<OnyxFormRendererProps> = ({
  connectorId,
  currentCredential,
}) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [connectorNameInitialized, setConnectorNameInitialized] = useState(false);

  const config = onyxConnectorConfigs[connectorId];
  if (!config) {
    return <div>Connector configuration not found for: {connectorId}</div>;
  }

  let initialConnectorName = "";
  if (config.initialConnectorName) {
    initialConnectorName =
      currentCredential?.credential_json?.[config.initialConnectorName] ?? "";
  }

  useEffect(() => {
    const field_value = values["name"];
    if (initialConnectorName && !connectorNameInitialized && !field_value) {
      setFieldValue("name", initialConnectorName);
      setConnectorNameInitialized(true);
    }
  }, [initialConnectorName, setFieldValue, values, connectorNameInitialized]);

  const renderField = (field: any) => {
    if (field.visibleCondition && !field.visibleCondition(values, currentCredential)) {
      return null;
    }
    const label = typeof field.label === 'function' ? field.label(currentCredential) : field.label;
    const description = typeof field.description === 'function' ? field.description(currentCredential) : field.description;
    switch (field.type) {
      case "text":
        return (
          <TextFormField
            key={field.name}
            label={label}
            name={field.name}
            subtext={description}
            optional={field.optional}
            isTextArea={field.isTextArea}
          />
        );
      case "select":
        return (
          <SelectInput
            key={field.name}
            label={label}
            name={field.name}
            options={field.options || []}
            description={description}
            optional={field.optional}
          />
        );
      case "number":
        return (
          <NumberInput
            key={field.name}
            label={label}
            name={field.name}
            description={description}
            optional={field.optional}
          />
        );
      case "checkbox":
        return (
          <BooleanFormField
            key={field.name}
            label={label}
            name={field.name}
            subtext={description}
          />
        );
      case "list":
        return (
          <ListInput
            key={field.name}
            label={label}
            name={field.name}
            description={description}
          />
        );
      case "file":
        return (
          <FileInput
            key={field.name}
            label={label}
            name={field.name}
            description={description}
            optional={field.optional}
          />
        );
      case "tab":
        return (
          <TabsField
            key={field.name}
            label={label}
            name={field.name}
            tabs={field.tabs || []}
            description={description}
          />
        );
      case "string_tab":
        return (
          <div key={field.name} className="text-center text-sm text-gray-600 py-4">
            {description}
          </div>
        );
      default:
        return <div key={field.name}>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      {config.description && (
        <div className="text-sm text-gray-600 mb-4">
          {config.description}
        </div>
      )}

      {/* Connector Name Field - Always present */}
      <TextFormField
        subtext="A descriptive name for the connector."
        type="text"
        label="Connector Name"
        name="name"
      />

      {/* Main Fields */}
      {config.values.map(
        (field) =>
          !field.hidden && renderField(field)
      )}

      {/* Advanced Options */}
      {config.advanced_values.length > 0 &&
        (!config.advancedValuesVisibleCondition ||
          config.advancedValuesVisibleCondition(values, currentCredential)) && (
          <>
            <AdvancedOptionsToggle
              showAdvancedOptions={showAdvancedOptions}
              setShowAdvancedOptions={setShowAdvancedOptions}
            />
            {showAdvancedOptions &&
              config.advanced_values.map(
                (field) =>
                  !field.hidden && renderField(field)
              )}
          </>
        )}
    </div>
  );
};

export default OnyxFormRenderer; 