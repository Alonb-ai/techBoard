import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import SignaturePad from "@/components/SignaturePad";

export default function MaintenanceProcedures() {
  const [procedures, setProcedures] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadProcedures();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      const tailProcedures = procedures
        .filter(p => p.aircraft_tail === selectedTail)
        .sort((a, b) => (a.entry_number || 0) - (b.entry_number || 0));

      if (tailProcedures.length > 0) {
        setEntries(tailProcedures);
      } else {
        // Start with 3 empty entries
        const initial = [];
        for (let i = 1; i <= 3; i++) {
          initial.push(createEmptyEntry(selectedTail, i));
        }
        setEntries(initial);
      }
    } else {
      setEntries([]);
    }
  }, [selectedTail, procedures]);

  const createEmptyEntry = (tail, num) => ({
    aircraft_tail: tail,
    entry_number: num,
    malfunction_date: "",
    malfunction_name: "",
    malfunction_description: "",
    solution_description: "",
    solution_date: "",
    solution_name: "",
    closing_date: "",
    closing_name: "",
    closing_signature: ""
  });

  const handleAddEntry = () => {
    const nextNumber = entries.length > 0
      ? Math.max(...entries.map(e => e.entry_number || 0)) + 1
      : 1;
    setEntries([...entries, createEmptyEntry(selectedTail, nextNumber)]);
  };

  const loadProcedures = async () => {
    const data = await base44.entities.MaintenanceProcedure.list();
    setProcedures(data);
  };

  const handleSave = async (index) => {
    setLoading(true);
    const entry = entries[index];
    if (entry.id) {
      await base44.entities.MaintenanceProcedure.update(entry.id, entry);
    } else {
      const created = await base44.entities.MaintenanceProcedure.create(entry);
      entries[index] = created;
      setEntries([...entries]);
    }
    await loadProcedures();
    setLoading(false);
  };

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleDelete = async (index) => {
    const entry = entries[index];
    setLoading(true);
    if (entry.id) {
      await base44.entities.MaintenanceProcedure.delete(entry.id);
      await loadProcedures();
    } else {
      const updated = entries.filter((_, i) => i !== index);
      setEntries(updated);
    }
    setDeleteConfirm(null);
    setLoading(false);
  };

  const tails = [...new Set(procedures.map(p => p.aircraft_tail))];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/UAVTailNumber">
                <Button variant="outline" size="icon" className="ml-2">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🔧</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Failures and Maintenance Procedures</h1>
                <p className="text-sm text-gray-500">תקלות ונהלי תחזוקה</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Select value={selectedTail} onValueChange={setSelectedTail}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="בחר מספר זנב" />
              </SelectTrigger>
              <SelectContent>
                {tails.map(tail => (
                  <SelectItem key={tail} value={tail}>{tail}</SelectItem>
                ))}
                <SelectItem value="new">+ מספר זנב חדש</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTail === "new" && (
            <div className="mt-4">
              <Input
                placeholder="הכנס מספר זנב חדש"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setSelectedTail(e.target.value.trim());
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Entries */}
        {selectedTail && selectedTail !== "new" && (
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div key={entry.id || `new-${idx}`} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Malfunction #{entry.entry_number}</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(idx)} disabled={loading} className="bg-green-600 hover:bg-green-700 gap-2">
                      <Save className="w-4 h-4" />
                      שמור
                    </Button>
                    <Button variant="outline" onClick={() => setDeleteConfirm(idx)} disabled={loading} className="text-red-600 hover:bg-red-50 gap-2">
                      <Trash2 className="w-4 h-4" />
                      מחק
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Malfunction */}
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h4 className="font-bold mb-3 text-red-900">Malfunction</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1">Date</label>
                        <div className="relative">
                          <Input
                            type="text"
                            readOnly
                            value={entry.malfunction_date ? entry.malfunction_date.split('-').reverse().join('/') : ""}
                            placeholder="בחר תאריך"
                            className="cursor-pointer"
                          />
                          <input
                            type="date"
                            value={entry.malfunction_date || ""}
                            onChange={(e) => handleChange(idx, 'malfunction_date', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Name</label>
                        <Input
                          value={entry.malfunction_name || ""}
                          onChange={(e) => handleChange(idx, 'malfunction_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Description</label>
                        <Textarea
                          value={entry.malfunction_description || ""}
                          onChange={(e) => handleChange(idx, 'malfunction_description', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Solution */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-bold mb-3 text-green-900">Solution</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1">Date</label>
                        <div className="relative">
                          <Input
                            type="text"
                            readOnly
                            value={entry.solution_date ? entry.solution_date.split('-').reverse().join('/') : ""}
                            placeholder="בחר תאריך"
                            className="cursor-pointer"
                          />
                          <input
                            type="date"
                            value={entry.solution_date || ""}
                            onChange={(e) => handleChange(idx, 'solution_date', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Name</label>
                        <Input
                          value={entry.solution_name || ""}
                          onChange={(e) => handleChange(idx, 'solution_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Description</label>
                        <Textarea
                          value={entry.solution_description || ""}
                          onChange={(e) => handleChange(idx, 'solution_description', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Closing Info */}
                <div className="border-t mt-4 pt-4 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Closing Date</label>
                    <div className="relative">
                      <Input
                        type="text"
                        readOnly
                        value={entry.closing_date ? entry.closing_date.split('-').reverse().join('/') : ""}
                        placeholder="בחר תאריך"
                        className="cursor-pointer"
                      />
                      <input
                        type="date"
                        value={entry.closing_date || ""}
                        onChange={(e) => handleChange(idx, 'closing_date', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Closing Name</label>
                    <Input
                      value={entry.closing_name || ""}
                      onChange={(e) => handleChange(idx, 'closing_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Signature</label>
                    <div
                      className="border rounded-md p-2 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                      onClick={() => setSignatureOpen(idx)}
                    >
                      {entry.closing_signature ? (
                        <img src={entry.closing_signature} alt="חתימה" className="h-8 object-contain" />
                      ) : (
                        <span className="text-xs text-gray-400">לחץ לחתימה</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Malfunction Button */}
            <div
              className="bg-white rounded-lg shadow-sm p-4 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
              onClick={handleAddEntry}
            >
              <div className="flex items-center gap-2 text-gray-500">
                <Plus className="w-5 h-5" />
                <span className="font-medium">הוסף תקלה חדשה</span>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent dir="rtl" className="max-w-sm">
            <DialogHeader>
              <DialogTitle>אישור מחיקה</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              האם אתה בטוח שאתה רוצה למחוק את תקלה #{deleteConfirm !== null ? entries[deleteConfirm]?.entry_number : ""}?
            </p>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                ביטול
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 ml-1" />
                מחק
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <SignaturePad
          open={signatureOpen !== null}
          onClose={() => setSignatureOpen(null)}
          onSave={(dataUrl) => {
            if (signatureOpen !== null) {
              handleChange(signatureOpen, 'closing_signature', dataUrl);
            }
          }}
          currentSignature={signatureOpen !== null ? entries[signatureOpen]?.closing_signature : null}
        />
      </div>
    </div>
  );
}