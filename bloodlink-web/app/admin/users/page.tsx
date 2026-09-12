"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import SearchBar from "@/components/admin/SearchBar";
import UserTable from "@/components/admin/UserTable";
import AddUserModal from "@/components/admin/AddUserModal";

interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  function loadUsers() {
    setLoading(true);
    apiFetch("/admin/users")
      .then((data) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

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

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage all BloodLink accounts and permissions.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
        >
          + Add User
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
      ) : (
        <UserTable users={filteredUsers} onRoleChange={handleRoleChange} onDelete={handleDelete} />
      )}

      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onCreated={loadUsers} />
      )}
    </div>
  );
}