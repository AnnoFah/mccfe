import { useAttendance } from "../context/AttendanceContext";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  hadir: { label: "Hadir", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  terlambat: { label: "Terlambat", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  izin: { label: "Izin", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  sakit: { label: "Sakit", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  alpha: { label: "Alpha", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

const PIE_COLORS = ["#22c55e", "#eab308", "#3b82f6", "#a855f7", "#ef4444"];

export function AdminDashboard() {
  const { records } = useAttendance();
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.date === today);

  const totalEmployees = 8;
  const hadirToday = todayRecords.filter((r) => r.status === "hadir" || r.status === "terlambat").length;
  const terlambatToday = todayRecords.filter((r) => r.status === "terlambat").length;
  const izinToday = todayRecords.filter((r) => r.status === "izin").length;
  const sakitToday = todayRecords.filter((r) => r.status === "sakit").length;
  const alphaToday = todayRecords.filter((r) => r.status === "alpha").length;
  const belumAbsen = totalEmployees - todayRecords.length;

  // Weekly bar chart data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = records.filter((r) => r.date === dateStr);
    return {
      day: d.toLocaleDateString("id-ID", { weekday: "short" }),
      Hadir: dayRecords.filter((r) => r.status === "hadir").length,
      Terlambat: dayRecords.filter((r) => r.status === "terlambat").length,
      Izin: dayRecords.filter((r) => r.status === "izin").length,
      Sakit: dayRecords.filter((r) => r.status === "sakit").length,
      Alpha: dayRecords.filter((r) => r.status === "alpha").length,
    };
  });

  // Pie chart data
  const pieData = [
    { name: "Hadir", value: hadirToday - terlambatToday },
    { name: "Terlambat", value: terlambatToday },
    { name: "Izin", value: izinToday },
    { name: "Sakit", value: sakitToday },
    { name: "Alpha", value: alphaToday + belumAbsen },
  ].filter((d) => d.value > 0);

  const attendanceRate = Math.round((hadirToday / totalEmployees) * 100);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard Admin</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor kehadiran karyawan hari ini –{" "}
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700">Real-time</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Karyawan",
            value: totalEmployees,
            icon: Users,
            textColor: "text-[#1e3263]",
            bgColor: "bg-blue-50",
            sub: "Terdaftar",
          },
          {
            label: "Hadir Hari Ini",
            value: hadirToday,
            icon: CheckCircle2,
            textColor: "text-green-600",
            bgColor: "bg-green-50",
            sub: `${attendanceRate}% kehadiran`,
          },
          {
            label: "Tidak Hadir",
            value: izinToday + sakitToday + alphaToday + belumAbsen,
            icon: XCircle,
            textColor: "text-red-600",
            bgColor: "bg-red-50",
            sub: "Izin/Sakit/Alpha",
          },
          {
            label: "Terlambat",
            value: terlambatToday,
            icon: Clock,
            textColor: "text-yellow-600",
            bgColor: "bg-yellow-50",
            sub: "Setelah 08:00",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">{s.label}</span>
              <div className={`${s.bgColor} p-2 rounded-lg`}>
                <s.icon className={`w-4 h-4 ${s.textColor}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Attendance Rate Banner */}
      <div className="bg-gradient-to-r from-[#1e3263] to-[#2d4a8c] rounded-2xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">Tingkat Kehadiran Hari Ini</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-orange-300">{attendanceRate}%</span>
              <div className="flex items-center gap-1 text-green-300 text-sm pb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Baik</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Hadir", value: hadirToday, color: "text-green-300" },
              { label: "Izin/Sakit", value: izinToday + sakitToday, color: "text-blue-200" },
              { label: "Belum Absen", value: belumAbsen, color: "text-yellow-300" },
            ].map((s) => (
              <div key={s.label} className="text-center bg-white/10 rounded-xl px-3 py-2">
                <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
                <p className="text-xs text-blue-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Rekap 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Bar dataKey="Hadir" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Terlambat" stackId="a" fill="#eab308" />
              <Bar dataKey="Izin" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Sakit" stackId="a" fill="#a855f7" />
              <Bar dataKey="Alpha" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Status Hari Ini</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>}
                />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Today's Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Absensi Hari Ini</h3>
          <span className="text-xs text-gray-500">{todayRecords.length} dari {totalEmployees} karyawan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Karyawan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Departemen</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jam Masuk</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jam Pulang</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {todayRecords.map((r) => {
                const cfg = STATUS_CONFIG[r.status];
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e3263] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {r.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{r.userName}</p>
                          <p className="text-xs text-gray-500">{r.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{r.department}</td>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {todayRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Belum ada data absensi hari ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
