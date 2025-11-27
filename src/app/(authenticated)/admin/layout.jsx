"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">

      {/* Sidebar with dynamic width - hidden on small screens */}
      <div style={{ width: sidebarWidth }} className="hidden md:block">
        <AdminSidebar setSidebarWidth={setSidebarWidth} sidebarWidth={sidebarWidth} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </div>

      {/* Mobile hamburger button (visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-4">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar instance (drawer) */}
      <div className="md:hidden">
        <AdminSidebar setSidebarWidth={setSidebarWidth} sidebarWidth={sidebarWidth} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </div>

      {/* Main content - auto expands */}
      <main className="flex-1 p-4 md:p-6 overflow-auto pt-16 md:pt-6">
        {children}
      </main>
    </div>
  );
}
