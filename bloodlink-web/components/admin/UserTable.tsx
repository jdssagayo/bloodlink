import { Trash2 } from "lucide-react";

interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UserTableProps {
  users: UserSummary[];
  onRoleChange: (id: number, newRole: string) => void;
  onDelete: (id: number, name: string) => void;
}

const ROLES = ["DONOR", "OFFICER", "ADMIN"];

const ROLE_STYLES: Record<string, string> = {
  DONOR: "bg-blue-100 border-blue-200 text-blue-700",
  OFFICER: "bg-amber-100 border-amber-200 text-amber-700",
  ADMIN: "bg-red-100 border-red-200 text-red-700",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function UserTable({ users, onRoleChange, onDelete }: UserTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
      <div className="grid grid-cols-[2.5fr_2fr_1.5fr_1.5fr_auto] gap-4 py-4 px-6 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Name</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Email</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Role</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Joined</span>
        <span></span>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No users found.</p>
      ) : (
        users.map((u) => (
          <div
            key={u.id}
            className="grid grid-cols-[2.5fr_2fr_1.5fr_1.5fr_auto] gap-4 items-center py-4 px-6 border-b last:border-b-0 border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium">
                {initials(u.name)}
              </div>
              <span className="text-sm font-medium text-gray-900">{u.name}</span>
            </div>

            <span className="text-sm text-gray-500">{u.email}</span>

            <select
              value={u.role}
              onChange={(e) => onRoleChange(u.id, e.target.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium border w-fit ${ROLE_STYLES[u.role]}`}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <span className="text-sm text-gray-500">{u.createdAt?.slice(0, 10)}</span>

            <button
              onClick={() => onDelete(u.id, u.name)}
              className="text-gray-300 hover:text-red-600 transition-colors justify-self-end"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}