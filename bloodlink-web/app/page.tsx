"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Droplet,
  ArrowRight,
  ShieldCheck,
  Activity,
  Database,
  Snowflake,
  Truck,
  HeartPulse,
  ClipboardCheck,
  Lock,
  Menu,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const BAG_SHELF_LIFE_DAYS = 35;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Deterministic "barcode" so server and client render identical bars. */
function barcodeWidths(seed: string) {
  const out: number[] = [];
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9973;
  for (let i = 0; i < 44; i++) {
    h = (h * 1103515245 + 12345) % 2147483648;
    out.push(1 + (h % 3));
  }
  return out;
}

function urgencyColor(daysLeft: number) {
  if (daysLeft <= 7) return "#CE1126";
  if (daysLeft <= 14) return "#E8A33D";
  return "#7FD1E3";
}

/* ------------------------------------------------------------------ */
/*  Live shelf-life countdown                                          */
/* ------------------------------------------------------------------ */

function useShelfLife() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!now) return null;

    const collected = new Date(now.getTime() - 9 * 86400000);
    const expires = new Date(collected.getTime() + BAG_SHELF_LIFE_DAYS * 86400000);
    const msLeft = expires.getTime() - now.getTime();

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-PH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    return {
      days: Math.floor(msLeft / 86400000),
      hours: Math.floor((msLeft % 86400000) / 3600000),
      minutes: Math.floor((msLeft % 3600000) / 60000),
      seconds: Math.floor((msLeft % 60000) / 1000),
      usedPct: (1 - msLeft / (BAG_SHELF_LIFE_DAYS * 86400000)) * 100,
      collectedLabel: fmt(collected),
      expiresLabel: fmt(expires),
    };
  }, [now]);
}

/* ------------------------------------------------------------------ */
/*  Hero object: a blood bag label                                     */
/* ------------------------------------------------------------------ */

