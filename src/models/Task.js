import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  assignTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  assignedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  assignedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  status: {
    type: String,
    enum: ["pending", "pending_verification", "completed"],
    default: "pending",
  },
  approvalNote: { type: String },
  taskName: String,
  desc: String,
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    taskType: {
      type: String,
    },
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
    },
    dueDate: {
      type: Date,
       },
     startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task|| mongoose.model("Task",taskSchema);