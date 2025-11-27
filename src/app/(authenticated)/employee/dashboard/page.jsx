"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function EmployeeDashboard() {

  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/task/my", { credentials: "same-origin" });
        const json = await res.json();
        if (json?.success) setTasks(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const pendingVerification = tasks.filter((t) => t.status === "pending_verification").length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueToday = tasks.filter((t) => t.taskType === "One-time" && t.dueDate && new Date(t.dueDate).setHours(0,0,0,0) === today.getTime()).length;
    const overdue = tasks.filter((t) => t.taskType === "One-time" && t.dueDate && new Date(t.dueDate) < today && t.status !== "completed").length;
    return { total, completed, pending, pendingVerification, dueToday, overdue };
  }, [tasks]);

  const recentAssigned = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 2);
  }, [tasks]);

  const dueTodayList = useMemo(() => tasks.filter((t) => t.taskType === "One-time" && t.dueDate && new Date(t.dueDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)), [tasks]);
  const overdueList = useMemo(() => tasks.filter((t) => t.taskType === "One-time" && t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"), [tasks]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0f0f11] transition-colors duration-300 p-4 md:p-8">

      {/* Page Title + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            My Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Overview of my tasks and assignments
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Assign Task Button */}
          <button
           onClick={() => router.push("/employee/assign-tasks")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 
                       hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm
                       transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <Icon icon="mdi:plus-circle" width="18" />
            <span className="hidden sm:inline">Assign Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks", value: String(stats.total), subtext: `${stats.completed} completed • ${stats.pending} pending`, icon: "mdi:clipboard-text-multiple", color: "from-purple-500 to-pink-500" },
          { label: "Tasks Due Today", value: String(stats.dueToday), subtext: "", icon: "mdi:calendar-check", color: "from-green-500 to-emerald-500" },
          { label: "Pending Verification", value: String(stats.pendingVerification), subtext: "", icon: "mdi:clock-alert", color: "from-blue-500 to-cyan-500" },
          { label: "Overdue Tasks", value: String(stats.overdue), subtext: "Requires immediate attention", icon: "mdi:alert-circle", color: "from-red-500 to-orange-500" },
        ].map((stat, idx) => (
          <div key={idx} className="group animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
            <DashboardCard className="h-full relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    <Icon icon={stat.icon} width="20" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtext}</p>
              </div>
            </DashboardCard>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">My Recent Assignments</h3>
              {/* <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Icon icon="mdi:bells" width="20" className="text-purple-600 dark:text-purple-400" />
              </div> */}
            </div>
            {loading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
            ) : recentAssigned.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No recent assignments</p>
            ) : (
              <div className="space-y-3">
                {recentAssigned.map((t, i) => (
                  <div key={t._id || i} className="flex items-start gap-3 p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Icon icon="mdi:clipboard-text" width="18" className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.taskName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Due Today</h3>
              <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Icon icon="mdi:calendar-check" width="20" className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            {dueTodayList.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No tasks due today</p>
            ) : (
              <div className="space-y-2">
                {dueTodayList.map((t, i) => (
                  <div key={t._id || i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{t.taskName}</span>
                    <span className="text-gray-600 dark:text-gray-400">{new Date(t.dueDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overdue Tasks</h3>
              <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Icon icon="mdi:alert" width="20" className="text-red-600 dark:text-red-400" />
              </div>
            </div>
            {overdueList.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No overdue tasks</p>
            ) : (
              <div className="space-y-2">
                {overdueList.map((t, i) => (
                  <div key={t._id || i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{t.taskName}</span>
                    <span className="text-red-600 dark:text-red-400">{new Date(t.dueDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

function DashboardCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-lg
        border border-gray-200 dark:border-gray-700/50 
        transition-all duration-300 transform hover:translate-y-[-2px]
        ${className}`}
    >
      {children}
    </div>
  );
}


