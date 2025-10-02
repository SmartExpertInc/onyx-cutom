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
import { Mail } from "lucide-react";
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
    <main style={{ background: 'linear-gradient(135deg, oklch(0.8576 0.0809 315.9) 0%, oklch(0.8341 0.071 266.01) 50%, oklch(0.9529 0.0286 329.29) 100%)' }}>
      <div className="absolute top-10x w-full">
        <HealthCheckBanner />
      </div>
      <div
        className="p-4 flex flex-col items-center justify-center min-h-screen"
      >
        <div className="w-full max-w-md pt-8 pb-6 px-8 mx-4 gap-y-4 flex items-center flex-col rounded-2xl hover:shadow-xl backdrop-blur-md bg-white/20 border border-white/30 transition-all duration-200" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
          {/* Semitransparent blue circle with mail icon */}
          <div className="w-20 h-20 rounded-full bg-[#1d4ed8] flex items-center justify-center mb-4">
            <Mail className="w-10 h-10 text-[#FFFFFF]" />
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Check your email
          </h2>
          
          {/* Content */}
          <div className="text-center space-y-4">
            <Text className="text-gray-900 font-semibold">
              Hey <i className="text-[#1d4ed8] font-semibold">{currentUser.email}</i> - it looks like you haven&apos;t verified your email yet.
            </Text>
            
            <Text className="text-gray-700 mb-4">
              Check your inbox for an email from us to get started!
            </Text>
            
            <Text className="text-gray-700">
              If you don&apos;t see anything, click{" "}
              <RequestNewVerificationEmail email={currentUser.email}>
                <span className="text-[#1d4ed8] font-semibold">here</span>
              </RequestNewVerificationEmail>{" "}
              to request a new email.
            </Text>
            
            <Text className="text-gray-700 mt-6">
              Still having trouble?{" "}
              <a href="mailto:support@example.com" className="text-[#1d4ed8]">
                Contact support
              </a>
            </Text>
          </div>
        </div>
      </div>
    </main>
  );
}
