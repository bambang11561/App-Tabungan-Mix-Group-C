import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Tabungan, Pengeluaran, UangKas, PengeluaranKas, Rekening } from "../types";
import { initialUsers, initialTabungan, initialPengeluaran, defaultRekening } from "../data";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface AppContextType {
  currentUser: User | null;
  login: (nrp: string, password?: string) => boolean;
  logout: () => void;
  users: User[];
  
  tabungan: Tabungan[];
  pengeluaran: Pengeluaran[];
  addTabungan: (data: Omit<Tabungan, "id">) => void;
  deleteTabungan: (id: string) => void;
  addPengeluaran: (data: Omit<Pengeluaran, "id">) => void;
  deletePengeluaran: (id: string) => void;

  uangKas: UangKas[];
  pengeluaranKas: PengeluaranKas[];
  addUangKas: (data: Omit<UangKas, "id">) => void;
  deleteUangKas: (id: string) => void;
  addPengeluaranKas: (data: Omit<PengeluaranKas, "id">) => void;
  deletePengeluaranKas: (id: string) => void;

  rekening: Rekening;
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
  
  const [users, setUsers] = useState<User[]>([]);
  const [tabungan, setTabungan] = useState<Tabungan[]>([]);
  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>([]);
  const [uangKas, setUangKas] = useState<UangKas[]>([]);
  const [pengeluaranKas, setPengeluaranKas] = useState<PengeluaranKas[]>([]);
  const [rekening, setRekening] = useState<Rekening>(defaultRekening);

  useEffect(() => {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const seedDB = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        if (usersSnap.empty) {
          initialUsers.forEach(u => setDoc(doc(db, "users", u.id), u));
          initialTabungan.forEach(t => setDoc(doc(db, "tabungan", t.id), t));
          initialPengeluaran.forEach(p => setDoc(doc(db, "pengeluaran", p.id), p));
          setDoc(doc(db, "rekening", "main"), defaultRekening);
        }
      } catch (err) {
        console.error("Error seeding DB:", err);
      }
    };
    seedDB();

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    });
    const unsubTabungan = onSnapshot(collection(db, "tabungan"), (snap) => {
      setTabungan(snap.docs.map(d => ({ id: d.id, ...d.data() } as Tabungan)));
    });
    const unsubPengeluaran = onSnapshot(collection(db, "pengeluaran"), (snap) => {
      setPengeluaran(snap.docs.map(d => ({ id: d.id, ...d.data() } as Pengeluaran)));
    });
    const unsubUangKas = onSnapshot(collection(db, "uangKas"), (snap) => {
      setUangKas(snap.docs.map(d => ({ id: d.id, ...d.data() } as UangKas)));
    });
    const unsubPengeluaranKas = onSnapshot(collection(db, "pengeluaranKas"), (snap) => {
      setPengeluaranKas(snap.docs.map(d => ({ id: d.id, ...d.data() } as PengeluaranKas)));
    });
    const unsubRekening = onSnapshot(doc(db, "rekening", "main"), (docSnap) => {
      if (docSnap.exists()) {
        setRekening(docSnap.data() as Rekening);
      }
    });

    return () => {
      unsubUsers();
      unsubTabungan();
      unsubPengeluaran();
      unsubUangKas();
      unsubPengeluaranKas();
      unsubRekening();
    };
  }, []);

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

  const addTabungan = async (data: Omit<Tabungan, "id">) => {
    const id = Date.now().toString();
    await setDoc(doc(db, "tabungan", id), { ...data, id });
  };

  const deleteTabungan = async (id: string) => {
    await deleteDoc(doc(db, "tabungan", id));
  };

  const addPengeluaran = async (data: Omit<Pengeluaran, "id">) => {
    const id = Date.now().toString();
    await setDoc(doc(db, "pengeluaran", id), { ...data, id });
  };

  const deletePengeluaran = async (id: string) => {
    await deleteDoc(doc(db, "pengeluaran", id));
  };

  const addUangKas = async (data: Omit<UangKas, "id">) => {
    const id = Date.now().toString();
    await setDoc(doc(db, "uangKas", id), { ...data, id });
  };

  const deleteUangKas = async (id: string) => {
    await deleteDoc(doc(db, "uangKas", id));
  };

  const addPengeluaranKas = async (data: Omit<PengeluaranKas, "id">) => {
    const id = Date.now().toString();
    await setDoc(doc(db, "pengeluaranKas", id), { ...data, id });
  };

  const deletePengeluaranKas = async (id: string) => {
    await deleteDoc(doc(db, "pengeluaranKas", id));
  };

  const updateRekening = async (data: Rekening) => {
    await setDoc(doc(db, "rekening", "main"), data);
  };

  const addUser = async (data: Omit<User, "id">) => {
    const id = Date.now().toString();
    await setDoc(doc(db, "users", id), { ...data, id });
  };

  const editUser = async (id: string, data: Partial<User>) => {
    await updateDoc(doc(db, "users", id), data);
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    tabungan.filter((t) => t.userId === id).forEach((t) => deleteDoc(doc(db, "tabungan", t.id)));
    uangKas.filter((k) => k.userId === id).forEach((k) => deleteDoc(doc(db, "uangKas", k.id)));
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
        addTabungan,
        deleteTabungan,
        addPengeluaran,
        deletePengeluaran,

        uangKas,
        pengeluaranKas,
        addUangKas,
        deleteUangKas,
        addPengeluaranKas,
        deletePengeluaranKas,

        rekening,
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
