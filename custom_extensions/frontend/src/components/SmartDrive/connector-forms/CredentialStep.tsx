"use client";

import React, { FC, useState, useEffect } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "@/components/ui/input";
import { credentialTemplates, credentialDisplayNames } from "./OnyxCredentialTemplates";

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
  const [helpOpen, setHelpOpen] = useState(false);

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
                {/* Help tooltip button (persistent while hovering tooltip area) */}
                <div className="relative flex items-center gap-2">
                  <div
                    className="relative"
                    onMouseEnter={() => setHelpOpen(true)}
                    onMouseLeave={() => setHelpOpen(false)}
                  >
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center text-sm font-bold border border-blue-200"
                      aria-label={t('interface.credentialHelp.ariaLabel', 'How to get these credentials')}
                      onClick={() => setHelpOpen((v) => !v)}
                    >
                      i
                    </button>
                    <div
                      className="absolute right-0 top-full mt-2 w-[28rem] max-w-[90vw] z-50"
                      role="tooltip"
                      style={{ display: helpOpen ? 'block' : 'none' }}
                    >
                      <div className="rounded-lg shadow-xl border border-gray-200 bg-white p-4 text-sm leading-5 text-gray-800">
                         {(() => {
                           const Text = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <p className={`mb-2 ${className}`}>{children}</p>;
                           const Steps = ({ items }: { items: React.ReactNode[] }) => (
                             <ol className="list-decimal pl-5 space-y-1">{items.map((it, i) => <li key={i}>{it}</li>)}</ol>
                           );
                           const Bullets = ({ items }: { items: React.ReactNode[] }) => (
                             <ul className="list-disc pl-5 space-y-1">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                           );

                           switch (connectorId) {
                             case 'notion':
                               return (
                                 <div>
                                   <Text><span className="font-semibold">{t('connectors.instructions.notion.title', 'Get a Notion Integration Token')}</span></Text>
                                   <Steps items={[
                                     <>{t('connectors.instructions.notion.step1', 'Open your Notion "My Integrations" and create a new integration.')}</>,
                                     <>{t('connectors.instructions.notion.step2', 'Name it (for example, "contentbuilder") and enable Read content capability.')}</>,
                                     <>{t('connectors.instructions.notion.step3', 'Copy the Integration Token that is shown after creation.')}</>,
                                     <>{t('connectors.instructions.notion.step4', 'In Notion, for each page or database to index: open the menu (•••) → "Add connections" → select your integration. Child pages/rows are included automatically.')}</>,
                                     <>{t('connectors.instructions.notion.step5', 'Paste the Integration Token into the field here and create the credential.')}</>,
                                  ]} />
                                  <Text className="mt-2 text-gray-600">{t('connectors.instructions.notion.note', 'Indexing runs periodically. To limit content, remove the integration from specific pages or databases.')}</Text>
                                  <Text className="mt-2">
                                    <a href="https://www.notion.com/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.notion.link', 'Go to Notion My Integrations →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'google_drive':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.google_drive.title', 'Get Google Drive Service Account')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.google_drive.step1', 'Go to Google Cloud Console → IAM & Admin → Service Accounts.')}</>,
                                    <>{t('connectors.instructions.google_drive.step2', 'Create a new service account with a descriptive name.')}</>,
                                    <>{t('connectors.instructions.google_drive.step3', 'Generate and download a JSON key file for the service account.')}</>,
                                    <>{t('connectors.instructions.google_drive.step4', 'Upload the JSON file here and provide the primary admin email.')}</>,
                                  ]} />
                                  <Text className="mt-2">
                                    <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.google_drive.link', 'Go to Google Cloud Service Accounts →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'slack':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.slack.title', 'Get a Slack Bot Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.slack.step1', 'Create a new Slack app in your workspace.')}</>,
                                    <>{t('connectors.instructions.slack.step2', 'Add Bot Token Scopes: channels:read, channels:history, groups:read, groups:history, im:read, im:history, mpim:read, mpim:history, users:read.')}</>,
                                    <>{t('connectors.instructions.slack.step3', 'Install the app to your workspace and copy the Bot User OAuth Token.')}</>,
                                    <>{t('connectors.instructions.slack.step4', 'Paste the token here and create the credential.')}</>,
                                  ]} />
                                  <Text className="mt-2">
                                    <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.slack.link', 'Go to Slack Apps Dashboard →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'github':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.github.title', 'Get a GitHub Personal Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.github.step1', 'Go to GitHub Settings → Developer settings → Personal access tokens.')}</>,
                                    <>{t('connectors.instructions.github.step2', 'Generate a new token (classic) with "repo" scope for private repos or no scopes for public repos only.')}</>,
                                    <>{t('connectors.instructions.github.step3', 'Copy the generated token and paste it here.')}</>,
                                  ]} />
                                  <Text className="mt-2">
                                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.github.link', 'Go to GitHub Personal Access Tokens →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'gitlab':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.gitlab.title', 'Get a GitLab Personal Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gitlab.step1', 'Go to GitLab User Settings → Access Tokens.')}</>,
                                    <>{t('connectors.instructions.gitlab.step2', 'Create a personal access token with "read_api" and "read_repository" scopes.')}</>,
                                    <>{t('connectors.instructions.gitlab.step3', 'Copy the token and paste it here along with your GitLab URL.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.confluence.title', 'Get Confluence API Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.confluence.step1', 'Go to Atlassian Account Settings → Security → Create and manage API tokens.')}</>,
                                    <>{t('connectors.instructions.confluence.step2', 'Create a new API token with a descriptive label.')}</>,
                                    <>{t('connectors.instructions.confluence.step3', 'Copy the token and use it with your Confluence username and URL.')}</>,
                                  ]} />
                                  <Text className="mt-2">
                                    <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.confluence.link', 'Go to Atlassian API Tokens →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'jira':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.jira.title', 'Get Jira API Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.jira.step1', 'Go to Atlassian Account Settings → Security → Create and manage API tokens.')}</>,
                                    <>{t('connectors.instructions.jira.step2', 'Create a new API token with a descriptive label.')}</>,
                                    <>{t('connectors.instructions.jira.step3', 'Copy the token and use it with your Jira email and URL.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.zendesk.title', 'Get Zendesk API Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.zendesk.step1', 'Go to Zendesk Admin Center → Apps and integrations → APIs → Zendesk API.')}</>,
                                    <>{t('connectors.instructions.zendesk.step2', 'Enable Token Access and create a new API token.')}</>,
                                    <>{t('connectors.instructions.zendesk.step3', 'Copy the token and use it with your email and subdomain.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.asana.title', 'Get Asana Personal Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.asana.step1', 'Go to Asana → My Profile Settings → Apps → Manage Developer Apps.')}</>,
                                    <>{t('connectors.instructions.asana.step2', 'Create a Personal Access Token with appropriate permissions.')}</>,
                                    <>{t('connectors.instructions.asana.step3', 'Copy the token and paste it here.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.airtable.title', 'Get Airtable Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.airtable.step1', 'Go to Airtable Account → Developer Hub → Personal access tokens.')}</>,
                                    <>{t('connectors.instructions.airtable.step2', 'Create a new token with read permissions for your bases.')}</>,
                                    <>{t('connectors.instructions.airtable.step3', 'Copy the token and paste it here.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.dropbox.title', 'Get Dropbox Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.dropbox.step1', 'Go to Dropbox App Console and create a new app.')}</>,
                                    <>{t('connectors.instructions.dropbox.step2', 'Choose "Scoped access" and "Full Dropbox" access.')}</>,
                                    <>{t('connectors.instructions.dropbox.step3', 'Generate an access token and copy it.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.r2.title', 'Get Cloudflare R2 Credentials')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.r2.step1', 'Go to Cloudflare Dashboard → R2 Object Storage.')}</>,
                                    <>{t('connectors.instructions.r2.step2', 'Click "Manage R2 API Tokens" in the right sidebar.')}</>,
                                    <>{t('connectors.instructions.r2.step3', 'Create a new API token with "Object Read" permissions for your bucket.')}</>,
                                    <>{t('connectors.instructions.r2.step4', 'Copy your Account ID from the R2 overview page.')}</>,
                                    <>{t('connectors.instructions.r2.step5', 'Copy the Access Key ID and Secret Access Key from the token creation.')}</>,
                                    <>{t('connectors.instructions.r2.step6', 'Enter all three values (Account ID, Access Key ID, Secret) here.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.gcs.title', 'Get Google Cloud Storage Credentials')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gcs.step1', 'Go to Google Cloud Console → IAM & Admin → Service Accounts.')}</>,
                                    <>{t('connectors.instructions.gcs.step2', 'Create a new service account with "Storage Object Viewer" role.')}</>,
                                    <>{t('connectors.instructions.gcs.step3', 'Generate and download a JSON key file for the service account.')}</>,
                                    <>{t('connectors.instructions.gcs.step4', 'Open the JSON file and copy the "client_email" and "private_key" values.')}</>,
                                    <>{t('connectors.instructions.gcs.step5', 'Use the client_email as Access Key ID and private_key as Secret Access Key.')}</>,
                                    <>{t('connectors.instructions.gcs.step6', 'Enter both values here to create the credential.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.oci.title', 'Get Oracle Cloud Infrastructure Storage Credentials')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.oci.step1', 'Go to Oracle Cloud Console → Identity & Security → Users.')}</>,
                                    <>{t('connectors.instructions.oci.step2', 'Select a user and go to Customer Secret Keys.')}</>,
                                    <>{t('connectors.instructions.oci.step3', 'Generate a new Customer Secret Key and copy it.')}</>,
                                    <>{t('connectors.instructions.oci.step4', 'Find your Namespace in Object Storage → Buckets (shown at top).')}</>,
                                    <>{t('connectors.instructions.oci.step5', 'Find your Region identifier (e.g., us-ashburn-1) from the console URL.')}</>,
                                    <>{t('connectors.instructions.oci.step6', 'Enter the Namespace, Region, Access Key (username), and Secret Key here.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.sharepoint.title', 'Get Microsoft App Registration')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.sharepoint.step1', 'Go to Azure Portal → App registrations → New registration.')}</>,
                                    <>{t('connectors.instructions.sharepoint.step2', 'Create app with appropriate Microsoft Graph permissions.')}</>,
                                    <>{t('connectors.instructions.sharepoint.step3', 'Generate a client secret and copy the Client ID, Secret, and Directory ID.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.gmail.title', 'Get Gmail Service Account')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gmail.step1', 'Go to Google Cloud Console → IAM & Admin → Service Accounts.')}</>,
                                    <>{t('connectors.instructions.gmail.step2', 'Create a new service account with a descriptive name like "contentbuilder-gmail".')}</>,
                                    <>{t('connectors.instructions.gmail.step3', 'Generate and download a JSON key file for the service account.')}</>,
                                    <>{t('connectors.instructions.gmail.step4', 'Enable Gmail API in Google Cloud Console → APIs & Services → Library.')}</>,
                                    <>{t('connectors.instructions.gmail.step5', 'In Google Admin Console, enable domain-wide delegation for the service account.')}</>,
                                    <>{t('connectors.instructions.gmail.step6', 'Upload the JSON key file and provide the primary admin email address.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.discord.title', 'Get a Discord Bot Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.discord.step1', 'Go to Discord Developer Portal and create a new application.')}</>,
                                    <>{t('connectors.instructions.discord.step2', 'In the Bot section, click "Add Bot" to create a bot user.')}</>,
                                    <>{t('connectors.instructions.discord.step3', 'Under Token, click "Copy" to get your bot token.')}</>,
                                    <>{t('connectors.instructions.discord.step4', 'In Bot Permissions, enable "Read Messages/View Channels" and "Read Message History".')}</>,
                                    <>{t('connectors.instructions.discord.step5', 'Invite the bot to your Discord server using the OAuth2 URL generator.')}</>,
                                    <>{t('connectors.instructions.discord.step6', 'Paste the bot token here and create the credential.')}</>,
                                  ]} />
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
                                    <>{t('connectors.instructions.bookstack.step6', 'Enter the base URL, Token ID, and Token Secret here.')}</>,
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
                                    <>{t('connectors.instructions.loopio.step5', 'Enter the subdomain, Client ID, and Client Token here.')}</>,
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
                                    <>{t('connectors.instructions.guru.step5', 'Enter both your Guru username and the API token here.')}</>,
                                  ]} />
                                  <Text className="mt-2">
                                    <a href="https://help.getguru.com/docs/guru-api-overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.guru.link', 'Learn about Guru API →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'slab':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.slab.title', 'Get Slab Bot Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.slab.step1', 'Log into your Slab team as an admin.')}</>,
                                    <>{t('connectors.instructions.slab.step2', 'Go to Settings → Integrations → API.')}</>,
                                    <>{t('connectors.instructions.slab.step3', 'Create a new API token with read permissions.')}</>,
                                    <>{t('connectors.instructions.slab.step4', 'Copy the generated token and your Slab team URL.')}</>,
                                    <>{t('connectors.instructions.slab.step5', 'Enter both the base URL and bot token here.')}</>,
                                  ]} />
                                  <Text className="mt-2 text-gray-600">{t('connectors.instructions.slab.note', 'Your base URL should look like: https://yourteam.slab.com/')}</Text>
                                </div>
                              );
                            case 'salesforce':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.salesforce.title', 'Get Salesforce Credentials')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.salesforce.step1', 'Log into your Salesforce account as an admin.')}</>,
                                    <>{t('connectors.instructions.salesforce.step2', 'Go to Setup → My Personal Information → Reset My Security Token.')}</>,
                                    <>{t('connectors.instructions.salesforce.step3', 'Click "Reset Security Token" - a new token will be emailed to you.')}</>,
                                    <>{t('connectors.instructions.salesforce.step4', 'Copy the security token from the email.')}</>,
                                    <>{t('connectors.instructions.salesforce.step5', 'Determine if you\'re using a Sandbox environment (usually has "test" in the URL).')}</>,
                                    <>{t('connectors.instructions.salesforce.step6', 'Enter your username, password, security token, and sandbox setting here.')}</>,
                                  ]} />
                                  <Text className="mt-2">
                                    <a href="https://help.salesforce.com/s/articleView?id=sf.user_security_token.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.salesforce.link', 'Learn about Salesforce Security Tokens →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'hubspot':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.hubspot.title', 'Get HubSpot Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.hubspot.step1', 'Log into your HubSpot account as an admin.')}</>,
                                    <>{t('connectors.instructions.hubspot.step2', 'Go to Settings → Integrations → Private Apps.')}</>,
                                    <>{t('connectors.instructions.hubspot.step3', 'Create a new private app with a descriptive name.')}</>,
                                    <>{t('connectors.instructions.hubspot.step4', 'In Scopes, enable read permissions for content, contacts, deals, and tickets.')}</>,
                                    <>{t('connectors.instructions.hubspot.step5', 'Generate the access token and copy it.')}</>,
                                    <>{t('connectors.instructions.hubspot.step6', 'Paste the access token here to create the credential.')}</>,
                                  ]} />
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
                                  <Text className="font-semibold">{t('connectors.instructions.gong.title', 'Get Gong API Credentials')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gong.step1', 'Log into your Gong account as an admin.')}</>,
                                    <>{t('connectors.instructions.gong.step2', 'Go to Settings → Integrations → REST API.')}</>,
                                    <>{t('connectors.instructions.gong.step3', 'Create a new API credential with read permissions.')}</>,
                                    <>{t('connectors.instructions.gong.step4', 'Copy the Access Key and Access Key Secret.')}</>,
                                    <>{t('connectors.instructions.gong.step5', 'Enter both the Access Key and Secret here.')}</>,
                                  ]} />
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
                                    <>{t('connectors.instructions.egnyte.step6', 'Enter your domain and access token here.')}</>,
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
                                    <>{t('connectors.instructions.discourse.step5', 'Copy your Discourse base URL and the API key.')}</>,
                                    <>{t('connectors.instructions.discourse.step6', 'Enter the base URL, API key, and username here.')}</>,
                                  ]} />
                                  <Text className="mt-2">
                                    <a href="https://meta.discourse.org/t/create-and-configure-an-api-key/230124" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                      {t('connectors.instructions.discourse.link', 'Learn about Discourse API →')}
                                    </a>
                                  </Text>
                                </div>
                              );
                            case 'google_sites':
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
                            default:
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.default.title', 'How to obtain credentials')}</Text>
                                  <Text>{t('connectors.instructions.default.text', "Use your source system's admin panel to generate an API key/token or app credentials with read access, then paste them here to create a credential in contentbuilder.")}</Text>
                                </div>
                              );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
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
        { name: 'authentication_method', label: credentialDisplayNames['authentication_method'] || 'Authentication Method', type: 'select', required: true },
        // We'll render dynamic fields based on selected method below
      ];
    }
    // Simple key/value template
    return [
      ...baseFields,
      ...Object.keys(template).map((key) => ({
        name: key,
        label: credentialDisplayNames[key] || key,
        type: key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret') ? 'password' : 'text',
        required: true,
      })),
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
          <label className="block text-sm font-semibold text-gray-900">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
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
              <input
                type="file"
                name={field.name}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleInputChange(field.name, file.name);
                  }
                }}
                required={field.required}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
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
          {((dynamicTemplate as any).authMethods.find((m: any) => m.value === formData['authentication_method'])?.fields || {} ) &&
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