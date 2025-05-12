'use client';
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Nav";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Check if the current route matches any navigation route
  const shouldShowNavigation = navigationRoutes.some((pattern) => pattern.test(pathname));

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {shouldShowNavigation && <Navigation />}
        <main>{children}</main>
      </body>
    </html>
  );
}