"use client";

import React, { FC } from "react";
import OnyxFormWrapper from "./OnyxFormWrapper";
import { onyxConnectorConfigs } from "./OnyxConnectorConfigs";

export interface ConnectorFormFactoryProps {
  connectorId: string;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  currentCredential?: any;
  initialValues?: any;
}

const ConnectorFormFactory: FC<ConnectorFormFactoryProps> = ({
  connectorId,
  onSubmit,
  onCancel,
  currentCredential,
  initialValues,
}) => {
  // Check if we have a configuration for this connector
  if (!onyxConnectorConfigs[connectorId]) {
    return (
      <div className="p-4 text-center text-gray-600">
        Connector configuration not found for: {connectorId}
      </div>
    );
  }

  const handleSubmit = async (values: any, formikHelpers: any) => {
    try {
      // Add the connector_id to the form data
      const formData = {
        ...values,
        connector_id: connectorId,
      };

      await onSubmit(formData);
      formikHelpers.setSubmitting(false);
    } catch (error) {
      console.error("Form submission error:", error);
      formikHelpers.setSubmitting(false);
      formikHelpers.setStatus({ error: "Failed to create connector" });
    }
  };

  return (
    <OnyxFormWrapper
      connectorId={connectorId}
      currentCredential={currentCredential}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      initialValues={initialValues}
    />
  );
};

export default ConnectorFormFactory; 