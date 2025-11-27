import { logoutController } from "@/controllers/logoutController";

export async function GET() {
  return logoutController();
}
