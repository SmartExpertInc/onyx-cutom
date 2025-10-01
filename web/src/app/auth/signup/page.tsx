import { HealthCheckBanner } from "@/components/health/healthcheck";
import { User } from "@/lib/types";
import {
  getCurrentUserSS,
  getAuthTypeMetadataSS,
  AuthTypeMetadata,
  getAuthUrlSS,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import { EmailPasswordForm } from "../login/EmailPasswordForm";
import { SignInButton } from "../login/SignInButton";
import AuthFlowContainer from "@/components/auth/AuthFlowContainer";
import FeatureHighlights from "@/components/auth/FeatureHighlights";
import SignupFormContainer from "@/components/auth/SignupFormContainer";
import ReferralSourceSelector from "./ReferralSourceSelector";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";

const Page = async (props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const nextUrl = Array.isArray(searchParams?.next)
    ? searchParams?.next[0]
    : searchParams?.next || null;

  const defaultEmail = Array.isArray(searchParams?.email)
    ? searchParams?.email[0]
    : searchParams?.email || null;

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
  const cloud = authTypeMetadata?.authType === "cloud";

  // only enable this page if basic login is enabled
  if (authTypeMetadata?.authType !== "basic" && !cloud) {
    return redirect("/custom-projects-ui/projects");
  }

  let authUrl: string | null = null;
  if (cloud && authTypeMetadata) {
    authUrl = await getAuthUrlSS(authTypeMetadata.authType, null);
  }

  return (
    <div className="p-4 flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, oklch(0.8576 0.0809 315.9) 0%, oklch(0.8341 0.071 266.01) 50%, oklch(0.9529 0.0286 329.29) 100%)' }}>
      <HealthCheckBanner />
      <AuthErrorDisplay searchParams={searchParams} />
      
      <div className="w-full max-w-6xl flex gap-8 items-center justify-center">
        <FeatureHighlights />
        <SignupFormContainer>
          <h2 className="text-center text-xl font-bold text-neutral-900">
            {cloud ? "Complete your sign up" : "Sign Up for Contentbuilder"}
          </h2>
          {cloud && (
            <>
              <div className="w-full flex flex-col items-center space-y-4 mb-4 mt-4">
                <ReferralSourceSelector />
              </div>
            </>
          )}

          <EmailPasswordForm
            isSignup
            shouldVerify={authTypeMetadata?.requiresVerification}
            nextUrl={nextUrl}
            defaultEmail={defaultEmail}
          />
          {cloud && authUrl && (
            <div className="w-full justify-center">
              <div className="flex items-center w-full my-4">
                <div className="flex-grow border-t border-background-300"></div>
                <span className="px-4 text-neutral-900">or</span>
                <div className="flex-grow border-t border-background-300"></div>
              </div>
              <SignInButton authorizeUrl={authUrl} authType="cloud" />
            </div>
          )}
        </SignupFormContainer>
      </div>
    </div>
  );
};

export default Page;
