"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Droplet, MapPin, Calendar } from "lucide-react";

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

export default function DonorDetailPage() {
  const { ready } = useAuth(["OFFICER", "ADMIN"]);
  const params = useParams();
  const [donor, setDonor] = useState<DonorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    apiFetch(`/officer/donors/${params.id}`)
      .then((data) => setDonor(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready, params.id]);

  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-400 text-sm">Donor not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <a href="/officer/donors" className="text-neutral-400 hover:text-neutral-700">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-semibold text-neutral-800">Donor Details</h1>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-800 text-lg">{donor.name}</h2>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                donor.isAvailable ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {donor.isAvailable ? "Available" : "Not available"}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mb-4">{donor.email}</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-brand-50 rounded-xl p-3 text-center">
              <Droplet className="mx-auto text-brand-600 mb-1" size={20} />
              <p className="text-xs text-neutral-500">Blood Type</p>
              <p className="font-semibold text-neutral-800 text-sm">{donor.bloodType.replace("_", " ")}</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 text-center">
              <MapPin className="mx-auto text-brand-600 mb-1" size={20} />
              <p className="text-xs text-neutral-500">Barangay</p>
              <p className="font-semibold text-neutral-800 text-sm">{donor.barangay}</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 text-center">
              <Calendar className="mx-auto text-brand-600 mb-1" size={20} />
              <p className="text-xs text-neutral-500">Last Donation</p>
              <p className="font-semibold text-neutral-800 text-sm">{donor.lastDonationDate || "None"}</p>
            </div>
          </div>
        </div>

        <h3 className="font-medium text-neutral-700 mb-2 text-sm">Donation History</h3>
        {donor.donationHistory.length === 0 ? (
          <p className="text-neutral-400 text-sm">No donations recorded.</p>
        ) : (
          <div className="space-y-3">
            {donor.donationHistory.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-neutral-800">{d.location}</p>
                  <p className="text-sm text-neutral-500">{d.donationDate}</p>
                </div>
                {d.notes && <p className="text-sm text-neutral-500 mt-1">{d.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}