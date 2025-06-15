'use client';

import { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Navigation from '@/components/Navigation';
import { auth, db } from '../lib/firebase';
import './globals.css';
import SensorMonitor from '@/components/SensorMonitor';
import Notifications from '@/components/Notifications';

const navigationRoutes = [
  /^\/$/, // Home
  /^\/about$/, // About
  /^\/contact$/, // Contact
  /^\/signup$/, // Sign Up
  /^\/login$/, // Login
  /^\/admin\/.*/, // Admin routes
  /^\/farmer\/.*/, // Farmer routes
  /^\/advisor\/.*/, // Advisor routes
  /^\/technician\/.*/, // Technician routes
];

type User = {
  name?: string;
  image?: string;
  role?: 'main' | 'admin' | 'farmer' | 'advisor' | 'technician';
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAuthenticated(true);
            setUser({
              name: userData.name || firebaseUser.displayName || 'User',
              image: userData.image || firebaseUser.photoURL || '/default-avatar.png',
              role: userData.role || 'main',
            });
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }

          // Set auth token cookie
          const token = await firebaseUser.getIdToken();
          document.cookie = `authToken=${token}; path=/; Secure; SameSite=Strict`;
        } else {
          setIsAuthenticated(false);
          setUser(null);
          document.cookie = `authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        setError(null);
      } catch (error: any) {
        console.error('Authentication error:', error);
        setError('Failed to authenticate. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const shouldShowNavigation = navigationRoutes.some((pattern) => pattern.test(pathname));

  if (isLoading) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-100">
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  if (error) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-100">
          <div style={{ color: 'red' }}>{error}</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {shouldShowNavigation && (
          <Navigation
            isAuthenticated={isAuthenticated}
            user={user}
            isLoading={isLoading}
          />
        )}
        <SensorMonitor />
        <Notifications />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}