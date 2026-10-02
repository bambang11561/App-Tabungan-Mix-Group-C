import React, { useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { formatIDR } from "../../lib/utils";
import { ArrowUpCircle, Trash2, AlertCircle, AlertTriangle } from "lucide-react";
import DownloadPengeluaranMenu from "../../components/DownloadPengeluaranMenu";

export default function PengeluaranTabungan() {
  const { 
    pengeluaran, 
    tabungan,
    users,
    currentUser, 
    addPengeluaran,
    deletePengeluaran
  } = useAppContext();

  // State for Add Pengeluaran
  const [selectedUserId, setSelectedUserId] = useState("");
  const [descKeluar, setDescKeluar] = useState("");
  const [amountKeluar, setAmountKeluar] = useState("");
  const [tanggalKeluar, setTanggalKeluar] = useState(new Date().toISOString().split('T')[0]);

  // Member list sorted by smallest NRP
  const penabungList = useMemo(() => {
    return users
      .filter(u => u.role === "user")
      .sort((a, b) => a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: 'base' }));
  }, [users]);

  // Selected member information & balance calculation
  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId);
  }, [users, selectedUserId]);

  const selectedUserBalance = useMemo(() => {
    if (!selectedUserId) return { masuk: 0, keluar: 0, sisa: 0 };
    const masuk = tabungan.filter(t => t.userId === selectedUserId).reduce((s, t) => s + t.amount, 0);
    const keluar = pengeluaran.filter(p => p.userId === selectedUserId).reduce((s, p) => s + p.amount, 0);
    return {
      masuk,
      keluar,
      sisa: masuk - keluar
    };
  }, [selectedUserId, tabungan, pengeluaran]);

  const handleAddPengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && descKeluar && amountKeluar && tanggalKeluar) {
      const nominal = Number(amountKeluar);
      if (nominal <= 0) {
        alert("Nominal pengeluaran harus lebih besar dari 0!");
        return;
      }

      addPengeluaran({
        userId: selectedUserId,
        description: descKeluar,
        amount: nominal,
        date: new Date(tanggalKeluar).toISOString()
      });
      setSelectedUserId("");
      setDescKeluar("");
      setAmountKeluar("");
      alert("Pengeluaran tabungan anggota berhasil dicatat dan terpotong dari saldo anggota!");
    }
  };

  const rawHistory = useMemo(() => {
    return pengeluaran.map(p => {
      const u = users.find(user => user.id === p.userId);
      return {
        ...p,
        userName: u?.nama || "Umum",
        userNrp: u?.nrp || "-",
        timestamp: new Date(p.date).getTime()
      };
    });
  }, [pengeluaran, users]);

  const history = useMemo(() => {
    return (currentUser?.role === "admin"
      ? rawHistory
      : rawHistory.filter(p => p.userId === currentUser?.id)
    ).sort((a, b) => b.timestamp - a.timestamp);
  }, [rawHistory, currentUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengeluaran Tabungan</h1>
        <p className="text-sm text-slate-500">Kelola dan catat pengeluaran/penarikan tabungan anggota yang terintegrasi langsung ke saldo perorangan.</p>
      </div>

      {currentUser?.role !== "admin" && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Menampilkan riwayat penarikan tabungan khusus milik akun Anda (NRP: <strong className="font-mono text-amber-950">{currentUser?.nrp}</strong>).</span>
        </div>
      )}

      {currentUser?.role === "admin" && (
        <Card>
          <CardHeader className="bg-orange-50/50 border-b border-orange-100 rounded-t-2xl pb-4">
            <div className="flex items-center space-x-2">
              <ArrowUpCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Catat Pengeluaran Tabungan Anggota</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddPengeluaran} className="space-y-4">
              {/* Member Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nama Anggota (NRP - Nama Penabung)
                </label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-colors hover:bg-slate-50"
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>Pilih Anggota Penabung...</option>
                  {penabungList.map(u => {
                    const uMasuk = tabungan.filter(t => t.userId === u.id).reduce((s, t) => s + t.amount, 0);
                    const uKeluar = pengeluaran.filter(p => p.userId === u.id).reduce((s, p) => s + p.amount, 0);
                    const uSaldo = uMasuk - uKeluar;
                    return (
                      <option key={u.id} value={u.id}>
                        {u.nrp} - {u.nama} (Saldo: {formatIDR(uSaldo)})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dynamic Member Balance Card */}
              {selectedUser && (
                <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span>{selectedUser.nama}</span>
                      <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-orange-200 text-[11px]">
                        NRP: {selectedUser.nrp}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-1 space-x-2">
                      <span>Total Masuk: <strong className="text-emerald-700">{formatIDR(selectedUserBalance.masuk)}</strong></span>
                      <span>•</span>
                      <span>Total Ditarik: <strong className="text-orange-700">{formatIDR(selectedUserBalance.keluar)}</strong></span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Sisa Saldo Tabungan</div>
                    <div className={`text-base font-extrabold ${selectedUserBalance.sisa < Number(amountKeluar) ? "text-red-600" : "text-emerald-700"}`}>
                      {formatIDR(selectedUserBalance.sisa)}
                    </div>
                  </div>
                </div>
              )}

              {/* Overdraft Warning if amount > balance */}
              {selectedUser && amountKeluar && Number(amountKeluar) > selectedUserBalance.sisa && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peringatan Saldo Kurang:</strong> Nominal pengeluaran ({formatIDR(Number(amountKeluar))}) melebihi sisa saldo tabungan milik <strong>{selectedUser.nama}</strong> ({formatIDR(selectedUserBalance.sisa)}).
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan Pengeluaran / Penarikan</label>
                <Input 
                  placeholder="Contoh: Pencairan tabungan pribadi, penarikan hari raya..."
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Penarikan (Rp)</label>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="Contoh: 150000"
                    value={amountKeluar}
                    onChange={(e) => setAmountKeluar(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="destructive" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Simpan Pengeluaran (Potong Saldo Anggota)
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Riwayat Pengeluaran Tabungan</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser?.role === "admin"
                ? `Total ${history.length} pengeluaran tabungan tercatat.`
                : `Menampilkan ${history.length} pengeluaran tabungan akun Anda.`}
            </p>
          </div>
          <DownloadPengeluaranMenu 
            title="Riwayat Pengeluaran Tabungan"
            records={rawHistory}
            allUsers={users}
            currentUser={currentUser}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-100 mt-2">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">NRP</th>
                  <th className="px-6 py-4">Anggota Penabung</th>
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
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 font-bold">
                      {t.userNrp}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <span>{t.userName}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span>{t.description}</span>
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
                            if (window.confirm("Apakah Anda yakin ingin menghapus transaksi pengeluaran ini? Saldo tabungan anggota akan dikembalikan.")) {
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
                    <td colSpan={currentUser?.role === "admin" ? 6 : 5} className="px-6 py-8 text-center text-slate-400 font-medium">
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
