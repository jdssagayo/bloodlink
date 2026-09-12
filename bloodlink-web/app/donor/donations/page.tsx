"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Droplet } from "lucide-react";

interface Donation {
  id: number;
  donationDate: string;
  location: string;
  notes: string | null;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/donor/donations")
      .then((data) => setDonations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto w-full py-10 px-6">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-medium text-gray-900">Donation History</h1>
        <span className="bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-sm">
          {donations.length} {donations.length === 1 ? "donation" : "donations"}
        </span>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : donations.length === 0 ? (
        <p className="text-gray-400 text-sm">No donations recorded yet.</p>
      ) : (
        <div className="relative space-y-6">
          {/* Vertical timeline line */}
          <div className="absolute top-4 bottom-0 left-[1.15rem] w-px bg-gray-200 -z-10" />

          {donations.map((d) => (
            <div key={d.id} className="relative flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 ring-8 ring-gray-50 mt-1">
                <Droplet size={16} />
              </div>

              <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-base font-medium text-gray-900">{d.location}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{d.donationDate}</p>
                  </div>
                  <span className="bg-red-50 text-red-500 border border-red-100 rounded-full px-2.5 py-0.5 text-xs">
                    1 unit
                  </span>
                </div>
                {d.notes && (
                  <p className="text-sm text-gray-500 leading-relaxed">{d.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}