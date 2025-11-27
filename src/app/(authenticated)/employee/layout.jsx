"use client";
import EmployeeSidebar from "@/components/EmployeeSidebar";
import { useState } from "react";

export default function EmployeeLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Sidebar - hide on mobile */}
      <div style={{ width: sidebarWidth }} className="hidden md:block">
        <EmployeeSidebar setSidebarWidth={setSidebarWidth} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </div>

      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-4">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div className="md:hidden">
        <EmployeeSidebar setSidebarWidth={setSidebarWidth} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 bg-white dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen overflow-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
