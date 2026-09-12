"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Plus } from "lucide-react";

interface Donation {
  id: number;
  donationDate: string;
  location: string;
  notes: string | null;
}

export default function DonationsPage() {
  const { ready } = useAuth("DONOR");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [donationDate, setDonationDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadDonations() {
    apiFetch("/donor/donations")
      .then((data) => setDonations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!ready) return;
    loadDonations();
  }, [ready]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/donor/donations", {
        method: "POST",
        body: JSON.stringify({ donationDate, location, notes: notes || null }),
      });
      setDonationDate("");
      setLocation("");
      setNotes("");
      setShowForm(false);
      loadDonations();
    } catch {
      alert("Failed to log donation.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <a href="/donor/dashboard" className="text-neutral-400 hover:text-neutral-700">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-semibold text-neutral-800">Donation History</h1>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2.5 text-sm mb-4 transition-colors"
        >
          <Plus size={16} />
          Log a Donation
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Baguio City Blood Bank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                rows={2}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-medium rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Donation"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-neutral-400 text-sm text-center">Loading...</p>
        ) : donations.length === 0 ? (
          <p className="text-neutral-400 text-sm text-center">No donations logged yet.</p>
        ) : (
          <div className="space-y-3">
            {donations.map((d) => (
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