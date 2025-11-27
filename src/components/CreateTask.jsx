"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";

export default function CreateTaskForm({ onCancel, task = null, isEdit = false, onSave }) {
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    taskName: "",
    desc: "",
    priority: "",
    taskType: "",
    frequency: "",
    dueDate: "",
    startDate: "",
    endDate: "",
    assignTo: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Prefill when editing
  useEffect(() => {
    if (task) {
      setFormData({
        taskName: task.taskName || "",
        desc: task.desc || "",
        priority: task.priority || "",
        taskType: task.taskType || "",
        frequency: task.frequency || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
        startDate: task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : "",
        endDate: task.endDate ? new Date(task.endDate).toISOString().slice(0, 10) : "",
        assignTo: task.assignTo ? (task.assignTo._id || task.assignTo) : "",
      });
    } else {
      setFormData({ taskName: "", desc: "", priority: "", taskType: "", frequency: "", dueDate: "", startDate: "", endDate: "", assignTo: "" });
    }
  }, [task]);

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employee", { credentials: 'same-origin' });
        const data = await res.json();

        if (data.success) {
          setEmployees(data.data);
        }
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const url = isEdit && task && task._id ? `/api/task/${task._id}` : "/api/task";
      const method = isEdit && task && task._id ? "PUT" : "POST";
      const payload = { ...formData };
      if (payload.taskType !== 'Recurring') delete payload.frequency;
      const response = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save task");
      }

      enqueueSnackbar(isEdit ? "Task updated successfully" : "Task created successfully", { variant: 'success' });
      setFormData({
        taskName: "",
        desc: "",
        priority: "",
        taskType: "",
        frequency: "",
        dueDate: "",
        startDate: "",
        endDate: "",
        assignTo: "",
      });

      if (onSave) onSave();
      onCancel();
    } catch (err) {
      setError(err.message);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in mb-6">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        {/* Task Name */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Task Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="taskName"
            value={formData.taskName}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
            border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            placeholder="Enter task title"
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
            border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            placeholder="Describe the task"
          ></textarea>
        </div>

        {/* Assign To + Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Assign To</label>
            <select
              name="assignTo"
              value={formData.assignTo}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:flex-1">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            >
              <option value="">Select priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

      {/* Task Type & All Dates in ONE ROW */}
  <div className="mt-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

    {/* Task Type */}
    <div>
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
    </div>

    {formData.taskType === "Recurring" && (
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          Frequency <span className="text-red-500">*</span>
        </label>
        <select
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
          border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
        >
          <option value="">Select frequency</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>
    )}

    {/* Due Date (Visible only if One-time) */}
    {formData.taskType === "One-time" && (
      <div>
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
      </div>
    )}

    {/* Start Date (only for Recurring) */}
    {formData.taskType === "Recurring" && (
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
          border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
        />
      </div>
    )}

    {/* End Date (only for Recurring) */}
    {formData.taskType === "Recurring" && (
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          End Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
          border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
        />
      </div>
    )}

  </div>
</div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md 
            hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow 
            hover:bg-indigo-700 transition"
          >
            <Icon icon={isEdit ? "mdi:content-save" : "mdi:cloud-check"} width="18" />
            {loading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save" : "Create Task")}
          </button>
        </div>
      </form>
    </div>
  );
}
