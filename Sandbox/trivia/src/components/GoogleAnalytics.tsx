'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, Suspense } from 'react';
import * as gtag from '@/lib/gtag';

function GoogleAnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      // Construct the full URL including search parameters
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      // Track page view
      gtag.pageview(url);
    }
  }, [pathname, searchParams]);

  // console.log("======GoogleAnalytics called!!!!=========")
  // console.log("gtag event", gtag.event)
  // Don't render anything if the measurement ID is not available
  if (!gtag.GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID is not defined');
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              page_path: window.location.pathname
            });
            console.log('Google Analytics initialized with ID: ${gtag.GA_MEASUREMENT_ID}');
          `.replace('${gtag.GA_MEASUREMENT_ID}', gtag.GA_MEASUREMENT_ID),
        }}
      />
    </>
  );
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent />
    </Suspense>
  );
} 