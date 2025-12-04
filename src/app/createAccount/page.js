"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./createAccount.module.css";

export default function CreateAccount() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${window.location.origin}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();
      setMessage(data.message || "Tidak ada respons dari server.");
    } catch (error) {
      console.error("❌ Error:", error);
      setMessage("Terjadi kesalahan jaringan.");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      
      {/* LEFT SIDE */}
      <div className={styles.leftSide}>
        <div className={styles.textBox}>
          <h2>Who's care with you?</h2>
          <p>"We are here for your request"</p>
          <span>- Anonym -</span>
        </div>

        <div className={styles.illustration}>
          <Image src="/log.svg" width={250} height={250} alt="ocare-logo" priority />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.rightSide}>
        <div className={styles.registerBox}>
          <h1 className={styles.title}>Daftar Akun Baru</h1>
          <p className={styles.subtitle}>O-Care hadir untuk layanan lebih baik.</p>

          <form onSubmit={handleRegister} className={styles.form}>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Email / Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="validator">Validator</option>
                <option value="approver">Approver</option>
                <option value="solver">Solver</option>
                <option value="operator">Operator</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className={styles.registerButton}>
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>

          {message && (
            <p
              className={`${styles.message} ${
                message.toLowerCase().includes("berhasil")
                  ? styles.success
                  : styles.error
              }`}
            >
              {message}
            </p>
          )}

          <p className={styles.footerText}>
            Sudah punya akun?{" "}
            <Link href="/login" className={styles.footerLink}>
              Masuk
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}