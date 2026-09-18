import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore with custom database ID, resilient multi-tab cache & experimentalForceLongPolling
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  },
  firebaseConfig.firestoreDatabaseId || undefined
);

export const OWNER_EMAIL = 'dbcworkshop.co@gmail.com';
