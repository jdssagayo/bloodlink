"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, MapPin, Droplet } from "lucide-react";

interface Donation {
  id: number;
  donationDate: string;
  location: string;
  notes: string | null;
}

interface DonorDetail {
  id: number;
  name: string;
  email: string;
  bloodType: string;
  barangay: string;
  isAvailable: boolean;
  lastDonationDate: string | null;
  donationHistory: Donation[];
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function DonorDetailPage() {
  const params = useParams();
  const [donor, setDonor] = useState<DonorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/officer/donors/${params.id}`)
      .then((data) => setDonor(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  }

  if (!donor) {
    return <div className="p-8 text-sm text-gray-400">Donor not found.</div>;
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <a href="/officer/donors" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 w-fit">
        <ArrowLeft size={16} />
        Back to Directory
      </a>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 text-2xl font-medium flex items-center justify-center">
              {initials(donor.name)}
            </div>
            <div className="ml-4 flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">{donor.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{donor.email}</p>
              <div className="flex gap-2 mt-3">
                <span className="bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-1 text-xs font-medium">
                  {donor.bloodType.replace("_", " ")}
                </span>
                <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                  <MapPin size={12} />
                  {donor.barangay}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm flex items-center gap-2 ${
              donor.isAvailable ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${donor.isAvailable ? "bg-green-600" : "bg-gray-500"}`} />
            {donor.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="border-t border-gray-100 mt-6 pt-6 grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div>
            <p className="text-3xl font-semibold text-red-600">{donor.donationHistory.length}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Total Donations</p>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">{donor.lastDonationDate || "—"}</p>
            <p className="text-xs text-gray-400 mt-1">Last Donation</p>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">{donor.barangay}</p>
            <p className="text-xs text-gray-400 mt-1">Barangay</p>
          </div>
        </div>
      </div>

      {/* Donation history card */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="p-6 text-lg font-medium text-gray-900">Donation History</h2>

        {donor.donationHistory.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-400">No donations recorded yet.</p>
        ) : (
          donor.donationHistory.map((d) => (
            <div key={d.id} className="border-t border-gray-100 p-6 flex items-start justify-between">
              <div className="flex items-start flex-1">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Droplet className="text-red-600" size={16} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{d.location}</p>
                  {d.notes && <p className="text-sm text-gray-500 mt-1">{d.notes}</p>}
                </div>
              </div>
              <span className="text-sm text-gray-400 shrink-0">{d.donationDate}</span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}