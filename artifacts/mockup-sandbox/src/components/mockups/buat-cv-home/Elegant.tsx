import React from 'react';
import { FileText, CheckCircle2, Zap, Download, ChevronRight } from 'lucide-react';
import './elegant.css';

export function Elegant() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-neutral-900 bg-neutral-50 selection:bg-neutral-200 selection:text-neutral-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 elegant-glass-panel border-b border-white/50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-editorial text-2xl font-semibold tracking-tight">BuatCV</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">CV Saya</a>
            <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Buat Baru</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 rounded-full bg-neutral-100/50 border border-neutral-200/50">
              <button className="px-4 py-1.5 rounded-full bg-white shadow-sm text-xs font-semibold text-neutral-900">ID</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">EN</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative elegant-bg-mesh overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent opacity-50" />
        <div className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-400 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200/60 bg-white/40 backdrop-blur-md shadow-sm mb-10">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-neutral-600 tracking-wide uppercase">Generasi Baru CV Builder</span>
          </div>
          
          <h1 className="font-editorial text-5xl md:text-7xl font-medium tracking-tight text-neutral-900 leading-[1.1] mb-8 max-w-4xl mx-auto">
            Buat CV Profesional yang <span className="text-neutral-500 italic">Ramah ATS</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
            Ruang kerja yang tenang dan profesional untuk merangkai perjalanan karir Anda. Desain elegan, format terstruktur, membantu Anda meraih pekerjaan impian.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="h-14 px-8 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-all flex items-center gap-2 group shadow-xl shadow-neutral-900/10">
              Mulai Buat Sekarang
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="h-14 px-8 rounded-full bg-white/60 backdrop-blur-md border border-neutral-200 text-neutral-900 font-medium hover:bg-white transition-all shadow-sm">
              Lihat CV Saya
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 pb-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="elegant-glass-panel elegant-glass-panel-hover rounded-3xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100">
                <CheckCircle2 className="w-6 h-6 text-neutral-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-editorial text-xl font-medium text-neutral-900">ATS-Friendly</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Format yang teroptimasi untuk sistem pelacakan pelamar, memaksimalkan peluang Anda.</p>
            </div>

            <div className="elegant-glass-panel elegant-glass-panel-hover rounded-3xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100">
                <Zap className="w-6 h-6 text-neutral-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-editorial text-xl font-medium text-neutral-900">Cepat & Mudah</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Antarmuka yang intuitif memungkinkan Anda membuat CV profesional dalam hitungan menit.</p>
            </div>

            <div className="elegant-glass-panel elegant-glass-panel-hover rounded-3xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100">
                <Download className="w-6 h-6 text-neutral-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-editorial text-xl font-medium text-neutral-900">PDF Siap Download</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Ekspor CV Anda ke format PDF dengan kualitas tinggi, siap untuk dilampirkan.</p>
            </div>

            <div className="elegant-glass-panel elegant-glass-panel-hover rounded-3xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100">
                <FileText className="w-6 h-6 text-neutral-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-editorial text-xl font-medium text-neutral-900">Gratis Sepenuhnya</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Nikmati semua fitur premium tanpa biaya tersembunyi. Fokus pada karir Anda.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/50 bg-white/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <FileText className="w-5 h-5 text-neutral-400" />
            <span className="font-editorial text-xl font-medium text-neutral-400">BuatCV</span>
          </div>
          <p className="text-sm text-neutral-400 font-medium">
            &copy; {new Date().getFullYear()} BuatCV. Dibuat dengan presisi untuk masa depan Anda.
          </p>
        </div>
      </footer>
    </div>
  );
}