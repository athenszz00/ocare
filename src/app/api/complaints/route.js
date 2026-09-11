import pool from "@/lib/db";


export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC");
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, classification, organisasi, description } = await req.json();
    const [result] = await pool.query(
      "INSERT INTO complaints (name, email, classification, organisasi, description) VALUES (?, ?, ?, ?, ?)",
      [name, email, classification, organisasi, description]
    );
    const [row] = await pool.query("SELECT * FROM complaints WHERE id = ?", [result.insertId]);
    return new Response(JSON.stringify(row[0]), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, name, email, classification, organisasi, description, status } = await req.json();
    await pool.query(
      "UPDATE complaints SET name=?, email=?, classification=?, organisasi=?, description=?, status=?, update_at=CURRENT_TIMESTAMP WHERE id=?",
      [name, email, classification, organisasi, description, status, id]
    );
    return new Response(JSON.stringify({ message: "Updated" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await pool.query("DELETE FROM complaints WHERE id=?", [id]);
    return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
