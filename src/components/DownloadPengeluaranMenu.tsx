import React, { useState, useMemo } from "react";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  X, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Button } from "./ui/button";
import { formatIDR } from "../lib/utils";
import { User, Pengeluaran } from "../types";
import { 
  exportPengeluaranToExcel, 
  exportPengeluaranToPDF,
  PengeluaranRecord 
} from "../lib/exportPengeluaran";

interface DownloadPengeluaranMenuProps {
  title: string;
  records: PengeluaranRecord[];
  allUsers: User[];
  currentUser: User | null;
}

export default function DownloadPengeluaranMenu({
  title,
  records,
  allUsers,
  currentUser,
}: DownloadPengeluaranMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  const penabungList = useMemo(() => {
    return allUsers
      .filter(u => u.role === "user")
      .sort((a, b) => a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: "base" }));
  }, [allUsers]);

  const accessibleRecords = useMemo(() => {
    if (currentUser?.role === "admin") {
      return records;
    }
    return records.filter(r => r.userId === currentUser?.id);
  }, [records, currentUser]);

  const filteredRecords = useMemo(() => {
    return accessibleRecords.filter(r => {
      const matchUser = selectedUserId === "all" || r.userId === selectedUserId;
      return matchUser;
    });
  }, [accessibleRecords, selectedUserId]);

  const totalNominal = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [filteredRecords]);

  const handleDownloadPDF = async () => {
    setIsExporting("pdf");
    try {
      let reportTitle = title;
      if (selectedUserId !== "all") {
        const u = allUsers.find(user => user.id === selectedUserId);
        if (u) reportTitle += ` (${u.nama} - NRP: ${u.nrp})`;
      }

      exportPengeluaranToPDF({
        title: reportTitle,
        records: filteredRecords,
        allUsers,
        currentUser,
      });
      setIsOpen(false);
    } catch (err) {
      console.error("Gagal mengekspor PDF:", err);
      alert("Terjadi kesalahan saat mengunduh PDF.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadExcel = async () => {
    setIsExporting("excel");
    try {
      let reportTitle = title;
      if (selectedUserId !== "all") {
        const u = allUsers.find(user => user.id === selectedUserId);
        if (u) reportTitle += ` (${u.nama} - NRP: ${u.nrp})`;
      }

      exportPengeluaranToExcel({
        title: reportTitle,
        records: filteredRecords,
        allUsers,
        currentUser,
      });
      setIsOpen(false);
    } catch (err) {
      console.error("Gagal mengekspor Excel:", err);
      alert("Terjadi kesalahan saat mengunduh Excel.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 shadow-xs rounded-xl text-xs font-semibold px-3 py-1.5 transition-all"
        >
          <Download className="h-3.5 w-3.5 text-orange-600" />
          <span>Unduh Laporan</span>
          <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            exportPengeluaranToPDF({
              title,
              records: accessibleRecords,
              allUsers,
              currentUser,
            });
          }}
          className="hidden sm:inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 rounded-xl text-xs font-semibold px-3 py-1.5 shadow-xs transition-colors"
          title="Unduh langsung format PDF"
        >
          <FileText className="h-3.5 w-3.5 text-rose-600" />
          <span>PDF</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            exportPengeluaranToExcel({
              title,
              records: accessibleRecords,
              allUsers,
              currentUser,
            });
          }}
          className="hidden sm:inline-flex items-center gap-1.5 bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200/80 rounded-xl text-xs font-semibold px-3 py-1.5 shadow-xs transition-colors"
          title="Unduh langsung format Sheet/Excel"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-orange-600" />
          <span>Sheet (Excel)</span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-orange-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shadow-xs">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Unduh Laporan Pengeluaran</h3>
                  <p className="text-xs text-slate-500">Pilih format unduhan (PDF atau Spreadsheet Excel)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {currentUser?.role !== "admin" ? (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    File unduhan Anda akan memuat rincian penarikan/pengeluaran khusus milik akun Anda (NRP: <strong>{currentUser?.nrp}</strong> - {currentUser?.nama}).
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl text-xs text-orange-900 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    File unduhan mencakup <strong>Rekapitulasi Total Pengeluaran Setiap Anggota</strong> serta <strong>Detail Seluruh Transaksi Pengeluaran</strong>.
                  </span>
                </div>
              )}

              {currentUser?.role === "admin" && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>Filter Anggota</span>
                  </label>
                  <select
                    className="flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="all">Semua Anggota ({penabungList.length})</option>
                    {penabungList.map(u => (
                      <option key={u.id} value={u.id}>{u.nrp} - {u.nama}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ringkasan Data Pengeluaran:
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                    <div className="text-[10px] text-slate-400">Total Pengeluaran</div>
                    <div className="text-xs sm:text-sm font-extrabold text-orange-600 mt-0.5 truncate">
                      {formatIDR(totalNominal)}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                    <div className="text-[10px] text-slate-400">Jumlah Transaksi</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                      {filteredRecords.length} kali
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Pilih Format Unduhan:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isExporting !== null || filteredRecords.length === 0}
                    onClick={handleDownloadPDF}
                    className="flex flex-col items-start p-3.5 rounded-xl border-2 border-rose-200 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/80 text-left transition-all disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Unduh PDF</span>
                      </div>
                      <span className="text-[10px] bg-rose-200/80 text-rose-800 font-bold px-1.5 py-0.5 rounded-md">.pdf</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Dokumen PDF lengkap dengan rekapitulasi per anggota & detail transaksi.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isExporting !== null || filteredRecords.length === 0}
                    onClick={handleDownloadExcel}
                    className="flex flex-col items-start p-3.5 rounded-xl border-2 border-orange-200 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50/80 text-left transition-all disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-orange-100 text-orange-800 group-hover:scale-105 transition-transform">
                          <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Unduh Sheet</span>
                      </div>
                      <span className="text-[10px] bg-orange-200/80 text-orange-900 font-bold px-1.5 py-0.5 rounded-md">.xlsx</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Spreadsheet Excel memuat sheet Rekapitulasi & sheet Detail Transaksi.
                    </p>
                  </button>
                </div>
              </div>

              {filteredRecords.length === 0 && (
                <p className="text-xs text-center text-red-500 pt-1 font-medium">
                  Tidak ada data pengeluaran yang sesuai filter.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-slate-600 rounded-xl"
              >
                Tutup
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
