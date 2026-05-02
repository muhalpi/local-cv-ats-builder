import React from "react";
import { FileText, CheckCircle2, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./_group.css";

export function BoldDark() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white font-jakarta overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
              <FileText className="h-6 w-6 text-sky-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">BuatCV</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#" className="hover:text-white transition-colors">CV Saya</a>
            <a href="#" className="hover:text-white transition-colors">Buat Baru</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-white/5 rounded-full p-1 border border-white/10">
              <button className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white">ID</button>
              <button className="px-3 py-1 text-xs font-semibold rounded-full text-slate-400 hover:text-white transition-colors">EN</button>
            </div>
            <Button variant="ghost" className="md:hidden text-slate-300">
              Menu
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-24 pb-32 px-6 lg:pt-36 lg:pb-40 container mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse-glow" />
          ATS-Optimized untuk 2024
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-400">
          Buat CV Profesional <br className="hidden md:block" />
          yang Ramah ATS
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Ruang kerja yang tenang dan profesional untuk merancang masa depan Anda. 
          Buat CV yang tidak hanya terlihat elegan, tapi juga dirancang untuk menembus sistem seleksi perusahaan impian Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button size="lg" className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold h-14 px-8 rounded-xl glow-accent transition-all duration-300">
            Mulai Buat Sekarang
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 hover:text-white h-14 px-8 rounded-xl bg-white/5 backdrop-blur-sm transition-all duration-300">
            Lihat CV Saya
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
          {/* Card 1 */}
          <div className="glow-border bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-6 border border-sky-500/30">
              <CheckCircle2 className="h-6 w-6 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">ATS-Friendly</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Format terstruktur yang dijamin terbaca oleh sistem Applicant Tracking System.</p>
          </div>

          {/* Card 2 */}
          <div className="glow-border bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 lg:translate-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Cepat & Mudah</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Isi data, pilih template, dan CV Anda siap dalam hitungan menit.</p>
          </div>

          {/* Card 3 */}
          <div className="glow-border bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
              <Download className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">PDF Siap Download</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Ekspor hasil akhir ke format PDF dengan resolusi tinggi secara instan.</p>
          </div>

          {/* Card 4 */}
          <div className="glow-border bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 lg:translate-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Gratis Sepenuhnya</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Tidak ada fitur tersembunyi atau watermark. 100% gratis digunakan.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-[#0A0F1E] z-10">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <FileText className="h-5 w-5" />
            <span className="font-bold">BuatCV</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} BuatCV. Dibuat dengan presisi untuk karir Anda.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}