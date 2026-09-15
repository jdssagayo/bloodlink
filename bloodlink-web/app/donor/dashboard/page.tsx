"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { CheckCircle2, Heart, Calendar, MapPin, Droplet, Info, IdCard } from "lucide-react";

interface DonorProfile {
  id: number;
  donorCode: string | null;
  name: string;
  email: string;
  bloodType: string;
  barangay: string;
  isAvailable: boolean;
  lastDonationDate: string | null;
}

interface Donation {
  id: number;
  donationDate: string;
  location: string;
  notes: string | null;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function DonorDashboard() {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/donor/profile").catch(() => null),
      apiFetch("/donor/donations").catch(() => []),
    ]).then(([profileData, donationsData]) => {
      setProfile(profileData);
      setDonations(donationsData || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  }

  if (!profile) {
    return (
      <main className="max-w-3xl mx-auto w-full p-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">Your donor profile hasn&apos;t been set up yet.</p>
          <p className="text-sm text-gray-400">Please contact a recruitment officer to complete your profile.</p>
        </div>
      </main>
    );
  }

  const firstName = profile.name.split(" ")[0];
  const mostRecent = donations[0];

  return (
    <main className="max-w-5xl mx-auto w-full p-6 lg:p-10">
      
      {/* Dalawang Columns Layout (Left: Original Content, Right: ID Card Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col gap-6">
          {/* Greeting */}
          <div className="mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {firstName}</h1>
            <p className="text-sm text-gray-500 mt-1">Check your eligibility and recent activities below.</p>
          </div>

          {/* Profile snippet */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 text-xl font-medium flex items-center justify-center">
              {initials(profile.name)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
              <div className="flex gap-2 mt-1.5 items-center">
                <span className="bg-red-50 text-red-600 border border-red-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {profile.bloodType ? profile.bloodType.replace("_", " ") : "Pending"}
                </span>
                <span className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={12} />
                  {profile.barangay}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility banner */}
          <div className={`rounded-2xl p-6 flex items-center gap-5 shadow-sm ${profile.isAvailable ? "bg-red-600" : "bg-gray-400"}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${profile.isAvailable ? "bg-red-500 border-red-400" : "bg-gray-300 border-gray-300"}`}>
              <CheckCircle2 className="text-white" size={22} />
            </div>
            <div>
              <p className={`text-xs font-semibold tracking-wider uppercase ${profile.isAvailable ? "text-red-200" : "text-gray-100"}`}>
                Eligibility Status
              </p>
              <p className="text-xl font-semibold text-white mt-1">
                {profile.isAvailable ? "Ready to Donate" : "Not Available"}
              </p>
              <p className={`text-sm mt-1 ${profile.isAvailable ? "text-red-100" : "text-gray-100"}`}>
                {profile.isAvailable
                  ? "You can donate whole blood today."
                  : "You're currently marked unavailable to donate."}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex justify-between items-start hover:shadow-sm transition-shadow">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Donations</p>
                <p className="text-3xl font-semibold text-red-600 mt-2">{donations.length}</p>
                <p className="text-sm text-gray-400 mt-1">Lifetime</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-red-500">
                <Heart size={18} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex justify-between items-start hover:shadow-sm transition-shadow">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Donation</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {profile.lastDonationDate ? profile.lastDonationDate.slice(5) : "—"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {profile.lastDonationDate ? profile.lastDonationDate.slice(0, 4) : "No donations yet"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Calendar size={18} />
              </div>
            </div>
          </div>

          {/* Recent donation */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Recent Donation</h3>
            {mostRecent ? (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-600">
                  <Droplet size={16} />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">{mostRecent.location}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{mostRecent.donationDate}</p>
                  {mostRecent.notes && <p className="text-sm text-gray-500 mt-2">{mostRecent.notes}</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No donations recorded yet.</p>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <div className="flex flex-col gap-6">
          
          {/* Digital Donor ID Card */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-md">
            <div className="relative p-6 text-white">
              {/* Background Icon */}
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <Droplet size={140} />
              </div>

              <div className="flex items-center gap-2 text-red-100 relative z-10">
                <IdCard size={18} />
                <span className="text-xs font-semibold tracking-wide uppercase">Official Donor ID</span>
              </div>

              <h2 className="mt-5 font-mono text-2xl sm:text-3xl font-bold tracking-widest drop-shadow-sm relative z-10">
                {profile.donorCode || "DON-PENDING"}
              </h2>

              <div className="mt-10 flex items-end justify-between relative z-10">
                <div>
                  <p className="text-[10px] text-red-200 uppercase tracking-wider mb-1">Donor Name</p>
                  <p className="text-base font-semibold tracking-tight leading-none">{profile.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-red-200 uppercase tracking-wider mb-1">Blood Type</p>
                  <p className="text-lg font-bold leading-none">
                    {profile.bloodType ? profile.bloodType.replace("_", " ") : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tip card */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <Info className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-orange-900 mb-1">Quick Tip</h4>
              <p className="text-sm text-orange-800 leading-relaxed">
                Stay hydrated and eat iron-rich foods before your next donation to help your body recover faster.
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}