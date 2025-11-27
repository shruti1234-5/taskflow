import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    type: { type: String, enum: ['Created', 'Updated', 'Deleted', 'Status'], required: true },
    actorAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    actorEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    summary: { type: String, required: true },
    details: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema);