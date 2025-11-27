import { NextResponse } from "next/server";
import { addTaskService, getTaskService, updateTaskService, deleteTaskService, addAssigneeService, getTasksForEmployee, updateTaskStatusByEmployee, updateTaskStatusByAdmin } from "@/services/taskService";
import { getSubTasksForEmployeeFiltered, getSubTasksForEmployeeCompleted } from "@/services/subTaskService";
import { getAdminIdFromRequest, decodeTokenFromRequest } from "@/lib/requestAuth";

export async function createTaskController(req) {
    try{
        const adminId = await getAdminIdFromRequest(req);
        const body = await req.json();
        body.adminId = adminId;
        // console.log('[createTaskController] body:', body);
        const result = await addTaskService(body);
        // console.log('[createTaskController] created task:', result);
        return NextResponse.json({success:true, data: result},{status: 201})
    } catch(err){
      console.error('[createTaskController] error:', err.message, err.stack);
      return NextResponse.json({success:false, error:err.message},{status: 400})
    }
}

export async function getTaskController(req){
    try{
        const adminId = await getAdminIdFromRequest(req);
        // console.log('[getTaskController] fetching tasks for adminId:', adminId);
        const data = await getTaskService(adminId);
        // console.log('[getTaskController] returned data length:', data.length);
        return NextResponse.json({ success: true, data}, {status:200}); 
    }   
  catch(err){
    console.error('[getTaskController] error:', err.message, err.stack);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }       
}

export async function getMyTasksController(req) {
  try {
    const decoded = decodeTokenFromRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { id, role } = decoded;
    // console.log('[getMyTasksController] user id:', id, 'role:', role);
    
    if (role === 'employee') {
      const [mainTasks, subTasksVisible, subTasksCompleted] = await Promise.all([
        getTasksForEmployee(id),
        getSubTasksForEmployeeFiltered(id),
        getSubTasksForEmployeeCompleted(id),
      ]);
      const oneTime = (mainTasks || []).filter((t) => t.taskType !== 'Recurring');
      const subs = (subTasksVisible || []).map((s) => {
        const obj = s?.toObject?.() || s;
        return {
          _id: obj._id,
          taskName: obj.taskName,
          desc: obj.desc,
          priority: obj.parentTaskId?.priority || 'Medium',
          taskType: 'Recurring',
          status: obj.status,
          dueDate: obj.dueDate,
          assignTo: obj.assignTo,
          assignedByAdmin: obj.parentTaskId?.assignedByAdmin || undefined,
          assignedBy: obj.parentTaskId?.assignedBy || undefined,
          _type: 'subtask',
        };
      });
      const subsDone = (subTasksCompleted || []).map((s) => {
        const obj = s?.toObject?.() || s;
        return {
          _id: obj._id,
          taskName: obj.taskName,
          desc: obj.desc,
          priority: obj.parentTaskId?.priority || 'Medium',
          taskType: 'Recurring',
          status: obj.status,
          dueDate: obj.dueDate,
          assignTo: obj.assignTo,
          assignedByAdmin: obj.parentTaskId?.assignedByAdmin || undefined,
          assignedBy: obj.parentTaskId?.assignedBy || undefined,
          _type: 'subtask',
        };
      });
      const data = [...subs, ...oneTime, ...subsDone];
      // console.log('[getMyTasksController] oneTime:', oneTime.length, 'subs visible:', subs.length);
      return NextResponse.json({ success: true, data }, { status: 200 });
    }

    if (role === 'admin') {
      // return admin's tasks
      const data = await getTaskService(id);
      // console.log('[getMyTasksController] tasks for admin:', data.length);
      return NextResponse.json({ success: true, data }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Unsupported role' }, { status: 400 });
  } catch (err) {
    console.error('[getMyTasksController] error:', err.message, err.stack);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function addAssigneeController(req, { params }) {
  try {
    const decoded = decodeTokenFromRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const actorId = decoded.id;
    const { id } = params; // task id
    const body = await req.json();
    const { assigneeId } = body || {};
    const result = await addAssigneeService(id, assigneeId, actorId);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function updateTaskController(req, { params }) {
  try {
    const adminId = await getAdminIdFromRequest(req);
    const { id } = params;
    const body = await req.json();
    const result = await updateTaskService(id, body, adminId);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

export async function deleteTaskController(req, { params }) {
  try {
    const adminId = await getAdminIdFromRequest(req);
    const { id } = params;
    const result = await deleteTaskService(id, adminId);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

export async function getAssignedByMeController(req) {
  try {
    const decoded = decodeTokenFromRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const { id, role } = decoded;
    if (role !== 'employee') return NextResponse.json({ success: false, error: 'Unsupported role' }, { status: 400 });
    const adminId = await getAdminIdFromRequest(req);
    // Tasks under same admin where assignedBy includes current employee
  const tasks = await (await import("@/models/Task")).default
      .find({ adminId, assignedBy: id })
      .populate({ path: 'assignTo', select: 'name', strictPopulate: false })
      .populate({ path: 'assignedBy', select: 'name', strictPopulate: false });
    return NextResponse.json({ success: true, data: tasks }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function updateTaskStatusController(req, { params }) {
  try {
    const decoded = decodeTokenFromRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const { id: actorId, role } = decoded;
    const { id } = params;
    const body = await req.json();
    const { status, note } = body || {};
    if (!status) return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    if (role === 'employee') {
      const result = await updateTaskStatusByEmployee(id, actorId, status);
      return NextResponse.json({ success: true, data: result }, { status: 200 });
    }
    if (role === 'admin') {
      const adminId = await getAdminIdFromRequest(req);
      const result = await updateTaskStatusByAdmin(id, adminId, status, note);
      return NextResponse.json({ success: true, data: result }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'Unsupported role' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}