"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Camera, Calendar, AlertCircle, X } from "lucide-react";

// =========================================================================
// CUSTOM IOS-STYLE SCROLL PICKER COMPONENT
// =========================================================================
function ScrollPicker({ items, value, onChange }: { items: {value: string, label: string}[], value: string, onChange: (v: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll sa gitna kapag bumukas ang modal
  useEffect(() => {
    if (containerRef.current) {
      const index = items.findIndex(i => i.value === value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * 44;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // I-update ang state habang nag-i-scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const index = Math.round(e.currentTarget.scrollTop / 44);
    if (items[index] && items[index].value !== value) {
      onChange(items[index].value);
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 h-[220px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-10"
    >
      {/* Spacer para umabot sa gitna ang unang item */}
      <div className="h-[88px] w-full shrink-0 pointer-events-none"></div>
      
      {items.map(item => (
        <div 
          key={item.value} 
          className={`h-11 flex items-center justify-center text-[16px] snap-center shrink-0 transition-colors cursor-pointer ${
            item.value === value ? 'font-bold text-gray-900' : 'font-medium text-gray-400'
          }`}
        >
          {item.label}
        </div>
      ))}
      
      {/* Spacer para umabot sa gitna ang huling item */}
      <div className="h-[88px] w-full shrink-0 pointer-events-none"></div>
    </div>
  );
}
// =========================================================================


interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  initialBloodType: string;
  initialBarangay: string;
  initialIsAvailable: boolean;
  initialProfilePicture?: string;
  initialBirthdate?: string;
}

export default function ProfileForm({
  initialName,
  initialPhone,
  initialBloodType,
  initialBarangay,
  initialIsAvailable,
  initialProfilePicture,
  initialBirthdate,
}: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [barangay, setBarangay] = useState(initialBarangay);
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [profilePic, setProfilePic] = useState(initialProfilePicture);
  
  // Modal State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Setup Data for Pickers
  const currentYear = new Date().getFullYear();
  const yearItems = Array.from({ length: 100 }, (_, i) => ({
    value: String(currentYear - i), label: String(currentYear - i)
  }));
  const monthItems = [
    { value: "01", label: "Jan" }, { value: "02", label: "Feb" },
    { value: "03", label: "Mar" }, { value: "04", label: "Apr" },
    { value: "05", label: "May" }, { value: "06", label: "Jun" },
    { value: "07", label: "Jul" }, { value: "08", label: "Aug" },
    { value: "09", label: "Sep" }, { value: "10", label: "Oct" },
    { value: "11", label: "Nov" }, { value: "12", label: "Dec" }
  ];
  const dayItems = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"), label: String(i + 1).padStart(2, "0")
  }));

  const initBDate = initialBirthdate ? initialBirthdate.split("-") : [];
  
  // Real States
  const [bYear, setBYear] = useState(initBDate[0] || String(currentYear - 18));
  const [bMonth, setBMonth] = useState(initBDate[1] || "01");
  const [bDay, setBDay] = useState(initBDate[2] || "01");

  // Temporary States (Habang bukas ang modal)
  const [tempYear, setTempYear] = useState(bYear);
  const [tempMonth, setTempMonth] = useState(bMonth);
  const [tempDay, setTempDay] = useState(bDay);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Live Age Validation
  let calculatedAge = 0;
  if (bYear && bMonth && bDay) {
    const bDate = new Date(Number(bYear), Number(bMonth) - 1, Number(bDay));
    const today = new Date();
    calculatedAge = today.getFullYear() - bDate.getFullYear();
    const mDiff = today.getMonth() - bDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < bDate.getDate())) {
      calculatedAge--;
    }
  }
  const isUnderage = calculatedAge < 18;

  const openDatePicker = () => {
    setTempYear(bYear);
    setTempMonth(bMonth);
    setTempDay(bDay);
    setIsDatePickerOpen(true);
  };

  const submitDate = () => {
    setBYear(tempYear);
    setBMonth(tempMonth);
    setBDay(tempDay);
    setIsDatePickerOpen(false);
  };

  const formatDisplayDate = () => {
    const m = monthItems.find(m => m.value === bMonth)?.label || "Jan";
    return `${m} ${bDay}, ${bYear}`;
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch("http://localhost:8080/users/me/profile-picture", {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData, 
      });

      if (!res.ok) throw new Error("Upload failed");
      setMessage("Profile picture updated successfully!");
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isUnderage) {
      setErrorMsg("You must be at least 18 years old to save these changes.");
      return;
    }

    setLoading(true);
    setMessage("");
    setErrorMsg("");
    
    const birthdate = `${bYear}-${bMonth}-${bDay}`;

    try {
      await apiFetch("/donor/profile", {
        method: "POST",
        body: JSON.stringify({ name, barangay, isAvailable, phone, birthdate }), 
      });
      setMessage("Profile saved successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col gap-5 shadow-sm">
        {message && <div className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2">{message}</div>}
        {errorMsg && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{errorMsg}</div>}

        <div className="flex flex-col items-center justify-center pb-4 border-b border-gray-100">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('profilePicInput')?.click()} title="Click to change profile picture">
            <div className="w-24 h-24 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl font-medium overflow-hidden border-2 border-red-100 shadow-sm relative">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                name?.[0] || "U"
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium">
                <Camera size={20} className="mb-1" />
                {uploading ? "Uploading..." : "Change"}
              </div>
            </div>
            <input id="profilePicInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Click avatar to update photo</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 mb-1.5 block">Full Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1.5 block">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXXX" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-1.5 block">Birthdate</label>
            <div 
              onClick={openDatePicker}
              className={`flex items-center w-full border ${isUnderage ? 'border-red-400' : 'border-gray-300'} rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors bg-white`}
            >
              <Calendar size={18} className="text-gray-400 mr-3 shrink-0" />
              <span className="text-[15px] text-gray-900 select-none font-medium">
                {formatDisplayDate()}
              </span>
            </div>
            {isUnderage && (
              <p className="text-red-500 text-[12px] font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={14} /> Must be at least 18 years old.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1.5 block">Blood Type</label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-base text-gray-500">
              {initialBloodType ? initialBloodType.replace("_", " ") : "Pending verification"}
            </div>
            <p className="text-xs text-gray-400 mt-1">Verified by a recruitment officer</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1.5 block">Barangay</label>
            <input type="text" required value={barangay} onChange={(e) => setBarangay(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
        </div>

        <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900">Available to Donate</p>
            <p className="text-xs text-gray-500 mt-0.5">Toggle off if you are temporarily unavailable</p>
          </div>
          <button type="button" onClick={() => setIsAvailable(!isAvailable)} className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${isAvailable ? "bg-red-600" : "bg-gray-300"}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isAvailable ? "translate-x-8" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" disabled={loading || isUnderage} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl py-2.5 transition-colors disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/donor/dashboard")} className="border border-gray-300 text-gray-700 font-medium rounded-xl px-6 py-2.5 hover:bg-gray-50 transition-colors">
            Discard
          </button>
        </div>
      </form>

      {/* ========================================================= */}
      {/* IOS-STYLE WHEEL PICKER MODAL */}
      {/* ========================================================= */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[340px] p-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6">
              <div className="w-5"></div> 
              <span className="text-[12px] font-bold text-gray-500 tracking-[0.15em] uppercase">Set Birthday</span>
              <button onClick={() => setIsDatePickerOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="relative flex justify-between gap-1 h-[220px] mb-6 overflow-hidden bg-white">
              
              {/* Highlight Background in the exact center */}
              <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-11 bg-gray-100 rounded-xl pointer-events-none z-0"></div>
              
              {/* White Fade Overlays sa taas at baba */}
              <div className="absolute top-0 left-0 right-0 h-[70px] bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20"></div>

              {/* The 3 Scroll Pickers */}
              <ScrollPicker items={yearItems} value={tempYear} onChange={setTempYear} />
              <ScrollPicker items={monthItems} value={tempMonth} onChange={setTempMonth} />
              <ScrollPicker items={dayItems} value={tempDay} onChange={setTempDay} />
            </div>

            <button 
              type="button" 
              onClick={submitDate} 
              className="w-full bg-[#111111] hover:bg-black text-white text-[14px] font-bold tracking-widest rounded-2xl py-4 transition-colors"
            >
              SUBMIT
            </button>

          </div>
        </div>
      )}
    </>
  );
}