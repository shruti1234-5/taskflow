import { updateTaskController, deleteTaskController } from '@/controllers/taskController';

export async function PUT(req, { params }){
  return updateTaskController(req, { params });
}

export async function DELETE(req, { params }){
  return deleteTaskController(req, { params });
}
