interface AuditLog {
  id: number;
  actorName: string;
  actorEmail: string;
  action: string;
  targetDetail: string | null;
  type: string;
  createdAt: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
}

const TYPE_STYLES: Record<string, string> = {
  ROLE_CHANGE: "bg-purple-50 border-purple-200 text-purple-700",
  DELETION: "bg-red-50 border-red-200 text-red-700",
  VIEW: "bg-gray-100 border-gray-200 text-gray-700",
  EDIT: "bg-amber-50 border-amber-200 text-amber-700",
  CREATED: "bg-green-50 border-green-200 text-green-700",
  AUTH: "bg-blue-50 border-blue-200 text-blue-700",
  EXPORT: "bg-teal-50 border-teal-200 text-teal-700",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
      <div className="grid grid-cols-[2fr_2fr_3fr_1.5fr_1.5fr] gap-4 py-4 px-6 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">User</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Action</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Target / Detail</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Type</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Timestamp</span>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No audit logs found.</p>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            className="grid grid-cols-[2fr_2fr_3fr_1.5fr_1.5fr] gap-4 items-center py-4 px-6 border-b last:border-b-0 border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium">
                {initials(log.actorName)}
              </div>
              <span className="text-sm font-medium text-gray-900">{log.actorName}</span>
            </div>

            <span className="text-sm text-gray-700">{log.action}</span>

            <span className="text-sm text-gray-500">{log.targetDetail || "—"}</span>

            <span className={`rounded-full px-3 py-1 text-xs font-medium border w-fit ${TYPE_STYLES[log.type] || TYPE_STYLES.VIEW}`}>
              {log.type.replace("_", " ")}
            </span>

            <span className="text-sm text-gray-400">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}