"use client";

import { useState, useRef } from "react";
import { LogOut, User, Settings, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserRole } from "../lib/types"; 
import { checkUserIsNoAuthUser, logout } from "../lib/user"; 
import { LOGOUT_DISABLED } from "../lib/constants"; 

interface DropdownOptionProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  openInNewTab?: boolean;
}

const DropdownOption: React.FC<DropdownOptionProps> = ({
  href,
  onClick,
  icon,
  label,
  openInNewTab,
}) => {
  const content = (
    <div className="flex py-1.5 text-sm px-2 gap-x-2 text-black cursor-pointer rounded hover:bg-gray-100">
      {icon}
      {label}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  } else {
    return <div onClick={onClick}>{content}</div>;
  }
};

// Mock user hook - replace with actual implementation when UserProvider is available
const useUser = () => {
  return {
    user: {
      id: "1",
      email: "user@example.com",
      role: UserRole.ADMIN,
      is_active: true,
      is_superuser: false,
      is_verified: true,
    },
    isCurator: false,
  };
};

export function UserDropdown({
  hideUserDropdown,
}: {
  hideUserDropdown?: boolean;
}) {
  const { user, isCurator } = useUser();
  const [userInfoVisible, setUserInfoVisible] = useState(false);
  const userInfoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogout = () => {
    logout().then((response: Response) => {
      if (!response.ok) {
        alert("Failed to logout");
        return;
      }

      // Construct the current URL
      const currentUrl = `${pathname}${
        searchParams?.toString() ? `?${searchParams.toString()}` : ""
      }`;

      // Encode the current URL to use as a redirect parameter
      const encodedRedirect = encodeURIComponent(currentUrl);

      // Redirect to login page with the current page as a redirect parameter
      router.push(`/auth/login?next=${encodedRedirect}`);
    });
  };

  const showAdminPanel = !user || user.role === UserRole.ADMIN;
  const showCuratorPanel = user && isCurator;
  const showLogout = user && !checkUserIsNoAuthUser(user.id) && !LOGOUT_DISABLED;

  return (
    <div className="group relative" ref={userInfoRef}>
      <div
        onClick={() => setUserInfoVisible(!userInfoVisible)}
        className="flex relative cursor-pointer"
      >
        <div className="my-auto bg-gray-800 hover:bg-gray-700 transition-colors duration-150 rounded-full inline-block flex-none w-8 h-8 flex items-center justify-center text-white text-sm">
          {user && user.email
            ? user.email[0]?.toUpperCase()
            : "A"}
        </div>
      </div>

      {userInfoVisible && (
        <div className="absolute right-0 top-full mt-2 w-48 text-sm border border-gray-200 bg-white rounded-lg shadow-lg z-50">
          <div className="p-1">
            {hideUserDropdown ? (
              <DropdownOption
                onClick={() => router.push("/auth/login")}
                icon={<User size={16} className="my-auto" />}
                label="Log In"
              />
            ) : (
              <>
                {showAdminPanel && (
                  <DropdownOption
                    href="/admin/indexing/status"
                    icon={<Settings size={16} className="my-auto" />}
                    label="Admin Panel"
                  />
                )}

                {showCuratorPanel && (
                  <DropdownOption
                    href="/admin/indexing/status"
                    icon={<Settings size={16} className="my-auto" />}
                    label="Curator Panel"
                  />
                )}

                <DropdownOption
                  onClick={() => {
                    // Handle notifications
                  }}
                  icon={<Bell size={16} className="my-auto" />}
                  label="Notifications"
                />

                {showLogout && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <DropdownOption
                      onClick={handleLogout}
                      icon={<LogOut size={16} className="my-auto" />}
                      label="Log out"
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {userInfoVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserInfoVisible(false)}
        />
      )}
    </div>
  );
} 