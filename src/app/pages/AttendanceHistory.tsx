import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAttendance } from "../context/AttendanceContext";
import { Search, Calendar, Clock, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  hadir: { label: "Hadir", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  terlambat: { label: "Terlambat", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  izin: { label: "Izin", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  sakit: { label: "Sakit", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  alpha: { label: "Alpha", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

const ITEMS_PER_PAGE = 8;

export function AttendanceHistory() {
  const { user } = useAuth();
  const { getUserRecords } = useAttendance();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const records = getUserRecords(user!.id);

  const filtered = records.filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchSearch =
      !searchQuery ||
      new Date(r.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const hadirCount = records.filter((r) => r.status === "hadir").length;
  const terlambatCount = records.filter((r) => r.status === "terlambat").length;
  const izinCount = records.filter((r) => r.status === "izin").length;
  const sakitCount = records.filter((r) => r.status === "sakit").length;
  const alphaCount = records.filter((r) => r.status === "alpha").length;
  const totalWorkHours = records.reduce((acc, r) => acc + (r.workHours || 0), 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Riwayat Absensi</h2>
        <p className="text-sm text-gray-500 mt-0.5">Rekap data kehadiran Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Hadir", value: hadirCount, color: "text-green-600", bg: "bg-green-50 border-green-100" },
          { label: "Terlambat", value: terlambatCount, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100" },
          { label: "Izin", value: izinCount, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Sakit", value: sakitCount, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
          { label: "Alpha", value: alphaCount, color: "text-red-600", bg: "bg-red-50 border-red-100" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Work Hours Banner */}
      <div className="bg-gradient-to-r from-[#1e3263] to-[#2d4a8c] rounded-xl p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-orange-300" />
          <div>
            <p className="text-sm text-blue-200">Total Jam Kerja</p>
            <p className="font-bold">{totalWorkHours.toFixed(1)} jam</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-200">Total Hari Tercatat</p>
          <p className="font-bold">{records.length} hari</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tanggal..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/20 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="terlambat">Terlambat</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jam Masuk</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jam Pulang</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jam Kerja</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    Tidak ada data absensi ditemukan
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.hadir;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(r.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-mono ${r.checkIn ? "text-green-700 font-semibold" : "text-gray-300"}`}>
                          {r.checkIn || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-mono ${r.checkOut ? "text-orange-600 font-semibold" : "text-gray-300"}`}>
                          {r.checkOut || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-600">
                          {r.workHours ? `${r.workHours}j` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500">{r.notes || "—"}</span>
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
              Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} data
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    p === page ? "bg-[#1e3263] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
