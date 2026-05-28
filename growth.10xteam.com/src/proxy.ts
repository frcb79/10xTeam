import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/growth-site", request.url));
}

export const config = {
  matcher: "/",
};