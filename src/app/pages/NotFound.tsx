import { Link } from "react-router";
import { Home, AlertCircle } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 mb-6">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      <Link
        to="/"
        className="flex items-center gap-2 bg-[#1e3263] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#162550] transition-all"
      >
        <Home className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
