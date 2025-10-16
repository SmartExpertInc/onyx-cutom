"use client";

import React, { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, CheckIcon, AlertTriangleIcon, } from "lucide-react";
import { cn, truncateString } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface Credential {
  id: number;
  name: string;
  source: string;
  credential_json: any;
  admin_public: boolean;
  curator_public: boolean;
  groups: string[] | null;
}

interface GmailCredentialFormProps {
  onCredentialCreated: (credential: Credential) => void;
  onCancel: () => void;
}

const GMAIL_AUTH_IS_ADMIN_COOKIE_NAME = "gmail_auth_is_admin";

const GmailCredentialForm: FC<GmailCredentialFormProps> = ({
  onCredentialCreated,
  onCancel,
}) => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCredentialType, setUploadedCredentialType] = useState<'app' | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [existingCredential, setExistingCredential] = useState<Credential | null>(null);
  const [isCheckingCredentials, setIsCheckingCredentials] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to refresh credential check
  const refreshCredentialCheck = async () => {
    try {
      setIsCheckingCredentials(true);
      
      // Check for existing Google Drive credentials
      const credentialsResponse = await fetch("/api/custom-projects-backend/credentials/gmail");
      if (credentialsResponse.ok) {
        const credentials = await credentialsResponse.json();
        if (Array.isArray(credentials) && credentials.length > 0) {
          const latestCredential = credentials[0];
          setExistingCredential(latestCredential);
        } else {
          setExistingCredential(null);
        }
      }

      // Check for app credentials
      const appResponse = await fetch("/api/custom-projects-backend/connector/gmail/app-credential");
      if (appResponse.ok) {
        const appData = await appResponse.json();
        if (appData.client_id) {
          setClientId(appData.client_id);
          setUploadedCredentialType('app');
        }
      }
    } catch (err) {
      console.error('Error refreshing credentials:', err);
    } finally {
      setIsCheckingCredentials(false);
    }
  };

  // Check if we have existing credentials
  useEffect(() => {
    refreshCredentialCheck();
  }, []);

  // Function to delete app credentials
  const handleDeleteCredentials = async () => {
    setIsDeleting(true);
    setError(null);

    try {      
      // Delete app credentials
      let response = await fetch("/api/custom-projects-backend/connector/gmail/app-credential", {
        method: "DELETE",
      });

      if (response.ok) {
        // Reset state
        setClientId('');
        setUploadedCredentialType(null);
        setExistingCredential(null);
        setError(null);
        
        // Refresh credential check to update existing credential status
        await refreshCredentialCheck();
      } else {
        const errorMsg = await response.text();
        setError(`Failed to delete credentials - ${errorMsg}`);
      }
    } catch (err) {
      setError(`Failed to delete credentials - ${err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      if (!loadEvent?.target?.result) {
        setIsUploading(false);
        return;
      }

      const credentialJsonStr = loadEvent.target.result as string;

      // Check credential type
      let credentialFileType: 'authorized_user' | 'service_account';
      try {
        const appCredentialJson = JSON.parse(credentialJsonStr);
        if (appCredentialJson.web) {
          credentialFileType = "authorized_user";
        } else if (appCredentialJson.type === "service_account") {
          credentialFileType = "service_account";
        } else {
          throw new Error(
            "Unknown credential type, expected one of 'OAuth Web application' or 'Service Account'"
          );
        }
      } catch (e) {
        setError(`Invalid file provided - ${e}`);
        setIsUploading(false);
        return;
      }

      try {
        if (credentialFileType === "authorized_user") {
          const response = await fetch(
            "/api/custom-projects-backend/connector/gmail/app-credential",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: credentialJsonStr,
            }
          );
          if (response.ok) {
            const data = await response.json();
            setClientId(data.client_id);
            setUploadedCredentialType('app');
            setError(null);
          } else {
            const errorMsg = await response.text();
            setError(`Failed to upload app credentials - ${errorMsg}`);
          }
        }
      } catch (err) {
        setError(`Failed to upload credentials - ${err}`);
      }
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        file !== undefined &&
        (file.type === "application/json" || file.name.endsWith(".json"))
      ) {
        handleFileUpload(file);
      } else {
        setError("Please upload a JSON file");
      }
    }
  };

  const handleOAuthAuthentication = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // Create credential first
      const credentialCreationResponse = await fetch('/api/custom-projects-backend/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'OAuth (uploaded)',
          source: 'gmail',
          credential_json: {},
          admin_public: true,
          curator_public: false,
          groups: [],
        }),
      });

      if (!credentialCreationResponse.ok) {
        throw new Error(`Failed to create credential - ${credentialCreationResponse.status}`);
      }

      const credential = await credentialCreationResponse.json();

      // Get authorization URL
      const authorizationUrlResponse = await fetch(
        `/api/custom-projects-backend/connector/gmail/authorize/${credential.id}`
      );
      if (!authorizationUrlResponse.ok) {
        throw new Error(`Failed to get authorization URL - ${authorizationUrlResponse.status}`);
      }

      const authorizationUrlJson = await authorizationUrlResponse.json();

      // Set cookie for callback
      document.cookie = `${GMAIL_AUTH_IS_ADMIN_COOKIE_NAME}=true; path=/`;

      onCredentialCreated(credential);

      // Redirect to OAuth
      router.push(authorizationUrlJson.auth_url);
    } catch (err) {
      setError(`Failed to authenticate with Gmail - ${err}`);
      setIsAuthenticating(false);
    }
  };

  // Show loading state while checking credentials
  if (isCheckingCredentials) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Checking existing credentials...</span>
        </div>
      </div>
    );
  }

  // Show existing credential status if found
  if (existingCredential) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-1">Authentication Complete</h4>
              <p className="text-sm text-green-700 mb-3">
                Your Gmail credentials have been successfully uploaded and authenticated.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Gmail Credential Setup
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          To connect your Gmail, create credentials (OAuth App only), 
          download the JSON file, and upload it below.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Upload Credentials JSON File
        </label>
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="relative flex flex-1 items-center">
              <label
                className={cn(
                  "flex h-10 items-center justify-center w-full px-4 py-2 border border-dashed rounded-md transition-colors",
                  isUploading
                    ? "opacity-70 cursor-not-allowed border-gray-400 bg-gray-50"
                    : isDragging
                      ? "bg-blue-50 border-blue-500"
                      : "cursor-pointer hover:bg-gray-50 hover:border-blue-500 border-gray-300"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex items-center space-x-2">
                  {isUploading ? (
                    <div className="h-4 w-4 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <FileIcon className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-500">
                    {isUploading
                      ? `Uploading ${truncateString(fileName || "file", 50)}...`
                      : isDragging
                        ? "Drop JSON file here"
                        : truncateString(
                            fileName || "Select or drag JSON credentials file...",
                            50
                          )}
                  </span>
                </div>
                <input
                  className="sr-only"
                  type="file"
                  accept=".json"
                  disabled={isUploading}
                  onChange={(event) => {
                    if (!event.target.files?.length) {
                      return;
                    }
                    const file = event.target.files[0];
                    if (file === undefined) {
                      return;
                    }
                    handleFileUpload(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Show uploaded credentials */}
      {(clientId) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Credentials uploaded successfully
                </p>
                <p className="text-xs text-green-600">
                  {`Client ID: ${clientId}`}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteCredentials()}
              disabled={isDeleting}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Credentials"}
            </Button>
          </div>
        </div>
      )}

      {/* OAuth Authentication */}
      {uploadedCredentialType === 'app' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Next, you need to authenticate with Gmail via OAuth. This gives us read access 
              to the emails you have access to in your Gmail account.
            </p>
          </div>
          <Button
            onClick={handleOAuthAuthentication}
            disabled={isAuthenticating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? "Authenticating..." : "Authenticate with Gmail"}
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 py-3"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default GmailCredentialForm;
