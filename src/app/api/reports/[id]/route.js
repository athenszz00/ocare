import pool from "@/lib/db";


export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const reportCheck = await pool.query("SELECT ticket_id FROM reports WHERE id=$1", [id]);

    if (reportCheck.rowCount === 0) {
      return Response.json({ error: "Report tidak ditemukan" }, { status: 404 });
    }

    const ticketId = reportCheck.rows[0].ticket_id;

    await pool.query("DELETE FROM reports WHERE id=$1", [id]);
    await pool.query("DELETE FROM tickets WHERE id=$1", [ticketId]);

    return Response.json({
      success: true,
      message: "Report & tiket berhasil dihapus!",
    });

  } catch (err) {
    console.error("DELETE /api/reports/[id] error:", err);
    return Response.json(
      { error: "Gagal menghapus report & tiket" },
      { status: 500 }
    );
  }
}
