import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TEAM_ACCESS_COOKIE = "team_access_v1";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/team") && !pathname.startsWith("/team/access")) {
    const hasTeamAccess = request.cookies.get(TEAM_ACCESS_COOKIE)?.value === "owner";
    if (!hasTeamAccess) {
      const loginUrl = new URL("/team/access", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname !== "/") {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/growth-site", request.url));
}

export const config = {
  matcher: ["/", "/team/:path*"],
};