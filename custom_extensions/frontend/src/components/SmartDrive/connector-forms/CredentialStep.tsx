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
                <div
                  className="relative flex items-center gap-2"
                  onMouseEnter={() => setHelpOpen(true)}
                  onMouseLeave={() => setHelpOpen(false)}
                >
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center text-sm font-bold border border-blue-200"
                    aria-label="How to get these credentials"
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
                               <Text><span className="font-semibold">Get a Notion Integration Token</span></Text>
                               <Steps items={[
                                 <>Go to notion.com/my-integrations and create a new integration.</>,
                                 <>Name it (e.g., "contentbuilder") and enable Read content capability.</>,
                                 <>Copy the Integration Token provided after creation.</>,
                                 <>In Notion, open each page or database you want indexed → menu (•••) → Add connections → select your integration. Child pages/rows are included.</>,
                                 <>Paste the token into the Integration Token field here and create the credential.</>,
                               ]} />
                               <Text className="mt-2 text-gray-600">Indexing runs periodically. To limit content, unshare the integration from specific pages or databases.</Text>
                             </div>
                           );
                         case 'google_drive':
                           return (
                             <div>
                               <Text><span className="font-semibold">Provide Google Drive credentials</span></Text>
                               <Bullets items={[
                                 <><span className="font-semibold">Recommended:</span> Use a <span className="font-semibold">Service Account</span> (created in Google Cloud Console). Download the JSON key and paste the entire JSON into the Service Account JSON field.</>,
                                 <>Alternatively, use OAuth for user-based access if configured by your admin.</>,
                                 <>Supported files include Google Docs/Sheets/Slides, Microsoft Office formats, PDF, CSV, and TXT.</>,
                               ]} />
                             </div>
                           );
                         case 'slack':
                           return (
                             <div>
                               <Text><span className="font-semibold">Create a Slack Bot Token</span></Text>
                               <Steps items={[
                                 <>Create a Slack App in api.slack.com with a Bot token.</>,
                                 <>Add scopes for reading channels and messages as required by your workspace policy.</>,
                                 <>Install the app to your workspace to generate a Bot User OAuth Token.</>,
                                 <>Paste the bot token here to create the credential.</>,
                               ]} />
                             </div>
                           );
                         case 'github':
                           return (
                             <div>
                               <Text><span className="font-semibold">Create a GitHub Access Token</span></Text>
                               <Steps items={[
                                 <>Generate a Personal Access Token (classic) with <span className="font-semibold">repo</span> read permissions.</>,
                                 <>If using GitHub App, ensure it has read access to the repositories you want indexed.</>,
                                 <>Paste the token here and save.</>,
                               ]} />
                             </div>
                           );
                         case 'gitlab':
                           return (
                             <div>
                               <Text><span className="font-semibold">Create a GitLab Access Token</span></Text>
                               <Steps items={[
                                 <>Create a Personal Access Token with <span className="font-semibold">read_api</span> scope.</>,
                                 <>Ensure the token has access to the groups/projects to index.</>,
                                 <>Paste the token here.</>,
                               ]} />
                             </div>
                           );
                         case 'confluence':
                           return (
                             <div>
                               <Text><span className="font-semibold">Confluence API Token</span></Text>
                               <Steps items={[
                                 <>Use your Confluence site URL (cloud) or base URL (server).</>,
                                 <>Create an API token (for cloud) or ensure a user with access (for server).</>,
                                 <>Provide <span className="font-semibold">URL</span>, <span className="font-semibold">Username/Email</span>, and <span className="font-semibold">API Token</span> here.</>,
                               ]} />
                             </div>
                           );
                         case 'jira':
                           return (
                             <div>
                               <Text><span className="font-semibold">Jira API Token</span></Text>
                               <Steps items={[
                                 <>Use your Jira site URL.</>,
                                 <>Create an API token and use your account email/username.</>,
                                 <>Provide <span className="font-semibold">URL</span>, <span className="font-semibold">Username/Email</span>, and <span className="font-semibold">API Token</span>.</>,
                               ]} />
                             </div>
                           );
                         case 'zendesk':
                           return (
                             <div>
                               <Text><span className="font-semibold">Zendesk API Token</span></Text>
                               <Steps items={[
                                 <>In Zendesk Admin, enable API token access and generate a token.</>,
                                 <>Provide <span className="font-semibold">Subdomain</span>, <span className="font-semibold">Email</span>, and <span className="font-semibold">API Token</span>.</>,
                               ]} />
                             </div>
                           );
                         case 'asana':
                           return (
                             <div>
                               <Text><span className="font-semibold">Asana Personal Access Token</span></Text>
                               <Steps items={[
                                 <>Create an Asana Personal Access Token.</>,
                                 <>Paste the token into the API Token field and save.</>,
                               ]} />
                             </div>
                           );
                         case 'airtable':
                           return (
                             <div>
                               <Text><span className="font-semibold">Airtable API Key</span></Text>
                               <Steps items={[
                                 <>Create an Airtable API key (or token) with read access to the bases you want to index.</>,
                                 <>Paste the key here and save.</>,
                               ]} />
                             </div>
                           );
                         case 'dropbox':
                           return (
                             <div>
                               <Text><span className="font-semibold">Dropbox Access Token</span></Text>
                               <Steps items={[
                                 <>Create a Dropbox app with scoped access.</>,
                                 <>Generate an access token and paste it here.</>,
                               ]} />
                             </div>
                           );
                         case 's3':
                           return (
                             <div>
                               <Text><span className="font-semibold">Amazon S3 Credentials</span></Text>
                               <Steps items={[
                                 <>Provide <span className="font-semibold">Access Key ID</span>, <span className="font-semibold">Secret Access Key</span>, and the target <span className="font-semibold">Bucket</span> (and region if needed).</>,
                                 <>Ensure read permissions for the bucket and keys.</>,
                               ]} />
                             </div>
                           );
                         case 'r2':
                           return (
                             <div>
                               <Text><span className="font-semibold">Cloudflare R2 Credentials</span></Text>
                               <Steps items={[
                                 <>Provide R2 <span className="font-semibold">Access Key ID</span>, <span className="font-semibold">Secret Access Key</span>, and Bucket details.</>,
                                 <>Ensure read access for the bucket.</>,
                               ]} />
                             </div>
                           );
                         case 'google_cloud_storage':
                           return (
                             <div>
                               <Text><span className="font-semibold">Google Cloud Storage</span></Text>
                               <Steps items={[
                                 <>Use a Service Account JSON with access to the target GCS buckets.</>,
                                 <>Paste the JSON content here.</>,
                               ]} />
                             </div>
                           );
                         case 'oci_storage':
                           return (
                             <div>
                               <Text><span className="font-semibold">Oracle Cloud Object Storage</span></Text>
                               <Steps items={[
                                 <>Provide required credentials (Tenancy OCID, User OCID, Key Fingerprint, Private Key) and bucket details.</>,
                               ]} />
                             </div>
                           );
                         case 'sharepoint':
                           return (
                             <div>
                               <Text><span className="font-semibold">SharePoint Credentials</span></Text>
                               <Steps items={[
                                 <>Register an app in Azure AD (app registration).</>,
                                 <>Provide <span className="font-semibold">Tenant ID</span>, <span className="font-semibold">Client ID</span>, and either <span className="font-semibold">Client Secret</span> or certificate details, plus target site info.</>,
                               ]} />
                             </div>
                           );
                         case 'gmail':
                           return (
                             <div>
                               <Text><span className="font-semibold">Gmail Access</span></Text>
                               <Bullets items={[
                                 <>Use a Google Workspace admin-provisioned OAuth or a Service Account with domain-wide delegation.</>,
                                 <>Grant scopes to read messages/threads as required.</>,
                               ]} />
                             </div>
                           );
                         case 'teams':
                           return (
                             <div>
                               <Text><span className="font-semibold">Microsoft Teams Access</span></Text>
                               <Bullets items={[
                                 <>Register an app in Azure and grant Microsoft Graph read scopes for channels/messages as permitted by your org.</>,
                                 <>Provide the app credentials accordingly.</>,
                               ]} />
                             </div>
                           );
                         case 'discord':
                           return (
                             <div>
                               <Text><span className="font-semibold">Discord Bot Token</span></Text>
                               <Steps items={[
                                 <>Create a Discord application and bot, invite it to your server with appropriate permissions.</>,
                                 <>Copy the bot token and paste here.</>,
                               ]} />
                             </div>
                           );
                         case 'zulip':
                           return (
                             <div>
                               <Text><span className="font-semibold">Zulip API Key</span></Text>
                               <Steps items={[
                                 <>Create or view your Zulip API key from your Zulip account settings.</>,
                                 <>Paste the email and API key here.</>,
                               ]} />
                             </div>
                           );
                         case 'gitbook':
                           return (
                             <div>
                               <Text className="font-semibold">GitBook Access Token</Text>
                               <Steps items={[
                                 <>Generate an access token with read permissions for your spaces.</>,
                                 <>Paste the token here.</>,
                               ]} />
                             </div>
                           );
                         case 'bookstack':
                           return (
                             <div>
                               <Text className="font-semibold">BookStack API Token</Text>
                               <Steps items={[
                                 <>Create an API token in BookStack with read access.</>,
                                 <>Provide the token here along with the instance URL if required.</>,
                               ]} />
                             </div>
                           );
                         case 'google_sites':
                         case 'google_site':
                           return (
                             <div>
                               <Text className="font-semibold">Google Sites</Text>
                               <Bullets items={[
                                 <>Use a Google credential (Service Account or OAuth) with access to the Sites you want to index.</>,
                               ]} />
                             </div>
                           );
                         case 'guru':
                           return (
                             <div>
                               <Text className="font-semibold">Guru API Token</Text>
                               <Steps items={[
                                 <>Create an API token with read access to collections.</>,
                                 <>Paste the token here.</>,
                               ]} />
                             </div>
                           );
                         case 'slab':
                           return (
                             <div>
                               <Text className="font-semibold">Slab API Token</Text>
                               <Steps items={[
                                 <>Generate an API token with read access.</>,
                                 <>Paste the token here.</>,
                               ]} />
                             </div>
                           );
                         case 'salesforce':
                           return (
                             <div>
                               <Text className="font-semibold">Salesforce</Text>
                               <Bullets items={[
                                 <>Use a Connected App and provide OAuth credentials or a refresh token with read permissions to target objects.</>,
                               ]} />
                             </div>
                           );
                         case 'hubspot':
                           return (
                             <div>
                               <Text className="font-semibold">HubSpot</Text>
                               <Bullets items={[
                                 <>Create a Private App and generate an access token with read scopes.</>,
                               ]} />
                             </div>
                           );
                         case 'gong':
                         case 'fireflies':
                           return (
                             <div>
                               <Text className="font-semibold">Voice/Call Platform Access</Text>
                               <Bullets items={[
                                 <>Generate an API token in your account with read access to transcripts/recordings.</>,
                                 <>Paste the token here.</>,
                               ]} />
                             </div>
                           );
                         case 'egnyte':
                           return (
                             <div>
                               <Text className="font-semibold">Egnyte</Text>
                               <Bullets items={[
                                 <>Provide your domain and an access token or OAuth credentials with read permissions.</>,
                               ]} />
                             </div>
                           );
                                                 case 'web':
                          return (
                            <div>
                              <Text className="font-semibold">Web Scraper</Text>
                              <Bullets items={[
                                <>Provide the start URL(s) and optional rules (depth, include/exclude patterns) depending on configuration.</>,
                              ]} />
                            </div>
                          );
                        case 'axero':
                          return (
                            <div>
                              <Text className="font-semibold">Axero</Text>
                              <Bullets items={[
                                <>Use an API key or OAuth app with read access to communities/spaces you wish to index.</>,
                              ]} />
                            </div>
                          );
                        case 'wikipedia':
                          return (
                            <div>
                              <Text className="font-semibold">Wikipedia</Text>
                              <Bullets items={[
                                <>No credential typically required. Configure the pages or categories to include and language(s) if applicable.</>,
                              ]} />
                            </div>
                          );
                        case 'mediawiki':
                          return (
                            <div>
                              <Text className="font-semibold">MediaWiki</Text>
                              <Bullets items={[
                                <>Provide the MediaWiki base URL and a user API token or bot credentials with read access.</>,
                              ]} />
                            </div>
                          );
                        case 'document360':
                          return (
                            <div>
                              <Text className="font-semibold">Document360</Text>
                              <Bullets items={[
                                <>Generate an API token with read access to your knowledge base; paste the token here.</>,
                              ]} />
                            </div>
                          );
                        case 'clickup':
                          return (
                            <div>
                              <Text className="font-semibold">ClickUp</Text>
                              <Bullets items={[
                                <>Create a Personal API Token with read permissions for spaces/folders/lists you want to index; paste it here.</>,
                              ]} />
                            </div>
                          );
                        case 'linear':
                          return (
                            <div>
                              <Text className="font-semibold">Linear</Text>
                              <Bullets items={[
                                <>Create a Personal API Key with read access; paste it here.</>,
                              ]} />
                            </div>
                          );
                        case 'productboard':
                          return (
                            <div>
                              <Text className="font-semibold">Productboard</Text>
                              <Bullets items={[
                                <>Generate an API token with read access to products/notes; paste it here.</>,
                              ]} />
                            </div>
                          );
                        case 'freshdesk':
                          return (
                            <div>
                              <Text className="font-semibold">Freshdesk</Text>
                              <Bullets items={[
                                <>Provide your Freshdesk domain and an API key from your profile settings; paste the API key here.</>,
                              ]} />
                            </div>
                          );
                        case 'highspot':
                          return (
                            <div>
                              <Text className="font-semibold">Highspot</Text>
                              <Bullets items={[
                                <>Use an API token with read access to content; paste it here.</>,
                              ]} />
                            </div>
                          );
                        case 'loopio':
                          return (
                            <div>
                              <Text className="font-semibold">Loopio</Text>
                              <Bullets items={[
                                <>Generate an API token with read access to your library/projects; paste it here.</>,
                              ]} />
                            </div>
                          );
                        case 'xenforo':
                          return (
                            <div>
                              <Text className="font-semibold">XenForo</Text>
                              <Bullets items={[
                                <>Provide XenForo API base URL and an API key with read permissions; paste it here.</>,
                              ]} />
                            </div>
                          );
                        case 'gitbook':
                          return (
                            <div>
                              <Text className="font-semibold">GitBook Access Token</Text>
                              <Steps items={[
                                <>Generate an access token with read permissions for your spaces.</>,
                                <>Paste the token here.</>,
                              ]} />
                            </div>
                          );
                        default:
                          return (
                            <div>
                              <Text className="font-semibold">How to obtain credentials</Text>
                              <Text>Use your source system's admin panel to generate an API key/token or app credentials with read access, then paste them here to create a credential in contentbuilder.</Text>
                            </div>
                          );
                       }
                     })()}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close"
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