import pool from "@/lib/db";

import { NextResponse } from "next/server";

// ============================================================
// GET — Ambil semua report + ticket terkait
// ============================================================
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        t.id AS ticket_id,
        t.title AS ticket_title,
        t.status AS ticket_status
      FROM reports r
      LEFT JOIN tickets t ON r.ticket_id = t.id
      ORDER BY r.id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ GET /api/reports error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// PUT — Update report & sinkron status ticket
// ============================================================
export async function PUT(req) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    // Ambil report lama untuk tahu ticket_id
    const reportCheck = await pool.query(
      `SELECT * FROM reports WHERE id = $1`,
      [body.id]
    );

    if (reportCheck.rows.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const ticketId = reportCheck.rows[0].ticket_id;

    // UPDATE reports
    await pool.query(
      `
      UPDATE reports
      SET 
        name = $1,
        title = $2,
        classification = $3,
        organisasi = $4,
        description = $5,
        status = $6,
        updated_at = NOW()
      WHERE id = $7
      `,
      [
        body.name,
        body.title,
        body.classification,
        body.organisasi,
        body.description,
        body.status,
        body.id,
      ]
    );

    // Jika report selesai → sinkron ke ticket
    if (ticketId) {
      await pool.query(
        `
        UPDATE tickets
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        `,
        [body.status, ticketId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data report & ticket berhasil diperbarui",
    });
  } catch (err) {
    console.error("❌ Error PUT:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// POST — Upload Excel → Insert/Upsert ke reports + tickets
// ============================================================
export async function POST(req) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    for (const row of body) {
      const {
        id,
        ticket_id,
        name,
        title,
        classification,
        organisasi,
        description,
        status,
      } = row;

      // UPSERT ke reports
      await pool.query(
        `
        INSERT INTO reports 
          (id, ticket_id, name, title, classification, organisasi, description, status, created_at, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          ticket_id = EXCLUDED.ticket_id,
          name = EXCLUDED.name,
          title = EXCLUDED.title,
          classification = EXCLUDED.classification,
          organisasi = EXCLUDED.organisasi,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          updated_at = NOW()
        `,
        [
          id,
          ticket_id,
          name,
          title,
          classification,
          organisasi,
          description,
          status,
        ]
      );

      // UPSERT ke tickets
      await pool.query(
        `
        INSERT INTO tickets
          (id, name, title, classification, organisasi, description, status, created_at, updated_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          title = EXCLUDED.title,
          classification = EXCLUDED.classification,
          organisasi = EXCLUDED.organisasi,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          updated_at = NOW()
        `,
        [ticket_id, name, title, classification, organisasi, description, status]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Excel berhasil diproses & disimpan",
    });
  } catch (err) {
    console.error("❌ POST Excel error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
