import { connectDb } from '@/lib/db';
import Admin from '@/models/Admin';
import Employee from '@/models/Employee';
import { decodeTokenFromRequest } from '@/lib/requestAuth';

export async function GET(req) {
  await connectDb();
  try {
    const decoded = decodeTokenFromRequest(req);
    if (!decoded) return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), { status: 401 });

    const { id, role } = decoded;
    let name = null;

    if (role === 'admin') {
      const admin = await Admin.findById(id).lean();
      name = admin?.name || null;
    } else {
      const emp = await Employee.findById(id).lean();
      name = emp?.name || null;
    }

    return new Response(JSON.stringify({ success: true, data: { id, name, role } }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch user' }), { status: 500 });
  }
}
