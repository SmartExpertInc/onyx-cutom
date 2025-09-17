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
                                     <>{t('connectors.instructions.notion.step1', 'Open your Notion “My Integrations” and create a new integration.')}</>,
                                     <>{t('connectors.instructions.notion.step2', 'Name it (for example, “contentbuilder”) and enable Read content capability.')}</>,
                                     <>{t('connectors.instructions.notion.step3', 'Copy the Integration Token that is shown after creation.')}</>,
                                     <>{t('connectors.instructions.notion.step4', 'In Notion, for each page or database to index: open the menu (•••) → “Add connections” → select your integration. Child pages/rows are included automatically.')}</>,
                                     <>{t('connectors.instructions.notion.step5', 'Paste the Integration Token into the field here and create the credential.')}</>,
                                  ]} />
                                  <Text className="mt-2 text-gray-600">{t('connectors.instructions.notion.note', 'Indexing runs periodically. To limit content, remove the integration from specific pages or databases.')}</Text>
                                </div>
                              );
                            case 'google_drive':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.google_drive.title', 'Provide Google Drive credentials')}</span></Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.google_drive.step1', 'Recommended: use a Service Account created in Google Cloud Console. Download the JSON key and paste the entire JSON into the “Service Account JSON” field.')}</>,
                                    <>{t('connectors.instructions.google_drive.step2', 'Alternatively, use OAuth for user-based access if your admin permits it.')}</>,
                                    <>{t('connectors.instructions.google_drive.step3', 'Supported files include Google Docs/Sheets/Slides, Microsoft Office formats, PDF, CSV, and TXT.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'slack':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.slack.title', 'Create a Slack Bot Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.slack.step1', 'Create a Slack App (Bot) in your Slack API dashboard.')}</>,
                                    <>{t('connectors.instructions.slack.step2', 'Add the necessary read scopes for channels and messages as allowed by your workspace policy.')}</>,
                                    <>{t('connectors.instructions.slack.step3', 'Install the app to your workspace to generate the Bot User OAuth token.')}</>,
                                    <>{t('connectors.instructions.slack.step4', 'Paste the bot token here and create the credential.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'github':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.github.title', 'Create a GitHub Access Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.github.step1', 'Generate a Personal Access Token (classic) with “repo” read permissions.')}</>,
                                    <>{t('connectors.instructions.github.step2', 'If using a GitHub App, ensure it has read access to the repositories you want to index.')}</>,
                                    <>{t('connectors.instructions.github.step3', 'Paste the token here and save the credential.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'gitlab':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.gitlab.title', 'Create a GitLab Access Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gitlab.step1', 'Create a Personal Access Token with the “read_api” scope.')}</>,
                                    <>{t('connectors.instructions.gitlab.step2', 'Ensure the token has access to the groups/projects you want to index.')}</>,
                                    <>{t('connectors.instructions.gitlab.step3', 'Paste the token here to create the credential.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'confluence':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.confluence.title', 'Confluence API Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.confluence.step1', 'Find your Confluence site URL (cloud) or base URL (server).')}</>,
                                    <>{t('connectors.instructions.confluence.step2', 'Create an API token (cloud) or use user credentials with access (server).')}</>,
                                    <>{t('connectors.instructions.confluence.step3', 'Provide the URL, your username/email, and the API token here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'jira':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.jira.title', 'Jira API Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.jira.step1', 'Find your Jira site URL.')}</>,
                                    <>{t('connectors.instructions.jira.step2', 'Create an API token and use it with your account email/username.')}</>,
                                    <>{t('connectors.instructions.jira.step3', 'Provide the URL, your username/email, and the API token.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'zendesk':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.zendesk.title', 'Zendesk API Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.zendesk.step1', 'In Zendesk Admin, enable API token access and generate a token.')}</>,
                                    <>{t('connectors.instructions.zendesk.step2', 'Provide your subdomain, account email, and the API token.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'asana':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.asana.title', 'Asana Personal Access Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.asana.step1', 'Create an Asana Personal Access Token in your Asana settings.')}</>,
                                    <>{t('connectors.instructions.asana.step2', 'Paste the token into the API Token field and save the credential.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'airtable':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.airtable.title', 'Airtable API Key')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.airtable.step1', 'Create an Airtable API key (or token) with read access to the bases you want to index.')}</>,
                                    <>{t('connectors.instructions.airtable.step2', 'Paste the key here and save the credential.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'dropbox':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.dropbox.title', 'Dropbox Access Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.dropbox.step1', 'Create a Dropbox app with scoped access.')}</>,
                                    <>{t('connectors.instructions.dropbox.step2', 'Generate an access token and paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 's3':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.s3.title', 'Amazon S3 Credentials')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.s3.step1', 'Provide Access Key ID, Secret Access Key, and the target Bucket (and region if needed).')}</>,
                                    <>{t('connectors.instructions.s3.step2', 'Ensure read permissions for the bucket and keys.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'r2':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.r2.title', 'Cloudflare R2 Credentials')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.r2.step1', 'Provide R2 Access Key ID, Secret Access Key, and Bucket details.')}</>,
                                    <>{t('connectors.instructions.r2.step2', 'Ensure read access for the bucket.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'google_cloud_storage':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.gcs.title', 'Google Cloud Storage')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gcs.step1', 'Use a Service Account JSON with access to the target GCS buckets.')}</>,
                                    <>{t('connectors.instructions.gcs.step2', 'Paste the JSON content here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'oci_storage':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.oci.title', 'Oracle Cloud Object Storage')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.oci.step1', 'Provide required credentials (Tenancy OCID, User OCID, Key Fingerprint, Private Key) and bucket details.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'sharepoint':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.sharepoint.title', 'SharePoint Credentials')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.sharepoint.step1', 'Register an app in Azure Active Directory (app registration).')}</>,
                                    <>{t('connectors.instructions.sharepoint.step2', 'Provide Tenant ID, Client ID, and either a Client Secret or certificate details, plus the target site information.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'gmail':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.gmail.title', 'Gmail Access')}</span></Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.gmail.step1', 'Use a Google Workspace admin-provisioned OAuth app or a Service Account with domain-wide delegation.')}</>,
                                    <>{t('connectors.instructions.gmail.step2', 'Grant the necessary read scopes for messages/threads as required.')}</>,
                                  ]} />
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
                                  <Text><span className="font-semibold">{t('connectors.instructions.discord.title', 'Discord Bot Token')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.discord.step1', 'Create a Discord application and bot, then invite it to your server with the required permissions.')}</>,
                                    <>{t('connectors.instructions.discord.step2', 'Copy the bot token and paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'zulip':
                              return (
                                <div>
                                  <Text><span className="font-semibold">{t('connectors.instructions.zulip.title', 'Zulip API Key')}</span></Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.zulip.step1', 'Create or view your Zulip API key in your Zulip account settings.')}</>,
                                    <>{t('connectors.instructions.zulip.step2', 'Paste your email and API key here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'gitbook':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.gitbook.title', 'GitBook Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gitbook.step1', 'Generate an access token with read permissions for your spaces.')}</>,
                                    <>{t('connectors.instructions.gitbook.step2', 'Paste the token here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'bookstack':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.bookstack.title', 'BookStack API Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.bookstack.step1', 'Create an API token in BookStack with read access.')}</>,
                                    <>{t('connectors.instructions.bookstack.step2', 'Provide the token here along with the instance URL if required.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'google_sites':
                            case 'google_site':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.google_sites.title', 'Google Sites')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.google_sites.step1', 'Use a Google credential (Service Account or OAuth) with access to the Sites you want to index.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'guru':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.guru.title', 'Guru API Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.guru.step1', 'Create an API token with read access to your collections.')}</>,
                                    <>{t('connectors.instructions.guru.step2', 'Paste the token here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'slab':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.slab.title', 'Slab API Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.slab.step1', 'Generate an API token with read access.')}</>,
                                    <>{t('connectors.instructions.slab.step2', 'Paste the token here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'salesforce':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.salesforce.title', 'Salesforce')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.salesforce.step1', 'Use a Connected App and provide OAuth credentials or a refresh token with read permissions to target objects.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'hubspot':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.hubspot.title', 'HubSpot')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.hubspot.step1', 'Create a Private App and generate an access token with read scopes.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'gong':
                            case 'fireflies':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.voice.title', 'Voice/Call Platform Access')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.voice.step1', 'Generate an API token in your account with read access to transcripts/recordings.')}</>,
                                    <>{t('connectors.instructions.voice.step2', 'Paste the token here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'egnyte':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.egnyte.title', 'Egnyte')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.egnyte.step1', 'Provide your Egnyte domain and an access token or OAuth credentials with read permissions.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'web':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.web.title', 'Web Scraper')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.web.step1', 'Provide the start URL(s) and optional rules (depth, include/exclude patterns) depending on configuration.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'axero':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.axero.title', 'Axero')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.axero.step1', 'Use an API key or OAuth app with read access to the communities/spaces you wish to index.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'wikipedia':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.wikipedia.title', 'Wikipedia')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.wikipedia.step1', 'No credential typically required. Configure the pages or categories to include and the language(s) to use, if applicable.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'mediawiki':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.mediawiki.title', 'MediaWiki')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.mediawiki.step1', 'Provide the MediaWiki base URL and a user API token or bot credentials with read access.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'document360':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.document360.title', 'Document360')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.document360.step1', 'Generate an API token with read access to your knowledge base; paste the token here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'clickup':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.clickup.title', 'ClickUp')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.clickup.step1', 'Create a Personal API Token with read permissions for the spaces/folders/lists you want to index, then paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'linear':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.linear.title', 'Linear')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.linear.step1', 'Create a Personal API Key with read access; paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'productboard':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.productboard.title', 'Productboard')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.productboard.step1', 'Generate an API token with read access to products and notes; paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'freshdesk':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.freshdesk.title', 'Freshdesk')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.freshdesk.step1', 'Provide your Freshdesk domain and an API key from your profile settings; paste the API key here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'highspot':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.highspot.title', 'Highspot')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.highspot.step1', 'Use an API token with read access to content; paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'loopio':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.loopio.title', 'Loopio')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.loopio.step1', 'Generate an API token with read access to your library/projects; paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'xenforo':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.xenforo.title', 'XenForo')}</Text>
                                  <Bullets items={[
                                    <>{t('connectors.instructions.xenforo.step1', 'Provide the XenForo API base URL and an API key with read permissions; paste it here.')}</>,
                                  ]} />
                                </div>
                              );
                            case 'gitbook':
                              return (
                                <div>
                                  <Text className="font-semibold">{t('connectors.instructions.gitbook.title', 'GitBook Access Token')}</Text>
                                  <Steps items={[
                                    <>{t('connectors.instructions.gitbook.step1', 'Generate an access token with read permissions for your spaces.')}</>,
                                    <>{t('connectors.instructions.gitbook.step2', 'Paste the token here.')}</>,
                                  ]} />
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
                    // For now, we'll store the file name
                    // In a real implementation, you'd want to handle file upload
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