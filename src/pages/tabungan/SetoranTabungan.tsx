import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { formatIDR } from "../../lib/utils";
import { months } from "../../data";
import { ArrowDownCircle, Trash2, AlertCircle } from "lucide-react";

export default function SetoranTabungan() {
  const { 
    tabungan, 
    users, 
    currentUser, 
    addTabungan, 
    deleteTabungan
  } = useAppContext();

  // State for Add Pemasukan
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [amountMasuk, setAmountMasuk] = useState("50000");
  const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split('T')[0]);

  const penabungList = users
    .filter(u => u.role === "user")
    .sort((a, b) => a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: 'base' }));

  const handleAddPemasukan = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && selectedMonth && amountMasuk && tanggalMasuk) {
      addTabungan({
        userId: selectedUserId,
        month: selectedMonth,
        amount: Number(amountMasuk),
        date: new Date(tanggalMasuk).toISOString()
      });
      setSelectedUserId("");
      alert("Setoran tabungan berhasil dicatat!");
    }
  };

  const rawHistory = tabungan.map(t => ({
    ...t,
    type: "masuk",
    userName: users.find(u => u.id === t.userId)?.nama || "Unknown",
    timestamp: new Date(t.date).getTime()
  }));

  const history = (currentUser?.role === "admin"
    ? rawHistory
    : rawHistory.filter(t => t.userId === currentUser?.id)
  ).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catatan Setoran Tabungan</h1>
        <p className="text-sm text-slate-500">Kelola riwayat setoran tabungan anggota.</p>
      </div>

      {currentUser?.role !== "admin" && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Menampilkan riwayat setoran tabungan khusus milik akun Anda (NRP: <strong className="font-mono text-amber-950">{currentUser?.nrp}</strong>).</span>
        </div>
      )}

      {currentUser?.role === "admin" && (
        <Card>
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 rounded-t-2xl pb-4">
            <div className="flex items-center space-x-2">
              <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-emerald-900">Catat Setoran Tabungan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddPemasukan} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anggota (NRP - Nama)</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors hover:bg-slate-50"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Anggota...</option>
                  {penabungList.map(u => (
                    <option key={u.id} value={u.id}>{u.nrp} - {u.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</label>
                  <Input 
                    type="date" 
                    value={tanggalMasuk}
                    onChange={(e) => setTanggalMasuk(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bulan Tagihan</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors hover:bg-slate-50"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah (Rp)</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={amountMasuk}
                    onChange={(e) => setAmountMasuk(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Simpan Setoran</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Setoran Tabungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-100 mt-2">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Keterangan / Anggota</th>
                  <th className="px-6 py-4 text-right">Jumlah</th>
                  {currentUser?.role === "admin" && <th className="px-6 py-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <span>Setoran {t.userName} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2 bg-slate-100 px-2 py-0.5 rounded-md">({t.month})</span></span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-emerald-600">
                      +{formatIDR(t.amount)}
                    </td>
                    {currentUser?.role === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                          onClick={() => {
                            if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
                              deleteTabungan(t.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={currentUser?.role === "admin" ? 4 : 3} className="px-6 py-8 text-center text-slate-400 font-medium">
                      Belum ada data setoran tabungan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
