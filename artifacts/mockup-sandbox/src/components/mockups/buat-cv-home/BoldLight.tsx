import React from "react";
import { FileText, CheckCircle2, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./_group.css";

export function BoldLight() {
  return (
    <div className="min-h-screen bg-[#F0F4FF] text-slate-900 font-jakarta overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern-light opacity-60" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/15 blur-[120px]" />
      </div>

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
              <FileText className="h-6 w-6 text-sky-600" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">BuatCV</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">CV Saya</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Buat Baru</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-600 text-white">ID</button>
              <button className="px-3 py-1 text-xs font-semibold rounded-full text-slate-500 hover:text-slate-800 transition-colors">EN</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-24 pb-32 px-6 lg:pt-36 lg:pb-40 container mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-700 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse-glow" />
          ATS-Optimized untuk 2024
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700">
          Buat CV Profesional <br className="hidden md:block" />
          yang Ramah ATS
        </h1>

        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          Ruang kerja yang tenang dan profesional untuk merancang masa depan Anda.
          Buat CV yang tidak hanya terlihat elegan, tapi juga dirancang untuk menembus sistem seleksi perusahaan impian Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold h-14 px-8 rounded-xl glow-accent-light transition-all duration-300"
          >
            Mulai Buat Sekarang
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-14 px-8 rounded-xl bg-white/60 backdrop-blur-sm transition-all duration-300"
          >
            Lihat CV Saya
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
          {/* Card 1 */}
          <div className="glow-border-light bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 border border-sky-500/20">
              <CheckCircle2 className="h-6 w-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900">ATS-Friendly</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Format terstruktur yang dijamin terbaca oleh sistem Applicant Tracking System.</p>
          </div>

          {/* Card 2 */}
          <div className="glow-border-light bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1 lg:translate-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900">Cepat & Mudah</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Isi data, pilih template, dan CV Anda siap dalam hitungan menit.</p>
          </div>

          {/* Card 3 */}
          <div className="glow-border-light bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900">PDF Siap Download</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Ekspor hasil akhir ke format PDF dengan resolusi tinggi secara instan.</p>
          </div>

          {/* Card 4 */}
          <div className="glow-border-light bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1 lg:translate-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900">Gratis Sepenuhnya</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Tidak ada fitur tersembunyi atau watermark. 100% gratis digunakan.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 bg-white/60 backdrop-blur-sm z-10">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="h-5 w-5" />
            <span className="font-bold">BuatCV</span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} BuatCV. Dibuat dengan presisi untuk karir Anda.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-700 transition-colors">Privasi</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
