import { pool } from "@/lib/db";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: "Missing ID" }, { status: 400 });
    }

    const [reportResult] = await pool.query(
      `DELETE FROM reports WHERE id = ?`,
      [id]
    );

    if (reportResult.affectedRows === 0) {
      return Response.json({ error: "Data report tidak ditemukan" }, { status: 404 });
    }

    await pool.query(`DELETE FROM tickets WHERE id = ?`, [id]);

    return Response.json({
      success: true,
      message: "🗑️ Data report & tiket terkait berhasil dihapus!",
    });

  } catch (err) {
    console.error("❌ DELETE /api/reports/[id] error:", err);
    return Response.json(
      { error: "Gagal menghapus report & tiket terkait" },
      { status: 500 }
    );
  }
}
