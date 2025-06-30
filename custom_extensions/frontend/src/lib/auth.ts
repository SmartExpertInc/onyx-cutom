import { cookies } from "next/headers";

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  is_anonymous_user?: boolean;
}

export interface AuthTypeMetadata {
  authType: string;
  autoRedirect: boolean;
  requiresVerification: boolean;
  anonymousUserEnabled: boolean | null;
}

const buildUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  return `${baseUrl}${path}`;
};

// Server-side functions
export const getAuthTypeMetadataSS = async (): Promise<AuthTypeMetadata> => {
  const res = await fetch(buildUrl("/auth/type"));
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data: {
    auth_type: string;
    requires_verification: boolean;
    anonymous_user_enabled: boolean | null;
  } = await res.json();

  const authType = data.auth_type;

  // for SAML / OIDC, we auto-redirect the user to the IdP when the user visits
  // Onyx in an un-authenticated state
  if (authType === "oidc" || authType === "saml") {
    return {
      authType,
      autoRedirect: true,
      requiresVerification: data.requires_verification,
      anonymousUserEnabled: data.anonymous_user_enabled,
    };
  }
  return {
    authType,
    autoRedirect: false,
    requiresVerification: data.requires_verification,
    anonymousUserEnabled: data.anonymous_user_enabled,
  };
};

export const getCurrentUserSS = async (): Promise<User | null> => {
  try {
    const response = await fetch(buildUrl("/me"), {
      credentials: "include",
      next: { revalidate: 0 },
      headers: {
        cookie: (await cookies())
          .getAll()
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; "),
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (e) {
    console.log(`Error fetching user: ${e}`);
    return null;
  }
};

// Client-side functions
export const getAuthTypeMetadata = async (): Promise<AuthTypeMetadata> => {
  const res = await fetch("/api/auth/type");
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data: {
    auth_type: string;
    requires_verification: boolean;
    anonymous_user_enabled: boolean | null;
  } = await res.json();

  const authType = data.auth_type;

  // for SAML / OIDC, we auto-redirect the user to the IdP when the user visits
  // Onyx in an un-authenticated state
  if (authType === "oidc" || authType === "saml") {
    return {
      authType,
      autoRedirect: true,
      requiresVerification: data.requires_verification,
      anonymousUserEnabled: data.anonymous_user_enabled,
    };
  }
  return {
    authType,
    autoRedirect: false,
    requiresVerification: data.requires_verification,
    anonymousUserEnabled: data.anonymous_user_enabled,
  };
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch("/api/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (e) {
    console.log(`Error fetching user: ${e}`);
    return null;
  }
}; 