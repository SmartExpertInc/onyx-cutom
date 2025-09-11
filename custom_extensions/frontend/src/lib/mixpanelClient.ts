import mixpanel, { Config } from "mixpanel-browser";
import {
  SignUpEvent,
  PageLeftEvent,
  FeatureUsedEvent
} from "./analyticsTypes";

// Make the env variable type-safe (string or undefined)
const MIXPANEL_TOKEN: string | undefined = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

// Explicitly type the function return as void
export const initMixpanel = (): void => {
  if (!MIXPANEL_TOKEN) {
    console.warn("Mixpanel token is missing! Check your .env file.");
    return;
  }

  // Use the Config type from @types/mixpanel-browser
  const options: Partial<Config> = {
    api_host: 'https://api-eu.mixpanel.com',
    /*
    api_routes: {                                // remove trailing slashes for proxy
      track: 'track',
      engage: 'engage',
      groups: 'groups',
    },
    */
    ip: true,
    debug: true,
    track_pageview: true,
  };

  mixpanel.init(MIXPANEL_TOKEN, options);
  console.log("Mixpanel initialized"); //TODO: Remove this
};

// Call identify after login/register
export function identifyUser(userId: string) {
  // Link anonymous activity with known user
  mixpanel.identify(userId);
}

// Call on logout to handle multiple users on a single device
export function resetUser() {
  mixpanel.reset();
}

export function trackSignUp(props: SignUpEvent) {
  mixpanel.track("Sign Up", {
    ...props
  });
}

export function trackPageLeft(props: PageLeftEvent) {
  mixpanel.track("Page Left", {
    ...props
  });
}

export function trackFeatureUsed(
  props: FeatureUsedEvent,
  useBeacon: boolean = false
): void {
  mixpanel.track(
    "Feature Used", 
    { ...props },
    useBeacon ? { transport: "sendBeacon" } : undefined
  );
}