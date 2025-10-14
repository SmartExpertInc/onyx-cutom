"use client";

import React, { FC, useState, useEffect } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "@/components/ui/input";
import { credentialTemplates, credentialDisplayNames } from "./OnyxCredentialTemplates";
import GoogleDriveCredentialForm from "./GoogleDriveCredentialForm";

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
  const [helpModalOpen, setHelpModalOpen] = useState(false);

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
    <div className="flex space-x-8">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
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
            <div className="flex items-center gap-3">
              <Button
                variant="blueGradient"
                onClick={handleCreateNew}
                className="px-6 py-2.5"
              >
                Create New
              </Button>
            </div>
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
              {credentials.map((credential: Credential) => (
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
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setHelpModalOpen(true)}
                    className="px-4 py-2.5 gap-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help
                  </Button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={t('interface.close', 'Close')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {connectorName} Connector Setup Guide
                </h3>
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="prose max-w-none">
                {(() => {
                  const Text = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
                    <p className={`mb-4 text-gray-700 ${className}`}>{children}</p>
                  );
                  
                  const Steps = ({ items }: { items: React.ReactNode[] }) => (
                    <ol className="list-decimal pl-6 space-y-2 mb-4">
                      {items.map((it, i) => (
                        <li key={i} className="text-gray-700">{it}</li>
                      ))}
                    </ol>
                  );
                  
                  const Bullets = ({ items }: { items: React.ReactNode[] }) => (
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      {items.map((it, i) => (
                        <li key={i} className="text-gray-700">{it}</li>
                      ))}
                    </ul>
                  );
                  
                  const ImportantNotes = ({ children }: { children: React.ReactNode }) => (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-amber-800 font-medium"><strong>Important Notes</strong></p>
                          <div className="mt-2 text-sm text-amber-700">
                            {children}
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                  switch (connectorId) {
                    case 'notion':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.notion.title', 'How it works?')}
                          </Text>
                          <Text>
                            The Notion connector uses the Notion search API to fetch all pages that the connector has access to within a workspace. For follow up indexing runs, the connector only retrieves pages that have been updated since the last indexing attempt.
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Notion workspace, follow these steps:
                          </Text>
                          <Steps items={[
                            <><strong>Create a Notion Integration:</strong><br />
                              • Visit the <a href="https://www.notion.com/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Notion integrations page</a><br />
                              • Click the <strong>"+ New integration"</strong> button<br />
                              • Name the integration (e.g., "ContentBuilder")<br />
                              • Select <strong>"Read content"</strong> as the capability<br />
                              • Click <strong>"Submit"</strong> to create the integration</>,
                            <><strong>Obtain the Integration Token:</strong><br />
                              • After creating the integration, copy the provided integration token (API key)<br />
                              • This token will be used to authenticate with Notion's API</>,
                            <><strong>Share Pages/Databases with the Integration:</strong><br />
                              • Navigate to each page or database you want to index in your Notion workspace<br />
                              • Click the <strong>"•••"</strong> menu in the top-right corner<br />
                              • Select <strong>"Add connections"</strong><br />
                              • Search for and select your newly created integration<br />
                              • Child pages and database rows are included automatically</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter the integration token obtained earlier<br />
                              • Click <strong>"Create Credential"</strong> to save the connection<br />
                              • Contentbuilder will start indexing your authorized Notion content</>,
                          ]} />
                          <ImportantNotes>
                            <p>Indexing runs periodically. To limit content, remove the integration from specific pages or databases in Notion.</p>
                            <p>Make sure to grant the integration access to all pages and databases you want to index before creating the credential.</p>
                            <p>The integration only has read access and cannot modify your Notion content.</p>
                          </ImportantNotes>
                        </div>
                      );

                    case 'google_drive':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.google_drive.title', 'Setting up the Google Drive Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Google Drive, you need to create a Google Cloud service account and configure it properly:
                          </Text>
                          <Steps items={[
                            <><strong>Create a Google Cloud Project:</strong><br />
                              • Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google Cloud Console</a><br />
                              • Create a new project or select an existing one<br />
                              • Enable the Google Drive API for your project</>,
                            <><strong>Create a Service Account:</strong><br />
                              • Navigate to <strong>IAM & Admin → Service Accounts</strong><br />
                              • Click <strong>"Create Service Account"</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder")<br />
                              • Add a description and click <strong>"Create and Continue"</strong></>,
                            <><strong>Generate Service Account Key:</strong><br />
                              • In the service account list, click on your newly created service account<br />
                              • Go to the <strong>"Keys"</strong> tab<br />
                              • Click <strong>"Add Key" → "Create new key"</strong><br />
                              • Select <strong>"JSON"</strong> format and click <strong>"Create"</strong><br />
                              • Download the JSON key file to your computer</>,
                            <><strong>Configure Domain-Wide Delegation (Optional):</strong><br />
                              • For organization-wide access, enable domain-wide delegation<br />
                              • Note the service account's client ID for later use<br />
                              • In Google Admin Console, add the client ID to the domain-wide delegation list</>,
                            <><strong>Share Google Drive Files:</strong><br />
                              • Share the specific Google Drive folders/files you want to index with the service account email<br />
                              • The service account email can be found in the downloaded JSON file (client_email field)<br />
                              • Grant <strong>"Viewer"</strong> permissions to the service account</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • Upload the downloaded JSON key file in the credential form<br />
                              • Enter the primary admin email address (for domain-wide delegation)<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>The service account must have access to all Google Drive files you want to index. Share folders/files with the service account email address.</p>
                            <p>For organization-wide access, domain-wide delegation must be configured in Google Admin Console.</p>
                            <p>The service account only has read access and cannot modify your Google Drive content.</p>
                            <p>Make sure the Google Drive API is enabled in your Google Cloud project.</p>
                          </ImportantNotes>
                        </div>
                      );
                    case 'slack':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.slack.title', 'Setting up the Slack Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Slack workspace, you need to create a Slack app and configure it with the necessary permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Create a Slack App:</strong><br />
                              • Go to the <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Slack API Apps Dashboard</a><br />
                              • Click <strong>"Create New App"</strong><br />
                              • Choose <strong>"From scratch"</strong><br />
                              • Enter an app name (e.g., "ContentBuilder") and select your workspace<br />
                              • Click <strong>"Create App"</strong></>,
                            <><strong>Configure Bot Token Scopes:</strong><br />
                              • In your app settings, go to <strong>"OAuth & Permissions"</strong><br />
                              • Scroll down to <strong>"Scopes"</strong> section<br />
                              • Add the following Bot Token Scopes:<br />
                              • <code>channels:read</code> - View basic information about public channels<br />
                              • <code>channels:history</code> - View messages in public channels<br />
                              • <code>groups:read</code> - View basic information about private channels<br />
                              • <code>groups:history</code> - View messages in private channels<br />
                              • <code>im:read</code> - View basic information about direct messages<br />
                              • <code>im:history</code> - View messages in direct messages<br />
                              • <code>mpim:read</code> - View basic information about group direct messages<br />
                              • <code>mpim:history</code> - View messages in group direct messages<br />
                              • <code>users:read</code> - View people in the workspace</>,
                            <><strong>Install the App to Your Workspace:</strong><br />
                              • Scroll up to <strong>"OAuth Tokens for Your Workspace"</strong><br />
                              • Click <strong>"Install to Workspace"</strong><br />
                              • Review the permissions and click <strong>"Allow"</strong><br />
                              • Copy the <strong>"Bot User OAuth Token"</strong> (starts with xoxb-)</>,
                            <><strong>Invite Bot to Channels:</strong><br />
                              • In Slack, go to each channel you want to index<br />
                              • Type <code>/invite @YourBotName</code> to add the bot to the channel<br />
                              • For private channels, ask a channel administrator to invite the bot<br />
                              • The bot needs to be in channels to access their message history</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the Bot User OAuth Token<br />
                              • Click <strong>"Create Credential"</strong> to save the connection<br />
                              • Contentbuilder will start indexing messages from channels the bot has access to</>,
                          ]} />
                          <ImportantNotes>
                            <p>The bot must be invited to all channels you want to index. It cannot access channels it's not a member of.</p>
                            <p>For private channels, a channel administrator must manually invite the bot.</p>
                            <p>The bot only has read access and cannot send messages or modify your Slack content.</p>
                            <p>Make sure all required scopes are added before installing the app to your workspace.</p>
                          </ImportantNotes>
                        </div>
                      );
                    case 'github':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.github.title', 'Setting up the GitHub Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your GitHub repositories, you need to create a Personal Access Token with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access GitHub Token Settings:</strong><br />
                              • Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">GitHub Personal Access Tokens</a><br />
                              • Click <strong>"Generate new token"</strong><br />
                              • Select <strong>"Generate new token (classic)"</strong></>,
                            <><strong>Configure Token Permissions:</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder")<br />
                              • Set expiration date (recommended: 90 days or custom)<br />
                              • Select the following scopes based on your needs:<br />
                              • <code>repo</code> - Full access to private repositories (for private repos)<br />
                              • <code>public_repo</code> - Access to public repositories only<br />
                              • <code>read:org</code> - Read org and team membership (if indexing organization repos)<br />
                              • <code>read:user</code> - Read user profile data</>,
                            <><strong>Generate and Copy Token:</strong><br />
                              • Scroll down and click <strong>"Generate token"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again<br />
                              • Store the token securely (it acts as your password)</>,
                            <><strong>Configure Repository Access:</strong><br />
                              • Ensure the repositories you want to index are accessible to your account<br />
                              • For organization repositories, make sure you have read access<br />
                              • Private repositories require the <code>repo</code> scope</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the Personal Access Token<br />
                              • Click <strong>"Create Credential"</strong> to save the connection<br />
                              • Contentbuilder will start indexing your accessible GitHub repositories</>,
                          ]} />
                          <ImportantNotes>
                            <p>Personal Access Tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>For private repositories, you must select the <code>repo</code> scope. Public repositories only need <code>public_repo</code>.</p>
                            <p>Tokens have expiration dates. Set up a reminder to renew them before they expire.</p>
                            <p>If you lose a token, you'll need to generate a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                        </div>
                      );
                    case 'gitlab':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.gitlab.title', 'Setting up the GitLab Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your GitLab repositories, you need to create a Personal Access Token with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access GitLab User Settings:</strong><br />
                              • Go to <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">GitLab Personal Access Tokens</a><br />
                              • Log in with your GitLab account credentials<br />
                              • Navigate to <strong>User Settings → Access Tokens</strong></>,
                            <><strong>Create a Personal Access Token:</strong><br />
                              • Click <strong>"Add new token"</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder")<br />
                              • Set an expiration date (recommended: 90 days or custom)<br />
                              • Select the following scopes:<br />
                              • <code>read_api</code> - Read access to the API<br />
                              • <code>read_repository</code> - Read access to repositories<br />
                              • <code>read_user</code> - Read access to user information</>,
                            <><strong>Generate and Copy Token:</strong><br />
                              • Click <strong>"Create personal access token"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again<br />
                              • Store the token securely (it acts as your password)</>,
                            <><strong>Configure Repository Access:</strong><br />
                              • Ensure the repositories you want to index are accessible to your account<br />
                              • For private repositories, make sure you have read access<br />
                              • For group repositories, ensure you're a member of the group</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the Personal Access Token<br />
                              • Enter your GitLab instance URL (e.g., https://gitlab.com or your self-hosted instance)<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Personal Access Tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>For self-hosted GitLab instances, make sure the instance URL is accessible from the Contentbuilder server.</p>
                            <p>Tokens have expiration dates. Set up a reminder to renew them before they expire.</p>
                            <p>If you lose a token, you'll need to generate a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.gitlab.link', 'Go to GitLab Personal Access Tokens →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'confluence':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.confluence.title', 'Setting up the Confluence Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Confluence instance, you need to create an Atlassian API token and configure the connection:
                          </Text>
                          <Steps items={[
                            <><strong>Access Atlassian Account Settings:</strong><br />
                              • Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Atlassian Account Settings</a><br />
                              • Log in with your Atlassian account credentials<br />
                              • Navigate to <strong>Security → API tokens</strong></>,
                            <><strong>Create an API Token:</strong><br />
                              • Click <strong>"Create API token"</strong><br />
                              • Enter a descriptive label (e.g., "ContentBuilder")<br />
                              • Click <strong>"Create"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again</>,
                            <><strong>Gather Your Confluence Details:</strong><br />
                              • Note your Confluence username (usually your email address)<br />
                              • Identify your Confluence base URL (e.g., https://yourcompany.atlassian.net)<br />
                              • Ensure you have access to the Confluence spaces you want to index</>,
                            <><strong>Configure Confluence Permissions:</strong><br />
                              • Make sure your user account has read access to the Confluence spaces you want to index<br />
                              • For private spaces, ensure you're a member or have appropriate permissions<br />
                              • The API token will inherit your user's permissions</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter your Confluence username<br />
                              • Paste the API token from Atlassian<br />
                              • Enter your Confluence base URL<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>API tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>Your Confluence username is usually your email address, not a display name.</p>
                            <p>Make sure you have read access to all Confluence spaces you want to index before creating the credential.</p>
                            <p>If you lose a token, you'll need to create a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                        </div>
                      );
                    case 'jira':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.jira.title', 'Setting up the Jira Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Jira instance, you need to create an Atlassian API token and configure the connection:
                          </Text>
                          <Steps items={[
                            <><strong>Access Atlassian Account Settings:</strong><br />
                              • Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Atlassian Account Settings</a><br />
                              • Log in with your Atlassian account credentials<br />
                              • Navigate to <strong>Security → API tokens</strong></>,
                            <><strong>Create an API Token:</strong><br />
                              • Click <strong>"Create API token"</strong><br />
                              • Enter a descriptive label (e.g., "ContentBuilder")<br />
                              • Click <strong>"Create"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again</>,
                            <><strong>Gather Your Jira Details:</strong><br />
                              • Note your Jira username (usually your email address)<br />
                              • Identify your Jira base URL (e.g., https://yourcompany.atlassian.net)<br />
                              • Ensure you have access to the Jira projects you want to index</>,
                            <><strong>Configure Jira Permissions:</strong><br />
                              • Make sure your user account has read access to the Jira projects you want to index<br />
                              • For private projects, ensure you're a member or have appropriate permissions<br />
                              • The API token will inherit your user's permissions</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter your Jira username<br />
                              • Paste the API token from Atlassian<br />
                              • Enter your Jira base URL<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>API tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>Your Jira username is usually your email address, not a display name.</p>
                            <p>Make sure you have read access to all Jira projects you want to index before creating the credential.</p>
                            <p>If you lose a token, you'll need to create a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.jira.link', 'Go to Atlassian API Tokens →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'zendesk':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.zendesk.title', 'Setting up the Zendesk Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Zendesk instance, you need to create an API token and configure the connection:
                          </Text>
                          <Steps items={[
                            <><strong>Access Zendesk Admin Center:</strong><br />
                              • Log in to your Zendesk account as an administrator<br />
                              • Go to <strong>Admin Center → Apps and integrations → APIs → Zendesk API</strong><br />
                              • Ensure you have admin permissions to create API tokens</>,
                            <><strong>Enable Token Access:</strong><br />
                              • In the Zendesk API settings, find <strong>"Token Access"</strong><br />
                              • Toggle <strong>"Enable token access"</strong> to ON<br />
                              • This allows API authentication using tokens instead of passwords</>,
                            <><strong>Create an API Token:</strong><br />
                              • Click <strong>"Add API token"</strong><br />
                              • Enter a descriptive label (e.g., "ContentBuilder")<br />
                              • Click <strong>"Create"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again</>,
                            <><strong>Gather Your Zendesk Details:</strong><br />
                              • Note your Zendesk subdomain (e.g., "yourcompany" from yourcompany.zendesk.com)<br />
                              • Identify your Zendesk email address (the one you use to log in)<br />
                              • Ensure you have access to the tickets and articles you want to index</>,
                            <><strong>Configure Zendesk Permissions:</strong><br />
                              • Make sure your user account has read access to the tickets and articles you want to index<br />
                              • For private content, ensure you have appropriate permissions<br />
                              • The API token will inherit your user's permissions</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter your Zendesk subdomain<br />
                              • Enter your Zendesk email address<br />
                              • Paste the API token from Zendesk<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>API tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>Your Zendesk subdomain is the part before ".zendesk.com" in your Zendesk URL.</p>
                            <p>Make sure you have read access to all Zendesk content you want to index before creating the credential.</p>
                            <p>If you lose a token, you'll need to create a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://support.zendesk.com/hc/en-us/articles/4408889192858" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.zendesk.link', 'Learn about Zendesk API Tokens →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'asana':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.asana.title', 'Setting up the Asana Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Asana workspace, you need to create a Personal Access Token with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Asana Developer Console:</strong><br />
                              • Go to <a href="https://app.asana.com/0/developer-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Asana Developer Console</a><br />
                              • Log in with your Asana account credentials<br />
                              • Navigate to <strong>My Profile Settings → Apps → Manage Developer Apps</strong></>,
                            <><strong>Create a Personal Access Token:</strong><br />
                              • Click <strong>"Create new token"</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder")<br />
                              • Select the following scopes based on your needs:<br />
                              • <code>default</code> - Basic read access to your workspace<br />
                              • <code>read:workspace</code> - Read access to workspace data<br />
                              • <code>read:projects</code> - Read access to projects and tasks</>,
                            <><strong>Generate and Copy Token:</strong><br />
                              • Click <strong>"Create token"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again<br />
                              • Store the token securely (it acts as your password)</>,
                            <><strong>Configure Workspace Access:</strong><br />
                              • Ensure the projects and tasks you want to index are accessible to your account<br />
                              • For private projects, make sure you're a member or have appropriate permissions<br />
                              • The token will inherit your user's permissions</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the Personal Access Token<br />
                              • Click <strong>"Create Credential"</strong> to save the connection<br />
                              • Contentbuilder will start indexing your accessible Asana content</>,
                          ]} />
                          <ImportantNotes>
                            <p>Personal Access Tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>Make sure the token has the necessary scopes to access the Asana content you want to index.</p>
                            <p>Tokens don't expire automatically, but you can revoke them at any time from the Developer Console.</p>
                            <p>If you lose a token, you'll need to create a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://app.asana.com/0/developer-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.asana.link', 'Go to Asana Developer Console →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'airtable':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.airtable.title', 'Setting up the Airtable Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Airtable bases, you need to create a Personal Access Token with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Airtable Developer Hub:</strong><br />
                              • Go to <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Airtable Personal Access Tokens</a><br />
                              • Log in with your Airtable account credentials<br />
                              • Navigate to <strong>Account → Developer Hub → Personal access tokens</strong></>,
                            <><strong>Create a Personal Access Token:</strong><br />
                              • Click <strong>"Create new token"</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder")<br />
                              • Set an expiration date (recommended: 90 days or custom)<br />
                              • Select the following scopes:<br />
                              • <code>data.records:read</code> - Read access to records<br />
                              • <code>data.records:write</code> - Write access to records (if needed)<br />
                              • <code>schema.bases:read</code> - Read access to base schemas</>,
                            <><strong>Configure Base Access:</strong><br />
                              • Select the specific bases you want to give access to<br />
                              • For workspace access, select <strong>"All current and future bases in all current and future workspaces"</strong><br />
                              • For specific bases, select individual bases from the list</>,
                            <><strong>Generate and Copy Token:</strong><br />
                              • Click <strong>"Create token"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again<br />
                              • Store the token securely (it acts as your password)</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the Personal Access Token<br />
                              • Click <strong>"Create Credential"</strong> to save the connection<br />
                              • Contentbuilder will start indexing your accessible Airtable bases</>,
                          ]} />
                          <ImportantNotes>
                            <p>Personal Access Tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>Make sure the token has access to all Airtable bases you want to index.</p>
                            <p>Tokens have expiration dates. Set up a reminder to renew them before they expire.</p>
                            <p>If you lose a token, you'll need to create a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.airtable.link', 'Go to Airtable Personal Access Tokens →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'dropbox':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.dropbox.title', 'Setting up the Dropbox Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Dropbox account, you need to create a Dropbox app and generate an access token:
                          </Text>
                          <Steps items={[
                            <><strong>Access Dropbox App Console:</strong><br />
                              • Go to <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Dropbox App Console</a><br />
                              • Log in with your Dropbox account credentials<br />
                              • Click <strong>"Create app"</strong> to start the app creation process</>,
                            <><strong>Configure App Settings:</strong><br />
                              • Choose <strong>"Scoped access"</strong> as the API type<br />
                              • Select <strong>"Full Dropbox"</strong> for the access level<br />
                              • Enter an app name (e.g., "ContentBuilder")<br />
                              • Click <strong>"Create app"</strong> to proceed</>,
                            <><strong>Configure App Permissions:</strong><br />
                              • In the app settings, go to <strong>"Permissions"</strong> tab<br />
                              • Enable the following permissions:<br />
                              • <code>files.metadata.read</code> - Read file metadata<br />
                              • <code>files.content.read</code> - Read file contents<br />
                              • <code>sharing.read</code> - Read sharing information</>,
                            <><strong>Generate Access Token:</strong><br />
                              • Go to the <strong>"Settings"</strong> tab in your app<br />
                              • Scroll down to <strong>"OAuth 2"</strong> section<br />
                              • Click <strong>"Generate access token"</strong><br />
                              • <strong>Important:</strong> Copy the token immediately - you won't be able to see it again</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the access token<br />
                              • Click <strong>"Create Credential"</strong> to save the connection<br />
                              • Contentbuilder will start indexing your Dropbox files</>,
                          ]} />
                          <ImportantNotes>
                            <p>Access tokens are like passwords - keep them secure and never share them publicly.</p>
                            <p>Make sure the app has the necessary permissions to access the Dropbox files you want to index.</p>
                            <p>Access tokens don't expire automatically, but you can revoke them at any time from the App Console.</p>
                            <p>If you lose a token, you'll need to generate a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.dropbox.link', 'Go to Dropbox App Console →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 's3':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.s3.title', 'Get AWS S3 Credentials')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.s3.step1', 'Go to AWS Console → IAM → Users (or Roles for IAM role method).')}</>,
                            <>{t('connectors.instructions.s3.step2', 'For Access Key method: Create a new user or use existing user.')}</>,
                            <>{t('connectors.instructions.s3.step3', 'Attach a policy with S3 read permissions (s3:GetObject, s3:ListBucket) for your target bucket.')}</>,
                            <>{t('connectors.instructions.s3.step4', 'For Access Key: Go to Security Credentials → Create Access Key.')}</>,
                            <>{t('connectors.instructions.s3.step5', 'For IAM Role: Copy the Role ARN from the role summary page.')}</>,
                            <>{t('connectors.instructions.s3.step6', 'Choose your authentication method and enter the credentials here.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://console.aws.amazon.com/iam/home#/users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.s3.link', 'Go to AWS IAM Users →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'r2':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.r2.title', 'Setting up the Cloudflare R2 Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Cloudflare R2 storage, you need to create an API token with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Cloudflare Dashboard:</strong><br />
                              • Go to <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Cloudflare Dashboard</a><br />
                              • Log in with your Cloudflare account credentials<br />
                              • Navigate to <strong>R2 Object Storage</strong> in the sidebar</>,
                            <><strong>Create R2 Bucket (if needed):</strong><br />
                              • Click <strong>"Create bucket"</strong> if you don't have one already<br />
                              • Enter a bucket name (e.g., "contentbuilder-storage")<br />
                              • Choose your preferred location<br />
                              • Click <strong>"Create bucket"</strong> to proceed</>,
                            <><strong>Generate API Token:</strong><br />
                              • In the R2 section, click <strong>"Manage R2 API Tokens"</strong> in the right sidebar<br />
                              • Click <strong>"Create API token"</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder")<br />
                              • Select <strong>"Object Read"</strong> permissions for your bucket</>,
                            <><strong>Copy Required Credentials:</strong><br />
                              • Copy your <strong>Account ID</strong> from the R2 overview page<br />
                              • Copy the <strong>Access Key ID</strong> from the token creation<br />
                              • Copy the <strong>Secret Access Key</strong> from the token creation<br />
                              • <strong>Important:</strong> Store these credentials securely - you won't be able to see the secret key again</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter your Account ID<br />
                              • Enter the Access Key ID<br />
                              • Enter the Secret Access Key<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>API credentials are like passwords - keep them secure and never share them publicly.</p>
                            <p>Make sure the API token has the necessary permissions to access the R2 bucket you want to index.</p>
                            <p>You can create multiple API tokens with different permissions for different use cases.</p>
                            <p>If you lose the secret key, you'll need to create a new API token - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.r2.link', 'Go to Cloudflare API Tokens →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'google_cloud_storage':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.gcs.title', 'Setting up the Google Cloud Storage Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Google Cloud Storage buckets, you need to create a service account with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Google Cloud Console:</strong><br />
                              • Go to <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google Cloud Console</a><br />
                              • Log in with your Google Cloud account credentials<br />
                              • Select your project or create a new one<br />
                              • Navigate to <strong>IAM & Admin → Service Accounts</strong></>,
                            <><strong>Create a Service Account:</strong><br />
                              • Click <strong>"Create Service Account"</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder")<br />
                              • Add a description (e.g., "Service account for ContentBuilder to access GCS")<br />
                              • Click <strong>"Create and Continue"</strong></>,
                            <><strong>Assign Storage Permissions:</strong><br />
                              • In the <strong>"Grant this service account access to project"</strong> section<br />
                              • Select the <strong>"Storage Object Viewer"</strong> role<br />
                              • This role provides read access to Cloud Storage objects<br />
                              • Click <strong>"Continue"</strong> and then <strong>"Done"</strong></>,
                            <><strong>Generate Service Account Key:</strong><br />
                              • In the service account list, click on your newly created service account<br />
                              • Go to the <strong>"Keys"</strong> tab<br />
                              • Click <strong>"Add Key" → "Create new key"</strong><br />
                              • Select <strong>"JSON"</strong> format and click <strong>"Create"</strong><br />
                              • Download the JSON key file to your computer</>,
                            <><strong>Extract Credentials from JSON:</strong><br />
                              • Open the downloaded JSON file in a text editor<br />
                              • Copy the <strong>"client_email"</strong> value (this will be your Access Key ID)<br />
                              • Copy the <strong>"private_key"</strong> value (this will be your Secret Access Key)<br />
                              • Keep the JSON file secure - it contains sensitive information</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter the client_email as Access Key ID<br />
                              • Enter the private_key as Secret Access Key<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Service account credentials are like passwords - keep them secure and never share them publicly.</p>
                            <p>Make sure the service account has the necessary permissions to access the GCS buckets you want to index.</p>
                            <p>You can create multiple service accounts with different permissions for different use cases.</p>
                            <p>If you lose the JSON key file, you'll need to generate a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.gcs.link', 'Go to Google Cloud Service Accounts →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'oci_storage':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.oci.title', 'Setting up the Oracle Cloud Infrastructure Storage Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Oracle Cloud Infrastructure (OCI) Object Storage, you need to create API credentials and configure the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Oracle Cloud Console:</strong><br />
                              • Go to the <a href="https://cloud.oracle.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Oracle Cloud Console</a><br />
                              • Log in with your Oracle Cloud account credentials<br />
                              • Select your tenancy from the region selector in the top-right corner</>,
                            <><strong>Create or Select a User:</strong><br />
                              • Navigate to <strong>Identity & Security → Users</strong><br />
                              • Either select an existing user or create a new one for API access<br />
                              • For new users, provide a name, email, and description<br />
                              • Ensure the user has appropriate permissions for Object Storage</>,
                            <><strong>Generate API Credentials:</strong><br />
                              • Click on your selected user to open user details<br />
                              • Scroll down to <strong>"API Keys"</strong> section<br />
                              • Click <strong>"Add API Key"</strong><br />
                              • Choose <strong>"Generate API Key Pair"</strong><br />
                              • Download the private key file (.pem) - you'll need this later<br />
                              • Copy the <strong>Fingerprint</strong> that's displayed</>,
                            <><strong>Create Customer Secret Key (Alternative Method):</strong><br />
                              • In the user details, scroll to <strong>"Customer Secret Keys"</strong><br />
                              • Click <strong>"Generate Secret Key"</strong><br />
                              • Enter a description (e.g., "ContentBuilder Access")<br />
                              • Click <strong>"Generate Secret Key"</strong><br />
                              • <strong>Important:</strong> Copy the secret key immediately - you won't be able to see it again</>,
                            <><strong>Gather Required Information:</strong><br />
                              • <strong>User OCID:</strong> Found in user details (starts with ocid1.user...)<br />
                              • <strong>Tenancy OCID:</strong> Found in tenancy details (starts with ocid1.tenancy...)<br />
                              • <strong>Region:</strong> Your OCI region (e.g., us-ashburn-1, us-phoenix-1)<br />
                              • <strong>Namespace:</strong> Go to Object Storage → Buckets, shown at the top<br />
                              • <strong>API Key/Secret:</strong> Either the .pem file content or customer secret key</>,
                            <><strong>Configure Object Storage Permissions:</strong><br />
                              • Go to <strong>Identity & Security → Policies</strong><br />
                              • Create a policy with the following statement:<br />
                              • <code>Allow user [username] to manage objects in tenancy</code><br />
                              • Or for specific buckets: <code>Allow user [username] to manage objects in compartment [compartment-name] where target.bucket.name='[bucket-name]'</code></>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter your User OCID<br />
                              • Enter your Tenancy OCID<br />
                              • Paste the region identifier (e.g., us-ashburn-1)<br />
                              • Enter the namespace from Object Storage<br />
                              • For API Key method: Upload the .pem file content<br />
                              • For Secret Key method: Enter the customer secret key<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Make sure the user has the necessary permissions to access the Object Storage buckets you want to index.</p>
                            <p>For production environments, consider using a dedicated service user with minimal required permissions.</p>
                            <p>If you lose the secret key, you'll need to generate a new one - the old one cannot be recovered.</p>
                            <p>Region identifiers are case-sensitive and must match exactly (e.g., us-ashburn-1, not us-Ashburn-1).</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://cloud.oracle.com/identity/users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.oci.link', 'Go to Oracle Cloud Users →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'sharepoint':
                    case 'teams':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.sharepoint.title', 'Setting up the Microsoft SharePoint/Teams Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Microsoft SharePoint and Teams, you need to create an Azure App Registration with the appropriate Microsoft Graph permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Azure Portal:</strong><br />
                              • Go to the <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Azure Portal</a><br />
                              • Log in with your Microsoft 365 admin account<br />
                              • Navigate to <strong>Azure Active Directory → App registrations</strong><br />
                              • Click <strong>"New registration"</strong></>,
                            <><strong>Register Your Application:</strong><br />
                              • Enter a name (e.g., "ContentBuilder Connector")<br />
                              • Select <strong>"Accounts in this organizational directory only"</strong><br />
                              • Leave Redirect URI empty for now<br />
                              • Click <strong>"Register"</strong> to create the app</>,
                            <><strong>Configure API Permissions:</strong><br />
                              • In your app, go to <strong>"API permissions"</strong><br />
                              • Click <strong>"Add a permission"</strong><br />
                              • Select <strong>"Microsoft Graph"</strong><br />
                              • Choose <strong>"Application permissions"</strong><br />
                              • Add the following permissions:<br />
                              • <code>Sites.Read.All</code> - Read items in all site collections<br />
                              • <code>Files.Read.All</code> - Read files in all site collections<br />
                              • <code>Group.Read.All</code> - Read all groups<br />
                              • <code>Channel.ReadBasic.All</code> - Read basic channel information<br />
                              • <code>ChannelMessage.Read.All</code> - Read channel messages<br />
                              • <code>Team.ReadBasic.All</code> - Read basic team information</>,
                            <><strong>Grant Admin Consent:</strong><br />
                              • Click <strong>"Grant admin consent for [Your Organization]"</strong><br />
                              • Confirm the consent to grant all permissions<br />
                              • This step requires admin privileges</>,
                            <><strong>Create Client Secret:</strong><br />
                              • Go to <strong>"Certificates & secrets"</strong><br />
                              • Click <strong>"New client secret"</strong><br />
                              • Enter a description (e.g., "ContentBuilder Secret")<br />
                              • Select expiration period (recommended: 24 months)<br />
                              • Click <strong>"Add"</strong><br />
                              • <strong>Important:</strong> Copy the secret value immediately - you won't be able to see it again</>,
                            <><strong>Gather Required Information:</strong><br />
                              • <strong>Application (client) ID:</strong> Found in the "Overview" section<br />
                              • <strong>Directory (tenant) ID:</strong> Found in the "Overview" section<br />
                              • <strong>Client Secret:</strong> The value you copied from the previous step<br />
                              • <strong>Tenant Domain:</strong> Your organization's domain (e.g., yourcompany.onmicrosoft.com)</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter the Application (client) ID<br />
                              • Enter the Directory (tenant) ID<br />
                              • Paste the client secret value<br />
                              • Enter your tenant domain<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Admin consent is required for application permissions. Contact your Microsoft 365 administrator if you don't have the necessary privileges.</p>
                            <p>Make sure the app has access to all SharePoint sites and Teams you want to index.</p>
                            <p>Client secrets have expiration dates. Set up a reminder to renew them before they expire.</p>
                            <p>If you lose a client secret, you'll need to create a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.sharepoint.link', 'Go to Azure App Registrations →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'gmail':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.gmail.title', 'Setting up the Gmail Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Gmail account, you need to create a Google Cloud service account with domain-wide delegation and configure it properly:
                          </Text>
                          <Steps items={[
                            <><strong>Access Google Cloud Console:</strong><br />
                              • Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google Cloud Console</a><br />
                              • Log in with your Google account credentials<br />
                              • Create a new project or select an existing one<br />
                              • Note your project ID for later use</>,
                            <><strong>Enable Gmail API:</strong><br />
                              • Navigate to <strong>APIs & Services → Library</strong><br />
                              • Search for "Gmail API"<br />
                              • Click on <strong>"Gmail API"</strong> from the results<br />
                              • Click <strong>"Enable"</strong> to activate the API for your project</>,
                            <><strong>Create a Service Account:</strong><br />
                              • Go to <strong>IAM & Admin → Service Accounts</strong><br />
                              • Click <strong>"Create Service Account"</strong><br />
                              • Enter a name (e.g., "contentbuilder-gmail")<br />
                              • Add a description (e.g., "Service account for ContentBuilder to access Gmail")<br />
                              • Click <strong>"Create and Continue"</strong><br />
                              • Skip the "Grant access" step for now<br />
                              • Click <strong>"Done"</strong></>,
                            <><strong>Generate Service Account Key:</strong><br />
                              • In the service account list, click on your newly created service account<br />
                              • Go to the <strong>"Keys"</strong> tab<br />
                              • Click <strong>"Add Key" → "Create new key"</strong><br />
                              • Select <strong>"JSON"</strong> format<br />
                              • Click <strong>"Create"</strong><br />
                              • Download the JSON key file to your computer</>,
                            <><strong>Configure Domain-Wide Delegation:</strong><br />
                              • In the service account details, go to the <strong>"Details"</strong> tab<br />
                              • Click <strong>"Enable Google Workspace Domain-wide Delegation"</strong><br />
                              • Add a product name (e.g., "ContentBuilder")<br />
                              • Click <strong>"Save"</strong><br />
                              • Copy the <strong>Client ID</strong> that's displayed</>,
                            <><strong>Configure Google Admin Console:</strong><br />
                              • Go to the <a href="https://admin.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google Admin Console</a><br />
                              • Navigate to <strong>Security → API Controls</strong><br />
                              • Click <strong>"Domain-wide Delegation"</strong><br />
                              • Click <strong>"Add new"</strong><br />
                              • Enter the Client ID from the previous step<br />
                              • Add the following OAuth scopes:<br />
                              • <code>https://www.googleapis.com/auth/gmail.readonly</code><br />
                              • <code>https://www.googleapis.com/auth/gmail.metadata</code><br />
                              • Click <strong>"Authorize"</strong></>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • Upload the downloaded JSON key file in the credential form<br />
                              • Enter the primary admin email address (for domain-wide delegation)<br />
                              • Specify the Gmail labels or folders you want to index (optional)<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Domain-wide delegation is required for accessing Gmail accounts. This must be configured in Google Admin Console.</p>
                            <p>Make sure you have admin privileges in Google Workspace to configure domain-wide delegation.</p>
                            <p>The service account will have access to all Gmail accounts in your domain based on the configured scopes.</p>
                            <p>For personal Gmail accounts, you may need to use OAuth2 flow instead of service account authentication.</p>
                            <p>Keep the JSON key file secure - it contains sensitive authentication information.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.gmail.link', 'Go to Google Cloud Service Accounts →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'teams':
                      return (
                        <div>
                          <Text><span className="font-semibold">{t('connectors.instructions.teams.title', 'Microsoft Teams Access')}</span></Text>
                          <Bullets items={[
                            <>{t('connectors.instructions.teams.step1', 'Register an app in Azure and grant Microsoft Graph read scopes for channels/messages as permitted by your organization.')}</>,
                            <>{t('connectors.instructions.teams.step2', 'Provide the app credentials accordingly.')}</>,
                          ]} />
                        </div>
                      );
                    case 'discord':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.discord.title', 'Setting up the Discord Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Discord server, you need to create a Discord bot and configure it with the necessary permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Discord Developer Portal:</strong><br />
                              • Go to the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Discord Developer Portal</a><br />
                              • Log in with your Discord account credentials<br />
                              • Click <strong>"New Application"</strong> to create a new app<br />
                              • Enter a name (e.g., "ContentBuilder Bot")<br />
                              • Click <strong>"Create"</strong></>,
                            <><strong>Create a Bot User:</strong><br />
                              • In your application, go to the <strong>"Bot"</strong> section in the sidebar<br />
                              • Click <strong>"Add Bot"</strong> to create a bot user<br />
                              • Confirm the creation by clicking <strong>"Yes, do it!"</strong><br />
                              • Customize the bot's username and avatar if desired</>,
                            <><strong>Configure Bot Permissions:</strong><br />
                              • In the <strong>"Bot"</strong> section, scroll down to <strong>"Privileged Gateway Intents"</strong><br />
                              • Enable the following intents:<br />
                              • <strong>"Message Content Intent"</strong> - Required to read message content<br />
                              • <strong>"Server Members Intent"</strong> - Required to access member information<br />
                              • <strong>"Presence Intent"</strong> - Optional, for user presence information</>,
                            <><strong>Generate Bot Token:</strong><br />
                              • In the <strong>"Bot"</strong> section, find the <strong>"Token"</strong> section<br />
                              • Click <strong>"Copy"</strong> to copy your bot token<br />
                              • <strong>Important:</strong> Keep this token secure - it acts as your bot's password<br />
                              • Never share this token publicly or commit it to version control</>,
                            <><strong>Configure Bot Permissions (Scopes):</strong><br />
                              • Go to the <strong>"OAuth2"</strong> section in the sidebar<br />
                              • Scroll down to <strong>"Scopes"</strong><br />
                              • Select the following scopes:<br />
                              • <code>bot</code> - Allows the bot to join servers<br />
                              • <code>messages.read</code> - Read messages in channels<br />
                              • <code>guilds</code> - Access server information</>,
                            <><strong>Set Bot Permissions:</strong><br />
                              • In the <strong>"OAuth2"</strong> section, scroll to <strong>"Bot Permissions"</strong><br />
                              • Select the following permissions:<br />
                              • <strong>"Read Messages"</strong> - Read messages in text channels<br />
                              • <strong>"Read Message History"</strong> - Read message history in channels<br />
                              • <strong>"View Channels"</strong> - See channels in the server<br />
                              • <strong>"Send Messages"</strong> - Optional, for bot responses</>,
                            <><strong>Invite Bot to Your Server:</strong><br />
                              • In the <strong>"OAuth2"</strong> section, scroll to <strong>"URL Generator"</strong><br />
                              • Select the scopes and permissions you configured<br />
                              • Copy the generated URL<br />
                              • Open the URL in a new tab and select your Discord server<br />
                              • Click <strong>"Authorize"</strong> to add the bot to your server</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the bot token<br />
                              • Enter your Discord server ID (right-click server name → Copy Server ID)<br />
                              • Specify the channels you want to index (optional)<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>The bot must be invited to all Discord servers you want to index. It cannot access servers it's not a member of.</p>
                            <p>Make sure the bot has the necessary permissions in each server and channel you want to index.</p>
                            <p>Message Content Intent is required to read message content. Without it, the bot can only see message metadata.</p>
                            <p>If you lose a bot token, you'll need to generate a new one - the old one cannot be recovered.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.discord.link', 'Go to Discord Developer Portal →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'zulip':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.zulip.title', 'Get Zulip Bot Credentials')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.zulip.step1', 'Log into your Zulip organization as an admin.')}</>,
                            <>{t('connectors.instructions.zulip.step2', 'Go to Settings → Your bots → Add a new bot.')}</>,
                            <>{t('connectors.instructions.zulip.step3', 'Create a new bot with "Generic bot" type and give it a name.')}</>,
                            <>{t('connectors.instructions.zulip.step4', 'Download the bot\'s zuliprc configuration file.')}</>,
                            <>{t('connectors.instructions.zulip.step5', 'Open the zuliprc file and copy its entire contents.')}</>,
                            <>{t('connectors.instructions.zulip.step6', 'Paste the complete zuliprc content here.')}</>,
                          ]} />
                          <Text className="mt-2 text-gray-600">{t('connectors.instructions.zulip.note', 'The zuliprc file contains your bot email, API key, and server URL all in one configuration.')}</Text>
                        </div>
                      );
                    case 'gitbook':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.gitbook.title', 'Get GitBook Access Token')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.gitbook.step1', 'Log into your GitBook account.')}</>,
                            <>{t('connectors.instructions.gitbook.step2', 'Go to Settings → Developer settings.')}</>,
                            <>{t('connectors.instructions.gitbook.step3', 'Create a new personal access token with read permissions for your spaces.')}</>,
                            <>{t('connectors.instructions.gitbook.step4', 'Copy the generated token.')}</>,
                            <>{t('connectors.instructions.gitbook.step5', 'Paste the token here to create the credential.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://developer.gitbook.com/gitbook-api/authentication" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.gitbook.link', 'Learn about GitBook API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'bookstack':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.bookstack.title', 'Get BookStack API Credentials')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.bookstack.step1', 'Log into your BookStack instance as an admin.')}</>,
                            <>{t('connectors.instructions.bookstack.step2', 'Go to Settings → Users → [Your User] → API Tokens.')}</>,
                            <>{t('connectors.instructions.bookstack.step3', 'Create a new API token with a descriptive name.')}</>,
                            <>{t('connectors.instructions.bookstack.step4', 'Copy the Token ID and Token Secret that are generated.')}</>,
                            <>{t('connectors.instructions.bookstack.step5', 'Note your BookStack base URL (e.g., https://wiki.yourcompany.com).')}</>,
                            <>{t('connectors.instructions.bookstack.step6', 'Enter the base URL, Token ID, and Token Secret in the form.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://www.bookstackapp.com/docs/admin/api-auth/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.bookstack.link', 'Learn about BookStack API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'google_sites':
                    case 'google_site':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.google_sites.title', 'Prepare Google Sites Content')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.google_sites.step1', 'Open your Google Site in a web browser.')}</>,
                            <>{t('connectors.instructions.google_sites.step2', 'Use browser tools or a web scraper to download the HTML content.')}</>,
                            <>{t('connectors.instructions.google_sites.step3', 'Create a ZIP file containing all the HTML files and assets.')}</>,
                            <>{t('connectors.instructions.google_sites.step4', 'Note your Google Site\'s public URL.')}</>,
                            <>{t('connectors.instructions.google_sites.step5', 'Upload the ZIP file and enter the base URL here.')}</>,
                          ]} />
                          <Text className="mt-2 text-gray-600">{t('connectors.instructions.google_sites.note', 'This connector requires pre-downloaded HTML content as Google Sites doesn\'t provide a direct API.')}</Text>
                        </div>
                      );
                    case 'productboard':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.productboard.title', 'Get Productboard Access Token')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.productboard.step1', 'Log into your Productboard account as an admin.')}</>,
                            <>{t('connectors.instructions.productboard.step2', 'Go to Settings → Integrations → API.')}</>,
                            <>{t('connectors.instructions.productboard.step3', 'Generate a new API token with read access to products and notes.')}</>,
                            <>{t('connectors.instructions.productboard.step4', 'Copy the generated token.')}</>,
                            <>{t('connectors.instructions.productboard.step5', 'Paste the token here to create the credential.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://developer.productboard.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.productboard.link', 'Learn about Productboard API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'highspot':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.highspot.title', 'Get Highspot API Credentials')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.highspot.step1', 'Log into your Highspot account as an admin.')}</>,
                            <>{t('connectors.instructions.highspot.step2', 'Go to Settings → Integrations → API.')}</>,
                            <>{t('connectors.instructions.highspot.step3', 'Create a new API application with read permissions.')}</>,
                            <>{t('connectors.instructions.highspot.step4', 'Generate API credentials (Key and Secret).')}</>,
                            <>{t('connectors.instructions.highspot.step5', 'Copy both the API Key and Secret.')}</>,
                            <>{t('connectors.instructions.highspot.step6', 'Enter both credentials here to create the credential.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://help.highspot.com/hc/en-us/articles/115005686926" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.highspot.link', 'Learn about Highspot API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'loopio':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.loopio.title', 'Get Loopio API Credentials')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.loopio.step1', 'Log into your Loopio account as an admin.')}</>,
                            <>{t('connectors.instructions.loopio.step2', 'Go to Settings → Integrations → API Access.')}</>,
                            <>{t('connectors.instructions.loopio.step3', 'Generate new API credentials (Client ID and Client Token).')}</>,
                            <>{t('connectors.instructions.loopio.step4', 'Find your Loopio subdomain (e.g., "yourcompany" from yourcompany.loopio.com).')}</>,
                            <>{t('connectors.instructions.loopio.step5', 'Enter the Loopio Subdomain, Client ID, and Client Token in the form.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://help.loopio.com/en/articles/4454029" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.loopio.link', 'Learn about Loopio API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'guru':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.guru.title', 'Get Guru API Credentials')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.guru.step1', 'Log into your Guru account as an admin.')}</>,
                            <>{t('connectors.instructions.guru.step2', 'Go to Settings → API Access.')}</>,
                            <>{t('connectors.instructions.guru.step3', 'Generate a new API token for your user account.')}</>,
                            <>{t('connectors.instructions.guru.step4', 'Copy your username/email and the API token.')}</>,
                            <>{t('connectors.instructions.guru.step5', 'Enter both the Guru User and Guru User Token in the form.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://help.getguru.com/docs/guru-api-overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.guru.link', 'Learn about Guru API →')}
                            </a>
                          </Text>
                          <ImportantNotes>
                            <p>The Guru connector pulls in all the Cards your user has access to based on a User Access Token.</p>
                          </ImportantNotes>
                        </div>
                      );
                    case 'slab':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.slab.title', 'Get Slab Bot Token')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.slab.step1', 'Log into your Slab team as an admin.')}</>,
                            <>{t('connectors.instructions.slab.step2', 'Go to Settings → Developer → API.')}</>,
                            <>{t('connectors.instructions.slab.step3', 'Create a new API token with read permissions.')}</>,
                            <>{t('connectors.instructions.slab.step4', 'Copy the generated bot token.')}</>,
                            <>{t('connectors.instructions.slab.step5', 'Enter the bot token in the "Slab Bot Token" field.')}</>,
                          ]} />
                          <Text className="mt-2 text-gray-600">{t('connectors.instructions.slab.note', 'Your base URL should look like: https://yourteam.slab.com/')}</Text>
                          <ImportantNotes>
                            <p>Slab is a wiki tool where the pages are called Posts. Onyx indexes the post titles and contents.</p>
                          </ImportantNotes>
                        </div>
                      );
                    case 'salesforce':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.salesforce.title', 'Setting up the Salesforce Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Salesforce org, you need to obtain your security token and configure the connection:
                          </Text>
                          <Steps items={[
                            <><strong>Access Your Salesforce Account:</strong><br />
                              • Log into your Salesforce account as an administrator<br />
                              • Note whether you're using a production org or sandbox environment<br />
                              • Sandbox URLs typically contain "test" or "sandbox" in the domain</>,
                            <><strong>Reset Your Security Token:</strong><br />
                              • Go to <strong>Setup</strong> (gear icon in top right)<br />
                              • Navigate to <strong>My Personal Information → Reset My Security Token</strong><br />
                              • Click <strong>"Reset Security Token"</strong><br />
                              • A new security token will be sent to your registered email address</>,
                            <><strong>Obtain Your Credentials:</strong><br />
                              • Check your email for the security token (usually arrives within minutes)<br />
                              • Copy the security token from the email<br />
                              • Note your Salesforce username (usually your email address)<br />
                              • Have your Salesforce password ready</>,
                            <><strong>Determine Environment Type:</strong><br />
                              • <strong>Production:</strong> Your main Salesforce org (e.g., mycompany.salesforce.com)<br />
                              • <strong>Sandbox:</strong> Test environment (e.g., mycompany--test.salesforce.com)<br />
                              • Check the URL in your browser to confirm the environment type</>,
                            <><strong>Configure API Access (if needed):</strong><br />
                              • Ensure your user profile has API access enabled<br />
                              • Go to <strong>Setup → Users → Profiles → [Your Profile]</strong><br />
                              • Under <strong>"System Permissions"</strong>, ensure <strong>"API Enabled"</strong> is checked</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter your Salesforce username<br />
                              • Enter your Salesforce password<br />
                              • Paste the security token from your email<br />
                              • Check the <strong>"Is Sandbox Environment"</strong> checkbox if using a sandbox<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Security tokens expire when you change your password. You'll need to reset the token after password changes.</p>
                            <p>Make sure to use the correct environment type (production vs sandbox) as this affects which data Contentbuilder can access.</p>
                            <p>Your user account must have API access enabled and appropriate permissions to read the Salesforce objects you want to index.</p>
                            <p>Security tokens are case-sensitive and should be entered exactly as received in the email.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <strong>Learn more about Salesforce Security Tokens: </strong>
                            <a href="https://help.salesforce.com/s/articleView?id=sf.user_security_token.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              Salesforce Security Token Help →
                            </a>
                          </Text>
                        </div>
                      );
                    case 'hubspot':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.hubspot.title', 'Setting up the HubSpot Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your HubSpot account, you need to create a private app with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access HubSpot Account:</strong><br />
                              • Go to the <a href="https://app.hubspot.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">HubSpot App</a><br />
                              • Log in with your HubSpot account credentials<br />
                              • Ensure you have admin or super admin permissions<br />
                              • Select the correct HubSpot account if you have multiple</>,
                            <><strong>Navigate to Private Apps:</strong><br />
                              • Click the <strong>Settings</strong> icon (gear) in the top navigation<br />
                              • Go to <strong>Integrations → Private Apps</strong><br />
                              • Click <strong>"Create a private app"</strong><br />
                              • If you don't see this option, contact your HubSpot admin</>,
                            <><strong>Create a New Private App:</strong><br />
                              • Enter an app name (e.g., "ContentBuilder Integration")<br />
                              • Add a description (e.g., "Private app for ContentBuilder to access HubSpot data")<br />
                              • Click <strong>"Create app"</strong> to proceed</>,
                            <><strong>Configure App Scopes:</strong><br />
                              • In the <strong>"Scopes"</strong> tab, enable the following permissions:<br />
                              • <strong>Content:</strong><br />
                              • <code>content</code> - Read access to content<br />
                              • <code>blog</code> - Read access to blog posts<br />
                              • <code>knowledge</code> - Read access to knowledge base articles<br />
                              • <strong>CRM:</strong><br />
                              • <code>crm.objects.contacts.read</code> - Read contacts<br />
                              • <code>crm.objects.companies.read</code> - Read companies<br />
                              • <code>crm.objects.deals.read</code> - Read deals<br />
                              • <code>crm.objects.tickets.read</code> - Read tickets<br />
                              • <strong>Marketing:</strong><br />
                              • <code>marketing</code> - Read access to marketing content</>,
                            <><strong>Generate Access Token:</strong><br />
                              • Go to the <strong>"Auth"</strong> tab<br />
                              • Click <strong>"Generate token"</strong><br />
                              • Copy the generated access token<br />
                              • <strong>Important:</strong> Store this token securely - you won't be able to see it again<br />
                              • The token will be used to authenticate API requests</>,
                            <><strong>Test API Access:</strong><br />
                              • Use the HubSpot API Explorer to test your token<br />
                              • Try making a simple API call to verify permissions<br />
                              • Ensure the token has access to the data you want to index</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, paste the access token<br />
                              • Specify the HubSpot objects you want to index (contacts, deals, tickets, etc.)<br />
                              • Set any filtering criteria if needed<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Make sure the private app has the necessary scopes to access the HubSpot data you want to index.</p>
                            <p>Private apps are account-specific and will only have access to the HubSpot account where they were created.</p>
                            <p>If you lose an access token, you'll need to generate a new one - the old one cannot be recovered.</p>
                            <p>Some HubSpot features may require additional permissions or premium subscriptions.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://developers.hubspot.com/docs/api/private-apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.hubspot.link', 'Learn about HubSpot Private Apps →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'gong':
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.gong.title', 'Setting up the Gong Connector')}
                          </Text>
                          <Text>
                            To authorize Contentbuilder to connect to your Gong account, you need to create API credentials with the appropriate permissions:
                          </Text>
                          <Steps items={[
                            <><strong>Access Gong Account:</strong><br />
                              • Go to the <a href="https://app.gong.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Gong App</a><br />
                              • Log in with your Gong account credentials<br />
                              • Ensure you have admin or super admin permissions<br />
                              • Navigate to the main dashboard</>,
                            <><strong>Navigate to API Settings:</strong><br />
                              • Click on your profile picture in the top-right corner<br />
                              • Select <strong>"Settings"</strong> from the dropdown menu<br />
                              • In the left sidebar, go to <strong>"Integrations"</strong><br />
                              • Click on <strong>"REST API"</strong> to access API settings</>,
                            <><strong>Create API Credentials:</strong><br />
                              • In the REST API section, click <strong>"Create New Credential"</strong><br />
                              • Enter a descriptive name (e.g., "ContentBuilder Integration")<br />
                              • Add a description (e.g., "API credentials for ContentBuilder to access Gong data")<br />
                              • Click <strong>"Create"</strong> to generate the credentials</>,
                            <><strong>Configure API Permissions:</strong><br />
                              • Select the appropriate permissions for your use case:<br />
                              • <strong>"Read Calls"</strong> - Access to call recordings and transcripts<br />
                              • <strong>"Read Users"</strong> - Access to user information<br />
                              • <strong>"Read Workspaces"</strong> - Access to workspace data<br />
                              • <strong>"Read Analytics"</strong> - Access to analytics data<br />
                              • Ensure all required permissions are enabled</>,
                            <><strong>Generate Access Credentials:</strong><br />
                              • After creating the credential, you'll see two important values:<br />
                              • <strong>Access Key:</strong> A unique identifier for your API credential<br />
                              • <strong>Access Key Secret:</strong> A secret key for authentication<br />
                              • <strong>Important:</strong> Copy both values immediately - you won't be able to see the secret again</>,
                            <><strong>Test API Access:</strong><br />
                              • Use the Gong API documentation to test your credentials<br />
                              • Try making a simple API call to verify permissions<br />
                              • Ensure the credentials have access to the data you want to index</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • In the Contentbuilder credential form, enter the Access Key<br />
                              • Enter the Access Key Secret<br />
                              • Specify the Gong objects you want to index (calls, users, analytics, etc.)<br />
                              • Set any filtering criteria if needed<br />
                              • Click <strong>"Create Credential"</strong> to save the connection</>,
                          ]} />
                          <ImportantNotes>
                            <p>Make sure the API credential has the necessary permissions to access the Gong data you want to index.</p>
                            <p>Gong API credentials are account-specific and will only have access to the Gong account where they were created.</p>
                            <p>If you lose an access key secret, you'll need to create a new credential - the old one cannot be recovered.</p>
                            <p>Some Gong features may require additional permissions or premium subscriptions.</p>
                          </ImportantNotes>
                          <Text className="mt-2">
                            <a href="https://help.gong.io/hc/en-us/articles/115005055646" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.gong.link', 'Learn about Gong API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'fireflies':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.fireflies.title', 'Get Fireflies.ai API Key')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.fireflies.step1', 'Log into your Fireflies.ai account.')}</>,
                            <>{t('connectors.instructions.fireflies.step2', 'Go to Settings → Integrations → API.')}</>,
                            <>{t('connectors.instructions.fireflies.step3', 'Generate a new API key or copy your existing one.')}</>,
                            <>{t('connectors.instructions.fireflies.step4', 'The API key allows access to your meeting transcripts and recordings.')}</>,
                            <>{t('connectors.instructions.fireflies.step5', 'Paste the API key here to create the credential.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://app.fireflies.ai/integrations/custom/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.fireflies.link', 'Go to Fireflies API Settings →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'web':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.web.title', 'Configure Web Scraper')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.web.step1', 'Identify the website URL you want to scrape (e.g., https://docs.yourcompany.com).')}</>,
                            <>{t('connectors.instructions.web.step2', 'Choose scraping method: "recursive" for full site, "single" for one page, or "sitemap" to follow sitemap.xml.')}</>,
                            <>{t('connectors.instructions.web.step3', 'No API credentials needed for most public websites.')}</>,
                            <>{t('connectors.instructions.web.step4', 'For private sites, ensure the contentbuilder server can access the URLs.')}</>,
                            <>{t('connectors.instructions.web.step5', 'Configure advanced options like scrolling if the site uses dynamic content loading.')}</>,
                          ]} />
                          <Text className="mt-2 text-gray-600">{t('connectors.instructions.web.note', 'The web scraper respects robots.txt and rate limits to avoid overwhelming target sites.')}</Text>
                          <ImportantNotes>
                            <p>It only indexes files from the same domain and containing the same base path.</p>
                            <p>It will index pages reachable via hyperlinks from the base URL.</p>
                            <p>The text contents are cleaned up via some heuristics and some metadata such as the page Title is extracted.</p>
                          </ImportantNotes>
                        </div>
                      );
                    case 'axero':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.axero.title', 'Get Axero API Token')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.axero.step1', 'Log into your Axero intranet as an admin.')}</>,
                            <>{t('connectors.instructions.axero.step2', 'Go to Control Panel → Configuration → API Settings.')}</>,
                            <>{t('connectors.instructions.axero.step3', 'Enable API access and generate a new API token.')}</>,
                            <>{t('connectors.instructions.axero.step4', 'Copy your Axero base URL (e.g., https://yourcompany.axerosolutions.com).')}</>,
                            <>{t('connectors.instructions.axero.step5', 'Enter the base URL and API token here.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://community.axerosolutions.com/communities/public/communifire-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.axero.link', 'Learn about Axero API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'egnyte':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.egnyte.title', 'Get Egnyte Access Token')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.egnyte.step1', 'Log into your Egnyte domain as an admin.')}</>,
                            <>{t('connectors.instructions.egnyte.step2', 'Go to Settings → Integrations → API Tokens.')}</>,
                            <>{t('connectors.instructions.egnyte.step3', 'Create a new API application with read permissions.')}</>,
                            <>{t('connectors.instructions.egnyte.step4', 'Generate an access token for the application.')}</>,
                            <>{t('connectors.instructions.egnyte.step5', 'Copy your Egnyte domain (e.g., "yourcompany" from yourcompany.egnyte.com).')}</>,
                            <>{t('connectors.instructions.egnyte.step6', 'Enter the domain and access token here.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://developers.egnyte.com/docs/read/Getting_Started" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.egnyte.link', 'Learn about Egnyte API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'wikipedia':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.wikipedia.title', 'Configure Wikipedia Indexing')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.wikipedia.step1', 'Choose your target Wikipedia language edition (e.g., "en" for English).')}</>,
                            <>{t('connectors.instructions.wikipedia.step2', 'Identify specific categories or pages you want to index.')}</>,
                            <>{t('connectors.instructions.wikipedia.step3', 'Set recursion depth: 0 for no sub-categories, -1 for unlimited depth.')}</>,
                            <>{t('connectors.instructions.wikipedia.step4', 'No API key required - Wikipedia content is publicly accessible.')}</>,
                            <>{t('connectors.instructions.wikipedia.step5', 'Configure your indexing scope in the connector settings.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://en.wikipedia.org/wiki/Category:Contents" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.wikipedia.link', 'Browse Wikipedia Categories →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'mediawiki':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.mediawiki.title', 'Configure MediaWiki Access')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.mediawiki.step1', 'Identify your MediaWiki site URL (e.g., https://wiki.yourcompany.com).')}</>,
                            <>{t('connectors.instructions.mediawiki.step2', 'Choose the language code for your wiki (usually "en").')}</>,
                            <>{t('connectors.instructions.mediawiki.step3', 'For private wikis, you may need to configure API access in MediaWiki admin.')}</>,
                            <>{t('connectors.instructions.mediawiki.step4', 'Identify categories or specific pages you want to index.')}</>,
                            <>{t('connectors.instructions.mediawiki.step5', 'Set recursion depth for category traversal.')}</>,
                            <>{t('connectors.instructions.mediawiki.step6', 'Enter the hostname and language code here.')}</>,
                          ]} />
                          <Text className="mt-2 text-gray-600">{t('connectors.instructions.mediawiki.note', 'Most public MediaWiki installations allow API access without authentication.')}</Text>
                        </div>
                      );
                    case 'discourse':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.discourse.title', 'Get Discourse API Key')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.discourse.step1', 'Log into your Discourse forum as an admin.')}</>,
                            <>{t('connectors.instructions.discourse.step2', 'Go to Admin → API → Keys.')}</>,
                            <>{t('connectors.instructions.discourse.step3', 'Create a new API key with read permissions.')}</>,
                            <>{t('connectors.instructions.discourse.step4', 'Choose a specific user or "All Users" for the key scope.')}</>,
                            <>{t('connectors.instructions.discourse.step5', 'Copy the API key and the username associated with it.')}</>,
                            <>{t('connectors.instructions.discourse.step6', 'Enter the API key and API username in the form.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://meta.discourse.org/t/create-and-configure-an-api-key/230124" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.discourse.link', 'Learn about Discourse API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'file':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.file.title', 'Upload Files for Indexing')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.file.step1', 'Prepare the documents you want to index (PDF, DOCX, TXT, etc.).')}</>,
                            <>{t('connectors.instructions.file.step2', 'Organize files in folders if you want to maintain structure.')}</>,
                            <>{t('connectors.instructions.file.step3', 'Use the file upload interface to select your documents.')}</>,
                            <>{t('connectors.instructions.file.step4', 'Multiple files can be uploaded in a single batch.')}</>,
                            <>{t('connectors.instructions.file.step5', 'Files will be processed and indexed automatically after upload.')}</>,
                          ]} />
                          <Text className="mt-2 text-gray-600">{t('connectors.instructions.file.note', 'Supported formats: PDF, DOCX, PPTX, XLSX, TXT, MD, HTML, and more.')}</Text>
                        </div>
                      );
                    case 'document360':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.document360.title', 'Get Document360 API Token')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.document360.step1', 'Log into your Document360 account as an admin.')}</>,
                            <>{t('connectors.instructions.document360.step2', 'Go to Settings → API.')}</>,
                            <>{t('connectors.instructions.document360.step3', 'Generate a new API token with read permissions.')}</>,
                            <>{t('connectors.instructions.document360.step4', 'Copy your Portal ID from the account URL or API settings.')}</>,
                            <>{t('connectors.instructions.document360.step5', 'Enter both the Portal ID and API token here.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://docs.document360.com/docs/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.document360.link', 'Learn about Document360 API →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'clickup':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.clickup.title', 'Get ClickUp API Token')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.clickup.step1', 'Log into your ClickUp account.')}</>,
                            <>{t('connectors.instructions.clickup.step2', 'Go to Settings → Apps → API.')}</>,
                            <>{t('connectors.instructions.clickup.step3', 'Generate a personal API token.')}</>,
                            <>{t('connectors.instructions.clickup.step4', 'Copy the token and also find your Team ID from the URL or API.')}</>,
                            <>{t('connectors.instructions.clickup.step5', 'Enter both the API token and Team ID here.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://app.clickup.com/settings/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.clickup.link', 'Go to ClickUp API Settings →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'linear':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.linear.title', 'Get Linear API Key')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.linear.step1', 'Log into your Linear account.')}</>,
                            <>{t('connectors.instructions.linear.step2', 'Go to Settings → Account → API.')}</>,
                            <>{t('connectors.instructions.linear.step3', 'Create a new Personal API Key with a descriptive name.')}</>,
                            <>{t('connectors.instructions.linear.step4', 'The key will have read access to issues, projects, and comments in your workspace.')}</>,
                            <>{t('connectors.instructions.linear.step5', 'Copy the generated API key.')}</>,
                            <>{t('connectors.instructions.linear.step6', 'Paste the API key in the "Linear Access Token" field.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://linear.app/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.linear.link', 'Go to Linear API Settings →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'freshdesk':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.freshdesk.title', 'Get Freshdesk API Key')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.freshdesk.step1', 'Log into your Freshdesk account as an admin.')}</>,
                            <>{t('connectors.instructions.freshdesk.step2', 'Go to Admin → Profile Settings.')}</>,
                            <>{t('connectors.instructions.freshdesk.step3', 'Find your API Key in the "Your API Key" section on the right.')}</>,
                            <>{t('connectors.instructions.freshdesk.step4', 'Copy the API key, your password, and note your Freshdesk domain (e.g., "yourcompany" from yourcompany.freshdesk.com).')}</>,
                            <>{t('connectors.instructions.freshdesk.step5', 'Enter the domain, password, and API key in the form.')}</>,
                          ]} />
                          <Text className="mt-2">
                            <a href="https://support.freshdesk.com/support/solutions/articles/215517" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {t('connectors.instructions.freshdesk.link', 'Learn about Freshdesk API Keys →')}
                            </a>
                          </Text>
                        </div>
                      );
                    case 'xenforo':
                      return (
                        <div>
                          <Text className="font-semibold">{t('connectors.instructions.xenforo.title', 'Get XenForo Access')}</Text>
                          <Steps items={[
                            <>{t('connectors.instructions.xenforo.step1', 'Log into your XenForo forum as an admin.')}</>,
                            <>{t('connectors.instructions.xenforo.step2', 'Go to Admin CP → Setup → API keys.')}</>,
                            <>{t('connectors.instructions.xenforo.step3', 'Create a new API key with read permissions.')}</>,
                            <>{t('connectors.instructions.xenforo.step4', 'Copy your forum base URL (e.g., https://yourforum.com).')}</>,
                            <>{t('connectors.instructions.xenforo.step5', 'Enter the base URL here (API key will be configured separately if needed).')}</>,
                          ]} />
                          <Text className="mt-2 text-gray-600">{t('connectors.instructions.xenforo.note', 'XenForo v2.2+ required. Some installations may not require API keys for public content.')}</Text>
                        </div>
                      );

                    default:
                      return (
                        <div>
                          <Text className="font-semibold text-lg">
                            {t('connectors.instructions.default.title', 'Setting up the Connector')}
                          </Text>
                          <Text>
                            {t('connectors.instructions.default.text', "To connect this service to Contentbuilder, you'll need to obtain the appropriate credentials from your source system's admin panel or developer settings.")}
                          </Text>
                          <Steps items={[
                            <><strong>Access Your Service's Admin Panel:</strong><br />
                              • Log into your service's admin dashboard or developer console<br />
                              • Look for API settings, integrations, or developer tools section</>,
                            <><strong>Generate API Credentials:</strong><br />
                              • Create a new API key, token, or app credential<br />
                              • Ensure it has read access to the data you want to index<br />
                              • Note any required permissions or scopes</>,
                            <><strong>Configure Contentbuilder:</strong><br />
                              • Enter the credentials in the form below<br />
                              • Click <strong>"Create Credential"</strong> to save the connection<br />
                              • Contentbuilder will start indexing your authorized content</>,
                          ]} />
                          <ImportantNotes>
                            <p>Make sure the credentials have the necessary permissions to read the data you want to index.</p>
                            <p>Keep your credentials secure and never share them publicly - they act as passwords to your data.</p>
                            <p>If you need help with a specific connector, check the official Contentbuilder documentation for detailed setup instructions.</p>
                          </ImportantNotes>
                        </div>
                      );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
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
  const { t } = useLanguage();
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use Google Drive specific form for Google Drive connector
  if (connectorId === 'google_drive') {
    return (
      <GoogleDriveCredentialForm
        onCredentialCreated={onCredentialCreated}
        onCancel={onCancel}
      />
    );
  }

  // Build credential form fields dynamically based on templates
  const getCredentialFields = () => {
    const template = credentialTemplates[connectorId as any];
    const baseFields: Array<{ name: string; label: string; type: string; required: boolean }> = [
      { name: 'name', label: 'Credential Name', type: 'text', required: true },
    ];
    
    if (!template) return baseFields;
    
    // S3-style multi-auth template
    if (template && (template as any).authMethods) {
      const tplt: any = template;
      return [
        ...baseFields,
        { 
          name: 'authentication_method', 
          label: credentialDisplayNames['authentication_method'] || 'Authentication Method', 
          type: 'select', 
          required: true 
        },
        // We'll render dynamic fields based on selected method below
      ];
    }
    
    // Simple key/value template
    return [
      ...baseFields,
      ...Object.keys(template).map((key) => {
        const value = (template as any)[key];
        let fieldType = 'text';
        
        // Detect field type based on value and key name
        if (typeof value === 'boolean') {
          fieldType = 'checkbox';
        } else if (key.toLowerCase().includes('json') || key.toLowerCase().includes('content')) {
          fieldType = 'file';
        } else if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
          fieldType = 'password';
        } else if (key.toLowerCase().includes('email')) {
          fieldType = 'email';
        }
        
        return {
          name: key,
          label: credentialDisplayNames[key] || key,
          type: fieldType,
          required: fieldType !== 'checkbox',
        };
      }),
    ];
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
  const dynamicTemplate = credentialTemplates[connectorId as any];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          {field.type !== 'checkbox' && (
            <label className="block text-sm font-semibold text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {field.type === 'select' ? (
            <select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an option</option>
              {dynamicTemplate && (dynamicTemplate as any).authMethods && (dynamicTemplate as any).authMethods.map((m: any) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          ) : field.type === 'password' ? (
            <Input
              type="password"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3 duration-200"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          ) : field.type === 'file' ? (
            <div className="relative">
              <label className="block">
                <span className="sr-only">{t('interface.selectFile', 'Select file')}</span>
                <input
                  type="file"
                  name={field.name}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const text = await file.text();
                      handleInputChange(field.name, text);
                    }
                  }}
                  required={field.required}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  aria-label={t('interface.selectFile', 'Select file')}
                />
              </label>
            </div>
          ) : field.type === 'email' ? (
            <Input
              type="email"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3 duration-200"
              placeholder="Enter email address"
            />
          ) : field.type === 'checkbox' ? (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name] || false}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ) : (
            <Input
              type="text"
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

      {/* Render dynamic auth method sub-fields for S3-like templates */}
      {dynamicTemplate && (dynamicTemplate as any).authMethods && formData['authentication_method'] && (
        <div className="space-y-2">
          {((dynamicTemplate as any).authMethods.find((m: any) => m.value === formData['authentication_method'])?.fields || {}) &&
            Object.entries((dynamicTemplate as any).authMethods.find((m: any) => m.value === formData['authentication_method']).fields).map(([k]) => (
              <div key={k} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  {credentialDisplayNames[k] || k}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type={k.toLowerCase().includes('secret') ? 'password' : 'text'}
                  name={k}
                  value={formData[k] || ''}
                  onChange={(e) => handleInputChange(k, e.target.value)}
                  required
                  className="w-full px-4 py-3"
                />
              </div>
            ))}
        </div>
      )}

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