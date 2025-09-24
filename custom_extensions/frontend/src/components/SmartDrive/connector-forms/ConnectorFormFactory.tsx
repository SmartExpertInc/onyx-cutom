"use client";

import React, { FC, useState } from "react";
import OnyxFormWrapper from "./OnyxFormWrapper";
import CredentialStep, { Credential } from "./CredentialStep";
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
  const [currentStep, setCurrentStep] = useState<'credential' | 'configuration'>('credential');
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);

  // Check if we have a configuration for this connector
  if (!onyxConnectorConfigs[connectorId]) {
    return (
      <div className="p-4 text-center text-gray-600">
        Connector configuration not found for: {connectorId}
      </div>
    );
  }

  const handleCredentialSelected = (credential: Credential | null) => {
    setSelectedCredential(credential);
  };

  const handleNextStep = () => {
    setCurrentStep('configuration');
  };

  const handleBackToCredential = () => {
    setCurrentStep('credential');
  };

  const handleSubmit = async (values: any, formikHelpers: any) => {
    try {
      // Add the connector_id and credential_id to the form data
      const formData = {
        ...values,
        connector_id: connectorId,
        credential_id: selectedCredential?.id,
      };

      await onSubmit(formData);
      formikHelpers.setSubmitting(false);
    } catch (error) {
      console.error("Form submission error:", error);
      formikHelpers.setSubmitting(false);
      formikHelpers.setStatus({ error: "Failed to create connector" });
    }
  };

  const handleCancel = () => {
    if (currentStep === 'configuration') {
      handleBackToCredential();
    } else {
      onCancel?.();
    }
  };

  // Get connector display name
  const getConnectorDisplayName = (id: string) => {
    const config = onyxConnectorConfigs[id];
    return config?.description?.replace('Configure ', '').replace(' connector', '') || id;
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${currentStep === 'credential' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'credential' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Select Credential</span>
        </div>
        <div className="flex-1 h-px bg-gray-300"></div>
        <div className={`flex items-center ${currentStep === 'configuration' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'configuration' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Configure Connector</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'credential' ? (
        <CredentialStep
          connectorId={connectorId}
          connectorName={getConnectorDisplayName(connectorId)}
          onCredentialSelected={handleCredentialSelected}
          onNextStep={handleNextStep}
          onCancel={onCancel || (() => {})}
        />
      ) : (
        <div className="space-y-6">
          {/* Selected Credential Info */}
          {selectedCredential && (
            <div className="rounded-md p-4"
            style={{
              backgroundColor: 'white',
              borderColor: '#e2e8f0',
              background: 'linear-gradient(to top right, white, white, #E8F0FE)',
              borderWidth: '1px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Selected Credential</h3>
                  <p className="text-sm text-blue-700">{selectedCredential.name}</p>
                </div>
                <button
                  onClick={handleBackToCredential}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Connector Configuration Form */}
          <OnyxFormWrapper
            connectorId={connectorId}
            currentCredential={selectedCredential}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialValues={initialValues}
          />
        </div>
      )}
    </div>
  );
};

export default ConnectorFormFactory; 