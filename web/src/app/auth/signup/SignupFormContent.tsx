"use client";

import Link from "next/link";
import { useState } from "react";
import { EmailPasswordForm } from "../login/EmailPasswordForm";
import { SignInButton } from "../login/SignInButton";

export function SignupFormContent({
  cloud,
  shouldVerify,
  nextUrl,
  defaultEmail,
  authUrl,
}: {
  cloud: boolean;
  shouldVerify?: boolean;
  nextUrl?: string | null;
  defaultEmail?: string | null;
  authUrl: string | null;
}) {
  const [step, setStep] = useState(1);

  return (
    <div className="flex w-full flex-col justify-center">
      <h2 className="text-center text-[26px] font-semibold text-[#171718] md:text-[#0F58F9] pb-6 lg:pb-0 mb-0 font-public-sans">
        {cloud ? "Create an account" : "Sign Up for Contentbuilder"}
      </h2>
      {step === 1 && (
        <p className="text-center mb-6 text-[16px] text-gray-900">
          Enter your email below to create your account
        </p>
      )}

      <EmailPasswordForm
        isSignup
        shouldVerify={shouldVerify}
        nextUrl={nextUrl}
        defaultEmail={defaultEmail}
        onStepChange={setStep}
      />

      {cloud && authUrl && step === 1 && (
        <div className="w-full justify-center">
          <div className="flex items-center w-full my-10">
            <div className="flex-grow border-t-2 !border-[#d4d4d4] dark:!border-[#d4d4d4]"></div>
            <span className="px-4 text-gray-900 dark:text-gray-900 text-[13px]">
              OR CONTINUE WITH
            </span>
            <div className="flex-grow border-t-2 border-[#d4d4d4] dark:!border-[#d4d4d4]"></div>
          </div>
          <SignInButton authorizeUrl={authUrl} authType="cloud" />
          {step === 1 && (
            <div className="mt-4 block text-center text-[#4D4D4D] lg:hidden">
              Already have an account?{" "}
              <Link href="/auth/login" className="!text-[#0F58F9]">
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

