import { getAssignedByMeController } from '@/controllers/taskController';

export async function GET(req) {
  return getAssignedByMeController(req);
}