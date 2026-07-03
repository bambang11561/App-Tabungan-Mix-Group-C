import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { formatIDR } from "../lib/utils";
import { months } from "../data";
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";

export default function Transaksi() {
  const { 
    tabungan, 
    pengeluaran, 
    users, 
    currentUser, 
    addTabungan, 
    addPengeluaran,
    deleteTabungan,
    deletePengeluaran
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<"pemasukan" | "pengeluaran">("pemasukan");

  // State for Add Pemasukan
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [amountMasuk, setAmountMasuk] = useState("50000");
  const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split('T')[0]);

  // State for Add Pengeluaran
  const [descKeluar, setDescKeluar] = useState("");
  const [amountKeluar, setAmountKeluar] = useState("");
  const [tanggalKeluar, setTanggalKeluar] = useState(new Date().toISOString().split('T')[0]);

  const penabungList = users.filter(u => u.role === "user");

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

  const handleAddPengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (descKeluar && amountKeluar && tanggalKeluar) {
      addPengeluaran({
        description: descKeluar,
        amount: Number(amountKeluar),
        date: new Date(tanggalKeluar).toISOString()
      });
      setDescKeluar("");
      setAmountKeluar("");
      alert("Pengeluaran berhasil dicatat!");
    }
  };

  // Prepare combined history for view
  const combinedHistory = [
    ...tabungan.map(t => ({
      ...t,
      type: "masuk",
      userName: users.find(u => u.id === t.userId)?.nama || "Unknown",
      timestamp: new Date(t.date).getTime()
    })),
    ...pengeluaran.map(p => ({
      ...p,
      type: "keluar",
      userName: "Admin",
      timestamp: new Date(p.date).getTime()
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50); // Show last 50 transactions

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaksi</h1>
        <p className="text-sm text-slate-500">Kelola setoran tabungan dan pengeluaran.</p>
      </div>

      {currentUser?.role === "admin" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-2xl pb-4">
              <div className="flex items-center space-x-2">
                <ArrowDownCircle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-900">Catat Setoran (Pemasukan)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddPemasukan} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anggota (NRP - Nama)</label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors hover:bg-slate-50"
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
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors hover:bg-slate-50"
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
                <Button type="submit" className="w-full">Simpan Setoran</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-red-50/50 border-b border-red-100 rounded-t-2xl pb-4">
              <div className="flex items-center space-x-2">
                <ArrowUpCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900">Catat Pengeluaran</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddPengeluaran} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan Pengeluaran</label>
                  <Input 
                    placeholder="Contoh: Beli buku tabungan..."
                    value={descKeluar}
                    onChange={(e) => setDescKeluar(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</label>
                    <Input 
                      type="date" 
                      value={tanggalKeluar}
                      onChange={(e) => setTanggalKeluar(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah (Rp)</label>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="Contoh: 150000"
                      value={amountKeluar}
                      onChange={(e) => setAmountKeluar(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="destructive" className="w-full">Simpan Pengeluaran</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
          <div className="flex space-x-4 mt-4 border-b border-slate-100">
            <button 
              className={`pb-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'pemasukan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              onClick={() => setActiveTab('pemasukan')}
            >
              Pemasukan
            </button>
            <button 
              className={`pb-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'pengeluaran' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              onClick={() => setActiveTab('pengeluaran')}
            >
              Pengeluaran
            </button>
          </div>
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
                {combinedHistory
                  .filter(t => activeTab === 'pemasukan' ? t.type === 'masuk' : t.type === 'keluar')
                  .map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {t.type === 'masuk' ? (
                        <span>Setoran {t.userName} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2 bg-slate-100 px-2 py-0.5 rounded-md">({t.month})</span></span>
                      ) : (
                        <span>{t.description} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2 bg-slate-100 px-2 py-0.5 rounded-md">({new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})</span></span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-black ${t.type === 'masuk' ? 'text-blue-600' : 'text-red-500'}`}>
                      {t.type === 'masuk' ? '+' : '-'}{formatIDR(t.amount)}
                    </td>
                    {currentUser?.role === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                          onClick={() => {
                            if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
                              if (t.type === 'masuk') deleteTabungan(t.id);
                              else deletePengeluaran(t.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {combinedHistory.filter(t => activeTab === 'pemasukan' ? t.type === 'masuk' : t.type === 'keluar').length === 0 && (
                  <tr>
                    <td colSpan={currentUser?.role === "admin" ? 4 : 3} className="px-6 py-8 text-center text-slate-400 font-medium">
                      Belum ada data transaksi.
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
