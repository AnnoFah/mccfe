import { useState, useEffect } from "react";
import { useAttendance } from "../context/AttendanceContext";
import { Search, Users, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  joinDate: string;
  status: "aktif" | "nonaktif";
}

const DEPARTMENTS = ["Manajemen", "Kreatif", "Event", "IT", "Marketing", "Keuangan", "Operasional"];

const ITEMS_PER_PAGE = 6;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export function AdminEmployees() {
  const { records } = useAttendance();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Notice we add password for new employees
  const [form, setForm] = useState<Partial<Employee> & { password?: string }>({
    name: "", email: "", department: "Kreatif", position: "", phone: "", joinDate: "", status: "aktif",
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem("mcc_token");
    if (!token) return;
    try {
      const qs = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(search && { search }),
        ...(deptFilter !== "all" && { department: deptFilter }),
      });
      const res = await fetch(`${API_URL}/employees?${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.data.map((e: any) => ({
          id: e.id,
          name: e.fullName,
          email: e.user?.email || "",
          department: e.department,
          position: e.position,
          phone: e.phone,
          joinDate: new Date(e.joinDate).toISOString().split("T")[0],
          status: e.user?.isActive ? "aktif" : "nonaktif",
        }));
        setEmployees(mapped);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to fetch employees", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, search, deptFilter]);

  const getLastAttendance = (id: string) => {
    const rec = records.filter((r) => r.userId === id).sort((a, b) => b.date.localeCompare(a.date))[0];
    return rec || null;
  };

  const openAdd = () => {
    setEditEmployee(null);
    setForm({ name: "", email: "", department: "Kreatif", position: "", phone: "", joinDate: new Date().toISOString().split("T")[0], status: "aktif" });
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setForm({ ...emp });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.position) return;
    const token = sessionStorage.getItem("mcc_token");
    
    try {
      if (editEmployee) {
        // Edit logic
        const res = await fetch(`${API_URL}/employees/${editEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            fullName: form.name,
            phone: form.phone,
            department: form.department,
            position: form.position,
            // the backend might not support updating email/status directly in employee edit, but we pass it anyway
          })
        });
        if (res.ok) {
          fetchEmployees();
          setShowModal(false);
        } else {
          const err = await res.json();
          alert(err.message || "Gagal mengubah data");
        }
      } else {
        // Create logic
        const employeeCode = "MCC" + Math.floor(1000 + Math.random() * 9000); // Random employee code
        const res = await fetch(`${API_URL}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            email: form.email,
            password: form.password || "mcc123", // default password
            fullName: form.name,
            employeeCode,
            phone: form.phone || "-",
            department: form.department,
            position: form.position,
            joinDate: new Date(form.joinDate || Date.now()).toISOString(),
          })
        });
        if (res.ok) {
          fetchEmployees();
          setShowModal(false);
        } else {
          const err = await res.json();
          alert(err.message || "Gagal menambah data");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleDelete = async (id: string) => {
    const token = sessionStorage.getItem("mcc_token");
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menghapus data");
      }
    } catch (e) {
      console.error(e);
    }
    setDeleteConfirm(null);
  };

  const STATUS_DOT: Record<string, string> = {
    hadir: "bg-green-500",
    terlambat: "bg-yellow-500",
    izin: "bg-blue-500",
    sakit: "bg-purple-500",
    alpha: "bg-red-500",
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manajemen Karyawan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola data karyawan dan lihat status terakhir mereka</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1e3263] text-white px-4 py-2 rounded-xl hover:bg-[#2d4a8c] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau posisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
        >
          <option value="all">Semua Departemen</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Status & Login</th>
                <th className="px-6 py-4">Absen Terakhir</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Tidak ada karyawan ditemukan.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const lastAtt = getLastAttendance(emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{emp.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {emp.position} • {emp.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div>{emp.email}</div>
                        <div className="text-xs text-gray-400">{emp.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex w-max px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                              emp.status === "aktif"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {emp.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                          <span className="text-[10px] text-gray-400">Join: {emp.joinDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {lastAtt ? (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[lastAtt.status] || "bg-gray-400"}`} />
                              <span className="font-medium capitalize text-gray-700">{lastAtt.status}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {lastAtt.date} {lastAtt.checkIn && `• ${lastAtt.checkIn}`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Belum ada absen</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(emp.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Halaman <span className="font-medium text-gray-800">{page}</span> dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1e3263]" />
                {editEmployee ? "Edit Karyawan" : "Tambah Karyawan"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled={!!editEmployee}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                </div>
                {!editEmployee && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru (Default: mcc123)</label>
                    <input
                      type="text"
                      value={form.password || ""}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="mcc123"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telepon</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Bergabung</label>
                  <input
                    type="date"
                    value={form.joinDate}
                    disabled={!!editEmployee}
                    onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Departemen</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Posisi</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium bg-[#1e3263] text-white rounded-lg hover:bg-[#2d4a8c] transition-colors"
                >
                  Simpan Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Karyawan?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Data karyawan ini akan dihapus secara permanen beserta data absensinya. Anda yakin?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
