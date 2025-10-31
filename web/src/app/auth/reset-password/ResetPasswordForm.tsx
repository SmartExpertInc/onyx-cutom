"use client";

import { useState, useEffect } from "react";
import { resetPassword } from "../forgot-password/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { TextFormField } from "@/components/admin/connectors/Field";
import { usePopup } from "@/components/admin/connectors/Popup";
import { Spinner } from "@/components/Spinner";
import { useSearchParams, useRouter } from "next/navigation";
import { TENANT_ID_COOKIE_NAME } from "@/lib/constants";
import Cookies from "js-cookie";
import Text from "@/components/ui/text";

export default function ResetPasswordForm() {
  const { popup, setPopup } = usePopup();
  const [isWorking, setIsWorking] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");
  const tenantId = searchParams?.get(TENANT_ID_COOKIE_NAME);

  useEffect(() => {
    if (tenantId) {
      Cookies.set(TENANT_ID_COOKIE_NAME, tenantId, {
        path: "/",
        expires: 1 / 24,
      }); // Expires in 1 hour
    }
  }, [tenantId]);

  return (
    <>
      {isWorking && <Spinner />}
      {popup}
      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
        }}
        validationSchema={Yup.object().shape({
          password: Yup.string().required("Password is required"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), undefined], "Passwords must match")
            .required("Confirm Password is required"),
        })}
        onSubmit={async (values) => {
          if (!token) {
            setPopup({
              type: "error",
              message: "Invalid or missing reset token.",
            });
            return;
          }
          setIsWorking(true);
          try {
            await resetPassword(token, values.password);
            setPopup({
              type: "success",
              message: "Password reset successfully. Redirecting to login...",
            });
            setTimeout(() => {
              router.push("/auth/login");
            }, 1000);
          } catch (error) {
            if (error instanceof Error) {
              setPopup({
                type: "error",
                message:
                  error.message || "An error occurred during password reset.",
              });
            } else {
              setPopup({
                type: "error",
                message: "An unexpected error occurred. Please try again.",
              });
            }
          } finally {
            setIsWorking(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="w-full flex flex-col items-stretch mt-2">
            <TextFormField
              name="password"
              label="New Password"
              type="password"
              placeholder="Enter your new password"
            />
            <TextFormField
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
            />

            <div className="flex">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mx-auto w-full"
              >
                Reset Password
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      <div className="flex">
        <Text className="mt-4 mx-auto">
          <Link href="/auth/login" className="text-link font-medium">
            Back to Login
          </Link>
        </Text>
      </div>
    </>
  );
}

