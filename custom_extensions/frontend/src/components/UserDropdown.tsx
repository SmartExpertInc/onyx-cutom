"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings, Bell, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserRole } from "../lib/types"; 
import { checkUserIsNoAuthUser, logout } from "../lib/user"; 
import { LOGOUT_DISABLED } from "../lib/constants";
import { resetUserIdentity } from "../lib/mixpanelClient"
import { useLanguage } from "../contexts/LanguageContext"

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

// User hook to get actual user data
const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    isCurator: user?.role === 'curator',
    loading,
  };
};

export function UserDropdown({
  hideUserDropdown,
}: {
  hideUserDropdown?: boolean;
}) {
  const { user, isCurator, loading } = useUser();
  const [userInfoVisible, setUserInfoVisible] = useState(false);
  const userInfoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

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

      // Reset mixpanel
      resetUserIdentity();

      // Redirect to main app's login page after logout
      // This follows the same pattern as the authentication check in projects page
      const currentUrl = window.location.pathname + window.location.search;
      redirectToMainAuth(`/auth/login?next=${encodeURIComponent(currentUrl)}`);
    });
  };

  const showAdminPanel = !loading && user && user.role === 'admin';
  const showCuratorPanel = user && isCurator;
  const showLogout = user && !checkUserIsNoAuthUser(user.id) && !LOGOUT_DISABLED;

  return (
    <div className="group relative" ref={userInfoRef}>
      <div
        onClick={() => setUserInfoVisible(!userInfoVisible)}
        className="flex relative cursor-pointer"
      >
        <div className="bg-[#E1E1E1] hover:bg-gray-200 transition-colors duration-150 rounded-full inline-flex w-8 h-8 items-center justify-center text-black">
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100%" viewBox="0 0 288 288" enableBackground="new 0 0 288 288" xmlSpace="preserve">
          <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M126.764687,243.325195   C129.743134,252.333206 134.648621,260.277374 136.916687,270.400635   C128.787888,268.256714 124.842384,262.069458 118.092896,258.664429   C119.308434,262.129517 120.328094,264.713470 121.101715,267.369141   C121.528847,268.835388 122.829292,270.669861 120.802452,271.840027   C119.127396,272.807129 118.008667,271.188202 116.981483,270.234497   C108.673660,262.520996 100.574516,254.570007 93.602295,245.621414   C88.185638,238.669373 83.379593,231.244629 78.121811,224.163879   C76.570457,222.074600 74.951332,219.858124 71.795006,218.364532   C68.604797,223.381012 67.569160,229.950348 62.030056,233.435074   C57.042271,236.572968 52.403023,240.231232 48.189892,244.138397   C45.385746,241.875366 46.767834,240.212723 47.577496,238.707336   C49.391239,235.335022 51.005894,231.772644 53.326328,228.770523   C62.297386,217.164062 61.618809,203.921829 60.225838,190.532364   C59.637970,184.881699 58.121010,179.383667 56.273403,174.050064   C50.275124,156.734436 50.554508,139.405197 55.733799,122.029739   C62.114437,100.624023 71.474792,81.173080 89.520638,66.695068   C119.857658,42.355949 155.847946,46.867363 183.390152,65.028984   C195.984482,73.333817 202.778366,86.450531 207.319687,100.443886   C220.159134,140.006592 218.619019,179.070526 202.323807,217.448044   C200.306015,222.200226 198.362686,226.984711 196.286087,231.710846   C195.603226,233.264999 195.330215,235.434372 192.021210,235.111679   C191.544830,225.995117 195.513290,217.500610 196.057571,208.130676   C186.909927,218.816956 176.217575,226.728729 162.932022,230.703110   C149.899185,234.601883 136.731003,234.265442 123.138283,230.953323   C123.345345,235.782639 125.523560,239.224625 126.764687,243.325195  M185.937988,124.180367   C182.732666,120.860306 179.360062,117.776848 175.175842,116.061447   C174.700089,116.430336 174.488876,116.507607 174.448608,116.637764   C172.698914,122.294319 164.988434,125.525246 167.817322,133.128540   C168.200027,134.157150 166.720673,135.102341 165.533051,135.391510   C163.605209,135.860962 161.647766,136.208862 159.377701,136.674805   C161.062805,138.449005 158.214310,139.753845 159.124908,141.856583   C161.031693,146.259705 159.627502,149.741455 155.057053,151.480652   C150.993805,153.026840 148.155334,151.062866 145.905991,145.527100   C145.726746,145.085938 145.432755,144.691406 144.954224,143.863846   C137.083755,146.571548 128.703262,146.706116 120.616859,148.478226   C113.820236,149.967682 110.196198,154.742355 110.369339,161.682526   C110.497734,166.829453 110.875473,171.978714 111.357933,177.106628   C112.634392,190.673721 114.232536,204.188416 118.169258,217.317474   C119.010086,220.121689 120.495758,221.867783 123.294586,222.868378   C133.616211,226.558395 144.297134,227.233017 154.796295,224.977173   C188.680298,217.696838 208.119064,187.382095 201.187790,153.323090   C200.214066,148.538284 199.843994,143.435669 195.424133,139.194107   C196.030853,141.250153 196.680496,142.586060 196.783371,143.962845   C197.089066,148.054352 194.487030,151.278244 190.663040,151.840393   C187.177460,152.352798 183.730301,149.776413 182.993546,146.178833   C182.302444,142.804062 185.592300,139.810059 183.053772,136.266769   C182.079926,136.181213 180.250900,136.130341 178.463898,135.829727   C176.965042,135.577560 175.410370,134.980118 175.073807,133.291550   C174.670563,131.268509 176.178680,130.222519 177.756851,129.593262   C179.907227,128.735870 182.201141,128.237198 184.347412,127.371315   C185.434494,126.932739 187.927521,127.160950 185.937988,124.180367  z"/>
          <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M184.497925,205.505127   C177.387009,214.158386 168.161636,212.015427 159.502716,210.813339   C153.161850,209.933029 147.837357,205.318619 141.258728,204.622986   C140.498917,204.542648 139.769547,203.878281 139.995148,202.334045   C142.825668,200.859970 146.206512,201.612762 149.324982,201.480194   C158.448822,201.092361 166.947464,196.727951 176.287842,197.627457   C179.712128,197.957230 182.802567,198.591614 185.588547,200.581680   C188.543945,202.692780 187.912109,204.213242 184.497925,205.505127  M159.784851,207.163208   C165.244186,209.836899 170.631027,207.250763 176.056244,206.667542   C170.672363,206.667542 165.288498,206.667542 159.784851,207.163208  M165.001892,203.486176   C170.099594,203.086731 175.197296,202.687271 180.294998,202.287827   C175.071182,203.026901 169.459641,199.147293 165.001892,203.486176  z"/>
          <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M173.344406,161.090042   C180.438629,158.990570 189.808182,167.157059 188.872223,176.054337   C188.152618,182.894730 178.548767,187.131531 172.244995,183.602051   C172.711761,181.630249 174.450790,182.014267 175.808838,181.629318   C179.330368,180.631119 183.150757,179.894424 183.894775,175.375717   C184.567642,171.289154 181.416046,165.869278 177.394379,163.900024   C175.949905,163.192734 174.040115,163.263535 173.344406,161.090042  z"/>
          </svg>
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
                {/* User Email Section */}
                {user?.email && (
                  <>
                    <div className="px-3 py-2 text-gray-900 text-xs font-semibold border-b border-gray-100">
                      {user.email}
                    </div>
                  </>
                )}
                
                <DropdownOption
                  href="/payments"
                  icon={<CreditCard size={16} className="my-auto" />}
                  label={t('interface.billing', 'Billing')}
                />
                {showAdminPanel && (
                  <DropdownOption
                    href="/admin/main"
                    icon={<Settings size={16} className="my-auto" />}
                    label="Admin Settings"
                  />
                )}
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