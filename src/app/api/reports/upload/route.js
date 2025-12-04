import { pool } from "@/lib/db";
import * as XLSX from "xlsx";
import multer from "multer";
import fs from "fs";
import path from "path";

// Konfigurasi multer untuk simpan file sementara
const upload = multer({ dest: "uploads/" });

// Fungsi bantu untuk konversi tanggal ke lokal (bukan UTC)
function toLocalDate(dateString) {
  if (!dateString) return new Date();
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
}

// ================================
// POST — Upload Excel/CSV dan simpan ke DB
// ================================
export const POST = async (req) => {
  try {
    // Karena Next.js Route Handler belum support multipart/form-data secara langsung,
    // kita baca file dari body sebagai base64 atau pakai FormData di frontend.
    // Misal di sini kita expect file path sementara: req.body.filePath
    const { filePath } = await req.json();

    if (!filePath || !fs.existsSync(filePath)) {
      return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Baca file Excel/CSV
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (!Array.isArray(records) || records.length === 0) {
      return Response.json({ error: "File kosong atau format tidak valid" }, { status: 400 });
    }

    // Insert ke DB
    for (const r of records) {
      await pool.query(
        `
        INSERT INTO reports
        (name, title, classification, organisasi, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          r.name || "",
          r.title || "",
          r.classification || "",
          r.organisasi || "",
          r.description || "",
          r.status || "Open",
          toLocalDate(r.created),
          toLocalDate(r.updated),
        ]
      );
    }

    // Hapus file sementara setelah selesai
    fs.unlinkSync(filePath);

    return Response.json({ message: "✅ File berhasil di-upload dan disimpan!" });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};
