import { getActivityController } from '@/controllers/activityController';

export async function GET(req) {
  return getActivityController(req);
}