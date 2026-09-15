// app/admin/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Users, Heart, Droplet, TrendingUp, Download } from "lucide-react";

interface ReportData {
  totalUsers: number;
  totalDonors: number;
  totalDonationsSixMonths: number;
  newRegistrationsSixMonths: number;
  usersByRole: { DONORS: number; OFFICERS: number; ADMINS: number };
  bloodTypeCoverage: Record<string, number>;
  monthlyDonations: Record<string, number>;
  monthlyRegistrations: Record<string, number>;
}

const generateChronologicalData = (backendData: Record<string, number> = {}) => {
  const normalizedData: Record<string, number> = {};
  
  Object.entries(backendData || {}).forEach(([key, value]) => {
    if (key) {
      const cleanKey = String(key).trim().substring(0, 3).toUpperCase();
      normalizedData[cleanKey] = Number(value) || 0;
    }
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels: string[] = [];
  const values: number[] = [];

  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const displayLabel = monthNames[d.getMonth()]; 
    const searchKey = displayLabel.toUpperCase();  
    
    labels.push(displayLabel);
    values.push(normalizedData[searchKey] || 0); 
  }

  return { labels, values };
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/reports")
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error("Failed to load reports", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading live reports...</div>;
  if (!data) return <div className="p-8 text-red-500 text-sm">Failed to load system reports.</div>;

  const donationData = generateChronologicalData(data.monthlyDonations);
  const regData = generateChronologicalData(data.monthlyRegistrations);

  const currentYear = new Date().getFullYear();
  const dateRangeSubtitle = `${donationData.labels[0]} – ${donationData.labels[donationData.labels.length - 1]} ${currentYear}`;

  return (
    <div className="max-w-[1400px]">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Network activity summary · Last 6 months</p>
        </div>
        <button className="bg-white border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
          <Download size={16} />
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard title="TOTAL USERS" value={data.totalUsers} subtitle="All roles" icon={<Users size={18} className="text-gray-500" />} iconBg="bg-gray-100" />
        <StatCard title="TOTAL DONORS" value={data.totalDonors} subtitle="Registered" icon={<Heart size={18} className="text-red-500" />} iconBg="bg-red-50" />
        <StatCard title="DONATIONS (6MO)" value={data.totalDonationsSixMonths} subtitle="Whole blood" icon={<Droplet size={18} className="text-gray-500" />} iconBg="bg-gray-100" />
        <StatCard title="NEW REGISTRATIONS" value={data.newRegistrationsSixMonths} subtitle="Last 6 months" icon={<TrendingUp size={18} className="text-gray-500" />} iconBg="bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard 
          title="Monthly Donations Recorded" 
          subtitle={dateRangeSubtitle} 
          data={donationData.values} 
          labels={donationData.labels} 
          color="bg-[#e53e3e]" 
        />
        <ChartCard 
          title="New User Registrations" 
          subtitle={dateRangeSubtitle} 
          data={regData.values} 
          labels={regData.labels} 
          color="bg-[#fc8181]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Users by Role</h2>
          <div className="flex flex-col gap-6">
            <ProgressBar label="Donors" count={data.usersByRole.DONORS || 0} total={data.totalUsers} color="bg-blue-500" />
            <ProgressBar label="Officers" count={data.usersByRole.OFFICERS || 0} total={data.totalUsers} color="bg-amber-400" />
            <ProgressBar label="Admins" count={data.usersByRole.ADMINS || 0} total={data.totalUsers} color="bg-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Blood Type Coverage</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {Object.entries(data.bloodTypeCoverage || {}).map(([type, count]) => (
              <BloodTypeRow key={type} type={type} count={count} dotColor="bg-red-500" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Dynamic Components ---

function StatCard({ title, value, subtitle, icon, iconBg }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-semibold text-gray-900 mb-1">{value || 0}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, data, labels, color }: any) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const rawMax = Math.max(4, ...data);
  const maxVal = Math.ceil(rawMax / 4) * 4;
  const step = maxVal / 4;

  const ticks = [maxVal, maxVal - step, maxVal - (step * 2), maxVal - (step * 3), 0];
  const maxHeightPx = 130;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500 mb-6">{subtitle}</p>
      
      <div className="flex w-full h-44 items-end relative">
        {/* Left Y-Axis Labels */}
        <div className="flex flex-col justify-between h-[130px] pr-3 text-[11px] text-gray-400 select-none text-right w-8">
          {ticks.map((t, idx) => (
            <span key={idx} className="leading-none">{t}</span>
          ))}
        </div>

        {/* Chart Area with Gridlines */}
        <div className="relative flex-1 h-[130px] flex items-end">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {ticks.map((_, idx) => (
              <div key={idx} className="border-t border-gray-100 border-dashed w-full"></div>
            ))}
          </div>

          {/* Bars Container */}
          <div className="w-full flex justify-between items-end z-10 px-3 h-full">
            {data.map((val: number, i: number) => {
              const ratio = val / maxVal;
              const barHeight = val > 0 ? Math.max(ratio * maxHeightPx, 8) : 2;
              
              return (
                <div 
                  key={i} 
                  className="flex flex-col items-center justify-end relative cursor-pointer flex-1 h-full"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {hoveredIndex === i && (
                    <div className="absolute -top-10 bg-white border border-gray-200 shadow-lg rounded-lg py-1 px-2.5 text-center z-30 min-w-[70px] pointer-events-none whitespace-nowrap">
                      <p className="text-[10px] text-gray-500 font-medium">{labels[i]}</p>
                      <p className="text-xs text-red-600 font-bold">count: {val}</p>
                    </div>
                  )}
                  {/* Made the bars substantially wider (w-[85%] with max-w-[54px]) */}
                  <div 
                    className={`w-[85%] max-w-[54px] rounded-t-md transition-all duration-300 ${val > 0 ? color : 'bg-gray-100'}`} 
                    style={{ height: `${barHeight}px` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* X-Axis Month Labels */}
      <div className="flex pl-11 pr-2 mt-3 text-[11px] font-medium text-gray-500">
        {labels.map((m: string) => <span key={m} className="flex-1 text-center">{m}</span>)}
      </div>
    </div>
  );
}

function ProgressBar({ label, count, total, color }: any) {
  const percent = total > 0 ? `${Math.round((count / total) * 100)}%` : "0%";
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-400 text-xs">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: percent }}></div>
      </div>
    </div>
  );
}

function BloodTypeRow({ type, count, dotColor }: any) {
  return (
    <div className="flex justify-between items-center text-sm bg-gray-50/80 px-4 py-2.5 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
        <span className="font-medium text-gray-700">{type}</span>
      </div>
      <span className="text-gray-400 text-xs">{count}</span>
    </div>
  );
}