import { connectDb } from '@/lib/db';
import SubTask from '@/models/SubTask';
import Task from '@/models/Task';
import { recordActivity } from '@/services/activityService';
import Employee from '@/models/Employee';
import Admin from '@/models/Admin';

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function generateOccurrences(start, end, frequency) {
  const s = new Date(start);
  const e = new Date(end);
  const dates = [];
  let cursor = new Date(s);
  while (cursor <= e) {
    dates.push(new Date(cursor));
    if (frequency === 'Daily') cursor.setDate(cursor.getDate() + 1);
    else if (frequency === 'Weekly') cursor.setDate(cursor.getDate() + 7);
    else if (frequency === 'Monthly') cursor = addMonths(cursor, 1);
    else if (frequency === 'Quarterly') cursor = addMonths(cursor, 3);
    else if (frequency === 'Yearly') cursor = addMonths(cursor, 12);
    else break;
  }
  return dates;
}

export async function generateSubTasksForTask(taskDoc) {
  await connectDb();
  if (taskDoc.taskType !== 'Recurring') return [];
  if (!taskDoc.startDate || !taskDoc.endDate || !taskDoc.frequency) return [];
  const dueDates = generateOccurrences(taskDoc.startDate, taskDoc.endDate, taskDoc.frequency);
  const subs = [];
  let seq = 1;
  for (const d of dueDates) {
    const sub = await SubTask.create({
      adminId: taskDoc.adminId,
      parentTaskId: taskDoc._id,
      assignTo: taskDoc.assignTo,
      status: 'pending',
      seq,
      dueDate: d,
      taskName: taskDoc.taskName,
      desc: taskDoc.desc,
    });
    subs.push(sub);
    seq++;
  }
  return subs;
}

export async function getSubTasksForEmployeeFiltered(employeeId) {
  await connectDb();
  const subs = await SubTask.find({ assignTo: employeeId })
    .sort({ dueDate: 1 })
    .populate({ path: 'assignTo', select: 'name', strictPopulate: false })
    .populate({
      path: 'parentTaskId',
      select: 'priority startDate endDate taskType adminId assignedBy assignedByAdmin taskName desc',
      strictPopulate: false,
      populate: [
        { path: 'assignedByAdmin', select: 'name', strictPopulate: false },
        { path: 'assignedBy', select: 'name', strictPopulate: false },
      ],
    });
  const today = new Date();
  const groups = new Map();
  for (const s of subs) {
    const key = String(s.parentTaskId);
    const arr = groups.get(key) || [];
    arr.push(s);
    groups.set(key, arr);
  }
  const visible = [];
  for (const arr of groups.values()) {
    const overdue = arr.filter((x) => x.status !== 'completed' && x.dueDate < today);
    const next = arr.find((x) => x.status !== 'completed');
    if (overdue.length > 0) visible.push(...overdue);
    if (next) {
      if (!overdue.find((o) => String(o._id) === String(next._id))) visible.push(next);
    }
  }
  return visible;
}

export async function getSubTasksForEmployeeCompleted(employeeId) {
  await connectDb();
  const subs = await SubTask.find({ assignTo: employeeId, status: 'completed' })
    .sort({ dueDate: -1 })
    .populate({ path: 'assignTo', select: 'name', strictPopulate: false })
    .populate({
      path: 'parentTaskId',
      select: 'priority startDate endDate taskType adminId assignedBy assignedByAdmin taskName desc',
      strictPopulate: false,
      populate: [
        { path: 'assignedByAdmin', select: 'name', strictPopulate: false },
        { path: 'assignedBy', select: 'name', strictPopulate: false },
      ],
    });
  return subs;
}

export async function updateSubTaskStatusByEmployee(subTaskId, employeeId, status) {
  await connectDb();
  if (!['pending', 'pending_verification'].includes(status)) throw new Error('Invalid status');
  const sub = await SubTask.findById(subTaskId);
  if (!sub) throw new Error('SubTask not found');
  const assigned = Array.isArray(sub.assignTo) ? sub.assignTo.map(String) : [String(sub.assignTo)].filter(Boolean);
  if (!assigned.includes(String(employeeId))) throw new Error('Unauthorized');
  sub.status = status;
  await sub.save();
  const parent = await Task.findById(sub.parentTaskId)
    .populate({ path: 'assignedByAdmin', select: 'name', strictPopulate: false })
    .populate({ path: 'assignedBy', select: 'name', strictPopulate: false });
  if (parent && status === 'pending_verification') {
    parent.status = 'pending_verification';
    await parent.save();
  }
  try {
    const emp = await Employee.findById(employeeId).lean();
    const empName = emp?.name || 'Employee';
    await recordActivity({
      adminId: parent?.adminId || undefined,
      taskId: sub.parentTaskId,
      type: 'Status',
      actorEmployee: employeeId,
      summary: `Employee ${empName} submitted sub-task #${sub.seq} for verification`,
    });
  } catch (e) {}
  await sub.populate({ path: 'assignTo', select: 'name', strictPopulate: false });
  const shaped = {
    _id: sub._id,
    taskName: parent?.taskName || sub.taskName,
    desc: parent?.desc || sub.desc,
    priority: parent?.priority || 'Medium',
    taskType: 'Recurring',
    status: sub.status,
    dueDate: sub.dueDate,
    assignTo: sub.assignTo,
    assignedByAdmin: parent?.assignedByAdmin || undefined,
    assignedBy: parent?.assignedBy || undefined,
    _type: 'subtask',
  };
  return shaped;
}

export async function updateSubTaskStatusByAdmin(subTaskId, adminId, status, note) {
  await connectDb();
  if (!['pending', 'completed'].includes(status)) throw new Error('Invalid status');
  const sub = await SubTask.findById(subTaskId);
  if (!sub) throw new Error('SubTask not found');
  const parent = await Task.findById(sub.parentTaskId)
    .populate({ path: 'assignedByAdmin', select: 'name', strictPopulate: false })
    .populate({ path: 'assignedBy', select: 'name', strictPopulate: false });
  if (!parent || String(parent.adminId) !== String(adminId)) throw new Error('Unauthorized');
  sub.status = status;
  await sub.save();
  const all = await SubTask.find({ parentTaskId: sub.parentTaskId });
  const anyPV = all.some((x) => x.status === 'pending_verification');
  const allCompleted = all.length > 0 && all.every((x) => x.status === 'completed');
  if (anyPV) parent.status = 'pending_verification';
  else if (allCompleted) parent.status = 'completed';
  else parent.status = 'pending';
  await parent.save();
  try {
    const admin = await Admin.findById(adminId).lean();
    const adminName = admin?.name || 'Admin';
    await recordActivity({
      adminId,
      taskId: sub.parentTaskId,
      type: 'Status',
      actorAdmin: adminId,
      summary: `Admin ${adminName} updated sub-task #${sub.seq} to ${status}`,
      details: note ? { note } : undefined,
    });
  } catch (e) {}
  await sub.populate({ path: 'assignTo', select: 'name', strictPopulate: false });
  const shaped = {
    _id: sub._id,
    taskName: parent?.taskName || sub.taskName,
    desc: parent?.desc || sub.desc,
    priority: parent?.priority || 'Medium',
    taskType: 'Recurring',
    status: sub.status,
    dueDate: sub.dueDate,
    assignTo: sub.assignTo,
    assignedByAdmin: parent?.assignedByAdmin || undefined,
    assignedBy: parent?.assignedBy || undefined,
    _type: 'subtask',
  };
  return shaped;
}