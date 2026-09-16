import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export default function StatCard({ label, value, sub, icon: Icon, highlight }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
        <div className={`rounded-full p-1.5 ${highlight ? "bg-brand-50" : "bg-neutral-100"}`}>
          <Icon size={14} className={highlight ? "text-brand-600" : "text-neutral-500"} />
        </div>
      </div>
      <p className={`text-3xl font-semibold ${highlight ? "text-brand-600" : "text-neutral-800"}`}>{value}</p>
      <p className="text-xs text-neutral-400 mt-1">{sub}</p>
    </div>
  );
}