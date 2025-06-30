// custom_extensions/frontend/src/app/projects/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserSS, getAuthTypeMetadataSS } from "../../lib/auth";
import ProjectsPageClient from "./ProjectsPageClient";

export default async function ProjectsPage() {
  // Check authentication server-side
  let authTypeMetadata = null;
  let currentUser = null;
  
  try {
    [authTypeMetadata, currentUser] = await Promise.all([
      getAuthTypeMetadataSS(),
      getCurrentUserSS(),
    ]);
  } catch (e) {
    console.log(`Some fetch failed for the projects page - ${e}`);
  }

  const authDisabled = authTypeMetadata?.authType === "disabled";
  
  // If auth is not disabled and user is not authenticated, redirect to login
  if (!authDisabled && (!currentUser || !currentUser.is_active || currentUser.is_anonymous_user)) {
    return redirect("/auth/login");
  }

  // If user needs verification, redirect to verification page
  if (currentUser && !currentUser.is_verified && authTypeMetadata?.requiresVerification) {
    return redirect("/auth/waiting-on-verification");
  }

  return <ProjectsPageClient />;
}
