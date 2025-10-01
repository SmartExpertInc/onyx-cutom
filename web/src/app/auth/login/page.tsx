import { HealthCheckBanner } from "@/components/health/healthcheck";
import { User } from "@/lib/types";
import {
  getCurrentUserSS,
  getAuthUrlSS,
  getAuthTypeMetadataSS,
  AuthTypeMetadata,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import FeatureHighlights from "@/components/auth/FeatureHighlights";
import LoginPage from "./LoginPage";
import { Logo } from "@/components/logo/Logo";

const Page = async (props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const autoRedirectDisabled = searchParams?.disableAutoRedirect === "true";
  const nextUrl = Array.isArray(searchParams?.next)
    ? searchParams?.next[0]
    : searchParams?.next || null;

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
    console.log("Login page: User is logged in, redirecting to chat", {
      userId: currentUser.id,
      is_active: currentUser.is_active,
      is_anonymous: currentUser.is_anonymous_user,
    });

    if (authTypeMetadata?.requiresVerification && !currentUser.is_verified) {
      return redirect("/auth/waiting-on-verification");
    }

    // Add a query parameter to indicate this is a redirect from login
    // This will help prevent redirect loops
    return redirect("/custom-projects-ui/projects?from=login");
  }

  // get where to send the user to authenticate
  let authUrl: string | null = null;
  if (authTypeMetadata) {
    try {
      authUrl = await getAuthUrlSS(authTypeMetadata.authType, nextUrl!);
    } catch (e) {
      console.log(`Some fetch failed for the login page - ${e}`);
    }
  }

  if (authTypeMetadata?.autoRedirect && authUrl && !autoRedirectDisabled) {
    return redirect(authUrl);
  }

  return (
    <div className="p-4 flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, oklch(0.8576 0.0809 315.9) 0%, oklch(0.8341 0.071 266.01) 50%, oklch(0.9529 0.0286 329.29) 100%)' }}>
      <HealthCheckBanner />
      
      <div className="w-full max-w-6xl flex gap-8 items-center justify-center">
        <FeatureHighlights />
        <div className="flex-1 max-w-md pt-8 pb-6 px-8 gap-y-4 flex items-center dark:border-none flex-col rounded-2xl hover:shadow-xl border border-gray-100 gap-y-2 transition-all duration-200" style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(40px)', boxShadow: '0px 4px 8px 0px #00000014, -4px -4px 4px -4px #FFFFFF inset, 4px 4px 4px -4px #FFFFFF inset' }}>
          <Logo width={50} height={50} />
          <div className="mt-4 w-full">
            <LoginPage
              authUrl={authUrl}
              authTypeMetadata={authTypeMetadata}
              nextUrl={nextUrl!}
              searchParams={searchParams}
              hidePageRedirect={true}
            />
          </div>
          <div className="text-sm mt-4 text-center w-full text-text-800 font-medium">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
            >
              Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
