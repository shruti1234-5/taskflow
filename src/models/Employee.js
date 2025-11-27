import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
     adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    name: String,
    email: {
        type: String,
        unique: true
    },
    contact: String,
    password: String,
    dept: String
    
})

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
  
//  const employeemodel = mongoose.model('employee',EmployeeSchema)
//  export default employeemodel;