"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, MapPin, Pencil, Trash2, Droplet, IdCard } from "lucide-react"; // <- Idinagdag ang IdCard dito

export default function DonorDetailPage() {
  const params = useParams();
  const donorId = params.id;

  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isBloodTypeModalOpen, setIsBloodTypeModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isEditDonationModalOpen, setIsEditDonationModalOpen] = useState(false);
  const [isBirthdateModalOpen, setIsBirthdateModalOpen] = useState(false);

  // Form States
  const [selectedBloodType, setSelectedBloodType] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  const [bMonth, setBMonth] = useState("01");
  const [bDay, setBDay] = useState("01");
  const [bYear, setBYear] = useState(String(currentYear - 18));

  const [donationForm, setDonationForm] = useState({
    donationDate: new Date().toISOString().split("T")[0],
    location: "",
    units: "1 unit",
    notes: ""
  });

  const [editingDonationId, setEditingDonationId] = useState<number | null>(null);
  const [editDonationForm, setEditDonationForm] = useState({
    donationDate: "",
    location: "",
    units: "1 unit",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDonor = () => {
    setLoading(true);
    apiFetch(`/officer/donors/${donorId}`)
      .then((res) => {
        setDonor(res);
        setSelectedBloodType(res.bloodType || "");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load donor details.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (donorId) loadDonor();
  }, [donorId]);

  const handleUpdateBloodType = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/officer/donors/${donorId}/blood-type`, {
        method: "PUT",
        body: JSON.stringify({ bloodType: selectedBloodType })
      });
      setIsBloodTypeModalOpen(false);
      loadDonor();
    } catch (error) {
      console.error("Failed to update blood type", error);
      alert("Failed to update blood type.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBirthdate = async () => {
    setIsSubmitting(true);
    try {
      const formattedDate = `${bYear}-${bMonth}-${bDay}`;
      await apiFetch(`/officer/donors/${donorId}/birthdate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdate: formattedDate })
      });
      setIsBirthdateModalOpen(false);
      loadDonor();
    } catch (error) {
      console.error("Failed to update birthdate", error);
      alert("Failed to update birthdate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogDonation = async () => {
    setIsSubmitting(true);
    try {
      const combinedNotes = donationForm.notes
        ? `${donationForm.units} | ${donationForm.notes}`
        : donationForm.units;

      await apiFetch(`/officer/donors/${donorId}/donations`, {
        method: "POST",
        body: JSON.stringify({
          donationDate: donationForm.donationDate,
          location: donationForm.location,
          notes: combinedNotes
        })
      });

      setIsDonationModalOpen(false);
      setDonationForm({ ...donationForm, location: "", notes: "" });
      loadDonor();
    } catch (error) {
      console.error("Failed to log donation", error);
      alert("Failed to log donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (record: any) => {
    setEditingDonationId(record.id);
    let unitsVal = "1 unit";
    let notesVal = record.notes || "";

    if (record.notes && record.notes.includes(" | ")) {
      const parts = record.notes.split(" | ");
      unitsVal = parts[0];
      notesVal = parts.slice(1).join(" | ");
    }

    setEditDonationForm({
      donationDate: record.donationDate || "",
      location: record.location || "",
      units: unitsVal,
      notes: notesVal
    });
    setIsEditDonationModalOpen(true);
  };

  const handleUpdateDonation = async () => {
    if (!editingDonationId) return;
    setIsSubmitting(true);
    try {
      const combinedNotes = editDonationForm.notes
        ? `${editDonationForm.units} | ${editDonationForm.notes}`
        : editDonationForm.units;

      await apiFetch(`/officer/donations/${editingDonationId}`, {
        method: "PUT",
        body: JSON.stringify({
          donationDate: editDonationForm.donationDate,
          location: editDonationForm.location,
          notes: combinedNotes
        })
      });

      setIsEditDonationModalOpen(false);
      setEditingDonationId(null);
      loadDonor();
    } catch (error) {
      console.error("Failed to update donation", error);
      alert("Failed to update donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDonation = async (donationId: number) => {
    if (!confirm("Are you sure you want to delete this donation record?")) return;
    try {
      await apiFetch(`/officer/donations/${donationId}`, { method: "DELETE" });
      loadDonor();
    } catch (error) {
      console.error("Failed to delete donation", error);
      alert("Failed to delete donation.");
    }
  };

  const calculateAge = (birthdateString: string | null) => {
    if (!birthdateString) return "Age ??";
    const birthdate = new Date(birthdateString);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDifference = today.getMonth() - birthdate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    return `Age ${age}`;
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatBloodTypeShort = (type: string | null) => {
    if (!type) return "N/A";
    return type.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
  };

  const formatMonthYear = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatFullDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const extractUnits = (notes: string) => {
    if (notes && notes.includes(" | ")) return notes.split(" | ")[0];
    if (notes && notes.includes("unit")) return notes;
    return "1 unit";
  };

  const extractRealNotes = (notes: string) => {
    if (notes && notes.includes(" | ")) return notes.split(" | ")[1];
    if (notes && notes.includes("unit")) return "";
    return notes;
  };

  let selectedModalAge = 0;
  if (bYear && bMonth && bDay) {
    const bDate = new Date(Number(bYear), Number(bMonth) - 1, Number(bDay));
    const today = new Date();
    selectedModalAge = today.getFullYear() - bDate.getFullYear();
    const mDiff = today.getMonth() - bDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < bDate.getDate())) {
      selectedModalAge--;
    }
  }
  const isUnderage = selectedModalAge < 18;

  if (loading) return <div className="p-8 flex justify-center text-gray-500 text-sm">Loading donor profile...</div>;
  if (error || !donor) return <div className="p-8 text-center text-red-500 text-sm">{error || "Donor not found"}</div>;

  const totalDonations = donor.donationHistory ? donor.donationHistory.length : 0;

  const sortedDonationHistory = donor.donationHistory
    ? [...donor.donationHistory].sort((a: any, b: any) => {
        return new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime();
      })
    : [];

  return (
    <div className="max-w-[1000px] p-6 lg:p-8 mx-auto">
      <Link href="/officer/donors" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors">
        <ArrowLeft size={16} /> Back to directory
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-3xl font-normal overflow-hidden border border-gray-100 shadow-sm">
              {donor.profilePicture ? (
                <img src={donor.profilePicture} alt={donor.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(donor.name)
              )}
            </div>
            <div className="pt-1">
              <h1 className="text-[26px] font-medium text-gray-900 leading-none mb-2">{donor.name}</h1>
              <p className="text-[15px] text-gray-400 mb-4">{donor.email}</p>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* IDINAGDAG: Donor ID Pill */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1" title="Donor ID">
                  <IdCard size={12} className="text-red-400" />
                  <span className="text-xs font-bold text-gray-600">{donor.donorCode || "PENDING ID"}</span>
                </div>

                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsBloodTypeModalOpen(true)} title="Edit Blood Type">
                  <span className="border border-red-200 text-red-500 bg-white rounded-full px-3 py-0.5 text-xs font-medium group-hover:bg-red-50 transition-colors">
                    {formatBloodTypeShort(donor.bloodType)}
                  </span>
                  <Pencil size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <div
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 cursor-pointer group"
                  onClick={() => {
                    if (donor.birthdate) {
                      const [y, m, d] = donor.birthdate.split('-');
                      setBYear(y); setBMonth(m); setBDay(d);
                    } else {
                      setBYear(String(currentYear - 18)); setBMonth("01"); setBDay("01");
                    }
                    setIsBirthdateModalOpen(true);
                  }}
                  title="Edit Birthdate"
                >
                  <span className="text-xs font-medium text-gray-600">{calculateAge(donor.birthdate)}</span>
                  <Pencil size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">{donor.barangay || "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            {donor.isAvailable ? (
              <span className="bg-green-50/50 text-green-600 border border-green-200 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Available
              </span>
            ) : (
              <span className="bg-gray-50 text-gray-500 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Unavailable
              </span>
            )}
          </div>
        </div>

        <hr className="border-gray-50 mb-6" />
        <div className="flex justify-around text-center">
          <div>
            <p className="text-3xl font-medium text-red-600 mb-1">{totalDonations}</p>
            <p className="text-[13px] text-gray-400 font-medium">Total Donations</p>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800 mb-2 mt-2">{formatMonthYear(donor.lastDonationDate)}</p>
            <p className="text-[13px] text-gray-400 font-medium">Last Donation</p>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800 mb-2 mt-2">{donor.phone || "N/A"}</p>
            <p className="text-[13px] text-gray-400 font-medium">Phone</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-medium text-gray-800">Donation History</h2>
          <button onClick={() => setIsDonationModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
            + Record Donation
          </button>
        </div>

        <div>
          {totalDonations > 0 ? (
            <div className="space-y-1">
              {sortedDonationHistory.map((record: any) => (
                <div key={record.id} className="flex items-start justify-between py-5 border-b border-gray-50 last:border-0 group">
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100/50 mt-1">
                      <Droplet size={18} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-gray-800 mb-1">{record.location}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-medium border border-red-100 text-red-500 bg-red-50 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                          {extractUnits(record.notes)}
                        </span>
                        <p className="text-[14px] text-gray-500">{extractRealNotes(record.notes)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] text-gray-400 font-medium">{formatFullDate(record.donationDate)}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button onClick={() => handleOpenEdit(record)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit donation">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDeleteDonation(record.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete donation">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">No donation history recorded yet.</div>
          )}
        </div>
      </div>

      {/* EDIT BLOOD TYPE MODAL */}
      {isBloodTypeModalOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[440px] overflow-hidden p-6 sm:p-8">
            <h3 className="text-[22px] font-medium text-gray-800 mb-6">Edit Blood Type</h3>
            <div className="space-y-5">
              <select value={selectedBloodType} onChange={(e) => setSelectedBloodType(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors">
                <option value="" disabled>Select Blood Type</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
              </select>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={handleUpdateBloodType} disabled={isSubmitting || !selectedBloodType} className="flex-1 bg-[#F0777A] hover:bg-[#e06b6e] text-white text-[15px] font-medium rounded-2xl py-3 transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setIsBloodTypeModalOpen(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[15px] font-medium rounded-2xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD DONATION MODAL */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[440px] overflow-hidden p-6 sm:p-8">
            <h3 className="text-[22px] font-medium text-gray-800 mb-6">Record New Donation</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Donation Date</label>
                <input type="date" value={donationForm.donationDate} onChange={(e) => setDonationForm({ ...donationForm, donationDate: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors" />
              </div>
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Donation Site / Location</label>
                <input type="text" placeholder="e.g. Baguio General Hospital" value={donationForm.location} onChange={(e) => setDonationForm({ ...donationForm, location: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 placeholder-gray-400 transition-colors" />
              </div>
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Units Donated</label>
                <select value={donationForm.units} onChange={(e) => setDonationForm({ ...donationForm, units: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors appearance-none bg-white">
                  <option value="1 unit">1 unit</option>
                  <option value="2 units">2 units</option>
                  <option value="Platelets">Platelets</option>
                  <option value="Plasma">Plasma</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Notes (optional)</label>
                <textarea rows={3} placeholder="Add any relevant notes about this donation..." value={donationForm.notes} onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 placeholder-gray-400 transition-colors resize-none" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={handleLogDonation} disabled={isSubmitting || !donationForm.location} className="flex-1 bg-[#F0777A] text-white text-[15px] font-medium rounded-2xl py-3.5 hover:bg-[#e06b6e] transition-colors disabled:opacity-50">
                {isSubmitting ? "Recording..." : "Record Donation"}
              </button>
              <button onClick={() => setIsDonationModalOpen(false)} className="px-6 py-3.5 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-2xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DONATION MODAL */}
      {isEditDonationModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[440px] overflow-hidden p-6 sm:p-8">
            <h3 className="text-[22px] font-medium text-gray-800 mb-6">Edit Donation Record</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Donation Date</label>
                <input type="date" value={editDonationForm.donationDate} onChange={(e) => setEditDonationForm({ ...editDonationForm, donationDate: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors" />
              </div>
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Donation Site / Location</label>
                <input type="text" value={editDonationForm.location} onChange={(e) => setEditDonationForm({ ...editDonationForm, location: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors" />
              </div>
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Units Donated</label>
                <select value={editDonationForm.units} onChange={(e) => setEditDonationForm({ ...editDonationForm, units: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors appearance-none bg-white">
                  <option value="1 unit">1 unit</option>
                  <option value="2 units">2 units</option>
                  <option value="Platelets">Platelets</option>
                  <option value="Plasma">Plasma</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] text-gray-500 mb-2 font-medium">Notes (optional)</label>
                <textarea rows={3} value={editDonationForm.notes} onChange={(e) => setEditDonationForm({ ...editDonationForm, notes: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors resize-none" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={handleUpdateDonation} disabled={isSubmitting || !editDonationForm.donationDate || !editDonationForm.location} className="flex-1 bg-[#F0777A] text-white text-[15px] font-medium rounded-2xl py-3.5 hover:bg-[#e06b6e] transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => { setIsEditDonationModalOpen(false); setEditingDonationId(null); }} className="px-6 py-3.5 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-2xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BIRTHDATE MODAL */}
      {isBirthdateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[420px] overflow-hidden p-6 sm:p-8">
            <h3 className="text-[22px] font-medium text-gray-800 mb-6">Edit Birthdate</h3>
            <div className="space-y-2">
              <label className="block text-[14px] text-gray-500 font-medium">Select Birthdate</label>
              <div className="flex gap-3">
                <select value={bMonth} onChange={(e) => setBMonth(e.target.value)} className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors appearance-none bg-white cursor-pointer">
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select value={bDay} onChange={(e) => setBDay(e.target.value)} className="w-24 border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors appearance-none bg-white text-center cursor-pointer">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={bYear} onChange={(e) => setBYear(e.target.value)} className="w-28 border border-gray-200 rounded-2xl px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-gray-300 transition-colors appearance-none bg-white text-center cursor-pointer">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {isUnderage && <p className="text-red-500 text-[13px] pt-1">* Donor is only {selectedModalAge} years old. Must be at least 18.</p>}
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={handleUpdateBirthdate} disabled={isSubmitting || !bYear || !bMonth || !bDay || isUnderage} className="flex-1 bg-[#F0777A] hover:bg-[#e06b6e] text-white text-[15px] font-medium rounded-2xl py-3 transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setIsBirthdateModalOpen(false)} className="px-6 py-3 border border-gray-200 text-gray-600 text-[15px] font-medium rounded-2xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}