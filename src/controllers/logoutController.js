import { NextResponse } from "next/server";
import { logoutService } from "@/services/logoutService";

export async function logoutController() {
  const response = NextResponse.json(
    { success: true, message: "Logged out" },
    { status: 200 }
  );

  // clear token
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
