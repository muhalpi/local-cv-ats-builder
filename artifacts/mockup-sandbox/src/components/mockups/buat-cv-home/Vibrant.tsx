import React from "react";
import { FileText, CheckCircle2, Zap, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./_group.css";

export function Vibrant() {
  return (
    <div className="vibrant-theme min-h-screen bg-slate-50 flex flex-col selection:bg-teal-200 selection:text-teal-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">BuatCV</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">CV Saya</a>
            <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Buat Baru</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button className="px-3 py-1 rounded-full bg-white text-slate-800 text-sm font-bold shadow-sm">ID</button>
              <button className="px-3 py-1 rounded-full text-slate-500 text-sm font-medium hover:text-slate-800">EN</button>
            </div>
            <Button className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 font-semibold shadow-lg shadow-indigo-200">
              Masuk
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden hero-gradient pb-20 pt-24 lg:pt-32 lg:pb-28">
          {/* Decorative shapes */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400/30 blur-3xl rounded-full mix-blend-overlay blob-shape"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/30 blur-3xl rounded-full mix-blend-overlay blob-shape" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-white/5 blur-3xl rounded-full"></div>

          <div className="relative max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span className="text-sm font-semibold tracking-wide text-teal-50">Telah rilis versi 2.0</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              Buat CV Profesional <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-200">
                yang Ramah ATS
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-indigo-50 max-w-2xl mx-auto mb-10 leading-relaxed opacity-90 font-medium">
              Tingkatkan peluang panggilan interview Anda. Buat CV dalam hitungan menit di ruang kerja yang tenang dan fokus, dirancang khusus untuk mewujudkan karier impian Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold shadow-xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95">
                Mulai Buat Sekarang
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-sm transition-all">
                Lihat CV Saya
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-6 text-indigo-200/60 text-sm font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Tanpa Kartu Kredit</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 100% Gratis</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Fitur Unggulan</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Semua yang Anda butuhkan untuk membuat CV yang menonjol dan lolos seleksi otomatis (ATS).</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="group p-8 rounded-3xl bg-teal-50 border-2 border-teal-100 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">ATS-Friendly</h3>
                <p className="text-slate-600 font-medium">Format bersih yang dioptimalkan untuk terbaca oleh sistem pelacakan pelamar (ATS) di perusahaan modern.</p>
              </div>

              {/* Card 2 */}
              <div className="group p-8 rounded-3xl bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Cepat & Mudah</h3>
                <p className="text-slate-600 font-medium">Antarmuka intuitif. Isi data Anda, pilih template, dan CV Anda siap dalam hitungan menit.</p>
              </div>

              {/* Card 3 */}
              <div className="group p-8 rounded-3xl bg-pink-50 border-2 border-pink-100 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                  <Download className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">PDF Siap Download</h3>
                <p className="text-slate-600 font-medium">Satu klik untuk mengunduh CV Anda dalam format PDF beresolusi tinggi yang siap dikirim.</p>
              </div>

              {/* Card 4 */}
              <div className="group p-8 rounded-3xl bg-amber-50 border-2 border-amber-100 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Gratis Sepenuhnya</h3>
                <p className="text-slate-600 font-medium">Tanpa biaya tersembunyi. Semua fitur pembuatan dan pengunduhan tersedia gratis untuk Anda.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-xl text-white tracking-tight">BuatCV</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} BuatCV. Dibuat dengan <span className="text-pink-500">♥</span> untuk talenta Indonesia.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
