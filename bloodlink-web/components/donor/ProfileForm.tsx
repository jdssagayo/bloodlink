"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

const BLOOD_TYPES = ["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE"];

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  initialBloodType: string;
  initialBarangay: string;
  initialIsAvailable: boolean;
}

export default function ProfileForm({
  initialName,
  initialPhone,
  initialBloodType,
  initialBarangay,
  initialIsAvailable,
}: ProfileFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [bloodType, setBloodType] = useState(initialBloodType);
  const [barangay, setBarangay] = useState(initialBarangay);
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await apiFetch("/donor/profile", {
        method: "POST",
        body: JSON.stringify({ bloodType, barangay, isAvailable, phone }),
      });
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col gap-5 shadow-sm">
      {message && (
        <div className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2">{message}</div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-500 mb-1.5 block">Full Name</label>
        <input
          type="text"
          value={initialName}
          disabled
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-base text-gray-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500 mb-1.5 block">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09XX XXX XXXX"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500 mb-1.5 block">Blood Type</label>
          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
          >
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>{bt.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500 mb-1.5 block">Barangay</label>
          <input
            type="text"
            required
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center py-2">
        <div>
          <p className="text-sm font-medium text-gray-900">Available to Donate</p>
          <p className="text-xs text-gray-400 mt-0.5">Toggle off if you are temporarily unavailable</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAvailable(!isAvailable)}
          className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
            isAvailable ? "bg-red-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isAvailable ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/donor/dashboard")}
          className="border border-gray-300 text-gray-700 font-medium rounded-xl px-6 py-2.5 hover:bg-gray-50 transition-colors"
        >
          Discard
        </button>
      </div>
    </form>
  );
}