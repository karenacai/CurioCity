// lib/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Define specific types for Google Analytics
type DataLayerItem = {
  event?: string;
  page_path?: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
};

type GtagCommand = 'config' | 'event' | 'js' | 'set' | 'consent';

// Declare gtag as a global function with specific types
declare global {
  interface Window {
    dataLayer: DataLayerItem[];
    gtag: (command: GtagCommand, ...args: unknown[]) => void;
  }
}

// Typescript interface for gtag
interface GTagEvent {
  action: string;
  category: string;
  label: string;
  value?: number;
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
    console.log('📊 Tracking pageview:', url);
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('📊 Tracking event:', { action, category, label, value });
  }
}; 