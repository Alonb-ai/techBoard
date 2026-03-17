import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowRight, Scale } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";

const CONFIG_TYPES = [
  { key: "e180", label: "E180" },
  { key: "tower", label: "מגדל" },
  { key: "xr", label: "XR" },
  { key: "e140", label: "E140" },
];

const HEAT_TYPES = [
  { key: "no", label: "ללא" },
  { key: "beacon", label: "beacon" },
];

export default function WeightConfig() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [allTails, setAllTails] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      const existing = configs.find(c => c.aircraft_tail === selectedTail);
      if (existing) {
        setFormData({ ...existing });
      } else {
        setFormData({ aircraft_tail: selectedTail });
      }
    }
  }, [selectedTail, configs]);

  const loadData = async () => {
    const [weightConfigs, certs, comps, permits, procs, existingConfigs] = await Promise.all([
      base44.entities.WeightConfig.list(),
      base44.entities.DeliveryCertificate.list(),
      base44.entities.InstalledComponent.list(),
      base44.entities.SpecialPermit.list(),
      base44.entities.MaintenanceProcedure.list(),
      base44.entities.Configuration.list()
    ]);
    setConfigs(weightConfigs);
    const tails = new Set([
      ...weightConfigs.map(c => c.aircraft_tail),
      ...certs.map(c => c.aircraft_tail),
      ...comps.map(c => c.aircraft_tail),
      ...permits.map(p => p.aircraft_tail),
      ...procs.map(p => p.aircraft_tail),
      ...existingConfigs.map(c => c.aircraft_tail)
    ]);
    setAllTails([...tails].filter(Boolean).sort());
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSave = { ...formData };
      delete dataToSave.id;
      delete dataToSave.created_date;
      delete dataToSave.created_by;

      if (formData.id) {
        await base44.entities.WeightConfig.update(formData.id, dataToSave);
      } else {
        const created = await base44.entities.WeightConfig.create(dataToSave);
        setFormData({ ...created });
      }
      await loadData();
    } catch (err) {
      console.error("Save error:", err);
    }
    setLoading(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Weight & Balance Config</h1>
                <p className="text-sm text-gray-500">דף תצורה - לפי 43 ק"ג</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Select value={selectedTail} onValueChange={(val) => {
              setSelectedTail(val);
              navigate(`/WeightConfig?tail=${val}`);
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
            {formData && (
              <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 gap-2">
                <Save className="w-4 h-4" />
                שמור
              </Button>
            )}
          </div>
        </div>

        {/* Form */}
        {formData && selectedTail && (
          <div className="space-y-6">
            {/* Header Info - styled like PDF */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-l from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">דף 1 - סיכום לפי 43 ק"ג</span>
                </div>
                <div className="text-4xl font-bold">UAV {selectedTail}</div>
              </div>

              <div className="p-6">
                {/* Header fields table */}
                <div className="border rounded-lg overflow-hidden mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-right font-bold">מיקום סוללות</TableHead>
                        <TableHead className="text-right font-bold">משקל ריק</TableHead>
                        <TableHead className="text-right font-bold">תאריך שקילה</TableHead>
                        <TableHead className="text-right font-bold">שיוך</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Select value={formData.battery_position || ""} onValueChange={(v) => handleFieldChange('battery_position', v)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="בחר" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="אחורי">אחורי</SelectItem>
                              <SelectItem value="קדמי">קדמי</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              value={formData.empty_weight || ""}
                              onChange={(e) => handleFieldChange('empty_weight', e.target.value)}
                              className="w-24"
                              placeholder="0.0"
                            />
                            <span className="text-sm text-gray-500">kg</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="relative w-36">
                            <Input
                              type="text"
                              readOnly
                              value={formData.weighing_date ? formData.weighing_date.split('-').reverse().join('/') : ""}
                              placeholder="בחר תאריך"
                              className="w-36 cursor-pointer"
                              onClick={(e) => e.target.nextElementSibling.showPicker()}
                            />
                            <input
                              type="date"
                              value={formData.weighing_date || ""}
                              onChange={(e) => handleFieldChange('weighing_date', e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={formData.assignment || ""}
                            onChange={(e) => handleFieldChange('assignment', e.target.value)}
                            className="w-28"
                            placeholder="משרד"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Configuration Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-50">
                        <TableHead className="text-right font-bold">תצורה</TableHead>
                        <TableHead className="text-right font-bold">חימום סוללות</TableHead>
                        <TableHead className="text-right font-bold">דלק ב L</TableHead>
                        <TableHead className="text-right font-bold">משקולת ומיקום (אין כפל משקולות)</TableHead>
                        <TableHead className="text-right font-bold">דלק ב KG</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CONFIG_TYPES.map((config, ci) => (
                        HEAT_TYPES.map((heat, hi) => {
                          const prefix = `${config.key}_${heat.key}`;
                          const isFirstOfGroup = hi === 0;
                          const bgColor = ci % 2 === 0 ? "" : "bg-gray-50";
                          return (
                            <TableRow key={prefix} className={bgColor}>
                              {isFirstOfGroup ? (
                                <TableCell rowSpan={2} className="font-bold text-center border-l">
                                  {config.label}
                                </TableCell>
                              ) : null}
                              <TableCell className="text-center">
                                {heat.label}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={formData[`${prefix}_fuel_l`] || ""}
                                    onChange={(e) => handleFieldChange(`${prefix}_fuel_l`, e.target.value)}
                                    className="w-20 text-center"
                                    placeholder="0.0"
                                  />
                                  <span className="text-xs text-gray-400">L</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={formData[`${prefix}_weight_desc`] || ""}
                                  onChange={(e) => handleFieldChange(`${prefix}_weight_desc`, e.target.value)}
                                  className="w-full"
                                  placeholder="ללא משקולות"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={formData[`${prefix}_fuel_kg`] || ""}
                                    onChange={(e) => handleFieldChange(`${prefix}_fuel_kg`, e.target.value)}
                                    className="w-20 text-center"
                                    placeholder="0.0"
                                  />
                                  <span className="text-xs text-gray-400">kg</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )).flat()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center py-4">
              <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 gap-2 px-8">
                <Save className="w-4 h-4" />
                שמור
              </Button>
            </div>
          </div>
        )}

        {!selectedTail && (
          <div className="text-center py-20 text-gray-400">
            בחר מספר זנב כדי לצפות בתצורה
          </div>
        )}
      </div>
    </div>
  );
}
