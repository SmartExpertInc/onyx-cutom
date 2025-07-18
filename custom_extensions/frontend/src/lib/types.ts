export enum UserRole {
  LIMITED = "limited",
  BASIC = "basic",
  ADMIN = "admin",
  CURATOR = "curator",
  GLOBAL_CURATOR = "global_curator",
  EXT_PERM_USER = "ext_perm_user",
  SLACK_USER = "slack_user",
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  role: UserRole;
  is_anonymous_user?: boolean;
} 