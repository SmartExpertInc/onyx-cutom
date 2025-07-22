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

  // Helper function to redirect to main app's auth endpoint (copied from projects page logic)
  const redirectToMainAuth = (path: string) => {
    // Get the current domain and protocol
    const protocol = window.location.protocol;
    const host = window.location.host;
    const mainAppUrl = `${protocol}//${host}${path}`;
    window.location.href = mainAppUrl;
  };

  const handleLogout = () => {
    logout().then((response: Response) => {
      if (!response.ok) {
        alert("Failed to logout");
        return;
      }

      // Redirect to main app's login page after logout
      // This follows the same pattern as the authentication check in projects page
      const currentUrl = window.location.pathname + window.location.search;
      redirectToMainAuth(`/auth/login?next=${encodeURIComponent(currentUrl)}`);
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
        <div className="bg-[#f7f7f7] hover:bg-gray-200 transition-colors duration-150 rounded-full inline-flex w-8 h-8 items-center justify-center text-black">
            <User size={18} className="block" />
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
                {showLogout && (
                  <DropdownOption
                    onClick={handleLogout}
                    icon={<LogOut size={16} className="my-auto" />}
                    label="Log out"
                  />
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