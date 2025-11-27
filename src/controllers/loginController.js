import { NextResponse } from "next/server";
import { loginService } from "@/services/loginService";

export async function loginController(req) {
  try {
    const body = await req.json();
    const result = await loginService(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // Do NOT echo sensitive data (like passwords or tokens) in the JSON body.
    // We set the token as an httpOnly cookie and only return the user role.
    const response = NextResponse.json(
      { success: true, data: { role: result.role } },
      { status: 200 }
    );

    // store token in cookie (secure only in production)
    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
