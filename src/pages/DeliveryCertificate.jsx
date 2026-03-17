import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

function calcFlightDuration(toTime, landingTime) {
  if (!toTime || !landingTime) return null;
  const [toH, toM] = toTime.split(':').map(Number);
  const [ldH, ldM] = landingTime.split(':').map(Number);
  if (isNaN(toH) || isNaN(toM) || isNaN(ldH) || isNaN(ldM)) return null;
  let diffMin = (ldH * 60 + ldM) - (toH * 60 + toM);
  if (diffMin < 0) diffMin += 24 * 60;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return `${hours}:${String(mins).padStart(2, '0')}`;
}

export default function DeliveryCertificate() {
  const [certificates, setCertificates] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [filteredCerts, setFilteredCerts] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCertificates();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      setFilteredCerts(certificates.filter(c => c.aircraft_tail === selectedTail));
    } else {
      setFilteredCerts([]);
    }
  }, [selectedTail, certificates]);

  const loadCertificates = async () => {
    const data = await base44.entities.DeliveryCertificate.list();
    setCertificates(data);
  };

  const handleNewCertificate = () => {
    setFormData({
      aircraft_tail: selectedTail,
      pre_flight_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSelectCertificate = (cert) => {
    setFormData({ ...cert });
  };

  const handleBackToList = () => {
    setFormData(null);
  };

  const handleSave = async () => {
    setLoading(true);
    const dataToSave = { ...formData };
    if (!dataToSave.pre_flight_date) {
      dataToSave.pre_flight_date = new Date().toISOString().split('T')[0];
    }
    if (dataToSave.id) {
      await base44.entities.DeliveryCertificate.update(dataToSave.id, dataToSave);
    } else {
      await base44.entities.DeliveryCertificate.create(dataToSave);
    }
    await loadCertificates();
    setFormData(null);
    setLoading(false);
  };

  const handleDelete = async (cert) => {
    if (cert.id) {
      await base44.entities.DeliveryCertificate.delete(cert.id);
      await loadCertificates();
    }
  };

  const tails = [...new Set(certificates.map(c => c.aircraft_tail))];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {formData ? (
                <Button variant="outline" size="icon" className="ml-2" onClick={handleBackToList}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              ) : (
                <Link to="/UAVTailNumber">
                  <Button variant="outline" size="icon" className="ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">✈</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Certificate</h1>
                <p className="text-sm text-gray-500">תעודת מסירה</p>
              </div>
            </div>
          </div>

          {!formData && (
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
                <Button onClick={handleNewCertificate} className="bg-green-600 hover:bg-green-700 gap-2">
                  <Plus className="w-4 h-4" />
                  תעודה חדשה
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Certificates List */}
        {!formData && selectedTail && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50">
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">טכנאי</TableHead>
                  <TableHead className="text-right">שעות טיסה כוללות</TableHead>
                  <TableHead className="text-right">מס׳ טיסות</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCerts.map((cert) => (
                  <TableRow
                    key={cert.id}
                    className="cursor-pointer hover:bg-green-50"
                    onClick={() => handleSelectCertificate(cert)}
                  >
                    <TableCell>{cert.pre_flight_date ? cert.pre_flight_date.split('-').reverse().join('/') : "ללא תאריך"}</TableCell>
                    <TableCell>{cert.technician_name_pre || "-"}</TableCell>
                    <TableCell>{cert.overall_flight_hours || "-"}</TableCell>
                    <TableCell>{[cert.flight_1_to_time, cert.flight_2_to_time, cert.flight_3_to_time].filter(Boolean).length}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleDelete(cert); }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCerts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                אין תעודות מסירה. לחץ על "תעודה חדשה" כדי להתחיל.
              </div>
            )}
          </div>
        )}

        {/* Certificate Form */}
        {formData && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {formData.id ? `תעודת מסירה - ${formData.pre_flight_date || ""}` : "תעודה חדשה"}
              </h2>
              <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 gap-2">
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

              {/* Pre Flight Details */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-4 text-lg">Pre Flight Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs mb-1">R Boom</label>
                    <Input value={formData.r_boom || ""} onChange={(e) => setFormData({...formData, r_boom: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">L Boom</label>
                    <Input value={formData.l_boom || ""} onChange={(e) => setFormData({...formData, l_boom: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Elevator</label>
                    <Input value={formData.elevator || ""} onChange={(e) => setFormData({...formData, elevator: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">L Rudder</label>
                    <Input value={formData.l_rudder || ""} onChange={(e) => setFormData({...formData, l_rudder: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">R Rudder</label>
                    <Input value={formData.r_rudder || ""} onChange={(e) => setFormData({...formData, r_rudder: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">R Wing</label>
                    <Input value={formData.r_wing || ""} onChange={(e) => setFormData({...formData, r_wing: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">L Wing</label>
                    <Input value={formData.l_wing || ""} onChange={(e) => setFormData({...formData, l_wing: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Main Wing</label>
                    <Input value={formData.main_wing || ""} onChange={(e) => setFormData({...formData, main_wing: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Fuel QTY</label>
                    <Input value={formData.fuel_qty_pre || ""} onChange={(e) => setFormData({...formData, fuel_qty_pre: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Technician Name</label>
                    <Input value={formData.technician_name_pre || ""} onChange={(e) => setFormData({...formData, technician_name_pre: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Pre Flight Date</label>
                    <Input type="date" value={formData.pre_flight_date || ""} onChange={(e) => setFormData({...formData, pre_flight_date: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Flight 1 Details */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold mb-4">#1 Flight Details</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs mb-1">T/O Time</label>
                    <Input value={formData.flight_1_to_time || ""} onChange={(e) => setFormData({...formData, flight_1_to_time: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Landing Time</label>
                    <Input value={formData.flight_1_landing_time || ""} onChange={(e) => setFormData({...formData, flight_1_landing_time: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Payload</label>
                    <Input value={formData.flight_1_payload || ""} onChange={(e) => setFormData({...formData, flight_1_payload: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">VTOL Battery 1</label>
                    <Input value={formData.flight_1_vtol_battery_1 || ""} onChange={(e) => setFormData({...formData, flight_1_vtol_battery_1: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">VTOL Battery 2</label>
                    <Input value={formData.flight_1_vtol_battery_2 || ""} onChange={(e) => setFormData({...formData, flight_1_vtol_battery_2: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight Date</label>
                    <Input type="date" value={formData.flight_1_date || ""} onChange={(e) => setFormData({...formData, flight_1_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Operator Name</label>
                    <Input value={formData.flight_1_operator_name || ""} onChange={(e) => setFormData({...formData, flight_1_operator_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Technician Name</label>
                    <Input value={formData.flight_1_technician_name || ""} onChange={(e) => setFormData({...formData, flight_1_technician_name: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_1_permits || false} onCheckedChange={(v) => setFormData({...formData, flight_1_permits: v})} />
                    <label className="text-xs">Permits</label>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight Goal</label>
                    <Input value={formData.flight_1_goal || ""} onChange={(e) => setFormData({...formData, flight_1_goal: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_1_turn_around || false} onCheckedChange={(v) => setFormData({...formData, flight_1_turn_around: v})} />
                    <label className="text-xs">Turn Around</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_1_after_flight || false} onCheckedChange={(v) => setFormData({...formData, flight_1_after_flight: v})} />
                    <label className="text-xs">After Flight</label>
                  </div>
                </div>
                {calcFlightDuration(formData.flight_1_to_time, formData.flight_1_landing_time) && (
                  <div className="mt-3 pt-3 border-t text-sm font-semibold">
                    שעות טיסה #1: {calcFlightDuration(formData.flight_1_to_time, formData.flight_1_landing_time)}
                  </div>
                )}
              </div>

              {/* Flight 2 Details */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="font-bold mb-4">#2 Flight Details</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs mb-1">T/O Time</label>
                    <Input value={formData.flight_2_to_time || ""} onChange={(e) => setFormData({...formData, flight_2_to_time: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Landing Time</label>
                    <Input value={formData.flight_2_landing_time || ""} onChange={(e) => setFormData({...formData, flight_2_landing_time: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Payload</label>
                    <Input value={formData.flight_2_payload || ""} onChange={(e) => setFormData({...formData, flight_2_payload: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">VTOL Battery 1</label>
                    <Input value={formData.flight_2_vtol_battery_1 || ""} onChange={(e) => setFormData({...formData, flight_2_vtol_battery_1: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">VTOL Battery 2</label>
                    <Input value={formData.flight_2_vtol_battery_2 || ""} onChange={(e) => setFormData({...formData, flight_2_vtol_battery_2: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Fuel QTY</label>
                    <Input value={formData.flight_2_fuel_qty || ""} onChange={(e) => setFormData({...formData, flight_2_fuel_qty: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight Date</label>
                    <Input type="date" value={formData.flight_2_date || ""} onChange={(e) => setFormData({...formData, flight_2_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Operator Name</label>
                    <Input value={formData.flight_2_operator_name || ""} onChange={(e) => setFormData({...formData, flight_2_operator_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Technician Name</label>
                    <Input value={formData.flight_2_technician_name || ""} onChange={(e) => setFormData({...formData, flight_2_technician_name: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_2_permits || false} onCheckedChange={(v) => setFormData({...formData, flight_2_permits: v})} />
                    <label className="text-xs">Permits</label>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight Goal</label>
                    <Input value={formData.flight_2_goal || ""} onChange={(e) => setFormData({...formData, flight_2_goal: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_2_turn_around || false} onCheckedChange={(v) => setFormData({...formData, flight_2_turn_around: v})} />
                    <label className="text-xs">Turn Around</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_2_after_flight || false} onCheckedChange={(v) => setFormData({...formData, flight_2_after_flight: v})} />
                    <label className="text-xs">After Flight</label>
                  </div>
                </div>
                {calcFlightDuration(formData.flight_2_to_time, formData.flight_2_landing_time) && (
                  <div className="mt-3 pt-3 border-t text-sm font-semibold">
                    שעות טיסה #2: {calcFlightDuration(formData.flight_2_to_time, formData.flight_2_landing_time)}
                  </div>
                )}
              </div>

              {/* Flight 3 Details */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h3 className="font-bold mb-4">#3 Flight Details</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs mb-1">T/O Time</label>
                    <Input value={formData.flight_3_to_time || ""} onChange={(e) => setFormData({...formData, flight_3_to_time: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Landing Time</label>
                    <Input value={formData.flight_3_landing_time || ""} onChange={(e) => setFormData({...formData, flight_3_landing_time: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Payload</label>
                    <Input value={formData.flight_3_payload || ""} onChange={(e) => setFormData({...formData, flight_3_payload: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">VTOL Battery 1</label>
                    <Input value={formData.flight_3_vtol_battery_1 || ""} onChange={(e) => setFormData({...formData, flight_3_vtol_battery_1: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">VTOL Battery 2</label>
                    <Input value={formData.flight_3_vtol_battery_2 || ""} onChange={(e) => setFormData({...formData, flight_3_vtol_battery_2: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Fuel QTY</label>
                    <Input value={formData.flight_3_fuel_qty || ""} onChange={(e) => setFormData({...formData, flight_3_fuel_qty: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight Date</label>
                    <Input type="date" value={formData.flight_3_date || ""} onChange={(e) => setFormData({...formData, flight_3_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Operator Name</label>
                    <Input value={formData.flight_3_operator_name || ""} onChange={(e) => setFormData({...formData, flight_3_operator_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Technician Name</label>
                    <Input value={formData.flight_3_technician_name || ""} onChange={(e) => setFormData({...formData, flight_3_technician_name: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_3_permits || false} onCheckedChange={(v) => setFormData({...formData, flight_3_permits: v})} />
                    <label className="text-xs">Permits</label>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight Goal</label>
                    <Input value={formData.flight_3_goal || ""} onChange={(e) => setFormData({...formData, flight_3_goal: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_3_turn_around || false} onCheckedChange={(v) => setFormData({...formData, flight_3_turn_around: v})} />
                    <label className="text-xs">Turn Around</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={formData.flight_3_after_flight || false} onCheckedChange={(v) => setFormData({...formData, flight_3_after_flight: v})} />
                    <label className="text-xs">After Flight</label>
                  </div>
                </div>
                {calcFlightDuration(formData.flight_3_to_time, formData.flight_3_landing_time) && (
                  <div className="mt-3 pt-3 border-t text-sm font-semibold">
                    שעות טיסה #3: {calcFlightDuration(formData.flight_3_to_time, formData.flight_3_landing_time)}
                  </div>
                )}
              </div>

              {/* Flight Hours Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-4">Flight Hours Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs mb-1">Previous Flight Hours</label>
                    <Input value={formData.previous_flight_hours || ""} onChange={(e) => setFormData({...formData, previous_flight_hours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Previous Engine Hours</label>
                    <Input value={formData.previous_engine_hours || ""} onChange={(e) => setFormData({...formData, previous_engine_hours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Previous Flight Sorties</label>
                    <Input value={formData.previous_flight_sorties || ""} onChange={(e) => setFormData({...formData, previous_flight_sorties: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight #1 Hours</label>
                    <Input value={formData.flight_1_hours || ""} onChange={(e) => setFormData({...formData, flight_1_hours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight #2 Hours</label>
                    <Input value={formData.flight_2_hours || ""} onChange={(e) => setFormData({...formData, flight_2_hours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flight #3 Hours</label>
                    <Input value={formData.flight_3_hours || ""} onChange={(e) => setFormData({...formData, flight_3_hours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Overall Flight Hours</label>
                    <Input value={formData.overall_flight_hours || ""} onChange={(e) => setFormData({...formData, overall_flight_hours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Overall Engine Hours</label>
                    <Input value={formData.overall_engine_hours || ""} onChange={(e) => setFormData({...formData, overall_engine_hours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Overall Sorties</label>
                    <Input value={formData.overall_sorties || ""} onChange={(e) => setFormData({...formData, overall_sorties: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center py-6">
              <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 gap-2 px-8">
                <Save className="w-4 h-4" />
                שמור
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
