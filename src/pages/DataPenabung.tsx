import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { formatIDR } from "../lib/utils";
import { Search, UserPlus, Trash2, Pencil } from "lucide-react";

export default function DataPenabung() {
  const { users, tabungan, currentUser, deleteUser, addUser, editUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ nrp: "", nama: "" });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nrp: "", nama: "" });

  const penabungList = users.filter(u => u.role === "user");

  const filteredData = useMemo(() => {
    return penabungList
      .filter(u => 
        u.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.nrp.includes(searchTerm)
      )
      .map(user => {
        const userTabungan = tabungan.filter(t => t.userId === user.id);
        const totalAmount = userTabungan.reduce((sum, t) => sum + t.amount, 0);
        return {
          ...user,
          totalAmount,
          history: userTabungan
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [penabungList, tabungan, searchTerm]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.nrp && newUser.nama) {
      addUser({
        nrp: newUser.nrp,
        nama: newUser.nama.toUpperCase(),
        role: "user"
      });
      setNewUser({ nrp: "", nama: "" });
      setShowAddForm(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({ nrp: user.nrp, nama: user.nama });
  };

  const handleEditSubmit = () => {
    if (editingUserId && editForm.nrp && editForm.nama) {
      editUser(editingUserId, {
        nrp: editForm.nrp,
        nama: editForm.nama.toUpperCase()
      });
      setEditingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Penabung</h1>
          <p className="text-sm text-slate-500">Daftar anggota dan total tabungan masing-masing.</p>
        </div>
        {currentUser?.role === "admin" && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Button>
        )}
      </div>

      {showAddForm && currentUser?.role === "admin" && (
        <Card className="border-blue-100 bg-white">
          <CardContent className="pt-6">
            <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1 w-full">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NRP / NIK</label>
                <Input 
                  placeholder="Masukkan NRP..." 
                  value={newUser.nrp}
                  onChange={(e) => setNewUser({...newUser, nrp: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2 flex-1 w-full">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                <Input 
                  placeholder="Masukkan Nama..." 
                  value={newUser.nama}
                  onChange={(e) => setNewUser({...newUser, nama: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Daftar Anggota</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Cari nama atau NRP..."
                className="pl-9 bg-slate-50/50 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">NRP</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4 text-right">Total Tabungan</th>
                  {currentUser?.role === "admin" && (
                    <th className="px-6 py-4 text-center">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.map((user, index) => (
                    editingUserId === user.id ? (
                      <tr key={user.id} className="bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input 
                            value={editForm.nrp} 
                            onChange={(e) => setEditForm({...editForm, nrp: e.target.value})}
                            className="h-8 max-w-[120px]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input 
                            value={editForm.nama} 
                            onChange={(e) => setEditForm({...editForm, nama: e.target.value})}
                            className="h-8 max-w-[200px]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-blue-600">
                          {formatIDR(user.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-1">
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={handleEditSubmit}
                            className="h-8 text-xs"
                          >
                            Simpan
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingUserId(null)}
                            className="h-8 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Batal
                          </Button>
                        </td>
                      </tr>
                    ) : (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500">{user.nrp}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{user.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-black text-blue-600">
                        {formatIDR(user.totalAmount)}
                      </td>
                      {currentUser?.role === "admin" && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(user)}
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 rounded-lg mr-1"
                            title="Edit Anggota"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              if (window.confirm(`Yakin ingin menghapus ${user.nama}? Semua data tabungannya juga akan terhapus.`)) {
                                deleteUser(user.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                            title="Hapus Anggota"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={currentUser?.role === "admin" ? 5 : 4} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data penabung ditemukan.
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
