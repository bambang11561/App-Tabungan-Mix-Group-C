import React, { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatIDR } from "../lib/utils";
import { Wallet, TrendingDown, Users, AlertCircle, Building, Edit2, Check, X, Copy, Download, UserCheck, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { months } from "../data";

export default function Dashboard() {
  const { 
    tabungan, 
    pengeluaran, 
    uangKas,
    pengeluaranKas,
    users, 
    rekening, 
    updateRekening, 
    currentUser 
  } = useAppContext();

  const [isEditingRekening, setIsEditingRekening] = useState(false);
  const [editRekening, setEditRekening] = useState(rekening);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyRekening = () => {
    navigator.clipboard.writeText(rekening.accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const totalMasukTabungan = useMemo(() => tabungan.reduce((sum, t) => sum + t.amount, 0), [tabungan]);
  const totalKeluarTabungan = useMemo(() => pengeluaran.reduce((sum, p) => sum + p.amount, 0), [pengeluaran]);
  const saldoTabungan = totalMasukTabungan - totalKeluarTabungan;

  const totalMasukKas = useMemo(() => uangKas.reduce((sum, t) => sum + t.amount, 0), [uangKas]);
  const totalKeluarKas = useMemo(() => pengeluaranKas.reduce((sum, p) => sum + p.amount, 0), [pengeluaranKas]);
  const saldoKas = totalMasukKas - totalKeluarKas;

  const totalSaldoUtama = saldoTabungan + saldoKas;

  // Personal user balance calculation based on logged in user ID/NRP
  const myTabungan = useMemo(() => {
    if (!currentUser) return 0;
    return tabungan.filter(t => t.userId === currentUser.id).reduce((sum, t) => sum + t.amount, 0);
  }, [tabungan, currentUser]);

  const myKas = useMemo(() => {
    if (!currentUser) return 0;
    return uangKas.filter(k => k.userId === currentUser.id).reduce((sum, k) => sum + k.amount, 0);
  }, [uangKas, currentUser]);

  const myTotalSaldo = myTabungan + myKas;

  const totalPenabung = users.filter(u => u.role === "user").length;

  const dataGrafik = useMemo(() => {
    return months.slice(0, 7).map(month => {
      const msT = tabungan.filter(t => t.month === month).reduce((s, t) => s + t.amount, 0);
      const msK = uangKas.filter(t => t.month === month).reduce((s, t) => s + t.amount, 0);
      return {
        name: month,
        "Setoran Tabungan": msT,
        "Setoran Kas": msK,
      };
    });
  }, [tabungan, uangKas]);

  const belumBayarThisMonth = useMemo(() => {
    const currentMonth = "Jul-26"; // Assuming current logic based on demo data
    const paidUserIds = tabungan.filter(t => t.month === currentMonth).map(t => t.userId);
    return users.filter(u => u.role === "user" && !paidUserIds.includes(u.id));
  }, [tabungan, users]);

  const belumBayarKasThisMonth = useMemo(() => {
    const currentMonth = "Jul-26";
    const paidKasUserIds = uangKas.filter(t => t.month === currentMonth).map(t => t.userId);
    return users.filter(u => u.role === "user" && !paidKasUserIds.includes(u.id));
  }, [uangKas, users]);

  const handleDownloadLaporan = () => {
    const reportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let text = `*RINGKASAN KEUANGAN*\n`;
    text += `*Tanggal:* ${reportDate}\n\n`;

    if (currentUser) {
      text += `*INFO AKUN SAYA*\n`;
      text += `Nama: ${currentUser.nama}\n`;
      text += `NRP: ${currentUser.nrp}\n`;
      text += `Tabungan Saya: ${formatIDR(myTabungan)}\n`;
      text += `Setoran Kas Saya: ${formatIDR(myKas)}\n`;
      text += `Total Akumulasi Saya: ${formatIDR(myTotalSaldo)}\n\n`;
    }

    text += `*SALDO GABUNGAN GROUP*\n`;
    text += `Total Pemasukan Tabungan: ${formatIDR(totalMasukTabungan)}\n`;
    text += `Total Pengeluaran Tabungan: ${formatIDR(totalKeluarTabungan)}\n`;
    text += `Saldo Bersih Tabungan: ${formatIDR(saldoTabungan)}\n\n`;

    text += `Total Pemasukan Kas: ${formatIDR(totalMasukKas)}\n`;
    text += `Total Pengeluaran Kas: ${formatIDR(totalKeluarKas)}\n`;
    text += `Saldo Bersih Kas: ${formatIDR(saldoKas)}\n\n`;
    
    text += `*TOTAL SALDO KESELURUHAN:* ${formatIDR(totalSaldoUtama)}\n\n`;
    
    text += `*Info Rekening Admin*\n`;
    text += `Bank: ${rekening.bankName}\n`;
    text += `No Rek: ${rekening.accountNumber}\n`;
    text += `Atas Nama: ${rekening.accountName}\n\n`;
    
    if (belumBayarThisMonth.length > 0) {
      text += `*Tunggakan Tabungan Bulan Ini:* ${belumBayarThisMonth.length} Orang\n`;
      belumBayarThisMonth.forEach(u => {
        text += `- ${u.nama}\n`;
      });
      text += `\n`;
    }

    if (belumBayarKasThisMonth.length > 0) {
      text += `*Tunggakan Kas Bulan Ini:* ${belumBayarKasThisMonth.length} Orang\n`;
      belumBayarKasThisMonth.forEach(u => {
        text += `- ${u.nama}\n`;
      });
      text += `\n`;
    }

    if (belumBayarThisMonth.length > 0 || belumBayarKasThisMonth.length > 0) {
      text += `Mohon untuk segera melunasi. Terima kasih. 🙏\n`;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Keuangan_${reportDate.replace(/ /g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Utama</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ringkasan informasi saldo dan akun terhubung</p>
        </div>
        <Button onClick={handleDownloadLaporan} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
          <Download className="h-4 w-4" />
          Unduh Laporan
        </Button>
      </div>
      
      {/* User Information & Personal Balance Card */}
      {currentUser && (
        <div className="bg-gradient-to-r from-[#0E1B3D] via-slate-800 to-blue-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden border border-slate-700/50">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 shrink-0 border border-white/20">
                {currentUser.nama.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <UserCheck className="w-3 h-3" />
                    {currentUser.role === "admin" ? "Administrator" : "Anggota Group"}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{currentUser.nama}</h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-2">
                  <span>NRP:</span>
                  <span className="font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">{currentUser.nrp}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="px-2">
                <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Tabungan Saya</p>
                <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">{formatIDR(myTabungan)}</p>
              </div>
              <div className="px-2 sm:border-l border-white/15">
                <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Setoran Kas Saya</p>
                <p className="text-base sm:text-lg font-black text-indigo-300 mt-0.5">{formatIDR(myKas)}</p>
              </div>
              <div className="px-2 sm:border-l border-white/15">
                <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Total Akumulasi Saya</p>
                <p className="text-base sm:text-lg font-black text-white mt-0.5">{formatIDR(myTotalSaldo)}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Saldo Gabungan</p>
          <h3 className="text-xl sm:text-2xl font-black text-blue-600">{formatIDR(totalSaldoUtama)}</h3>
          <div className="mt-2 flex items-center text-[10px] text-blue-400 font-bold uppercase">
            <span>Tabungan & Kas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Saldo Tabungan</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{formatIDR(saldoTabungan)}</p>
          <div className="mt-2 flex items-center text-[10px] text-emerald-400 font-bold uppercase">
            <span>Simpanan Anggota</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Saldo Kas</p>
          <p className="text-xl sm:text-2xl font-black text-indigo-600">{formatIDR(saldoKas)}</p>
          <div className="mt-2 flex items-center text-[10px] text-indigo-400 font-bold uppercase">
            <span>Kas Bersama</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Belum Membayar</p>
          <p className="text-xl sm:text-2xl font-black text-red-500">{belumBayarThisMonth.length} <span className="text-sm text-slate-400 font-normal underline">Orang</span></p>
          <div className="mt-2 flex items-center text-[10px] text-red-400 font-bold uppercase">
            <span>Tunggakan Tabungan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Belum Membayar</p>
          <p className="text-xl sm:text-2xl font-black text-red-500">{belumBayarKasThisMonth.length} <span className="text-sm text-slate-400 font-normal underline">Orang</span></p>
          <div className="mt-2 flex items-center text-[10px] text-red-400 font-bold uppercase">
            <span>Tunggakan Kas</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 flex flex-col">
          <CardHeader>
            <CardTitle>Grafik Pemasukan (Tabungan & Kas)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px]">
            <div className="h-full w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGrafik}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                    width={60}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: number, name: string) => [formatIDR(value), name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="Setoran Tabungan" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Setoran Kas" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-[#2D3142] text-white rounded-2xl shadow-lg p-6 relative overflow-hidden flex-1">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 mb-1">Rekening Admin Utama ({rekening.bankName})</p>
                  {currentUser?.role === "admin" && (
                    <button onClick={() => { setIsEditingRekening(!isEditingRekening); setEditRekening(rekening); }} className="text-slate-400 hover:text-white transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {isEditingRekening ? (
                  <div className="space-y-3 mt-4">
                    <Input 
                      placeholder="Bank" 
                      value={editRekening.bankName} 
                      onChange={(e) => setEditRekening({...editRekening, bankName: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 text-sm"
                    />
                    <Input 
                      placeholder="No Rekening" 
                      value={editRekening.accountNumber} 
                      onChange={(e) => setEditRekening({...editRekening, accountNumber: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 font-mono text-sm"
                    />
                    <Input 
                      placeholder="Atas Nama" 
                      value={editRekening.accountName} 
                      onChange={(e) => setEditRekening({...editRekening, accountName: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 text-sm"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingRekening(false)} className="text-white hover:bg-white/10 hover:text-white">Batal</Button>
                      <Button size="sm" onClick={() => { updateRekening(editRekening); setIsEditingRekening(false); }} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <div className="flex items-center gap-3"><h4 className="text-xl sm:text-2xl font-mono tracking-widest">{rekening.accountNumber}</h4><Button variant="ghost" size="icon" onClick={handleCopyRekening} className="h-8 w-8 text-white hover:bg-white/10 hover:text-white relative group" title="Klik untuk Salin">{isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}<span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">{isCopied ? "Disalin!" : "Klik untuk Salin"}</span></Button></div>
                    </div>
                    <p className="text-sm mt-3">a/n <span className="font-bold">{rekening.accountName}</span></p>
                  </>
                )}
              </div>
              
              {!isEditingRekening && (
                <p className="text-[10px] text-slate-400 mt-6 leading-relaxed">
                  * Harap konfirmasi ke admin setelah transfer.
                </p>
              )}
            </div>
            
            {/* Decorative circle */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Tables for Belum Bayar */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Belum Membayar Tabungan (Jul-26)</CardTitle>
          </CardHeader>
          <CardContent>
            {belumBayarThisMonth.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {belumBayarThisMonth.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div className="flex flex-col">
                            <span>{user.nama}</span>
                            <span className="font-mono text-xs text-slate-500 font-normal">{user.nrp}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                            Belum Bayar
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Semua anggota sudah membayar tabungan bulan ini.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Belum Membayar Kas (Jul-26)</CardTitle>
          </CardHeader>
          <CardContent>
            {belumBayarKasThisMonth.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {belumBayarKasThisMonth.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div className="flex flex-col">
                            <span>{user.nama}</span>
                            <span className="font-mono text-xs text-slate-500 font-normal">{user.nrp}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                            Belum Bayar
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Semua anggota sudah membayar kas bulan ini.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
