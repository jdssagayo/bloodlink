"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Halimbawa ng data structure na galing sa backend o kinakalkula
const data = [
  { month: "Jan", donations: 12 },
  { month: "Feb", donations: 19 },
  { month: "Mar", donations: 15 },
  { month: "Apr", donations: 28 },
  { month: "May", donations: 34 },
  { month: "Jun", donations: 42 },
];

export default function MonthlyTrendChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Monthly Collection Trend</h3>
      <p className="text-xs text-slate-400 mb-6">Total blood drives and donations over the last 6 months.</p>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
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
  );
}