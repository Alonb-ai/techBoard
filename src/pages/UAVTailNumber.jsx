import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Settings, Shield, Wrench, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UAVTailNumber() {
  const [tailNumbers, setTailNumbers] = useState([]);
  const [newTail, setNewTail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTailNumbers();
  }, []);

  const loadTailNumbers = async () => {
    setLoading(true);
    const [certs, comps, permits, procs, configs] = await Promise.all([
      base44.entities.DeliveryCertificate.list(),
      base44.entities.InstalledComponent.list(),
      base44.entities.SpecialPermit.list(),
      base44.entities.MaintenanceProcedure.list(),
      base44.entities.Configuration.list()
    ]);

    const allTails = new Set([
      ...certs.map(c => c.aircraft_tail),
      ...comps.map(c => c.aircraft_tail),
      ...permits.map(p => p.aircraft_tail),
      ...procs.map(p => p.aircraft_tail),
      ...configs.map(c => c.aircraft_tail)
    ]);

    setTailNumbers([...allTails].filter(Boolean).sort());
    setLoading(false);
  };

  const handleAddTail = async () => {
    if (!newTail.trim()) return;
    
    // Create empty records for all entities
    await Promise.all([
      base44.entities.DeliveryCertificate.create({ aircraft_tail: newTail }),
      base44.entities.Configuration.create({ aircraft_tail: newTail })
    ]);
    
    setNewTail("");
    loadTailNumbers();
  };

  const pages = [
    { name: "Delivery Certificate", path: "/DeliveryCertificate", icon: FileCheck, color: "bg-green-600" },
    { name: "Installed Components", path: "/InstalledComponents", icon: Settings, color: "bg-blue-600" },
    { name: "Special Permits", path: "/SpecialPermits", icon: Shield, color: "bg-pink-600" },
    { name: "Maintenance Procedures", path: "/MaintenanceProcedures", icon: Wrench, color: "bg-orange-600" },
    { name: "Configuration", path: "/Configuration", icon: FileText, color: "bg-slate-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl">✈</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">UAV Tail Numbers</h1>
              <p className="text-gray-500 mt-1">מספרי זנב של כלי טיס בלתי מאויישים</p>
            </div>
          </div>

          {/* Add New Tail */}
          <div className="flex gap-3">
            <Input
              placeholder="הוסף מספר זנב חדש..."
              value={newTail}
              onChange={(e) => setNewTail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTail()}
              className="flex-1"
            />
            <Button onClick={handleAddTail} className="bg-blue-700 hover:bg-blue-800 gap-2">
              <Plus className="w-4 h-4" />
              הוסף מטוס
            </Button>
          </div>
        </div>

        {/* Aircraft List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : tailNumbers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            אין מטוסים במערכת. הוסף מספר זנב כדי להתחיל.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tailNumbers.map((tail) => (
              <Card key={tail} className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-t-lg">
                  <CardTitle className="text-2xl font-bold text-center">{tail}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {pages.map((page) => (
                      <Link
                        key={page.path}
                        to={`${page.path}?tail=${tail}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className={`w-10 h-10 ${page.color} rounded-lg flex items-center justify-center`}>
                          <page.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{page.name}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}