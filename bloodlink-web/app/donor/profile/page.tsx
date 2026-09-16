"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProfileForm from "@/components/donor/ProfileForm"; // Siguraduhing tama ang import path
import DangerZone from "@/components/donor/DangerZone";

export default function DonorProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/donor/profile")
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>;

  return (
    <main className="max-w-xl mx-auto w-full pt-8 px-4 flex flex-col gap-6 pb-10">
      <h1 className="text-2xl font-medium text-gray-900 text-center">Edit Profile</h1>
      <ProfileForm
        initialName={profile?.name || ""}
        initialPhone={profile?.phone || ""}
        initialBloodType={profile?.bloodType || ""}
        initialBarangay={profile?.barangay || ""}
        initialIsAvailable={profile?.isAvailable ?? true}
        initialProfilePicture={profile?.profilePicture || ""}
        initialBirthdate={profile?.birthdate || ""} // <-- Ipinasa na natin ang birthdate!
      />
      {profile && <DangerZone />}
    </main>
  );
}