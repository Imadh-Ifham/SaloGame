import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getAnalytics,
  logEvent,
  setUserProperties,
  setUserId,
  Analytics,
  isSupported,
  getAnalytics as getFirebaseAnalytics
} from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let analytics: Analytics | null = null;

// Define Analytics Events
const AnalyticsEvents = {
  USER_PRESENCE: 'user_presence',
  PAGE_VIEW: 'page_view',
  USER_ACTIVITY: 'user_activity',
  EVENT_INTERACTION: 'event_interaction',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end'
} as const;

// Initialize Analytics
const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
      
      auth.onAuthStateChanged(user => {
        if (user && analytics) {
          setUserId(analytics, user.uid);
          setUserProperties(analytics, {
            userRole: user.email?.endsWith('@admin.com') ? 'admin' : 'user',
            lastActiveAt: new Date().toISOString()
          });
          
          // Track user presence when they sign in
          trackUserPresence('active');
        }
      });

      // Track when user leaves
      window.addEventListener('beforeunload', () => {
        if (analytics) {
          trackUserPresence('inactive');
        }
      });
    }
  } catch (error) {
    console.error('Firebase Analytics initialization failed:', error);
  }
};

initializeAnalytics();

// Helper function to track user presence
const trackUserPresence = (status: 'active' | 'inactive') => {
  if (!analytics) return;
  logEvent(analytics, AnalyticsEvents.USER_PRESENCE, {
    status,
    timestamp: new Date().toISOString()
  });
};

// Analytics API
export const FirebaseAnalytics = {
  // Track user activity over time
  trackUserActivity: (params: {
    activityType: string;
    duration?: number;
    page?: string;
  }) => {
    if (!analytics) return;
    logEvent(analytics, AnalyticsEvents.USER_ACTIVITY, {
      timestamp: new Date().toISOString(),
      ...params
    });
  },

  // Track page views for activity tracking
  trackPageView: (pageName: string, params?: Record<string, any>) => {
    if (!analytics) return;
    logEvent(analytics, AnalyticsEvents.PAGE_VIEW, {
      page_name: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      ...params
    });
  },

  // Track event interactions
  trackEventInteraction: (params: {
    eventName: string;
    interactionType: string;
    count?: number;
  }) => {
    if (!analytics) return;
    logEvent(analytics, AnalyticsEvents.EVENT_INTERACTION, {
      timestamp: new Date().toISOString(),
      ...params
    });
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    if (!analytics) return;
    setUserProperties(analytics, {
      ...properties,
      last_active: new Date().toISOString()
    });
  },

  getUserActivityData: async () => {
    if (!analytics) return null;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    const oneDayAgo = new Date(now.setDate(now.getDate() - 1));

    try {
      // Since Firebase Analytics doesn't provide direct access to historical data,
      // we'll return the time periods for custom implementation
      return {
        thirtyDays: {
          startDate: thirtyDaysAgo,
          endDate: now
        },
        sevenDays: {
          startDate: sevenDaysAgo,
          endDate: now
        },
        oneDay: {
          startDate: oneDayAgo,
          endDate: now
        }
      };
    } catch (error) {
      console.error('Error with activity data:', error);
      return null;
    }
  }
};

// Helper function to process activity data
const processActivityData = (data: any) => {
  const activeUsers = data?.activeUsers || [];
  return {
    data: activeUsers.map((user: any) => ({
      timestamp: user.timestamp,
      count: user.count
    })),
    total: activeUsers.reduce((sum: number, user: any) => sum + user.count, 0)
  };
};

export { auth, analytics, AnalyticsEvents };