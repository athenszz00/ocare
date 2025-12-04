import { pool } from "@/lib/db";

// =============================================
// NORMALISASI TANGGAL → FORMAT FINAL:
// 2025-11-11 10:53:03
// =============================================
function normalizeDate(val) {
  if (!val) return null;

  // Excel Serial Number
  if (!isNaN(val)) {
    const jsDate = new Date((val - 25569) * 86400 * 1000);
    return (
      jsDate.getFullYear() +
      "-" +
      String(jsDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(jsDate.getDate()).padStart(2, "0") +
      " " +
      String(jsDate.getHours()).padStart(2, "0") +
      ":" +
      String(jsDate.getMinutes()).padStart(2, "0") +
      ":" +
      String(jsDate.getSeconds()).padStart(2, "0")
    );
  }

  // Jika STRING Excel → langsung dipakai
  // Format Excel kamu sudah benar "YYYY-MM-DD HH:MM:SS"
  return val;
}

export async function POST(req) {
  try {
    const { records } = await req.json();
    if (!Array.isArray(records)) {
      return Response.json({ error: "Invalid data format" }, { status: 400 });
    }

    for (const r of records) {
      const {
        id,
        name,
        title,
        classification,
        organisasi,
        description,
        status,
        created_at,
        updated_at,
      } = r;

      const created = normalizeDate(created_at);
      const updated = normalizeDate(updated_at);

      // INSERT / UPDATE tickets
      await pool.query(
        `
        INSERT INTO tickets
          (id, name, title, classification, organisasi, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          title = VALUES(title),
          classification = VALUES(classification),
          organisasi = VALUES(organisasi),
          description = VALUES(description),
          status = VALUES(status),
          updated_at = VALUES(updated_at)
        `,
        [
          id || null,
          name,
          title,
          classification,
          organisasi,
          description,
          status || "Open",
          created,
          updated,
        ]
      );

      // INSERT / UPDATE reports
      await pool.query(
        `
        INSERT INTO reports
          (id, name, title, classification, organisasi, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          title = VALUES(title),
          classification = VALUES(classification),
          organisasi = VALUES(organisasi),
          description = VALUES(description),
          status = VALUES(status),
          updated_at = VALUES(updated_at)
        `,
        [
          id || null,
          name,
          title,
          classification,
          organisasi,
          description,
          status || "Open",
          created,
          updated,
        ]
      );
    }

    return Response.json({
      success: true,
      message: "Tanggal berhasil masuk PERSIS seperti di Excel.",
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
