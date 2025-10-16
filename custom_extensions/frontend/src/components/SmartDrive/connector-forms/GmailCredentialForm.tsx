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

interface GmailCredentialFormProps {
  onCredentialCreated: (credential: Credential) => void;
  onCancel: () => void;
}

const GMAIL_AUTH_IS_ADMIN_COOKIE_NAME = "gmail_auth_is_admin";

const GmailCredentialForm: FC<GmailCredentialFormProps> = ({
  onCredentialCreated,
  onCancel,
}) => {
  return (
    <BaseGoogleCredentialForm
      connectorId="gmail"
      connectorName="Gmail"
      authCookieName={GMAIL_AUTH_IS_ADMIN_COOKIE_NAME}
      onCredentialCreated={onCredentialCreated}
      onCancel={onCancel}
    />
  );
};

export default GmailCredentialForm;
