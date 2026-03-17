import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, ArrowRight, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";

const TRACKING_COMPONENTS = [
  { key: "avionics_box", label: "Avionics Box" },
  { key: "av_mcu", label: "AV MCU" },
  { key: "fpga", label: "FPGA" },
  { key: "pilot_version", label: "Pilot Version" },
  { key: "params_file", label: "Parameters File" },
  { key: "fmc", label: "FMC" },
  { key: "ardu_params", label: "Ardu Params" },
];

const MCU_COMPONENTS = [
  { key: "psb", label: "PSB" },
  { key: "hpsb", label: "HPSB" },
];

export default function Configuration() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [allTails, setAllTails] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [loading, setLoading] = useState(false);
  const [editRows, setEditRows] = useState({});

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  const loadData = async () => {
    const [configData, certs, comps, permits, procs] = await Promise.all([
      base44.entities.Configuration.list(),
      base44.entities.DeliveryCertificate.list(),
      base44.entities.InstalledComponent.list(),
      base44.entities.SpecialPermit.list(),
      base44.entities.MaintenanceProcedure.list()
    ]);
    setConfigs(configData);
    const tails = new Set([
      ...configData.map(c => c.aircraft_tail),
      ...certs.map(c => c.aircraft_tail),
      ...comps.map(c => c.aircraft_tail),
      ...permits.map(p => p.aircraft_tail),
      ...procs.map(p => p.aircraft_tail)
    ]);
    setAllTails([...tails].filter(Boolean).sort());
  };

  const getComponentRows = (componentKey) => {
    return configs
      .filter(c => c.aircraft_tail === selectedTail && c.component === componentKey)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  };

  const handleAdd = (componentKey) => {
    const tempId = `new_${componentKey}_${Date.now()}`;
    setEditRows({
      ...editRows,
      [tempId]: {
        aircraft_tail: selectedTail,
        component: componentKey,
        version: "",
        date: new Date().toISOString().split('T')[0],
        technician: "",
      }
    });
  };

  const handleEditChange = (tempId, field, value) => {
    setEditRows({
      ...editRows,
      [tempId]: { ...editRows[tempId], [field]: value }
    });
  };

  const handleSaveNew = async (tempId) => {
    setLoading(true);
    const data = editRows[tempId];
    await base44.entities.Configuration.create(data);
    const newEditRows = { ...editRows };
    delete newEditRows[tempId];
    setEditRows(newEditRows);
    await loadData();
    setLoading(false);
  };

  const handleCancelNew = (tempId) => {
    const newEditRows = { ...editRows };
    delete newEditRows[tempId];
    setEditRows(newEditRows);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    await base44.entities.Configuration.delete(id);
    await loadData();
    setLoading(false);
  };

  const getNewRowsForComponent = (componentKey) => {
    return Object.entries(editRows).filter(([key, val]) => val.component === componentKey);
  };

  const renderComponentSection = (comp, bgColor, headerBg) => {
    const rows = getComponentRows(comp.key);
    const newRows = getNewRowsForComponent(comp.key);

    return (
      <div key={comp.key} className="mb-4">
        <div className={`flex items-center justify-between ${headerBg} px-4 py-2 rounded-t-lg`}>
          <h3 className="font-bold text-sm">{comp.label}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAdd(comp.key)}
            className="h-7 px-2 text-xs gap-1"
          >
            <Plus className="w-3 h-3" />
            הוסף
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className={bgColor}>
              <TableHead className="text-right text-xs">Version</TableHead>
              <TableHead className="text-right text-xs">Date</TableHead>
              <TableHead className="text-right text-xs">Technician</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm">{row.version || "-"}</TableCell>
                <TableCell className="text-sm">{row.date ? row.date.split('-').reverse().join('/') : "-"}</TableCell>
                <TableCell className="text-sm">{row.technician || "-"}</TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {newRows.map(([tempId, data]) => (
              <TableRow key={tempId} className="bg-yellow-50">
                <TableCell>
                  <Input
                    value={data.version}
                    onChange={(e) => handleEditChange(tempId, 'version', e.target.value)}
                    className="h-8 text-xs"
                    placeholder="גרסה"
                  />
                </TableCell>
                <TableCell>
                  <div className="relative w-28">
                    <Input
                      type="text"
                      readOnly
                      value={data.date ? data.date.split('-').reverse().join('/') : ""}
                      placeholder="תאריך"
                      className="h-8 text-xs cursor-pointer"
                      onClick={(e) => e.target.nextElementSibling.showPicker()}
                    />
                    <input
                      type="date"
                      value={data.date || ""}
                      onChange={(e) => handleEditChange(tempId, 'date', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={data.technician}
                    onChange={(e) => handleEditChange(tempId, 'technician', e.target.value)}
                    className="h-8 text-xs"
                    placeholder="טכנאי"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleSaveNew(tempId)}
                      disabled={loading}
                    >
                      <Save className="w-3 h-3 text-green-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleCancelNew(tempId)}
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && newRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-xs text-gray-400 py-2">
                  אין רשומות
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/UAVTailNumber">
                <Button variant="outline" size="icon" className="ml-2">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">&#9881;</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuration Tracking</h1>
                <p className="text-sm text-gray-500">מעקב תצורה</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Select value={selectedTail} onValueChange={(val) => {
              setSelectedTail(val);
              navigate(`/Configuration?tail=${val}`);
            }}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="בחר מספר זנב" />
              </SelectTrigger>
              <SelectContent>
                {allTails.map(tail => (
                  <SelectItem key={tail} value={tail}>{tail}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Configuration Tracking Section */}
        {selectedTail && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Configuration Tracking</h2>
              {TRACKING_COMPONENTS.map(comp =>
                renderComponentSection(comp, "bg-slate-50", "bg-slate-100")
              )}
            </div>

            {/* MCU Section */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">MCU</h2>
              {MCU_COMPONENTS.map(comp =>
                renderComponentSection(comp, "bg-blue-50", "bg-blue-100")
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
