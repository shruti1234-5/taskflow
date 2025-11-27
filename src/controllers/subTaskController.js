import { NextResponse } from 'next/server';
import { getAdminIdFromRequest, decodeTokenFromRequest } from '@/lib/requestAuth';
import { updateSubTaskStatusByEmployee, updateSubTaskStatusByAdmin } from '@/services/subTaskService';

export async function updateSubTaskStatusController(req, { params }) {
  try {
    const decoded = decodeTokenFromRequest(req);
    if (!decoded) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const { id: actorId, role } = decoded;
    const { id } = params;
    const body = await req.json();
    const { status, note } = body || {};
    if (!status) return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    if (role === 'employee') {
      const result = await updateSubTaskStatusByEmployee(id, actorId, status);
      return NextResponse.json({ success: true, data: result }, { status: 200 });
    }
    if (role === 'admin') {
      const adminId = await getAdminIdFromRequest(req);
      const result = await updateSubTaskStatusByAdmin(id, adminId, status, note);
      return NextResponse.json({ success: true, data: result }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'Unsupported role' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}