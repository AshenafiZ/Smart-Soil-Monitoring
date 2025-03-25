import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const lang = req.cookies.get("locale")?.value || "en";
  req.headers.set("Accept-Language", lang);
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*", 
};
