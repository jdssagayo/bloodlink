"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronRight, IdCard } from "lucide-react";

export default function DonorsDirectoryPage() {
  const router = useRouter();
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    apiFetch("/officer/donors")
      .then((res) => {
        setDonors(Array.isArray(res) ? res : []);
      })
      .catch((err) => console.error("Failed to load donors", err))
      .finally(() => setLoading(false));
  }, []);

  // Formatters
  const formatBloodType = (type: string | null) => {
    if (!type) return "-";
    return type.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter Logic
  const filteredDonors = donors.filter(d => {
    const matchesSearch = 
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.donorCode?.toLowerCase().includes(searchQuery.toLowerCase()) || // Added searching by donorCode
      d.barangay?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    
    const matchesBloodType = selectedBloodType === "All" || d.bloodType === selectedBloodType;
    const matchesAvailability = availableOnly ? d.isAvailable === true : true;

    return matchesSearch && matchesBloodType && matchesAvailability;
  });

  if (loading) return <div className="p-8 text-gray-400 text-sm flex justify-center">Loading donor directory...</div>;

  return (
    <div className="max-w-[1200px] p-6 lg:p-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Donor Directory</h1>
        <p className="text-sm text-gray-400 font-medium">{filteredDonors.length} of {donors.length} donors</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text"
            placeholder="Search name, ID, or barangay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm outline-none text-gray-600 placeholder-gray-400 bg-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 text-sm text-gray-600 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={selectedBloodType}
              onChange={(e) => setSelectedBloodType(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-gray-700 font-medium"
            >
              <option value="All">All</option>
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer ml-2">
            <input 
              type="checkbox" 
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer"
            />
            <span className="font-medium text-gray-700">Available only</span>
          </label>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        
        {/* Table Header */}
        <div className="grid grid-cols-[minmax(240px,2fr)_120px_minmax(150px,1.5fr)_minmax(120px,1.5fr)_120px_40px] px-6 py-4 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <span>Name & ID</span>
          <span>Blood Type</span>
          <span>Barangay</span>
          <span>Last Donation</span>
          <span>Status</span>
          <span></span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-50">
          {filteredDonors.length > 0 ? (
            filteredDonors.map((donor: any) => (
              <div 
                key={donor.id} 
                onClick={() => router.push(`/officer/donors/${donor.id}`)}
                className="grid grid-cols-[minmax(240px,2fr)_120px_minmax(150px,1.5fr)_minmax(120px,1.5fr)_120px_40px] px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                {/* Name, Email, & Profile Picture & Donor ID */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 font-semibold text-sm flex items-center justify-center overflow-hidden border border-red-100/50 shrink-0">
                    {donor.profilePicture ? (
                      <img src={donor.profilePicture} alt={donor.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(donor.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{donor.name || "Unknown"}</p>
                    <p className="text-[13px] text-gray-400 truncate">{donor.email}</p>
                    {/* The New Donor ID Badge */}
                    <div className="mt-1 inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
                      <IdCard size={10} className="text-red-400" />
                      {donor.donorCode || "PENDING ID"}
                    </div>
                  </div>
                </div>

                {/* Blood Type */}
                <div>
                  <span className="bg-white text-red-500 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold">
                    {formatBloodType(donor.bloodType)}
                  </span>
                </div>

                {/* Barangay */}
                <span className="text-sm text-gray-600 truncate pr-4">{donor.barangay || "-"}</span>

                {/* Last Donation */}
                <span className="text-sm text-gray-500">{formatDate(donor.lastDonationDate)}</span>

                {/* Status */}
                <div>
                  {donor.isAvailable ? (
                    <span className="bg-green-50 text-green-600 border border-green-200/60 rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Available
                    </span>
                  ) : (
                    <span className="bg-gray-50 text-gray-500 border border-gray-200/80 rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      Unavailable
                    </span>
                  )}
                </div>

                {/* Chevron */}
                <div className="text-right flex justify-end">
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-red-400 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-sm text-gray-400">
              No donors found matching your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}