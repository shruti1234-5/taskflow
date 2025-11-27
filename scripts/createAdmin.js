import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); 

import adminModel from '../src/models/Admin.js'
async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
// console.log("MONGODB_URI =", process.env.MONGODB_URI); 
  const name = " Admin2";
  const email = "admin2@example.com";
  const password = await bcrypt.hash("admin", 10);

  await adminModel.create({ name, email, password });
  console.log("Admin created successfully!");
  process.exit(0);
}
createAdmin();