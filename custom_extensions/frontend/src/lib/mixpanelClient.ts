import mixpanel, { Config } from "mixpanel-browser";
import {
  PageLeftEvent,
  FeatureUsedEvent
} from "./analyticsTypes";

const MIXPANEL_TOKEN: string | undefined = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

// Track initialization state to avoid throwing and to short-circuit safely
let isInitialized = false;

export const initMixpanel = (): void => {
  // Prevent SSR/edge environments without window from trying to initialize
  if (typeof window === "undefined") {
    return;
  }

  if (!MIXPANEL_TOKEN) {
    console.warn("Mixpanel token is missing! Check your .env file.");
    return;
  }

  if (isInitialized) {
    return;
  }

  const options: Partial<Config> = {
    //api_host: 'https://api.mixpanel.com', // Direct mixpanel call
    api_host: '/tracking-proxy', // Call via proxy
    ip: false,
    ignore_dnt: true,
    debug: true,
    track_pageview: false,
  };

  try {
    mixpanel.init(MIXPANEL_TOKEN, options);
    isInitialized = true;
    console.log("Mixpanel initialized"); //TODO: Remove this
  } catch (error) {
    isInitialized = false;
    console.error("[analytics] Mixpanel init failed", error);
  }
};

// Call identify after login/register
export function identifyUser(userId: string) {
  if (!isInitialized) {
    return;
  }
  // Link anonymous activity with known user
  try {
    mixpanel.identify(userId);
  } catch (error) {
    console.error("[analytics] Mixpanel identify failed", error);
  }
}

// Call on logout to handle multiple users on a single device
export function resetUser() {
  if (!isInitialized) {
    return;
  }
  console.log("Mixpanel instance reset"); //TODO: Remove this
  try {
    mixpanel.reset();
  } catch (error) {
    console.error("[analytics] Mixpanel reset failed", error);
  }
}

// Wrap mixpanel.track in a Promise for async/await usage
export async function track(
  event: string,
  properties?: FeatureUsedEvent,
  options?: Record<string, unknown>
): Promise<void> {
  return new Promise((resolve) => {
    try {
      (mixpanel as any).track(event, properties ?? {}, options, (response: number) => {
        if (response === 0) {
          console.warn(`[analytics] Mixpanel track did not queue event: ${event}`, properties);
        }
        resolve(); // resolve always, so caller doesn’t crash
      });
    } catch (err) {
      console.error(`[analytics] Failed to track event: ${event}`, err, properties);
      resolve();
    }
  });
}

export function timeEvent(event: string): void {
  mixpanel.time_event(event);
}

/*
export function trackPageLeft(props: PageLeftEvent) {
  if (!isInitialized) {
    return;
  }
  const queued: unknown = (mixpanel as any).track("Page Left", { ...props });
  if (queued === false) {
    console.warn("[analytics] Mixpanel track failed to queue: Page Left", props);
  }
}

export function trackCreateProduct(
  props?: CreateProductEvent,
  startTimer: boolean = false,
  useBeacon: boolean = false
): void {
  if (!isInitialized) {
    return;
  }
  if (startTimer) {
    mixpanel.time_event('Create Product');
    return;
  }
  const queued: unknown = (mixpanel as any).track(
    "Feature Used",
    { ...props },
    useBeacon ? { transport: "sendBeacon" } : undefined
  );
  if (queued === false) {
    console.warn("[analytics] Mixpanel track failed to queue: Feature Used", props);
  }
}
*/