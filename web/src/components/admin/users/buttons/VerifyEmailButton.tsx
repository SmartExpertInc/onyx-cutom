import { type User } from "@/lib/types";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import userMutationFetcher from "@/lib/admin/users/userMutationFetcher";

const VerifyEmailButton = ({
  user,
  setPopup,
  mutate,
  className,
  children,
}: {
  user: User;
  setPopup: (spec: PopupSpec) => void;
  mutate: () => void;
  className?: string;
  children?: React.ReactNode;
}) => {
  const { trigger, isMutating } = useSWRMutation(
    "/api/manage/admin/verify-user-email",
    userMutationFetcher,
    {
      onSuccess: () => {
        mutate();
        setPopup({
          message: "User email verified successfully!",
          type: "success",
        });
      },
      onError: (errorMsg) =>
        setPopup({ message: errorMsg.message, type: "error" }),
    }
  );
  return (
    <Button
      className={className}
      onClick={() => trigger({ user_email: user.email })}
      disabled={isMutating}
      variant="ghost"
    >
      {children}
    </Button>
  );
};

export default VerifyEmailButton;

