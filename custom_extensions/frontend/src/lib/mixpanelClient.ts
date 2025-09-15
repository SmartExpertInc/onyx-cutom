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
    // Heatmap config
    record_sessions_percent: 10, // Recording 10% of all sessions
    record_idle_timeout_ms: 600000, // End a replay capture after 10mins of inactivity
    record_max_ms: 600000, // Maximum length of a single replay
    record_mask_text_selector: '', // Unmask all text elements
    record_heatmap_data: true,   // Enable Heatmap data collection
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
    mixpanel.stop_session_recording();
    mixpanel.reset();
  } catch (error) {
    console.error("[analytics] Mixpanel reset failed", error);
  }
}

// Wrap mixpanel.track in a Promise for async/await usage
export async function track(
  event: string,
  properties?: Record<string, unknown>,
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

export const trackCreateProduct = async (
  action: string,
  language?: string,
  productType?: string,
  advancedModeState?: string
) => {
  const props = {
    "Feature Category": "Products",
    "Action": action,
    "Language": language,
    "Product Type": productType,
    "Advanced Mode": advancedModeState
  };

  await track("Create Product", props);
};

export const trackSmartEdit = async (action: string) => {
  const props = {
    "Feature Category": "Products",
    "Action": action,
  };

  await track(
    "Smart Edit", 
    props, 
    { transport: "sendBeacon", send_immediately: true }
  );
};
