import { pool } from "@/lib/db";

// ============================================================
// ✅ GET — Ambil semua data tickets
// ============================================================
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        title,
        classification,
        organisasi,
        description,
        status,
        created_at,
        updated_at
      FROM tickets
      ORDER BY id DESC
    `);

    return Response.json(rows);
  } catch (err) {
    console.error("❌ GET /api/tickets error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// ✅ POST — Tambah ticket baru + otomatis sinkron ke reports
// ============================================================
export async function POST(req) {
  try {
    const { name, title, classification, organisasi, description, status } =
      await req.json();

    // 1️⃣ INSERT ke tickets
    const [ticketResult] = await pool.query(
      `
      INSERT INTO tickets (name, title, classification, organisasi, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [name, title, classification, organisasi, description, status || "Open"]
    );

    const ticketId = ticketResult.insertId;

    // 2️⃣ INSERT ke reports (sinkron)
    await pool.query(
      `
      INSERT INTO reports (id, name, title, classification, organisasi, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        title = VALUES(title),
        classification = VALUES(classification),
        organisasi = VALUES(organisasi),
        description = VALUES(description),
        status = VALUES(status),
        updated_at = NOW()
      `,
      [ticketId, name, title, classification, organisasi, description, status || "Open"]
    );

    return Response.json({
      success: true,
      message: "✅ Ticket berhasil dibuat & disinkron ke reports!",
      ticketId,
    });
  } catch (err) {
    console.error("❌ POST /api/tickets error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// ✅ PUT — Update ticket + sinkron ke reports
// ============================================================
export async function PUT(req) {
  try {
    const {
      id,
      name,
      title,
      classification,
      organisasi,
      description,
      status,
    } = await req.json();

    // UPDATE tickets
    await pool.query(
      `
      UPDATE tickets
      SET name=?, title=?, classification=?, organisasi=?, description=?, status=?, updated_at=NOW()
      WHERE id=?
      `,
      [name, title, classification, organisasi, description, status, id]
    );

    // UPDATE reports (sinkron)
    await pool.query(
      `
      UPDATE reports
      SET name=?, title=?, classification=?, organisasi=?, description=?, status=?, updated_at=NOW()
      WHERE id=?
      `,
      [name, title, classification, organisasi, description, status, id]
    );

    return Response.json({
      success: true,
      message: "✅ Ticket & report berhasil diupdate!",
    });
  } catch (err) {
    console.error("❌ PUT /api/tickets error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// ✅ DELETE — Hapus ticket + hapus juga di reports
// ============================================================
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    await pool.query(`DELETE FROM tickets WHERE id=?`, [id]);
    await pool.query(`DELETE FROM reports WHERE id=?`, [id]);

    return Response.json({
      success: true,
      message: "🗑️ Ticket & report berhasil dihapus!",
    });
  } catch (err) {
    console.error("❌ DELETE /api/tickets error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
