import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { cn } from "../../lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  WalletCards, 
  Wallet,
  TrendingDown,
  LogOut, 
  Menu, 
  X
} from "lucide-react";

export default function DashboardLayout() {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navGroups = [
    {
      title: "Main Menu",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, color: "text-sky-400", bgColor: "bg-sky-400/20" },
      ]
    },
    {
      title: "Tabungan",
      items: [
        { name: "Data Penabung", path: "/dashboard/penabung", icon: Users, color: "text-emerald-400", bgColor: "bg-emerald-400/20" },
        { name: "Saldo Tabungan", path: "/dashboard/saldo-tabungan", icon: Wallet, color: "text-green-400", bgColor: "bg-green-400/20" },
        { name: "Catatan Setoran", path: "/dashboard/setoran-tabungan", icon: WalletCards, color: "text-teal-400", bgColor: "bg-teal-400/20" },
        { name: "Pengeluaran Tabungan", path: "/dashboard/pengeluaran-tabungan", icon: TrendingDown, color: "text-orange-400", bgColor: "bg-orange-400/20" },
      ]
    },
    {
      title: "Kas Mixing",
      items: [
        { name: "Data Anggota Kas", path: "/dashboard/data-kas", icon: Users, color: "text-blue-400", bgColor: "bg-blue-400/20" },
        { name: "Saldo Kas", path: "/dashboard/saldo-kas", icon: Wallet, color: "text-indigo-400", bgColor: "bg-indigo-400/20" },
        { name: "Catatan Setoran Kas", path: "/dashboard/setoran-kas", icon: WalletCards, color: "text-purple-400", bgColor: "bg-purple-400/20" },
        { name: "Pengeluaran Uang Kas", path: "/dashboard/pengeluaran-kas", icon: TrendingDown, color: "text-red-400", bgColor: "bg-red-400/20" },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F0F5FA] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 bg-[#0E1B3D] text-white flex-col md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">C</div>
          <div>
            <h1 className="text-lg font-bold leading-none mb-1">Group C</h1>
            <span className="text-[10px] text-blue-300 uppercase tracking-widest font-bold bg-blue-500/20 px-2 py-0.5 rounded-md">Tabungan App</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 mt-2 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{group.title}</h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        isActive
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      {isActive && <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-r-full", item.bgColor.replace('/20', ''))} />}
                      <div className={cn(
                        "p-2 rounded-lg transition-colors flex items-center justify-center",
                        isActive ? item.bgColor : "bg-slate-800/50 group-hover:bg-slate-800"
                      )}>
                        <Icon className={cn("w-4 h-4", isActive ? item.color : "text-slate-400 group-hover:text-slate-300")} />
                      </div>
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="p-4 mt-auto">
          <div className="bg-blue-600 rounded-xl p-4 mb-4">
            <p className="text-xs text-blue-200 mb-0.5">Status Pengguna</p>
            <p className="text-sm font-bold truncate">{currentUser?.nama}</p>
            <p className="text-xs font-mono text-blue-200 mb-1">NRP: {currentUser?.nrp}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider bg-blue-700/60 inline-block px-2 py-0.5 rounded text-blue-100 mb-3">{currentUser?.role}</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-[#0E1B3D] text-white overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">C</div>
                <div>
                  <h1 className="text-lg font-bold leading-none mb-1">Group C</h1>
                  <span className="text-[10px] text-blue-300 uppercase tracking-widest font-bold bg-blue-500/20 px-2 py-0.5 rounded-md">Tabungan App</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 mt-2 space-y-6">
              {navGroups.map((group, idx) => (
                <div key={idx}>
                  <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{group.title}</h3>
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                            isActive
                              ? "bg-white/10 text-white font-semibold"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                          )}
                        >
                          {isActive && <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-r-full", item.bgColor.replace('/20', ''))} />}
                          <div className={cn(
                            "p-2 rounded-lg transition-colors flex items-center justify-center",
                            isActive ? item.bgColor : "bg-slate-800/50 group-hover:bg-slate-800"
                          )}>
                            <Icon className={cn("w-4 h-4", isActive ? item.color : "text-slate-400 group-hover:text-slate-300")} />
                          </div>
                          <span className="text-sm">{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="p-4 mt-auto">
              <div className="bg-blue-600 rounded-xl p-4 mb-4">
                <p className="text-xs text-blue-200 mb-0.5">Status Pengguna</p>
                <p className="text-sm font-bold truncate">{currentUser?.nama}</p>
                <p className="text-xs font-mono text-blue-200 mb-2">NRP: {currentUser?.nrp}</p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-900 hidden sm:block">Sistem Tabungan</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Akses mudah pelaporan keuangan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{currentUser?.nama}</p>
              <p className="text-xs font-mono text-slate-500">NRP: {currentUser?.nrp}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {currentUser?.nama.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
