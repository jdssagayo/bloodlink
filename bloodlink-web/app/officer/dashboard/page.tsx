"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Users, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import StatCard from "@/components/officer/StatCard";
import BloodTypeChart, { BLOOD_TYPES } from "@/components/officer/BloodTypeChart";
import TopBarangaysList from "@/components/officer/TopBarangaysList";

interface DonorProfile {
  id: number;
  bloodType: string;
  barangay: string;
  isAvailable: boolean;
}

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

  const barangayCounts: Record<string, number> = {};
  donors.forEach((d) => {
    barangayCounts[d.barangay] = (barangayCounts[d.barangay] || 0) + 1;
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold text-neutral-800">Overview</h2>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Baguio City Blood Donor Network · {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
      </p>

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
        <BloodTypeChart counts={bloodTypeCounts} />
        <TopBarangaysList barangayCounts={barangayCounts} />
      </div>
    </main>
  );
}