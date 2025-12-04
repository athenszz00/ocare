import { pool } from "@/lib/db";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const {
      name,
      title,
      classification,
      organisasi,
      description,
      status,
    } = await req.json();

    // ============================================================
    // ✅ UPDATE di tabel tickets
    // ============================================================
    await pool.query(
      `UPDATE tickets
       SET name=?, title=?, classification=?, organisasi=?, description=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [name, title, classification, organisasi, description, status, id]
    );

    // ============================================================
    // ✅ UPDATE juga di tabel reports agar sinkron
    // ============================================================
    await pool.query(
      `UPDATE reports
       SET name=?, title=?, classification=?, organisasi=?, description=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [name, title, classification, organisasi, description, status, id]
    );

    return Response.json({ message: "✅ Tiket & report berhasil diperbarui" });
  } catch (err) {
    console.error("❌ PUT /api/tickets/[id] error:", err);
    return Response.json(
      { error: "Gagal memperbarui tiket & report" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Hapus dari kedua tabel biar bersih
    await pool.query("DELETE FROM tickets WHERE id=?", [id]);

    return Response.json({ message: "🗑️ Tiket & report berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE /api/tickets/[id] error:", err);
    return Response.json(
      { error: "Gagal menghapus tiket & report" },
      { status: 500 }
    );
  }
}
