import { loginController } from "@/controllers/loginController";

export async function POST(req) {
  return loginController(req);
}
