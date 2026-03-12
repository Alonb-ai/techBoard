import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";

export default function SpecialPermits() {
  const [permits, setPermits] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [filteredPermits, setFilteredPermits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPermits();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      setFilteredPermits(permits.filter(p => p.aircraft_tail === selectedTail));
    } else {
      setFilteredPermits([]);
    }
  }, [selectedTail, permits]);

  const loadPermits = async () => {
    const data = await base44.entities.SpecialPermit.list();
    setPermits(data);
  };

  const handleAdd = () => {
    if (!selectedTail) return;
    const newPermit = {
      aircraft_tail: selectedTail,
      date: "",
      name: "",
      approved_by: "",
      serial_number: ""
    };
    setFilteredPermits([...filteredPermits, newPermit]);
  };

  const handleSave = async (index) => {
    setLoading(true);
    const permit = filteredPermits[index];
    if (permit.id) {
      await base44.entities.SpecialPermit.update(permit.id, permit);
    } else {
      const created = await base44.entities.SpecialPermit.create(permit);
      filteredPermits[index] = created;
      setFilteredPermits([...filteredPermits]);
    }
    await loadPermits();
    setLoading(false);
  };

  const handleDelete = async (index) => {
    const permit = filteredPermits[index];
    if (permit.id) {
      await base44.entities.SpecialPermit.delete(permit.id);
      await loadPermits();
    } else {
      setFilteredPermits(filteredPermits.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...filteredPermits];
    updated[index][field] = value;
    setFilteredPermits(updated);
  };

  const tails = [...new Set(permits.map(p => p.aircraft_tail))];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/UAVTailNumber">
                <Button variant="outline" size="icon" className="ml-2">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">📋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Special Permits</h1>
                <p className="text-sm text-gray-500">היתרים מיוחדים</p>
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
            {selectedTail && (
              <Button onClick={handleAdd} className="bg-pink-600 hover:bg-pink-700 gap-2">
                <Plus className="w-4 h-4" />
                הוסף היתר
              </Button>
            )}
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

        {/* Table */}
        {selectedTail && selectedTail !== "new" && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-pink-50">
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">Name/Description</TableHead>
                  <TableHead className="text-right">Approved By</TableHead>
                  <TableHead className="text-right">Serial Number</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermits.map((permit, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input
                        type="date"
                        value={permit.date || ""}
                        onChange={(e) => handleChange(idx, 'date', e.target.value)}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={permit.name || ""}
                        onChange={(e) => handleChange(idx, 'name', e.target.value)}
                        className="w-64"
                        placeholder="תיאור ההיתר"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={permit.approved_by || ""}
                        onChange={(e) => handleChange(idx, 'approved_by', e.target.value)}
                        className="w-40"
                        placeholder="מאושר על ידי"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={permit.serial_number || ""}
                        onChange={(e) => handleChange(idx, 'serial_number', e.target.value)}
                        className="w-32"
                        placeholder="מספר סידורי"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleSave(idx)} disabled={loading}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(idx)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPermits.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                לא נמצאו היתרים. לחץ על "הוסף היתר" כדי להתחיל.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}