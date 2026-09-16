interface TopBarangaysListProps {
  barangayCounts: Record<string, number>;
}

export default function TopBarangaysList({ barangayCounts }: TopBarangaysListProps) {
  const topBarangays = Object.entries(barangayCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxBarangay = topBarangays[0]?.[1] || 1;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h3 className="font-medium text-neutral-800 mb-5">Top Barangays</h3>
      <div className="space-y-4">
        {topBarangays.length === 0 ? (
          <p className="text-neutral-400 text-sm">No data yet.</p>
        ) : (
          topBarangays.map(([barangay, count]) => (
            <div key={barangay}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-700">{barangay}</span>
                <span className="font-medium text-neutral-800">{count}</span>
              </div>
              <div className="bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{ width: `${(count / maxBarangay) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}