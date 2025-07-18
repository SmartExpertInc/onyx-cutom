import { User } from "./types";

export const checkUserIsNoAuthUser = (userId: string) => {
  return userId === "__no_auth_user__";
};

export const logout = async (): Promise<Response> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  return response;
}; 