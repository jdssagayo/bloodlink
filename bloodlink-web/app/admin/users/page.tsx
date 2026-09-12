"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Trash2 } from "lucide-react";

interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES = ["DONOR", "OFFICER", "ADMIN"];

export default function AdminUsersPage() {
  const { ready } = useAuth("ADMIN");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  function loadUsers() {
    apiFetch("/admin/users")
      .then((data) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!ready) return;
    loadUsers();
  }, [ready]);

  async function handleRoleChange(id: number, newRole: string) {
    try {
      await apiFetch(`/admin/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers();
    } catch {
      alert("Failed to update role.");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      loadUsers();
    } catch {
      alert("Failed to delete user.");
    }
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <a href="/officer/dashboard" className="text-neutral-400 hover:text-neutral-700">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-semibold text-neutral-800">User Management</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-neutral-400 text-sm text-center">Loading...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-neutral-100"
              >
                <div>
                  <p className="font-medium text-neutral-800">{u.name}</p>
                  <p className="text-sm text-neutral-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1.5"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}