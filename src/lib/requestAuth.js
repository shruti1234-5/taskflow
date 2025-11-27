import jwt from "jsonwebtoken";
import { connectDb } from "@/lib/db";
import Employee from "@/models/Employee";

// Simple helper to extract token payload (admin/employee) from a Request.
// Throws a readable Error when token missing/invalid.
export async function getAdminIdFromRequest(req) {
  try {
    let token = req.cookies.get("token")?.value;
    if (!token) {
      const auth = req.headers.get("authorization") || req.headers.get("Authorization");
      if (auth && auth.startsWith("Bearer ")) token = auth.split(" ")[1];
    }

    if (!token) throw new Error("Invalid or missing authentication token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded || {};
    // console.log('[getAdminIdFromRequest] decoded:', { id, role });

    if (role === "admin") return String(id);
    if (role === "employee") {
      await connectDb();
      const emp = await Employee.findById(id).lean();
      if (!emp?.adminId) throw new Error("Invalid employee or missing adminId");
      return String(emp.adminId);
    }

    throw new Error("Unsupported role");
  } catch (err) {
    console.error('[getAdminIdFromRequest] error:', err.message);
    throw new Error("Invalid or missing authentication token");
  }
}

export function decodeTokenFromRequest(req) {
  try {
    let token = req.cookies.get("token")?.value;
    if (!token) {
      const auth = req.headers.get("authorization") || req.headers.get("Authorization");
      if (auth && auth.startsWith("Bearer ")) token = auth.split(" ")[1];
    }
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}
