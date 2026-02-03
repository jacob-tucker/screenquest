import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { user, supabase, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // If Supabase is not configured, allow all requests (development without env vars)
  if (!supabase) {
    return supabaseResponse;
  }

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  // Admin-only routes
  const isAdminRoute = pathname.startsWith("/admin");

  // Auth routes (login page)
  const isAuthRoute = pathname === "/login";

  // Helper to create redirect while preserving cookies from supabaseResponse
  const redirectWithCookies = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const redirectResponse = NextResponse.redirect(url);
    // Copy all cookies from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    return redirectWithCookies("/login");
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (user && isAuthRoute) {
    return redirectWithCookies("/dashboard");
  }

  // If trying to access admin route, verify admin role
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return redirectWithCookies("/dashboard");
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
