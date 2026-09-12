"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Home, History, User, MessageCircle, LogOut, Droplet } from "lucide-react";

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const { ready, logout } = useAuth("DONOR");
  const pathname = usePathname();

  if (!ready) return null;

  const navItems = [
    { href: "/donor/dashboard", label: "Home", icon: Home },
    { href: "/donor/donations", label: "History", icon: History },
    { href: "/donor/profile", label: "Profile", icon: User },
    { href: "/donor/ai", label: "Ask AI", icon: MessageCircle },
  ];

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-gray-100">
          <div className="bg-red-600 rounded-lg p-1.5">
            <Droplet className="text-white" size={16} fill="white" />
          </div>
          <span className="font-semibold text-gray-900">BloodLink</span>
        </div>

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
                    : "flex items-center gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                }
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center">
          <div />
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}