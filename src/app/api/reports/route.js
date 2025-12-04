import { pool } from "@/lib/db";

// ============================================================
// ✅ GET — Ambil Data dari Tabel reports
// ============================================================
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.id,
        r.name,
        r.title,
        r.classification,
        r.organisasi,
        r.description,
        r.status,
        r.created_at AS created,
        r.updated_at AS updated
      FROM reports r
      ORDER BY r.id DESC
    `);

    return Response.json(rows);
  } catch (err) {
    console.error("❌ GET /api/reports error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// ✅ PUT — Update data di reports & tickets agar sinkron
// ============================================================
export async function PUT(req) {
  try {
    const body = await req.json();

    if (!body.id) {
      return Response.json({ error: "Missing report ID" }, { status: 400 });
    }

    const classificationValue = body.classification || "";

    // UPDATE reports
    const [reportResult] = await pool.query(
      `
      UPDATE reports
      SET 
        name = ?,
        title = ?,
        classification = ?,
        organisasi = ?,
        description = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        body.name,
        body.title,
        classificationValue,
        body.organisasi,
        body.description,
        body.status,
        body.id,
      ]
    );

    // UPDATE tickets
    const [ticketResult] = await pool.query(
      `
      UPDATE tickets
      SET 
        name = ?,
        title = ?,
        classification = ?,
        organisasi = ?,
        description = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        body.name,
        body.title,
        classificationValue,
        body.organisasi,
        body.description,
        body.status,
        body.id,
      ]
    );

    if (reportResult.affectedRows === 0 && ticketResult.affectedRows === 0) {
      return Response.json({ error: "Report or ticket not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "✅ Data berhasil diupdate di reports dan tickets!",
    });
  } catch (err) {
    console.error("❌ Error updating report & ticket:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// ✅ POST — Upload Excel → Insert ke Database (reports + tickets)
// ============================================================
export async function POST(req) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return Response.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Loop setiap baris Excel
    for (const row of body) {
      const {
        id,
        name,
        title,
        classification,
        organisasi,
        description,
        status,
      } = row;

      // ✅ Insert ke reports
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
        [id, name, title, classification, organisasi, description, status]
      );

      // ✅ Insert ke tickets (biar sinkron)
      await pool.query(
        `
        INSERT INTO tickets (id, name, title, classification, organisasi, description, status, created_at, updated_at)
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
        [id, name, title, classification, organisasi, description, status]
      );
    }

    return Response.json({
      success: true,
      message: "✅ Semua data Excel berhasil di-upload & disimpan!",
    });
  } catch (err) {
    console.error("❌ Error uploading Excel:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
