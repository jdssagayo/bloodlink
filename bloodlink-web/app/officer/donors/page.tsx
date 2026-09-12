"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

interface DonorProfile {
  id: number;
  name: string;
  email: string;
  bloodType: string;
  barangay: string;
  isAvailable: boolean;
  lastDonationDate: string | null;
}

const BLOOD_TYPES = ["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE"];

export default function DonorDirectoryPage() {
  const { ready } = useAuth(["OFFICER", "ADMIN"]);
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodType, setBloodType] = useState("");
  const [barangay, setBarangay] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  function search() {
    setLoading(true);
    const params = new URLSearchParams();
    if (bloodType) params.append("bloodType", bloodType);
    if (barangay) params.append("barangay", barangay);
    if (availableOnly) params.append("isAvailable", "true");

    apiFetch(`/officer/donors?${params.toString()}`)
      .then((data) => setDonors(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!ready) return;
    search();
  }, [ready]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <a href="/officer/dashboard" className="text-neutral-400 hover:text-neutral-700">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-semibold text-neutral-800">Donor Directory</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Blood Type</label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All</option>
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Barangay</label>
            <input
              type="text"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              placeholder="e.g. Session Road"
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <label className="flex items-center gap-1.5 text-sm text-neutral-700 pb-1.5">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            Available only
          </label>
          <button
            onClick={search}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
          >
            Search
          </button>
        </div>

        {loading ? (
          <p className="text-neutral-400 text-sm text-center">Loading...</p>
        ) : donors.length === 0 ? (
          <p className="text-neutral-400 text-sm text-center">No donors match this search.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {donors.map((d) => (
              <a
                key={d.id}
                href={`/officer/donors/${d.id}`}
                className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-800">{d.name}</p>
                  <p className="text-sm text-neutral-500">{d.barangay}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-600 text-sm">{d.bloodType.replace("_", " ")}</p>
                  <p className={`text-xs ${d.isAvailable ? "text-green-600" : "text-neutral-400"}`}>
                    {d.isAvailable ? "Available" : "Not available"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}