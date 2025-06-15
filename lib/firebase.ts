import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, setPersistence, browserSessionPersistence, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let messaging: Messaging | null = null;

// Initialize Firebase Messaging (browser-only)
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging not supported:", error);
  }
}

// Set session persistence for auth
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Failed to set auth persistence:", error);
});

// Notification permission and token retrieval
const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn("Messaging not available");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

// Listen for foreground messages
const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });

// Export services and utilities
export {
  app,
  auth,
  db,
  storage,
  messaging,
  createUserWithEmailAndPassword,
  updateProfile,
  setDoc,
  doc,
  ref,
  uploadBytes,
  getDownloadURL,
  getDoc,
  sendPasswordResetEmail,
  requestNotificationPermission,
  onMessageListener,
};

export default app;