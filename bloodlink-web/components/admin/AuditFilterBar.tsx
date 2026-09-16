import { Search } from "lucide-react";

interface AuditFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

const TYPES = ["ROLE_CHANGE", "DELETION", "VIEW", "EDIT", "CREATED", "AUTH", "EXPORT"];

export default function AuditFilterBar({ search, onSearchChange, typeFilter, onTypeFilterChange }: AuditFilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-2 w-full flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by user or action..."
          className="w-full bg-gray-50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700"
      >
        <option value="">All Types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>{t.replace("_", " ")}</option>
        ))}
      </select>
    </div>
  );
}