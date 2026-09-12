"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import Link from "next/link";

interface DonorProfile {
  id: number;
  name: string;
  email: string;
  bloodType: string;
  barangay: string;
  isAvailable: boolean;
  lastDonationDate: string | null;
}

const BLOOD_TYPES = ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"];
const LABELS: Record<string, string> = {
  A_POSITIVE: "A+", A_NEGATIVE: "A-", B_POSITIVE: "B+", B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+", AB_NEGATIVE: "AB-", O_POSITIVE: "O+", O_NEGATIVE: "O-",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function DonorDirectoryPage() {
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  function search() {
    setLoading(true);
    const params = new URLSearchParams();
    if (bloodType) params.append("bloodType", bloodType);
    if (searchTerm) params.append("barangay", searchTerm);
    if (availableOnly) params.append("isAvailable", "true");

    apiFetch(`/officer/donors?${params.toString()}`)
      .then((data) => setDonors(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    search();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Donor Directory</h2>

      {/* Search & filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-[60%]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search by barangay..."
            className="w-full bg-gray-50 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <SlidersHorizontal className="text-gray-400" size={16} />
          <select
            value={bloodType}
            onChange={(e) => { setBloodType(e.target.value); }}
            className="rounded-lg border border-red-500 text-red-600 text-sm px-3 py-1.5 focus:outline-none"
          >
            <option value="">All</option>
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>{LABELS[bt]}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            Available only
          </label>
          <button
            onClick={search}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-2xl border border-gray-200 mt-6 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr_auto] gap-4 py-4 px-6 border-b border-gray-100">
          <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Name</span>
          <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Blood Type</span>
          <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Barangay</span>
          <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Last Donation</span>
          <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Status</span>
          <span></span>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
        ) : donors.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No donors match this search.</p>
        ) : (
          donors.map((d) => (
            <Link
              key={d.id}
              href={`/officer/donors/${d.id}`}
              className="grid grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr_auto] gap-4 items-center py-4 px-6 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-sm font-medium">
                  {initials(d.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.email}</p>
                </div>
              </div>

              <span className="inline-flex w-fit rounded-full bg-red-50 text-red-600 text-sm font-medium px-3 py-1">
                {LABELS[d.bloodType]}
              </span>

              <span className="text-sm text-gray-700">{d.barangay}</span>

              <span className="text-sm text-gray-500">{d.lastDonationDate || "—"}</span>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border border-gray-100 px-3 py-1 text-sm ${d.isAvailable ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
              >
                <span className={`h-2 w-2 rounded-full ${d.isAvailable ? "bg-green-600" : "bg-gray-500"}`} />
                {d.isAvailable ? "Available" : "Unavailable"}
              </span>
              
              <ChevronRight className="text-gray-300" size={18} />
            </Link>
          ))
        )}
      </div>
    </main>
  );
}