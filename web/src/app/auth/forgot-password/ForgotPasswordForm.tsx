"use client";

import { useState } from "react";
import { forgotPassword } from "./utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { TextFormField } from "@/components/admin/connectors/Field";
import { usePopup } from "@/components/admin/connectors/Popup";
import { Spinner } from "@/components/Spinner";
import Text from "@/components/ui/text";

export default function ForgotPasswordForm() {
  const { popup, setPopup } = usePopup();
  const [isWorking, setIsWorking] = useState(false);

  return (
    <>
      {isWorking && <Spinner />}
      {popup}
      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email().required(),
        })}
        onSubmit={async (values) => {
          setIsWorking(true);
          try {
            await forgotPassword(values.email);
            setPopup({
              type: "success",
              message: "Password reset email sent. Please check your inbox.",
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An error occurred. Please try again.";
            setPopup({
              type: "error",
              message: errorMessage,
            });
          } finally {
            setIsWorking(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="w-full flex flex-col items-stretch mt-2">
            <TextFormField
              name="email"
              label="Email"
              type="email"
              placeholder="email@yourcompany.com"
            />

            <div className="flex">
              <Button
                variant="default"
                type="submit"
                disabled={isSubmitting}
                className="mx-auto !py-3 !px-4 !h-auto w-full rounded-full shadow-md hover:shadow-xl transition-shadow mt-4 !bg-[#1d4ed8] !text-[#ffffff]"
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

