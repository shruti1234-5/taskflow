"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";

export default function ActivityPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");
  const [employees, setEmployees] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const activityTypes = ["All", "Created", "Updated", "Deleted", "Status"];

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch("/api/employee", { credentials: "same-origin" });
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) setEmployees(json.data);
      } catch (e) {}
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedType && selectedType !== "All") params.set("type", selectedType);
        if (selectedEmployee && selectedEmployee !== "All Employees") params.set("employeeId", selectedEmployee);
        const res = await fetch(`/api/activity?${params.toString()}`, { credentials: "same-origin" });
        const json = await res.json();
        if (json?.success) setActivities(json.data || []);
      } catch (e) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedType, selectedEmployee]);

  const employeeOptions = useMemo(() => {
    const opts = [{ label: "All Employees", value: "All Employees" }];
    for (const e of employees) opts.push({ label: e?.name || "Unnamed", value: e?._id });
    return opts;
  }, [employees]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0f0f11] transition-colors duration-300 p-4 md:p-8">

      {/* PAGE TITLE */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          Activity Feed
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Track all task-related activities and updates
        </p>
      </div>

      {/* FILTER SECTION */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
        
        {/* FILTER BY TYPE */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Icon icon="mdi:filter-multiple" width="18" />
            Filter by Type
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {activityTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`
                  px-4 py-2 text-sm rounded-lg border-2 font-medium
                  transition-all duration-200 transform
                  ${
                    selectedType === t
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-lg hover:shadow-xl scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-y-[-2px]"
                  }
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* FILTER BY EMPLOYEE */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Icon icon="mdi:account-search" width="18" />
            Filter by Employee
          </p>

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-200
              border-gray-300 dark:border-gray-700 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              text-sm font-medium transition-all duration-200
              cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600"
          >
            {employeeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center mt-20 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="relative">
            <div className="h-12 w-12 border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4 font-medium">Loading activities...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: "200ms" }}>
          <Icon icon="mdi:inbox-multiple" width="40" className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">No activities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => (
            <div key={a._id || i} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start gap-3 p-4 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Icon
                    icon={
                      a.type === 'Created' ? 'mdi:plus-circle' :
                      a.type === 'Updated' ? 'mdi:pencil' :
                      a.type === 'Deleted' ? 'mdi:trash-can' :
                      'mdi:flag-checkered'
                    }
                    width="22"
                    className={
                      a.type === 'Created' ? 'text-indigo-600' :
                      a.type === 'Updated' ? 'text-yellow-600' :
                      a.type === 'Deleted' ? 'text-red-600' :
                      'text-teal-600'
                    }
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.summary}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {(a.actorEmployee?.name || a.actorAdmin?.name || 'User')} • {(a.taskId?.taskName || 'Task')}
                  </p>
                  {a.details?.note && (
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">Note: {a.details.note}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
