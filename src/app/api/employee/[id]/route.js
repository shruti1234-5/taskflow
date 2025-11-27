import { updateEmployeeController, deleteEmployeeController } from "@/controllers/employeeController";

export async function PUT(req, { params }) {
  return updateEmployeeController(req, { params });
}

export async function DELETE(req, { params }) {
  return deleteEmployeeController(req, { params });
}
