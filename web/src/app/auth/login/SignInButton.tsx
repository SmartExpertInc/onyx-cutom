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
        <p className="text-[15px] font-medium select-none text-gray-900">Continue with Google</p>
      </div>
    );
  } else if (authType === "oidc") {
    button = (
      <div className="mx-auto flex">
        <p className="text-[15px] font-medium select-none text-gray-900">
          Continue with OIDC SSO
        </p>
      </div>
    );
  } else if (authType === "saml") {
    button = (
      <div className="mx-auto flex">
        <p className="text-[15px] font-medium select-none text-gray-900">
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
        className="mx-auto mb-4 mt-6 py-2 px-4 w-full flex rounded-md cursor-pointer hover:shadow-md transition-all border border-[#0F58F9] bg-[#ffffff] text-gray-900"
        href={finalAuthorizeUrl}
      >
      {button}
    </a>
  );
}
