import pool from "@/lib/db";


export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { username, role } = await req.json();

    await pool.query(
      "UPDATE users SET username = ?, role = ? WHERE id = ?",
      [username, role, id]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT User Error:", err);
    return Response.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE User Error:", err);
    return Response.json({ success: false }, { status: 500 });
  }
}