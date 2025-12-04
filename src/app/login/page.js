"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./login.module.css";
import { FaUser, FaLock, FaEnvelope, FaGoogle, FaTwitter } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fungsi utama login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setMessage(data.message || "Terjadi kesalahan.");

    if (res.ok && data.success) {
  const userData = {
    id: data.user.id,
    username: data.user.username,
    role: data.user.role, // ✅ ambil dari backend
  };

  // Simpan user ke localStorage
  localStorage.setItem("user", JSON.stringify(userData));

  // Redirect ke dashboard
  setTimeout(() => {
    router.push("/dashboard");
  }, 300);
}

    } catch (error) {
      console.error("❌ Login error:", error);
      setMessage("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI halaman login
  return (
    <div className={styles.container}>
      {/* LEFT SIDE */}
      <div className={styles.leftSide}>
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.rightSide}>
        <div className={styles.loginBox}>
        <h1 className={styles.logo}>O - CARE</h1>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <FaUser className={styles.iconBlack} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <FaLock className={styles.iconBlack} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          {message && (
            <p
              className={`${styles.message} ${
                message.toLowerCase().includes("login berhasil")
                  ? styles.success
                  : styles.error
              }`}
            >
              {message}
            </p>
          )}

          <p className={styles.footer}>
            Belum punya akun?{" "}
            <Link href="/createAccount" className={styles.link}>
              Daftar Akun
            </Link>
          </p>

          {/* ✅ Bagian Icon Sosial Media */}
          <div className={styles.socialIcons}>
            <a
              href="https://leaflet.biofarma.co.id/e-leaflet/2ee8b771-a9bd-43bf-8be4-ec23d62749f7"
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaEnvelope className={styles.icon} />
            </a>
            <a
              href="https://www.biofarma.co.id/"
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGoogle className={styles.icon} />
            </a>
            <a
              href="https://x.com/biofarmaID"
              className={styles.iconLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className={styles.icon} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}