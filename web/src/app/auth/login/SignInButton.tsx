import { AuthType } from "@/lib/constants";
import { FcGoogle } from "react-icons/fc";

export function SignInButton({
  authorizeUrl,
  authType,
}: {
  authorizeUrl: string;
  authType: AuthType;
}) {
  let button;
  if (authType === "google_oauth" || authType === "cloud") {
    button = (
      <div className="mx-auto flex">
        <div className="my-auto mr-2">
          <FcGoogle />
        </div>
        <p className="text-sm font-medium select-none text-gray-900 dark:!text-gray-900">Continue with Google</p>
      </div>
    );
  } else if (authType === "oidc") {
    button = (
      <div className="mx-auto flex">
        <p className="text-sm font-medium select-none text-neutral-900 dark:!text-neutral-900">
          Continue with OIDC SSO
        </p>
      </div>
    );
  } else if (authType === "saml") {
    button = (
      <div className="mx-auto flex">
        <p className="text-sm font-medium select-none text-neutral-900 dark:!text-neutral-900">
          Continue with SAML SSO
        </p>
      </div>
    );
  }

  const url = new URL(authorizeUrl);

  const finalAuthorizeUrl = url.toString();

  if (!button) {
    throw new Error(`Unhandled authType: ${authType}`);
  }

  return (
      <a
        className="mx-auto mb-4 mt-6 py-3 px-4 w-full bg-white dark:!bg-white text-neutral-900 dark:!text-neutral-900 border border-neutral-300 dark:!border-neutral-300 flex rounded-full cursor-pointer shadow-md hover:shadow-xl transition-all"
        href={finalAuthorizeUrl}
      >
      {button}
    </a>
  );
}
