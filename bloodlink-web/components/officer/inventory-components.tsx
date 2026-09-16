"use client";

import { useEffect } from "react";
import { X, AlertTriangle, Droplet } from "lucide-react";

/* --- Constants & Types --- */

export const SHELF_LIFE_DAYS = 35;
export const EXPIRING_SOON_DAYS = 7;

export const BLOOD_TYPES = [
  "O_NEGATIVE",
  "O_POSITIVE",
  "A_NEGATIVE",
  "A_POSITIVE",
  "B_NEGATIVE",
  "B_POSITIVE",
  "AB_NEGATIVE",
  "AB_POSITIVE",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

export const CAN_RECEIVE: Record<BloodType, BloodType[]> = {
  O_NEGATIVE: ["O_NEGATIVE"],
  O_POSITIVE: ["O_NEGATIVE", "O_POSITIVE"],
  A_NEGATIVE: ["O_NEGATIVE", "A_NEGATIVE"],
  A_POSITIVE: ["O_NEGATIVE", "O_POSITIVE", "A_NEGATIVE", "A_POSITIVE"],
  B_NEGATIVE: ["O_NEGATIVE", "B_NEGATIVE"],
  B_POSITIVE: ["O_NEGATIVE", "O_POSITIVE", "B_NEGATIVE", "B_POSITIVE"],
  AB_NEGATIVE: ["O_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "AB_NEGATIVE"],
  AB_POSITIVE: [...BLOOD_TYPES],
};

export const STORAGE_LOCATIONS = [
  "BGHMC Main Fridge",
  "BGHMC Reserve Fridge",
  "SLU Hospital Fridge",
  "Mobile Transport Cooler",
];

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso: string, n: number) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const daysBetween = (a: string, b: string) =>
  Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000);

