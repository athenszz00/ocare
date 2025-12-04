"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Ticket,
  BarChart,
  Settings,
  User,
  LogOut,
  ListChecks,
  FolderOpen,
  CheckCircle,
  Menu,
  Folder,
  HelpCircle,
  CircleAlert
} from "lucide-react";

import styles from "./dashboard.module.css";

// ✅ Recharts (TIDAK ada duplikat LineChart)
import {
  PieChart,
  Pie,
  Cell,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("Guest");

  // ✅ state grafik
  const [stats, setStats] = useState({
    statusStats: [],
    monthlyStats: [],
    classStats: []
  });

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      setRole(parsed.role || "user");
      setUsername(parsed.username || "Guest");
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ✅ Fetch Stats
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Stat Error:", err);
      }
    }
    loadStats();
  }, []);

  const statusData = stats.statusStats || [];
  const monthlyData = stats.monthlyStats || [];
  const classData = stats.classStats || [];

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Tickets", icon: Ticket, path: "/dashboard/tickets" },
    { name: "Reports", icon: BarChart, path: "/dashboard/reports", roles: ["admin", "validator", "approver", "solver", "operator"] },
    { name: "Complaints", icon: CircleAlert, path: "/dashboard/complaints" },
    { name: "FAQ", icon: HelpCircle, path: "/dashboard/faqs" },
    { name: "User Management", icon: Folder, path: "/dashboard/usermanagement", roles: ["admin", "operator"] }
  ];

  return (
    <div className={styles.container}>
      
      {/* ================= SIDEBAR ================= */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <Image 
            src="/image/logoOcare.png" 
            alt="O-Care Logo" 
            width={120} 
            height={40} 
            style={{ objectFit: "contain" }}
          />
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <nav className={styles.menu}>
          {menuItems.map((item) => {
            if (item.roles && !item.roles.includes(role)) return null;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
                onClick={() => router.push(item.path)}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.logoutSection}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className={styles.main}>

        {/* HEADER */}
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className={styles.userInfo}>
            <span>👋 {username}</span>
            <p className={styles.role}>{role}</p>
          </div>
        </header>

        <div className={styles.contentBox}>
          <h1>Welcome to O-Care Dashboard</h1>
          <p>Kelola semua aktivitas layanan pelanggan dengan mudah dan cepat.</p>

          {/* ================= KPI CARDS ================= */}
          <div className={styles.dashboardGrid}>
            <div className={styles.card}><ListChecks size={30} /><h3>New Tickets</h3></div>
            <div className={styles.card}><FolderOpen size={30} /><h3>In Progress</h3></div>
            <div className={styles.card}><CheckCircle size={30} /><h3>Resolved</h3></div>
          </div>

          <br />

          {/* ================= CHARTS GRID ================= */}
          <div className={styles.chartsGrid}>

            {/* ✅ CHART 1 */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Status Ticket</h2>
              <PieChart width={260} height={260}>
                <Pie data={statusData} dataKey="total" nameKey="status" outerRadius={90} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            {/* ✅ CHART 2 */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Jumlah Report Per Bulan</h2>
              <RBarChart width={320} height={260} data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#0088FE" />
              </RBarChart>
            </div>

            {/* ✅ CHART 3 */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Report Berdasarkan Classification</h2>
              <AreaChart width={320} height={260} data={classData}>
                <XAxis dataKey="classification" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" fill="#00C49F" />
              </AreaChart>
            </div>

            {/* ✅ CHART 4 → **LineChart asli** */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Tren Report (Line Chart)</h2>
              <LineChart width={320} height={260} data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#FF8042" strokeWidth={3} />
              </LineChart>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
