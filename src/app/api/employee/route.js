import { createEmployeeController, getEmployeeController } from "@/controllers/employeeController";

export async function POST(req) {
  return createEmployeeController(req);
}

export async function GET(req){
  return getEmployeeController(req);
}
