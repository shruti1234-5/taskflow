import Employee from "@/models/Employee";
import { connectDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import validator from "validator";

export async function addEmployeeService(data) {
  await connectDb();

  const { name, email, contact, password, dept, adminId } = data;

  // Validate adminId
  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  // BASIC VALIDATIONS
  if (!name || name.length < 3) {
    throw new Error("Name must be at least 3 characters");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }

  if (!validator.isMobilePhone(contact + "", "any")) {
    throw new Error("Invalid contact number");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // UNIQUE EMAIL CHECK (within this admin only)
  const exists = await Employee.findOne({ email, adminId });
  if (exists) {
    throw new Error("Email already exists for this admin");
  }

  // HASH PASSWORD
  const hashed = await bcrypt.hash(password, 10);

  const newEmployee = await Employee.create({
    adminId,
    name,
    email,
    contact,
    password: hashed,
    dept,
  });

  return newEmployee;
}

export async function getEmployeeService(adminId){
  await connectDb();
  if (!adminId) throw new Error('Admin ID is required');
  return Employee.find({ adminId });
}

export async function updateEmployeeService(data, adminId){
  await connectDb();    
  const { id, name, email, contact, password, dept } = data;

  if (!id) {
    throw new Error("Employee ID is required for update");
  }
  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new Error("Employee not found");
  }

  // Verify employee belongs to this admin
  if (employee.adminId.toString() !== adminId) {
    throw new Error("Unauthorized: employee does not belong to this admin");
  }

  if (name && name.length >= 3) {
    employee.name = name;
  }   

  if (email && validator.isEmail(email)) {
    // Check for unique email within this admin
    const exists = await Employee.findOne({ email, adminId, _id: { $ne: id } });
    if (exists) {
      throw new Error("Email already exists for this admin");
    }       
    employee.email = email;
  }
  if (contact && validator.isMobilePhone(contact + "", "any")) {
    employee.contact = contact;
  }   
  if (password && password.length >= 6) {
    const hashed = await bcrypt.hash(password, 10);
    employee.password = hashed;
  }
  if (dept) {
    employee.dept = dept;
  }
  const updatedEmployee = await employee.save();
  return updatedEmployee; 
}

export async function deleteEmployeeService(id, adminId) {
  await connectDb();

  if (!id) throw new Error("Employee ID is required");
  if (!adminId) throw new Error("Admin ID is required");

  const employee = await Employee.findById(id);
  if (!employee) throw new Error("Employee not found");

  // Verify employee belongs to this admin
  if (employee.adminId.toString() !== adminId) {
    throw new Error("Unauthorized: employee does not belong to this admin");
  }

  const deleted = await Employee.findByIdAndDelete(id);
  return deleted;
}

export async function searchEmployeeService(searchText, adminId) {
  await connectDb();

  if (!adminId) throw new Error("Admin ID is required");

  const query = {
    adminId,
    $or: [
      { name: { $regex: searchText, $options: "i" } },
      { email: { $regex: searchText, $options: "i" } },
      { contact: { $regex: searchText, $options: "i" } },
      { dept: { $regex: searchText, $options: "i" } },
    ],
  };

  return Employee.find(query);
}
