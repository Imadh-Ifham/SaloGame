import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getAnalytics,
  logEvent,
  setUserProperties,
  setUserId,
  Analytics,
  isSupported
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize analytics with checks
let analytics: Analytics | null = null;

const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
      
      // Set up auth state listener to track user ID
      auth.onAuthStateChanged(user => {
        if (user) {
          // Set user ID for analytics
          setUserId(analytics!, user.uid);
        }
      });
    } else {
      console.warn('Firebase Analytics is not supported in this environment');
    }
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
  }
};

// Initialize analytics
initializeAnalytics();

// Track page views
export const trackPageView = (pageName: string) => {
  if (!analytics) return;
  
  logEvent(analytics, 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

// Track session start
export const trackSessionStart = () => {
  if (!analytics) return;
  logEvent(analytics, 'session_start');
};

// Track first visit
export const trackFirstVisit = () => {
  if (!analytics) return;
  logEvent(analytics, 'first_visit');
};

// General event tracking function
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!analytics) return;
  logEvent(analytics, eventName, eventParams);
};

// Set user properties
export const setUserAnalyticsProperties = (
  properties: Record<string, any>
) => {
  if (!analytics) return;
  setUserProperties(analytics, properties);
};

export { auth, analytics };