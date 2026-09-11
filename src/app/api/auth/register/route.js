import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return Response.json(
        { success: false, message: "Semua field wajib diisi!" },
        { status: 400 }
      );
    }

    // Cek apakah username sudah ada
    const exist = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (exist.rows.length > 0) {
      return Response.json(
        { success: false, message: "Username sudah terdaftar!" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
      [username, hashedPassword, role]
    );

    return Response.json(
      { success: true, message: "Akun berhasil didaftarkan!" },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Register error:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
