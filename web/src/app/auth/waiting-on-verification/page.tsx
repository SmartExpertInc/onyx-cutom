import {
  AuthTypeMetadata,
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import { User } from "@/lib/types";
import Text from "@/components/ui/text";
import { RequestNewVerificationEmail } from "./RequestNewVerificationEmail";
import { Logo } from "@/components/logo/Logo";
// keep layout minimal; apply the same gradient background as signup

export default async function Page() {
  // catch cases where the backend is completely unreachable here
  // without try / catch, will just raise an exception and the page
  // will not render
  let authTypeMetadata: AuthTypeMetadata | null = null;
  let currentUser: User | null = null;
  try {
    [authTypeMetadata, currentUser] = await Promise.all([
      getAuthTypeMetadataSS(),
      getCurrentUserSS(),
    ]);
  } catch (e) {
    console.log(`Some fetch failed for the login page - ${e}`);
  }

  if (!currentUser) {
    if (authTypeMetadata?.authType === "disabled") {
      return redirect("/custom-projects-ui/projects");
    }
    return redirect("/auth/login");
  }

  if (!authTypeMetadata?.requiresVerification || currentUser.is_verified) {
    return redirect("/custom-projects-ui/projects");
  }

  return (
    <main>
      <div className="absolute top-10x w-full">
        <HealthCheckBanner />
      </div>
      <div
        className="p-4 flex flex-col items-center justify-center min-h-screen"
      >
        <div className="w-full max-w-md pt-8 pb-6 px-8 mx-4 gap-y-4 flex items-center flex-col rounded-2xl hover:shadow-xl backdrop-blur-md bg-white/20 border border-white/30 transition-all duration-200">
          <Logo width={70} height={70} />
          <Text className="text-center font-medium text-lg mt-6 w-108">
            Hey <i>{currentUser.email}</i> - it looks like you haven&apos;t
            verified your email yet.
            <br />
            Check your inbox for an email from us to get started!
            <br />
            <br />
            If you don&apos;t see anything, click{" "}
            <RequestNewVerificationEmail email={currentUser.email}>
              here
            </RequestNewVerificationEmail>{" "}
            to request a new email.
          </Text>
        </div>
      </div>
    </main>
  );
}
