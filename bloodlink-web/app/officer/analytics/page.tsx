"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, MapPin, ShieldAlert, Activity, PieChart, Users, Building } from "lucide-react";

export default function AdvancedAnalyticsPage() {
  // DATA SCIENCE MOCK DATA (Focused on operations, risk, location, and trends)
  const barangayData = [
    { name: "Bakakeng Central", count: 42, percentage: 85 },
    { name: "Session Road / CBD", count: 35, percentage: 70 },
    { name: "Loakan Proper", count: 28, percentage: 55 },
    { name: "Aurora Hill", count: 20, percentage: 40 },
    { name: "Campo Filipino", count: 15, percentage: 30 },
  ];

  const expiryRiskData = [
    { category: "Safe (>20 days left)", count: 24, color: "bg-green-500", width: "65%" },
    { category: "Warning (10-20 days)", count: 9, color: "bg-yellow-500", width: "25%" },
    { category: "Critical Risk (<10 days)", count: 4, color: "bg-red-500", width: "10%" },
  ];

  const monthlyVelocity = [
    { month: "May", donations: 18 },
    { month: "Jun", donations: 24 },
    { month: "Jul", donations: 30 },
    { month: "Aug", donations: 25 },
    { month: "Sep", donations: 38 },
  ];

  const hospitalDestinations = [
    { hospital: "BGHMC - Emergency Room", share: "45%", color: "bg-blue-600" },
    { hospital: "SLU Hospital - ICU", share: "30%", color: "bg-blue-400" },
    { hospital: "Pines City Doctors", share: "15%", color: "bg-indigo-300" },
    { hospital: "Other Clinics", share: "10%", color: "bg-gray-300" },
  ];

  return (
    <div className="max-w-[1200px] p-6 lg:p-10 mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-800">Advanced Analytics & Intelligence</h1>
        <p className="text-sm text-gray-400 mt-0.5">Predictive metrics, geographic distribution, and supply chain risk analysis.</p>
      </div>

      {/* TOP METRICS ROW (Data Science KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Turnover Rate</span>
          </div>
          <p className="text-2xl font-medium text-gray-800">84.2%</p>
          <p className="text-xs text-green-600 mt-1 font-medium">↑ +5.4% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Wastage / Expiry Risk</span>
          </div>
          <p className="text-2xl font-medium text-gray-800">3.8%</p>
          <p className="text-xs text-gray-400 mt-1 font-medium">Within safety threshold (&lt;5%)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Donor Pool</span>
          </div>
          <p className="text-2xl font-medium text-gray-800">142</p>
          <p className="text-xs text-green-600 mt-1 font-medium">Eligible for donation</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building size={18} />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Dispatch Time</span>
          </div>
          <p className="text-2xl font-medium text-gray-800">18 mins</p>
          <p className="text-xs text-purple-600 mt-1 font-medium">Request to release</p>
        </div>
      </div>

      {/* GRAPHS GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* GRAPH 1: GEOGRAPHIC DENSITY (Barangay Breakdown) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-red-500" />
              <h3 className="text-base font-medium text-gray-800">Geographic Donation Density</h3>
            </div>
            <span className="text-xs text-gray-400">Top Barangays</span>
          </div>

          <div className="space-y-4">
            {barangayData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>{item.name}</span>
                  <span className="text-gray-400">{item.count} bags</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div style={{ width: `${item.percentage}%` }} className="h-full bg-red-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRAPH 2: SHELF-LIFE EXPIRY RISK MATRIX */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-yellow-500" />
              <h3 className="text-base font-medium text-gray-800">35-Day Shelf-Life Expiry Risk Matrix</h3>
            </div>
            <span className="text-xs text-gray-400">Active Stock</span>
          </div>

          <div className="space-y-5">
            {expiryRiskData.map((risk, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>{risk.category}</span>
                  <span className="font-semibold text-gray-800">{risk.count} bags</span>
                </div>
                <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                  <div style={{ width: risk.width }} className={`h-full ${risk.color} rounded-full`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECOND ROW OF GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRAPH 3: TEMPORAL DONATION VELOCITY (Trend Line Concept) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" />
              <h3 className="text-base font-medium text-gray-800">Temporal Donation Velocity (Monthly)</h3>
            </div>
            <span className="text-xs text-gray-400">Inbound Trend</span>
          </div>

          {/* Simulated Bar/Column Graph */}
          <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4 border-b border-gray-100">
            {monthlyVelocity.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-medium text-gray-500">{m.donations}</span>
                <div 
                  style={{ height: `${(m.donations / 45) * 100}%` }} 
                  className="w-full bg-red-500/80 hover:bg-red-600 rounded-t-lg transition-all"
                ></div>
                <span className="text-xs font-medium text-gray-400 pb-1">{m.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">* Indicates steady increase in community blood drives.</p>
        </div>

        {/* GRAPH 4: HOSPITAL DISPATCH DESTINATION SHARE */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-blue-500" />
              <h3 className="text-base font-medium text-gray-800">Hospital Dispatch Destination Share</h3>
            </div>
            <span className="text-xs text-gray-400">Outbound Ratio</span>
          </div>

          <div className="space-y-4">
            {hospitalDestinations.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${h.color}`}></span>
                  <span className="text-sm font-medium text-gray-700">{h.hospital}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{h.share}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}