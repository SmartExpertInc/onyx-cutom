import Link from "next/link";
import { Logo } from "../logo/Logo";

export default function AuthFlowContainer({
  children,
  authState,
}: {
  children: React.ReactNode;
  authState?: "signup" | "login" | "join";
}) {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, oklch(0.8576 0.0809 315.9) 0%, oklch(0.8341 0.071 266.01) 50%, oklch(0.9529 0.0286 329.29) 100%)' }}>
      <div className="w-full max-w-md pt-8 pb-6 px-8 mx-4 gap-y-4 flex items-center dark:border-none flex-col rounded-2xl hover:shadow-xl border border-gray-100 gap-y-2 transition-all duration-200" style={{ backgroundBlendMode: 'overlay', background: '#FFFFFF80, #FFFFFF1A', backdropFilter: 'blur(40px)', boxShadow: '0px 4px 8px 0px #00000014, -4px -4px 4px -4px #FFFFFF inset, 4px 4px 4px -4px #FFFFFF inset' }}>
        <Logo width={70} height={70} />
        <div className="mt-4  w-full">{children}</div>
        {authState === "login" && (
          <div className="text-sm mt-4 text-center w-full text-text-800 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
            >
              Create one
            </Link>
          </div>
        )}
        {authState === "signup" && (
          <div className="text-sm mt-4 text-center w-full text-text-800 font-medium">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
