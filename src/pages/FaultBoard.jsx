import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

import StatsCards from "../components/faults/StatsCards";
import DashboardCards from "../components/faults/DashboardCards";
import FaultTable from "../components/faults/FaultTable";
import FaultForm from "../components/faults/FaultForm";

const STATUS_FILTER = ["הכל", "פתוח", "בטיפול", "ממתין לחלפים", "דחוי", "סגור"];

export default function FaultBoard() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editFault, setEditFault] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("הכל");
  const [systemFilter, setSystemFilter] = useState("הכל");
  const [activeTab, setActiveTab] = useState("table");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadData();
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.Fault.list("-opened_date");
    setFaults(data);
    setLoading(false);
  };

  const handleSubmit = async (formData) => {
    if (editFault) {
      await base44.entities.Fault.update(editFault.id, formData);
    } else {
      await base44.entities.Fault.create(formData);
    }
    setShowForm(false);
    setEditFault(null);
    loadData();
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
    loadData();
  };

  const handleDelete = async (id) => {
    await base44.entities.Fault.delete(id);
    loadData();
  };

  const systems = ["הכל", ...new Set(faults.map(f => f.system).filter(Boolean))];

  const filtered = faults.filter(f => {
    const matchSearch = !search ||
      f.aircraft_number?.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase()) ||
      f.technician_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "הכל" || f.status === statusFilter;
    const matchSystem = systemFilter === "הכל" || f.system === systemFilter;
    return matchSearch && matchStatus && matchSystem;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">✈</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">בורד תקלות – בלובירד</h1>
              <p className="text-xs text-gray-500">מערכת ניהול תקלות טכניות</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/Home">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={loadData} className="h-9 w-9">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => { setEditFault(null); setShowForm(true); }} className="bg-blue-700 hover:bg-blue-800 text-white gap-2">
              <Plus className="w-4 h-4" />
              תקלה חדשה
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <StatsCards faults={faults} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="table">טבלת תקלות</TabsTrigger>
            <TabsTrigger value="dashboard">דשבורד מטוסים</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "dashboard" && <DashboardCards faults={faults} />}

        {activeTab === "table" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  className="pr-9"
                  placeholder="חיפוש לפי מטוס, תיאור, טכנאי..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
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

            {loading ? (
              <div className="text-center py-20 text-gray-400">טוען נתונים...</div>
            ) : (
              <FaultTable
                faults={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={handleClose}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}
      </div>

      {showForm && (
        <FaultForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditFault(null); }}
          onSubmit={handleSubmit}
          initialData={editFault}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}