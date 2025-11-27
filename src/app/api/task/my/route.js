import { getMyTasksController } from '@/controllers/taskController';

export async function GET(req) {
  return getMyTasksController(req);
}