function BagLabel() {
  const life = useShelfLife();
  const bars = barcodeWidths("BB-2026-0814-BGHMC");

  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:mx-0">
      <div className="flex justify-center">
        <div className="h-10 w-10 rounded-full border-[3px] border-[#1B4353]" />
      </div>

      <div className="-mt-5 rounded-[22px] border border-[#1B4353] bg-[#F3EEE5] text-[#08191F] shadow-[0_40px_90px_-38px_rgba(206,17,38,0.6)]">
        {/* plasma window */}
        <div className="relative h-[136px] overflow-hidden rounded-t-[21px] bg-[#E6DFD2]">
          <div
            className="bl-fill absolute inset-x-0 bottom-0 bg-[#9E0B1E]"
            style={{ ["--fill" as string]: "76%" }}
          >
            <div className="bl-sheen absolute inset-0 opacity-40" />
          </div>

          <div className="absolute inset-0 flex items-end justify-between p-4">
            <span className="font-mono text-[11px] text-[#F3EEE5]/85">
              Whole blood · 450 mL · CPDA-1
            </span>
            <span className="rounded-md bg-[#F3EEE5] px-2 py-0.5 font-mono text-[11px]">
              2–6&nbsp;°C
            </span>
          </div>

          <div className="absolute right-4 top-3 text-right leading-none">
            <div className="text-[52px] font-bold tracking-[-0.04em]">
              O<span className="align-top text-[30px]">−</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px]">
            <div>
              <div className="text-[#6C7C82]">Bag</div>
              <div className="text-[13px]">BB-2026-0814</div>
            </div>
            <div>
              <div className="text-[#6C7C82]">Facility</div>
              <div className="text-[13px]">BGHMC · Baguio</div>
            </div>
            <div>
              <div className="text-[#6C7C82]">Collected</div>
              <div className="text-[13px]">{life ? life.collectedLabel : "—"}</div>
            </div>
            <div>
              <div className="text-[#6C7C82]">Expires</div>
              <div className="text-[13px]">{life ? life.expiresLabel : "—"}</div>
            </div>
          </div>

          <div className="rounded-xl bg-[#08191F] p-4 text-[#F3EEE5]">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-[#8FA9B3]">Usable for</span>
              <span className="font-mono text-[11px] text-[#8FA9B3]">
                of {BAG_SHELF_LIFE_DAYS} days
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-[34px] font-medium leading-none">
                {life ? life.days : "--"}
              </span>
              <span className="mr-2 text-[13px] text-[#8FA9B3]">d</span>
              <span className="text-[22px] leading-none">
                {life
                  ? `${pad(life.hours)}:${pad(life.minutes)}:${pad(life.seconds)}`
                  : "--:--:--"}
              </span>
            </div>
            <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-[#14323E]">
              <div
                className="h-full rounded-full bg-[#CE1126] transition-[width] duration-700"
                style={{ width: `${life ? life.usedPct : 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-end gap-[2px] pt-1" aria-hidden="true">
            {bars.map((w, i) => (
              <span
                key={i}
                className="block h-9 bg-[#08191F]"
                style={{ width: `${w}px`, opacity: i % 5 === 0 ? 0.35 : 1 }}
              />
            ))}
          </div>
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#6C7C82]">
            8 4 0 2 1 6 · 2 0 2 6 · O N E G
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shelf-life rail — the whole fridge on one 35-day axis              */
/* ------------------------------------------------------------------ */

const RAIL_BAGS = [
  { id: "0771", type: "AB−", age: 32 },
  { id: "0778", type: "B−", age: 29 },
  { id: "0793", type: "B−", age: 26 },
  { id: "0801", type: "A+", age: 21 },
  { id: "0809", type: "A+", age: 16 },
  { id: "0814", type: "O−", age: 11 },
  { id: "0820", type: "O+", age: 6 },
  { id: "0826", type: "A−", age: 2 },
];

function ShelfLifeRail() {
  return (
    <div className="rounded-2xl border border-[#14323E] bg-[#0A222C] p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-[20px] font-semibold tracking-[-0.02em]">
          Every bag on one 35-day line
        </h3>
        <p className="text-[14px] text-[#8FA9B3]">
          Oldest on the right. Release from the right.
        </p>
      </div>

      <div className="relative mt-10 h-[136px]">
        {/* urgency zones */}
        <div className="absolute inset-x-0 top-[56px] flex h-[10px] overflow-hidden rounded-full">
          <div className="h-full flex-[21] bg-[#123039]" />
          <div className="h-full flex-[7] bg-[#3A3220]" />
          <div className="h-full flex-[7] bg-[#3A1820]" />
        </div>

        {/* bag pins, staggered so labels don't collide */}
        {RAIL_BAGS.map((b, i) => {
          const left = (b.age / BAG_SHELF_LIFE_DAYS) * 100;
          const daysLeft = BAG_SHELF_LIFE_DAYS - b.age;
          const color = urgencyColor(daysLeft);
          const up = i % 2 === 0;

          return (
            <div
              key={b.id}
              className="absolute flex w-[54px] -translate-x-1/2 flex-col items-center"
              style={{ left: `${left}%`, top: up ? 0 : 76 }}
            >
              {up ? (
                <>
                  <span className="text-[13px] font-semibold" style={{ color }}>
                    {b.type}
                  </span>
                  <span className="font-mono text-[10px] text-[#6F8A94]">
                    {daysLeft}d
                  </span>
                  <span
                    className="mt-1 block h-[26px] w-[2px]"
                    style={{ backgroundColor: color }}
                  />
                </>
              ) : (
                <>
                  <span
                    className="block h-[26px] w-[2px]"
                    style={{ backgroundColor: color }}
                  />
                  <span className="mt-1 text-[13px] font-semibold" style={{ color }}>
                    {b.type}
                  </span>
                  <span className="font-mono text-[10px] text-[#6F8A94]">
                    {daysLeft}d
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between border-t border-[#14323E] pt-3 font-mono text-[11px] text-[#6F8A94]">
        <span>Day 0 · collected</span>
        <span className="text-[#E8A33D]">Day 21 · use next</span>
        <span className="text-[#CE1126]">Day 35 · discard</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inventory board                                                     */
/* ------------------------------------------------------------------ */

const STOCK = [
  { type: "O−", units: 6, cap: 40, note: "Reorder now" },
  { type: "O+", units: 31, cap: 40, note: "Healthy" },
  { type: "A−", units: 9, cap: 30, note: "Watch" },
  { type: "A+", units: 26, cap: 40, note: "Healthy" },
  { type: "B−", units: 4, cap: 24, note: "Reorder now" },
  { type: "B+", units: 19, cap: 30, note: "Healthy" },
  { type: "AB−", units: 3, cap: 16, note: "Watch" },
  { type: "AB+", units: 12, cap: 20, note: "Healthy" },
];

function levelColor(pct: number) {
  if (pct < 0.25) return "#CE1126";
  if (pct < 0.45) return "#E8A33D";
  return "#7FD1E3";
}

function InventoryBoard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#14323E] bg-[#0A222C]">
      <div className="flex flex-col gap-3 border-b border-[#14323E] p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-[20px] font-semibold tracking-[-0.02em]">
            What&rsquo;s in the fridge right now
          </h3>
          <p className="mt-1 text-[14px] text-[#8FA9B3]">
            Refrigerator 2, BGHMC. Counts move as bags are logged in and released.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#1B4353] px-3 py-1.5 font-mono text-[12px] text-[#7FD1E3]">
          <Snowflake size={13} /> 4.1 °C · stable
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[#14323E] sm:grid-cols-4">
        {STOCK.map((s) => {
          const pct = s.units / s.cap;
          const color = levelColor(pct);
          return (
            <div key={s.type} className="bg-[#0A222C] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[26px] font-semibold leading-none tracking-[-0.03em]">
                    {s.type}
                  </div>
                  <div className="mt-2 font-mono text-[12px] text-[#8FA9B3]">
                    {s.units} of {s.cap} bags
                  </div>
                </div>
                {/* vertical fill: reads like a bag, not a progress bar */}
                <div className="flex h-[58px] w-[16px] flex-col-reverse overflow-hidden rounded-[4px] border border-[#1B4353]">
                  <div
                    style={{
                      height: `${Math.max(pct * 100, 6)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 text-[12px]" style={{ color }}>
                {s.note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cold chain                                                          */
/* ------------------------------------------------------------------ */

const CHAIN = [
  {
    icon: Droplet,
    title: "Donation logged",
    body: "Donor, volume and collection time captured at the chair. The bag gets its ID before it leaves the room.",
  },
  {
    icon: ClipboardCheck,
    title: "Screened and typed",
    body: "Serology results attach to the bag. Nothing reaches storage until every test is cleared.",
  },
  {
    icon: Snowflake,
    title: "Stored at 2–6 °C",
    body: "Shelf life starts the moment the bag is logged. Officers see days left, not just dates.",
  },
  {
    icon: Truck,
    title: "Released",
    body: "Requesting ward, patient and releasing officer are recorded in one step. No paper slip to lose.",
  },
  {
    icon: HeartPulse,
    title: "Transfused",
    body: "The chain closes with an outcome, so any bag can be traced back to its donor.",
  },
];

function ColdChain() {
  return (
    <div className="grid grid-cols-1 gap-px bg-[#14323E] sm:grid-cols-2 lg:grid-cols-5">
      {CHAIN.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="bg-[#06151C] p-6">
            <div className="flex items-center justify-between">
              <Icon size={18} className="text-[#CE1126]" />
              <span className="font-mono text-[12px] text-[#3F5F6B]">
                {pad(i + 1)}
              </span>
            </div>
            <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.01em]">
              {step.title}
            </h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-[#8FA9B3]">
              {step.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Access and privacy                                                  */
/* ------------------------------------------------------------------ */

const ROLES = [
  {
    role: "Donor",
    scope: "Their own donation history and next eligible date. Nothing else.",
  },
  {
    role: "Encoder",
    scope: "Logs incoming donations. Cannot release a bag or open a patient record.",
  },
  {
    role: "Blood bank officer",
    scope: "Full inventory and release authority for their assigned refrigerators.",
  },
  {
    role: "Requesting ward",
    scope: "Raises a request and sees its status. Cannot browse the inventory.",
  },
  {
    role: "Administrator",
    scope: "Manages accounts and reads the audit log. Every action is attributed.",
  },
];

function AccessControl() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#1B4353] px-3 py-1.5 text-[13px] text-[#7FD1E3]">
          <Lock size={13} /> Nothing here is public
        </span>
        <h2 className="mt-5 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">
          Patient data never leaves the people who need it
        </h2>
        <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.65] text-[#8FA9B3]">
          There is no guest view and no shared login. Accounts are created by an
          administrator, tied to one facility, and every screen a person can reach
          is decided by their role.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#1B4353] px-6 py-3 text-[15px] text-[#C9D9DF] transition-colors hover:border-[#2A6076] hover:text-[#F3EEE5]"
        >
          Staff log in
        </Link>
      </div>

      <ul className="divide-y divide-[#14323E] border-y border-[#14323E]">
        {ROLES.map((r) => (
          <li key={r.role} className="flex flex-col gap-1 py-5 sm:flex-row sm:gap-8">
            <span className="w-[180px] shrink-0 text-[15px] font-semibold text-[#F3EEE5]">
              {r.role}
            </span>
            <span className="max-w-[52ch] text-[15px] leading-[1.6] text-[#8FA9B3]">
              {r.scope}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <div className="bl-root min-h-screen bg-[#06151C] text-[#F3EEE5] antialiased selection:bg-[#CE1126] selection:text-[#F3EEE5]">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

.bl-root { font-family: 'Archivo', ui-sans-serif, system-ui, sans-serif; }
.bl-root .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
.bl-root .font-mono, .bl-root .tabular-nums { font-variant-numeric: tabular-nums; }

.bl-root :focus-visible {
  outline: 2px solid #7FD1E3;
  outline-offset: 3px;
  border-radius: 6px;
}

/* One orchestrated moment: the bag fills on load. */
.bl-fill { height: var(--fill); animation: bl-rise 1400ms cubic-bezier(.16,.84,.34,1) both; }
@keyframes bl-rise { from { height: 0%; } to { height: var(--fill); } }

.bl-sheen { background: linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,0) 55%); }

@media (prefers-reduced-motion: reduce) {
  .bl-root *, .bl-root *::before, .bl-root *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
  }
}
      `}</style>

      {/* ---------------- NAV ---------------- */}
      <header className="sticky top-0 z-50 border-b border-[#123039] bg-[#06151C]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#CE1126]">
              <Droplet size={16} className="fill-[#F3EEE5] text-[#F3EEE5]" />
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.02em]">
              BloodLink
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[14px] text-[#8FA9B3] md:flex">
            <a className="transition-colors hover:text-[#F3EEE5]" href="#chain">
              How it works
            </a>
            <a className="transition-colors hover:text-[#F3EEE5]" href="#inventory">
              Inventory
            </a>
            <a className="transition-colors hover:text-[#F3EEE5]" href="#access">
              Access and privacy
            </a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-[14px] text-[#C9D9DF] transition-colors hover:text-[#F3EEE5]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#CE1126] px-5 py-2 text-[14px] font-medium text-[#F3EEE5] transition-colors hover:bg-[#B00E20]"
            >
              Create account
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="text-[#C9D9DF] md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#123039] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-[15px] text-[#C9D9DF]">
              <a onClick={() => setMenuOpen(false)} href="#chain">
                How it works
              </a>
              <a onClick={() => setMenuOpen(false)} href="#inventory">
                Inventory
              </a>
              <a onClick={() => setMenuOpen(false)} href="#access">
                Access and privacy
              </a>
              <Link href="/login">Log in</Link>
              <Link
                href="/register"
                className="rounded-full bg-[#CE1126] px-5 py-2.5 text-center font-medium text-[#F3EEE5]"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- HERO ---------------- */}
      <section className="mx-auto max-w-[1180px] px-6 pb-16 pt-14 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#1B4353] px-3 py-1.5 text-[13px] text-[#7FD1E3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CE1126]" />
              Built for hospital blood banks in the Cordillera
            </p>

            <h1 className="mt-6 max-w-[16ch] text-[44px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[58px] lg:text-[66px]">
              Every bag has 35 days. Know exactly where each one is.
            </h1>

            <p className="mt-6 max-w-[54ch] text-[17px] leading-[1.65] text-[#8FA9B3]">
              BloodLink tracks a unit of blood from the donor&rsquo;s chair to the
              patient&rsquo;s bedside &mdash; collection, screening, cold storage,
              release. Officers stop counting bags on a clipboard and start seeing
              what will expire before it is used.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#CE1126] px-7 py-3.5 text-[15px] font-medium text-[#F3EEE5] transition-colors hover:bg-[#B00E20]"
              >
                Create account
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <a
                href="#chain"
                className="inline-flex items-center justify-center rounded-full border border-[#1B4353] px-7 py-3.5 text-[15px] text-[#C9D9DF] transition-colors hover:border-[#2A6076] hover:text-[#F3EEE5]"
              >
                See how a bag is tracked
              </a>
            </div>

            <dl className="mt-12 grid max-w-[460px] grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#14323E] bg-[#14323E]">
              {[
                ["35", "day shelf life, counted per bag"],
                ["2–6", "°C storage, logged continuously"],
                ["100%", "of releases traced to a patient"],
              ].map(([n, label]) => (
                <div key={label} className="bg-[#06151C] p-4">
                  <dt className="font-mono text-[22px]">{n}</dt>
                  <dd className="mt-1 text-[12px] leading-[1.45] text-[#6F8A94]">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <BagLabel />
        </div>
      </section>

      {/* ---------------- COLD CHAIN ---------------- */}
      <section id="chain" className="border-y border-[#14323E]">
        <div className="mx-auto max-w-[1180px] px-6 py-16">
          <div className="max-w-[60ch]">
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] sm:text-[36px]">
              Five handovers, one record
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[#8FA9B3]">
              A bag changes hands at least five times. Each handover is where paper
              logs break. BloodLink keeps them on the same record.
            </p>
          </div>
        </div>
        <ColdChain />
      </section>

      {/* ---------------- INVENTORY ---------------- */}
      <section id="inventory" className="mx-auto max-w-[1180px] px-6 py-20">
        <div className="mb-10 max-w-[60ch]">
          <h2 className="text-[30px] font-semibold tracking-[-0.03em] sm:text-[36px]">
            The shortage you can see coming
          </h2>
          <p className="mt-3 text-[16px] leading-[1.65] text-[#8FA9B3]">
            Stock is grouped by type and ranked by how close it is to running out,
            so a call for donors goes out days early instead of during an emergency.
          </p>
        </div>

        <div className="space-y-6">
          <InventoryBoard />
          <ShelfLifeRail />
        </div>
      </section>

      {/* ---------------- ACCESS AND PRIVACY ---------------- */}
      <section id="access" className="border-t border-[#14323E] bg-[#0A222C]">
        <div className="mx-auto max-w-[1180px] px-6 py-20">
          <AccessControl />
        </div>
      </section>

      {/* ---------------- CAPABILITIES ---------------- */}
      <section className="border-t border-[#14323E]">
        <div className="mx-auto max-w-[1180px] px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">
              What officers get out of it
            </h2>

            <div className="divide-y divide-[#14323E] border-y border-[#14323E]">
              {[
                {
                  icon: Database,
                  title: "Expiry is calculated, not remembered",
                  body: "Log the collection date once. BloodLink sets the 35-day expiry, sorts the fridge oldest-first, and flags bags before they are wasted.",
                },
                {
                  icon: Activity,
                  title: "Release that names a patient",
                  body: "Each release records the ward, the patient and the officer who signed it out. The audit trail is a by-product of doing the work, not extra paperwork.",
                },
                {
                  icon: ShieldCheck,
                  title: "Reports the panel and the DOH will ask for",
                  body: "Donation density by barangay, wastage rate, and monthly turnover — exportable, without rebuilding a spreadsheet each quarter.",
                },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex gap-5 py-7">
                    <Icon size={20} className="mt-1 shrink-0 text-[#CE1126]" />
                    <div>
                      <h3 className="text-[18px] font-semibold tracking-[-0.01em]">
                        {f.title}
                      </h3>
                      <p className="mt-2 max-w-[62ch] text-[15px] leading-[1.65] text-[#8FA9B3]">
                        {f.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="border-t border-[#14323E] bg-[#0A222C]">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-8 px-6 py-20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-[20ch] text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[40px]">
              Set up your blood bank in an afternoon
            </h2>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.65] text-[#8FA9B3]">
              Add your refrigerators, import your current stock, then invite your
              officers. An administrator approves every account.
            </p>
          </div>
          <Link
            href="/register"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#CE1126] px-8 py-4 text-[15px] font-medium text-[#F3EEE5] transition-colors hover:bg-[#B00E20]"
          >
            Create account
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-[#14323E]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-6 py-8 text-[13px] text-[#6F8A94] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year ?? ""} BloodLink. Blood inventory and dispatch for hospital
            blood banks.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-[#F3EEE5]">
              Staff log in
            </Link>
            <Link href="/register" className="hover:text-[#F3EEE5]">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}