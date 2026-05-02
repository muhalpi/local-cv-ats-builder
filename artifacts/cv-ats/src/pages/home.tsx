import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Zap, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();
  const h = t.home;

  return (
    <div className="min-h-[100dvh] flex flex-col text-slate-900 overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/12 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/12 blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative flex-1 z-10">
        {/* Hero */}
        <section className="pt-24 pb-32 px-6 lg:pt-36 lg:pb-40">
          <div className="container mx-auto max-w-6xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-700 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse-glow-ring" />
              {language === "id" ? "ATS-Optimized untuk 2026" : "ATS-Optimized for 2026"}
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700">
              {h.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              {h.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
              <Link href="/cv/new">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold h-14 px-8 rounded-xl glow-sky-btn transition-all duration-300"
                >
                  {h.startCreating}
                </Button>
              </Link>
              <Link href="/cv">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 h-14 px-8 rounded-xl bg-white/60 backdrop-blur-sm transition-all duration-300"
                >
                  {h.viewMyCVs}
                </Button>
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {/* Card 1 */}
              <div className="card-glass rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-5 border border-sky-500/15">
                  <CheckCircle2 className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="text-base font-bold mb-2 text-slate-900">{h.features.ats.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{h.features.ats.desc}</p>
              </div>

              {/* Card 2 */}
              <div className="card-glass rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1 lg:translate-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-5 border border-indigo-500/15">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold mb-2 text-slate-900">{h.features.fast.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{h.features.fast.desc}</p>
              </div>

              {/* Card 3 */}
              <div className="card-glass rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5 border border-purple-500/15">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-base font-bold mb-2 text-slate-900">{h.features.pdf.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{h.features.pdf.desc}</p>
              </div>

              {/* Card 4 */}
              <div className="card-glass rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1 lg:translate-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 border border-emerald-500/15">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold mb-2 text-slate-900">{h.features.free.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{h.features.free.desc}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 bg-white/60 backdrop-blur-sm z-10">
        <div className="container mx-auto px-6 max-w-6xl py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="h-5 w-5" />
            <span className="font-bold">BuatCV</span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} BuatCV. {h.footer}
          </p>
          <p className="text-sm text-slate-400">{h.attributionLabel} M Alpi.</p>
        </div>
      </footer>
    </div>
  );
}
