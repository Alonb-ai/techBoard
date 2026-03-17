import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Settings, Shield, Wrench, FileCheck, Search, X, FolderOpen, Scale, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

import StatsCards from "../components/faults/StatsCards";
import DashboardCards from "../components/faults/DashboardCards";
import FaultTable from "../components/faults/FaultTable";
import FaultForm from "../components/faults/FaultForm";

const STATUS_FILTER = ["הכל", "פתוח", "בטיפול", "ממתין לחלפים", "דחוי", "סגור"];

export default function HomePage() {
  // === UAV Tail Numbers State ===
  const [tailNumbers, setTailNumbers] = useState([]);
  const [newTail, setNewTail] = useState("");
  const [tailLoading, setTailLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // === Fault Board State ===
  const [faults, setFaults] = useState([]);
  const [faultLoading, setFaultLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editFault, setEditFault] = useState(null);
  const [faultSearch, setFaultSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("הכל");
  const [systemFilter, setSystemFilter] = useState("הכל");
  const [activeTab, setActiveTab] = useState("table");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadTailNumbers();
    loadFaults();
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // === UAV Tail Numbers Logic ===
  const loadTailNumbers = async () => {
    setTailLoading(true);
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
    setTailLoading(false);
  };

  const handleAddTail = async () => {
    if (!newTail.trim()) return;
    await Promise.all([
      base44.entities.DeliveryCertificate.create({ aircraft_tail: newTail }),
      base44.entities.Configuration.create({ aircraft_tail: newTail })
    ]);
    setNewTail("");
    setShowAddDialog(false);
    loadTailNumbers();
  };

  const filteredTails = tailNumbers.filter(tail =>
    tail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pages = [
    { name: "Delivery Certificate", path: "/DeliveryCertificate", icon: FileCheck, color: "bg-green-600" },
    { name: "Installed Components", path: "/InstalledComponents", icon: Settings, color: "bg-blue-600" },
    { name: "Special Permits", path: "/SpecialPermits", icon: Shield, color: "bg-pink-600" },
    { name: "Maintenance Procedures", path: "/MaintenanceProcedures", icon: Wrench, color: "bg-orange-600" },
    { name: "Configuration", path: "/Configuration", icon: FileText, color: "bg-slate-600" },
    { name: "דף תצורה", path: "/WeightConfig", icon: Scale, color: "bg-amber-600" },
    { name: "Files", path: "/Files", icon: FolderOpen, color: "bg-purple-600" }
  ];

  // === Fault Board Logic ===
  const loadFaults = async () => {
    setFaultLoading(true);
    const data = await base44.entities.Fault.list("-opened_date");
    setFaults(data);
    setFaultLoading(false);
  };

  const handleFaultSubmit = async (formData) => {
    if (editFault) {
      await base44.entities.Fault.update(editFault.id, formData);
    } else {
      await base44.entities.Fault.create(formData);
    }
    setShowForm(false);
    setEditFault(null);
    loadFaults();
  };

  const handleEdit = (fault) => {
    setEditFault(fault);
    setShowForm(true);
  };

  const handleClose = async (fault) => {
    await base44.entities.Fault.update(fault.id, {
      status: "סגור",
      closed_date: format(new Date(), "yyyy-MM-dd")
    });
    loadFaults();
  };

  const handleDelete = async (id) => {
    await base44.entities.Fault.delete(id);
    loadFaults();
  };

  const systems = ["הכל", ...new Set(faults.map(f => f.system).filter(Boolean))];

  const filteredFaults = faults.filter(f => {
    const matchSearch = !faultSearch ||
      f.aircraft_number?.toLowerCase().includes(faultSearch.toLowerCase()) ||
      f.description?.toLowerCase().includes(faultSearch.toLowerCase()) ||
      f.technician_name?.toLowerCase().includes(faultSearch.toLowerCase());
    const matchStatus = statusFilter === "הכל" || f.status === statusFilter;
    const matchSystem = systemFilter === "הכל" || f.system === systemFilter;
    return matchSearch && matchStatus && matchSystem;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl">✈</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">בורד טכנאים – בלובירד</h1>
            <p className="text-xs text-gray-500">מערכת ניהול תחזוקת כלי טיס</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ===== RIGHT SIDE: UAV Tail Numbers ===== */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">מספרי זנב</h2>
                <Button onClick={() => setShowAddDialog(true)} className="bg-blue-700 hover:bg-blue-800 gap-2" size="sm">
                  <Plus className="w-4 h-4" />
                  הוסף מטוס
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="חיפוש מספר זנב..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {tailLoading ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : tailNumbers.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                אין מטוסים במערכת. הוסף מספר זנב כדי להתחיל.
              </div>
            ) : filteredTails.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                לא נמצאו מטוסים התואמים לחיפוש "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTails.map((tail) => (
                  <Card key={tail} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-t-lg py-3">
                      <CardTitle className="text-xl font-bold text-center">{tail}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {pages.map((page) => (
                          <Link
                            key={page.path}
                            to={`${page.path}?tail=${tail}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                          >
                            <div className={`w-8 h-8 ${page.color} rounded-lg flex items-center justify-center`}>
                              <page.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{page.name}</span>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* ===== LEFT SIDE: Fault Board ===== */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">בורד תקלות</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={loadFaults} className="h-9 w-9">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => { setEditFault(null); setShowForm(true); }} className="bg-blue-700 hover:bg-blue-800 text-white gap-2" size="sm">
                    <Plus className="w-4 h-4" />
                    תקלה חדשה
                  </Button>
                </div>
              </div>

              <StatsCards faults={faults} />

              <div className="mt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="table">טבלת תקלות</TabsTrigger>
                    <TabsTrigger value="dashboard">דשבורד מטוסים</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {activeTab === "dashboard" && <DashboardCards faults={faults} />}

            {activeTab === "table" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      className="pr-9"
                      placeholder="חיפוש לפי מטוס, תיאור, טכנאי..."
                      value={faultSearch}
                      onChange={e => setFaultSearch(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="סטטוס" /></SelectTrigger>
                    <SelectContent>{STATUS_FILTER.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={systemFilter} onValueChange={setSystemFilter}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="מערכת" /></SelectTrigger>
                    <SelectContent>{systems.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {faultLoading ? (
                  <div className="text-center py-10 text-gray-400">טוען נתונים...</div>
                ) : (
                  <FaultTable
                    faults={filteredFaults}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClose={handleClose}
                    isAdmin={isAdmin}
                  />
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add Aircraft Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף מטוס חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">מספר זנב</label>
              <Input
                placeholder="הכנס מספר זנב..."
                value={newTail}
                onChange={(e) => setNewTail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTail()}
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowAddDialog(false); setNewTail(""); }}>
                ביטול
              </Button>
              <Button onClick={handleAddTail} className="bg-blue-700 hover:bg-blue-800 gap-2">
                <Plus className="w-4 h-4" />
                הוסף
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fault Form Dialog */}
      {showForm && (
        <FaultForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditFault(null); }}
          onSubmit={handleFaultSubmit}
          initialData={editFault}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
