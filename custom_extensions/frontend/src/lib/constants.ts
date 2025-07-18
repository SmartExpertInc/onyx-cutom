export type AuthType =
  | "disabled"
  | "basic"
  | "google_oauth"
  | "oidc"
  | "saml"
  | "cloud";

export const LOGOUT_DISABLED =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_DISABLE_LOGOUT?.toLowerCase() === "true";

export const NEXT_PUBLIC_CLOUD_ENABLED =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_CLOUD_ENABLED?.toLowerCase() === "true"; 