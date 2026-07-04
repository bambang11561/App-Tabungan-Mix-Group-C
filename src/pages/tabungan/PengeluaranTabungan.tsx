import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { formatIDR } from "../../lib/utils";
import { ArrowUpCircle, Trash2 } from "lucide-react";

export default function PengeluaranTabungan() {
  const { 
    pengeluaran, 
    currentUser, 
    addPengeluaran,
    deletePengeluaran
  } = useAppContext();

  // State for Add Pengeluaran
  const [descKeluar, setDescKeluar] = useState("");
  const [amountKeluar, setAmountKeluar] = useState("");
  const [tanggalKeluar, setTanggalKeluar] = useState(new Date().toISOString().split('T')[0]);

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
      alert("Pengeluaran tabungan berhasil dicatat!");
    }
  };

  const history = pengeluaran.map(p => ({
    ...p,
    type: "keluar",
    userName: "Admin",
    timestamp: new Date(p.date).getTime()
  })).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengeluaran Tabungan</h1>
        <p className="text-sm text-slate-500">Kelola dan catat pengeluaran tabungan (pencairan/penarikan).</p>
      </div>

      {currentUser?.role === "admin" && (
        <Card>
          <CardHeader className="bg-orange-50/50 border-b border-orange-100 rounded-t-2xl pb-4">
            <div className="flex items-center space-x-2">
              <ArrowUpCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Catat Pengeluaran Tabungan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddPengeluaran} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan Pengeluaran</label>
                <Input 
                  placeholder="Contoh: Pencairan tabungan Budi..."
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
              <Button type="submit" variant="destructive" className="w-full bg-orange-600 hover:bg-orange-700">Simpan Pengeluaran</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengeluaran Tabungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-100 mt-2">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Keterangan</th>
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
                      <span>{t.description} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2 bg-slate-100 px-2 py-0.5 rounded-md">({new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})</span></span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-orange-500">
                      -{formatIDR(t.amount)}
                    </td>
                    {currentUser?.role === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                          onClick={() => {
                            if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
                              deletePengeluaran(t.id);
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
                      Belum ada data pengeluaran tabungan.
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
