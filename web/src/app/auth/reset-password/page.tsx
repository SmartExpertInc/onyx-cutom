import { HealthCheckBanner } from "@/components/health/healthcheck";
import { User } from "@/lib/types";
import {
  getCurrentUserSS,
  getAuthTypeMetadataSS,
  AuthTypeMetadata,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import AuthFlowContainer from "@/components/auth/AuthFlowContainer";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";
import ResetPasswordForm from "./ResetPasswordForm";

const Page = async (props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;

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
    console.log(`Some fetch failed for the reset password page - ${e}`);
  }

  // simply take the user to the home page if Auth is disabled
  if (authTypeMetadata?.authType === "disabled") {
    return redirect("/custom-projects-ui/projects");
  }

  // if user is already logged in, take them to the main app page
  if (currentUser && currentUser.is_active && !currentUser.is_anonymous_user) {
    if (!authTypeMetadata?.requiresVerification || currentUser.is_verified) {
      return redirect("/custom-projects-ui/projects");
    }
    return redirect("/auth/waiting-on-verification");
  }

  // only enable this page if basic login or cloud auth is enabled
  if (
    authTypeMetadata?.authType !== "basic" &&
    authTypeMetadata?.authType !== "cloud"
  ) {
    return redirect("/custom-projects-ui/projects");
  }

  return (
    <AuthFlowContainer>
      <HealthCheckBanner />
      <AuthErrorDisplay searchParams={searchParams} />

      <div className="absolute top-10x w-full"></div>
      <div className="flex w-full flex-col justify-center">
        <h2 className="text-center text-3xl font-bold text-white mb-6">
          Reset Password
        </h2>

        <ResetPasswordForm />
      </div>
    </AuthFlowContainer>
  );
};

export default Page;
