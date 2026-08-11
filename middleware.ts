import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const ROLE_TO_PATH: Record<string, string> = {
  owner: "owner",
  share_owner: "share-owner",
  admin: "admin",
  teacher: "teacher",
  parent: "parent",
  student: "student",
  trial_guest: "trial-guest",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/portal/")) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const requestedRolePath = pathname.split("/")[2];
  const allowedPath = ROLE_TO_PATH[session.role];

  if (requestedRolePath !== allowedPath) {
    return NextResponse.redirect(new URL(`/portal/${allowedPath}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
