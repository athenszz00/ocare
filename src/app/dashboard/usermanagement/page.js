"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Ticket,
  BarChart,
  User,
  LogOut,
  Folder,
  Menu,
} from "lucide-react";
import styles from "./usermanagement.module.css";
import { PercentSquareIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { HelpCircle } from "lucide-react";
import Image from "next/image";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("Guest");
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password)
      return alert("Isi semua field!");
    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("User berhasil ditambahkan!");
      setNewUser({ username: "", password: "", role: "user" });
      fetchUsers();
    } else {
      alert(data.message || "Gagal menambah user");
    }
  };

  const handleEditUser = async (id) => {
    if (!editingUser.username || !editingUser.role)
      return alert("Username dan Role tidak boleh kosong!");

    setLoading(true);
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: editingUser.username,
        role: editingUser.role,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("User berhasil diperbarui!");
      setEditingUser(null);
      fetchUsers();
    } else {
      alert(data.message || "Gagal memperbarui user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      alert("User dihapus!");
      fetchUsers();
    } else {
      alert("Gagal menghapus user!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
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
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className={styles.menu}>
          <button
            className={`${styles.menuItem} ${
              pathname === "/dashboard" ? styles.active : ""
            }`}
            onClick={() => router.push("/dashboard")}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`${styles.menuItem} ${
              pathname.startsWith("/dashboard/tickets") ? styles.active : ""
            }`}
            onClick={() => router.push("/dashboard/tickets")}
          >
            <Ticket size={18} />
            <span>Tickets</span>
          </button>

          <button
            className={`${styles.menuItem} ${
              pathname === "/dashboard/reports" ? styles.active : ""
            }`}
            onClick={() => router.push("/dashboard/reports")}
          >
            <BarChart size={18} />
            <span>Reports</span>
          </button>

          <button
            className={`${styles.menuItem} ${
              pathname.startsWith("/dashboard/complaints") ? styles.active : ""
            }`}
            onClick={() => router.push("/dashboard/complaints")}
          >
            <CircleAlert size={18} />
            <span>Complaints</span>
          </button>

          <button
            className={`${styles.menuItem} ${
              pathname.startsWith("/dashboard/faqs") ? styles.active : ""
            }`}
            onClick={() => router.push("/dashboard/faqs")}
          >
            <HelpCircle size={18} />
            <span>FAQs</span>
          </button>

          <button
            className={`${styles.menuItem} ${
              pathname === "/dashboard/usermanagement" ? styles.active : ""
            }`}
            onClick={() => router.push("/dashboard/usermanagement")}
          >
            <Folder size={18} />
            <span>User Management</span>
          </button>

        </nav>

        <div className={styles.logoutSection}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className={styles.userInfo}>
            <span>👤 {username}</span>
            <p className={styles.role}>{role}</p>
          </div>
        </header>

        <div className={styles.contentBox}>
          <h2>👥 User Management</h2>

          {/* Add User Section */}
          <div className={styles.addSection}>
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="validator">Validator</option>
              <option value="approver">Approver</option>
              <option value="solver">Solver</option>
              <option value="operator">Operator</option>
            </select>
            <button onClick={handleAddUser} disabled={loading}>
              {loading ? "Menyimpan..." : "Tambah"}
            </button>
          </div>

          {/* Table Section */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {editingUser?.id === u.id ? (
                      <input
                        type="text"
                        value={editingUser.username}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            username: e.target.value,
                          })
                        }
                      />
                    ) : (
                      u.username
                    )}
                  </td>

                  <td>
                    {editingUser?.id === u.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="validator">Validator</option>
                        <option value="approver">Approver</option>
                        <option value="solver">Solver</option>
                        <option value="operator">Operator</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>

                  <td>
                    {editingUser?.id === u.id ? (
                      <>
                        <button onClick={() => handleEditUser(u.id)}>
                          💾 Simpan
                        </button>
                        <button onClick={() => setEditingUser(null)}>
                          ❌ Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingUser(u)}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)}>
                          🗑️ Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}