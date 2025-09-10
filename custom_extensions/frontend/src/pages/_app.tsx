import '@/styles/globals.css'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { initMixpanel, trackPageView } from '../lib/mixpanelClient';
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    initMixpanel(); // Initialize Mixpanel
 
    const handleRouteChange = (url: string) => {
      trackPageView(url); // Track pageviews
    };
 
    // Track page views on route change
    router.events.on('routeChangeComplete', handleRouteChange);
 
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />
} 