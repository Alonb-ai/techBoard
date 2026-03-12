import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";

export default function InstalledComponents() {
  const [components, setComponents] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComponents();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      setFilteredComponents(components.filter(c => c.aircraft_tail === selectedTail));
    } else {
      setFilteredComponents([]);
    }
  }, [selectedTail, components]);

  const loadComponents = async () => {
    const data = await base44.entities.InstalledComponent.list();
    setComponents(data);
  };

  const handleAdd = () => {
    if (!selectedTail) return;
    const newComp = {
      aircraft_tail: selectedTail,
      criterion: "",
      component: "",
      name: "",
      pn: "",
      sn: "",
      date: "",
      name_field: "",
      hsbs: "",
      daz_amplifier: "",
      major_tx: "",
      version_amplifier: "",
      escys_block: ""
    };
    setFilteredComponents([...filteredComponents, newComp]);
  };

  const handleSave = async (index) => {
    setLoading(true);
    const comp = filteredComponents[index];
    if (comp.id) {
      await base44.entities.InstalledComponent.update(comp.id, comp);
    } else {
      const created = await base44.entities.InstalledComponent.create(comp);
      filteredComponents[index] = created;
      setFilteredComponents([...filteredComponents]);
    }
    await loadComponents();
    setLoading(false);
  };

  const handleDelete = async (index) => {
    const comp = filteredComponents[index];
    if (comp.id) {
      await base44.entities.InstalledComponent.delete(comp.id);
      await loadComponents();
    } else {
      setFilteredComponents(filteredComponents.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...filteredComponents];
    updated[index][field] = value;
    setFilteredComponents(updated);
  };

  const tails = [...new Set(components.map(c => c.aircraft_tail))];

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
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Installed Components</h1>
                <p className="text-sm text-gray-500">רכיבים מותקנים</p>
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
              <Button onClick={handleAdd} className="bg-blue-700 hover:bg-blue-800 gap-2">
                <Plus className="w-4 h-4" />
                הוסף רכיב
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
                <TableRow>
                  <TableHead className="text-right">Criterion</TableHead>
                  <TableHead className="text-right">Component</TableHead>
                  <TableHead className="text-right">Name</TableHead>
                  <TableHead className="text-right">P/N</TableHead>
                  <TableHead className="text-right">S/N</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">HSBS</TableHead>
                  <TableHead className="text-right">Daz Amplifier</TableHead>
                  <TableHead className="text-right">Major Tx</TableHead>
                  <TableHead className="text-right">Version</TableHead>
                  <TableHead className="text-right">ESCys Block</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComponents.map((comp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input
                        value={comp.criterion || ""}
                        onChange={(e) => handleChange(idx, 'criterion', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.component || ""}
                        onChange={(e) => handleChange(idx, 'component', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.name || ""}
                        onChange={(e) => handleChange(idx, 'name', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.pn || ""}
                        onChange={(e) => handleChange(idx, 'pn', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.sn || ""}
                        onChange={(e) => handleChange(idx, 'sn', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={comp.date || ""}
                        onChange={(e) => handleChange(idx, 'date', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.hsbs || ""}
                        onChange={(e) => handleChange(idx, 'hsbs', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.daz_amplifier || ""}
                        onChange={(e) => handleChange(idx, 'daz_amplifier', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.major_tx || ""}
                        onChange={(e) => handleChange(idx, 'major_tx', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.version_amplifier || ""}
                        onChange={(e) => handleChange(idx, 'version_amplifier', e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={comp.escys_block || ""}
                        onChange={(e) => handleChange(idx, 'escys_block', e.target.value)}
                        className="w-24"
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
            {filteredComponents.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                לא נמצאו רכיבים. לחץ על "הוסף רכיב" כדי להתחיל.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}