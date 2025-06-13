// app/layout.tsx
'use client';
import { useState, useEffect } from "react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import { auth, db } from "./firebase/config";
import "./globals.css";

const navigationRoutes = [
  /^\/$/, // Home
  /^\/about$/, // About
  /^\/contact$/, // Contact
  /^\/signup$/, // Sign Up
  /^\/login$/, // Login
  /^\/admin\/.*/, // Admin routes (e.g., /admin/map, /admin/devices)
  /^\/farmer\/.*/, // Farmer routes
  /^\/advisor\/.*/, // Advisor routes
  /^\/technician\/.*/, // Technician routes
];

type User = {
  name?: string;
  image?: string;
  role?: "main" | "admin" | "farmer" | "advisor" | "technician";
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAuthenticated(true);
          setUser({
            name: userData.name || firebaseUser.displayName || "User",
            image: userData.image || firebaseUser.photoURL || "/default-avatar.png",
            role: userData.role || "main",
          });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        document.cookie = `authToken=${token}; path=/; Secure; SameSite=Strict`;
        // ... rest of logic ...
      }
    });
    return () => unsubscribe();
  }, []);
  // Check if the current route matches any navigation route
  const shouldShowNavigation = navigationRoutes.some((pattern) => pattern.test(pathname));

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
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}