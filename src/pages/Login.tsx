import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { WalletCards } from "lucide-react";

export default function Login() {
  const [nrp, setNrp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nrp.trim()) {
      setError("NRP / ID tidak boleh kosong");
      return;
    }

    const success = login(nrp.trim(), password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Kredensial tidak valid. Periksa NRP/ID dan Kata Sandi.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA] p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-slate-100 rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <CardHeader className="space-y-2 text-center pb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-blue-50 p-4">
              <WalletCards className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-800">
            App Tabungan & Kas Mix Group C
          </CardTitle>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Login ke akun Anda
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="nrp" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                NRP / ID Pengguna
              </label>
              <Input
                id="nrp"
                type="text"
                placeholder="Contoh: admin"
                value={nrp}
                onChange={(e) => {
                  setNrp(e.target.value);
                  setError("");
                }}
                className="h-12 bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kata Sandi <span className="text-slate-400 font-normal lowercase">(kosongkan jika user biasa)</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="h-12 bg-slate-50"
              />
              {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full text-base">
              Masuk Sistem
            </Button>
          </form>
          
          <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4 text-center text-xs text-slate-500">
            <p className="font-bold uppercase tracking-wider mb-2 text-slate-400">Login Aplikasi</p>
            <p>Admin: <span className="font-black text-slate-700 bg-white px-2 py-1 rounded shadow-sm">admin</span> (Sandi: <span className="font-black text-slate-700 bg-white px-2 py-1 rounded shadow-sm">********</span>)</p>
            <p className="mt-2">User: <span className="font-black text-slate-700 bg-white px-2 py-1 rounded shadow-sm">NRP</span> (Tanpa sandi)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
