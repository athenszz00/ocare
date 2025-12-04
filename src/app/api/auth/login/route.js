export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { success: false, message: "Semua field wajib diisi!" },
        { status: 400 }
      );
    }

    // ✅ Gunakan pool langsung (tidak perlu db.end())
    const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);

    if (rows.length === 0) {
      return Response.json(
        { success: false, message: "Akun tidak ditemukan!" },
        { status: 404 }
      );
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: "Password salah!" },
        { status: 401 }
      );
    }

    // ✅ Kirim role juga
    return Response.json({
      success: true,
      message: "Login berhasil!",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}