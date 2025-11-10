"use client";

import { TextFormField } from "@/components/admin/connectors/Field";
import { usePopup } from "@/components/admin/connectors/Popup";
import { basicLogin, basicSignup } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { requestEmailVerification } from "../lib";
import { useMemo, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { NEXT_PUBLIC_FORGOT_PASSWORD_ENABLED } from "@/lib/constants";
import Link from "next/link";
import { useUser } from "@/components/user/UserProvider";
import { identifyUser, trackSignUp, resetUser } from "@/lib/mixpanelClient";
import { Eye } from "lucide-react";

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
  const [isWorking, setIsWorking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const multiStep = isSignup;
  const [step, setStep] = useState(multiStep ? 1 : 2);
  const validationSchema = useMemo(() => {
    const shape: Record<string, Yup.AnySchema> = {
      email: Yup.string()
        .email()
        .required()
        .transform((value) => value.toLowerCase()),
    };
    if (!multiStep || step === 2) {
      shape.password = Yup.string().required();
      if (multiStep) {
        shape.confirmPassword = Yup.string()
          .required("Confirm password is required")
          .oneOf([Yup.ref("password")], "Passwords must match");
        shape.firstName = Yup.string().trim().required("First name is required");
        shape.lastName = Yup.string().trim().required("Last name is required");
      }
    } else {
      shape.password = Yup.string();
      shape.confirmPassword = Yup.string();
      shape.firstName = Yup.string();
      shape.lastName = Yup.string();
    }
    return Yup.object().shape(shape);
  }, [multiStep, step]);
  return (
    <>
      {isWorking && <Spinner />}
      {popup}
      <Formik
        initialValues={{
          email: defaultEmail ? defaultEmail.toLowerCase() : "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, actions) => {
          // Ensure email is lowercase
          const email = values.email.toLowerCase();
          actions.setFieldValue("email", email, false);

          if (multiStep && step === 1) {
            setStep(2);
            actions.setSubmitting(false);
            return;
          }

          if (isSignup) {
            // login is fast, no need to show a spinner
            setIsWorking(true);
            const response = await basicSignup(
              email,
              values.password,
              referralSource,
              values.firstName.trim(),
              values.lastName.trim()
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
            {(!multiStep || step === 1) && (
              <TextFormField
                name="email"
                label="Email"
                type="email"
                placeholder="name@example.com"
                className="!bg-[#ffffff] hover:shadow-md transition-shadow !border-[#d4d4d4] !text-gray-900 !placeholder-[#A5A5A5] !rounded-md"
                labelClassName="!font-normal"
              />
            )}

            {(!multiStep || step === 2) && (
              <>
                <TextFormField
                  name="password"
                  label={multiStep ? "" : "Password"}
                  type={showPassword ? "text" : "password"}
                  placeholder={multiStep ? "Password" : "**************"}
                  className="!bg-[#ffffff] !shadow-none !hover:shadow-none !focus:shadow-none transition-shadow !border-[#d4d4d4] !text-gray-900 !placeholder-[#A5A5A5] !rounded-md !pr-12 !font-mono [-webkit-text-security:asterisks] [text-security:asterisks]"
                  labelClassName="!font-normal"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4 text-[#E4E4E7]" strokeWidth={1.5} />
                      ) : (
                        <svg
                          width="16"
                          height="13"
                          viewBox="0 0 16 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.8906 0.509766C13.9033 0.522692 13.9032 0.54366 13.8906 0.556641L11.5938 2.85352L12.1719 3.17578C13.4354 3.88074 14.5118 4.89997 15.334 6.13281L15.4951 6.38281C15.5016 6.39359 15.5018 6.4073 15.4951 6.41797C13.8897 8.98655 11.2126 10.7002 8 10.7002C6.85106 10.7002 5.77421 10.4817 4.79199 10.0859L4.48535 9.96191L2.15723 12.29C2.1442 12.3031 2.1224 12.3031 2.10938 12.29C2.09675 12.277 2.0967 12.2561 2.10938 12.2432L3.93848 10.415L4.40625 9.94727L3.82812 9.62402C2.48048 8.87208 1.34544 7.76282 0.504883 6.41797C0.498223 6.40731 0.498383 6.39357 0.504883 6.38281C2.11031 3.81412 4.78731 2.09961 8 2.09961C9.14902 2.09961 10.2257 2.319 11.208 2.71484L11.5146 2.83789L11.749 2.60449L13.8428 0.509766C13.8492 0.503351 13.8578 0.500114 13.8662 0.5L13.8906 0.509766ZM4.51172 9.93555L5.27637 10.1924C6.1288 10.479 7.04188 10.6338 8 10.6338C11.0606 10.6338 13.6336 9.06538 15.2451 6.67969L15.4346 6.40039L15.2451 6.12012C14.3729 4.82889 13.2185 3.77623 11.8535 3.08203L11.5303 2.91699L4.51172 9.93555ZM8 2.16699C4.93938 2.16699 2.36643 3.73439 0.754883 6.12012L0.56543 6.40039L0.754883 6.67969C1.62711 7.97092 2.78136 9.0246 4.14648 9.71875L4.46973 9.88281L11.4883 2.86426L10.7236 2.60742C9.87121 2.32082 8.95809 2.16699 8 2.16699Z"
                            fill="#E4E4E7"
                            stroke="#E4E4E7"
                          />
                        </svg>
                      )}
                    </button>
                  }
                />
              </>
            )}

            {multiStep && step === 2 && (
              <>
                <TextFormField
                  name="confirmPassword"
                  label=""
                  type="password"
                  placeholder="Confirm password"
                  className="!bg-[#ffffff] !shadow-none !hover:shadow-none !focus:shadow-none transition-shadow !border-[#d4d4d4] !text-gray-900 !placeholder-[#A5A5A5] !rounded-md !font-mono [-webkit-text-security:asterisks] [text-security:asterisks]"
                  labelClassName="!font-normal"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4 text-[#E4E4E7]" strokeWidth={1.5} />
                      ) : (
                        <svg
                          width="16"
                          height="13"
                          viewBox="0 0 16 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.8906 0.509766C13.9033 0.522692 13.9032 0.54366 13.8906 0.556641L11.5938 2.85352L12.1719 3.17578C13.4354 3.88074 14.5118 4.89997 15.334 6.13281L15.4951 6.38281C15.5016 6.39359 15.5018 6.4073 15.4951 6.41797C13.8897 8.98655 11.2126 10.7002 8 10.7002C6.85106 10.7002 5.77421 10.4817 4.79199 10.0859L4.48535 9.96191L2.15723 12.29C2.1442 12.3031 2.1224 12.3031 2.10938 12.29C2.09675 12.277 2.0967 12.2561 2.10938 12.2432L3.93848 10.415L4.40625 9.94727L3.82812 9.62402C2.48048 8.87208 1.34544 7.76282 0.504883 6.41797C0.498223 6.40731 0.498383 6.39357 0.504883 6.38281C2.11031 3.81412 4.78731 2.09961 8 2.09961C9.14902 2.09961 10.2257 2.319 11.208 2.71484L11.5146 2.83789L11.749 2.60449L13.8428 0.509766C13.8492 0.503351 13.8578 0.500114 13.8662 0.5L13.8906 0.509766ZM4.51172 9.93555L5.27637 10.1924C6.1288 10.479 7.04188 10.6338 8 10.6338C11.0606 10.6338 13.6336 9.06538 15.2451 6.67969L15.4346 6.40039L15.2451 6.12012C14.3729 4.82889 13.2185 3.77623 11.8535 3.08203L11.5303 2.91699L4.51172 9.93555ZM8 2.16699C4.93938 2.16699 2.36643 3.73439 0.754883 6.12012L0.56543 6.40039L0.754883 6.67969C1.62711 7.97092 2.78136 9.0246 4.14648 9.71875L4.46973 9.88281L11.4883 2.86426L10.7236 2.60742C9.87121 2.32082 8.95809 2.16699 8 2.16699Z"
                            fill="#E4E4E7"
                            stroke="#E4E4E7"
                          />
                        </svg>
                      )}
                    </button>
                  }
                />
                <TextFormField
                  name="firstName"
                  label=""
                  type="text"
                  placeholder="First name"
                  className="!bg-[#ffffff] !shadow-none !hover:shadow-none !focus:shadow-none transition-shadow !border-[#d4d4d4] !text-gray-900 !placeholder-[#A5A5A5] !rounded-md"
                  labelClassName="!font-normal"
                />
                <TextFormField
                  name="lastName"
                  label=""
                  type="text"
                  placeholder="Last name"
                  className="!bg-[#ffffff] !shadow-none !hover:shadow-none !focus:shadow-none transition-shadow !border-[#d4d4d4] !text-gray-900 !placeholder-[#A5A5A5] !rounded-md"
                  labelClassName="!font-normal"
                />
              </>
            )}

            <Button
              variant="default"
              type="submit"
              disabled={isSubmitting}
              className="mx-auto !py-2 !px-4 !h-auto w-full hover:shadow-md transition-shadow -mt-2 !bg-[#0F58F9] !text-[#ffffff] !rounded-md"
            >
              {multiStep && step === 1
                ? "Create Account"
                : isJoin
                ? "Join"
                : isSignup
                ? "Create Account"
                : "Sign In"}
            </Button>
            {!isSignup && shouldVerify && (
              <Link
                href="/auth/forgot-password"
                className="text-[15px] text-[#0F58F9] -mt-2 cursor-pointer text-left w-full text-link font-medium"
              >
                Forgot password?
              </Link>
            )}
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
