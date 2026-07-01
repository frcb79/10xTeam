import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TEAM_ACCESS_COOKIE = "team_access_v1";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/team") || pathname.startsWith("/team/access")) {
    return NextResponse.next();
  }

  const hasTeamAccess = request.cookies.get(TEAM_ACCESS_COOKIE)?.value === "owner";
  if (hasTeamAccess) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/team/access", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/team/:path*"],
};
