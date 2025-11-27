"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";

export default function EmployeeForm({ onCancel, employee, isEdit, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
    dept: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  // Prefill form if editing
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        contact: employee.contact || "",
        email: employee.email || "",
        password: "", // blank for security
        dept: employee.dept || "",
      });
    } else {
      setFormData({ name: "", contact: "", email: "", password: "", dept: "" });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/employee/${employee._id}` : "/api/employee";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save employee");
      }

      enqueueSnackbar(isEdit ? "Employee updated successfully" : "Employee added successfully", { variant: 'success' });
      setFormData({ name: "", contact: "", email: "", password: "", dept: "" });
      onCancel();
      if (onSave) onSave(); // refresh parent table
    } catch (err) {
      setError(err.message);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in mt-2 mb-6">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
              placeholder="Employee name"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
              placeholder="e.g., 9876543210"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mt-4">
          <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                       border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            placeholder="employee@example.com"
          />
        </div>

        {/* Password */}
         {!isEdit && (
          <div className="mt-4">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                         border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
              placeholder="Enter password"
            />
          </div>
        )}

        {/* Department (free text) */}
        <div className="mt-4">
          <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="dept"
            value={formData.dept}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-800 
                       border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 outline-none"
            placeholder="e.g., Operations, HR, Sales"
          />
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
                       hover:bg-gray-400 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow 
                       hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Icon icon={isEdit ? "mdi:content-save" : "mdi:account-plus"} width="18" />
            {loading ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save" : "Add Employee")}
          </button>
        </div>
      </form>

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
