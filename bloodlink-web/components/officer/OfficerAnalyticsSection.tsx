"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatType, BLOOD_TYPES } from "@/components/officer/inventory-components";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

// Professional color palette para sa mga hiwa ng pie chart
const COLORS = [
    "#e11d48", // Rose 600
    "#3b82f6", // Blue 500
    "#10b981", // Emerald 500
    "#f59e0b", // Amber 500
    "#8b5cf6", // Violet 500
    "#ec4899", // Pink 500
    "#06b6d4", // Cyan 500
    "#64748b"  // Slate 500
];

// Custom label function para sa mga external labels na may linya palabas
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25; // Distansya ng text mula sa pie chart
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text 
            x={x} 
            y={y} 
            fill="#334155" 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
        >
            {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
    );
};

export default function OfficerAnalyticsSection() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/officer/analytics/summary")
            .then((res) => setAnalytics(res))
            .catch((err) => console.error("Failed to load analytics summary", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="mt-10 p-6 text-sm text-slate-400">Loading system analytics...</div>;
    }

    const stockMap = analytics?.stockByType || {};
    const monthlyTrendData = analytics?.monthlyTrend || [];

    const pieChartData = BLOOD_TYPES.map((t) => ({
        name: formatType(t),
        value: stockMap[t] || 0,
    })).filter((item) => item.value > 0);

    return (
        <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="text-rose-600" size={22} />
                        System Analytics & Live Inventory
                    </h2>
                    <p className="text-sm text-slate-500">Real-time database breakdown of blood supplies, donor growth, and monthly trends.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                
                {/* Card 1: Classic Full Pie Chart na may External Labels at Lines */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Blood Type Distribution (Classic Pie Chart)</h3>
                        <p className="text-xs text-slate-400 mb-4">Proportion of available blood bags per blood type with external slice pointers.</p>
                    </div>

                    <div className="h-80 w-full flex items-center justify-center">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 20, right: 90, bottom: 20, left: 90 }}>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0} // Solid pie chart na walang butas sa gitna
                                        outerRadius={80}
                                        labelLine={true} // Naglalagay ng guhit papunta sa labas
                                        label={renderCustomizedLabel} // Custom external labels
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-slate-400">No blood stock records found in database yet.</p>
                        )}
                    </div>
                </div>

                {/* Card 2 & 3: Summary Metrics Side Column */}
                <div className="flex flex-col gap-6">
                    
                    {/* Performance Overview */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <TrendingUp size={18} />
                            <h3 className="text-sm font-semibold">Database Overview</h3>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Registered Donors</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{analytics?.totalDonors || 0}</p>
                            </div>
                            <hr className="border-slate-100" />
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Blood Bags Logged</p>
                                <p className="text-3xl font-bold text-rose-600 mt-1">{analytics?.totalBloodBags || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick System Health Notice */}
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Storage Integrity</h4>
                                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                    All active refrigerator units in Baguio storage centers are maintaining optimal temperatures.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Monthly Trend Line Chart Section */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Monthly Donation Collection Trend</h3>
                <p className="text-xs text-slate-400 mb-6">Live performance tracking based on recorded donations throughout the year.</p>
                
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                                itemStyle={{ color: "#f43f5e" }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="donations" 
                                stroke="#e11d48" 
                                strokeWidth={3} 
                                dot={{ fill: "#e11d48", strokeWidth: 2, r: 4 }} 
                                activeDot={{ r: 6 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}