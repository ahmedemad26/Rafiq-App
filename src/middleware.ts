import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

const redirectToLogin = (req: NextRequest) => {
  const url = new URL("/login", req.nextUrl.origin);
  return NextResponse.redirect(url);
};

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = req.nextUrl.pathname;

  // Auth pages are always reachable.
  if (authRoutes.includes(path)) {
    // If already logged in and trying to open auth pages, send to app home.
    if (token) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Protect app routes from unauthenticated access.
  if (protectedRoutes.some((route) => path.startsWith(route)) && !token) {
    return redirectToLogin(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
