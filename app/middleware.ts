import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// In-memory cache for user roles with expiration (1 hour)
interface CacheEntry { role: string; timestamp: number }
const userCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

const protectedRoutes: Record<string, string[]> = {
  admin: ["/admin", "/admin/devices", "/admin/users", "/admin/map", "/admin/logs"],
  farmer: ["/farmer/tracker", "/farmer/home", "/farmer/map", "/farmer/alerts"],
  advisor: ["/advisor/recommendations", "/advisor/reports", "/advisor/map"],
  technician: ["/technician/add-device", "/technician/remove-device", "/technician/maintain-device", "/technician/map"],
};

// Validate environment variables
const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length) {
  throw new Error(`Missing Firebase Admin SDK environment variables: ${missingEnvVars.join(", ")}`);
}

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    // databaseURL is optional for Firestore; omitted unless Realtime Database is used
  });
}

const db = getFirestore();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ["/", "/about", "/contact", "/login", "/signup"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtected = Object.values(protectedRoutes).flat().some((route) => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Get auth token from cookie
  const token = request.cookies.get("authToken")?.value;
  if (!token) {
    console.log(`Middleware: No auth token for path ${pathname}`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify token with Firebase Admin SDK
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Check cache for user role
    const cached = userCache.get(decodedToken.uid);
    let userRole: string;
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      userRole = cached.role;
    } else {
      // Fetch user role from Firestore
      const userRef = db.collection("users").doc(decodedToken.uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        console.log(`Middleware: No user document for UID ${decodedToken.uid}`);
        return NextResponse.redirect(new URL("/login", request.url));
      }
      userRole = userDoc.data()?.role || "main";
      userCache.set(decodedToken.uid, { role: userRole, timestamp: Date.now() });
    }

    // Check if user has access to the requested route
    const allowedRoutes = protectedRoutes[userRole] || [];
    if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
      console.log(`Middleware: User role ${userRole} not allowed for path ${pathname}`);
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log(`Middleware: Access granted for UID ${decodedToken.uid}, role ${userRole}, path ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error(`Middleware error for path ${pathname}:`, error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/farmer/:path*", "/advisor/:path*", "/technician/:path*"],
};