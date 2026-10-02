import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatIDR } from "./utils";
import { User, Pengeluaran } from "../types";

export interface PengeluaranRecord extends Pengeluaran {
  userName?: string;
  userNrp?: string;
}

export interface ExportPengeluaranOptions {
  title: string;
  records: PengeluaranRecord[];
  allUsers: User[];
  currentUser: User | null;
}

export function exportPengeluaranToExcel(options: ExportPengeluaranOptions) {
  const { title, records, allUsers, currentUser } = options;
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const targetUsers = currentUser?.role === "admin"
    ? allUsers.filter(u => u.role === "user")
    : allUsers.filter(u => u.id === currentUser?.id);

  const sortedUsers = [...targetUsers].sort((a, b) =>
    a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: "base" })
  );

  const memberRecap = sortedUsers.map(user => {
    const userRecords = records.filter(r => r.userId === user.id);
    const totalAmount = userRecords.reduce((sum, r) => sum + r.amount, 0);

    return {
      nrp: user.nrp,
      nama: user.nama,
      count: userRecords.length,
      totalAmount,
    };
  });

  const totalNominalAll = records.reduce((sum, r) => sum + r.amount, 0);
  const totalTransaksiAll = records.length;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Rekap Per Anggota
  const rekapAOA: (string | number)[][] = [
    [`LAPORAN REKAPITULASI ${title.toUpperCase()}`],
    [`Tanggal Cetak: ${printDate}`],
    [`Akses: ${currentUser?.role === "admin" ? "Administrator (Semua Anggota)" : `Anggota (${currentUser?.nama} - NRP: ${currentUser?.nrp})`}`],
    [],
    ["No", "NRP", "Nama Anggota", "Frekuensi Penarikan", "Total Pengeluaran / Pencairan (Rp)"],
  ];

  memberRecap.forEach((item, index) => {
    rekapAOA.push([
      index + 1,
      item.nrp,
      item.nama,
      item.count,
      item.totalAmount,
    ]);
  });

  rekapAOA.push([]);
  rekapAOA.push([
    "",
    "TOTAL",
    `${memberRecap.length} Anggota`,
    totalTransaksiAll,
    totalNominalAll,
  ]);

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapAOA);
  wsRekap["!cols"] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 30 },
    { wch: 22 },
    { wch: 26 },
  ];

  // Sheet 2: Detail Transaksi Pengeluaran
  const sortedDetails = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const detailAOA: (string | number)[][] = [
    [`DETAIL RIWAYAT TRANSAKSI ${title.toUpperCase()}`],
    [`Tanggal Cetak: ${printDate}`],
    [`Total Catatan: ${records.length} transaksi`],
    [],
    ["No", "Tanggal", "NRP", "Nama Anggota", "Keterangan Pengeluaran", "Nominal (Rp)"],
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
      user?.nrp || rec.userNrp || "Umum",
      user?.nama || rec.userName || "Umum",
      rec.description,
      rec.amount,
    ]);
  });

  detailAOA.push([]);
  detailAOA.push(["", "", "", "", "TOTAL PENGELUARAN", totalNominalAll]);

  const wsDetail = XLSX.utils.aoa_to_sheet(detailAOA);
  wsDetail["!cols"] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 15 },
    { wch: 28 },
    { wch: 35 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, wsRekap, "Rekap Pengeluaran");
  XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Transaksi");

  const cleanName = title.toLowerCase().replace(/\s+/g, "_");
  const fileName = `${cleanName}_${new Date().toISOString().split("T")[0]}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

export function exportPengeluaranToPDF(options: ExportPengeluaranOptions) {
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

  const targetUsers = currentUser?.role === "admin"
    ? allUsers.filter(u => u.role === "user")
    : allUsers.filter(u => u.id === currentUser?.id);

  const sortedUsers = [...targetUsers].sort((a, b) =>
    a.nrp.localeCompare(b.nrp, undefined, { numeric: true, sensitivity: "base" })
  );

  const memberRecap = sortedUsers.map(user => {
    const userRecords = records.filter(r => r.userId === user.id);
    const totalAmount = userRecords.reduce((sum, r) => sum + r.amount, 0);

    return {
      nrp: user.nrp,
      nama: user.nama,
      count: userRecords.length,
      totalAmount,
    };
  });

  const totalNominalAll = records.reduce((sum, r) => sum + r.amount, 0);
  const totalTransaksiAll = records.length;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title.toUpperCase(), 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Waktu Cetak: ${printDate} WIB`, 14, 24);
  doc.text(
    `Akses Pengguna: ${currentUser?.role === "admin" ? "Administrator (Semua Anggota)" : `${currentUser?.nama} (NRP: ${currentUser?.nrp})`}`,
    14,
    29
  );

  // Summary Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 33, 182, 18, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL PENGELUARAN / PENCAIRAN", 20, 39);
  doc.text("JUMLAH ANGGOTA", 95, 39);
  doc.text("TOTAL TRANSAKSI", 145, 39);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(234, 88, 12); // orange-600
  doc.text(formatIDR(totalNominalAll), 20, 46);

  doc.setTextColor(30, 41, 59);
  doc.text(`${memberRecap.length} Orang`, 95, 46);
  doc.text(`${totalTransaksiAll} Transaksi`, 145, 46);

  // Section 1: Rekapitulasi per Anggota
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Rekapitulasi Pengeluaran per Anggota", 14, 58);

  const rekapBody = memberRecap.map((m, idx) => [
    (idx + 1).toString(),
    m.nrp,
    m.nama,
    `${m.count} kali`,
    formatIDR(m.totalAmount),
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["No", "NRP", "Nama Anggota", "Frekuensi", "Total Pengeluaran"]],
    body: rekapBody,
    foot: [
      [
        "",
        "TOTAL",
        `${memberRecap.length} Anggota`,
        `${totalTransaksiAll} kali`,
        formatIDR(totalNominalAll),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [234, 88, 12], // orange-600
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
      1: { cellWidth: 25, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 65 },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 45, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // Section 2: Detail Transaksi
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = doc.lastAutoTable?.finalY || 120;

  if (finalY > 210) {
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. Detail Riwayat Pengeluaran", 14, 20);
    renderDetailTable(24);
  } else {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. Detail Riwayat Pengeluaran", 14, finalY + 12);
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
        u?.nrp || r.userNrp || "Umum",
        u?.nama || r.userName || "Umum",
        r.description,
        formatIDR(r.amount),
      ];
    });

    autoTable(doc, {
      startY,
      head: [["No", "Tanggal", "NRP", "Nama Anggota", "Keterangan", "Nominal"]],
      body: detailBody,
      foot: [["", "", "", "", "TOTAL PENGELUARAN", formatIDR(totalNominalAll)]],
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
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
        1: { cellWidth: 25 },
        2: { cellWidth: 20, halign: "center", fontStyle: "bold" },
        3: { cellWidth: 42 },
        4: { cellWidth: "auto" },
        5: { cellWidth: 32, halign: "right", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  const cleanName = title.toLowerCase().replace(/\s+/g, "_");
  const fileName = `${cleanName}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
