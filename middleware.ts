import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Auth temporarily removed - will be re-added later
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
