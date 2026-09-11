import pool from "@/lib/db";


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

    // UPDATE tickets
    await pool.query(
      `UPDATE tickets
       SET name=$1, title=$2, classification=$3, organisasi=$4, description=$5, status=$6, updated_at=NOW()
       WHERE id=$7`,
      [name, title, classification, organisasi, description, status, id]
    );

    // UPDATE reports
    await pool.query(
      `UPDATE reports
       SET name=$1, title=$2, classification=$3, organisasi=$4, description=$5, status=$6, updated_at=NOW()
       WHERE ticket_id=$7`,
      [name, title, classification, organisasi, description, status, id]
    );

    return Response.json({ message: "Tiket & report berhasil diperbarui" });
  } catch (err) {
    console.error("PUT /api/tickets/[id] error:", err);
    return Response.json(
      { error: "Gagal memperbarui tiket & report" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await pool.query("DELETE FROM reports WHERE ticket_id=$1", [id]);
    await pool.query("DELETE FROM tickets WHERE id=$1", [id]);

    return Response.json({ message: "Tiket & report berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/tickets/[id] error:", err);
    return Response.json(
      { error: "Gagal menghapus tiket & report" },
      { status: 500 }
    );
  }
}
