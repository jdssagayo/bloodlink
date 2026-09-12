"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Users, Bell, LogOut, Droplet } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready, logout } = useAuth("ADMIN");
  const pathname = usePathname();

  if (!ready) return null;

  const navItems = [
    { href: "/admin/users", label: "User Management", icon: Users },
  ];

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 rounded-lg p-1.5">
            <Droplet className="text-white" size={16} fill="white" />
          </div>
          <span className="font-medium text-gray-900">BloodLink</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-600">View as: Admin</span>
          <button className="relative text-gray-400 hover:text-gray-600">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-600">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "flex items-center gap-3 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-medium text-sm"
                      : "flex items-center gap-3 text-gray-400 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="mt-auto mx-4 mb-4 bg-red-600 rounded-xl p-4">
            <p className="text-sm font-medium text-white">Admin Mode</p>
            <p className="text-xs text-red-200 mt-0.5">Full access</p>
          </div>
        </aside>

        <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}