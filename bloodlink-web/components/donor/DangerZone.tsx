"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function DangerZone() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    try {
      await apiFetch("/donor/account", { method: "DELETE" });
      localStorage.clear();
      router.push("/login");
    } catch {
      alert("Failed to delete account. Please try again.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500 mb-3">Danger Zone</p>
      {!showConfirm ? (
        <button onClick={() => setShowConfirm(true)} className="text-sm font-medium text-red-600 hover:underline">
          Delete my account
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700">Are you sure? This cannot be undone.</p>
          <button onClick={handleDelete} className="text-sm font-medium text-red-600 hover:underline">
            Yes, delete
          </button>
          <button onClick={() => setShowConfirm(false)} className="text-sm text-gray-500 hover:underline">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}