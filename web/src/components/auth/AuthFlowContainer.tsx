import Link from "next/link";
import FeatureHighlights from "./FeatureHighlights";

export default function AuthFlowContainer({
  children,
  authState,
}: {
  children: React.ReactNode;
  authState?: "signup" | "login" | "join";
}) {
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, oklch(0.8576 0.0809 315.9) 0%, oklch(0.8341 0.071 266.01) 50%, oklch(0.9529 0.0286 329.29) 100%)' }}>
      {/* Left side - Feature Highlights */}
      <div className="flex-1 flex items-center justify-center pl-[120px] pr-4 py-8">
        <FeatureHighlights />
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center pl-4 pr-[120px] py-8">
        <div className="w-full max-w-md pt-8 pb-6 px-8 gap-y-4 flex items-center flex-col rounded-2xl shadow-md hover:shadow-xl backdrop-blur-md border border-white/30 gap-y-2 transition-all duration-200" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
          <div className="w-full">{children}</div>
          {authState === "login" && (
            <div className="text-sm mt-4 text-center w-full text-gray-900 font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-600 font-semibold"
              >
                Create one
              </Link>
            </div>
          )}
          {authState === "signup" && (
            <div className="text-sm mt-4 text-center w-full text-gray-900 font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 font-semibold"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
