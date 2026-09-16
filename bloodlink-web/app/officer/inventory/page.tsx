"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Droplet,
    Plus,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Send,
    Search,
    ShieldAlert,
    ShieldCheck,
    CalendarClock,
    ArrowDownUp,
} from "lucide-react";

import {
    SHELF_LIFE_DAYS,
    EXPIRING_SOON_DAYS,
    BLOOD_TYPES,
    CAN_RECEIVE,
    STORAGE_LOCATIONS,
    toISO,
    daysBetween,
    prettyDate,
    BloodBag,
    Dispatch,
    DerivedStatus,
    formatType,
    expiryOf,
    statusOf,
    fieldClass,
    labelClass,
    BloodType,
    StatusChip,
    TypeChip,
    ShelfLife,
    MetricCard,
    Modal,
    RowAction,
    ExpiryPreview,
    EmptyState,
} from "@/components/officer/inventory-components";

export default function InventoryPage() {
    const [today, setToday] = useState("");
    useEffect(() => setToday(toISO(new Date())), []);

    const [inventory, setInventory] = useState<BloodBag[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/api/inventory", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        })
            .then(async (res) => {
                const text = await res.text();
                return text ? JSON.parse(text) : [];
            })
            .then((data) => {
                if (!Array.isArray(data)) return;
                const formatted = data.map((item: any) => ({
                    id: item.bagId,
                    donorName: item.donorName,
                    bloodType: item.bloodType,
                    collectedDate: item.collectedDate,
                    location: item.location,
                    dispatch: item.status === "USED" ? {
                        patient: item.patientName,
                        patientBloodType: item.patientBloodType,
                        hospital: item.hospital,
                        department: item.department,
                        dispatchedOn: item.dispatchedOn || item.collectedDate,
                    } : null,
                }));
                setInventory(formatted);
            })
            .catch((err) => console.error("Error fetching inventory from backend:", err));
    }, []);

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | DerivedStatus>("ALL");
    const [typeFilter, setTypeFilter] = useState<"ALL" | BloodType>("ALL");
    const [sortBy, setSortBy] = useState<"EXPIRY" | "NEWEST" | "DONOR">("EXPIRY");

    const [inboundOpen, setInboundOpen] = useState(false);
    const [dispatchId, setDispatchId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const [allDonors, setAllDonors] = useState<any[]>([]);
    
    // States para sa Inbound (Donor)
    const [donorSuggestions, setDonorSuggestions] = useState<any[]>([]);
    const [isBloodTypeLocked, setIsBloodTypeLocked] = useState(false);

    // States para sa Dispatch (Patient)
    const [patientSuggestions, setPatientSuggestions] = useState<any[]>([]);
    const [isPatientBloodTypeLocked, setIsPatientBloodTypeLocked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/officer/donors", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const text = await res.text();
                return text ? JSON.parse(text) : [];
            })
            .then((data) => {
                if (Array.isArray(data)) setAllDonors(data);
            })
            .catch((err) => console.error("Error fetching donors list:", err));
    }, []);

    const [newBag, setNewBag] = useState({
        donorName: "",
        bloodType: BLOOD_TYPES[3] as BloodType,
        collectedDate: "",
        location: STORAGE_LOCATIONS[0],
    });

    const [dispatchForm, setDispatchForm] = useState({
        patient: "",
        patientBloodType: "" as BloodType | "",
        hospital: "",
        department: "",
    });

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    const counts = useMemo(() => {
        const base = { AVAILABLE: 0, EXPIRING: 0, EXPIRED: 0, USED: 0 };
        if (!today) return base;
        for (const bag of inventory) base[statusOf(bag, today)] += 1;
        return base;
    }, [inventory, today]);

    const visible = useMemo(() => {
        if (!today) return [];
        const q = query.trim().toLowerCase();

        const rows = inventory.filter((bag) => {
            const status = statusOf(bag, today);
            if (statusFilter !== "ALL" && status !== statusFilter) return false;
            if (typeFilter !== "ALL" && bag.bloodType !== typeFilter) return false;
            if (!q) return true;
            return [
                bag.id,
                bag.donorName,
                bag.location,
                bag.dispatch?.patient ?? "",
                bag.dispatch?.hospital ?? "",
                bag.dispatch?.department ?? "",
            ]
                .join(" ")
                .toLowerCase()
                .includes(q);
        });

        return rows.sort((a, b) => {
            if (sortBy === "DONOR") return a.donorName.localeCompare(b.donorName);
            if (sortBy === "NEWEST")
                return (
                    b.collectedDate.localeCompare(a.collectedDate) ||
                    b.id.localeCompare(a.id)
                );
            const aOut = a.dispatch ? 1 : 0;
            const bOut = b.dispatch ? 1 : 0;
            if (aOut !== bOut) return aOut - bOut;
            return expiryOf(a).localeCompare(expiryOf(b));
        });
    }, [inventory, today, query, statusFilter, typeFilter, sortBy]);

    const activeBag = inventory.find((b) => b.id === dispatchId) ?? null;

    const compatible =
        activeBag && dispatchForm.patientBloodType
            ? CAN_RECEIVE[dispatchForm.patientBloodType].includes(activeBag.bloodType)
            : null;

    const nextId = useCallback(
        (collectedDate: string) => {
            const year = collectedDate.slice(0, 4);
            const highest = inventory
                .filter((b) => b.id.startsWith(`BB-${year}-`))
                .reduce((max, b) => Math.max(max, Number(b.id.split("-")[2]) || 0), 0);
            return `BB-${year}-${String(highest + 1).padStart(3, "0")}`;
        },
        [inventory]
    );

    const openInbound = () => {
        setNewBag({
            donorName: "",
            bloodType: "A_POSITIVE",
            collectedDate: today,
            location: STORAGE_LOCATIONS[0],
        });
        setIsBloodTypeLocked(false);
        setDonorSuggestions([]);
        setInboundOpen(true);
    };

    const handleAddInbound = async (e: React.FormEvent) => {
        e.preventDefault();
        const donorName = newBag.donorName.trim();
        if (!donorName || !newBag.collectedDate) return;
        if (daysBetween(today, newBag.collectedDate) > 0) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:8080/api/inventory/inbound", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    donorName: donorName,
                    bloodType: newBag.bloodType,
                    collectedDate: newBag.collectedDate,
                    location: newBag.location,
                }),
            });

            if (response.ok) {
                const savedBag = await response.json();

                const bag: BloodBag = {
                    id: savedBag.bagId,
                    donorName: savedBag.donorName,
                    bloodType: savedBag.bloodType,
                    collectedDate: savedBag.collectedDate,
                    location: savedBag.location,
                    dispatch: null,
                };

                setInventory((prev) => [bag, ...prev]);
                setInboundOpen(false);
                setToast(`${bag.id} added to ${bag.location}.`);
            }
        } catch (error) {
            console.error("Error saving inbound bag:", error);
        }
    };

    const openDispatch = (id: string) => {
        setDispatchId(id);
        setDispatchForm({
            patient: "",
            patientBloodType: "",
            hospital: "",
            department: "",
        });
        setIsPatientBloodTypeLocked(false); // Reset lock kapag binuksan ang modal
        setPatientSuggestions([]);
    };

    const handleConfirmDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeBag || !dispatchForm.patientBloodType || !compatible) return;
        if (statusOf(activeBag, today) === "EXPIRED") return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8080/api/inventory/${activeBag.id}/dispatch`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    patientName: dispatchForm.patient.trim(),
                    patientBloodType: dispatchForm.patientBloodType,
                    hospital: dispatchForm.hospital.trim(),
                    department: dispatchForm.department.trim(),
                }),
            });

            if (response.ok) {
                const record: Dispatch = {
                    patient: dispatchForm.patient.trim(),
                    patientBloodType: dispatchForm.patientBloodType,
                    hospital: dispatchForm.hospital.trim(),
                    department: dispatchForm.department.trim(),
                    dispatchedOn: today,
                };

                setInventory((prev) =>
                    prev.map((b) => (b.id === activeBag.id ? { ...b, dispatch: record } : b))
                );
                setToast(`${activeBag.id} released to ${record.patient}.`);
                setDispatchId(null);
            }
        } catch (error) {
            console.error("Error dispatching bag:", error);
        }
    };

    if (!today) {
        return (
            <div className="mx-auto max-w-[1200px] p-6 lg:p-10">
                <div className="h-8 w-72 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-[88px] animate-pulse rounded-2xl bg-slate-100"
                        />
                    ))}
                </div>
                <div className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-100" />
            </div>
        );
    }

    const cols =
        "grid-cols-[110px_minmax(140px,1fr)_70px_120px_150px_minmax(180px,1.2fr)_100px]";

    return (
        <div className="mx-auto max-w-[1200px] p-6 lg:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Blood bag inventory
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Every unit keeps a {SHELF_LIFE_DAYS}-day shelf life from collection.
                        Oldest compatible unit goes out first.
                    </p>
                </div>
                <button
                    onClick={openInbound}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                >
                    <Plus size={16} /> Log a collection
                </button>
            </div>

            {/* Metrics */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    icon={<CheckCircle2 size={22} />}
                    value={counts.AVAILABLE}
                    label="Ready in fridge"
                    tone="bg-emerald-50 text-emerald-600"
                    active={statusFilter === "AVAILABLE"}
                    onClick={() =>
                        setStatusFilter((s) => (s === "AVAILABLE" ? "ALL" : "AVAILABLE"))
                    }
                />
                <MetricCard
                    icon={<CalendarClock size={22} />}
                    value={counts.EXPIRING}
                    label={`Expiring within ${EXPIRING_SOON_DAYS} days`}
                    tone="bg-amber-50 text-amber-600"
                    active={statusFilter === "EXPIRING"}
                    onClick={() =>
                        setStatusFilter((s) => (s === "EXPIRING" ? "ALL" : "EXPIRING"))
                    }
                />
                <MetricCard
                    icon={<Clock size={22} />}
                    value={counts.USED}
                    label="Dispatched to patients"
                    tone="bg-sky-50 text-sky-600"
                    active={statusFilter === "USED"}
                    onClick={() => setStatusFilter((s) => (s === "USED" ? "ALL" : "USED"))}
                />
                <MetricCard
                    icon={<AlertTriangle size={22} />}
                    value={counts.EXPIRED}
                    label="Expired, pending disposal"
                    tone="bg-rose-50 text-rose-600"
                    active={statusFilter === "EXPIRED"}
                    onClick={() =>
                        setStatusFilter((s) => (s === "EXPIRED" ? "ALL" : "EXPIRED"))
                    }
                />
            </div>

            {/* Search and filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search bag ID, donor, patient, or hospital"
                        className={`${fieldClass} pl-10`}
                    />
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className={`${fieldClass} sm:w-40`}
                >
                    <option value="ALL">All blood types</option>
                    {BLOOD_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {formatType(t)}
                        </option>
                    ))}
                </select>

                <div className="relative sm:w-48">
                    <ArrowDownUp
                        size={15}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className={`${fieldClass} pl-9`}
                    >
                        <option value="EXPIRY">Expiring first</option>
                        <option value="NEWEST">Newest collection</option>
                        <option value="DONOR">Donor name</option>
                    </select>
                </div>
            </div>

            {(statusFilter !== "ALL" || typeFilter !== "ALL" || query) && (
                <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
                    <span>
                        Showing {visible.length} of {inventory.length} bags
                    </span>
                    <button
                        onClick={() => {
                            setStatusFilter("ALL");
                            setTypeFilter("ALL");
                            setQuery("");
                        }}
                        className="font-medium text-slate-900 underline underline-offset-2 hover:text-rose-600"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div
                    className={`grid ${cols} gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3 text-xs font-semibold text-slate-500`}
                >
                    <span>Bag ID</span>
                    <span>Donor</span>
                    <span>Type</span>
                    <span>Status</span>
                    <span>Shelf life</span>
                    <span>Location or patient</span>
                    <span className="text-right">Action</span>
                </div>

                {visible.length === 0 ? (
                    <EmptyState
                        onReset={() => {
                            setStatusFilter("ALL");
                            setTypeFilter("ALL");
                            setQuery("");
                        }}
                    />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visible.map((bag) => {
                            const status = statusOf(bag, today);
                            return (
                                <div
                                    key={bag.id}
                                    className={`grid ${cols} items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50/70 ${status === "EXPIRED" ? "bg-rose-50/30" : ""
                                        }`}
                                >
                                    <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-slate-900">
                                        <Droplet
                                            size={14}
                                            className={
                                                status === "EXPIRED"
                                                    ? "shrink-0 text-slate-300"
                                                    : "shrink-0 text-rose-500"
                                            }
                                        />
                                        {bag.id}
                                    </span>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-800">
                                            {bag.donorName}
                                        </p>
                                        <p className="truncate text-xs text-slate-400">
                                            Collected {prettyDate(bag.collectedDate)}
                                        </p>
                                    </div>

                                    <TypeChip type={bag.bloodType} />

                                    <div>
                                        <StatusChip status={status} />
                                    </div>

                                    <div>
                                        {bag.dispatch ? (
                                            <span className="text-xs text-slate-400">
                                                Released {prettyDate(bag.dispatch.dispatchedOn)}
                                            </span>
                                        ) : (
                                            <ShelfLife bag={bag} today={today} />
                                        )}
                                    </div>

                                    <div className="min-w-0 text-sm">
                                        {bag.dispatch ? (
                                            <>
                                                <p className="truncate font-medium text-slate-800">
                                                    {bag.dispatch.patient}{" "}
                                                    <span className="font-normal text-slate-400">
                                                        ({formatType(bag.dispatch.patientBloodType)})
                                                    </span>
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {bag.dispatch.hospital} &middot;{" "}
                                                    {bag.dispatch.department}
                                                </p>
                                            </>
                                        ) : (
                                            <span className="truncate text-slate-600">
                                                {bag.location}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <RowAction
                                            status={status}
                                            onDispatch={() => openDispatch(bag.id)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cards (small screens) */}
            <div className="space-y-3 lg:hidden">
                {visible.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white">
                        <EmptyState
                            onReset={() => {
                                setStatusFilter("ALL");
                                setTypeFilter("ALL");
                                setQuery("");
                            }}
                        />
                    </div>
                ) : (
                    visible.map((bag) => {
                        const status = statusOf(bag, today);
                        return (
                            <div
                                key={bag.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-sm font-semibold tabular-nums text-slate-900">
                                            <Droplet size={14} className="shrink-0 text-rose-500" />
                                            {bag.id}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm text-slate-600">
                                            {bag.donorName}
                                        </p>
                                    </div>
                                    <TypeChip type={bag.bloodType} />
                                </div>

                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <StatusChip status={status} />
                                    {!bag.dispatch && <ShelfLife bag={bag} today={today} />}
                                </div>

                                <div className="mb-3 border-t border-slate-100 pt-3 text-sm">
                                    {bag.dispatch ? (
                                        <>
                                            <p className="font-medium text-slate-800">
                                                {bag.dispatch.patient} (
                                                {formatType(bag.dispatch.patientBloodType)})
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {bag.dispatch.hospital} &middot; {bag.dispatch.department}{" "}
                                                &middot; {prettyDate(bag.dispatch.dispatchedOn)}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-slate-600">{bag.location}</p>
                                    )}
                                </div>

                                <RowAction
                                    status={status}
                                    full
                                    onDispatch={() => openDispatch(bag.id)}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Inbound Modal */}
            <Modal
                open={inboundOpen}
                onClose={() => setInboundOpen(false)}
                title="Log a collection"
                icon={
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <Droplet size={17} />
                    </div>
                }
            >
                <form onSubmit={handleAddInbound} className="space-y-4 relative">
                    {/* Donor Name or ID with Autocomplete Dropdown */}
                    <div className="relative">
                        <label className={labelClass}>Donor Name or ID</label>
                        <input
                            type="text"
                            required
                            value={newBag.donorName}
                            onChange={(e) => {
                                const val = e.target.value;
                                setNewBag({ ...newBag, donorName: val });

                                // I-unlock ulit kung nag-type manually ang officer
                                setIsBloodTypeLocked(false);

                                if (val.trim().length > 0) {
                                    const filtered = allDonors.filter(d =>
                                        d.name?.toLowerCase().includes(val.toLowerCase()) ||
                                        d.donorCode?.toLowerCase().includes(val.toLowerCase())
                                    );
                                    setDonorSuggestions(filtered);
                                } else {
                                    setDonorSuggestions([]);
                                }
                            }}
                            placeholder="I-type ang pangalan o DON-2026-001"
                            className={fieldClass}
                            autoComplete="off"
                        />

                        {/* Dropdown Suggestions List */}
                        {donorSuggestions.length > 0 && (
                            <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                {donorSuggestions.map((donor, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            const codeDisplay = donor.donorCode ? donor.donorCode : "Pending ID";

                                            setNewBag({
                                                ...newBag,
                                                donorName: `${donor.name} (${codeDisplay})`,
                                                bloodType: donor.bloodType || newBag.bloodType,
                                            });

                                            if (donor.bloodType) {
                                                setIsBloodTypeLocked(true);
                                            }

                                            setDonorSuggestions([]);
                                        }}
                                        className="cursor-pointer px-4 py-2.5 text-sm hover:bg-rose-50 flex items-center justify-between border-b border-slate-50 last:border-none"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-800">{donor.name}</p>
                                            <p className="text-xs text-slate-400">{donor.donorCode || "Pending ID"}</p>
                                        </div>
                                        {donor.bloodType && (
                                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                                                {formatType(donor.bloodType)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Blood Type Grid na may Lock effect */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelClass}>Blood type</label>
                            {isBloodTypeLocked && (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    <ShieldCheck size={14} /> Verified Auto-Lock
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {BLOOD_TYPES.map((t) => {
                                const isSelected = newBag.bloodType === t;
                                const isDimmed = newBag.bloodType && !isSelected;

                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        disabled={isBloodTypeLocked}
                                        onClick={() => setNewBag({ ...newBag, bloodType: t })}
                                        className={`rounded-xl border py-2 text-sm font-semibold transition-all duration-200 ${isSelected
                                            ? "border-rose-600 bg-rose-600 text-white shadow-md scale-105 ring-2 ring-rose-400"
                                            : isDimmed
                                                ? `border-slate-200 bg-slate-50 text-slate-300 opacity-40 ${isBloodTypeLocked ? 'cursor-not-allowed' : 'hover:opacity-70 hover:bg-slate-100'}`
                                                : `border-slate-200 bg-white text-slate-700 ${isBloodTypeLocked ? 'cursor-not-allowed opacity-40 bg-slate-50' : 'hover:border-slate-400'}`
                                            }`}
                                    >
                                        {formatType(t)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Collection date</label>
                        <input
                            type="date"
                            required
                            max={today}
                            value={newBag.collectedDate}
                            onChange={(e) =>
                                setNewBag({ ...newBag, collectedDate: e.target.value })
                            }
                            className={fieldClass}
                        />
                        {newBag.collectedDate && (
                            <ExpiryPreview collectedDate={newBag.collectedDate} today={today} />
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Storage location</label>
                        <select
                            value={newBag.location}
                            onChange={(e) =>
                                setNewBag({ ...newBag, location: e.target.value })
                            }
                            className={fieldClass}
                        >
                            {STORAGE_LOCATIONS.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                        >
                            Add to fridge
                        </button>
                        <button
                            type="button"
                            onClick={() => setInboundOpen(false)}
                            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Dispatch Modal */}
            <Modal
                open={Boolean(activeBag)}
                onClose={() => setDispatchId(null)}
                title="Release to a patient"
                width="max-w-[480px]"
                icon={
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <Send size={16} />
                    </div>
                }
            >
                {activeBag && (
                    <form onSubmit={handleConfirmDispatch} className="space-y-4">
                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold tabular-nums text-slate-900">
                                    {activeBag.id}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {activeBag.donorName} &middot; expires{" "}
                                    {prettyDate(expiryOf(activeBag))}
                                </p>
                            </div>
                            <TypeChip type={activeBag.bloodType} />
                        </div>

                        {/* Patient Name with Autocomplete */}
                        <div className="relative">
                            <label className={labelClass}>Patient name</label>
                            <input
                                type="text"
                                required
                                value={dispatchForm.patient}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDispatchForm({ ...dispatchForm, patient: val });
                                    setIsPatientBloodTypeLocked(false);

                                    if (val.trim().length > 0) {
                                        const filtered = allDonors.filter(d =>
                                            d.name?.toLowerCase().includes(val.toLowerCase()) ||
                                            d.donorCode?.toLowerCase().includes(val.toLowerCase())
                                        );
                                        setPatientSuggestions(filtered);
                                    } else {
                                        setPatientSuggestions([]);
                                    }
                                }}
                                placeholder="I-type ang pangalan o DON-2026-001"
                                className={fieldClass}
                                autoComplete="off"
                            />

                            {/* Dropdown Suggestions List para sa Pasyente */}
                            {patientSuggestions.length > 0 && (
                                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                    {patientSuggestions.map((donor, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                const codeDisplay = donor.donorCode ? donor.donorCode : "Pending ID";

                                                setDispatchForm({
                                                    ...dispatchForm,
                                                    patient: `${donor.name} (${codeDisplay})`,
                                                    patientBloodType: donor.bloodType || dispatchForm.patientBloodType,
                                                });

                                                if (donor.bloodType) {
                                                    setIsPatientBloodTypeLocked(true);
                                                }

                                                setPatientSuggestions([]);
                                            }}
                                            className="cursor-pointer px-4 py-2.5 text-sm hover:bg-sky-50 flex items-center justify-between border-b border-slate-50 last:border-none"
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-800">{donor.name}</p>
                                                <p className="text-xs text-slate-400">{donor.donorCode || "Pending ID"}</p>
                                            </div>
                                            {donor.bloodType && (
                                                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
                                                    {formatType(donor.bloodType)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Patient Blood Type na may Lock Feature */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className={labelClass}>Patient blood type</label>
                                {isPatientBloodTypeLocked && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        <ShieldCheck size={14} /> Verified Auto-Lock
                                    </span>
                                )}
                            </div>
                            <select
                                required
                                disabled={isPatientBloodTypeLocked}
                                value={dispatchForm.patientBloodType}
                                onChange={(e) =>
                                    setDispatchForm({
                                        ...dispatchForm,
                                        patientBloodType: e.target.value as BloodType,
                                    })
                                }
                                className={`${fieldClass} ${isPatientBloodTypeLocked ? 'cursor-not-allowed opacity-60 bg-slate-50' : ''}`}
                            >
                                <option value="">Select the patient&apos;s type</option>
                                {BLOOD_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {formatType(t)}
                                    </option>
                                ))}
                            </select>

                            {/* Medical Check System (Ligtas ba o Hindi?) */}
                            {compatible === true && (
                                <p className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                                    <ShieldCheck size={14} className="shrink-0" />
                                    {formatType(activeBag.bloodType)} is safe for a{" "}
                                    {formatType(dispatchForm.patientBloodType as BloodType)}{" "}
                                    recipient.
                                </p>
                            )}
                            {compatible === false && (
                                <p className="mt-2 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                                    <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                                    <span>
                                        Incompatible. A{" "}
                                        {formatType(dispatchForm.patientBloodType as BloodType)}{" "}
                                        patient can only receive{" "}
                                        {dispatchForm.patientBloodType
                                            ? CAN_RECEIVE[dispatchForm.patientBloodType].map(formatType).join(", ")
                                            : ""}
                                        . Pick a different bag.
                                    </span>
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Hospital</label>
                                <input
                                    type="text"
                                    required
                                    value={dispatchForm.hospital}
                                    onChange={(e) =>
                                        setDispatchForm({
                                            ...dispatchForm,
                                            hospital: e.target.value,
                                        })
                                    }
                                    placeholder="BGHMC"
                                    className={fieldClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Department</label>
                                <input
                                    type="text"
                                    required
                                    value={dispatchForm.department}
                                    onChange={(e) =>
                                        setDispatchForm({
                                            ...dispatchForm,
                                            department: e.target.value,
                                        })
                                    }
                                    placeholder="Emergency Room"
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={!compatible}
                                className="flex-1 rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                            >
                                Release bag
                            </button>
                            <button
                                type="button"
                                onClick={() => setDispatchId(null)}
                                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
                >
                    {toast}
                </div>
            )}
        </div>
    );
}