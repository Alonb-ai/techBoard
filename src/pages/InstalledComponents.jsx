import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Home, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const COMPONENTS = [
  "Avionics Box",
  "PSB",
  "HPSB",
  "Data Amplifire",
  "Video Tx",
  "Video Amplifire",
  "ESC's Block"
];

const CRITERIA = ["pn", "sn", "name", "date"];
const CRITERIA_LABELS = { pn: "P/N", sn: "S/N", name: "Name", date: "Date" };
export default function InstalledComponents() {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [allTails, setAllTails] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [assemblingCount, setAssemblingCount] = useState(1);
  const [deleteColIndex, setDeleteColIndex] = useState(null);

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      buildFormData();
    }
  }, [selectedTail, components]);

  const loadData = async () => {
    const [comps, certs, permits, procs, configs] = await Promise.all([
      base44.entities.InstalledComponent.list(),
      base44.entities.DeliveryCertificate.list(),
      base44.entities.SpecialPermit.list(),
      base44.entities.MaintenanceProcedure.list(),
      base44.entities.Configuration.list()
    ]);
    setComponents(comps);
    const tails = new Set([
      ...comps.map(c => c.aircraft_tail),
      ...certs.map(c => c.aircraft_tail),
      ...permits.map(p => p.aircraft_tail),
      ...procs.map(p => p.aircraft_tail),
      ...configs.map(c => c.aircraft_tail)
    ]);
    setAllTails([...tails].filter(Boolean).sort());
  };

  const buildFormData = () => {
    const data = {};
    let maxAssembling = 1;
    COMPONENTS.forEach(comp => {
      const existing = components.find(c => c.aircraft_tail === selectedTail && c.component === comp);
      if (existing) {
        data[comp] = { ...existing };
        for (let i = 1; i <= 10; i++) {
          if (existing[`pn_${i}`] || existing[`sn_${i}`] || existing[`name_${i}`] || existing[`date_${i}`]) {
            maxAssembling = Math.max(maxAssembling, i);
          }
        }
      } else {
        data[comp] = { aircraft_tail: selectedTail, component: comp };
      }
    });
    setAssemblingCount(maxAssembling);
    setFormData(data);
  };

  const handleChange = (comp, field, value) => {
    setFormData(prev => ({
      ...prev,
      [comp]: { ...prev[comp], [field]: value }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const comp of COMPONENTS) {
        const record = formData[comp];
        if (!record) continue;
        const { id, created_date, created_by, updated_date, updated_by, ...data } = record;
        if (id) {
          await base44.entities.InstalledComponent.update(id, data);
        } else {
          const created = await base44.entities.InstalledComponent.create(data);
          setFormData(prev => ({ ...prev, [comp]: created }));
        }
      }
      await loadData();
    } catch (err) {
      console.error("Save error:", err);
      alert("שגיאה בשמירה: " + (err.message || err));
    }
    setLoading(false);
  };

  const handleDeleteColumn = (colIndex) => {
    const colNum = colIndex + 1;
    setFormData(prev => {
      const updated = { ...prev };
      COMPONENTS.forEach(comp => {
        const record = { ...updated[comp] };
        // Shift columns after deleted one to the left
        for (let i = colNum; i < assemblingCount; i++) {
          CRITERIA.forEach(criterion => {
            record[`${criterion}_${i}`] = record[`${criterion}_${i + 1}`] || "";
          });
        }
        // Clear last column
        CRITERIA.forEach(criterion => {
          record[`${criterion}_${assemblingCount}`] = "";
        });
        updated[comp] = record;
      });
      return updated;
    });
    setAssemblingCount(prev => Math.max(1, prev - 1));
    setDeleteColIndex(null);
  };

  const tails = [...allTails];
  if (selectedTail && !tails.includes(selectedTail)) {
    tails.push(selectedTail);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/Home">
                <Button variant="outline" size="icon" className="ml-2">
                  <Home className="w-4 h-4" />
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
            <Select value={selectedTail} onValueChange={(val) => {
              setSelectedTail(val);
              navigate(`/InstalledComponents?tail=${val}`);
            }}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="בחר מספר זנב" />
              </SelectTrigger>
              <SelectContent>
                {tails.map(tail => (
                  <SelectItem key={tail} value={tail}>{tail}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTail && (
              <>
                <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Save className="w-4 h-4" />
                  שמור
                </Button>
                <Button onClick={() => setAssemblingCount(prev => prev + 1)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  הוסף עמודה
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Components Table */}
        {selectedTail && (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border p-2 text-right font-bold w-28">Component</th>
                  <th className="border p-2 text-right font-bold w-14">Criterion</th>
                  {Array.from({ length: assemblingCount }, (_, i) => (
                    <th key={i} className="border p-2 text-center font-bold w-28">
                      Assembling {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPONENTS.map((comp) => (
                  CRITERIA.map((criterion, cIdx) => (
                    <tr key={`${comp}-${criterion}`} className={cIdx === 0 ? "border-t-2 border-gray-300" : ""}>
                      {cIdx === 0 && (
                        <td className="border p-2 font-bold bg-gray-50 align-top" rowSpan={CRITERIA.length}>
                          {comp}
                        </td>
                      )}
                      <td className="border p-2 text-xs font-medium bg-gray-50">
                        {CRITERIA_LABELS[criterion]}
                      </td>
                      {Array.from({ length: assemblingCount }, (_, aIdx) => {
                        const fieldName = `${criterion}_${aIdx + 1}`;
                        const isDate = criterion === "date";
                        return (
                          <td key={aIdx} className="border p-1">
                            {isDate ? (
                              <div className="relative">
                                <Input
                                  type="text"
                                  readOnly
                                  value={formData[comp]?.[fieldName] ? formData[comp][fieldName].split('-').reverse().join('/') : ""}
                                  placeholder="לחץ"
                                  className="h-8 text-xs cursor-pointer"
                                  onClick={() => {
                                    if (!formData[comp]?.[fieldName]) {
                                      handleChange(comp, fieldName, new Date().toISOString().split('T')[0]);
                                    }
                                  }}
                                />
                                <input
                                  type="date"
                                  value={formData[comp]?.[fieldName] || ""}
                                  onChange={(e) => handleChange(comp, fieldName, e.target.value)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            ) : (
                              <Input
                                type="text"
                                value={formData[comp]?.[fieldName] || ""}
                                onChange={(e) => handleChange(comp, fieldName, e.target.value)}
                                className="h-8 text-xs"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ))}
                {/* Delete buttons row */}
                <tr>
                  <td className="border p-2" colSpan={2}></td>
                  {Array.from({ length: assemblingCount }, (_, aIdx) => (
                    <td key={aIdx} className="border p-1 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                        onClick={() => setDeleteColIndex(aIdx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Delete column confirmation dialog */}
        <Dialog open={deleteColIndex !== null} onOpenChange={(open) => { if (!open) setDeleteColIndex(null); }}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>מחיקת עמודה</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">האם ברצונך למחוק את העמודה?</p>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteColIndex(null)}>לא</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteColumn(deleteColIndex)}>כן</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
