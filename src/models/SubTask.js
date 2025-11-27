import mongoose from 'mongoose';

const subTaskSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    assignTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    status: { type: String, enum: ['pending', 'pending_verification', 'completed'], default: 'pending' },
    seq: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    taskName: { type: String },
    desc: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SubTask || mongoose.model('SubTask', subTaskSchema);