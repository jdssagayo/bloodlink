"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import ThemeToggle from "@/components/ThemeToggle"; // 👈 1. Na-import na natin dito
import { LayoutGrid, Users, MessageCircle, Bell, LogOut, HelpCircle, Droplet, Package } from "lucide-react";

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const { ready, user, logout } = useAuth(["OFFICER", "ADMIN"]);
  const pathname = usePathname();

  if (!ready) return null;

  const navItems = [
    { href: "/officer/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/officer/donors", label: "Donors", icon: Users },
    { href: "/officer/inventory", label: "Inventory", icon: Package },
    { href: "/officer/ai", label: "AI Insights", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      {/* Sidebar na may Dark Mode classes */}
      <aside className="w-56 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col fixed h-screen">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="bg-brand-600 rounded-lg p-1.5">
            <Droplet className="text-white" size={16} fill="white" />
          </div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">BloodLink</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <a 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-3">
          <div className="bg-brand-50 dark:bg-brand-950/40 rounded-xl p-3 border border-brand-100/50 dark:border-brand-900/30">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
              {user?.role === "ADMIN" ? "Admin" : "Officer"} Mode
            </p>
            <p className="text-xs text-brand-600/70 dark:text-brand-500/70 mt-0.5">
              {user?.role === "ADMIN" ? "Full access" : "Read-only access"}
            </p>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 ml-56 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
        {/* Top bar na may kasamang ThemeToggle sa tabi ng Logout */}
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3.5 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {user?.email}
            </span>
            <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 relative">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>

            {/* 🚀 DITO NA NAKALAGAY ANG THEME TOGGLE SA TOP NAVBAR */}
            <ThemeToggle />

            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {children}

        {/* Help button, fixed bottom right */}
        <button className="fixed bottom-6 right-6 bg-neutral-900 dark:bg-neutral-800 text-white rounded-full p-3 shadow-lg hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
}