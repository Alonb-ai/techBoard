import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, Wrench, CheckCircle, Package } from "lucide-react";

const stats = [
  { key: "פתוח", label: "פתוחות", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  { key: "בטיפול", label: "בטיפול", icon: Wrench, color: "text-blue-500", bg: "bg-blue-50" },
  { key: "ממתין לחלפים", label: "ממתין לחלפים", icon: Package, color: "text-yellow-500", bg: "bg-yellow-50" },
  { key: "דחוי", label: "דחויות", icon: Clock, color: "text-gray-500", bg: "bg-gray-50" },
  { key: "סגור", label: "סגורות", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
];

export default function StatsCards({ faults }) {
  const counts = stats.map(s => ({
    ...s,
    count: faults.filter(f => f.status === s.key).length
  }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {counts.map(({ key, label, icon: Icon, color, bg, count }) => (
        <Card key={key} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{count}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}