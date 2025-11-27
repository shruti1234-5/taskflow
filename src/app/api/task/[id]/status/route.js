import { updateTaskStatusController } from '@/controllers/taskController';

export async function POST(req, { params }) {
  return updateTaskStatusController(req, { params });
}