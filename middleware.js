import { NextResponse } from "next/server";
import { COOKIE_NAME, signToken, authSecret } from "./lib/auth";

export const config = {
  matcher: ["/((?!api/login|login.html|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await signToken(authSecret());

  if (cookie && cookie === expected) {
    if (req.nextUrl.pathname === "/") {
      return NextResponse.rewrite(new URL("/index.html", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login.html", req.url));
}
