import React, { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { formatIDR } from "../../lib/utils";
import { Lock, AlertCircle } from "lucide-react";

export default function SaldoTabungan() {
  const { users, tabungan, pengeluaran, currentUser } = useAppContext();

  const totalPemasukan = tabungan.reduce((sum, t) => sum + t.amount, 0);
  const totalPengeluaran = pengeluaran.reduce((sum, p) => sum + p.amount, 0);
  const totalSaldoKeseluruhan = totalPemasukan - totalPengeluaran;

  const usersSaldo = useMemo(() => {
    return users.filter(u => u.role === "user").map(u => {
      const userTabungan = tabungan.filter(t => t.userId === u.id);
      const total = userTabungan.reduce((sum, t) => sum + t.amount, 0);
      return { ...u, total };
    }).sort((a, b) => a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: 'base' }));
  }, [users, tabungan]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saldo Tabungan</h1>
        <p className="text-sm text-slate-500">Lihat total saldo tabungan anggota.</p>
      </div>

      {currentUser?.role !== "admin" && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Sesuai kebijakan privasi, Anda hanya dapat melihat saldo tabungan milik NRP Anda (<strong>{currentUser?.nrp}</strong>). Saldo anggota lain disembunyikan.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Total Pemasukan</p>
            <h3 className="text-2xl font-bold text-emerald-900">{formatIDR(totalPemasukan)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-100">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-orange-900">{formatIDR(totalPengeluaran)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Total Saldo Bersih</p>
            <h3 className="text-2xl font-bold text-blue-900">{formatIDR(totalSaldoKeseluruhan)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saldo Tabungan Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">NRP</th>
                  <th className="px-6 py-4">Nama Anggota</th>
                  <th className="px-6 py-4 text-right">Total Tabungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersSaldo.map((u) => {
                  const isSelfOrAdmin = currentUser?.role === "admin" || u.id === currentUser?.id || u.nrp === currentUser?.nrp;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.id === currentUser?.id ? "bg-emerald-50/30" : ""}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono">
                        {u.nrp}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                        <span>{u.nama}</span>
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Saya</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-black">
                        {isSelfOrAdmin ? (
                          <span className="text-emerald-600">{formatIDR(u.total)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-mono text-xs font-normal bg-slate-100 px-2.5 py-1 rounded-md">
                            <Lock className="w-3 h-3 text-slate-400" />
                            *** (Rahasia)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
