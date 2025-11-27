import { NextResponse } from 'next/server';
import { getActivitiesService } from '@/services/activityService';
import { getAdminIdFromRequest } from '@/lib/requestAuth';

export async function getActivityController(req) {
  try {
    const adminId = await getAdminIdFromRequest(req);
    const type = req.nextUrl.searchParams.get('type') || undefined;
    const employeeId = req.nextUrl.searchParams.get('employeeId') || undefined;
    const data = await getActivitiesService(adminId, { type, employeeId });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}