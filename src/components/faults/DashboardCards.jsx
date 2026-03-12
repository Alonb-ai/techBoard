import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

function AircraftCard({ aircraft, faults }) {
  const open = faults.filter(f => f.status !== "סגור").length;
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base text-blue-700 font-bold">{aircraft}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-sm text-gray-500">{open} תקלות פתוחות</div>
        <div className="mt-2 space-y-1">
          {faults.filter(f => f.status !== "סגור").slice(0, 3).map(f => (
            <div key={f.id} className="flex items-center gap-2 text-xs text-gray-700">
              <PriorityBadge priority={f.priority} />
              <span className="truncate">{f.system}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardCards({ faults }) {
  const aircraft = [...new Set(faults.map(f => f.aircraft_number))];

  const urgentFaults = faults.filter(f => f.priority === "דחוף" && f.status !== "סגור");

  return (
    <div className="space-y-4">
      {urgentFaults.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-red-700 mb-2">⚠️ תקלות דחופות ({urgentFaults.length})</div>
          <div className="space-y-1">
            {urgentFaults.map(f => (
              <div key={f.id} className="flex items-center gap-2 text-xs text-red-800">
                <span className="font-bold">{f.aircraft_number}</span>
                <span>|</span>
                <span>{f.system}</span>
                <span>–</span>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-sm font-semibold text-gray-600 mb-2">סטטוס לפי מטוס</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {aircraft.map(ac => (
            <AircraftCard key={ac} aircraft={ac} faults={faults.filter(f => f.aircraft_number === ac)} />
          ))}
        </div>
      </div>
    </div>
  );
}