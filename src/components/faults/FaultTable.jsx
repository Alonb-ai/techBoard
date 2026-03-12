import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";

export default function FaultTable({ faults, onEdit, onDelete, onClose, isAdmin }) {
  return (
    <div className="rounded-lg border overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-right font-semibold">מטוס</TableHead>
            <TableHead className="text-right font-semibold">מערכת</TableHead>
            <TableHead className="text-right font-semibold">תיאור</TableHead>
            <TableHead className="text-right font-semibold">דחיפות</TableHead>
            <TableHead className="text-right font-semibold">סטטוס</TableHead>
            <TableHead className="text-right font-semibold">טכנאי</TableHead>
            <TableHead className="text-right font-semibold">תאריך פתיחה</TableHead>
            <TableHead className="text-right font-semibold">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faults.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-400 py-10">אין תקלות להצגה</TableCell>
            </TableRow>
          )}
          {faults.map(fault => (
            <TableRow key={fault.id} className="hover:bg-gray-50 transition-colors">
              <TableCell className="font-bold text-blue-700">{fault.aircraft_number}</TableCell>
              <TableCell>{fault.system}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={fault.description}>{fault.description}</TableCell>
              <TableCell><PriorityBadge priority={fault.priority} /></TableCell>
              <TableCell><StatusBadge status={fault.status} /></TableCell>
              <TableCell>{fault.technician_name || "—"}</TableCell>
              <TableCell>{fault.opened_date ? format(new Date(fault.opened_date), "dd/MM/yyyy") : "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(fault)} className="h-7 w-7">
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </Button>
                  {isAdmin && fault.status !== "סגור" && (
                    <Button size="icon" variant="ghost" onClick={() => onClose(fault)} className="h-7 w-7" title="סגור תקלה">
                      <X className="w-3.5 h-3.5 text-green-600" />
                    </Button>
                  )}
                  {isAdmin && (
                    <Button size="icon" variant="ghost" onClick={() => onDelete(fault.id)} className="h-7 w-7">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}