import { AuthType } from "./constants";

export interface AuthTypeMetadata {
  authType: AuthType;
  autoRedirect: boolean;
  requiresVerification: boolean;
  anonymousUserEnabled: boolean | null;
}

// Mock implementation - replace with actual backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

function buildUrl(path: string): string {
  if (path.startsWith("/")) {
    return `${BACKEND_URL}${path}`;
  }
  return `${BACKEND_URL}/${path}`;
}

export const getAuthTypeMetadataSS = async (): Promise<AuthTypeMetadata> => {
  try {
    const res = await fetch(buildUrl("/auth/type"));
    if (!res.ok) {
      // Return default values if backend is not available
      return {
        authType: "basic",
        autoRedirect: false,
        requiresVerification: false,
        anonymousUserEnabled: false,
      };
    }

    const data: {
      auth_type: string;
      requires_verification: boolean;
      anonymous_user_enabled: boolean | null;
    } = await res.json();

    return {
      authType: data.auth_type as AuthType,
      autoRedirect: false,
      requiresVerification: data.requires_verification,
      anonymousUserEnabled: data.anonymous_user_enabled,
    };
  } catch (error) {
    console.error("Failed to fetch auth metadata:", error);
    // Return default values if fetch fails
    return {
      authType: "basic",
      autoRedirect: false,
      requiresVerification: false,
      anonymousUserEnabled: false,
    };
  }
};

const logoutStandardSS = async (headers: Headers): Promise<Response> => {
  return await fetch(buildUrl("/auth/logout"), {
    method: "POST",
    headers: headers,
  });
};

const logoutSAMLSS = async (headers: Headers): Promise<Response> => {
  return await fetch(buildUrl("/auth/saml/logout"), {
    method: "POST",
    headers: headers,
  });
};

export const logoutSS = async (
  authType: AuthType,
  headers: Headers
): Promise<Response | null> => {
  switch (authType) {
    case "disabled":
      return null;
    case "saml": {
      return await logoutSAMLSS(headers);
    }
    default: {
      return await logoutStandardSS(headers);
    }
  }
}; 