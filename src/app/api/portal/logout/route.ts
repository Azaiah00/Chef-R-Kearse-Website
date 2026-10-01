import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/portal/auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: new URL(request.url).protocol === "https:",
  });
  return response;
}
