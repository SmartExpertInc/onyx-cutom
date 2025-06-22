import { redirect } from "next/navigation";
import { getCurrentUserSS } from "@/lib/userSS";

export default async function Page() {
  // Attempt to fetch the current user using the same helper the rest of the
  // application uses. If we do NOT get a valid user object we assume the
  // visitor is unauthenticated and send them to the login page.

  const user = await getCurrentUserSS();

  if (!user || !user.is_active || user.is_anonymous_user) {
    return redirect("/auth/login");
  }

  // User is authenticated – take them straight to the Projects UI.
  redirect("/custom-projects-ui/projects");
}
