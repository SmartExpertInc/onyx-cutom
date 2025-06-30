// custom_extensions/frontend/src/app/projects/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getAuthTypeMetadata } from "../../lib/auth";
import ProjectsPageClient from "./ProjectsPageClient";

export default function ProjectsPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Check authentication client-side
      let authTypeMetadata = null;
      let currentUser = null;
      
      try {
        [authTypeMetadata, currentUser] = await Promise.all([
          getAuthTypeMetadata(),
          getCurrentUser(),
        ]);
      } catch (e) {
        console.log(`Some fetch failed for the projects page - ${e}`);
      }

      const authDisabled = authTypeMetadata?.authType === "disabled";
      
      // If auth is not disabled and user is not authenticated, redirect to login
      if (!authDisabled && (!currentUser || !currentUser.is_active || currentUser.is_anonymous_user)) {
        // Use window.location for client-side redirect to the main Onyx login page
        window.location.href = "/auth/login";
        return;
      }

      // If user needs verification, redirect to verification page
      if (currentUser && !currentUser.is_verified && authTypeMetadata?.requiresVerification) {
        // Use window.location for client-side redirect to the main Onyx verification page
        window.location.href = "/auth/waiting-on-verification";
        return;
      }
    };

    checkAuth();
  }, [router]);

  return <ProjectsPageClient />;
}
