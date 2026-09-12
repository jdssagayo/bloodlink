"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import { Droplet, MapPin, Calendar, LogOut } from "lucide-react";

interface DonorProfile {
    id: number;
    name: string;
    email: string;
    bloodType: string;
    barangay: string;
    isAvailable: boolean;
    lastDonationDate: string | null;
}

export default function DonorDashboard() {
    const { ready, logout } = useAuth("DONOR");
    const [profile, setProfile] = useState<DonorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(true);

    useEffect(() => {
        if (!ready) return;

        apiFetch("/donor/profile")
            .then((data) => setProfile(data))
            .catch(() => setHasProfile(false))
            .finally(() => setLoading(false));
    }, [ready]);

    if (!ready || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <p className="text-neutral-400 text-sm">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-brand-700">BloodLink</h1>
                <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                    <LogOut size={16} />
                    Log out
                </button>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {!hasProfile ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
                        <p className="text-neutral-600 mb-4">You haven&apos;t set up your donor profile yet.</p>
                        <a
                            href="/donor/profile"
                            className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                        >
                            Set up profile
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-neutral-800">Welcome, {profile?.name}</h2>
                                <span
                                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${profile?.isAvailable
                                            ? "bg-green-50 text-green-700"
                                            : "bg-neutral-100 text-neutral-500"
                                        }`}
                                >
                                    {profile?.isAvailable ? "Available to donate" : "Not available"}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-brand-50 rounded-xl p-3 text-center">
                                    <Droplet className="mx-auto text-brand-600 mb-1" size={20} />
                                    <p className="text-xs text-neutral-500">Blood Type</p>
                                    <p className="font-semibold text-neutral-800">
                                        {profile?.bloodType.replace("_", " ")}
                                    </p>
                                </div>
                                <div className="bg-brand-50 rounded-xl p-3 text-center">
                                    <MapPin className="mx-auto text-brand-600 mb-1" size={20} />
                                    <p className="text-xs text-neutral-500">Barangay</p>
                                    <p className="font-semibold text-neutral-800 text-sm">{profile?.barangay}</p>
                                </div>
                                <div className="bg-brand-50 rounded-xl p-3 text-center">
                                    <Calendar className="mx-auto text-brand-600 mb-1" size={20} />
                                    <p className="text-xs text-neutral-500">Last Donation</p>
                                    <p className="font-semibold text-neutral-800 text-sm">
                                        {profile?.lastDonationDate || "None yet"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <a
                                href="/donor/profile"
                                className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-brand-300 transition-colors"
                            >
                                <p className="font-medium text-neutral-800">Edit Profile</p>
                                <p className="text-sm text-neutral-500 mt-1">Update your info</p>
                            </a>
                            <a
                                href="/donor/donations"
                                className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-brand-300 transition-colors"
                            >
                                <p className="font-medium text-neutral-800">Donation History</p>
                                <p className="text-sm text-neutral-500 mt-1">View past donations</p>
                            </a>
                            <a
                                href="/donor/ai"
                                className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-brand-300 transition-colors"
                            >
                                <p className="font-medium text-neutral-800">Ask AI</p>
                                <p className="text-sm text-neutral-500 mt-1">Get quick answers</p>
                            </a>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}