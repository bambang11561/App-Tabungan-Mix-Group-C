import { User, Tabungan, Pengeluaran, Rekening } from "./types";

export const initialUsers: User[] = [
  { id: "1", nrp: "10615", nama: "RIAN WIRYAWAN", role: "user" },
  { id: "2", nrp: "10531", nama: "QODRI WAKHID SULAIMAN", role: "user" },
  { id: "3", nrp: "11561", nama: "BAMBANG TRI PURNOMO", role: "user" },
  { id: "4", nrp: "66534", nama: "MUHAMMAD FADIL ARDIANSA", role: "user" },
  { id: "5", nrp: "65485", nama: "AHMAD SAEFUL ULUM", role: "user" },
  { id: "6", nrp: "67451", nama: "GANENDRA MI'RAJ", role: "user" },
  { id: "16", nrp: "11325", nama: "SUTARDI", role: "user" },
  { id: "17", nrp: "65573", nama: "DIMAS DHARMA PUTRA", role: "user" },
  { id: "37", nrp: "67005", nama: "AVID ADE PAMUNGKAS", role: "user" },
  { id: "99", nrp: "admin", nama: "Administrator", role: "admin" }
];

export const initialTabungan: Tabungan[] = [
  { id: "t1", userId: "1", amount: 50000, month: "Jul-26", date: "2026-07-01T10:00:00Z" },
  { id: "t2", userId: "2", amount: 50000, month: "Jul-26", date: "2026-07-01T10:05:00Z" },
  { id: "t3", userId: "3", amount: 50000, month: "Jul-26", date: "2026-07-01T10:10:00Z" },
  { id: "t4", userId: "4", amount: 50000, month: "Jul-26", date: "2026-07-02T10:00:00Z" },
  { id: "t5", userId: "5", amount: 50000, month: "Jul-26", date: "2026-07-02T11:00:00Z" },
  { id: "t6", userId: "6", amount: 50000, month: "Jul-26", date: "2026-07-03T09:00:00Z" },
];

export const initialPengeluaran: Pengeluaran[] = [];

export const defaultRekening: Rekening = {
  bankName: "BCA",
  accountNumber: "1234567890",
  accountName: "Admin Tabungan Group C"
};

export const months = [
  "Jul-26", "Agu-26", "Sep-26", "Okt-26", "Nov-26", "Des-26",
  "Jan-27", "Feb-27", "Mar-27", "Apr-27", "Mei-27", "Jun-27"
];
