import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const SYSTEMS = ["מנוע", "אביוניקה", "הידראוליקה", "חשמל", "מבנה", "דלק", "נחיתה", "בקרת טיסה", "תקשורת", "אחר"];
const PRIORITIES = ["דחוף", "גבוה", "בינוני", "נמוך"];
const STATUSES = ["פתוח", "בטיפול", "ממתין לחלפים", "דחוי", "סגור"];

export default function FaultForm({ open, onClose, onSubmit, initialData, isAdmin }) {
  const [form, setForm] = useState(initialData || {
    aircraft_number: "",
    system: "",
    description: "",
    priority: "בינוני",
    status: "פתוח",
    technician_name: "",
    opened_date: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{initialData ? "עריכת תקלה" : "דיווח תקלה חדשה"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>מספר מטוס *</Label>
              <Input value={form.aircraft_number} onChange={e => set("aircraft_number", e.target.value)} placeholder="BB-001" required />
            </div>
            <div className="space-y-1">
              <Label>מערכת תקולה *</Label>
              <Select value={form.system} onValueChange={v => set("system", v)} required>
                <SelectTrigger><SelectValue placeholder="בחר מערכת" /></SelectTrigger>
                <SelectContent>{SYSTEMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>תיאור התקלה *</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="תאר את התקלה..." required rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>דחיפות</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={v => set("status", v)} disabled={!isAdmin && initialData?.status === "סגור"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>טכנאי אחראי</Label>
              <Input value={form.technician_name} onChange={e => set("technician_name", e.target.value)} placeholder="שם הטכנאי" />
            </div>
            <div className="space-y-1">
              <Label>תאריך פתיחה</Label>
              <div className="relative">
                <Input
                  type="text"
                  readOnly
                  value={form.opened_date ? form.opened_date.split('-').reverse().join('/') : ""}
                  placeholder="בחר תאריך"
                  className="cursor-pointer"
                />
                <input
                  type="date"
                  value={form.opened_date || ""}
                  onChange={e => set("opened_date", e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label>הערות</Label>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="הערות נוספות..." rows={2} />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
            <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white">
              {initialData ? "שמור שינויים" : "דווח תקלה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}