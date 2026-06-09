import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAttendance } from "../context/AttendanceContext";
import {
  Clock,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  hadir: { label: "Hadir", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  terlambat: { label: "Terlambat", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  izin: { label: "Izin", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  sakit: { label: "Sakit", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  alpha: { label: "Alpha", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { checkIn, checkOut, getTodayRecord, getUserRecords, addLeave } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<"izin" | "sakit">("izin");
  const [leaveNotes, setLeaveNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayRecord = getTodayRecord(user!.id);
  const recentRecords = getUserRecords(user!.id);
  const allRecords = getUserRecords(user!.id);

  const hadirCount = allRecords.filter((r) => r.status === "hadir" || r.status === "terlambat").length;
  const izinCount = allRecords.filter((r) => r.status === "izin").length;
  const sakitCount = allRecords.filter((r) => r.status === "sakit").length;
  const alphaCount = allRecords.filter((r) => r.status === "alpha").length;

  const handleCheckIn = () => {
    checkIn(user!.id, user!.name, user!.department, user!.position);
    setSuccessMsg("✅ Check-in berhasil dicatat!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleCheckOut = () => {
    checkOut(user!.id);
    setSuccessMsg("✅ Check-out berhasil dicatat!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleLeaveSubmit = () => {
    addLeave(user!.id, user!.name, user!.department, user!.position, leaveType, leaveNotes);
    setShowLeaveModal(false);
    setLeaveNotes("");
    setSuccessMsg(`✅ Pengajuan ${leaveType} berhasil dikirim!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const canCheckIn = !todayRecord?.checkIn && !["izin", "sakit", "alpha"].includes(todayRecord?.status || "");
  const canCheckOut = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const canLeave = !todayRecord?.checkIn && !["izin", "sakit"].includes(todayRecord?.status || "");

  const formatTime = (t: Date) =>
    t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top-2">
          {successMsg}
        </div>
      )}

      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-[#1e3263] to-[#2d4a8c] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm">{getGreeting()},</p>
            <h2 className="text-2xl font-bold">{user?.name} 👋</h2>
            <p className="text-blue-200 text-sm mt-1">{user?.position} · {user?.department}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-3xl font-mono font-bold text-orange-300">
              {formatTime(currentTime)}
            </p>
            <p className="text-blue-200 text-sm mt-1">{formatDate(currentTime)}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Hadir", value: hadirCount, icon: CheckCircle2, textColor: "text-green-600", bgColor: "bg-green-50" },
          { label: "Izin", value: izinCount, icon: FileText, textColor: "text-blue-600", bgColor: "bg-blue-50" },
          { label: "Sakit", value: sakitCount, icon: AlertTriangle, textColor: "text-purple-600", bgColor: "bg-purple-50" },
          { label: "Alpha", value: alphaCount, icon: XCircle, textColor: "text-red-600", bgColor: "bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{stat.label}</span>
              <div className={`${stat.bgColor} p-1.5 rounded-lg`}>
                <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            <p className="text-xs text-gray-400">hari</p>
          </div>
        ))}
      </div>

      {/* Today Attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1e3263]" />
          Absensi Hari Ini
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className={`rounded-xl p-4 border-2 ${todayRecord?.checkIn ? "border-green-200 bg-green-50" : "border-dashed border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Jam Masuk</span>
              <LogIn className={`w-4 h-4 ${todayRecord?.checkIn ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <p className={`text-3xl font-mono font-bold ${todayRecord?.checkIn ? "text-green-600" : "text-gray-300"}`}>
              {todayRecord?.checkIn || "--:--"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Jam kerja mulai 08:00</p>
          </div>

          <div className={`rounded-xl p-4 border-2 ${todayRecord?.checkOut ? "border-orange-200 bg-orange-50" : "border-dashed border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Jam Pulang</span>
              <LogOut className={`w-4 h-4 ${todayRecord?.checkOut ? "text-orange-600" : "text-gray-400"}`} />
            </div>
            <p className={`text-3xl font-mono font-bold ${todayRecord?.checkOut ? "text-orange-600" : "text-gray-300"}`}>
              {todayRecord?.checkOut || "--:--"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Jam pulang 17:00</p>
          </div>
        </div>

        {/* Current status */}
        {todayRecord?.status && (
          <div className="flex flex-wrap items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[todayRecord.status].color}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[todayRecord.status].dot} mr-1.5`} />
              {STATUS_CONFIG[todayRecord.status].label}
            </span>
            {todayRecord.workHours && (
              <span className="text-xs text-gray-500">Total jam kerja: <strong>{todayRecord.workHours} jam</strong></span>
            )}
            {todayRecord.notes && (
              <span className="text-xs text-gray-500">Keterangan: {todayRecord.notes}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleCheckIn}
            disabled={!canCheckIn}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
              canCheckIn
                ? "bg-[#1e3263] hover:bg-[#162550] text-white shadow-sm cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <LogIn className="w-4 h-4" />
            {todayRecord?.checkIn ? "Sudah Check-In" : "Check-In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!canCheckOut}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
              canCheckOut
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <LogOut className="w-4 h-4" />
            {todayRecord?.checkOut ? "Sudah Check-Out" : "Check-Out"}
          </button>

          <button
            onClick={() => setShowLeaveModal(true)}
            disabled={!canLeave}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
              canLeave
                ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FileText className="w-4 h-4" />
            Izin / Sakit
          </button>
        </div>
      </div>

      {/* Recent Attendance History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1e3263]" />
          Riwayat Terbaru
        </h3>
        <div className="divide-y divide-gray-50">
          {recentRecords
            .filter((r) => r.date !== new Date().toISOString().split("T")[0])
            .slice(0, 5)
            .map((r) => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.hadir;
              return (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(r.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.checkIn ? `Masuk: ${r.checkIn}` : "Tidak hadir"}
                        {r.checkOut ? ` · Pulang: ${r.checkOut}` : ""}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {r.workHours && (
                      <span className="text-xs text-gray-400 hidden sm:block">{r.workHours}j</span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Ajukan Izin / Sakit</h3>
            <p className="text-sm text-gray-500 mb-5">Pengajuan untuk hari ini</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Ketidakhadiran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLeaveType("izin")}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      leaveType === "izin"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    📋 Izin
                  </button>
                  <button
                    onClick={() => setLeaveType("sakit")}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      leaveType === "sakit"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    🤒 Sakit
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  value={leaveNotes}
                  onChange={(e) => setLeaveNotes(e.target.value)}
                  placeholder="Tuliskan alasan izin/sakit..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/30 focus:border-[#1e3263] transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleLeaveSubmit}
                  disabled={!leaveNotes.trim()}
                  className="flex-1 py-3 bg-[#1e3263] text-white rounded-xl text-sm font-medium hover:bg-[#162550] disabled:opacity-50 transition-all"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
