"use client";

import { TextFormField } from "@/components/admin/connectors/Field";
import { usePopup } from "@/components/admin/connectors/Popup";
import { basicLogin, basicSignup } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { requestEmailVerification } from "../lib";
import { useState } from "react";
import { Spinner } from "@/components/Spinner";
import { NEXT_PUBLIC_FORGOT_PASSWORD_ENABLED } from "@/lib/constants";
import Link from "next/link";
import { useUser } from "@/components/user/UserProvider";
import { identifyUser, trackSignUp, resetUser } from "@/lib/mixpanelClient";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function EmailPasswordForm({
  isSignup = false,
  shouldVerify,
  referralSource,
  nextUrl,
  defaultEmail,
  isJoin = false,
}: {
  isSignup?: boolean;
  shouldVerify?: boolean;
  referralSource?: string;
  nextUrl?: string | null;
  defaultEmail?: string | null;
  isJoin?: boolean;
}) {
  const { user } = useUser();
  const { popup, setPopup } = usePopup();
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      {isWorking && <Spinner />}
      {popup}
      <Formik
        initialValues={{
          email: defaultEmail ? defaultEmail.toLowerCase() : "",
          password: "",
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email()
            .required()
            .transform((value) => value.toLowerCase()),
          password: Yup.string().required(),
        })}
        onSubmit={async (values) => {
          // Ensure email is lowercase
          const email = values.email.toLowerCase();

          if (isSignup) {
            // login is fast, no need to show a spinner
            setIsWorking(true);
            const response = await basicSignup(
              email,
              values.password,
              referralSource
            );

            if (!response.ok) {
              setIsWorking(false);

              const errorDetail = (await response.json()).detail;
              let errorMsg = "Unknown error";
              if (typeof errorDetail === "object" && errorDetail.reason) {
                errorMsg = errorDetail.reason;
              } else if (errorDetail === "REGISTER_USER_ALREADY_EXISTS") {
                errorMsg =
                  "An account already exists with the specified email.";
              }
              if (response.status === 429) {
                errorMsg = "Too many requests. Please try again later.";
              }
              setPopup({
                type: "error",
                message: `Failed to sign up - ${errorMsg}`,
              });
              setIsWorking(false);
              return;
            } else {
              const userJson = await response.json();
              identifyUser(userJson.id);
              trackSignUp({ "Referral Source": referralSource }, true);
              resetUser();
              setPopup({
                type: "success",
                message: "Account created successfully. Please log in.",
              });
            }
          }

          const loginResponse = await basicLogin(email, values.password);
          if (loginResponse.ok) {
            if (isSignup && shouldVerify) {
              await requestEmailVerification(email);
              // Use window.location.href to force a full page reload,
              // ensuring app re-initializes with the new state (including
              // server-side provider values)
              window.location.href = "/auth/waiting-on-verification";
            } else {
              // The searchparam is purely for multi tenant developement purposes.
              // It replicates the behavior of the case where a user
              // has signed up with email / password as the only user to an instance
              // and has just completed verification
              window.location.href = nextUrl
                ? encodeURI(nextUrl)
                : `/custom-projects-ui/projects${isSignup && !isJoin ? "?new_team=true" : ""}`;
            }
          } else {
            setIsWorking(false);
            const errorDetail = (await loginResponse.json()).detail;
            let errorMsg = "Unknown error";
            if (errorDetail === "LOGIN_BAD_CREDENTIALS") {
              errorMsg = "Invalid email or password";
            } else if (errorDetail === "NO_WEB_LOGIN_AND_HAS_NO_PASSWORD") {
              errorMsg = "Create an account to set a password";
            } else if (typeof errorDetail === "string") {
              errorMsg = errorDetail;
            }
            if (loginResponse.status === 429) {
              errorMsg = "Too many requests. Please try again later.";
            }
            setPopup({
              type: "error",
              message: `Failed to login - ${errorMsg}`,
            });
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <TextFormField
              name="email"
              label={shouldVerify ? "Email" : ""}
              type="email"
              placeholder="name@example.com"
              className="!bg-[#ffffff] hover:shadow-md transition-shadow !border-[#d4d4d4] !text-gray-900 !placeholder-[#4D4D4D] !rounded-md"
            />

            {shouldVerify && (
              <Field name="password">
                {({ field, form }: any) => {
                  const actualPassword: string = form.values.password || "";

                  const handleMaskedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (showPassword) {
                      form.setFieldValue("password", e.target.value);
                      return;
                    }

                    const inputEvent = e.nativeEvent as InputEvent;
                    const inputType = inputEvent.inputType;
                    const data = inputEvent.data ?? "";
                    let next = actualPassword;

                    switch (inputType) {
                      case "insertText":
                      case "insertCompositionText":
                      case "insertFromPaste":
                        next = next + data;
                        break;
                      case "deleteContentBackward":
                        next = next.slice(0, -1);
                        break;
                      case "deleteContentForward":
                        next = next.slice(1);
                        break;
                      case "deleteByCut":
                        next = "";
                        break;
                      default:
                        next = actualPassword;
                    }

                    form.setFieldValue("password", next);
                    window.requestAnimationFrame(() => {
                      e.target.setSelectionRange(next.length, next.length);
                    });
                  };

                  const maskedValue = showPassword
                    ? actualPassword
                    : actualPassword.replace(/./g, "*");

                  const passwordError =
                    form.touched.password && form.errors.password
                      ? form.errors.password
                      : undefined;

                  return (
                    <div className="w-full">
                      <label
                        className="block text-base font-medium text-gray-900"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="password"
                          name={field.name}
                          type="text"
                          autoComplete="off"
                          value={maskedValue}
                          onChange={handleMaskedChange}
                          onBlur={field.onBlur}
                          className="flex w-full rounded-md border border-[#d4d4d4] bg-white px-4 py-3 mt-1 text-base shadow-md hover:shadow-xl transition-shadow placeholder:text-[#4D4D4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/50 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                          ) : (
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <div className="text-error text-sm mt-1">{passwordError}</div>
                      )}
                    </div>
                  );
                }}
              </Field>
            )}

            <Button
              variant="default"
              type="submit"
              disabled={isSubmitting}
              className="mx-auto !py-2 !px-4 !h-auto w-full hover:shadow-md transition-shadow mt-0 !bg-[#0F58F9] !text-[#ffffff] !rounded-md"
            >
              {isJoin ? "Join" : isSignup ? "Sign Up" : "Sign In"}
            </Button>
            {shouldVerify && ( <p className="text-[15px] text-[#0F58F9] cursor-pointer text-left w-full text-link font-medium">Forgot password?</p>)}
            {user?.is_anonymous_user && (
              <Link
                href="/custom-projects-ui/projects"
                className="text-xs text-blue-500  cursor-pointer text-center w-full text-link font-medium mx-auto"
              >
                <span className="hover:border-b hover:border-dotted hover:border-blue-500">
                  or continue as guest
                </span>
              </Link>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
}
