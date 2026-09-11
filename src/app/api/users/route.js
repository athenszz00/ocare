import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";


export async function POST(req) {
  try {
    const body = await req.json();

    const { username, password, role } = body;

    // ===== VALIDASI DASAR =====
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "username, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    // ===== VALIDASI ROLE (ANTI NGACO) =====
    const allowedRoles = [
      "user",
      "admin",
      "doctor",
      "staff",
      "manager"
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "role tidak valid" },
        { status: 400 }
      );
    }

    // ===== CEK USERNAME =====
    const existing =
      await sql`SELECT id FROM users WHERE username = ${username}`;

    if (existing.rowCount > 0) {
      return NextResponse.json(
        { error: "username sudah terdaftar" },
        { status: 409 }
      );
    }

    // ===== HASH PASSWORD =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== INSERT (ROLE EXPLICIT, BUKAN DEFAULT) =====
    const result = await sql`
      INSERT INTO users (
        username,
        password,
        role
      ) VALUES (
        ${username},
        ${hashedPassword},
        ${role}
      )
      RETURNING id, username, role, created_at
    `;

    return NextResponse.json(
      {
        success: true,
        user: result.rows[0]
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
