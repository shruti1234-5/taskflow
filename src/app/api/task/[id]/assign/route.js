import { addAssigneeController } from '@/controllers/taskController';

export async function POST(req, { params }) {
  return addAssigneeController(req, { params });
}
