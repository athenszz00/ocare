"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Ticket,
  BarChart,
  LogOut,
  Menu,
  Trash2,
  Edit,
  X,
  CircleAlert,
  HelpCircle,
  Folder,
} from "lucide-react";
import * as XLSX from "xlsx";
import styles from "./tickets.module.css";
import Image from "next/image";
export default function TicketsPage() {
  const router = useRouter();

  // ============================================================
  // ✅ STATE
  // ============================================================
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTicket, setNewTicket] = useState({
    name: "",
    title: "",
    classification: "",
    organisasi: "",
    description: "",
    status: "In Progress",
  });

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    classification: "",
    organisasi: "",
    description: "",
    file: null,
  });

  // ============================================================
  // ✅ CHECK LOGIN
  // ============================================================
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return router.push("/login");

    try {
      const parsed = JSON.parse(stored);

      if (!parsed.role) return router.push("/login");

      setRole(parsed.role);
      setUsername(parsed.username || "Guest");
    } catch {
      localStorage.removeItem("user");
      return router.push("/login");
    }

    setLoadingUser(false);
  }, []);

  // ============================================================
  // ✅ FETCH DATA (ADMIN & OPERATOR)
  // ============================================================
  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets", { cache: "no-store" });
      if (!res.ok) return setTickets([]);

      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    }
  };

  useEffect(() => {
    if (role === "admin" || role === "operator" || role === "validator" || role === "approver" || role === "solver") fetchTickets();
  }, [role]);

  // ============================================================
  // ✅ LOGOUT
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };


