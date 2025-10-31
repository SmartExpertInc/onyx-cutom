"use client";

import { AuthTypeMetadata } from "@/lib/userSS";
import { LoginText } from "./LoginText";
import Link from "next/link";
import { SignInButton } from "./SignInButton";
import { EmailPasswordForm } from "./EmailPasswordForm";
import { NEXT_PUBLIC_FORGOT_PASSWORD_ENABLED } from "@/lib/constants";
import Title from "@/components/ui/title";
import { useSendAuthRequiredMessage } from "@/lib/extension/utils";

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
  return (
    <div className="flex flex-col w-full justify-center">
      {authUrl &&
        authTypeMetadata &&
        authTypeMetadata.authType !== "cloud" &&
        // basic auth is handled below w/ the EmailPasswordForm
        authTypeMetadata.authType !== "basic" && (
          <>
            <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
              <LoginText />
            </h2>
            <SignInButton
              authorizeUrl={authUrl}
              authType={authTypeMetadata?.authType}
            />
          </>
        )}

      {authTypeMetadata?.authType === "cloud" && (
        <div className="w-full justify-center">
          <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
            <LoginText />
          </h2>
          <EmailPasswordForm shouldVerify={true} nextUrl={nextUrl} />
          {NEXT_PUBLIC_FORGOT_PASSWORD_ENABLED && (
            <div className="flex mt-4 justify-center">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 font-semibold"
              >
                Reset Password
              </Link>
            </div>
          )}
          {authUrl && authTypeMetadata && (
            <>
              <div className="flex items-center w-full my-4">
                <div className="flex-grow border-t-2 border-[#d1d5db]"></div>
                <span className="px-4 text-gray-900">or</span>
                <div className="flex-grow border-t-2 border-[#d1d5db]"></div>
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
                Reset Password
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
