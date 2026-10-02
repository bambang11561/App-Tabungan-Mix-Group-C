import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatIDR } from "./utils";
import { User } from "../types";

export interface SetoranRecord {
  id: string;
  userId: string;
  amount: number;
  month: string;
  date: string;
  userName: string;
  userNrp?: string;
}

export interface ExportSetoranOptions {
  title: string; // e.g. "Riwayat Setoran Tabungan" or "Riwayat Setoran Kas"
  category: "tabungan" | "kas";
  records: SetoranRecord[];
  allUsers: User[];
  currentUser: User | null;
}

export function generateMemberRecap(records: SetoranRecord[], allUsers: User[], currentUser: User | null) {
  // If user is regular user, only show currentUser
  const targetUsers = currentUser?.role === "admin"
    ? allUsers.filter(u => u.role === "user")
    : allUsers.filter(u => u.id === currentUser?.id);

  // Sort by smallest NRP (numeric order)
  const sortedUsers = [...targetUsers].sort((a, b) =>
    a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: "base" })
  );

  return sortedUsers.map(user => {
    const userRecords = records.filter(r => r.userId === user.id);
    const totalAmount = userRecords.reduce((sum, r) => sum + r.amount, 0);
    const monthsPaid = Array.from(new Set(userRecords.map(r => r.month))).join(", ") || "-";

    return {
      userId: user.id,
      nrp: user.nrp,
      nama: user.nama,
      count: userRecords.length,
      totalAmount,
      monthsPaid,
    };
  });
}

