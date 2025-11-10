"use client";

import { AuthTypeMetadata } from "@/lib/userSS";
import { LoginText } from "./LoginText";
import Link from "next/link";
import { SignInButton } from "./SignInButton";
import { EmailPasswordForm } from "./EmailPasswordForm";
import { NEXT_PUBLIC_FORGOT_PASSWORD_ENABLED } from "@/lib/constants";
import Title from "@/components/ui/title";
import { useSendAuthRequiredMessage } from "@/lib/extension/utils";
import { useState } from "react";

export default function LoginPage({
  authUrl,
  authTypeMetadata,
  nextUrl,
  searchParams,
  hidePageRedirect,
}: {
  authUrl: string | null;
  authTypeMetadata: AuthTypeMetadata | null;
  nextUrl: string | null;
  searchParams:
    | {
        [key: string]: string | string[] | undefined;
      }
    | undefined;
  hidePageRedirect?: boolean;
}) {
  useSendAuthRequiredMessage();
  const [formStep, setFormStep] = useState(1);
  return (
    <div className="flex flex-col w-full justify-center">
      {authUrl &&
        authTypeMetadata &&
        authTypeMetadata.authType !== "cloud" &&
        // basic auth is handled below w/ the EmailPasswordForm
        authTypeMetadata.authType !== "basic" && (
          <>
          <h2
            className="mb-6 text-center text-3xl font-bold text-[#0F58F9]"
            style={{ fontFamily: "'Public Sans', sans-serif" }}
          >
              <LoginText />
            </h2>
            <p className="text-center text-[15px] text-gray-900">Enter your email below to create your account</p>
            <SignInButton
              authorizeUrl={authUrl}
              authType={authTypeMetadata?.authType}
            />
          </>
        )}

      {authTypeMetadata?.authType === "cloud" && (
        <div className="w-full justify-center">
        <h2
          className="mb-0 text-center text-[26px] font-bold text-[#0F58F9]"
          style={{ fontFamily: "'Public Sans', sans-serif" }}
        >
            <LoginText />
          </h2>
          <p className="text-center mb-6 text-[15px] text-gray-900">Enter your email below to create your account</p>
          <EmailPasswordForm
            shouldVerify={true}
            nextUrl={nextUrl}
            onStepChange={setFormStep}
          />
          {NEXT_PUBLIC_FORGOT_PASSWORD_ENABLED && (
            <div className="flex mt-4 justify-center">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 font-semibold"
              >
                Forgot your password? Click here
              </Link>
            </div>
          )}
          {formStep === 1 && authUrl && authTypeMetadata && (
            <>
              <div className="flex items-center w-full my-10">
                <div className="flex-grow border-t-2 border-[#E4E4E7]"></div>
                <span className="px-4 text-[13px] text-gray-900">OR CONTINUE WITH</span>
                <div className="flex-grow border-t-2 border-[#E4E4E7]"></div>
              </div>

              <SignInButton
                authorizeUrl={authUrl}
                authType={authTypeMetadata?.authType}
              />
            </>
          )}
        </div>
      )}

      {authTypeMetadata?.authType === "basic" && (
        <>
          <div className="flex">
            <Title size="xl" className="mb-2 text-center font-bold text-gray-900">
              <LoginText />
            </Title>
          </div>
          <EmailPasswordForm nextUrl={nextUrl} />
          {NEXT_PUBLIC_FORGOT_PASSWORD_ENABLED && (
            <div className="flex mt-4 justify-center">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 font-semibold"
              >
                Forgot your password? Click here
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
