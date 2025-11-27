"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";


export default function AdminSidebar({ setSidebarWidth, isMobileOpen, setIsMobileOpen }) {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
 const router = useRouter();
  // Handle responsive behavior
  useEffect(() => {
    setMounted(true);
    // fetch current user name for badge
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'same-origin' });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && json.data) {
          setUserName(json.data.name || null);
          setUserRole(json.data.role || null);
        }
      } catch (e) {
        // ignore
      }
    })();
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
        setSidebarWidth(0);
      } else {
        setIsOpen(true);
        setSidebarWidth(260);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarWidth]);

  // text display logic for menu labels
  const showText = isMobile ? isMobileOpen : isOpen;
  const titleText = isMobile ? (isMobileOpen ? "TaskFlow" : "TF") : (isOpen ? "TaskFlow" : "TF");

  // Update layout margin when sidebar toggles
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      const newWidth = isOpen ? 80 : 260;
      setSidebarWidth(newWidth);
      setIsOpen(!isOpen);
    }
  };

  // Close mobile drawer when item is clicked
  const handleItemClick = () => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  // Close drawer when clicking outside
  const handleBackdropClick = () => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "mdi:view-dashboard" },
    { name: "Employee", href: "/admin/employee", icon: "mdi:account-group" },
    { name: "Tasks", href: "/admin/tasks", icon: "mdi:clipboard-text" },
    { name: "Activities", href: "/admin/activities", icon: "mdi:timeline-clock" },
  ];

  const handleLogout = async () => {
    await fetch("/api/logout", { credentials: 'same-origin' });
    router.push("/login");
  };


  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden backdrop-blur-sm bg-white/10 dark:bg-black/20"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0
          flex flex-col justify-between
          min-h-screen p-5 transition-all duration-300 z-50
          
          ${isMobile
            ? `w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${isOpen ? 'w-64' : 'w-20'}`
          }

          bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900
          dark:bg-gradient-to-b dark:from-gray-900 dark:to-[#0f0f11] dark:text-gray-200
        `}
      >
      {/* LOGO + TOGGLE */}
      <div>
        <div className="flex items-center justify-between mb-6">
           <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              {titleText}
            </h1>


          <button onClick={toggleSidebar} className="transition-transform duration-200 hover:scale-110">
            <Icon
              icon={isMobile ? (isMobileOpen ? "mdi:close" : "mdi:menu") : (isOpen ? "mdi:chevron-left" : "mdi:chevron-right")}
              width="22"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 transform
                  ${
                    active
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:translate-x-1"
                  }
                `}
              >
                <Icon icon={item.icon} width="20" />
                {showText && item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM BUTTONS */}
      <div className="flex flex-col gap-3">
        {/* THEME SWITCH */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="
            flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
            bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 
            dark:from-gray-800 dark:to-gray-700 dark:text-white
            transition-all duration-200 transform hover:scale-105 hover:shadow-md
          "
        >
          <Icon icon={theme === "dark" ? "mdi:white-balance-sunny" : "mdi:moon-waning-crescent"} width="18" />
          {(isOpen || isMobileOpen) && (
  <span className="text-xs font-semibold">
    {mounted ? (theme === "dark" ? "Light" : "Dark") : "Dark"}
  </span>
)}

        </button>

        {/* LOGOUT */}
       <button
  onClick={handleLogout}
  className="
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 
    hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30
    transition-all duration-200 transform hover:scale-105 hover:translate-x-1
  "
>
  <Icon icon="mdi:logout" width="20" />
  {(isOpen || isMobileOpen) && "Logout"}
</button>

{/* small user badge */}
            {(isOpen || isMobileOpen) && userName && (
              <span className="inline-flex items-center px-3 py-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold dark:bg-indigo-900/30 dark:text-indigo-300">
               {userName}
              </span>
            )}
          

      </div>
    </aside>
    </>
  );
}
