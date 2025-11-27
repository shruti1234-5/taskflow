"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import TaskCard from "@/components/TaskCard";

export default function MyTasksPage() {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/task/my', { credentials: 'same-origin' });
        const json = await res.json();
        if (json?.success) setMyTasks(json.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submitForVerification = async (id, isSubTask) => {
    try {
      const url = isSubTask ? `/api/subtask/${id}/status` : `/api/task/${id}/status`;
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_verification' })
      });
      const json = await res.json();
      if (json?.success) {
        enqueueSnackbar('Submitted for verification', { variant: 'success' });
        setMyTasks((prev) => prev.map((t) => (t._id === id ? json.data : t)));
      }
    } catch (e) {}
  };


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0f0f11] transition-colors duration-300 p-4 md:p-8">

      {/* Page Title */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          My Tasks
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Verify your tasks and manage your assignments
        </p>
      </div>

      {/* Task Sections */}
      <div className="space-y-6 mt-6">

        {/* Active Tasks Section */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="w-full overflow-hidden rounded-xl border-2 border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 shadow-sm hover:shadow-lg transition-all duration-300">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-700 dark:to-yellow-600 text-gray-900 dark:text-gray-100 font-bold">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:lightning-bolt" width="24" />
                <div>
                  <div>My Active Tasks</div>
                  <p className="text-sm font-normal text-gray-800 dark:text-gray-200">
                    View and manage your pending and active tasks.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
              ) : myTasks.filter((t) => t.status !== 'completed').length === 0 ? (
                <div className="text-center py-8">
                  <Icon icon="mdi:inbox-multiple" width="40" className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No active tasks</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl-grid-cols-3 gap-4">
                  {myTasks.filter((t) => t.status !== 'completed').map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      variant="employee"
                      onStatusUpdate={(_, next) => next === 'pending_verification' ? submitForVerification(t._id, t._type === 'subtask') : null}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completed Tasks Section */}
        <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="w-full overflow-hidden rounded-xl border-2 border-teal-200 dark:border-teal-900/50 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/10 shadow-sm hover:shadow-lg transition-all duration-300">

            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-400 to-teal-500 dark:from-teal-700 dark:to-teal-600 text-gray-900 dark:text-gray-100 font-bold">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:progress-check" width="24" />
                <div>
                  <div>Completed Tasks</div>
                  <p className="text-sm font-normal text-gray-800 dark:text-gray-200">
                    History of your completed tasks.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-8">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
              ) : myTasks.filter((t) => t.status === 'completed').length === 0 ? (
                <div className="text-center">
                  <Icon icon="mdi:check-decagram" width="40" className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No completed tasks</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl-grid-cols-3 gap-4">
                  {myTasks.filter((t) => t.status === 'completed').map((t) => (
                    <TaskCard key={t._id} task={t} variant="viewer" />
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
