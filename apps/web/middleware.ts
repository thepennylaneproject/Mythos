import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/projects", "/campaigns", "/composer"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const requiresAuth = protectedRoutes.some((path) => pathname.startsWith(path));
  if (!requiresAuth) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    if (pathname !== "/login") {
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/campaigns/:path*", "/composer/:path*"]
};
