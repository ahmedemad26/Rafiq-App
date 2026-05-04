import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/", "/project"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some((route) => {
    if (route === "/") return path === "/";
    return path === route || path.startsWith(`${route}/`);
  });
}

function parseJwtExp(accessToken: string): number | null {
  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as { exp?: unknown };

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function isAccessTokenExpired(token: unknown): boolean {
  if (!token || typeof token !== "object") return true;
  const accessToken = (token as { access_token?: unknown }).access_token;
  if (typeof accessToken !== "string" || !accessToken.trim()) return true;

  const exp = parseJwtExp(accessToken);
  if (!exp) return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds;
}

const redirectToLogin = (req: NextRequest) => {
  const url = new URL("/login", req.nextUrl.origin);
  const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  url.searchParams.set("callbackUrl", nextPath);
  return NextResponse.redirect(url);
};

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = Boolean(token) && !isAccessTokenExpired(token);

  const path = req.nextUrl.pathname;

  // Auth pages are always reachable.
  if (authRoutes.includes(path)) {
    // If already logged in and trying to open auth pages, send to app home.
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/project", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Protect app routes from unauthenticated access.
  if (isProtectedRoute(path) && !isAuthenticated) {
    return redirectToLogin(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
