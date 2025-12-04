"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home, Ticket, BarChart, HelpCircle, LogOut, CircleAlert, Folder, Edit,
  Menu, Filter, Trash2, PlusCircle
} from "lucide-react";
import styles from "./complaints.module.css";
import Image from "next/image";
export default function ComplaintPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("Filter By Date/Month");
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newComplaint, setNewComplaint] = useState({
    name: "", email: "", classification: "", organisasi: "", description: "", status: "Pending"
  });

  // Daftar role yang punya akses penuh (seperti admin)
  const fullAccessRoles = ["admin", "validator", "approver", "solver", "operator"];

  // Role yang boleh akses User Management
  const userManagementRoles = ["admin", "operator"];

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(user);
    const currentRole = userData.role || "user";
    setRole(currentRole);

    // Fetch complaints hanya jika termasuk role yang punya akses penuh
    if (fullAccessRoles.includes(currentRole)) {
      fetchComplaints().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleAddComplaint = async () => {
    if (!newComplaint.name || !newComplaint.email || !newComplaint.classification || !newComplaint.organisasi || !newComplaint.description) {
      alert("Please fill all fields!");
      return;
    }
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint)
      });
      await res.json();
      alert("Complaint submitted successfully!");
      setNewComplaint({ name: "", email: "", classification: "", organisasi: "", description: "", status: "Pending" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (id) => setEditingId(id);

  const handleSave = async (id) => {
    const complaint = complaints.find(c => c.id === id);
    try {
      await fetch("/api/complaints", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaint)
      });
      setEditingId(null);
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch("/api/complaints", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      setComplaints(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeField = (id, field, value) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const filteredComplaints =
    filter === "Filter By Date/Month"
      ? complaints
      : complaints.filter(c => c.created_at?.includes(filter.split(" ")[0]));

  // === MENU ITEMS ===
  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Tickets", icon: Ticket, path: "/dashboard/tickets" },
    { name: "Reports", icon: BarChart, path: "/dashboard/reports", roles: fullAccessRoles },
    { name: "Complaint", icon: CircleAlert, path: "/dashboard/complaints" },
    { name: "FAQ", icon: HelpCircle, path: "/dashboard/faqs" },
    // Hanya admin & operator yang bisa lihat User Management
    { name: "User Management", icon: Folder, path: "/dashboard/usermanagement", roles: userManagementRoles },
  ];

  if (loading) return <p>Loading...</p>;

  const hasFullAccess = fullAccessRoles.includes(role);

  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <Image 
                src="/image/logoOcare.png" 
                alt="O-Care Logo" 
                width={120} 
                height={40} 
                style={{ objectFit: "contain" }}
                />
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className={styles.menu}>
          {menuItems.map(item => {
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
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h1>Complaint Page ({role})</h1>
        </header>

        <section className={styles.contentBox}>
          {/* === Jika bukan role dengan full access === */}
          {!hasFullAccess && (
            <div className={styles.formCard}>
              <h2>Submit a Complaint</h2>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newComplaint.name}
                  onChange={e => setNewComplaint({ ...newComplaint, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={newComplaint.email}
                  onChange={e => setNewComplaint({ ...newComplaint, email: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Klasifikasi</label>
                <select
                  value={newComplaint.classification}
                  onChange={e => setNewComplaint({ ...newComplaint, classification: e.target.value })}
                >
                  <option value="">Pilih Klasifikasi</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Lainnya">Lainnya</option>
                  <option value="Listrik & Alat">Listrik & Alat</option>
                  <option value="Pendingin & Bangunan ">Pendingin & Bangunan</option>
                  <option value="Mekanik & Utilitas">Mekanik & Utilitas</option>
                  <option value="Teknologi & Informasi">Teknologi & Informasi </option> 
                  <option value="Aset Perusahaan">Aset Perusahaan</option>
                  <option value="Manajemen Persediaan">Manajemen Persediaan</option>
                  <option value="Manajemen Pusat">Manajemen Pusat</option>
                  <option value="Hak Akses User">Hak Akses User</option>
                  <option value="Validasi HEPA">Validasi HEPA</option>
                  <option value="Kalibrasi Alat">Kalibrasi Alat</option>
                  <option value="Akuntansi Manajemen">Akuntansi Manajemen</option>
                  <option value="Holding">Holding</option>
                  <option value="Validasi Autoclave">Validasi Autoclave</option>
                  <option value="Operasional Human Capital">Operasional Human Capital</option>
                  <option value="Sekretariat">Sekretariat</option>
                  <option value="Layanan Kesehatan">Layanan Kesehatan</option>
                  <option value="Pengelolaan Spare Parts">Pengelolaan Spare Parts</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Organisasi</label>
                <select
                  value={newComplaint.organisasi}
                  onChange={e => setNewComplaint({ ...newComplaint, organisasi: e.target.value })}
                >
                      <option value="">Pilih Organisasi</option>
                      <option value="Divisi Matriks Riset & Pengembangan Produk">Divisi Matriks Riset & Pengembangan Produk</option>
                      <option value="Divisi Pemasaran">Divisi Pemasaran</option>
                      <option value="Divisi Quality Assurance">Divisi Quality Assurance</option>
                      <option value="Divisi Teknologi Informasi">Divisi Teknologi Informasi</option>
                      <option value="Divisi Umum">Divisi Umum</option>
                      <option value="Satuan Pengawasan Intern">Satuan Pengawasan Intern</option>
                      <option value="Seksi Administrasi Pembelian Capex & Pemeliharaan">Seksi Administrasi Pembelian Capex & Pemeliharaan</option>
                      <option value="Seksi Administrasi Pengiriman">Seksi Administrasi Pengiriman</option>
                      <option value="Seksi Akuntansi Biaya Vaksin Virus Dan Kombinasi">Seksi Akuntansi Biaya Vaksin Virus Dan Kombinasi</option>
                      <option value="Seksi Ayam SPF">Seksi Ayam SPF</option>
                      <option value="Seksi Data HC">Seksi Data HC</option>
                      <option value="Seksi Dokumentasi">Seksi Dokumentasi</option>
                      <option value="Seksi Hewan Model">Seksi Hewan Model</option>
                      <option value="Seksi HVAC">Seksi HVAC</option>
                      <option value="Seksi Hubungan Industrial">Seksi Hubungan Industrial</option>
                      <option value="Seksi In Process Control Campak Rubela">Seksi In Process Control Campak Rubela</option>
                      <option value="Seksi Karir">Seksi Karir</option>
                      <option value="Seksi Kas Dan Bank">Seksi Kas Dan Bank</option>
                      <option value="Seksi Kinerja">Seksi Kinerja</option>
                      <option value="Seksi Laboratorium Mikrobiologi">Seksi Laboratorium Mikrobiologi</option>
                      <option value="Seksi Manajemen Proyek">Seksi Manajemen Proyek</option>
                      <option value="Seksi Manajemen Resiko Perusahaan">Seksi Manajemen Resiko Perusahaan</option>
                      <option value="Seksi Media Bakteri">Seksi Media Bakteri</option>
                      <option value="Seksi Media Pemantauan Lingkungan">Seksi Media Pemantauan Lingkungan</option>
                      <option value="Seksi Media Virus">Seksi Media Virus</option>
                      <option value="Seksi Mekanik">Seksi Mekanik</option>
                      <option value="Seksi Operasional CSR">Seksi Operasional CSR</option>
                      <option value="Seksi Penerimaan Barang & Jasa">Seksi Penerimaan Barang & Jasa</option>
                      <option value="Seksi Pengisian">Seksi Pengisian</option>
                      <option value="Seksi Pengujian Bahan Baku Dan Penunjang">Seksi Pengujian Bahan Baku Dan Penunjang</option>
                      <option value="Seksi Pengujian Bahan Kemasan">Seksi Pengujian Bahan Kemasan</option>
                      <option value="Seksi Pengujian Mutu Anatoksin">Seksi Pengujian Mutu Anatoksin</option>
                      <option value="Seksi Pengujian Potensi Vaksin Bakteri">Seksi Pengujian Potensi Vaksin Bakteri</option>
                      <option value="Seksi Pengujian Vaksin BCG">Seksi Pengujian Vaksin BCG</option>
                      <option value="Seksi Pengepakan">Seksi Pengepakan</option>
                      <option value="Seksi Penunjang Produksi Formulasi Dan Pengisian Vaksin Dan Pelarut">Seksi Penunjang Produksi Formulasi Dan Pengisian Vaksin Dan Pelarut</option>
                      <option value="Seksi Penyelesaian Akhir OPV">Seksi Penyelesaian Akhir OPV</option>
                      <option value="Seksi Penyelesaian Akhir Vaksin BCG">Seksi Penyelesaian Akhir Vaksin BCG</option>
                      <option value="Seksi Penyelesaian Akhir Vaksin Difteri">Seksi Penyelesaian Akhir Vaksin Difteri</option>
                      <option value="Seksi Penyelesaian Akhir Vaksin Pertusis">Seksi Penyelesaian Akhir Vaksin Pertusis</option>
                      <option value="Seksi Penunjang Produksi Formulasi & Pengisian Vaksin Dan Pelarut">Seksi Penunjang Produksi Formulasi & Pengisian Vaksin Dan Pelarut</option>
                      <option value="Seksi Persiapan Bibit Dan Media Vaksin Difteri">Seksi Persiapan Bibit Dan Media Vaksin Difteri</option>
                      <option value="Seksi Persiapan Bibit Dan Media Vaksin Pertusis">Seksi Persiapan Bibit Dan Media Vaksin Pertusis</option>
                      <option value="Seksi Persiapan Formulasi Dan Pengisian Vaksin dan Pelarut">Seksi Persiapan Formulasi Dan Pengisian Vaksin dan Pelarut</option>
                      <option value="Seksi Persiapan OPV 2">Seksi Persiapan OPV 2</option>
                      <option value="Seksi Perencanaan Pengembangan Manusia">Seksi Perencanaan Pengembangan Manusia</option>
                      <option value="Seksi Poliklinik">Seksi Poliklinik</option>
                      <option value="Seksi Produksi Sera">Seksi Produksi Sera</option>
                      <option value="Seksi Produksi Vaksin BCG">Seksi Produksi Vaksin BCG  </option>
                      <option value="Seksi Produksi Vaksin Difteri">Seksi Produksi Vaksin Difteri</option>
                      <option value="Seksi Produksi Vaksin Hib">Seksi Produksi Vaksin Hib</option>
                      <option value="Seksi Produksi Vaksin Pertusis">Seksi Produksi Vaksin Pertusis</option>
                      <option value="Seksi Rekrutmen Dan Terminasi">Seksi Rekrutmen Dan Terminasi</option>
                      <option value="Seksi Sterilitas">Seksi Sterilitas</option>
                      <option value="Seksi Uji Klinis Vaksin Bakteri">Seksi Uji Klinis Vaksin Bakteri</option>
                      <option value="Seksi Water Treatment Plant">Seksi Water Treatment Plant</option>
                      <option value="Seksi WIP Dan Produk Akhir">Seksi WIP Dan Produk Akhir</option>
                      <option value="Seksi Work Life Balance">Seksi Work Life Balance</option>
                      <option value="Seksi Pengujian Mutu Vaksin Bakteri">Seksi Pengujian Mutu Vaksin Bakteri</option>
                      <option value="Bagian Perencanaan Produksi">Bagian Perencanaan Produksi</option>
                      <option value="Bagian QA Service">Bagian QA Service</option>
                      <option value="Seksi Produksi Vaksin Influenza">Seksi Produksi Vaksin Influenza</option>
                      <option value="Bagian Produksi Vaksin Influenza (sudah ada di atas, tidak duplikat)">Bagian Produksi Vaksin Influenza</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  placeholder="Describe your issue..."
                  value={newComplaint.description}
                  onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })}
                />
              </div>
              <div className={styles.buttonWrapper}>
                <button onClick={handleAddComplaint} className={styles.submitBtn}>
                  <PlusCircle size={16} /> Submit
                </button>
              </div>
            </div>
          )}

          {/* === Jika termasuk role dengan full access === */}
          {hasFullAccess && complaints.length > 0 && (
            <>
              <div className={styles.tableHeader}>
                <h2>Complaint List User</h2>
                <div className={styles.filterBox}>
                  <Filter size={16} />
                  <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className={styles.filterDropdown}
                  >
                    <option>Filter By Date/Month</option>
                    <option>October 2025</option>
                    <option>September 2025</option>
                  </select>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Klasifikasi</th>
                      <th>Organisasi</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map(row => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{editingId === row.id ? <input value={row.name} onChange={e => handleChangeField(row.id, "name", e.target.value)} /> : row.name}</td>
                        <td>{editingId === row.id ? <input value={row.email} onChange={e => handleChangeField(row.id, "email", e.target.value)} /> : row.email}</td>
                        <td>{editingId === row.id ? <input value={row.classification} onChange={e => handleChangeField(row.id, "classification", e.target.value)} /> : row.classification}</td>
                        <td>{editingId === row.id ? <input value={row.organisasi} onChange={e => handleChangeField(row.id, "organisasi", e.target.value)} /> : row.organisasi}</td>
                        <td>{editingId === row.id ? <input value={row.description} onChange={e => handleChangeField(row.id, "description", e.target.value)} /> : row.description}</td>
                        <td>{row.status}</td>
                        <td>{row.created_at}</td>
                        <td>{row.update_at}</td>
                        <td>
                          {editingId === row.id ? (
                            <button onClick={() => handleSave(row.id)} className={styles.saveBtn}>Save</button>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(row.id)} className={styles.editBtn}><Edit size={16} /></button>
                              <button onClick={() => handleDelete(row.id)} className={styles.deleteBtn}><Trash2 size={14} /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