export function exportSetoranToExcel(options: ExportSetoranOptions) {
  const { title, records, allUsers, currentUser } = options;
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const memberRecap = generateMemberRecap(records, allUsers, currentUser);
  const totalNominalAll = records.reduce((sum, r) => sum + r.amount, 0);
  const totalTransaksiAll = records.length;

  const wb = XLSX.utils.book_new();

  // 1. Sheet Rekap Per Anggota
  const rekapAOA: (string | number)[][] = [
    [`LAPORAN REKAPITULASI ${title.toUpperCase()}`],
    [`Tanggal Cetak: ${printDate}`],
    [`Akses: ${currentUser?.role === "admin" ? "Administrator (Semua Anggota)" : `Anggota (${currentUser?.nama} - NRP: ${currentUser?.nrp})`}`],
    [],
    ["No", "NRP", "Nama Anggota", "Jumlah Transaksi Setoran", "Total Setoran (Rp)", "Bulan Yang Telah Disetor"],
  ];

  memberRecap.forEach((item, index) => {
    rekapAOA.push([
      index + 1,
      item.nrp,
      item.nama,
      item.count,
      item.totalAmount,
      item.monthsPaid,
    ]);
  });

  // Footer Total
  rekapAOA.push([]);
  rekapAOA.push([
    "",
    "TOTAL",
    `${memberRecap.length} Anggota`,
    totalTransaksiAll,
    totalNominalAll,
    "",
  ]);

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapAOA);
  // Column widths
  wsRekap["!cols"] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 28 },
    { wch: 24 },
    { wch: 20 },
    { wch: 35 },
  ];

  // 2. Sheet Detail Riwayat Transaksi
  // Sort detailed transactions by date desc or user NRP
  const sortedDetails = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const detailAOA: (string | number)[][] = [
    [`DETAIL RIWAYAT TRANSAKSI ${title.toUpperCase()}`],
    [`Tanggal Cetak: ${printDate}`],
    [`Total Catatan: ${records.length} transaksi`],
    [],
    ["No", "Tanggal", "NRP", "Nama Anggota", "Bulan Tagihan", "Nominal Setoran (Rp)"],
  ];

  sortedDetails.forEach((rec, index) => {
    const user = allUsers.find(u => u.id === rec.userId);
    const formattedDate = new Date(rec.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    detailAOA.push([
      index + 1,
      formattedDate,
      user?.nrp || rec.userNrp || "-",
      user?.nama || rec.userName || "-",
      rec.month,
      rec.amount,
    ]);
  });

  detailAOA.push([]);
  detailAOA.push(["", "", "", "TOTAL SETORAN", "", totalNominalAll]);

  const wsDetail = XLSX.utils.aoa_to_sheet(detailAOA);
  wsDetail["!cols"] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 15 },
    { wch: 28 },
    { wch: 15 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, wsRekap, "Rekap Per Anggota");
  XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Riwayat Setoran");

  const cleanName = title.toLowerCase().replace(/\s+/g, "_");
  const fileName = `${cleanName}_${new Date().toISOString().split("T")[0]}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

export function exportSetoranToPDF(options: ExportSetoranOptions) {
  const { title, records, allUsers, currentUser } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const memberRecap = generateMemberRecap(records, allUsers, currentUser);
  const totalNominalAll = records.reduce((sum, r) => sum + r.amount, 0);
  const totalTransaksiAll = records.length;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(title.toUpperCase(), 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Waktu Cetak: ${printDate} WIB`, 14, 24);
  doc.text(
    `Akses Pengguna: ${currentUser?.role === "admin" ? "Administrator (Semua Anggota)" : `${currentUser?.nama} (NRP: ${currentUser?.nrp})`}`,
    14,
    29
  );

  // Summary Box
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 33, 182, 18, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL SETORAN TERKUMPUL", 20, 39);
  doc.text("JUMLAH ANGGOTA", 85, 39);
  doc.text("TOTAL TRANSAKSI", 145, 39);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 149, 117); // emerald green
  doc.text(formatIDR(totalNominalAll), 20, 46);

  doc.setTextColor(30, 41, 59);
  doc.text(`${memberRecap.length} Orang`, 85, 46);
  doc.text(`${totalTransaksiAll} Transaksi`, 145, 46);

  // Section 1: Rekap Setoran per Anggota
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("1. Rekapitulasi & Total Setoran Setiap Anggota", 14, 58);

  const rekapBody = memberRecap.map((m, idx) => [
    (idx + 1).toString(),
    m.nrp,
    m.nama,
    `${m.count} kali`,
    formatIDR(m.totalAmount),
    m.monthsPaid,
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["No", "NRP", "Nama Anggota", "Frekuensi", "Total Setoran", "Bulan Disetor"]],
    body: rekapBody,
    foot: [
      [
        "",
        "TOTAL",
        `${memberRecap.length} Anggota`,
        `${totalTransaksiAll} kali`,
        formatIDR(totalNominalAll),
        "",
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [16, 149, 117],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 42 },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
      5: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  // Section 2: Detail Transaksi
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = doc.lastAutoTable?.finalY || 120;

  // Check if we need a page break or if space is tight
  if (finalY > 210) {
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. Detail Riwayat Transaksi Setoran", 14, 20);
    renderDetailTable(24);
  } else {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. Detail Riwayat Transaksi Setoran", 14, finalY + 12);
    renderDetailTable(finalY + 16);
  }

  function renderDetailTable(startY: number) {
    const sortedRecords = [...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const detailBody = sortedRecords.map((r, idx) => {
      const u = allUsers.find(user => user.id === r.userId);
      const dateStr = new Date(r.date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return [
        (idx + 1).toString(),
        dateStr,
        u?.nrp || r.userNrp || "-",
        u?.nama || r.userName || "-",
        r.month,
        formatIDR(r.amount),
      ];
    });

    autoTable(doc, {
      startY,
      head: [["No", "Tanggal", "NRP", "Nama Anggota", "Bulan Tagihan", "Nominal"]],
      body: detailBody,
      foot: [["", "", "", "TOTAL KESELURUHAN", "", formatIDR(totalNominalAll)]],
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 26 },
        2: { cellWidth: 22, halign: "center", fontStyle: "bold" },
        3: { cellWidth: 50 },
        4: { cellWidth: 26, halign: "center" },
        5: { cellWidth: 35, halign: "right", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  const cleanName = title.toLowerCase().replace(/\s+/g, "_");
  const fileName = `${cleanName}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
