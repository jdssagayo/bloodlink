"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

const BLOOD_TYPES = ["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE"];

export default function DonorProfilePage() {
  const { ready } = useAuth("DONOR");
  const [bloodType, setBloodType] = useState("O_POSITIVE");
  const [barangay, setBarangay] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!ready) return;
    apiFetch("/donor/profile")
      .then((data) => {
        setBloodType(data.bloodType);
        setBarangay(data.barangay);
        setIsAvailable(data.isAvailable);
      })
      .catch(() => {});
  }, [ready]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await apiFetch("/donor/profile", {
        method: "POST",
        body: JSON.stringify({ bloodType, barangay, isAvailable }),
      });
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <a href="/donor/dashboard" className="text-neutral-400 hover:text-neutral-700">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-semibold text-neutral-800">Edit Profile</h1>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          {message && (
            <div className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2">{message}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Blood Type</label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Barangay</label>
            <input
              type="text"
              required
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Session Road"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            Available to donate
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save profile"}
          </button>
        </form>
      </main>
    </div>
  );
}