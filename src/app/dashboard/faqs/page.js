"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Ticket,
  BarChart,
  User,
  LogOut,
  Folder,
  Menu,
  HelpCircle,
  CircleAlert,
  Search,
  Plus,
} from "lucide-react";
import styles from "./faqs.module.css";

export default function FAQPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("Guest");
  const [searchTerm, setSearchTerm] = useState("");
  const [openFAQ, setOpenFAQ] = useState(null);

  // Data FAQ
  const faqs = [
    {
      q: "Apakah create ticket di O-Care membutuhkan fee?",
      a: "Tidak, seluruh layanan pembuatan tiket di O-Care gratis untuk seluruh karyawan.",
    },
    {
      q: "Selain Software dan Hardware, apakah bisa request kategori lain yang berkaitan dengan IT?",
      a: "Ya, Anda bisa membuat request terkait infrastruktur, jaringan, atau akun sistem.",
    },
    {
      q: "Saat complaint ke O-Care berapa lama kira-kira untuk respon dan solvenya?",
      a: "Rata-rata respon dalam 1x24 jam dan penyelesaian tergantung kompleksitas masalah.",
    },
  ];

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

  const filteredFaqs = faqs.filter((item) =>
    item.q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Tickets", icon: Ticket, path: "/dashboard/tickets" },
    { name: "Reports", icon: BarChart, path: "/dashboard/reports", roles: ["admin", "operator", "validator", "approver", "solver"] },
    { name: "Complaint", icon: CircleAlert, path: "/dashboard/complaints", roles: ["admin", "operator", "validator", "approver", "solver"] },
    { name: "FAQ", icon: HelpCircle, path: "/dashboard/faqs" },
    { name: "User Management", icon: Folder, path: "/dashboard/usermanagement", roles: ["admin", "operator"] },
  ];

  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2>O - CARE</h2>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
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

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={22} />
        </button>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search Question Here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button>
              <Search size={18} />
            </button>
          </div>

          <div className={styles.faqList}>
            {filteredFaqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <Plus size={18} /> {faq.q}
                </button>
                {openFAQ === index && <p className={styles.faqAnswer}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerBrand}>
              <h3>O-CARE</h3>
              <p>
                Sistem pelayanan dan kebutuhan operasional untuk seluruh karyawan secara cepat, 
                responsif, dan terintegrasi.
              </p>
            </div>
            <div className={styles.footerSection}>
              <h4>Layanan</h4>
              <ul>
                <li>Software</li>
                <li>Hardware</li>
                <li>Networking</li>
                <li>Support & Etc</li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4>Kontak</h4>
              <ul>
                <li>📍 Jl. Pasteur No. 28, Bandung</li>
                <li>📞 1 500 810</li>
                <li>📧 o-care@biofarma.co.id</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            © 2025 O-Care — All Rights Reserved
          </div>
        </footer>

      </main>
    </div>
  );
}