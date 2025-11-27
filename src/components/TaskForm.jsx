"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";

export default function TaskForm({ onCancel, onAssigned }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    assignTo: "",
    selectedTaskId: "",
  });

  const [employees, setEmployees] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [me, setMe] = useState(null);

  // fetch employees for assignTo
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/employee', { credentials: 'same-origin' });
        if (!res.ok) return;
        const json = await res.json();
        // console.log('[TaskForm] employees loaded:', json.data?.length);
        if (json?.success) setEmployees(json.data || []);
      } catch (e) {
        console.error('[TaskForm] employees fetch error:', e);
      }
    })();

    (async () => {
      try {
        const r = await fetch('/api/me', { credentials: 'same-origin' });
        if (!r.ok) return;
        const j = await r.json();
        // console.log('[TaskForm] current user:', j.data);
        if (j?.success) {
          setMe(j.data);
          if (j.data.role === 'employee') {
            const t = await fetch('/api/task/my', { credentials: 'same-origin' });
            if (t.ok) {
              const tj = await t.json();
              if (Array.isArray(tj?.data)) setTasksList(tj.data);
            }
          } else if (j.data.role === 'admin') {
            const t = await fetch('/api/task', { credentials: 'same-origin' });
            if (t.ok) {
              const tj = await t.json();
              if (Array.isArray(tj?.data)) setTasksList(tj.data);
            }
          }
        }
      } catch (e) {
        console.error('[TaskForm] user/tasks fetch error:', e);
      }
    })();
  }, []);

  useEffect(() => {
    // console.log('[TaskForm] state updated:', { me: me?.role, employees: employees.length, tasksList: tasksList.length });
  }, [me, employees, tasksList]);

  const handleChange = (e) => {
    // console.log('[TaskForm] handleChange:', e.target.name, '=', e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit =  async (e) => {
    e.preventDefault();
     setLoading(true);
     setError("");
      
    try{
      // console.log('[TaskForm] handleSubmit:', { me, tasksList: tasksList.length, formData });
      // Assign selected task to selected employee
      if (formData.selectedTaskId && formData.assignTo) {
        const response = await fetch(`/api/task/${formData.selectedTaskId}/assign`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assigneeId: formData.assignTo })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Failed to assign task');
        enqueueSnackbar('Task assigned successfully', { variant: 'success' });
        setFormData({ assignTo: '', selectedTaskId: '' });
        if (onAssigned) onAssigned();
        onCancel();
      } else {
        throw new Error('Please select a task and an employee');
      }
    } catch (err) {
      setError(err.message);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
       
     }
   
  return (
    <div className="w-full animate-fade-in mt-2">
      {/* DEBUG: Show current state */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-blue-800 dark:text-blue-300 text-xs">
          <strong>DEBUG:</strong> me={me?.role}, employees={employees.length}, tasks={tasksList.length}
        </div>
      )} */}
      
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Assign To (Dropdown) */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              name="assignTo"
              value={formData.assignTo}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            >
                <option value="">Select employee</option>
                {employees
                  .filter((e) => (me ? e._id !== me.id : true))
                  .map((e) => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
            </select>
          </div>

          {/* Task Name (Dropdown) */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Task Name <span className="text-red-500">*</span>
            </label>

            <select
              name="selectedTaskId"
              value={formData.selectedTaskId}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            >
              <option value="">Select task</option>
              {
                tasksList
                  .filter((t) => t.taskType !== 'Recurring' && !t._type)
                  .map((t) => (
                    <option key={t._id} value={t._id}>{t.taskName}</option>
                  ))
              }
            </select>
          </div>
        </div>

        {/* Description removed for assign form */}

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

          {/* Priority */}
          {/* <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            >
              <option value="">Select priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div> */}

          {/* Task Type */}
          {/* <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Task Type <span className="text-red-500">*</span>
            </label>
            <select
              name="taskType"
              value={formData.taskType}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            >
              <option value="">Select type</option>
              <option value="One-time">One-time</option>
              <option value="Recurring">Recurring</option>
            </select>
          </div> */}

          {/* Due Date */}
          {/* <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            />
          </div> */}
        </div>

         {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md 
                       hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
             disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow 
                       hover:bg-indigo-700 transition"
          >
            <Icon icon="mdi:send-check" width="18" />
           {loading ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
