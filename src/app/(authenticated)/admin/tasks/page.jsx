"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import CreateTaskForm from "@/components/CreateTask";
import TaskCard from "@/components/TaskCard";

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch tasks from backend
  const refreshTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch("/api/task", { method: "GET", credentials: "same-origin" });
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (err) {
      console.log("Error loading tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
     const res = await fetch(`/api/task/${id}`, {
  method: "DELETE",
  credentials: "same-origin",
});
const json = await res.json();
      if (json.success) {
        setTasks((t) => t.filter((task) => task._id !== id));
        enqueueSnackbar('Task deleted', { variant: 'success' });
      } else {
        enqueueSnackbar(json.error || "Failed to delete task", { variant: 'error' });
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      enqueueSnackbar("Error deleting task", { variant: 'error' });
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingTask(null);
    refreshTasks();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0f0f11] transition-colors duration-300 p-4 md:p-8">

      {/* Page Title */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          Tasks Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Manage and track your teams tasks with ease
        </p>
      </div>

      {/* Top Action Bar */}
      <div
        className="flex items-center justify-between mb-8 flex-wrap gap-4 animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        {/* Create Task Button */}
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md 
          hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm"
        >
          <Icon icon={showForm ? "mdi:close-circle" : "mdi:plus-circle"} width="18" />
          {showForm ? "Close Form" : "Create Task"}
        </button>
      </div>

      {/* --- THE CREATE TASK FORM (Similar to Assign Task Form) --- */}
      {showForm && (
        <CreateTaskForm
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
          task={editingTask}
          isEdit={!!editingTask}
          onSave={handleFormSave}
        />
      )}

      {/* Task Sections */}
      <div className="space-y-6">

        {/* Pending Verification Badge */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="w-full overflow-hidden rounded-xl border-2 border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 shadow-sm hover:shadow-lg transition-all duration-300">
            
            {/* Header with Icon */}
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-700 dark:to-yellow-600 text-gray-900 dark:text-gray-100 font-bold flex items-center gap-3">
              <Icon icon="mdi:clock-alert" width="24" />
              <div>
                <div>Task Pending Verification</div>
                <p className="text-sm font-normal text-gray-800 dark:text-gray-200 mt-1">
                  These tasks require admin verification before marking as completed.
                </p>
              </div>
            </div>
            
            {/* Body */}
            <div className="px-6 py-8">
              {!loadingTasks && tasks.filter((t) => t.status === 'pending_verification').length === 0 ? (
                <div className="text-center">
                  <Icon icon="mdi:inbox-multiple" width="40" className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No pending tasks for verification</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {tasks.filter((t) => t.status === 'pending_verification').map((task, i) => (
                    <div key={task._id} style={{ animationDelay: `${100 * i}ms` }} className="animate-fade-in">
                      <TaskCard task={task} variant="viewer" />
                      <AdminApprovalButtons task={task} onUpdated={refreshTasks} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Tasks Badge */}
        <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="w-full overflow-hidden rounded-xl border-2 border-teal-200 dark:border-teal-900/50 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/10 shadow-sm hover:shadow-lg transition-all duration-300">
            
            {/* Header with Icon */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-400 to-teal-500 dark:from-teal-700 dark:to-teal-600 text-gray-900 dark:text-gray-100 font-bold flex items-center gap-3">
              <Icon icon="mdi:list-box" width="24" />
              <div>
                <div>All Tasks</div>
                <p className="text-sm font-normal text-gray-800 dark:text-gray-200 mt-1">
                  View and manage all tasks created within the organization.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-8">
              
              {/* Loading */}
              {loadingTasks && (
                <div className="text-center py-10">
                  <Icon icon="mdi:loading" width="40" className="mx-auto animate-spin text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading tasks...</p>
                </div>
              )}

              {/* No Tasks */}
              {!loadingTasks && tasks.length === 0 && (
                <div className="text-center">
                  <Icon icon="mdi:inbox" width="40" className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No tasks available yet</p>
                </div>
              )}

              {/* Task Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {tasks.map((task, i) => (
                  <div key={task._id} style={{ animationDelay: `${100 * i}ms` }} className="animate-fade-in">
                    <TaskCard
                      task={task}
                      variant={task.status === 'completed' ? 'viewer' : 'admin'}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Completed Tasks Badge */}
        <div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
          <div className="w-full overflow-hidden rounded-xl border-2 border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 shadow-sm hover:shadow-lg transition-all duration-300">
            {/* Header with Icon */}
            <div className="px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 dark:from-green-700 dark:to-green-600 text-gray-900 dark:text-gray-100 font-bold flex items-center gap-3">
              <Icon icon="mdi:check-decagram" width="24" />
              <div>
                <div>Completed Tasks</div>
                <p className="text-sm font-normal text-gray-800 dark:text-gray-200 mt-1">
                  All tasks marked as completed.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-8">
              {!loadingTasks && tasks.filter((t) => t.status === 'completed').length === 0 ? (
                <div className="text-center">
                  <Icon icon="mdi:inbox" width="40" className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No completed tasks</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {tasks.filter((t) => t.status === 'completed').map((task, i) => (
                    <div key={task._id} style={{ animationDelay: `${100 * i}ms` }} className="animate-fade-in">
                      <TaskCard task={task} variant="viewer" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

    </div>
  );
}
      {/* Inline modal component */}
      function AdminApprovalButtons({ task, onUpdated }) {
        const [open, setOpen] = useState(false);
        const [note, setNote] = useState("");
        const submit = async (status) => {
          try {
            const res = await fetch(`/api/task/${task._id}/status`, {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status, note })
            });
            const json = await res.json();
            if (json?.success) {
              setOpen(false);
              setNote("");
              onUpdated?.();
            }
          } catch (e) {}
        };
        return (
          <div>
            <button onClick={() => setOpen(true)} className="mt-2 px-3 py-1.5 text-xs rounded bg-blue-600 text-white">Review</button>
            {open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md">
                  <h4 className="text-lg font-semibold mb-2">Approve or Reject</h4>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full p-2 rounded border dark:border-gray-700 bg-gray-50 dark:bg-gray-900" placeholder="Add a description or note" />
                  <div className="mt-3 flex justify-end gap-2">
                    <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs rounded bg-gray-500 text-white">Cancel</button>
                    <button onClick={() => submit('pending')} className="px-3 py-1.5 text-xs rounded bg-red-600 text-white">Reject</button>
                    <button onClick={() => submit('completed')} className="px-3 py-1.5 text-xs rounded bg-green-600 text-white">Approve</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
