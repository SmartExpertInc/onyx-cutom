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
    <div className="min-h-screen flex" style={{ background: 'white' }}>
      {/* Left side - Feature Highlights */}
      <div className="flex-1 flex items-center justify-center">
        <FeatureHighlights />
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col pr-[120px] py-8">
        <div className="flex justify-end mb-6">
          {authState === "login" && (
            <Link href="/auth/signup" className="px-3 py-1 text-[#0F58F9] border border-[#0F58F9] rounded-md">Sign up</Link>
          )}
          {authState === "signup" && (
            <Link href="/auth/login" className="px-3 py-1 text-[#0F58F9] border border-[#0F58F9] rounded-md">Sign in</Link>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center pl-27">
          <div className="w-full max-w-md gap-y-4 flex items-center flex-col gap-y-2 transition-all duration-200" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
            <div className="w-full">{children}</div>
            <p className="text-[15px] text-[#4D4D4D] text-center">By clicking continue, you agree to our <br />
            <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.</p>
            {/* {authState === "login" && (
              <div className="text-sm mt-4 text-center w-full text-gray-900 font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-600 font-semibold"
                >
                  Create one
                </Link>
              </div>
            )} */}
            {/* {authState === "signup" && (
              <div className="text-sm mt-4 text-center w-full text-gray-900 font-medium">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 font-semibold"
                >
                  Log In
                </Link>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
