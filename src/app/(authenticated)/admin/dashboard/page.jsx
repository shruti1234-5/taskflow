"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, eRes] = await Promise.all([
          fetch("/api/task", { credentials: "same-origin" }),
          fetch("/api/employee", { credentials: "same-origin" }),
        ]);
        const tJson = await tRes.json();
        const eJson = await eRes.json();
        if (tJson?.success) setTasks(Array.isArray(tJson.data) ? tJson.data : []);
        if (eJson?.success) setEmployees(Array.isArray(eJson.data) ? eJson.data : []);
      } catch (e) {
        setTasks([]);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const totalTasks = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tasksDueToday = tasks.filter((t) => t.taskType === "One-time" && t.dueDate && new Date(t.dueDate).setHours(0,0,0,0) === today.getTime()).length;
    const overdue = tasks.filter((t) => t.taskType === "One-time" && t.dueDate && new Date(t.dueDate) < today && t.status !== "completed").length;
    return {
      totalEmployees,
      totalTasks,
      completed,
      pending,
      tasksDueToday,
      overdue,
    };
  }, [tasks, employees]);

  const priorityCounts = useMemo(() => {
    const high = tasks.filter((t) => t.priority === "High").length;
    const med = tasks.filter((t) => t.priority === "Medium").length;
    const low = tasks.filter((t) => t.priority === "Low").length;
    return { high, med, low };
  }, [tasks]);

  const statusCounts = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const pendingVerification = tasks.filter((t) => t.status === "pending_verification").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return { pending, pendingVerification, completed };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 2);
  }, [tasks]);

  const worstEmployees = useMemo(() => {
    const today = new Date();
    const map = new Map();
    for (const t of tasks) {
      if (t.taskType === "One-time" && t.dueDate && new Date(t.dueDate) < today && t.status !== "completed") {
        const assignees = Array.isArray(t.assignTo) ? t.assignTo : (t.assignTo ? [t.assignTo] : []);
        for (const a of assignees) {
          const id = typeof a === "object" ? a?._id || String(a) : String(a);
          map.set(id, (map.get(id) || 0) + 1);
        }
      }
    }
    const list = [...map.entries()].map(([id, count]) => {
      const emp = employees.find((e) => String(e._id) === String(id));
      return { id, name: emp?.name || "Employee", count };
    }).sort((a, b) => b.count - a.count).slice(0, 5);
    return list;
  }, [tasks, employees]);
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0f0f11] transition-colors duration-300 p-4 md:p-8">

      {/* Page Title + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Administration Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Monitor your organizations tasks and employee performance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          {/* Refresh Button */}
          <button
          //  onClick={() => router.refresh()}
          onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-lg
                       transition-all duration-200 transform hover:scale-105 font-medium text-sm"
          >
            <Icon icon="mdi:refresh" width="18" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* Create Task Button */}
          <button
         onClick={() => router.push("/admin/tasks")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 
                       hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm
                       transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <Icon icon="mdi:plus-circle" width="18" />
            <span className="hidden sm:inline">Create Task</span>
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Employees", value: String(stats.totalEmployees), subtext: "", icon: "mdi:account-group", color: "from-blue-500 to-cyan-500" },
          { label: "Total Tasks", value: String(stats.totalTasks), subtext: `${stats.completed} completed • ${stats.pending} pending`, icon: "mdi:clipboard-text-multiple", color: "from-purple-500 to-pink-500" },
          { label: "Tasks Due Today", value: String(stats.tasksDueToday), subtext: "", icon: "mdi:calendar-check", color: "from-green-500 to-emerald-500" },
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

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Task Priorities */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 dark:text-white text-lg">Task Priorities</p>
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Icon icon="mdi:flag-multiple" width="20" className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { level: "High", colorCls: "text-red-500", icon: "mdi:chevron-triple-up", count: priorityCounts.high },
                { level: "Medium", colorCls: "text-yellow-500", icon: "mdi:chevron-up", count: priorityCounts.med },
                { level: "Low", colorCls: "text-blue-500", icon: "mdi:chevron-down", count: priorityCounts.low },
              ].map((p) => (
                <div key={p.level} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Icon icon={p.icon} width="16" className={p.colorCls} />
                    {p.level}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{p.count} tasks</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Task Status */}
        <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 dark:text-white text-lg">Task Status</p>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon icon="mdi:state-machine" width="20" className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Pending", colorCls: "bg-yellow-500", value: statusCounts.pending },
                { label: "Pending Verification", colorCls: "bg-blue-500", value: statusCounts.pendingVerification },
                { label: "Completed", colorCls: "bg-green-500", value: statusCounts.completed },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className={`w-3 h-3 ${s.colorCls} rounded-full shadow-md`}></span>
                    {s.label}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <DashboardCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Icon icon="mdi:history" width="20" className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          {recentTasks.length === 0 ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">No tasks found</p>
              <button onClick={() => router.push("/admin/tasks")} className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <Icon icon="mdi:plus-circle" width="18" />
                <span className="hidden sm:inline">Create a Task</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((t, idx) => (
                <div key={t._id || idx} className="flex items-start gap-3 p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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

        {/* Worst Performing Employees */}
        <DashboardCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Worst Performing Employees</h3>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Icon icon="mdi:trending-down" width="20" className="text-red-600 dark:text-red-400" />
            </div>
          </div>
          {worstEmployees.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm">No employee data available</p>
          ) : (
            <div className="space-y-2">
              {worstEmployees.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-200">{w.name}</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">{w.count} overdue</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
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
