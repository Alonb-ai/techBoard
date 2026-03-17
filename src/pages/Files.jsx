import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Download, ArrowRight, FileIcon, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

export default function Files() {
  const [files, setFiles] = useState([]);
  const [selectedTail, setSelectedTail] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
    const urlParams = new URLSearchParams(window.location.search);
    const tail = urlParams.get('tail');
    if (tail) setSelectedTail(tail);
  }, []);

  useEffect(() => {
    if (selectedTail) {
      setFilteredFiles(files.filter(f => f.aircraft_tail === selectedTail));
    } else {
      setFilteredFiles([]);
    }
  }, [selectedTail, files]);

  const loadFiles = async () => {
    const data = await base44.entities.AircraftFile.list();
    setFiles(data);
  };

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length || !selectedTail) return;

    setUploading(true);
    try {
      for (const file of fileInput.files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.AircraftFile.create({
          aircraft_tail: selectedTail,
          file_name: file.name,
          file_url: result.url,
          file_type: file.name.split('.').pop() || "",
          uploaded_at: new Date().toISOString().split('T')[0],
          notes: notes
        });
      }
      await loadFiles();
      setShowUploadDialog(false);
      setNotes("");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileRecord) => {
    if (fileRecord.id) {
      await base44.entities.AircraftFile.delete(fileRecord.id);
      await loadFiles();
    }
  };

  const tails = [...new Set(files.map(f => f.aircraft_tail))];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/UAVTailNumber">
                <Button variant="outline" size="icon" className="ml-2">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <FileIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Files</h1>
                <p className="text-sm text-gray-500">קבצים</p>
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
              <Button onClick={() => setShowUploadDialog(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Upload className="w-4 h-4" />
                העלאת קובץ
              </Button>
            )}
          </div>
        </div>

        {/* Files Table */}
        {selectedTail && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="text-right">שם קובץ</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">תאריך העלאה</TableHead>
                  <TableHead className="text-right">הערות</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.file_name}</TableCell>
                    <TableCell>{file.file_type}</TableCell>
                    <TableCell>{file.uploaded_at ? file.uploaded_at.split('-').reverse().join('/') : ""}</TableCell>
                    <TableCell className="max-w-xs truncate">{file.notes}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(file)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredFiles.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                אין קבצים. לחץ על "העלאת קובץ" כדי להתחיל.
              </div>
            )}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>העלאת קובץ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">בחר קובץ</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">הערות (אופציונלי)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות לקובץ..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setShowUploadDialog(false); setNotes(""); }}>
                  ביטול
                </Button>
                <Button onClick={handleUpload} disabled={uploading} className="bg-purple-600 hover:bg-purple-700 gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "מעלה..." : "העלה"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
