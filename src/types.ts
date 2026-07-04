export type Role = "admin" | "user";

export interface User {
  id: string;
  nrp: string;
  nama: string;
  role: Role;
}

export interface Tabungan {
  id: string;
  userId: string;
  amount: number;
  month: string;
  date: string;
}

export interface Pengeluaran {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface UangKas {
  id: string;
  userId: string;
  amount: number;
  month: string;
  date: string;
}

export interface PengeluaranKas {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Rekening {
  bankName: string;
  accountNumber: string;
  accountName: string;
}
