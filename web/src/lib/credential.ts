import { CredentialBase } from "./connectors/credentials";
import { AccessType } from "@/lib/types";

export async function createCredential(credential: CredentialBase<any>) {
  return await fetch(`/api/manage/credential`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credential),
  });
}

export async function adminDeleteCredential<T>(credentialId: number) {
  return await fetch(`/api/manage/admin/credential/${credentialId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteCredential<T>(
  credentialId: number,
  force?: boolean
) {
  return await fetch(`/api/manage/credential/${credentialId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function forceDeleteCredential<T>(credentialId: number) {
  return await fetch(`/api/manage/credential/force/${credentialId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function linkCredential(
  connectorId: number,
  credentialId: number,
  name?: string,
  accessType?: AccessType,
  groups?: number[],
  autoSyncOptions?: Record<string, any>,
  isSmartDriveConnector?: boolean
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add Smart Drive header if this is a Smart Drive connector
  if (isSmartDriveConnector) {
    headers["x-smart-drive-credential"] = "true";
  }
  
  return fetch(
    `/api/manage/connector/${connectorId}/credential/${credentialId}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: name || null,
        access_type: accessType !== undefined ? accessType : "public",
        groups: groups || null,
        auto_sync_options: autoSyncOptions || null,
      }),
    }
  );
}

export function updateCredential(credentialId: number, newDetails: any) {
  const name = newDetails.name;
  const details = Object.fromEntries(
    Object.entries(newDetails).filter(
      ([key, value]) => key !== "name" && value !== ""
    )
  );
  return fetch(`/api/manage/admin/credential/${credentialId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      credential_json: details,
    }),
  });
}

export function swapCredential(newCredentialId: number, connectorId: number) {
  return fetch(`/api/manage/admin/credential/swap`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      new_credential_id: newCredentialId,
      connector_id: connectorId,
    }),
  });
}
