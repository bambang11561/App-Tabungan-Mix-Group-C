import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Tabungan, Pengeluaran, Rekening } from "../types";
import { initialUsers, initialTabungan, initialPengeluaran, defaultRekening } from "../data";

interface AppContextType {
  currentUser: User | null;
  login: (nrp: string, password?: string) => boolean;
  logout: () => void;
  users: User[];
  tabungan: Tabungan[];
  pengeluaran: Pengeluaran[];
  rekening: Rekening;
  addTabungan: (data: Omit<Tabungan, "id">) => void;
  deleteTabungan: (id: string) => void;
  addPengeluaran: (data: Omit<Pengeluaran, "id">) => void;
  deletePengeluaran: (id: string) => void;
  updateRekening: (data: Rekening) => void;
  addUser: (data: Omit<User, "id">) => void;
  editUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [tabungan, setTabungan] = useState<Tabungan[]>(() => {
    const saved = localStorage.getItem("tabungan");
    return saved ? JSON.parse(saved) : initialTabungan;
  });

  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>(() => {
    const saved = localStorage.getItem("pengeluaran_v2");
    return saved ? JSON.parse(saved) : initialPengeluaran;
  });

  const [rekening, setRekening] = useState<Rekening>(() => {
    const saved = localStorage.getItem("rekening");
    return saved ? JSON.parse(saved) : defaultRekening;
  });

  useEffect(() => {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("tabungan", JSON.stringify(tabungan));
  }, [tabungan]);

  useEffect(() => {
    localStorage.setItem("pengeluaran_v2", JSON.stringify(pengeluaran));
  }, [pengeluaran]);

  useEffect(() => {
    localStorage.setItem("rekening", JSON.stringify(rekening));
  }, [rekening]);

  const login = (nrp: string, password?: string) => {
    const user = users.find((u) => u.nrp === nrp);
    if (user) {
      if (user.role === "admin" && password !== "admin561") {
        return false;
      }
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addTabungan = (data: Omit<Tabungan, "id">) => {
    const newTabungan: Tabungan = { ...data, id: Date.now().toString() };
    setTabungan([...tabungan, newTabungan]);
  };

  const deleteTabungan = (id: string) => {
    setTabungan(tabungan.filter((t) => t.id !== id));
  };

  const addPengeluaran = (data: Omit<Pengeluaran, "id">) => {
    const newPengeluaran: Pengeluaran = { ...data, id: Date.now().toString() };
    setPengeluaran([...pengeluaran, newPengeluaran]);
  };

  const deletePengeluaran = (id: string) => {
    setPengeluaran(pengeluaran.filter((p) => p.id !== id));
  };

  const updateRekening = (data: Rekening) => {
    setRekening(data);
  };

  const addUser = (data: Omit<User, "id">) => {
    const newUser: User = { ...data, id: Date.now().toString() };
    setUsers([...users, newUser]);
  };

  const editUser = (id: string, data: Partial<User>) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    setTabungan(tabungan.filter((t) => t.userId !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        users,
        tabungan,
        pengeluaran,
        rekening,
        addTabungan,
        deleteTabungan,
        addPengeluaran,
        deletePengeluaran,
        updateRekening,
        addUser,
        editUser,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
