import mixpanel, { Config } from "mixpanel-browser";

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
    autocapture: true,
    track_pageview: true,
  };

  mixpanel.init(MIXPANEL_TOKEN, options);
  console.log("Mixpanel initialized");
};

export const trackPageView = (url: string): void => {
  if (!MIXPANEL_TOKEN) {
    console.warn("Mixpanel token is missing! Check your .env file.");
    return;
  }

  mixpanel.track_pageview();
};

// Call identify after login/register
export function identifyUser(userId: string) {
  // Link anonymous activity with known user
  mixpanel.identify(userId);
}