const handleUploadExcel = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);

      // FIX PALING PENTING
      const workbook = XLSX.read(data, { 
        type: "array",
        cellDates: false,  // ⬅ jangan convert ke Date JS
        raw: true          // ⬅ kirim isi cell apa adanya dari Excel
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet, { 
        defval: "",
        raw: true  // ⬅ WAJIB agar date tetap serial number / string
      });

      // mapping data TANPA merusak tanggal
      const normalized = json.map((r) => ({
        id: r.Id || r.id || undefined,
        name: r.Name || r.name || "",
        title: r.Title || r.title || "",
        classification: r.Classification || r.classification || "",
        organisasi: r.Organisasi || r.organisasi || "",
        description: r.Description || r.description || "",
        status: r.Status || r.status || "Open",
        created_at: r.Created || r.created || null,  // ⬅ nama disamakan dengan backend
        updated_at: r.Updated || r.updated || null,  // ⬅ sama juga
      }));

      // Kirim ke backend
      const res = await fetch("/api/tickets/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: normalized }),
      });

      if (!res.ok) throw new Error("Upload failed");

      alert("✅ File Excel berhasil di-upload!");
      fetchTickets();
    };

    reader.readAsArrayBuffer(file);
  } catch (err) {
    console.error("Upload error:", err);
    alert("❌ Gagal meng-upload file Excel!");
  } finally {
    e.target.value = "";
  }
};



  // ============================================================
  // ✅ ADD TICKET
  // ============================================================
  const handleSaveNewTicket = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket),
    });

    if (res.ok) {
      alert("Tiket berhasil ditambahkan!");
      fetchTickets();
      setShowAddModal(false);
      setNewTicket({
        name: "",
        title: "",
        classification: "",
        organisasi: "",
        description: "",
        status: "Open",
      });
    } else {
      alert("Gagal menambah tiket!");
    }
  };

  // ============================================================
  // ✅ DELETE TICKET
  // ============================================================
  const handleDelete = async (id) => {
    if (!confirm("Hapus tiket ini?")) return;

    const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });

    if (res.ok) {
      alert("Tiket dihapus!");
      fetchTickets();
    } else {
      alert("Gagal hapus tiket.");
    }
  };

  // ============================================================
  // ✅ EDIT TICKET
  // ============================================================
  const handleEdit = (id) => {
    const ticket = tickets.find((t) => t.id === id);
    setEditingId(id);
    setEditingTicket({ ...ticket });
  };

  const handleSaveEdit = async () => {
    const res = await fetch(`/api/tickets/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingTicket),
    });

    if (res.ok) {
      alert("Update berhasil!");
      fetchTickets();
      setEditingId(null);
      setEditingTicket(null);
    } else {
      alert("Gagal update!");
    }
  };

  // ============================================================
  // ✅ FORM USER
  // ============================================================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      title: formData.title,
      classification: formData.classification,
      organisasi: formData.organisasi,
      description: formData.description,
      status: "In Progress",
    };

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Tiket berhasil dikirim!");
      setFormData({
        name: "",
        title: "",
        classification: "",
        organisasi: "",
        description: "",
        file: null,
      });
    } else {
      alert("Gagal mengirim tiket!");
    }
  };

  // ============================================================
  // ✅ LOADING
  // ============================================================
  if (loadingUser) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading...</p>
      </div>
    );
  }

  // ============================================================
  // ✅ UI
  // ============================================================
  return (
    <div className={styles.container}>
      {/* ✅ SIDEBAR */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <Image 
            src="/image/logoOcare.png" 
            alt="O-Care Logo" 
            width={120} 
            height={40} 
            style={{ objectFit: "contain" }}
          />
          <button
            className={styles.closeBtn}
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className={styles.menu}>
          <button
            onClick={() => router.push("/dashboard")}
            className={styles.menuItem}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/tickets")}
            className={styles.menuItem}
          >
            <Ticket size={18} />
            <span>Tickets</span>
          </button>

          {(role === "admin" || role === "operator" || role === "validator" || role === "approver" || role === "solver") && (
            <button
              onClick={() => router.push("/dashboard/reports")}
              className={styles.menuItem}
            >
              <BarChart size={18} />
              <span>Reports</span>
            </button>
          )}

          <button
            onClick={() => router.push("/dashboard/complaints")}
            className={styles.menuItem}
          >
            <CircleAlert size={18} />
            <span>Complaints</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/faqs")}
            className={styles.menuItem}
          >
            <HelpCircle size={18} />
            <span>FAQ</span>
          </button>

          {/* ✅ User Management — Admin & Operator Only */}
          {(role === "admin" || role === "operator") && (
            <button
              onClick={() => router.push("/dashboard/usermanagement")}
              className={styles.menuItem}
            >
              <Folder size={18} />
              <span>User Management</span>
            </button>
          )}
        </nav>

        <div className={styles.logoutSection}>
          <button onClick={handleLogout} className={styles.logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <button
        className={styles.toggleBtn}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* ✅ MAIN CONTENT */}
      <main className={styles.mainContent}>
        {(role === "admin" || role === "operator" || role === "validator" || role === "approver" || role === "solver") ? (
          <>
            <div className={styles.header}>
              <h1>Daftar Ticket Pengguna</h1>
              <button
                onClick={() => setShowAddModal(true)}
                className={styles.addBtn}
              >
                + Tambah Ticket
              </button>
              <button
                className={styles.uploadBtn}
                onClick={() => document.getElementById("excelUpload").click()}>
                📤 Upload Excel / CSV
              </button>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                id="excelUpload"
                onChange={handleUploadExcel}
              />

              
            </div>

            {/* ✅ TABLE */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Title</th>
                    <th>Klasifikasi</th>
                    <th>Organisasi</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className={styles.empty}>
                        Tidak ada tiket.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          {editingId === ticket.id ? (
                            <input
                              value={editingTicket.name}
                              onChange={(e) =>
                                setEditingTicket({
                                  ...editingTicket,
                                  name: e.target.value,
                                })
                              }
                            />
                          ) : (
                            ticket.name
                          )}
                        </td>

                        <td>
                          {editingId === ticket.id ? (
                            <input
                              value={editingTicket.title}
                              onChange={(e) =>
                                setEditingTicket({
                                  ...editingTicket,
                                  title: e.target.value,
                                })
                              }
                            />
                          ) : (
                            ticket.title
                          )}
                        </td>

                        <td>
                          {editingId === ticket.id ? (
                            <select
                              value={editingTicket.classification}
                              onChange={(e) =>
                                setEditingTicket({
                                  ...editingTicket,
                                  classification: e.target.value,
                                })
                              }
                            >
                              <option value="Software">Software</option>
                              <option value="Hardware">Hardware</option>
                              <option value="Network">Network</option>
                              <option value="Listrik & Alat">Listrik & Alat</option>
                              <option value="Pendingin & Bangunan ">Pendingin & Bangunan</option>
                              <option value="Mekanik & Utilitas">Mekanik & Utilitas</option>
                              <option value="Teknologi & Informasi">Teknologi & Informasi </option> 
                              <option value="Aset Perusahaan">Aset Perusahaan</option>
                              <option value="Manajemen Persediaan">Manajemen Persediaan</option>
                              <option value="Manajemen Aset">Manajemen Aset</option>
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
                          ) : (
                            ticket.classification
                          )}
                        </td>

                        <td>
                          {editingId === ticket.id ? (
                            <select
                              value={editingTicket.organisasi}
                              onChange={(e) =>
                                setEditingTicket({
                                  ...editingTicket,
                                  organisasi: e.target.value,
                                })
                              }
                            >
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
                          ) : (
                            ticket.organisasi
                          )}
                        </td>

                        <td>
                          {editingId === ticket.id ? (
                            <textarea
                              rows={2}
                              value={editingTicket.description}
                              onChange={(e) =>
                                setEditingTicket({
                                  ...editingTicket,
                                  description: e.target.value,
                                })
                              }
                            />
                          ) : (
                            ticket.description
                          )}
                        </td>

                        <td>
                          {editingId === ticket.id ? (
                            <select
                              value={editingTicket.status}
                              onChange={(e) =>
                                setEditingTicket({
                                  ...editingTicket,
                                  status: e.target.value,
                                })
                              }
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value ="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                          ) : (
                            ticket.status
                          )}
                        </td>

                        <td className={styles.actions}>
                          {editingId === ticket.id ? (
                            <button
                              className={styles.saveBtnSmall}
                              onClick={handleSaveEdit}
                            >
                              Simpan
                            </button>
                          ) : (
                            <button
                              className={styles.editBtn}
                              onClick={() => handleEdit(ticket.id)}
                            >
                              <Edit size={16} />
                            </button>
                          )}

                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(ticket.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ MODAL TAMBAH TICKET */}
            {showAddModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <div className={styles.modalHeader}>
                    <h2>Tambah Ticket Baru</h2>
                    <button
                      className={styles.sidebarCloseBtn}
                      onClick={() => setShowAddModal(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSaveNewTicket}
                    className={styles.modalForm}
                  >
                    <label>Nama</label>
                    <input
                      type="text"
                      value={newTicket.name}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, name: e.target.value })
                      }
                      required
                    />

                    <label>Title</label>
                    <input
                      type="text"
                      value={newTicket.title}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, title: e.target.value })
                      }
                      required
                    />

                    <label className={styles.formclassification}>Klasifikasi</label>
                    <select
                      value={newTicket.classification}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, classification: e.target.value })
                      }
                      required
                    >
                      <option value="">Pilih Klasifikasi</option>
                      <option value="Software">Software</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Network">Network</option>
                      <option value="Listrik & Alat">Listrik & Alat</option>
                      <option value="Pendingin & Bangunan ">Pendingin & Bangunan</option>
                      <option value="Mekanik & Utilitas">Mekanik & Utilitas</option>
                      <option value="Teknologi & Informasi">Teknologi & Informasi </option>
                      <option value="Aset Perusahaan">Aset Perusahaan</option>
                      <option value="Manajemen Persediaan">Manajemen Persediaan</option>
                      <option value="Manajemen Aset">Manajemen Aset</option>
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
                    
                    <label className={styles.formclassification}>Organisasi</label>
                    <select
                      value={newTicket.organisasi}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, organisasi: e.target.value })
                      }
                      required
                    >
                      <option value="">Pilih Organisasi</option>
                      <option value="Bagian Administrasi Keuangan">Bagian Administrasi Keuangan</option>
                      <option value="Bagian Akuntansi Keuangan">Bagian Akuntansi Keuangan</option>
                      <option value="Bagian Distribusi/PBF">Bagian Distribusi/PBF</option>
                      <option value="Bagian Formulasi dan Pengisian Vaksin dan Pelarut">Bagian Formulasi dan Pengisian Vaksin dan Pelarut</option>
                      <option value="Bagian Formulasi dan Pengisian Vaksin dan Sera ">Bagian Formulasi dan Pengisian Vaksin dan Sera </option>
                      <option value="Bagian Geographical Marketers Matrix">Bagian Geographical Marketers Matrix</option>
                      <option value="Bagian Hukum">Bagian Hukum</option>
                      <option value="Bagian Lingkungan, Kesehatan dan Keselamatan">Bagian Lingkungan, Kesehatan dan Keselamatan</option>
                      <option value="Bagian Listrik dan Alat">Bagian Listrik dan Alat</option>
                      <option value="Bagian Marketing Finance">Bagian Marketing Finance</option>
                      <option value="Bagian Market Communication">Bagian Market Communication</option>
                      <option value="Bagian Matriks Analis Perencanaan Dan Strategi Bisnis">Bagian Matriks Analis Perencanaan Dan Strategi Bisnis</option>
                      <option value="Bagian Mekanik Dan Utilitas">Bagian Mekanik Dan Utilitas</option>
                      <option value="Bagian Pajak">Bagian Pajak</option>
                      <option value="Bagian Pelayanan Medis">Bagian Pelayanan Medis</option>
                      <option value="Bagian Pembelian Umum">Bagian Pembelian Umum</option>
                      <option value="Bagian Penjualan Korporasi Ekspor">Bagian Penjualan Korporasi Ekspor</option>
                      <option value="Bagian Pengembangan Sistem TI">Bagian Pengembangan Sistem TI</option>
                      <option value="Bagian Pengujian Mutu Kimia Dan Fisika">Bagian Pengujian Mutu Kimia Dan Fisika</option>
                      <option value="Bagian Pengujian Mutu Mikrobiologi">Bagian Pengujian Mutu Mikrobiologi</option>
                      <option value="Bagian Produksi Media">Bagian Produksi Media</option>
                      <option value="Bagian Produksi Vaksin BCG">Bagian Produksi Vaksin BCG</option>
                      <option value="Bagian Produksi Vaksin Campak">Bagian Produksi Vaksin Campak</option>
                      <option value="Bagian Produksi Vaksin Difteri">Bagian Produksi Vaksin Difteri</option>
                      <option value="Bagian Produksi Vaksin Hib">Bagian Produksi Vaksin Hib</option>
                      <option value="Bagian Produksi Vaksin Influenza">Bagian Produksi Vaksin Influenza</option>
                      <option value="Bagian Produksi Vaksin Pertusis">Bagian Produksi Vaksin Pertusis</option>
                      <option value="Bagian Produksi Vaksin sIPV">Bagian Produksi Vaksin sIPV</option>
                      <option value="Bagian QA Operation">Bagian QA Operation</option>
                      <option value="Bagian Registrasi Luar Negeri">Bagian Registrasi Luar Negeri</option>
                      <option value="Bagian Sekretariat">Bagian Sekretariat</option>
                      <option value="Bagian Uji Hewan">Bagian Uji Hewan</option>
                      <option value="Bagian Uji Klinis">Bagian Uji Klinis</option>
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

                    <label>Deskripsi</label>
                    <textarea
                      rows="3"
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          description: e.target.value,
                        })
                      }
                      required
                    />

                    <label>Status</label>
                    <select
                      value={newTicket.status}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, status: e.target.value })
                      }
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      
                    </select>

                    <div className={styles.modalButtons}>
                      <button type="submit" className={styles.saveBtn}>
                        Simpan
                      </button>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => setShowAddModal(false)}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          // ✅ USER FORM
          <div className={styles.formContainer}>
            <h1>Buat Tiket Bantuan</h1>
            <form onSubmit={handleSubmit}>
              <label>Nama</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <label>Klasifikasi</label>
              <select
                name="classification"
                value={formData.classification}
                onChange={handleChange}
                required
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

              <label>Organisasi</label>
              <select
                name="organisasi"
                value={formData.organisasi}
                onChange={handleChange}
                required
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
              <label>Deskripsi</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />

              <label>Upload Bukti (opsional)</label>
              <input type="file" name="file" onChange={handleChange} />

              <button type="submit" className={styles.submitBtn}>
                Kirim Tiket
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}