import { connectDb } from '@/lib/db';
import Activity from '@/models/Activity';

export async function recordActivity(payload) {
  await connectDb();
  const doc = await Activity.create(payload);
  return doc;
}

export async function getActivitiesService(adminId, query = {}) {
  await connectDb();
  const filter = { adminId };
  if (query.type && query.type !== 'All') filter.type = query.type;
  if (query.employeeId && query.employeeId !== 'All Employees') filter.actorEmployee = query.employeeId;
  const list = await Activity.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: 'actorEmployee', select: 'name', strictPopulate: false })
    .populate({ path: 'actorAdmin', select: 'name', strictPopulate: false })
    .populate({ path: 'taskId', select: 'taskName', strictPopulate: false });
  return list;
}