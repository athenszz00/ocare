import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { success: false, message: "Semua field wajib diisi!" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, message: "Akun tidak ditemukan!" },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return Response.json(
        { success: false, message: "Password salah!" },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Login berhasil!",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Login error:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
