import React, { useState, useMemo } from "react";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  X, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Button } from "./ui/button";
import { formatIDR } from "../lib/utils";
import { User } from "../types";
import { 
  SetoranRecord, 
  exportSetoranToExcel, 
  exportSetoranToPDF,
  generateMemberRecap 
} from "../lib/exportSetoran";
import { months } from "../data";

interface DownloadSetoranMenuProps {
  title: string;
  category: "tabungan" | "kas";
  records: SetoranRecord[];
  allUsers: User[];
  currentUser: User | null;
}

export default function DownloadSetoranMenu({
  title,
  category,
  records,
  allUsers,
  currentUser,
}: DownloadSetoranMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  // Available users for filtering (only active member users)
  const penabungList = useMemo(() => {
    return allUsers
      .filter(u => u.role === "user")
      .sort((a, b) => a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: "base" }));
  }, [allUsers]);

  // Accessible records according to permissions
  const accessibleRecords = useMemo(() => {
    if (currentUser?.role === "admin") {
      return records;
    }
    return records.filter(r => r.userId === currentUser?.id);
  }, [records, currentUser]);

  // Filtered records based on dialog settings
  const filteredRecords = useMemo(() => {
    return accessibleRecords.filter(r => {
      const matchMonth = selectedMonth === "all" || r.month === selectedMonth;
      const matchUser = selectedUserId === "all" || r.userId === selectedUserId;
      return matchMonth && matchUser;
    });
  }, [accessibleRecords, selectedMonth, selectedUserId]);

  const totalNominal = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [filteredRecords]);

  const recapData = useMemo(() => {
    return generateMemberRecap(filteredRecords, allUsers, currentUser);
  }, [filteredRecords, allUsers, currentUser]);

  const handleDownloadPDF = async () => {
    setIsExporting("pdf");
    try {
      // Build title with filter context if applied
      let reportTitle = title;
      if (selectedMonth !== "all") {
        reportTitle += ` - Bulan ${selectedMonth}`;
      }
      if (selectedUserId !== "all") {
        const u = allUsers.find(user => user.id === selectedUserId);
        if (u) reportTitle += ` (${u.nama} - NRP: ${u.nrp})`;
      }

      exportSetoranToPDF({
        title: reportTitle,
        category,
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
      if (selectedMonth !== "all") {
        reportTitle += ` - Bulan ${selectedMonth}`;
      }
      if (selectedUserId !== "all") {
        const u = allUsers.find(user => user.id === selectedUserId);
        if (u) reportTitle += ` (${u.nama} - NRP: ${u.nrp})`;
      }

      exportSetoranToExcel({
        title: reportTitle,
        category,
        records: filteredRecords,
        allUsers,
        currentUser,
      });
      setIsOpen(false);
    } catch (err) {
      console.error("Gagal mengekspor Excel/Sheet:", err);
      alert("Terjadi kesalahan saat mengunduh spreadsheet Excel.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <>
      {/* Quick Action Button Group */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 shadow-xs rounded-xl text-xs font-semibold px-3 py-1.5 transition-all"
        >
          <Download className="h-3.5 w-3.5 text-emerald-600" />
          <span>Unduh Laporan</span>
          <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
        </Button>

        {/* Quick One-Click PDF */}
        <Button
          type="button"
          size="sm"
          onClick={() => {
            exportSetoranToPDF({
              title,
              category,
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

        {/* Quick One-Click Sheet */}
        <Button
          type="button"
          size="sm"
          onClick={() => {
            exportSetoranToExcel({
              title,
              category,
              records: accessibleRecords,
              allUsers,
              currentUser,
            });
          }}
          className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-semibold px-3 py-1.5 shadow-xs transition-colors"
          title="Unduh langsung format Sheet/Excel"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Sheet (Excel)</span>
        </Button>
      </div>

      {/* Modal Dialog for Custom Download & Preview */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-emerald-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Unduh Riwayat & Detail Setoran</h3>
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

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              
              {/* Privacy Notice for Regular Users */}
              {currentUser?.role !== "admin" ? (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    File unduhan Anda akan memuat rincian dan total setoran khusus milik akun Anda (NRP: <strong>{currentUser?.nrp}</strong> - {currentUser?.nama}).
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    File unduhan mencakup <strong>Rekapitulasi Total Setoran Setiap Anggota</strong> (berurutan dari NRP terkecil) serta <strong>Detail Seluruh Riwayat Transaksi</strong>.
                  </span>
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Filter Month */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Filter Bulan</span>
                  </label>
                  <select
                    className="flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="all">Semua Bulan Tagihan</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Member (Admin Only) */}
                {currentUser?.role === "admin" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>Filter Anggota</span>
                    </label>
                    <select
                      className="flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
              </div>

              {/* Data Summary Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ringkasan Data Yang Akan Diunduh:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                    <div className="text-[10px] text-slate-400">Total Setoran</div>
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-0.5 truncate">
                      {formatIDR(totalNominal)}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                    <div className="text-[10px] text-slate-400">Transaksi</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                      {filteredRecords.length} setoran
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                    <div className="text-[10px] text-slate-400">Anggota</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                      {currentUser?.role === "admin" ? `${recapData.length} orang` : "1 orang"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Option Buttons */}
              <div className="pt-2 space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Pilih Format Unduhan:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Button PDF */}
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
                      Dokumen rapi siap cetak dengan tabel ringkasan per anggota & detail transaksi.
                    </p>
                  </button>

                  {/* Button Excel / Sheet */}
                  <button
                    type="button"
                    disabled={isExporting !== null || filteredRecords.length === 0}
                    onClick={handleDownloadExcel}
                    className="flex flex-col items-start p-3.5 rounded-xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 text-left transition-all disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform">
                          <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Unduh Sheet</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.5 rounded-md">.xlsx</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format spreadsheet Excel dengan 2 sheet (Rekap Per Anggota & Detail Transaksi).
                    </p>
                  </button>
                </div>
              </div>

              {filteredRecords.length === 0 && (
                <p className="text-xs text-center text-red-500 pt-1 font-medium">
                  Tidak ada data setoran yang cocok dengan filter yang dipilih.
                </p>
              )}

            </div>

            {/* Modal Footer */}
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
