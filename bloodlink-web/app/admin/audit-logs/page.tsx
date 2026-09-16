
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import AuditFilterBar from "@/components/admin/AuditFilterBar";
import AuditLogTable from "@/components/admin/AuditLogTable";

interface AuditLog {
  id: number;
  actorName: string;
  actorEmail: string;
  action: string;
  targetDetail: string | null;
  type: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    apiFetch("/admin/audit-logs")
      .then((data) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || log.type === typeFilter;

    return matchesSearch && matchesType;
  });

  function exportCsv() {
    const headers = [
      "User",
      "Email",
      "Action",
      "Target/Detail",
      "Type",
      "Timestamp",
    ];

    const rows = filteredLogs.map((log) => [
      log.actorName,
      log.actorEmail,
      log.action,
      log.targetDetail || "",
      log.type,
      log.createdAt,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `audit-logs-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();

    const recordCount = filteredLogs.length;

    apiFetch("/audit/client-event", {
      method: "POST",
      body: JSON.stringify({
        action: "Exported audit logs",
        targetDetail: `${recordCount} records · CSV`,
        type: "EXPORT",
      }),
    }).catch(console.error);

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Audit Logs
          </h1>

          <p className="text-sm text-gray-500">
            Full activity trail for all users and admins.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="bg-white border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <AuditFilterBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Loading...
        </p>
      ) : (
        <AuditLogTable logs={filteredLogs} />
      )}
    </div>
  );
}

