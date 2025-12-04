import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT id, username, role FROM users");
    return Response.json({ users: rows });
  } catch (err) {
    console.error("GET Users Error:", err);
    return Response.json({ users: [] }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { username, password, role } = await req.json();

    // ✅ Validasi sederhana
    if (!username || !password || !role) {
      return Response.json(
        { success: false, message: "Semua field wajib diisi!" },
        { status: 400 }
      );
    }

    // ✅ Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Simpan ke database
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );

    return Response.json({ success: true, message: "User berhasil ditambahkan!" });
  } catch (err) {
    console.error("POST User Error:", err);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menambah user." },
      { status: 500 }
    );
  }
}
