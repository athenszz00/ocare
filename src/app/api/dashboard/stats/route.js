import { pool } from "@/lib/db";

export async function GET() {
  try {
    // 1. Total per status
    const [statusRows] = await pool.query(`
      SELECT status, COUNT(*) AS total
      FROM reports
      GROUP BY status
    `);

    // 2. Total per bulan (created)
    const [monthlyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS total
      FROM reports
      GROUP BY month
      ORDER BY month ASC
    `);

    // 3. Total per classification
    const [classRows] = await pool.query(`
      SELECT classification, COUNT(*) AS total
      FROM reports
      GROUP BY classification
    `);

    return Response.json({
      statusStats: statusRows,
      monthlyStats: monthlyRows,
      classStats: classRows
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
