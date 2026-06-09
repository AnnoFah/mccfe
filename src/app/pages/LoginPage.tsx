import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Building2, Lock, Mail, AlertCircle } from "lucide-react";

const BG_IMAGE = "https://images.unsplash.com/photo-1632012993419-e2341a8a656e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYWxhbmclMjBjcmVhdGl2ZSUyMGNlbnRlciUyMG1vZGVybiUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjIzOTg3OHww&ixlib=rb-4.1.0&q=80&w=1080";

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(email, password);
    setLoading(false);
    if (success) {
      const savedUser = JSON.parse(sessionStorage.getItem("mcc_user") || "{}");
      navigate(savedUser.role === "admin" ? "/admin" : "/");
    } else {
      setError("Email atau password salah. Silakan coba lagi.");
    }
  };

  const fillAdmin = () => { setEmail("admin@mcc.id"); setPassword("admin123"); setError(""); };
  const fillEmployee = () => { setEmail("budi@mcc.id"); setPassword("karyawan123"); setError(""); };

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={BG_IMAGE} alt="MCC" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3263]/90 to-[#1e3263]/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">MCC Absensi</p>
              <p className="text-blue-200 text-sm">Malang Creative Center</p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Sistem Absensi<br />Digital Karyawan
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Kelola kehadiran karyawan dengan mudah, akurat, dan real-time.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: "50+", label: "Karyawan" },
                { num: "100%", label: "Digital" },
                { num: "Real-time", label: "Monitoring" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <p className="font-bold text-xl text-orange-300">{s.num}</p>
                  <p className="text-xs text-blue-200 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-blue-300 text-sm">© 2026 MCC – Malang Creative Center</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-[#1e3263] rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800">MCC Absensi</p>
              <p className="text-gray-500 text-sm">Malang Creative Center</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang</h1>
            <p className="text-gray-500 text-sm mb-6">Masuk ke akun Anda untuk mulai absensi</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@mcc.id"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/30 focus:border-[#1e3263] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3263]/30 focus:border-[#1e3263] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3263] hover:bg-[#162550] text-white py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-xs text-gray-400 text-center mb-3">Akun Demo</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={fillAdmin}
                  className="bg-[#1e3263]/5 hover:bg-[#1e3263]/10 border border-[#1e3263]/20 text-[#1e3263] py-2.5 px-3 rounded-xl text-xs font-medium transition-all text-center"
                >
                  👑 Login Admin
                </button>
                <button
                  onClick={fillEmployee}
                  className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 py-2.5 px-3 rounded-xl text-xs font-medium transition-all text-center"
                >
                  👤 Login Karyawan
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 Malang Creative Center · Universitas Muhammadiyah Malang
          </p>
        </div>
      </div>
    </div>
  );
}
