import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, ArrowRight, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";

export default function Configuration() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [allTails, setAllTails] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [filteredConfigs, setFilteredConfigs] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      setFilteredConfigs(
        configs
          .filter(c => c.aircraft_tail === selectedTail)
          .sort((a, b) => (b.mcu_date || "").localeCompare(a.mcu_date || ""))
      );
    } else {
      setFilteredConfigs([]);
    }
  }, [selectedTail, configs]);

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

  const handleNewConfig = () => {
    setFormData({
      aircraft_tail: selectedTail,
      mcu_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSelectConfig = (config) => {
    setFormData({ ...config });
  };

  const handleBackToList = () => {
    setFormData(null);
  };

  const handleSave = async () => {
    setLoading(true);
    if (formData.id) {
      await base44.entities.Configuration.update(formData.id, formData);
    } else {
      await base44.entities.Configuration.create(formData);
    }
    await loadData();
    setFormData(null);
    setLoading(false);
  };

  const handleDelete = async (config) => {
    if (config.id) {
      await base44.entities.Configuration.delete(config.id);
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {formData ? (
                <Button variant="outline" size="icon" className="ml-2" onClick={handleBackToList}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Link to="/UAVTailNumber">
                  <Button variant="outline" size="icon" className="ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuration Tracking</h1>
                <p className="text-sm text-gray-500">מעקב תצורה</p>
              </div>
            </div>
          </div>

          {!formData && (
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
              {selectedTail && (
                <Button onClick={handleNewConfig} className="bg-slate-700 hover:bg-slate-800 gap-2">
                  <Plus className="w-4 h-4" />
                  רשומה חדשה
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Configs List */}
        {!formData && selectedTail && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">תאריך MCU</TableHead>
                  <TableHead className="text-right">MCU Version</TableHead>
                  <TableHead className="text-right">MCU HPSB</TableHead>
                  <TableHead className="text-right">RSB Version</TableHead>
                  <TableHead className="text-right">טכנאי</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigs.map((config) => (
                  <TableRow
                    key={config.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSelectConfig(config)}
                  >
                    <TableCell>{config.mcu_date ? config.mcu_date.split('-').reverse().join('/') : "-"}</TableCell>
                    <TableCell>{config.mcu_version || "-"}</TableCell>
                    <TableCell>{config.mcu_hpsb || "-"}</TableCell>
                    <TableCell>{config.rsb_version || "-"}</TableCell>
                    <TableCell>{config.mcu_technician || "-"}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(config); }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredConfigs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                אין רשומות תצורה. לחץ על "רשומה חדשה" כדי להתחיל.
              </div>
            )}
          </div>
        )}

        {/* Config Form */}
        {formData && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {formData.id ? `תצורה - ${formData.mcu_date ? formData.mcu_date.split('-').reverse().join('/') : ""}` : "רשומה חדשה"}
              </h2>
              <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Save className="w-4 h-4" />
                שמור
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Aircraft Tail */}
              <div>
                <label className="block text-sm font-medium mb-2">Aircraft Tail Number</label>
                <Input
                  value={formData.aircraft_tail || ""}
                  onChange={(e) => setFormData({...formData, aircraft_tail: e.target.value})}
                  placeholder="מספר זנב"
                />
              </div>

              {/* MCU */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold mb-4 text-lg">MCU</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1">Version</label>
                    <Input
                      value={formData.mcu_version || ""}
                      onChange={(e) => setFormData({...formData, mcu_version: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">HPSB</label>
                    <Input
                      value={formData.mcu_hpsb || ""}
                      onChange={(e) => setFormData({...formData, mcu_hpsb: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Date</label>
                    <div className="relative">
                      <Input
                        type="text"
                        readOnly
                        value={formData.mcu_date ? formData.mcu_date.split('-').reverse().join('/') : ""}
                        placeholder="בחר תאריך"
                        className="cursor-pointer"
                        onClick={(e) => e.target.nextElementSibling.showPicker()}
                      />
                      <input
                        type="date"
                        value={formData.mcu_date || ""}
                        onChange={(e) => setFormData({...formData, mcu_date: e.target.value})}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Technician</label>
                    <Input
                      value={formData.mcu_technician || ""}
                      onChange={(e) => setFormData({...formData, mcu_technician: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* RSB */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-bold mb-4 text-lg">RSB</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1">Version</label>
                    <Input
                      value={formData.rsb_version || ""}
                      onChange={(e) => setFormData({...formData, rsb_version: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">HPSB</label>
                    <Input
                      value={formData.rsb_hpsb || ""}
                      onChange={(e) => setFormData({...formData, rsb_hpsb: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Date</label>
                    <div className="relative">
                      <Input
                        type="text"
                        readOnly
                        value={formData.rsb_date ? formData.rsb_date.split('-').reverse().join('/') : ""}
                        placeholder="בחר תאריך"
                        className="cursor-pointer"
                        onClick={(e) => e.target.nextElementSibling.showPicker()}
                      />
                      <input
                        type="date"
                        value={formData.rsb_date || ""}
                        onChange={(e) => setFormData({...formData, rsb_date: e.target.value})}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Technician</label>
                    <Input
                      value={formData.rsb_technician || ""}
                      onChange={(e) => setFormData({...formData, rsb_technician: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center py-6">
              <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2 px-8">
                <Save className="w-4 h-4" />
                שמור
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>מחיקת רשומת תצורה</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">האם אתה בטוח שאתה רוצה למחוק את רשומת התצורה?</p>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>לא</Button>
              <Button variant="destructive" onClick={() => { handleDelete(deleteConfirm); setDeleteConfirm(null); }}>כן</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
