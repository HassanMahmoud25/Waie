import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * First line of defence for /admin: rejects any request without a valid,
 * unexpired, correctly signed session cookie before a page renders or a server
 * action runs. It runs on the Edge, so it can't query the database -- the
 * role check (and "does this user still exist?") is done by requireAdmin()
 * in the admin layout, pages and actions. Both layers must stay in place.
 */
export async function middleware(request: NextRequest) {
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (userId) return NextResponse.next();

  // Server actions are fetch() calls -- answer them with a status, not a page redirect.
  if (request.headers.has("next-action")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
