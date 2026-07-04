import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataPenabung from "./pages/DataPenabung";

// Tabungan
import SaldoTabungan from "./pages/tabungan/SaldoTabungan";
import SetoranTabungan from "./pages/tabungan/SetoranTabungan";
import PengeluaranTabungan from "./pages/tabungan/PengeluaranTabungan";

// Kas Mixing
import DataKasMixing from "./pages/kas/DataKasMixing";
import SaldoKas from "./pages/kas/SaldoKas";
import SetoranKas from "./pages/kas/SetoranKas";
import PengeluaranKas from "./pages/kas/PengeluaranKas";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAppContext();
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Tabungan */}
            <Route path="penabung" element={<DataPenabung />} />
            <Route path="saldo-tabungan" element={<SaldoTabungan />} />
            <Route path="setoran-tabungan" element={<SetoranTabungan />} />
            <Route path="pengeluaran-tabungan" element={<PengeluaranTabungan />} />
            
            {/* Kas Mixing */}
            <Route path="data-kas" element={<DataKasMixing />} />
            <Route path="saldo-kas" element={<SaldoKas />} />
            <Route path="setoran-kas" element={<SetoranKas />} />
            <Route path="pengeluaran-kas" element={<PengeluaranKas />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
