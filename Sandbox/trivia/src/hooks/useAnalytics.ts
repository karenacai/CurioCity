'use client';

import { useCallback } from 'react';
import * as gtag from '@/lib/gtag';

export function useAnalytics() {
  const trackEvent = useCallback((action: string, category: string, label: string, value?: number) => {
    gtag.event({
      action,
      category,
      label,
      value
    });
  }, []);

  const trackPageView = useCallback((url: string) => {
    gtag.pageview(url);
  }, []);

  return {
    trackEvent,
    trackPageView
  };
} 