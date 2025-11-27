'use client';

import EmployeeForm from "@/components/EmployeeForm";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

export default function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null); // track current employee being edited
  const [searchText, setSearchText] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  // Fetch employees
const fetchEmployees = async (search = "") => {
  setLoading(true);
  try {
    const url = search
      ? `/api/employee?search=${encodeURIComponent(search)}`
      : `/api/employee`;

    const res = await fetch(url, { credentials: 'same-origin' });
    const json = await res.json();
    if (json.success) setEmployees(json.data);
  } catch (error) {
    console.error("Error fetching employees:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Delete employee
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`/api/employee/${id}`, { method: "DELETE", credentials: 'same-origin' });
      const json = await res.json();
      if (json.success) {
        setEmployees(employees.filter((emp) => emp._id !== id));
        enqueueSnackbar('Employee deleted', { variant: 'success' });
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      enqueueSnackbar('Error deleting employee', { variant: 'error' });
    }
  };

  // Edit employee
  const handleEdit = (employee) => {
    setEditingEmployee(employee); // set employee to edit
    setShowForm(true); // open form
  };

  // Callback after form save
  const handleFormSave = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees(); // refresh table after save
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0f0f11] transition-colors duration-300 p-4 md:p-8">
     
      {/* Page Title */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          Employees
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Manage your team members and their account access
        </p>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>

        {/* Search + Filters */}
      <div className="relative flex-1">
  <input
    type="text"
    placeholder="Search employees..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && fetchEmployees(searchText)}
    className="pl-4 pr-20 py-2.5 w-full rounded-lg border border-gray-300 dark:border-gray-700
    bg-white dark:bg-gray-800/50 text-gray-800 dark:text-gray-100"
  />

  {/* Search Icon */}
  <button
    onClick={() => fetchEmployees(searchText)}
    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
  >
    <Icon icon="mdi:magnify" width="20" />
  </button>

  {/* Cancel (Clear Search) Button */}
  {searchText !== "" && (
    <button
      onClick={() => {
        setSearchText(""); 
        fetchEmployees(""); // Full list reload
      }}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
    >
      <Icon icon="mdi:close-circle" width="20" />
    </button>
  )}
</div>


        {/* Add/Edit Employee Button */}
        <button 
         onClick={() => { setShowForm((prev) => !prev); setEditingEmployee(null); }}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md 
          hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm whitespace-nowrap">
          <Icon
            icon={showForm ? "mdi:close-circle" : "mdi:plus-circle"}
            width="18"
          />
          {showForm ? "Close Form" : "Add Employee"}
        </button>
      </div>

      {/* --- THE NEW FORM APPEARS HERE --- */}
      {showForm && (
        <EmployeeForm 
          onCancel={() => { setShowForm(false); setEditingEmployee(null); }}
          employee={editingEmployee} // pass editing employee
          onSave={handleFormSave} 
          isEdit={!!editingEmployee} // pass isEdit flag
        />
      )}

      {/* Employees Table */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div
          className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50 
          bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-4 px-6">NAME</th>
                  <th className="py-4 px-6">EMAIL</th>
                  <th className="py-4 px-6">CONTACT</th>
                  <th className="py-4 px-6">DEPARTMENT</th>
                  <th className="py-4 px-6">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      Loading employees...
                    </td>
                  </tr>
                )}

                {!loading && employees.length === 0 && searchText === "" && (
  <tr>
    <td colSpan="6" className="text-center py-16 text-gray-500">
      <div className="flex flex-col items-center gap-2">
        <Icon icon="mdi:account-multiple-outline" width="48" />
        <p className="font-medium">No employees found</p>
        <p className="text-sm">Add an employee to get started</p>
      </div>
    </td>
  </tr>
)}

{!loading && employees.length === 0 && searchText !== "" && (
  <tr>
    <td colSpan="6" className="text-center py-16 text-red-500">
      <div className="flex flex-col items-center gap-2">
        <Icon icon="mdi:magnify-close" width="48" />
        <p className="font-medium">No such employee found</p>
        <p className="text-sm">Try searching with a different name or email</p>
      </div>
    </td>
  </tr>
)}


                {!loading &&
                  employees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="border-b border-gray-100 dark:border-gray-700/40 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                    >
                      <td className="py-4 px-6">{emp.name}</td>
                      <td className="py-4 px-6">{emp.email}</td>
                      <td className="py-4 px-6">{emp.contact}</td>
                      <td className="py-4 px-6">{emp.dept}</td>
                     
                      <td className="py-4 px-6 flex gap-3">
                        <button 
                          onClick={() => handleEdit(emp)}
                          className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Icon icon="mdi:pencil" width="16" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(emp._id)}
                          className="flex items-center gap-1 text-sm text-red-500 hover:underline"
                        >
                          <Icon icon="mdi:delete" width="16" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
