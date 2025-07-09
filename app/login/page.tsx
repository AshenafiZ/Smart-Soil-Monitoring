'use client';
import { FirebaseError } from 'firebase/app';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardTitle, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, LogIn, Mail } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCk1lEqh3LsBVczdW_BRWop2tB1IWBE9Bg",
  authDomain: "smart-soil-monitoring-24a20.firebaseapp.com",
  projectId: "smart-soil-monitoring-24a20",
  storageBucket: "smart-soil-monitoring-24a20.firebasestorage.app",
  messagingSenderId: "715608769710",
  appId: "1:715608769710:web:74b6ba46cb40d8e4d9193f",
};

const app = initializeApp(firebaseConfig);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Service Worker or PushManager not supported.');
      return null;
    }

    try {
      const response = await fetch('/firebase-messaging-sw.js');
      if (!response.ok) {
        throw new Error(`Service worker file not found: ${response.status}`);
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration);

      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied.');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Service Worker or FCM token error:', error);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();
      document.cookie = `authToken=${token}; path=/; Secure; SameSite=Strict`;

      const deviceToken = await registerServiceWorker();
      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(userRef, {
          deviceToken: deviceToken || '',
          lastLogin: new Date().toISOString(),
        }, { merge: true });
        console.log('User document updated for UID:', user.uid, 'Device Token:', deviceToken);
      } catch (firestoreError) {
        console.error('Error updating users collection:', firestoreError);
        setError('Failed to update user data. Login successful, but notifications may not work.');
      }

      const userDocSnapshot = await getDoc(userRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const role = userData.role || "main";
        const redirectPath = role === "main" ? "/" : `/${role}`;
        router.push(redirectPath);
      } else {
        setError("User role not found. Please contact support.");
      }
    } catch (err: unknown) {
      const errorMessages: Record<string, string> = {
        "auth/invalid-email": "Invalid email format.",
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      const errorMessage = err instanceof FirebaseError && err.code in errorMessages
        ? errorMessages[err.code]
        : "Failed to log in. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    setResetError("");
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setResetEmail("");
    } catch (err: unknown) {
      const errorMessages: Record<string, string> = {
        "auth/invalid-email": "Invalid email format.",
        "auth/user-not-found": "No user found with this email.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      const errorMessage = err instanceof FirebaseError && err.code in errorMessages
        ? errorMessages[err.code]
        : "Failed to send password reset email.";
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access Smart Soil Monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setResetEmail(email)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          {(resetEmail || resetMessage || resetError) && (
            <form onSubmit={handlePasswordReset} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Reset Password</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={resetLoading}
                />
              </div>
              {resetMessage && (
                <Alert variant="default">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{resetMessage}</AlertDescription>
                </Alert>
              )}
              {resetError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{resetError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" variant="outline" disabled={resetLoading}>
                {resetLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {resetLoading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}