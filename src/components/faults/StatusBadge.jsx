import { Badge } from "@/components/ui/badge";

const statusConfig = {
  "פתוח": "bg-red-100 text-red-800 border-red-200",
  "בטיפול": "bg-blue-100 text-blue-800 border-blue-200",
  "ממתין לחלפים": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "דחוי": "bg-gray-100 text-gray-700 border-gray-200",
  "סגור": "bg-green-100 text-green-800 border-green-200"
};

const priorityConfig = {
  "דחוף": "bg-red-600 text-white border-red-700",
  "גבוה": "bg-orange-100 text-orange-800 border-orange-200",
  "בינוני": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "נמוך": "bg-gray-100 text-gray-600 border-gray-200"
};

export function StatusBadge({ status }) {
  return (
    <Badge className={`border ${statusConfig[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <Badge className={`border ${priorityConfig[priority] || "bg-gray-100 text-gray-700"}`}>
      {priority}
    </Badge>
  );
}