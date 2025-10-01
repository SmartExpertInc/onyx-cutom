import Link from "next/link";
import { Logo } from "../logo/Logo";

interface SignupFormContainerProps {
  children: React.ReactNode;
}

export default function SignupFormContainer({ children }: SignupFormContainerProps) {
  return (
    <div className="flex-1 max-w-md pt-8 pb-6 px-8 gap-y-4 flex items-center dark:border-none flex-col rounded-2xl hover:shadow-xl border border-gray-100 gap-y-2 transition-all duration-200" style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(40px)', boxShadow: '0px 4px 8px 0px #00000014, -4px -4px 4px -4px #FFFFFF inset, 4px 4px 4px -4px #FFFFFF inset' }}>
      <Logo width={50} height={50} />
      <div className="mt-4 w-full">{children}</div>
      <div className="text-sm mt-4 text-center w-full text-text-800 font-medium">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
