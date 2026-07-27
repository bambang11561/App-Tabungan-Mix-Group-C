import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { UserPlus, Pencil, Trash2, X, Check } from "lucide-react";

export default function DataKasMixing() {
  const { users, currentUser, addUser, editUser, deleteUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ nrp: "", nama: "" });

  const penabungList = users.filter(u => u.role === "user");
  const filteredUsers = penabungList
    .filter(u => 
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.nrp.includes(searchTerm)
    )
    .sort((a, b) => a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: 'base' }));

  const handleSaveAdd = () => {
    if (formData.nrp && formData.nama) {
      addUser({ nrp: formData.nrp, nama: formData.nama.toUpperCase(), role: "user" });
      setFormData({ nrp: "", nama: "" });
      setIsAdding(false);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (formData.nrp && formData.nama) {
      editUser(id, { nrp: formData.nrp, nama: formData.nama.toUpperCase() });
      setEditingId(null);
      setFormData({ nrp: "", nama: "" });
    }
  };

  const startEdit = (user: any) => {
    setFormData({ nrp: user.nrp, nama: user.nama });
    setEditingId(user.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nrp: "", nama: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Anggota Kas</h1>
          <p className="text-sm text-slate-500">Kelola daftar anggota untuk kas mixing.</p>
        </div>
        {currentUser?.role === "admin" && (
          <Button 
            onClick={() => { setIsAdding(true); setFormData({ nrp: "", nama: "" }); }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Anggota
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <CardTitle>Daftar Anggota Kas</CardTitle>
          <div className="w-full sm:w-64">
            <Input 
              placeholder="Cari NRP atau Nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">NRP</th>
                  <th className="px-6 py-4">Nama Anggota</th>
                  {currentUser?.role === "admin" && <th className="px-6 py-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isAdding && (
                  <tr className="bg-blue-50/50">
                    <td className="px-6 py-4">-</td>
                    <td className="px-6 py-4">
                      <Input 
                        placeholder="NRP" 
                        value={formData.nrp} 
                        onChange={e => setFormData({...formData, nrp: e.target.value})}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        placeholder="NAMA LENGKAP" 
                        value={formData.nama} 
                        onChange={e => setFormData({...formData, nama: e.target.value})}
                        className="h-8 text-xs uppercase"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="icon" variant="ghost" onClick={handleSaveAdd} className="h-8 w-8 text-green-600 hover:bg-green-100">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8 text-slate-400 hover:bg-slate-100">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
                
                {filteredUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium">{index + 1}</td>
                    
                    {editingId === u.id ? (
                      <>
                        <td className="px-6 py-4">
                          <Input 
                            value={formData.nrp} 
                            onChange={e => setFormData({...formData, nrp: e.target.value})}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input 
                            value={formData.nama} 
                            onChange={e => setFormData({...formData, nama: e.target.value})}
                            className="h-8 text-xs uppercase"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(u.id)} className="h-8 w-8 text-green-600 hover:bg-green-100">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-slate-400 hover:bg-slate-100">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{u.nrp}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{u.nama}</td>
                        {currentUser?.role === "admin" && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => startEdit(u)}
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 rounded-lg"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                                onClick={() => {
                                  if (window.confirm("Yakin ingin menghapus anggota ini? Semua data transaksinya akan ikut terhapus.")) {
                                    deleteUser(u.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={currentUser?.role === "admin" ? 4 : 3} className="px-6 py-8 text-center text-slate-400 font-medium">
                      Tidak ada anggota ditemukan.
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
