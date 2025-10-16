"use client";

import React, { FC } from "react";
import BaseGoogleCredentialForm from "./BaseGoogleCredentialForm";

export interface Credential {
  id: number;
  name: string;
  source: string;
  credential_json: any;
  admin_public: boolean;
  curator_public: boolean;
  groups: string[] | null;
}

interface GoogleDriveCredentialFormProps {
  onCredentialCreated: (credential: Credential) => void;
  onCancel: () => void;
}

const GOOGLE_DRIVE_AUTH_IS_ADMIN_COOKIE_NAME = "google_drive_auth_is_admin";

const GoogleDriveCredentialForm: FC<GoogleDriveCredentialFormProps> = ({
  onCredentialCreated,
  onCancel,
}) => {
  return (
    <BaseGoogleCredentialForm
      connectorId="google_drive"
      connectorName="Google Drive"
      authCookieName={GOOGLE_DRIVE_AUTH_IS_ADMIN_COOKIE_NAME}
      onCredentialCreated={onCredentialCreated}
      onCancel={onCancel}
    />
  );
};

export default GoogleDriveCredentialForm;
