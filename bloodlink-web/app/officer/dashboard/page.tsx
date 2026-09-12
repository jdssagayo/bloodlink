"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Users, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

interface DonorProfile {
  id: number;
  bloodType: string;
  barangay: string;
  isAvailable: boolean;
}

const BLOOD_TYPES = ["O_POSITIVE","A_POSITIVE","B_POSITIVE","AB_POSITIVE","O_NEGATIVE","A_NEGATIVE","B_NEGATIVE","AB_NEGATIVE"];
const LABELS: Record<string, string> = {
  O_POSITIVE: "O+", A_POSITIVE: "A+", B_POSITIVE: "B+", AB_POSITIVE: "AB+",
  O_NEGATIVE: "O-", A_NEGATIVE: "A-", B_NEGATIVE: "B-", AB_NEGATIVE: "AB-",
};
// Bright red fading to dark maroon, matching the reference
const BAR_COLORS = ["#EF4444","#F87171","#FCA5A5","#FECACA","#991B1B","#7F1D1D","#5C1414","#3D0D0D"];

export default function OfficerDashboard() {
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/officer/donors")
      .then((data) => setDonors(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const available = donors.filter((d) => d.isAvailable).length;
  const rareTypes = donors.filter((d) => d.bloodType === "AB_NEGATIVE" || d.bloodType === "O_NEGATIVE").length;

  const bloodTypeCounts: Record<string, number> = {};
  BLOOD_TYPES.forEach((bt) => (bloodTypeCounts[bt] = 0));
  donors.forEach((d) => {
    bloodTypeCounts[d.bloodType] = (bloodTypeCounts[d.bloodType] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(bloodTypeCounts), 4);

  const barangayCounts: Record<string, number> = {};
  donors.forEach((d) => {
    barangayCounts[d.barangay] = (barangayCounts[d.barangay] || 0) + 1;
  });
  const topBarangays = Object.entries(barangayCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxBarangay = topBarangays[0]?.[1] || 1;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold text-neutral-800">Overview</h2>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Baguio City Blood Donor Network · {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Donors" value={loading ? "-" : donors.length} sub={`${donors.length} registered`} icon={Users} />
        <StatCard
          label="Available Now"
          value={loading ? "-" : available}
          sub={donors.length ? `${Math.round((available / donors.length) * 100)}% available` : "-"}
          icon={CheckCircle2}
          highlight
        />
        <StatCard label="This Month" value={loading ? "-" : "-"} sub="Donations recorded" icon={TrendingUp} />
        <StatCard label="Rare Types" value={loading ? "-" : rareTypes} sub="AB-, O- donors" icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Vertical bar chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="font-medium text-neutral-800 mb-6">Donors by Blood Type</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {BLOOD_TYPES.map((bt, i) => (
              <div key={bt} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-medium text-neutral-600">{bloodTypeCounts[bt]}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max((bloodTypeCounts[bt] / maxCount) * 100, 3)}%`,
                    backgroundColor: BAR_COLORS[i],
                  }}
                />
                <span className="text-xs text-neutral-500">{LABELS[bt]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top barangays */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="font-medium text-neutral-800 mb-5">Top Barangays</h3>
          <div className="space-y-4">
            {topBarangays.length === 0 ? (
              <p className="text-neutral-400 text-sm">No data yet.</p>
            ) : (
              topBarangays.map(([barangay, count]) => (
                <div key={barangay}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-700">{barangay}</span>
                    <span className="font-medium text-neutral-800">{count}</span>
                  </div>
                  <div className="bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{ width: `${(count / maxBarangay) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, sub, icon: Icon, highlight }: {
  label: string; value: string | number; sub: string; icon: any; highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
        <div className={`rounded-full p-1.5 ${highlight ? "bg-brand-50" : "bg-neutral-100"}`}>
          <Icon size={14} className={highlight ? "text-brand-600" : "text-neutral-500"} />
        </div>
      </div>
      <p className={`text-3xl font-semibold ${highlight ? "text-brand-600" : "text-neutral-800"}`}>{value}</p>
      <p className="text-xs text-neutral-400 mt-1">{sub}</p>
    </div>
  );
}