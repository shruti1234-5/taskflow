import { NextResponse } from "next/server";

function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url -> base64
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // atob exists in the Edge runtime
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // public routes
  if (path === "/login" || path === "/" || path.startsWith("/api/login") || path.startsWith("/api/logout")) {
    return NextResponse.next();
  }

  // no token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decoded = decodeJwtPayload(token);
  if (!decoded) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // role based routing
  if (path.startsWith("/admin") && decoded.role !== "admin") {
    return NextResponse.redirect(new URL("/employee/dashboard", req.url));
  }

  if (path.startsWith("/employee") && decoded.role !== "employee") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/login", "/"],
};
