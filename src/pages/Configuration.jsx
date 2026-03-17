import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Configuration() {
  const [configs, setConfigs] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfigs();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) {
      setSelectedTail(tail);
      loadConfig(tail);
    }
  }, []);

  const loadConfigs = async () => {
    const data = await base44.entities.Configuration.list();
    setConfigs(data);
  };

  const loadConfig = async (tail) => {
    const existing = configs.find(c => c.aircraft_tail === tail);
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({ aircraft_tail: tail });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    if (formData.id) {
      await base44.entities.Configuration.update(formData.id, formData);
    } else {
      await base44.entities.Configuration.create(formData);
    }
    await loadConfigs();
    setLoading(false);
  };

  const handleNew = () => {
    setSelectedTail("");
    setFormData(null);
  };

  const tails = [...new Set(configs.map(c => c.aircraft_tail))];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
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
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuration Tracking</h1>
                <p className="text-sm text-gray-500">מעקב תצורה</p>
              </div>
            </div>
            <Button onClick={handleNew} className="bg-slate-700 hover:bg-slate-800 gap-2">
              <Plus className="w-4 h-4" />
              תצורה חדשה
            </Button>
          </div>

          <div className="flex gap-3">
            <Select value={selectedTail} onValueChange={(v) => { setSelectedTail(v); loadConfig(v); }}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="בחר מספר זנב" />
              </SelectTrigger>
              <SelectContent>
                {tails.map(tail => (
                  <SelectItem key={tail} value={tail}>{tail}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData && (
              <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 gap-2">
                <Save className="w-4 h-4" />
                שמור
              </Button>
            )}
          </div>
        </div>

        {formData && (
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
        )}
      </div>
    </div>
  );
}