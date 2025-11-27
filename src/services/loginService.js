import Employee from "@/models/Employee";
import Admin from "@/models/Admin";
import { connectDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function loginService(data) {
  await connectDb();
  const { email, password } = data;

  try {
    const employee = await Employee.findOne({ email }).lean();
    if (employee) {
      const match = await bcrypt.compare(password, employee.password);
      if (match) {
        const token = signToken({
          id: employee._id,
          role: "employee",
        });

        return {
          success: true,
          role: "employee",
          token,
        };
      }
    }

    const admin = await Admin.findOne({ email }).lean();
    if (admin) {
      const matchAdmin = await bcrypt.compare(password, admin.password);
      if (matchAdmin) {
        const token = signToken({
          id: admin._id,
          role: "admin",
        });

        return {
          success: true,
          role: "admin",
          token,
        };
      }
    }

    return { success: false, message: "Invalid email or password" };

  } catch (err) {
    return { success: false, message: "Login failed: " + err.message };
  }
}
