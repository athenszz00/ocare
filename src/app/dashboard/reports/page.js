"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Ticket,
  BarChart,
  CircleAlert,
  HelpCircle,
  LogOut,
  Menu,
  Folder,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styles from "./reports.module.css";

// ===== Helper: format tanggal lokal untuk MySQL DATETIME =====
const formatLocalDate = (date) => {
  const d = date ? new Date(date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
};

// ===== Helper: tampilkan tanggal di tabel (lokal) =====
const formatDisplayDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function ReportsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [rows, setRows] = useState([]);
  const [role, setRole] = useState("");
  const [editingId, setEditingId] = useState(null);

  // ===== Fetch Reports =====
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setRows(data);
      else if (Array.isArray(data.rows)) setRows(data.rows);
      else setRows([]);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, []);

  // ===== Ambil Role User =====
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setRole(parsed.role?.toLowerCase() || "");
      } catch {
        setRole("");
      }
    }
  }, []);

  // ===== Filter by Month =====
  const filteredRows = rows.filter((r) =>
    filterDate ? String(r.created).startsWith(filterDate) : true
  );

  // ===== Export Excel =====
  const exportToExcel = () => {
    const exportData = filteredRows.map((r) => ({
      ...r,
      created: formatLocalDate(r.created),
      updated: formatLocalDate(r.updated),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "ReportList.xlsx");
  };

  // ===== Export PDF =====
  const exportToPDF = () => {
    const doc = new jsPDF();
    const head = [["ID", "Name", "Title", "Status", "Created"]];
    const body = filteredRows.map((r) => [
      r.id,
      r.name,
      r.title,
      r.status,
      formatDisplayDate(r.created),
    ]);
    doc.autoTable({ head, body });
    doc.save("reports.pdf");
  };

  // ===== Update Report API =====
  const updateReport = async (report) => {
    try {
      const res = await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error("Gagal update data ke server");
      return await res.json();
    } catch (err) {
      console.error("Error updating report:", err);
      alert("❌ Gagal menyimpan ke server!");
    }
  };

  // ===== Handle Save Per Row =====
  const handleSaveRow = async (id) => {
    const rowIndex = rows.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const updatedTime = formatLocalDate(new Date());
    const updatedRow = { ...rows[rowIndex], updated: updatedTime };

    try {
      await updateReport(updatedRow);

      // Update state lokal supaya UI langsung berubah
      const newRows = [...rows];
      newRows[rowIndex] = updatedRow;
      setRows(newRows);

      alert("✅ Data berhasil disimpan!");
      setEditingId(null);
    } catch (err) {
      console.error("Error saving row:", err);
      alert("❌ Gagal menyimpan data!");
    }
  };

  // ===== Delete =====
  const handleDelete = async (id) => {
    if (!confirm("Hapus record ini?")) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus");
      alert("✅ Data berhasil dihapus");
      fetchReports();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Gagal menghapus data");
    }
  };

  // ===== Handle Cell Change =====
  const handleChange = (i, field, value) => {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: value };
    setRows(updated);
  };

  const userManagementRoles = ["admin", "operator"];

  // ===== Render =====
  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}>
        <div className={styles.logo}>O - CARE</div>
        <button className={styles.closeBtn} onClick={() => setIsSidebarOpen(false)}>
          <span className={styles.closeIcon}>×</span>
        </button>
        <nav className={styles.menu}>
          <button onClick={() => router.push("/dashboard")} className={styles.menuItem}>
            <Home size={18} />
            <span>Dashboard</span>
          </button>
          <button onClick={() => router.push("/dashboard/tickets")} className={styles.menuItem}>
            <Ticket size={18} />
            <span>Tickets</span>
          </button>
          <button onClick={() => router.push("/dashboard/reports")} className={styles.menuItem}>
            <BarChart size={18} />
            <span>Reports</span>
          </button>
          <button onClick={() => router.push("/dashboard/complaints")} className={styles.menuItem}>
            <CircleAlert size={18} />
            <span>Complaints</span>
          </button>
          <button onClick={() => router.push("/dashboard/faqs")} className={styles.menuItem}>
            <HelpCircle size={18} />
            <span>FAQ</span>
          </button>
          {userManagementRoles.includes(role) && (
            <button
              onClick={() => router.push("/dashboard/usermanagement")}
              className={styles.menuItem}
            >
              <Folder size={18} />
              <span>User Management</span>
            </button>
          )}
        </nav>
        <div className={styles.profileSection}>
          <button className={styles.logoutBtn} onClick={() => { localStorage.removeItem("user"); router.push("/login"); }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className={styles.headerTop}>
        <button className={styles.sidebarToggle} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.headerTop}>
          <h1>Reports Page</h1>
        </div>

        <div className={styles.reportBox}>
          <div className={styles.reportHeader}>
            <h2>Report List User</h2>
            <div className={styles.actionBtns}>
              <select
                className={styles.filterDropdown}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="">Filter By Month</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = String(i + 1).padStart(2, "0");
                  return (
                    <option key={i} value={`${month}`}>
                      {new Date(2025, i).toLocaleString("en-US", { month: "long" })}
                    </option>
                  );
                })}
              </select>

              <button className={styles.exportBtn} onClick={exportToExcel}>Export to Excel</button>
              <button className={styles.uploadBtn} onClick={() => document.getElementById("excelUpload").click()}>
                Upload Excel
              </button>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                id="excelUpload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                    const normalized = json.map((r) => ({
                      id: r.Id || r.id || undefined,
                      name: r.Name || r.name || "",
                      title: r.Title || r.title || "",
                      classification: r.Classification || r.classification || "",
                      organisasi: r.Organisasi || r.organisasi || "",
                      description: r.Description || r.description || "",
                      status: r.Status || r.status || "",
                      created: formatLocalDate(r.Created || r.created),
                      updated: formatLocalDate(r.Updated || r.updated),
                    }));
                    const res = await fetch("/api/reports/upload", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ records: normalized }),
                    });
                    if (!res.ok) throw new Error("Upload failed");
                    alert("✅ Excel berhasil di-upload dan disimpan!");
                    fetchReports();
                  };
                  reader.readAsArrayBuffer(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Classification</th>
                  <th>Organisasi</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, i) => (
                    <tr key={row.id || i}>
                      <td>{row.id}</td>
                      {["name", "title", "classification", "organisasi", "description", "status", "created", "updated"].map((field) => (
                        <td key={field}>
                          {editingId === row.id && !["created","updated"].includes(field) ? (
                            <input
                              value={row[field] || ""}
                              onChange={(e) => handleChange(i, field, e.target.value)}
                              className={styles.inputEdit}
                            />
                          ) : ["created","updated"].includes(field) ? (
                            formatDisplayDate(row[field])
                          ) : (
                            row[field]
                          )}
                        </td>
                      ))}
                      <td>
                        {editingId === row.id ? (
                          <button className={styles.saveBtn} onClick={() => handleSaveRow(row.id)}>
                            Save
                          </button>
                        ) : (
                          <button className={styles.editBtn} onClick={() => setEditingId(row.id)}>
                            Edit
                          </button>
                        )}
                        <button
                          title="Delete"
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(row.id)}
                          style={{ marginLeft: "6px" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", color: "#666" }}>
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
