import validator from "validator";
import Task from "@/models/Task";
import Employee from "@/models/Employee";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { recordActivity } from "@/services/activityService";
import Admin from "@/models/Admin";
import { generateSubTasksForTask } from "@/services/subTaskService";

export async function addTaskService(data) {
  await connectDb();

  const {
    taskName,
    desc,
    priority,
    taskType,
    startDate,
    endDate,
    dueDate,
    adminId,
    assignTo,
    assignedBy,
  } = data || {};

  // Validate adminId
  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  // Validate taskName
  if (!taskName || !String(taskName).trim()) {
    throw new Error("Task name is required");
  }

  if (!desc || !String(desc).trim()) {
    throw new Error("Description is required");
  }

  if (!priority) {
    throw new Error("Priority is required");
  }

  if (!["Low", "Medium", "High"].includes(priority)) {
    throw new Error("Priority must be Low, Medium, or High");
  }

  if (!taskType) {
    throw new Error("Task type is required");
  }

  if (!["One-time", "Recurring"].includes(taskType)) {
    throw new Error("Task type must be One-time or Recurring");
  }

  // -----------------------
  // Date validations
  // -----------------------

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // One-time task → dueDate required
  if (taskType === "One-time") {
    if (!dueDate) {
      throw new Error("Due date is required for one-time tasks");
    }

    if (!validator.isISO8601(String(dueDate))) {
      throw new Error("Due date must be a valid date");
    }

    const due = new Date(dueDate);

    if (due < today) {
      throw new Error("Due date cannot be in the past");
    }
  }

  // Recurring task → startDate and endDate required
  if (taskType === "Recurring") {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required for recurring tasks");
    }
    if (!data?.frequency) {
      throw new Error("Frequency is required for recurring tasks");
    }
    if (!["Daily","Weekly","Monthly","Quarterly","Yearly"].includes(String(data.frequency))) {
      throw new Error("Invalid frequency for recurring tasks");
    }

    if (!validator.isISO8601(String(startDate)) || !validator.isISO8601(String(endDate))) {
      throw new Error("Start and end dates must be valid ISO dates");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new Error("Start date must be before end date");
    }

    if (start < today) {
      throw new Error("Start date cannot be in the past");
    }
  }

  // Validate assignTo if provided (allow single id or array)
  let assignToArray = [];
  if (assignTo) {
    const ids = Array.isArray(assignTo) ? assignTo : [assignTo];
    for (const id of ids) {
      // console.log('[DEBUG taskService] assignTo received:', id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid employee id for assignTo');
      }
      const employee = await Employee.findById(id).lean();
      if (!employee) throw new Error('Assigned employee not found');
      if (employee.adminId.toString() !== adminId) throw new Error('Assigned employee does not belong to this admin');
      assignToArray.push(id);
    }
  }

  const newTask = await Task.create({
    adminId,
    assignTo: assignToArray,
    // Default pending status explicitly to ensure it is present
    status: 'pending',
    // If initial assignees exist and creator is admin, record assignedBy
    assignedBy: Array.isArray(assignedBy) ? assignedBy : [],
    assignedByAdmin: assignToArray.length > 0 ? adminId : undefined,
    taskName,
    desc,
    priority,
    taskType,
    frequency: taskType === 'Recurring' ? data?.frequency : undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  // console.log('[DEBUG taskService] Created task, assignTo field:', newTask.assignTo);
  try {
    const admin = await Admin.findById(adminId).lean();
    const adminName = admin?.name || 'Admin';
    await recordActivity({
      adminId,
      taskId: newTask._id,
      type: 'Created',
      actorAdmin: adminId,
      summary: `Admin ${adminName} created task ${taskName}`,
    });
  } catch (e) {}
  try {
    if (newTask.taskType === 'Recurring') {
      await generateSubTasksForTask(newTask);
    }
  } catch (e) {}
  return newTask;
}

export async function getTaskService(adminId){
  await connectDb();
  if (!adminId) throw new Error('Admin ID is required');
  // console.log('[getTaskService] fetching tasks for adminId:', adminId);
  try {
    const tasks = await Task.find({ adminId })
      .populate({ path: 'assignTo', select: 'name', strictPopulate: false })
      .populate({ path: 'assignedBy', select: 'name', strictPopulate: false })
      .populate({ path: 'assignedByAdmin', select: 'name', strictPopulate: false });
    // console.log('[getTaskService] found tasks:', tasks.length, tasks);
    return tasks;
  } catch (err) {
    console.error('[getTaskService] populate error:', err.message, err.stack);
    // Fallback: return without populate if error
    const tasks = await Task.find({ adminId });
    // console.log('[getTaskService] fallack tasks:', tasks.length);
    return tasks;
  }
}

export async function updateTaskService(id, data, adminId){
  await connectDb();

  if(!id) throw new Error('Task id is required');
  if(!adminId) throw new Error('Admin ID is required');

  const task = await Task.findById(id);
  if(!task) throw new Error('Task not found');

  // Verify task belongs to this admin
  if (task.adminId.toString() !== adminId) {
    throw new Error('Unauthorized: task does not belong to this admin');
  }

  const { taskName, desc, priority, taskType, startDate, endDate, dueDate, frequency } = data || {};
  const { assignTo } = data || {};
  const changed = [];

  // Validate taskName if provided
  if (taskName !== undefined) {
    if (!taskName || !String(taskName).trim()) {
      throw new Error("Task name is required");
    }
    task.taskName = taskName;
    changed.push('taskName');
  }

  // Validate description if provided
  if (desc !== undefined) {
    if (!desc || !String(desc).trim()) {
      throw new Error("Description is required");
    }
    task.desc = desc;
    changed.push('desc');
  }

  // Validate priority if provided
  if (priority !== undefined) {
    if (!priority) {
      throw new Error("Priority is required");
    }
    if (!["Low", "Medium", "High"].includes(priority)) {
      throw new Error("Priority must be Low, Medium, or High");
    }
    task.priority = priority;
    changed.push('priority');
  }

  // Validate taskType if provided
  if (taskType !== undefined) {
    if (!taskType) {
      throw new Error("Task type is required");
    }
    if (!["One-time", "Recurring"].includes(taskType)) {
      throw new Error("Task type must be One-time or Recurring");
    }
    task.taskType = taskType;
    changed.push('taskType');
  }

  // -----------------------
  // Date validations
  // -----------------------

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If taskType is being changed or dates are being updated, validate accordingly
  const finalTaskType = taskType !== undefined ? taskType : task.taskType;
  const finalDueDate = dueDate !== undefined ? dueDate : task.dueDate;
  const finalStartDate = startDate !== undefined ? startDate : task.startDate;
  const finalEndDate = endDate !== undefined ? endDate : task.endDate;

  // One-time task → dueDate required
  if (finalTaskType === "One-time") {
    if (!finalDueDate) {
      throw new Error("Due date is required for one-time tasks");
    }

    if (!validator.isISO8601(String(finalDueDate))) {
      throw new Error("Due date must be a valid date");
    }

    const due = new Date(finalDueDate);

    if (due < today) {
      throw new Error("Due date cannot be in the past");
    }

    task.dueDate = new Date(finalDueDate);
    if (!changed.includes('dueDate')) changed.push('dueDate');
    if (task.frequency) {
      task.frequency = undefined;
      if (!changed.includes('frequency')) changed.push('frequency');
    }
  }

  // Recurring task → startDate and endDate required
  if (finalTaskType === "Recurring") {
    if (!finalStartDate || !finalEndDate) {
      throw new Error("Start date and end date are required for recurring tasks");
    }

    if (!validator.isISO8601(String(finalStartDate)) || !validator.isISO8601(String(finalEndDate))) {
      throw new Error("Start and end dates must be valid ISO dates");
    }

    const start = new Date(finalStartDate);
    const end = new Date(finalEndDate);

    if (start >= end) {
      throw new Error("Start date must be before end date");
    }

    if (start < today) {
      throw new Error("Start date cannot be in the past");
    }

    task.startDate = new Date(finalStartDate);
    task.endDate = new Date(finalEndDate);
    if (!changed.includes('startDate')) changed.push('startDate');
    if (!changed.includes('endDate')) changed.push('endDate');

    const incomingFrequency = frequency;
    const existingFrequency = task.frequency;
    const finalFrequency = incomingFrequency !== undefined ? incomingFrequency : existingFrequency;
    if (!finalFrequency) {
      throw new Error("Frequency is required for recurring tasks");
    }
    if (!["Daily","Weekly","Monthly","Quarterly","Yearly"].includes(String(finalFrequency))) {
      throw new Error("Invalid frequency for recurring tasks");
    }
    task.frequency = finalFrequency;
    if (incomingFrequency !== undefined && !changed.includes('frequency')) changed.push('frequency');
  }

  await task.save();
  // Handle assignTo update after validations
  if (assignTo !== undefined) {
    if (assignTo) {
      const raw = Array.isArray(assignTo) ? assignTo : [assignTo];
      const ids = [];
      for (let v of raw) {
        const id = typeof v === 'object' ? (v?._id || v) : v;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid employee id for assignTo');
        const employee = await Employee.findById(id).lean();
        if (!employee) throw new Error('Assigned employee not found');
        if (employee.adminId.toString() !== adminId) throw new Error('Assigned employee does not belong to this admin');
        ids.push(id);
      }
      task.assignTo = ids;
    } else {
      task.assignTo = [];
    }
    await task.save();
    changed.push('assignTo');
  }
  await task.populate([
    { path: 'assignTo', select: 'name', strictPopulate: false },
    { path: 'assignedBy', select: 'name', strictPopulate: false },
  ]);
  if (changed.length) {
    try {
      const admin = await Admin.findById(adminId).lean();
      const adminName = admin?.name || 'Admin';
      let summary = `Admin ${adminName} updated task ${task.taskName}`;
      if (changed.length === 1) {
        const f = changed[0];
        if (f === 'priority') summary = `Admin ${adminName} changed priority to ${task.priority}`;
        else if (f === 'dueDate') summary = `Admin ${adminName} changed due date to ${task.dueDate?.toISOString()?.slice(0,10)}`;
        else if (f === 'startDate') summary = `Admin ${adminName} changed start date to ${task.startDate?.toISOString()?.slice(0,10)}`;
        else if (f === 'endDate') summary = `Admin ${adminName} changed end date to ${task.endDate?.toISOString()?.slice(0,10)}`;
        else if (f === 'taskType') summary = `Admin ${adminName} changed task type to ${task.taskType}`;
        else if (f === 'taskName') summary = `Admin ${adminName} renamed task to ${task.taskName}`;
      }
      await recordActivity({
        adminId,
        taskId: task._id,
        type: 'Updated',
        actorAdmin: adminId,
        summary,
        details: { fields: changed },
      });
    } catch (e) {}
  }
  return task;
}

export async function addAssigneeService(taskId, assigneeId, actorId) {
  await connectDb();
  if (!taskId) throw new Error('Task id is required');
  if (!assigneeId) throw new Error('Assignee id is required');

  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');

  // actorId can be admin id or employee id; find actor role via Employee/Admin lookup
  // We'll ensure assignee belongs to same admin
  const assignee = await Employee.findById(assigneeId).lean();
  if (!assignee) throw new Error('Assignee employee not found');

  // Ensure actor (employee or admin) belongs to same admin as task
  if (actorId.toString() !== task.adminId.toString()) {
    const actorEmp = await Employee.findById(actorId).lean();
    if (!actorEmp) throw new Error('Unauthorized');
    if (actorEmp.adminId.toString() !== task.adminId.toString()) throw new Error('Unauthorized');
  }

  // Ensure assignee belongs to same admin
  if (assignee.adminId.toString() !== task.adminId.toString()) throw new Error('Assigned employee does not belong to this admin');

  const current = Array.isArray(task.assignTo)
    ? task.assignTo.map((v) => v)
    : (task.assignTo ? [task.assignTo] : []);

  // Prevent duplicates
  if (current.map(String).includes(String(assigneeId))) {
    throw new Error('Employee already assigned to this task');
  }

  const updated = [...current, assigneeId];
  task.assignTo = updated;
  task.markModified('assignTo');

  // Track who assigned
  const assignedBy = Array.isArray(task.assignedBy) ? task.assignedBy.map(String) : [];
  if (!assignedBy.includes(String(actorId))) {
    task.assignedBy = [...(Array.isArray(task.assignedBy) ? task.assignedBy : []), actorId];
    task.markModified('assignedBy');
  }
  // If admin performed assignment, also record assignedByAdmin
  if (String(actorId) === String(task.adminId)) {
    task.assignedByAdmin = actorId;
    task.markModified('assignedByAdmin');
  }
  await task.save();
  await task.populate([
    { path: 'assignTo', select: 'name', strictPopulate: false },
    { path: 'assignedBy', select: 'name', strictPopulate: false },
    { path: 'assignedByAdmin', select: 'name', strictPopulate: false },
  ]);
  try {
    const isAdminActor = String(actorId) === String(task.adminId);
    const actorEmp = isAdminActor ? null : await Employee.findById(actorId).lean();
    const actorAdminDoc = isAdminActor ? await Admin.findById(actorId).lean() : null;
    const assignee = await Employee.findById(assigneeId).lean();
    const actorName = isAdminActor ? (actorAdminDoc?.name || 'Admin') : (actorEmp?.name || 'Employee');
    const assigneeName = assignee?.name || 'Employee';
    await recordActivity({
      adminId: task.adminId,
      taskId: task._id,
      type: 'Updated',
      ...(isAdminActor ? { actorAdmin: actorId } : { actorEmployee: actorId }),
      summary: `${isAdminActor ? 'Admin' : 'Employee'} ${actorName} assigned task ${task.taskName} to employee ${assigneeName}`,
      details: { assigneeId },
    });
  } catch (e) {}
  // Propagate assignee to recurring subtasks
  try {
    if (task.taskType === 'Recurring') {
      const SubTask = (await import('@/models/SubTask')).default;
      await SubTask.updateMany(
        { parentTaskId: task._id },
        { $addToSet: { assignTo: assigneeId } }
      );
    }
  } catch (e) {}
  return task;
}
export async function deleteTaskService(id, adminId){
  await connectDb();
  if(!id) throw new Error('Task id is required');
  if(!adminId) throw new Error('Admin ID is required');

  const task = await Task.findById(id);
  if(!task) throw new Error('Task not found');

  // Verify task belongs to this admin
  if (task.adminId.toString() !== adminId) {
    throw new Error('Unauthorized: task does not belong to this admin');
  }

  const deleted = await Task.findByIdAndDelete(id);
  if(!deleted) throw new Error('Task not found');
  try {
    const admin = await Admin.findById(adminId).lean();
    const adminName = admin?.name || 'Admin';
    await recordActivity({
      adminId,
      taskId: deleted._id,
      type: 'Deleted',
      actorAdmin: adminId,
      summary: `Admin ${adminName} deleted task ${deleted.taskName}`,
    });
  } catch (e) {}
  return deleted;
}

export async function getTasksForEmployee(employeeId) {
  await connectDb();
  if (!employeeId) throw new Error('Employee id is required');
  try {
    return await Task.find({ assignTo: employeeId })
      .populate({ path: 'assignTo', select: 'name', strictPopulate: false })
      .populate({ path: 'assignedBy', select: 'name', strictPopulate: false })
      .populate({ path: 'assignedByAdmin', select: 'name', strictPopulate: false });
  } catch (err) {
    console.error('[DEBUG getTasksForEmployee] populate error:', err.message);
    return await Task.find({ assignTo: employeeId });
  }
}

export async function updateTaskStatusByEmployee(taskId, employeeId, status) {
  await connectDb();
  if (!taskId) throw new Error('Task id is required');
  if (!employeeId) throw new Error('Employee id is required');
  if (!['pending', 'pending_verification'].includes(status)) throw new Error('Invalid status');
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');
  const assigned = Array.isArray(task.assignTo) ? task.assignTo.map(String) : [String(task.assignTo)].filter(Boolean);
  if (!assigned.includes(String(employeeId))) throw new Error('Unauthorized');
  task.status = status;
  await task.save();
  await task.populate([
    { path: 'assignTo', select: 'name', strictPopulate: false },
    { path: 'assignedBy', select: 'name', strictPopulate: false },
  ]);
  try {
    const emp = await Employee.findById(employeeId).lean();
    const empName = emp?.name || 'Employee';
    await recordActivity({
      adminId: task.adminId,
      taskId: task._id,
      type: 'Status',
      actorEmployee: employeeId,
      summary: `Employee ${empName} updated status to ${status}`,
    });
  } catch (e) {}
  return task;
}

export async function updateTaskStatusByAdmin(taskId, adminId, status, note) {
  await connectDb();
  if (!taskId) throw new Error('Task id is required');
  if (!adminId) throw new Error('Admin id is required');
  if (!['pending', 'completed'].includes(status)) throw new Error('Invalid status');
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');
  if (String(task.adminId) !== String(adminId)) throw new Error('Unauthorized');
  if (task.taskType === 'Recurring') {
    const SubTask = (await import('@/models/SubTask')).default;
    const pv = await SubTask.find({ parentTaskId: taskId, status: 'pending_verification' }).sort({ seq: 1, dueDate: 1 });
    const target = pv[0] || null;
    if (!target) {
      await task.populate([
        { path: 'assignTo', select: 'name', strictPopulate: false },
        { path: 'assignedBy', select: 'name', strictPopulate: false },
      ]);
      return task;
    }
    target.status = status;
    await target.save();
    const all = await SubTask.find({ parentTaskId: taskId });
    const anyPV = all.some((x) => x.status === 'pending_verification');
    const allCompleted = all.length > 0 && all.every((x) => x.status === 'completed');
    if (anyPV) task.status = 'pending_verification';
    else if (allCompleted) task.status = 'completed';
    else task.status = 'pending';
    if (note) task.approvalNote = note;
    await task.save();
    await task.populate([
      { path: 'assignTo', select: 'name', strictPopulate: false },
      { path: 'assignedBy', select: 'name', strictPopulate: false },
    ]);
    try {
      const admin = await Admin.findById(adminId).lean();
      const adminName = admin?.name || 'Admin';
      let summary = `Admin ${adminName} ${status === 'completed' ? 'approved' : 'rejected'} sub-task #${target.seq}`;
      await recordActivity({
        adminId,
        taskId: task._id,
        type: 'Status',
        actorAdmin: adminId,
        summary,
        details: note ? { note } : undefined,
      });
    } catch (e) {}
    return task;
  } else {
    const prevStatus = task.status;
    task.status = status;
    if (note) task.approvalNote = note;
    await task.save();
    await task.populate([
      { path: 'assignTo', select: 'name', strictPopulate: false },
      { path: 'assignedBy', select: 'name', strictPopulate: false },
    ]);
    try {
      const admin = await Admin.findById(adminId).lean();
      const adminName = admin?.name || 'Admin';
      let summary = `Admin ${adminName} updated status to ${status}`;
      if (prevStatus === 'pending_verification' && status === 'completed') summary = `Admin ${adminName} approved task ${task.taskName}`;
      else if (prevStatus === 'pending_verification' && status === 'pending') summary = `Admin ${adminName} rejected task ${task.taskName}`;
      await recordActivity({
        adminId,
        taskId: task._id,
        type: 'Status',
        actorAdmin: adminId,
        summary,
        details: note ? { note } : undefined,
      });
    } catch (e) {}
    return task;
  }
}