import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [components, setComponents] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [assemblingCount, setAssemblingCount] = useState(1);

  useEffect(() => {
    loadComponents();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      buildFormData();
    }
  }, [selectedTail, components]);

  const loadComponents = async () => {
    const data = await base44.entities.InstalledComponent.list();
    setComponents(data);
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
    for (const comp of COMPONENTS) {
      const record = formData[comp];
      if (!record) continue;
      if (record.id) {
        await base44.entities.InstalledComponent.update(record.id, record);
      } else {
        const created = await base44.entities.InstalledComponent.create(record);
        formData[comp] = created;
      }
    }
    await loadComponents();
    setLoading(false);
  };

  const tails = [...new Set(components.map(c => c.aircraft_tail))];
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
                  <th className="border p-2 text-right font-bold w-32">Component</th>
                  <th className="border p-2 text-right font-bold w-16">Criterion</th>
                  {Array.from({ length: assemblingCount }, (_, i) => (
                    <th key={i} className="border p-2 text-center font-bold w-36">
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
                            <Input
                              type={isDate ? "date" : "text"}
                              value={formData[comp]?.[fieldName] || ""}
                              onChange={(e) => handleChange(comp, fieldName, e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
