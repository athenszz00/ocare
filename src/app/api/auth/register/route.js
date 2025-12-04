import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, password, role } = await req.json();
    console.log("📥 Data diterima:", username, role);

    // ✅ Validasi
    if (!username || !password || !role) {
      return Response.json(
        { message: "Semua field wajib diisi!" },
        { status: 400 }
      );
    }

    // ✅ Cek apakah user sudah ada
    const [existingUser] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return Response.json(
        { message: "Username sudah digunakan!" },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user baru
    const [result] = await pool.execute(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );

    console.log("✅ User berhasil dibuat:", result);

    return Response.json({
      success: true,
      message: "Akun berhasil dibuat!",
    });
  } catch (error) {
    console.error("❌ ERROR saat register:", error);
    return Response.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
