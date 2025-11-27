import { NextResponse } from "next/server";
import { addEmployeeService, getEmployeeService, searchEmployeeService, updateEmployeeService, deleteEmployeeService } from "@/services/employeeService";
import { getAdminIdFromRequest } from "@/lib/requestAuth";

export async function createEmployeeController(req) {
  try {
    const adminId = await getAdminIdFromRequest(req);
    const body = await req.json();
    body.adminId = adminId;
    const result = await addEmployeeService(body);

    const safe = result?.toObject?.() || result;
    delete safe?.password;

    return NextResponse.json({ success: true, data: safe }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function getEmployeeController(req) {
  try {
    const adminId = await getAdminIdFromRequest(req);
    const search = req.nextUrl.searchParams.get("search");

    let data;

    if (search && search.trim() !== "") {
      data = await searchEmployeeService(search.trim(), adminId);
    } else {
      data = await getEmployeeService(adminId);
    }

    const safe = data.map(d => {
      const obj = d?.toObject?.() || d;
      delete obj?.password;
      return obj;
    });

    return NextResponse.json({ success: true, data: safe }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function updateEmployeeController(req, { params }) {
  try {
    const adminId = await getAdminIdFromRequest(req);
    const data = await req.json();
    data.id = params?.id || data.id;
    const result = await updateEmployeeService(data, adminId);

    const safe = result?.toObject?.() || result;
    delete safe?.password;

    return NextResponse.json({ success: true, data: safe }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function deleteEmployeeController(req, { params }) {
  try {
    const adminId = await getAdminIdFromRequest(req);
    const { id } = params;
    const result = await deleteEmployeeService(id, adminId);

    const safe = result?.toObject?.() || result;
    delete safe?.password;

    return NextResponse.json({ success: true, data: safe }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
