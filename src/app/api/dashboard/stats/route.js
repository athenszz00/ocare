import pool from "@/lib/db";


export async function GET() {
  try {
    // 1️⃣ Total berdasarkan status
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) AS total
      FROM reports
      GROUP BY status
    `);

    // 2️⃣ Total berdasarkan bulan
    const monthlyResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS total
      FROM reports
      GROUP BY month
      ORDER BY month ASC
    `);

    // 3️⃣ Total berdasarkan classification
    const classResult = await pool.query(`
      SELECT classification, COUNT(*) AS total
      FROM reports
      GROUP BY classification
    `);

    return Response.json({
      statusStats: statusResult.rows,
      monthlyStats: monthlyResult.rows,
      classStats: classResult.rows,
    });
  } catch (err) {
    console.error("❌ GET /api/dashboard/stats error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
