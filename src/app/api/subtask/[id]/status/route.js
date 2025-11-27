import { updateSubTaskStatusController } from '@/controllers/subTaskController';

export async function POST(req, { params }) {
  return updateSubTaskStatusController(req, { params });
}