export const prettyDate = (iso: string) =>
  fromISO(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export interface Dispatch {
  patient: string;
  patientBloodType: BloodType;
  hospital: string;
  department: string;
  dispatchedOn: string;
}

export interface BloodBag {
  id: string;
  donorName: string;
  bloodType: BloodType;
  collectedDate: string;
  location: string;
  dispatch: Dispatch | null;
}

export type DerivedStatus = "AVAILABLE" | "EXPIRING" | "EXPIRED" | "USED";

export const formatType = (t: string) =>
  t.replace("_POSITIVE", "+").replace("_NEGATIVE", "\u2212");

export const expiryOf = (bag: BloodBag) => addDays(bag.collectedDate, SHELF_LIFE_DAYS);

export const statusOf = (bag: BloodBag, today: string): DerivedStatus => {
  if (bag.dispatch) return "USED";
  const left = daysBetween(today, expiryOf(bag));
  if (left < 0) return "EXPIRED";
  if (left <= EXPIRING_SOON_DAYS) return "EXPIRING";
  return "AVAILABLE";
};

export const STATUS_STYLE: Record<
  DerivedStatus,
  { label: string; chip: string; dot: string }
> = {
  AVAILABLE: {
    label: "In fridge",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  EXPIRING: {
    label: "Use soon",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  EXPIRED: {
    label: "Expired",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  USED: {
    label: "Dispatched",
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

export const SEED: BloodBag[] = [
  {
    id: "BB-2026-001",
    donorName: "Jancer D. Sagayo",
    bloodType: "A_POSITIVE",
    collectedDate: "2026-09-15",
    location: "BGHMC Main Fridge",
    dispatch: null,
  },
  {
    id: "BB-2026-002",
    donorName: "Denzel Galvez",
    bloodType: "O_NEGATIVE",
    collectedDate: "2026-09-10",
    location: "BGHMC Main Fridge",
    dispatch: null,
  },
  {
    id: "BB-2026-003",
    donorName: "Ronnel Cagbay",
    bloodType: "B_POSITIVE",
    collectedDate: "2026-08-20",
    location: "SLU Hospital Fridge",
    dispatch: {
      patient: "Juan Dela Cruz",
      patientBloodType: "B_POSITIVE",
      hospital: "BGHMC",
      department: "Emergency Room",
      dispatchedOn: "2026-09-02",
    },
  },
  {
    id: "BB-2026-004",
    donorName: "Maria Fontanilla",
    bloodType: "A_POSITIVE",
    collectedDate: "2026-08-14",
    location: "BGHMC Reserve Fridge",
    dispatch: null,
  },
  {
    id: "BB-2026-005",
    donorName: "Paolo Bautista",
    bloodType: "O_POSITIVE",
    collectedDate: "2026-07-28",
    location: "BGHMC Main Fridge",
    dispatch: null,
  },
];

export const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

export const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";


/* --- UI Components --- */

export function StatusChip({ status }: { status: DerivedStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function TypeChip({ type }: { type: any }) {
  return (
    <span className="inline-flex min-w-[2.75rem] justify-center rounded-md border border-rose-200/70 bg-rose-50 px-2 py-0.5 text-xs font-bold tabular-nums text-rose-700">
      {formatType(type)}
    </span>
  );
}

export function ShelfLife({ bag, today }: { bag: BloodBag; today: string }) {
  const expiry = expiryOf(bag);
  const left = daysBetween(today, expiry);
  const used = Math.min(Math.max(SHELF_LIFE_DAYS - left, 0), SHELF_LIFE_DAYS);
  const pct = (used / SHELF_LIFE_DAYS) * 100;

  const tone =
    left < 0
      ? "bg-rose-500"
      : left <= EXPIRING_SOON_DAYS
      ? "bg-amber-500"
      : "bg-emerald-500";

  const caption =
    left < 0
      ? `Expired ${Math.abs(left)} ${Math.abs(left) === 1 ? "day" : "days"} ago`
      : left === 0
      ? "Expires today"
      : `${left} ${left === 1 ? "day" : "days"} left`;

  return (
    <div className="w-full max-w-[9rem]">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span
          className={`text-xs font-semibold ${
            left < 0
              ? "text-rose-600"
              : left <= EXPIRING_SOON_DAYS
              ? "text-amber-600"
              : "text-slate-700"
          }`}
        >
          {caption}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{prettyDate(expiry)}</p>
    </div>
  );
}

export function MetricCard({
  icon,
  value,
  label,
  tone,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
        active
          ? "border-slate-900 shadow-md"
          : "border-slate-200/80 shadow-sm hover:border-slate-300"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums text-slate-900">
          {value}
        </p>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  width = "max-w-[460px]",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${width} max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function RowAction({
  status,
  onDispatch,
  full = false,
}: {
  status: DerivedStatus;
  onDispatch: () => void;
  full?: boolean;
}) {
  if (status === "USED")
    return <span className="text-xs text-slate-400">Logged in audit trail</span>;

  if (status === "EXPIRED")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600">
        <AlertTriangle size={13} /> Discard
      </span>
    );

  return (
    <button
      onClick={onDispatch}
      className={`rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
        full ? "w-full py-2.5 text-sm" : ""
      }`}
    >
      Dispatch
    </button>
  );
}

export function ExpiryPreview({
  collectedDate,
  today,
}: {
  collectedDate: string;
  today: string;
}) {
  const expiry = expiryOf({ collectedDate } as BloodBag);
  const left = daysBetween(today, expiry);

  if (daysBetween(today, collectedDate) > 0)
    return (
      <p className="mt-2 text-xs font-medium text-rose-600">
        Collection dates can&apos;t be in the future.
      </p>
    );

  if (left < 0)
    return (
      <p className="mt-2 text-xs font-medium text-rose-600">
        This bag would already be expired ({prettyDate(expiry)}).
      </p>
    );

  return (
    <p className="mt-2 text-xs text-slate-500">
      Expires {prettyDate(expiry)} &mdash; {left}{" "}
      {left === 1 ? "day" : "days"} of shelf life.
    </p>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <span className="text-lg font-bold">∅</span>
      </div>
      <p className="text-sm font-medium text-slate-700">
        No bags match this view
      </p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Adjust the search or filters to see the rest of the fridge.
      </p>
      <button
        onClick={onReset}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        Show all bags
      </button>
    </div>
  );
}