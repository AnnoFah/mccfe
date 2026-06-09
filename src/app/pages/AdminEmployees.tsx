import { useState } from "react";
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

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "1", name: "Admin MCC", email: "admin@mcc.id", department: "Manajemen", position: "Manajer/SPV", phone: "081234567890", joinDate: "2020-01-01", status: "aktif" },
  { id: "2", name: "Budi Santoso", email: "budi@mcc.id", department: "Kreatif", position: "Desainer Grafis", phone: "082345678901", joinDate: "2021-03-15", status: "aktif" },
  { id: "3", name: "Siti Rahma", email: "siti@mcc.id", department: "Event", position: "Event Coordinator", phone: "083456789012", joinDate: "2021-07-01", status: "aktif" },
  { id: "4", name: "Ahmad Fauzi", email: "ahmad@mcc.id", department: "IT", position: "Web Developer", phone: "084567890123", joinDate: "2022-01-10", status: "aktif" },
  { id: "5", name: "Dewi Kusuma", email: "dewi@mcc.id", department: "Marketing", position: "Marketing Specialist", phone: "085678901234", joinDate: "2022-04-20", status: "aktif" },
  { id: "6", name: "Rizal Pratama", email: "rizal@mcc.id", department: "Keuangan", position: "Akuntan", phone: "086789012345", joinDate: "2020-08-05", status: "aktif" },
  { id: "7", name: "Nurul Hidayah", email: "nurul@mcc.id", department: "Kreatif", position: "Fotografer", phone: "087890123456", joinDate: "2023-02-01", status: "aktif" },
  { id: "8", name: "Hendra Wijaya", email: "hendra@mcc.id", department: "Event", position: "Event Staff", phone: "088901234567", joinDate: "2023-06-15", status: "aktif" },
];

const DEPARTMENTS = ["Manajemen", "Kreatif", "Event", "IT", "Marketing", "Keuangan", "Operasional"];

const ITEMS_PER_PAGE = 6;

export function AdminEmployees() {
  const { records } = useAttendance();
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({
    name: "", email: "", department: "Kreatif", position: "", phone: "", joinDate: "", status: "aktif",
  });

  const today = new Date().toISOString().split("T")[0];
  const getLastAttendance = (id: string) => {
    const rec = records.filter((r) => r.userId === id).sort((a, b) => b.date.localeCompare(a.date))[0];
    return rec || null;
  };

  const filtered = employees.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAdd = () => {
    setEditEmployee(null);
    setForm({ name: "", email: "", department: "Kreatif", position: "", phone: "", joinDate: "", status: "aktif" });
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setForm({ ...emp });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.position) return;
    if (editEmployee) {
      setEmployees((prev) => prev.map((e) => (e.id === editEmployee.id ? { ...e, ...form } as Employee : e)));
    } else {
      setEmployees((prev) => [
        ...prev,
        { ...form, id: `${Date.now()}` } as Employee,
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
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
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kelola Karyawan</h2>
          <p className="text-sm text-gray-500 mt-0.5">{employees.filter((e) => e.status === "aktif").length} karyawan aktif</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1e3263] hover:bg-[#162550] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Karyawan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, jabatan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20 bg-white"
        >
          <option value="all">Semua Departemen</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Karyawan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Departemen</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Kontak</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bergabung</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Absensi Hari Ini</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    Tidak ada karyawan ditemukan
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => {
                  const lastAtt = getLastAttendance(emp.id);
                  const todayAtt = records.find((r) => r.userId === emp.id && r.date === today);
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1e3263] flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-800">{emp.department}</p>
                        <p className="text-xs text-gray-500">{emp.position}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{emp.phone}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {new Date(emp.joinDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        {todayAtt ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[todayAtt.status] || "bg-gray-300"}`} />
                            <span className="text-xs text-gray-700">
                              {todayAtt.checkIn ? todayAtt.checkIn : todayAtt.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Belum absen</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          emp.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {emp.status === "aktif" ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-1.5 text-gray-400 hover:text-[#1e3263] hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(emp.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? "bg-[#1e3263] text-white" : "text-gray-600 hover:bg-gray-100"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">{editEmployee ? "Edit Karyawan" : "Tambah Karyawan Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap *</label>
                  <input
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama lengkap"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@mcc.id"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Departemen</label>
                  <select
                    value={form.department || ""}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20 bg-white"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Jabatan *</label>
                  <input
                    value={form.position || ""}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="Jabatan"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">No. Telepon</label>
                  <input
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tanggal Bergabung</label>
                  <input
                    type="date"
                    value={form.joinDate || ""}
                    onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <div className="flex gap-3">
                    {(["aktif", "nonaktif"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition ${
                          form.status === s
                            ? s === "aktif" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-400 bg-gray-50 text-gray-700"
                            : "border-gray-200 text-gray-500"
                        }`}
                      >
                        {s === "aktif" ? "✅ Aktif" : "⏸ Non-Aktif"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Batal</button>
                <button
                  onClick={handleSave}
                  disabled={!form.name || !form.email || !form.position}
                  className="flex-1 py-3 bg-[#1e3263] text-white rounded-xl text-sm font-medium hover:bg-[#162550] disabled:opacity-50 transition"
                >
                  {editEmployee ? "Simpan Perubahan" : "Tambah Karyawan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Hapus Karyawan?</h3>
            <p className="text-sm text-gray-500 mb-5">Data karyawan ini akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
