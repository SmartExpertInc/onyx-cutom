"use client";

import React, { FC } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import OnyxFormRenderer from "./OnyxFormRenderer";
import { onyxConnectorConfigs } from "./OnyxConnectorConfigs";
import { Button } from "@/components/ui/button";

export interface OnyxFormWrapperProps {
  connectorId: string;
  currentCredential?: any;
  onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void;
  onCancel?: () => void;
  initialValues?: any;
}

const OnyxFormWrapper: FC<OnyxFormWrapperProps> = ({
  connectorId,
  currentCredential,
  onSubmit,
  onCancel,
  initialValues = {},
}) => {
  const config = onyxConnectorConfigs[connectorId];
  if (!config) {
    return <div>Connector configuration not found for: {connectorId}</div>;
  }

  // Build validation schema based on connector config
  const buildValidationSchema = () => {
    const schema: any = {};

    // Add validation for all fields
    const allFields = [...config.values, ...config.advanced_values];
    
    allFields.forEach((field) => {
      if (!field.optional) {
        switch (field.type) {
          case "text":
            schema[field.name] = Yup.string().required(`${field.label} is required`);
            break;
          case "select":
            schema[field.name] = Yup.string().required(`${field.label} is required`);
            break;
          case "number":
            schema[field.name] = Yup.number().required(`${field.label} is required`);
            break;
          case "list":
            schema[field.name] = Yup.array().of(Yup.string());
            break;
          case "checkbox":
            schema[field.name] = Yup.boolean();
            break;
          case "file":
            schema[field.name] = Yup.string().required(`${field.label} is required`);
            break;
          case "tab":
            // For tab fields, validate based on the selected tab
            schema[field.name] = Yup.string();
            break;
        }
      }
    });

    // Always require connector name
    schema.name = Yup.string().required("Connector name is required");

    return Yup.object().shape(schema);
  };

  // Build initial values with defaults
  const buildInitialValues = () => {
    const values: any = {
      name: "",
      ...initialValues,
    };

    const allFields = [...config.values, ...config.advanced_values];
    
    allFields.forEach((field) => {
      if (values[field.name] === undefined) {
        if (field.default !== undefined) {
          values[field.name] = field.default;
        } else {
          switch (field.type) {
            case "text":
            case "select":
            case "file":
              values[field.name] = "";
              break;
            case "number":
              values[field.name] = 0;
              break;
            case "checkbox":
              values[field.name] = false;
              break;
            case "list":
              values[field.name] = [];
              break;
            case "tab":
              values[field.name] = field.tabs?.[0]?.value || "";
              break;
          }
        }
      }
    });

    return values;
  };

  const validationSchema = buildValidationSchema();
  const initialFormValues = buildInitialValues();

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <OnyxFormRenderer
            connectorId={connectorId}
            currentCredential={currentCredential}
          />
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-4 py-2 rounded-full"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="download"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Connector"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default OnyxFormWrapper; 