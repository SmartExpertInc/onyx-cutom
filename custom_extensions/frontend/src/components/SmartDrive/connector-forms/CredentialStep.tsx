"use client";

import React, { FC, useState, useEffect } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "@/components/ui/input";

export interface Credential {
  id: number;
  name: string;
  source: string;
  credential_json: any;
  admin_public: boolean;
  curator_public: boolean;
  groups: string[] | null;
}

export interface CredentialStepProps {
  connectorId: string;
  connectorName: string;
  onCredentialSelected: (credential: Credential | null) => void;
  onNextStep: () => void;
  onCancel: () => void;
}

const CredentialStep: FC<CredentialStepProps> = ({
  connectorId,
  connectorName,
  onCredentialSelected,
  onNextStep,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available credentials for this connector
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/custom-projects-backend/credentials/${connectorId}`);
                  if (response.ok) {
            const data = await response.json();
            // Onyx returns credentials directly as an array, not wrapped in {credentials: [...]}
            setCredentials(Array.isArray(data) ? data : data.credentials || []);
        } else {
          setError("Failed to fetch credentials");
        }
      } catch (err) {
        setError("Failed to fetch credentials");
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [connectorId]);

  const handleCredentialSelect = (credential: Credential) => {
    setSelectedCredential(credential);
    onCredentialSelected(credential);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  const handleCredentialCreated = (newCredential: Credential) => {
    setCredentials(prev => [...prev, newCredential]);
    setSelectedCredential(newCredential);
    onCredentialSelected(newCredential);
    setShowCreateForm(false);
  };

  const handleContinue = () => {
    if (selectedCredential) {
      onNextStep();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select a credential for {connectorName}
        </h2>
        <p className="text-gray-900 text-lg">
          Choose an existing credential or create a new one to connect to {connectorName}.
        </p>
      </div>

      {/* Credential Selection */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Available Credentials</h3>
          <Button
            variant="blueGradient"
            onClick={handleCreateNew}
            className="px-6 py-2.5"
          >
            Create New
          </Button>
        </div>

        {credentials.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-900 text-lg mb-4">No credentials found for {connectorName}</p>
            <Button
              variant="download"
              onClick={handleCreateNew}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Create your first credential
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {credentials.map((credential) => (
              <Card
                key={credential.id}
                className={`group relative overflow-hidden transition-all duration-200 cursor-pointer hover:scale-105 ${
                  selectedCredential?.id === credential.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                style={{
                  backgroundColor: 'white',
                  borderColor: selectedCredential?.id === credential.id ? '#3b82f6' : '#e2e8f0',
                  background: 'linear-gradient(to top right, white, white, #E8F0FE)',
                  borderWidth: '1px',
                  boxShadow: selectedCredential?.id === credential.id 
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                onMouseEnter={(e) => {
                  if (selectedCredential?.id !== credential.id) {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCredential?.id !== credential.id) {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }
                }}
                onClick={() => handleCredentialSelect(credential)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {credential.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Created for {credential.source}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCredentialSelect(credential);
                      }}
                      variant="download"
                      className="flex-1 rounded-full"
                    >
                      {selectedCredential?.id === credential.id ? 'Selected' : 'Select'}
                    </Button>
                  </div>

                  {/* Selection check mark */}
                  {selectedCredential?.id === credential.id && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Credential Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Create {connectorName} Credential
                  </h3>
                  <p className="text-gray-600 mt-1">Enter your credentials to connect to {connectorName}</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <CredentialCreationForm
                connectorId={connectorId}
                connectorName={connectorName}
                onCredentialCreated={handleCredentialCreated}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-8 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 py-3 text-sm duration-200 rounded-full"
        >
          Cancel
        </Button>
        <Button
          variant="download"
          onClick={handleContinue}
          disabled={!selectedCredential}
          className="px-8 py-3 rounded-full"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// Credential Creation Form Component
interface CredentialCreationFormProps {
  connectorId: string;
  connectorName: string;
  onCredentialCreated: (credential: Credential) => void;
  onCancel: () => void;
}

const CredentialCreationForm: FC<CredentialCreationFormProps> = ({
  connectorId,
  connectorName,
  onCredentialCreated,
  onCancel,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get credential fields based on connector type
  const getCredentialFields = () => {
    switch (connectorId) {
      case 'notion':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'notion_integration_token', label: 'Integration Token', type: 'password', required: true }
        ];
      case 'slack':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'slack_bot_token', label: 'Bot Token', type: 'password', required: true }
        ];
      case 'github':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'github_access_token', label: 'Access Token', type: 'password', required: true }
        ];
      case 'google_drive':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'google_credentials', label: 'Service Account JSON', type: 'file', required: true }
        ];
      case 'confluence':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'confluence_url', label: 'Confluence URL', type: 'text', required: true },
          { name: 'confluence_username', label: 'Username', type: 'text', required: true },
          { name: 'confluence_api_token', label: 'API Token', type: 'password', required: true }
        ];
      case 'jira':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'jira_url', label: 'Jira URL', type: 'text', required: true },
          { name: 'jira_username', label: 'Username', type: 'text', required: true },
          { name: 'jira_api_token', label: 'API Token', type: 'password', required: true }
        ];
      case 'zendesk':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'zendesk_subdomain', label: 'Subdomain', type: 'text', required: true },
          { name: 'zendesk_email', label: 'Email', type: 'email', required: true },
          { name: 'zendesk_token', label: 'API Token', type: 'password', required: true }
        ];
      case 'asana':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'asana_api_token_secret', label: 'API Token', type: 'password', required: true }
        ];
      case 'airtable':
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'airtable_api_key', label: 'API Key', type: 'password', required: true }
        ];
      default:
        return [
          { name: 'name', label: 'Credential Name', type: 'text', required: true },
          { name: 'api_key', label: 'API Key', type: 'password', required: true }
        ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
              const response = await fetch('/api/custom-projects-backend/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          source: connectorId,
          credential_json: formData,
          admin_public: true,
          curator_public: false,
          groups: [],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Onyx returns {credential: {...}} structure
        const credential = result.credential || result;
        onCredentialCreated(credential);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create credential');
      }
    } catch (err) {
      setError('Failed to create credential');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const fields = getCredentialFields();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'password' ? (
            <Input
              type="password"
              variant="shadow"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3 duration-200"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          ) : field.type === 'file' ? (
            <div className="relative">
              <Input
                type="file"
                name={field.name}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // For now, we'll store the file name
                    // In a real implementation, you'd want to handle file upload
                    handleInputChange(field.name, file.name);
                  }
                }}
                required={field.required}
                className="w-full px-4 py-3 duration-200 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white hover:file:from-blue-700 hover:file:to-indigo-700 file:cursor-pointer file:min-h-[40px] file:flex-shrink-0 file:whitespace-nowrap"
              />
            </div>
          ) : field.type === 'email' ? (
            <Input
              type="email"
              variant="shadow"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3 duration-200"
              placeholder="Enter email address"
            />
          ) : (
            <Input
              type="text"
              variant="shadow"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 py-3 rounded-full"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="download"
          disabled={loading}
          className="px-8 py-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            'Create Credential'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CredentialStep; 