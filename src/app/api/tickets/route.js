import pool from "@/lib/db";

// ============================================================
// ✅ GET — Ambil semua data tickets
// ============================================================
export async function GET() {
  try {
    const result = await pool.query(`
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

    return Response.json(result.rows);
  } catch (err) {
    console.error("❌ GET /api/tickets error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// ✅ POST — Tambah ticket baru + sinkron ke reports
// ============================================================
export async function POST(req) {
  try {
    const {
      name,
      title,
      classification,
      organisasi,
      description,
      status,
    } = await req.json();

    // INSERT ke tickets dulu
    const insertTicket = await pool.query(
      `
      INSERT INTO tickets (name, title, classification, organisasi, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id
      `,
      [name, title, classification, organisasi, description, status || "Open"]
    );

    const ticketId = insertTicket.rows[0].id;

    // Sinkron otomatis ke reports
    await pool.query(
      `
      INSERT INTO reports (id, name, title, classification, organisasi, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        classification = EXCLUDED.classification,
        organisasi = EXCLUDED.organisasi,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = NOW()
      `,
      [
        ticketId,
        name,
        title,
        classification,
        organisasi,
        description,
        status || "Open",
      ]
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

    await pool.query(
      `
      UPDATE tickets
      SET name=$1, title=$2, classification=$3, organisasi=$4, description=$5, status=$6, updated_at=NOW()
      WHERE id=$7
      `,
      [name, title, classification, organisasi, description, status, id]
    );

    await pool.query(
      `
      UPDATE reports
      SET name=$1, title=$2, classification=$3, organisasi=$4, description=$5, status=$6, updated_at=NOW()
      WHERE id=$7
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

    await pool.query(`DELETE FROM tickets WHERE id=$1`, [id]);
    await pool.query(`DELETE FROM reports WHERE id=$1`, [id]);

    return Response.json({
      success: true,
      message: "🗑️ Ticket & report berhasil dihapus!",
    });
  } catch (err) {
    console.error("❌ DELETE /api/tickets error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
