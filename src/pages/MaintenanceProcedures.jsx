import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function MaintenanceProcedures() {
  const [procedures, setProcedures] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProcedures();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      const tailProcedures = procedures.filter(p => p.aircraft_tail === selectedTail);
      const loadedEntries = [];
      for (let i = 1; i <= 7; i++) {
        const existing = tailProcedures.find(p => p.entry_number === i);
        loadedEntries.push(existing || {
          aircraft_tail: selectedTail,
          entry_number: i,
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
      }
      setEntries(loadedEntries);
    } else {
      setEntries([]);
    }
  }, [selectedTail, procedures]);

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
              <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">#{entry.entry_number} Date & Name</h3>
                  <Button onClick={() => handleSave(idx)} disabled={loading} className="bg-green-600 hover:bg-green-700 gap-2">
                    <Save className="w-4 h-4" />
                    שמור
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Malfunction */}
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h4 className="font-bold mb-3 text-red-900">Malfunction</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1">Date</label>
                        <Input
                          type="date"
                          value={entry.malfunction_date || ""}
                          onChange={(e) => handleChange(idx, 'malfunction_date', e.target.value)}
                        />
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
                        <Input
                          type="date"
                          value={entry.solution_date || ""}
                          onChange={(e) => handleChange(idx, 'solution_date', e.target.value)}
                        />
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
                    <Input
                      type="date"
                      value={entry.closing_date || ""}
                      onChange={(e) => handleChange(idx, 'closing_date', e.target.value)}
                    />
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
                    <Input
                      value={entry.closing_signature || ""}
                      onChange={(e) => handleChange(idx, 'closing_signature', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}