"use client";

import { Icon } from "@iconify/react";

export default function TaskCard({ task, onEdit, onDelete, variant = 'admin', onStatusUpdate }) {
  // Priority color mapping
  const priorityColors = {
    High: {
      badge: "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200",
      icon: "text-red-500",
    },
    Medium: {
      badge: "bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200",
      icon: "text-yellow-500",
    },
    Low: {
      badge: "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200",
      icon: "text-green-500",
    },
  };

  const typeColors = {
    "One-time": {
      badge: "bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200",
      icon: "text-indigo-500",
    },
    Recurring: {
      badge: "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200",
      icon: "text-purple-500",
    },
  };

  const statusColors = {
    pending: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
    pending_verification: "bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200",
    completed: "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200",
  };

  const priorityColor = priorityColors[task.priority] || priorityColors.Low;
  const typeColor = typeColors[task.taskType] || typeColors["One-time"];

  return (
    <div
      className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {task.taskName}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-lg font-medium ${typeColor.badge}`}>{task.taskType}</span>
          {task.status && (
            <span className={`px-2 py-1 text-xs rounded-lg font-medium ${statusColors[task.status] || statusColors.pending}`}>{task.status.replace('_',' ')}</span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {task.desc}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Priority Badge */}
        <span className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full font-medium ${priorityColor.badge}`}>
          <Icon icon="mdi:flag" width="14" />
          {task.priority}
        </span>

        {/* Due Date / Start-End Date Badge */}
        {(task.taskType === "One-time" || task._type === 'subtask') ? (
          <span className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200">
            <Icon icon="mdi:calendar-clock" width="14" />
            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
          </span>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full font-medium bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-200">
            <Icon icon="mdi:calendar-range" width="14" />
            {task.startDate ? new Date(task.startDate).toLocaleDateString() : "N/A"} - {task.endDate ? new Date(task.endDate).toLocaleDateString() : "N/A"}
          </span>
        )}
      </div>

      {/* Assigned To */}
      {task.assignTo && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Assigned to:</strong> {Array.isArray(task.assignTo)
            ? task.assignTo.map((e) => e?.name || e).join(', ')
            : (task.assignTo?.name || task.assignTo)}
        </div>
      )}

      {(task.assignedByAdmin || task.assignedBy) && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Assigned by:</strong> {task.assignedByAdmin?.name
            ? task.assignedByAdmin.name
            : Array.isArray(task.assignedBy)
              ? task.assignedBy.map((e) => e?.name || e).join(', ')
              : (task.assignedBy?.name || task.assignedBy || 'Admin')}
        </div>
      )}

      {/* Footer - Action Buttons */}
      <div className="flex justify-between mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        {variant === 'employee' ? (
          <button
            onClick={() => onStatusUpdate?.(task, 'pending_verification')}
            disabled={task.status && task.status !== 'pending'}
            className={`flex items-center gap-1 text-sm font-medium transition ${
              task.status && task.status !== 'pending'
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-yellow-600 dark:text-yellow-300 hover:text-yellow-700 dark:hover:text-yellow-200'
            }`}
          >
            <Icon icon="mdi:update" width="16" /> Update Status
          </button>
        ) : variant === 'viewer' ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">&nbsp;</span>
        ) : (
          <>
            <button
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 text-sm text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-200 font-medium transition"
            >
              <Icon icon="mdi:pencil" width="16" /> Edit
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition"
            >
              <Icon icon="mdi:delete" width="16" /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
