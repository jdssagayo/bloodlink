const BLOOD_TYPES = ["O_POSITIVE","A_POSITIVE","B_POSITIVE","AB_POSITIVE","O_NEGATIVE","A_NEGATIVE","B_NEGATIVE","AB_NEGATIVE"];
const LABELS: Record<string, string> = {
  O_POSITIVE: "O+", A_POSITIVE: "A+", B_POSITIVE: "B+", AB_POSITIVE: "AB+",
  O_NEGATIVE: "O-", A_NEGATIVE: "A-", B_NEGATIVE: "B-", AB_NEGATIVE: "AB-",
};
const BAR_COLORS = ["#EF4444","#F87171","#FCA5A5","#FECACA","#991B1B","#7F1D1D","#5C1414","#3D0D0D"];

interface BloodTypeChartProps {
  counts: Record<string, number>;
}

export default function BloodTypeChart({ counts }: BloodTypeChartProps) {
  const maxCount = Math.max(...Object.values(counts), 4);

  return (
    <div className="col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
      <h3 className="font-medium text-neutral-800 mb-6">Donors by Blood Type</h3>
      <div className="flex items-end justify-between gap-3 h-48">
        {BLOOD_TYPES.map((bt, i) => (
          <div key={bt} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="text-xs font-medium text-neutral-600">{counts[bt] || 0}</span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${Math.max(((counts[bt] || 0) / maxCount) * 100, 3)}%`,
                backgroundColor: BAR_COLORS[i],
              }}
            />
            <span className="text-xs text-neutral-500">{LABELS[bt]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { BLOOD_TYPES };