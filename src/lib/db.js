import mysql from "mysql2/promise";

let globalWithPool = globalThis;

if (!globalWithPool.pool) {
  globalWithPool.pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "ocare",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// ✅ Export pool langsung
export const pool = globalWithPool.pool;
