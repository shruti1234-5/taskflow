"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";


export default function AssignTasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [assignedByMe, setAssignedByMe] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAssigned = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/task/assigned-by/me', { credentials: 'same-origin' });
      const json = await res.json();
      if (json?.success) setAssignedByMe(json.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAssigned();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0f0f11] transition-colors duration-300 p-4 md:p-8">

      {/* Page Title */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          Assign Tasks
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Assign and manage tasks for your team members
        </p>
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        
        {/* Assign Task Button */}
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md 
          hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm"
        >
           <Icon
      icon={showForm ? "mdi:close-circle" : "mdi:plus-circle"}
      width="18"
    />
          {showForm ? "Close Form" : "Assign Task"}
        </button>
      </div>

      {/* --- THE NEW FORM APPEARS HERE --- */}
      {showForm && (
        <TaskForm onCancel={() => setShowForm(false)} onAssigned={refreshAssigned} />
      )}

      {/* Task Section (moves down automatically) */}
      <div className="animate-fade-in mt-6" style={{ animationDelay: "200ms" }}>
        <div className="w-full overflow-hidden rounded-xl border-2 border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 shadow-sm hover:shadow-lg transition-all duration-300">

          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-700 dark:to-yellow-600 text-gray-900 dark:text-gray-100 font-bold flex items-center gap-3">
            <Icon icon="mdi:send-check" width="24" />
            <div>
              <div>Tasks you have assigned</div>
              <p className="text-sm font-normal text-gray-800 dark:text-gray-200 mt-1">
                History of tasks assigned to your colleagues.
              </p>
            </div>
          </div>

          <div className="border-t border-yellow-300 dark:border-yellow-700/50"></div>

          <div className="px-6 py-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
            ) : assignedByMe.length === 0 ? (
              <div className="text-center py-8">
                <Icon icon="mdi:inbox-send" width="48" className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">You haven&apos;t assigned any tasks yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Start by clicking the &quot;Assign Task&quot; button above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {assignedByMe.map((t) => (
                  <TaskCard key={t._id} task={t} variant="viewer" />
                ))}
              </div>
            )}
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
